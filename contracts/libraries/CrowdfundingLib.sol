// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

library CrowdfundingLib {
    // Constants
    uint256 private constant DECIMALS = 10 ** 18;
    uint256 public constant SOFT_CAP = 1 ether;
    uint256 public constant FUNDING_TARGET = 3 ether;
    uint256 public constant FUNDING_LIMIT = 500_000 * DECIMALS;
    uint256 public constant FEE_DENOMINATOR = 10000;

    // 邦定曲线类型
    enum CurveType {
        LINEAR,     // 线性曲线
        QUADRATIC,  // 二次曲线
        EXPONENTIAL // 指数曲线
    }

    function calculateTokenPrice(
        uint256 _sold,
        uint256 _amount
    ) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost * (_amount / DECIMALS);
    }
    
    // 计算不同类型邦定曲线的价格
    function calculateBondingPrice(
        uint256 _supply,
        uint256 _amount,
        uint8 _curveType, // Change enum to uint8 for ABI compatibility
        uint256 _slope
    ) internal pure returns (uint256) {
        // Convert uint8 back to enum type if needed
        CurveType curveType = CurveType(_curveType);
        
        if (curveType == CurveType.LINEAR) {
            // y = mx (线性)
            return (_supply * _slope * _amount) / 1e18;
        } else if (curveType == CurveType.QUADRATIC) {
            // y = mx² (二次方)
            uint256 newSupply = _supply + _amount;
            uint256 newPrice = (newSupply * newSupply * _slope) / 1e18;
            uint256 oldPrice = (_supply * _supply * _slope) / 1e18;
            return newPrice - oldPrice;
        } else if (curveType == CurveType.EXPONENTIAL) {
            // y = m * 1.1^x (指数)
            uint256 newPrice = 0;
            for (uint256 i = 0; i < _amount; i++) {
                // 使用1.1的近似值(110/100)
                newPrice += (_slope * ((110 ** (_supply + i)) / (100 ** (_supply + i))));
            }
            return newPrice;
        }
        
        // 默认使用当前的线性价格计算
        return calculateTokenPrice(_supply, _amount);
    }

    function validateSaleParams(
        uint256 _amount,
        uint256 totalPurchased
    ) public pure returns (bool) {
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
    ) public pure returns (uint256) {
        return (_amount * _feeRate) / FEE_DENOMINATOR;
    }

    function isFundingSuccessful(uint256 _raised) public pure returns (bool) {
        return _raised >= SOFT_CAP;
    }
}