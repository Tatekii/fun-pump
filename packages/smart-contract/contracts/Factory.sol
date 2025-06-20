// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {CrowdfundingLib} from "./libraries/CrowdfundingLib.sol";

contract Factory is IFactory {
    // State variables
    uint256 public fee;
    uint256 public platformFee = 50; // 0.5%
    address public immutable owner;
    bool public paused;
    bool private _locked;

    uint256 public totalTokens;
    address[] public tokens;
    mapping(address => TokenSale) public tokenForSale;
    mapping(address => mapping(address => uint256)) public contributions;
    mapping(address => mapping(address => uint256)) public userPurchases;
    // mapping(address => mapping(address => VestingSchedule)) public vestingSchedules;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyTokenCreator(address _token) {
        TokenSale memory curForSale = tokenForSale[_token];
        require(msg.sender == curForSale.creator, "Not creator");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract not paused");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    modifier onlyTestNetwork() {
        require(
            block.chainid == 31337 || block.chainid == 1337,
            "Test functions only allowed on test networks"
        );
        _;
    }

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    // Admin functions
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function setFee(uint256 _newFee) external onlyOwner {
        require(_newFee > 0, "Fee cannot be zero");
        emit FeeUpdated(fee, _newFee);
        fee = _newFee;
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high");
        platformFee = _newFee;
    }

    // View functions
    function calculateFees(
        uint256 _amount
    ) public view override returns (uint256) {
        return CrowdfundingLib.calculatePlatformFee(_amount, platformFee);
    }

    function getTokenForSale(
        uint256 _index
    ) public view override returns (TokenSale memory) {
        return tokenForSale[tokens[_index]];
    }

    function getCost(
        uint256 _sold
    ) public pure override returns (uint256 cost) {
        return CrowdfundingLib.calculateTokenPrice(_sold, 1 ether) / 1 ether;
    }

    function getPredictedPrice(
        address _token,
        uint256 _amount
    ) public view override returns (uint256) {
        TokenSale memory sale = tokenForSale[_token];
        return CrowdfundingLib.calculateBondingPrice(
            sale.sold,
            _amount,
            sale.curveType,
            sale.curveSlope
        );
    }

    // Main functions
    function create(
        string memory _name,
        string memory _symbol,
        uint256 _startTime,
        uint256 _endTime,
        string memory _signedUrl,
        uint8 _curveType,
        uint256 _curveSlope
    ) public payable override whenNotPaused {
        require(
            bytes(_name).length > 0 && bytes(_name).length <= 32,
            "Invalid name length"
        );
        require(
            bytes(_symbol).length > 0 && bytes(_symbol).length <= 8,
            "Invalid symbol length"
        );
        require(msg.value >= fee, "Insufficient fee");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_curveSlope > 0, "Curve slope must be positive");

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);
        tokens.push(address(token));
        totalTokens++;

        TokenSale memory _sale = TokenSale({
            token: address(token),
            name: _name,
            creator: msg.sender,
            sold: 0,
            raised: 0,
            startTime: _startTime,
            endTime: _endTime,
            stage: SaleStage.OPENING,
            signedUrl: _signedUrl,
            curveType: _curveType,
            curveSlope: _curveSlope
        });

        tokenForSale[address(token)] = _sale;
        emit ContractCreated(msg.sender, address(token));
    }

    function buy(
        address _token,
        uint256 _amount
    ) external payable override nonReentrant whenNotPaused {
        TokenSale storage curForSale = tokenForSale[_token];
        require(curForSale.stage == SaleStage.OPENING, "Sale not active");
        require(block.timestamp >= curForSale.startTime, "Sale not started");
        require(block.timestamp <= curForSale.endTime, "Sale ended");

        require(
            CrowdfundingLib.validateSaleParams(
                _amount,
                userPurchases[_token][msg.sender]
            ),
            "Invalid purchase params"
        );

        // 使用邦定曲线计算价格
        uint256 price = CrowdfundingLib.calculateBondingPrice(
            curForSale.sold,
            _amount,
            curForSale.curveType,
            curForSale.curveSlope
        );
        
        require(msg.value >= price, "Insufficient payment");

        if (msg.value > price) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - price
            }("");
            require(success, "Refund failed");
        }

        userPurchases[_token][msg.sender] += _amount;
        curForSale.sold += _amount;
        curForSale.raised += price;
        contributions[_token][msg.sender] += price;

        if (
            curForSale.sold >= CrowdfundingLib.FUNDING_LIMIT ||
            curForSale.raised >= CrowdfundingLib.FUNDING_TARGET
        ) {
            curForSale.stage = SaleStage.ENDED;
            emit SaleClosed(_token);
        }

        Token(_token).transfer(msg.sender, _amount);
        emit Buy(msg.sender, _token, _amount);
    }

    function deposit(
        address _token
    ) external override onlyTokenCreator(_token) nonReentrant {
        TokenSale memory curForSale = tokenForSale[_token];

        require(curForSale.stage == SaleStage.ENDED, "Sale not ended");

        Token token = Token(_token);

        uint256 tokenAmount = token.balanceOf(address(this));
        token.transfer(curForSale.creator, tokenAmount);

        uint256 ethAmount = curForSale.raised;
        (bool success, ) = payable(curForSale.creator).call{value: ethAmount}(
            ""
        );
        require(success, "ETH transfer failed");

        emit FundsDeposited(_token, ethAmount);
        emit TokensDeposited(_token, tokenAmount);
    }

    function withdraw(uint256 _amount) external override onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "ETH withdraw failed");
    }

    function checkFundingStatus(
        address _token
    ) public view override returns (bool) {
        TokenSale storage sale = tokenForSale[_token];
        return CrowdfundingLib.isFundingSuccessful(sale.raised);
    }

    function claimRefund(address _token) external override nonReentrant {
        TokenSale storage sale = tokenForSale[_token];
        require(block.timestamp > sale.endTime, "Sale not ended");
        require(
            !CrowdfundingLib.isFundingSuccessful(sale.raised),
            "Funding successful"
        );

        uint256 amount = contributions[_token][msg.sender];
        require(amount > 0, "No contribution");

        contributions[_token][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
    }

    function setStage(
        address _token,
        SaleStage _stage
    ) external override onlyTokenCreator(_token) {
        tokenForSale[_token].stage = _stage;
    }

    // NOTE Test helper function
    function setTestSaleData(
        address _token,
        uint256 _sold,
        uint256 _raised
    ) external onlyTestNetwork {
        TokenSale storage sale = tokenForSale[_token];
        sale.sold = _sold;
        sale.raised = _raised;
    }

    // NOTE Test helper function
    function setTestUserPurchases(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyTestNetwork {
        userPurchases[_token][_user] = _amount;
    }
}
