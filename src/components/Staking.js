import React, { Component } from 'react';

import GMAToken from '../abis/GMAToken.json';
import RewardToken from '../abis/RewardToken.json';
import TokenFarm from '../abis/TokenFarm.json';

import Web3 from 'web3';

import Navigation from './Navbar';
import StakingContent from './StakingContent';
import { Spinner } from 'react-bootstrap';

class App extends Component {

  async componentDidMount() {
    document.title = "Staking Management - GMA DeFi"
    // 1. Carga de Web3
    await this.loadWeb3()
    // 2. Carga de datos de la Blockchain
    await this.loadBlockchainData()
  }

  // 1. Carga de Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      // console.log('Accounts: ', accounts)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('¡Deberías considerar usar Metamask!')
    }

    window.ethereum.on('chainChanged', (chainID) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async function (accounts) {
      window.location.reload();
    })
  }

  // 2. Carga de datos de la Blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
    const networkId = await web3.eth.net.getId() 
    // console.log('networkid:', networkId)

    // Carga del GMAToken
    const gmaTokenData = GMAToken.networks[networkId]
    if (gmaTokenData) {
      const gmaToken = new web3.eth.Contract(GMAToken.abi, gmaTokenData.address)
      this.setState({gmaToken: gmaToken})
      let gmaTokenBalance = await gmaToken.methods.balanceOf(this.state.account).call()
      this.setState({gmaTokenBalance: gmaTokenBalance.toString()})
    }
    else {
      window.alert('El GMAToken no se ha desplegado en la red!!!')
    }

    // Carga del RewardToken
    const rewardTokenData = RewardToken.networks[networkId]
    if (rewardTokenData) {
      const rewardToken = new web3.eth.Contract(RewardToken.abi, rewardTokenData.address)
      this.setState({rewardToken: rewardToken})
      // let rewardTokenBalance = await rewardToken.methods.balanceOf(this.state.account).call()
      // this.setState({rewardTokenBalance: rewardTokenBalance.toString()})
    }
    else {
      window.alert('El RewardToken no se ha desplegado en la red!!!')
    }

    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm: tokenFarm})
      // let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      // this.setState({stakingBalance: stakingBalance.toString()})
    }
    else {
      window.alert('El TokenFarm no se ha desplegado en la red!!!')
    }
    
    this.updateData();
  }

  async updateData() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(1000);
    this.getVariables();
  }

  getVariables = async () => {
    try {
      const _GMATokensBalance = await this.state.gmaToken.methods.balanceOf(this.state.account).call();
      this.setState({GMATokensBalance: window.web3.utils.fromWei(_GMATokensBalance, 'ether') + ' GMA'});
      const _RWDTokensBalance = await this.state.rewardToken.methods.balanceOf(this.state.account).call();
      (_RWDTokensBalance !== '0') ? (this.setState({RWDTokensBalance: window.web3.utils.fromWei(_RWDTokensBalance, 'ether').slice(0, -10) + ' RWD'})
      ) : (this.setState({RWDTokensBalance: '0 RWD'}))
      const _stakingBalance = await this.state.tokenFarm.methods.getStakingBalance(this.state.account).call();
      this.setState({stakingBalance: window.web3.utils.fromWei(_stakingBalance, 'ether') + ' GMA'});
      const _decimals = await this.state.rewardToken.methods.decimals().call();
      this.setState({decimals: _decimals});
      const _APR = await this.state.tokenFarm.methods.APR().call();
      this.setState({APR: _APR});
      const _stakingFrom = (await this.state.tokenFarm.methods.stakingFrom(this.state.account).call());
      this.setState({stakingFrom: _stakingFrom});
      const _stakingRewards = (await this.state.tokenFarm.methods.calculateRewards(this.state.account).call()) / Math.pow(10,_decimals);
      this.setState({stakingRewards: _stakingRewards.toFixed(8) + ' RWD'});
    } catch (err) {
      this.setState({ errorMessage: err })
    } finally {
      this.setState({ loading: false })
    }
  }

  calculateRewards (_stakingFrom, _stakingBalance, _APR, _decimals) {
    try {
      let _reward;
      if (_stakingBalance === 'Loading...') _reward = 'Loading...';
      else {
        const _stakedTime = (Date.now() / 1000) - _stakingFrom;
        _reward = (_stakedTime * ((_stakingBalance.slice(0, -4) / 100 ) * _APR)) / 31536000;
      }
      this.setState({stakingRewardsJS: _reward.toFixed(8) + ' RWD'});
    } catch (err) {
      this.setState({ errorMessage: err })
    }
  }

  stakeTokens = async (amount, amountToApprove) => {
    try {
      if (this.state.stakingBalance.slice(0, -4) > 0) {
        window.alert('Please, unstake your tokens before increase the stkaking amount.');
        return null;
      }
      else { 
        this.setState({loading: true});
        const approved = await this.state.gmaToken.methods.isApproved(this.state.account, this.state.tokenFarm._address).call();
        if (approved < amount) {
          await this.state.gmaToken.methods.approve(this.state.tokenFarm._address, amountToApprove).send({from: this.state.account})
          await this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account})
          window.location.reload();
        }
        else {
          await this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account})
          window.location.reload();
        }
      }
    } catch (err) {
      this.setState({ errorMessage: err })
      this.setState({loading: false});
    }
  }

  unstakeTokens = async () => {
    try {
      this.setState({loading: true})
      await this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account})
      window.location.reload();
    } catch (err) {
      this.setState({ errorMessage: err })
      this.setState({loading: false});
    }
  }

  claimRewards = async () => {
    try {
      this.setState({loading: true})
      await this.state.tokenFarm.methods.claimRewards().send({from: this.state.account})
      window.location.reload();
    } catch (err) {
      this.setState({ errorMessage: err })
      this.setState({loading: false});
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: false,
      gmaToken: {},
      GMATokensBalance:   'Loading...',
      rewardToken: {},
      RWDTokensBalance: 'Loading...',
      tokenFarm: {},
      stakingBalance: 'Loading...',
      stakingRewards: 'Loading...',
      stakingRewardsJS: 'Loading...',
      decimals: '0',
      APR: '0',
      stakingFrom:  '0'
    }
  }

  render() {

    setInterval(()=>{
      this.calculateRewards(this.state.stakingFrom, this.state.stakingBalance, this.state.APR, this.state.decimals);
    },1000);

    let content

    content = <StakingContent
      GMATokensBalance = {this.state.GMATokensBalance}
      RWDTokensBalance = {this.state.RWDTokensBalance}
      stakingRewards = {this.state.stakingRewards}
      stakingRewardsJS = {this.state.stakingRewardsJS}
      stakingBalance = {this.state.stakingBalance}
      APR = {this.state.APR}
      stakeTokens = {this.stakeTokens}
      unstakeTokens = {this.unstakeTokens}
      claimRewards = {this.claimRewards}
    />

    if (this.state.loading) {
      return (
        <div>
          <Navigation account={this.state.account} /><br />
          <div  className='loading'>
            <Spinner animation='border' style={{ display: 'flex', margin: 12 }} />
            <p className='mx3 my-0'>Loading blockchain data, wait a moment please...</p>
          </div>
        </div>
    )};

    return (
      <div>
        <Navigation account={this.state.account} />
        {content}
      </div>
    );
  }
}

export default App;
