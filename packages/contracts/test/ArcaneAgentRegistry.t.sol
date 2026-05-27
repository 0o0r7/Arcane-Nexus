// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ArcaneAgentRegistry.sol";

contract ArcaneAgentRegistryTest is Test {
    ArcaneAgentRegistry registry;
    address agent1 = address(0x1111);
    address agent2 = address(0x2222);
    address vault = address(0x3333);

    function setUp() public {
        registry = new ArcaneAgentRegistry();
        registry.setAuthorizedVault(vault);
    }

    function testRegisterAgent() public {
        vm.prank(agent1);
        uint256 tokenId = registry.registerAgent("YieldBot Alpha", "yield_optimizer", "ipfs://test");
        assertEq(tokenId, 1);
        assertTrue(registry.isRegistered(agent1));
    }

    function testCannotRegisterTwice() public {
        vm.prank(agent1);
        registry.registerAgent("YieldBot Alpha", "yield_optimizer", "ipfs://test");
        vm.prank(agent1);
        vm.expectRevert();
        registry.registerAgent("YieldBot Beta", "yield_optimizer", "ipfs://test2");
    }

    function testSoulbound() public {
        vm.prank(agent1);
        uint256 tokenId = registry.registerAgent("YieldBot", "yield_optimizer", "ipfs://test");
        vm.prank(agent1);
        vm.expectRevert();
        registry.transferFrom(agent1, agent2, tokenId);
    }

    function testUpdateReputation() public {
        vm.prank(agent1);
        registry.registerAgent("YieldBot", "yield_optimizer", "ipfs://test");
        vm.prank(vault);
        registry.updateReputation(agent1, 10);
        ArcaneAgentRegistry.AgentProfile memory profile = registry.getAgentProfile(agent1);
        assertEq(profile.reputationScore, 10);
    }

    function testOnlyAuthorizedCanUpdateReputation() public {
        vm.prank(agent1);
        registry.registerAgent("YieldBot", "yield_optimizer", "ipfs://test");
        vm.prank(agent2); // not authorized
        vm.expectRevert();
        registry.updateReputation(agent1, 10);
    }
}
