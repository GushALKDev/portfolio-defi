import { Component } from 'react';
import Navigation from './Navbar';
import GMAToken from '../abis/GMAToken.json';
import RewardToken from '../abis/RewardToken.json';
import TokenFarm from '../abis/TokenFarm.json';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { Spinner } from 'react-bootstrap';

class Token extends Component {

  async componentDidMount() {
    document.title = "Tokens Management - GMA DeFi"
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
      this.setState({ gmaToken: gmaToken })
      let gmaTokenBalance = await gmaToken.methods.balanceOf(this.state.account).call()
      this.setState({ gmaTokenBalance: gmaTokenBalance.toString() })
    }
    else {
      window.alert('El GMAToken no se ha desplegado en la red!!!')
    }

    // Carga del RewardToken
    const rewardTokenData = RewardToken.networks[networkId]
    if (rewardTokenData) {
      const rewardToken = new web3.eth.Contract(RewardToken.abi, rewardTokenData.address)
      this.setState({ rewardToken: rewardToken })
      let rewardTokenBalance = await rewardToken.methods.balanceOf(this.state.account).call()
      this.setState({ rewardTokenBalance: rewardTokenBalance.toString() })
    }
    else {
      window.alert('El RewardToken no se ha desplegado en la red!!!')
    }

    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm: tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    }
    else {
      window.alert('El TokenFarm no se ha desplegado en la red!!!')
    }

    this.setState({ loading: false })
    this.updateData();
  }

  async updateData() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(1000);
    this._getVariables();
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: false,
      gmaToken: {},
      gmaTokenBalance: 'Loading...',
      rewardToken: {},
      RWDTokensBalance: 'Loading...',
      tokenFarm: {},
      stakingBalance: 'Loading...',
      GMATokensBalance: 'Loading...'
    }
  }

  _getVariables = async () => {
    try {
      const _GMATokensBalance = await this.state.gmaToken.methods.balanceOf(this.state.account).call();
      this.setState({GMATokensBalance: window.web3.utils.fromWei(_GMATokensBalance, 'ether') + ' GMA'});
      const _RWDTokensBalance = await this.state.rewardToken.methods.balanceOf(this.state.account).call();
      this.setState({RWDTokensBalance: window.web3.utils.fromWei(_RWDTokensBalance, 'ether').slice(0, -10) + ' RWD'});
    } catch (err) {
      this.setState({ errorMessage: err })
    } finally {
      this.setState({ loading: false })
    }
  }

  _buyTokens = async (_amount) => {
    try {
      this.setState({ loading: true })
      const tokensPrice = _amount * 0.01
      const ethers = window.web3.utils.toWei(tokensPrice.toString(), 'ether')
      const tokens = window.web3.utils.toWei(_amount.toString(), 'ether')
      // console.log('tokens', tokens);
      await this.state.gmaToken.methods.buyTokens(tokens).send({
        from: this.state.account,
        value: ethers
      })
      Swal.fire({
        icon: 'success',
        title: 'Tokens bought successfully!!',
        width: 800,
        padding: '3em',
        text: `You bought ${_amount} Tokens by ${(ethers / 10 ** 18).toFixed(2)} ETH`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      })
      this.updateData();
    } catch (err) {
      this.setState({ errorMessage: err })
    } finally {
      this.setState({ loading: false })
    }
  }

  _returnTokens = async (_amount) => {
    try {
      // console.log('Devolución de tokens en ejecución...')
      this.setState({ loading: true })
      const tokensPrice = _amount * 0.01
      const ethers = window.web3.utils.toWei(tokensPrice.toString(), 'ether')
      const tokens = window.web3.utils.toWei(_amount.toString(), 'ether')
      await this.state.gmaToken.methods.returnTokens(tokens).send({
        from: this.state.account
      })
      Swal.fire({
        icon: 'warning',
        title: 'Tokens returned successfully!!',
        width: 800,
        padding: '3em',
        text: `You returned ${_amount} Tokens by ${(ethers / 10 ** 18).toFixed(2)} ETH`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      })
      this.updateData();
    } catch (err) {
      this.setState({ errorMessage: err })
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    if (this.state.loading) return (
      <div>
        <Navigation account={this.state.account} /><br />
        <div  className='loading'>
          <Spinner animation='border' style={{ display: 'flex', margin: 12 }} />
          <p className='mx3 my-0'>Loading blockchain data, wait a moment please...</p>
        </div>
      </div>
    );
    
    return (
      <div className="Token">
        <Navigation account={this.state.account} />
          <div className="tokens-container">
          <h2>ERC-20 Tokens Management</h2>
            <div className='tokens-balance'>
              <h3>GMA Balance</h3>
              <h4>{this.state.GMATokensBalance}</h4>
            </div>
            <div className='tokens-balance'>
              <h3>RWD Balance</h3>
              <h4>{this.state.RWDTokensBalance}</h4>
            </div>
            <div className='tokens-buy'>
                <h3>Buy GMA Tokens</h3>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const _amountBuy = this._amountBuy.value
                  this._buyTokens(_amountBuy)
                }}>
                  <input type='number'
                    className='form-control mb-1'
                    placeholder='Tokens amount'
                    ref={(input) => this._amountBuy = input} />
                  <input type='submit'
                    className='bbtn btn-block btn-primary btn-sm'
                    value='Buy Tokens' />
                </form>
            </div>
            <div className='tokens-return'>
              <h3>Return GMA Tokens</h3>
              <form onSubmit={(event) => {
                event.preventDefault()
                const _amountReturn = this._amountReturn.value
                this._returnTokens(_amountReturn)
              }}>
                <input type='number'
                  className='form-control mb-1'
                  placeholder='Tokens amount'
                  ref={(input) => this._amountReturn = input} />
                <input type='submit'
                  className='bbtn btn-block btn-warning btn-sm'
                  value='Return Tokens' />
              </form>
            </div>
          </div>
      </div>
    );
  }

}

export default Token;