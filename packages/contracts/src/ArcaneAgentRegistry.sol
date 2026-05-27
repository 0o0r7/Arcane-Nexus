// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcaneAgentRegistry
 * @dev ERC-8004 inspired AI Agent Identity Registry
 * Soulbound NFT — non-transferable agent identity on Arc Network
 * Each agent gets a unique on-chain identity with reputation tracking
 */
contract ArcaneAgentRegistry is ERC721, Ownable {

    struct AgentProfile {
        uint256 tokenId;
        string name;
        string agentType;        // "yield_optimizer" | "risk_manager" | "arbitrage"
        string metadataURI;      // IPFS URI for extended metadata
        int256 reputationScore;  // starts at 0, increases with successful jobs
        uint256 totalJobs;       // total jobs completed
        uint256 totalEarned;     // total USDC earned (6 decimals)
        uint256 registeredAt;
        bool isActive;
    }

    uint256 public tokenCounter;
    address public authorizedVault; // ArcaneVault contract address

    mapping(address => uint256) public addressToTokenId;
    mapping(uint256 => AgentProfile) public profiles;

    event AgentRegistered(address indexed agent, uint256 tokenId, string name);
    event ReputationUpdated(address indexed agent, int256 newScore);
    event AgentDeactivated(address indexed agent);

    error AlreadyRegistered();
    error NotRegistered();
    error Unauthorized();
    error Soulbound();

    constructor() ERC721("ArcaneNexus Agent Identity", "ANAI") Ownable(msg.sender) {}

    // ============ SOULBOUND: Disable transfers ============

    function transferFrom(address, address, uint256) public pure override {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert Soulbound();
    }

    // ============ AUTHORIZATION ============

    function setAuthorizedVault(address _vault) external onlyOwner {
        authorizedVault = _vault;
    }

    modifier onlyAuthorized() {
        if (msg.sender != authorizedVault && msg.sender != owner()) {
            revert Unauthorized();
        }
        _;
    }

    // ============ AGENT REGISTRATION ============

    /**
     * @dev Register a new AI agent identity (ERC-8004)
     * @param _name Human-readable agent name
     * @param _agentType Type of agent ("yield_optimizer", "risk_manager", "arbitrage")
     * @param _metadataURI IPFS URI for extended agent metadata
     */
    function registerAgent(
        string calldata _name,
        string calldata _agentType,
        string calldata _metadataURI
    ) external returns (uint256) {
        if (addressToTokenId[msg.sender] != 0) revert AlreadyRegistered();

        tokenCounter++;
        uint256 tokenId = tokenCounter;

        _safeMint(msg.sender, tokenId);

        profiles[tokenId] = AgentProfile({
            tokenId: tokenId,
            name: _name,
            agentType: _agentType,
            metadataURI: _metadataURI,
            reputationScore: 0,
            totalJobs: 0,
            totalEarned: 0,
            registeredAt: block.timestamp,
            isActive: true
        });

        addressToTokenId[msg.sender] = tokenId;

        emit AgentRegistered(msg.sender, tokenId, _name);
        return tokenId;
    }

    // ============ REPUTATION MANAGEMENT ============

    /**
     * @dev Update agent reputation (only callable by ArcaneVault)
     * @param _agent Agent wallet address
     * @param _adjustment Positive for success, negative for failure
     */
    function updateReputation(address _agent, int256 _adjustment) external onlyAuthorized {
        uint256 tokenId = addressToTokenId[_agent];
        if (tokenId == 0) return;
        profiles[tokenId].reputationScore += _adjustment;
        emit ReputationUpdated(_agent, profiles[tokenId].reputationScore);
    }

    function incrementJobStats(address _agent, uint256 _earned) external onlyAuthorized {
        uint256 tokenId = addressToTokenId[_agent];
        if (tokenId == 0) return;
        profiles[tokenId].totalJobs++;
        profiles[tokenId].totalEarned += _earned;
    }

    // ============ VIEW FUNCTIONS ============

    function isRegistered(address _agent) external view returns (bool) {
        return addressToTokenId[_agent] != 0;
    }

    function getAgentProfile(address _agent) external view returns (AgentProfile memory) {
        uint256 tokenId = addressToTokenId[_agent];
        return profiles[tokenId];
    }

    function getAgentByTokenId(uint256 _tokenId) external view returns (AgentProfile memory) {
        return profiles[_tokenId];
    }
}
