// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./GMAToken.sol";
import "./RewardToken.sol";

contract TokenFarm {

    // Declaraciones iniciales
    string public name = "Reward Token Farm";
    address public owner;
    GMAToken public gmaToken;
    RewardToken public rewardToken;
    uint public APR = 45;

    // Estructuras de datos 
    address [] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => uint) public stakingFrom;

    // Constructor 
    constructor(RewardToken _rewardToken, GMAToken _gmaToken) {
        rewardToken = _rewardToken;
        gmaToken = _gmaToken;
        owner = msg.sender;
    }

    function getStakingBalance(address _userAddress) public view returns(uint) {
        return stakingBalance[_userAddress];
    }

    function getStakingFrom(address _userAddress) public view returns(uint) {
        return stakingFrom[_userAddress];
    }

    // Stake de tokens 
    function stakeTokens(uint _amount) public {
        // Se require una cantidad superior a 0 
        require(_amount > 0, "La cantidad no puede ser menor a 0");
        // Transferir tokens GMA al Smart Contract principal
        gmaToken.transferFrom(msg.sender, address(this), _amount);
        // Actualizar el saldo del staking
        stakingBalance[msg.sender] += _amount;
        // Guardar el staker
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        // Actualizar el estado del staking
        stakingFrom[msg.sender] = block.timestamp;
        hasStaked[msg.sender] = true;
    }

    // Quitar el staking de los tokens 
    function unstakeTokens() public {
        // Saldo del staking de un usuario 
        uint balance = stakingBalance[msg.sender];
        // Se require una cantidad superior a 0
        require(balance > 0, "El balance del staking es 0");
        // Transferimos las recompensas al usuario
        uint _rewards = calculateRewards(msg.sender);
        rewardToken.transfer(msg.sender, _rewards);
        // Transferencia de los tokens al usuario
        gmaToken.transfer(msg.sender, balance);
        // Resetea el balance de recompensas del usuario 
        stakingBalance[msg.sender] = 0;
        // Reseteamos el estado del staking
        stakingFrom[msg.sender] = 0;
    }

    // Calculamos las recompensas
    function calculateRewards(address userAddress) public view returns(uint) {
        // Calculamos el tiempo que llevamos haciendo staking y la cantidad stackeada
        uint stakedTime = block.timestamp - stakingFrom[userAddress];
        uint stakedAmount = stakingBalance[userAddress];
        // Calculamos la recompensa
        // Si... yearInSeconds = (stakedAmount / 100) * APR
        // Entonces... stakedTime = X
        // (stakedTime * ((stakedAmount / 100) * APR)) / yearInSeconds
        uint reward = (stakedTime * ((stakedAmount / 100) * APR)) / 31536000;
        return reward;
    }

    // Claim Rewards
    function claimRewards() public {
        // Transferimos las recompensas al usuario
        uint _rewards = calculateRewards(msg.sender);
        rewardToken.transfer(msg.sender, _rewards);
        // Reseteamos el estado del staking
        stakingFrom[msg.sender] = block.timestamp;
    }

    // Emision de Tokens (recompensas)
    function issueTokens() public {
        // Unicamente ejecutable por el owner
        require(msg.sender == owner, "No eres el owner");
        // Emitir tokens a todos los stakers
        for (uint i=0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                rewardToken.transfer(recipient, balance);
            }
        }
    }
}