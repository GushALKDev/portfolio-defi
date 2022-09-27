const GMAToken = artifacts.require("GMAToken")
const RewardToken = artifacts.require("RewardToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network, accounts) {

    // Despliegue del GMAToken
    await deployer.deploy(GMAToken)
    const gmaToken = await GMAToken.deployed()

    // Despliegue del RewardToken
    await deployer.deploy(RewardToken)
    const rewardToken = await RewardToken.deployed()

    // Despliegue del TokenFarm
    await deployer.deploy(TokenFarm, rewardToken.address, gmaToken.address)
    const tokenFarm = await TokenFarm.deployed()

    // Transferir RewardTokens (Tokens de recompensa) a TokenFarm (1kk de tokens)
    await rewardToken.transfer(tokenFarm.address, '1000000000000000000000000')

    // Transferir tokens a un inversor para que pueda hacer staking.
    // await gmaToken.transfer(accounts[1], '100000000000000000000') // 100**18
}