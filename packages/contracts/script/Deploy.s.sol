// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ArcaneAgentRegistry.sol";
import "../src/ArcaneVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address usdcAddress = vm.envAddress("ARC_USDC_ADDRESS");

        console.log("Deploying ArcaneNexus contracts...");
        console.log("Deployer:", deployer);
        console.log("USDC:", usdcAddress);

        vm.startBroadcast(deployerKey);

        // 1. Deploy Agent Registry
        ArcaneAgentRegistry registry = new ArcaneAgentRegistry();
        console.log("ArcaneAgentRegistry deployed:", address(registry));

        // 2. Deploy Vault
        ArcaneVault vault = new ArcaneVault(
            usdcAddress,
            deployer, // treasury = deployer for testnet
            address(registry)
        );
        console.log("ArcaneVault deployed:", address(vault));

        // 3. Authorize vault in registry
        registry.setAuthorizedVault(address(vault));
        console.log("Vault authorized in registry");

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Copy these to your .env files:");
        console.log("AGENT_REGISTRY_ADDRESS=", address(registry));
        console.log("VAULT_ADDRESS=", address(vault));
        console.log("NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=", address(registry));
        console.log("NEXT_PUBLIC_VAULT_ADDRESS=", address(vault));
    }
}
