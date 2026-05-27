// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IArcaneAgentRegistry {
    function isRegistered(address agent) external view returns (bool);
    function updateReputation(address agent, int256 adjustment) external;
    function incrementJobStats(address agent, uint256 earned) external;
}
