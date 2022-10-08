// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract GMAToken {

    // Declaraciones 
    string public name = "GMA Token";
    string public symbol = "GMA";
    uint256 public totalSupply = 1000000000000000000000000; // 1 millon de tokens
    uint8 public decimals = 18;

    // Evento para la transferencia de tokens de un usuario
    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    // Evento para la aprobacion de un operador
    event Approval (
        address indexed _owner, 
        address indexed _spender, 
        uint256 _value
    );

    // Estructuras de datos 
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    // Constructor 
    constructor(){
        balanceOf[address(this)] = totalSupply;
    }

    // Precio de los tokens ERC20
    function tokenPrice(uint256 _numtokens) internal pure returns (uint256) {
        return (_numtokens / 10**18) * (0.001 ether);
    }

    // Transferencia de tokens de un usuario
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Aprobacion de una cantidad para ser gastada por un operador
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function isApproved(address _owner, address _spender) public view returns(uint) {
        return allowance[_owner][_spender];
    }

    function buyTokens(uint _amount) public payable returns (bool success) {
        require(balanceOf[address(this)] >= _amount, "There are not enough tokens to sell.");
        uint tokensCost = tokenPrice(_amount);
        require(msg.value >= tokensCost,"The amount sent is not enough to buy the requested tokens.");
        uint256 returnValue = msg.value - tokensCost;
        payable(msg.sender).transfer(returnValue);
        balanceOf[address(this)] -= _amount;
        balanceOf[msg.sender] += _amount;
        emit Transfer(address(this), msg.sender, _amount);
        return true;
    }

    function returnTokens(uint _amount) public payable returns (bool success) {
        require(balanceOf[address(msg.sender)] >= _amount, "You do not have enough tokens to return.");
        balanceOf[msg.sender] -= _amount;
        balanceOf[address(this)] += _amount;
        uint tokensCost = tokenPrice(_amount);
        payable(msg.sender).transfer(tokensCost);
        emit Transfer(address(this), msg.sender, _amount);
        return true;
    }

    // Transferencia de tokens especificando el emisor
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(balanceOf[_from] >= _amount, "The requested amount is greater than balance.");
        require(allowance[_from][msg.sender] >= _amount, "You are not allowed to transfer these tokens.");
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }
}