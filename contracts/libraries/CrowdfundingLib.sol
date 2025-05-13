// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

library CrowdfundingLib {
    // Constants
    uint256 private constant DECIMALS = 10 ** 18;
    uint256 public constant SOFT_CAP = 1 ether;
    uint256 public constant FUNDING_TARGET = 3 ether;
    uint256 public constant FUNDING_LIMIT = 500_000 * DECIMALS;
    uint256 public constant FEE_DENOMINATOR = 10000;

    function calculateTokenPrice(
        uint256 _sold,
        uint256 _amount
    ) internal pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost * (_amount / DECIMALS);
    }

    function validateSaleParams(
        uint256 _amount,
        uint256 totalPurchased
    ) internal pure returns (bool) {
        if (_amount < 1 ether || _amount > 10000 ether) {
            return false;
        }
        if (totalPurchased > FUNDING_LIMIT) {
            return false;
        }
        return true;
    }

    function calculatePlatformFee(
        uint256 _amount,
        uint256 _feeRate
    ) internal pure returns (uint256) {
        return (_amount * _feeRate) / FEE_DENOMINATOR;
    }

    function isFundingSuccessful(uint256 _raised) internal pure returns (bool) {
        return _raised >= SOFT_CAP;
    }
}