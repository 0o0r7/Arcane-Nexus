// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ArcaneVault.sol";
import "../src/ArcaneAgentRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Simple ERC20 mock for test purposes
contract MockUSDC is IERC20 {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply = 1000000 * 10**6;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) external return (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract ArcaneVaultTest is Test {
    ArcaneVault vault;
    ArcaneAgentRegistry registry;
    MockUSDC usdc;
    
    address user = address(0xabcd);
    address agent = address(0x1111);
    address treasury = address(0x9999);

    function setUp() public {
        usdc = new MockUSDC();
        registry = new ArcaneAgentRegistry();
        vault = new ArcaneVault(address(usdc), treasury, address(registry));
        registry.setAuthorizedVault(address(vault));
        
        // Register agent
        vm.prank(agent);
        registry.registerAgent("YieldBot Alpha", "yield_optimizer", "ipfs://test");
        
        // Give client some USDC
        usdc.transfer(user, 1000 * 10**6);
    }

    function testDeposit() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 500 * 10**6);
        vault.deposit(500 * 10**6, ArcaneVault.StrategyType.Balanced);
        vm.stopPrank();

        assertEq(vault.totalDeposited(), 500 * 10**6);
        ArcaneVault.UserPosition memory pos = vault.getUserPosition(user);
        assertEq(pos.deposited, 500 * 10**6);
    }
}
