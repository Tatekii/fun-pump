// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

interface IFactory {
    // Structs
    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        uint256 startTime;
        uint256 endTime;
        SaleStage stage;  // Removed isOpen, simplified stages
    }

    // Enums
    enum SaleStage {
        OPENING,  // Public sale is active - Open
        ENDED    // Sale has ended - Closed
    }

    // Events
    event ContractCreated(address indexed creator, address contractAddress);
    event Buy(address indexed buyer, address indexed token, uint256 amount);
    event SaleClosed(address indexed token);
    event FundsDeposited(address indexed token, uint256 amount);
    event TokensDeposited(address indexed token, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event StageUpdated(address indexed token, SaleStage stage);

    // Admin Functions
    function setPaused(bool _paused) external;
    function setFee(uint256 _newFee) external;
    function updatePlatformFee(uint256 _newFee) external;
    function withdraw(uint256 _amount) external;

    // View Functions
    function getTokenForSale(uint256 _index) external view returns (TokenSale memory);
    function getCost(uint256 _sold) external pure returns (uint256);
    function calculateFees(uint256 _amount) external view returns (uint256);
    function checkFundingStatus(address _token) external view returns (bool);

    // Main Functions
    function create(string memory _name, string memory _symbol) external payable;
    function buy(address _token, uint256 _amount) external payable;
    function deposit(address _token) external;
    function claimRefund(address _token) external;
    function setStage(address _token, SaleStage _stage) external;
    function setTestSaleData(address _token, uint256 _sold, uint256 _raised) external;
    function setTestUserPurchases(address _token, address _user, uint256 _amount) external;

    // State Variables (getters)
    function fee() external view returns (uint256);
    function platformFee() external view returns (uint256);
    function owner() external view returns (address);
    function paused() external view returns (bool);
    function totalTokens() external view returns (uint256);
    function tokens(uint256) external view returns (address);
    // function vestingSchedules(address, address) external view returns (VestingSchedule memory);
    function contributions(address, address) external view returns (uint256);
    function userPurchases(address, address) external view returns (uint256);
}