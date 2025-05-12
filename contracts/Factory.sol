// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public fee;
    address public immutable owner;

    uint256 public totalTokens;
    address[] public tokens;
    mapping(address => TokenSale) public tokenForSale;
    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event ContractCreated(address indexed creator, address contractAddress);

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name, string memory _symbol) public payable {
        require(msg.value >= fee, "Insufficient fee");

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        tokens.push(address(token));

        totalTokens++;

        TokenSale memory _sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        tokenForSale[address(token)] = _sale;

        emit ContractCreated(msg.sender, address(token));
    }
}
