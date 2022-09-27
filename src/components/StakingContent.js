import React, { Component } from 'react';
import gma from '../gma.png';

class Staking extends Component {

  render() {
    return (
      <div className="tokens-container">
        <h2>&nbsp;&nbsp;&nbsp;&nbsp;Staking Management&nbsp;&nbsp;&nbsp;&nbsp;</h2>
        <div className='tokens-balance'>
          <h3>Current Staking</h3>
          <h4>{this.props.stakingBalance}</h4>
        </div>
        <div className='tokens-balance'>
          <h3>Current Rewards</h3>
          <h4>{this.props.stakingRewardsJS}</h4>
        </div>
        <div className='staking-container card mb-4'>
          <div className='card-body'>
            <form className='mb-3' onSubmit={(event) => {
              event.preventDefault()
              const amount = window.web3.utils.toWei(this.input.value.toString(), 'Ether');
              const amountToApprove = window.web3.utils.toWei('1000000', 'Ether');
              this.props.stakeTokens(amount, amountToApprove);
            }}>
              <label className='float-left'>
                <h5>Stake Tokens ({this.props.APR}% APR)</h5>
              </label>
              <span className='staking-balances float-right text muted'>
                <h5>Balances</h5><hr />
                Tokens: {this.props.GMATokensBalance}<br />
                Rewards: {this.props.RWDTokensBalance}
              </span>
              <div className='staking-input'>
                <div className='input-group mb-4'>
                  <input
                    type="text"
                    ref={(input) => { this.input = input }}
                    className="from-control from-control-lg"
                    placeholder='0'
                    required
                  />
                  <div className='input-group-append'>
                    <div className='input-group-text'>
                      <img src={gma} height='32' alt="" />
                      &nbsp;&nbsp;&nbsp;MAX
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className='bbtn btn-block btn-primary btn-sm'>STAKE!</button>
            </form>
            <button
              type="submit"
              className='bbtn btn-block btn-warning btn-sm'
              onClick={(event) => {
                event.preventDefault()
                this.props.unstakeTokens()
              }}> UNSTAKE!
            </button>
            <button
              type="submit"
              className='bbtn btn-block btn-success btn-sm'
              onClick={(event) => {
                event.preventDefault()
                this.props.claimRewards()
              }}> CLAIM REWARDS!
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Staking;