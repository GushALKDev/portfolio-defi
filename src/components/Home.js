import { Component } from 'react';
import Navigation from './Navbar';
import buyTokens from '../img/buy-tokens.png';
import stakeTokens from '../img/stake-tokens.png';
import Web3 from 'web3';

class Home extends Component {
    
    async componentDidMount() {
        document.title = "Home - GMA DeFi"
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
        console.log('networkid:', networkId)

        this.setState({loading: false})
    }

    constructor(props) {
        super(props)
        this.state = {
          account: '0x0',
          loading: true
        }
      }
      
      render() {
        return (
            <div className='Home'>
                <Navigation account={this.state.account} />
                {/* <MyCarousel /> */}
                <div className="content">
                    <h1>GMA DeFi instructions<br /><br /></h1>
                    <h4>IMPORTANT!!! THE SMART CONTRACTS ARE DEPLOYED ON ROPSTEN NETWORK<br /><br /></h4>
                    <div className='home_content'>
                        <p>Welcome to GMA decentralizes Finances!!! To win rewards in RWD tokens, you have to buy GMA tokens first at <a href='tokens'>"Tokens"</a> tab. The price of each GMA token is 0.01 ETH</p>
                        <a href='token'><img src={buyTokens} className='home_images'/></a>
                        <p>After that, you are able to stake your GMA tokens and get rewards at <a href='staking'>"Staking"</a> tab.</p>
                        <a href='staking'><img src={stakeTokens} className='home_images'/></a>
                        <p>You will get a 45% APR. The staking has not any locking period.</p>
                    </div>
                </div>
            </div>
        );
    }

}

export default Home;