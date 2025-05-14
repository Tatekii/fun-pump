// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "../libraries/CrowdfundingLib.sol";

contract CrowdfundingLibTester {
    using CrowdfundingLib for *;

    function testCalculateTokenPrice(uint256 _sold, uint256 _amount) public pure returns (uint256) {
        return CrowdfundingLib.calculateTokenPrice(_sold, _amount);
    }

    function getFundingLimit() public pure returns (uint256) {
        return CrowdfundingLib.FUNDING_LIMIT;
    }

    function getFundingTarget() public pure returns (uint256) {
        return CrowdfundingLib.FUNDING_TARGET;
    }
}