// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IArcaneAgentRegistry.sol";

/**
 * @title ArcaneVault
 * @dev ERC-8183 inspired Agentic Commerce Vault
 * Manages USDC deposits, yield strategies, and AI agent job settlement
 * Built specifically for Arc Network (Chain ID: 5042002)
 */
contract ArcaneVault is Ownable, ReentrancyGuard {

    // ============ ENUMS ============

    enum StrategyType { Conservative, Balanced, Aggressive }
    enum JobState { Created, Assigned, Executing, Completed, Failed, Disputed }

    // ============ STRUCTS ============

    struct UserPosition {
        uint256 deposited;      // Total USDC deposited (6 decimals)
        uint256 shares;         // Vault shares owned
        StrategyType strategy;
        uint256 lastUpdate;
        bool isActive;
    }

    struct AgentJob {
        uint256 id;
        address agent;
        address user;
        StrategyType strategy;
        uint256 allocationUsdc;  // USDC allocated to this job
        uint256 expectedYield;   // Expected yield in USDC
        uint256 actualYield;     // Actual yield achieved
        JobState state;
        string executionHash;    // Hash of execution proof
        uint256 createdAt;
        uint256 completedAt;
        uint256 agentFee;        // Fee paid to agent (0.5% of yield)
    }

    // ============ STATE ============

    IERC20 public immutable usdc;
    IArcaneAgentRegistry public agentRegistry;
    address public treasury;

    uint256 public totalDeposited;
    uint256 public totalShares;
    uint256 public jobCounter;

    uint256 public constant PLATFORM_FEE_BPS = 100;  // 1%
    uint256 public constant AGENT_FEE_BPS = 50;       // 0.5%
    uint256 public constant BPS_DENOMINATOR = 10000;

    mapping(address => UserPosition) public positions;
    mapping(uint256 => AgentJob) public jobs;
    mapping(address => uint256[]) public userJobs;
    mapping(address => uint256[]) public agentJobs;

    // ============ EVENTS ============

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event StrategyChanged(address indexed user, StrategyType newStrategy);
    event JobCreated(uint256 indexed jobId, address indexed agent, address indexed user);
    event JobCompleted(uint256 indexed jobId, uint256 actualYield, uint256 agentFee);
    event JobFailed(uint256 indexed jobId, string reason);
    event YieldDistributed(uint256 totalYield, uint256 platformFee);

    // ============ ERRORS ============

    error ZeroAmount();
    error InsufficientBalance();
    error InvalidAgent();
    error InvalidJobState();
    error Unauthorized();

    constructor(
        address _usdc,
        address _treasury,
        address _agentRegistry
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        agentRegistry = IArcaneAgentRegistry(_agentRegistry);
    }

    // ============ USER FUNCTIONS ============

    /**
     * @dev Deposit USDC into the vault
     * @param _amount Amount in USDC (6 decimals)
     * @param _strategy Yield strategy preference
     */
    function deposit(uint256 _amount, StrategyType _strategy) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();

        require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // Calculate shares (1:1 for simplicity in v1)
        uint256 sharesToMint = _amount;

        UserPosition storage pos = positions[msg.sender];
        pos.deposited += _amount;
        pos.shares += sharesToMint;
        pos.strategy = _strategy;
        pos.lastUpdate = block.timestamp;
        pos.isActive = true;

        totalDeposited += _amount;
        totalShares += sharesToMint;

        emit Deposited(msg.sender, _amount, sharesToMint);
    }

    /**
     * @dev Withdraw USDC from the vault
     * @param _shares Number of shares to redeem
     */
    function withdraw(uint256 _shares) external nonReentrant {
        UserPosition storage pos = positions[msg.sender];
        if (_shares > pos.shares) revert InsufficientBalance();

        uint256 amount = _shares; // 1:1 for v1

        pos.shares -= _shares;
        pos.deposited = pos.shares;
        if (pos.shares == 0) pos.isActive = false;

        totalShares -= _shares;
        totalDeposited -= amount;

        require(usdc.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawn(msg.sender, amount, _shares);
    }

    /**
     * @dev Change yield strategy
     */
    function setStrategy(StrategyType _strategy) external {
        positions[msg.sender].strategy = _strategy;
        emit StrategyChanged(msg.sender, _strategy);
    }

    // ============ AGENT JOB FUNCTIONS (ERC-8183) ============

    /**
     * @dev Create a new agent job (owner/backend calls this)
     */
    function createJob(
        address _agent,
        address _user,
        StrategyType _strategy,
        uint256 _allocation,
        uint256 _expectedYield
    ) external onlyOwner returns (uint256) {
        if (!agentRegistry.isRegistered(_agent)) revert InvalidAgent();

        jobCounter++;
        uint256 jobId = jobCounter;

        uint256 agentFee = (_expectedYield * AGENT_FEE_BPS) / BPS_DENOMINATOR;

        jobs[jobId] = AgentJob({
            id: jobId,
            agent: _agent,
            user: _user,
            strategy: _strategy,
            allocationUsdc: _allocation,
            expectedYield: _expectedYield,
            actualYield: 0,
            state: JobState.Created,
            executionHash: "",
            createdAt: block.timestamp,
            completedAt: 0,
            agentFee: agentFee
        });

        userJobs[_user].push(jobId);
        agentJobs[_agent].push(jobId);

        emit JobCreated(jobId, _agent, _user);
        return jobId;
    }

    /**
     * @dev Complete a job and distribute yield
     * @param _jobId Job identifier
     * @param _actualYield Actual yield achieved in USDC
     * @param _executionHash Proof of execution hash
     */
    function completeJob(
        uint256 _jobId,
        uint256 _actualYield,
        string calldata _executionHash
    ) external onlyOwner nonReentrant {
        AgentJob storage job = jobs[_jobId];
        if (job.state != JobState.Created && job.state != JobState.Executing) {
            revert InvalidJobState();
        }

        job.actualYield = _actualYield;
        job.executionHash = _executionHash;
        job.state = JobState.Completed;
        job.completedAt = block.timestamp;

        if (_actualYield > 0) {
            uint256 platformFee = (_actualYield * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            uint256 agentFee = (_actualYield * AGENT_FEE_BPS) / BPS_DENOMINATOR;
            uint256 userYield = _actualYield - platformFee - agentFee;

            // Update user position
            positions[job.user].deposited += userYield;
            positions[job.user].shares += userYield;

            // Pay agent fee
            if (agentFee > 0 && usdc.balanceOf(address(this)) >= agentFee) {
                usdc.transfer(job.agent, agentFee);
            }

            // Pay platform fee
            if (platformFee > 0 && usdc.balanceOf(address(this)) >= platformFee) {
                usdc.transfer(treasury, platformFee);
            }

            // Update agent stats
            agentRegistry.updateReputation(job.agent, 10);
            agentRegistry.incrementJobStats(job.agent, agentFee);

            emit JobCompleted(_jobId, _actualYield, agentFee);
            emit YieldDistributed(_actualYield, platformFee);
        }
    }

    /**
     * @dev Mark job as failed
     */
    function failJob(uint256 _jobId, string calldata _reason) external onlyOwner {
        AgentJob storage job = jobs[_jobId];
        job.state = JobState.Failed;
        agentRegistry.updateReputation(job.agent, -5);
        emit JobFailed(_jobId, _reason);
    }

    // ============ VIEW FUNCTIONS ============

    function getUserPosition(address _user) external view returns (UserPosition memory) {
        return positions[_user];
    }

    function getJob(uint256 _jobId) external view returns (AgentJob memory) {
        return jobs[_jobId];
    }

    function getUserJobs(address _user) external view returns (uint256[] memory) {
        return userJobs[_user];
    }

    function getAgentJobs(address _agent) external view returns (uint256[] memory) {
        return agentJobs[_agent];
    }

    function getTVL() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
