import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../AppProvider";

import HeaderBar from './HeaderBar';
import Home from './Home';
import LoanDetails from './loan/LoanDetails';
import SearchLoan from './loan/SearchLoan';
import InitiateLending from './loan/InitiateLending';
import ManageLoan from './loan/ManageLoan';
import RepayLoan from './loan/RepayLoan';
import BankAccount from './fund/BankAccount';
import Dashboard from './fund/Dashboard';
import HsbcAuth from './fund/HsbcAuth';
import FundTransfer from './fund/FundTransfer';
import NotFound from './error/NotFound';
import WalletError from './error/WalletError';
import ConnectionError from './error/ConnectionError';
import {
  BrowserRouter, Routes, Route
} from "react-router-dom";

import '../style/App.css';

import CollateralizedLoanGateway from "../contracts/CollateralizedLoanGateway.json";
import TruffleContract from "truffle-contract";

import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

const config = require('../config/Config.js');
const provider = config.webProvider;

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(null);
  const [userAddressStatus, setUserAddressStatus] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [settledDown, setSettledDown] = useState(null);
  const {userAddress, changeUserAddress, changeUsername, collateralizedLoanGateway, changeCollateralizedLoanGateway} = useContext(AppContext);

  const initiateContract = () => {
      var web3 = new Web3();
      var collateralizedLoanGatewayObj = TruffleContract(CollateralizedLoanGateway);
      collateralizedLoanGatewayObj.setProvider(new web3.providers.HttpProvider(provider));
      
      collateralizedLoanGatewayObj.deployed().then((instance) => {
          setContractStatus("ready");
          changeCollateralizedLoanGateway(instance);
          if(userAddressStatus === "ready") {
            setSettledDown(true);
          }
      }).catch((err) => {
        setSettledDown(false);
        console.log(err);
      });
  }

  const checkWallet = async () => {

    // Metamask installed
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      
      var accounts = await web3.eth.getAccounts();
      if(accounts.length !== 0) {
        changeUserAddress(accounts[0]);
        console.log(accounts[0]);
        setIsWalletConnected(true);
        setUserAddressStatus("ready");
      } else {
        setIsWalletConnected(false);
      }
      
      return new Promise(resolve => {
        resolve(accounts[0]);
      });
    }
  }

  const getUsername = () => {
    if(userAddress === "0x115d602cbbD68104899a81d29d6B5b9B5d3347b7")
      changeUsername("Lender");
    else if(userAddress === "0x24578f34B2640e6DF6D0ad0c5dFcE1dF31062Df1")
      changeUsername("Borrower");
    else
      changeUsername("");
  }

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    initiateContract();
  }, [userAddressStatus]);

  useEffect(() => {
    if(settledDown) {
      getUsername();
    }
  }, [contractStatus, settledDown]);

  return (
    <div className="App">
      <BrowserRouter>
        <HeaderBar isWalletConnected={isWalletConnected} />
        {isWalletConnected && settledDown && collateralizedLoanGateway
        ?
        <Routes>
          {settledDown ? <Route path='*' element={<NotFound />} /> : null}
          <Route index element={<Home />} />
          
          <Route path="searchLoan" element={<SearchLoan />} />
          <Route path="loanDetails/:loanId" element={<LoanDetails />} />
          <Route path="initiateLending" element={<InitiateLending />} />
          <Route path="manageLoan" element={<ManageLoan />} />
          <Route path="repayLoan/:loanId" element={<RepayLoan />} />
          
          <Route path="profile" element={<Dashboard />} />
          <Route path="bankAccount" element={<BankAccount />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hsbc/auth" element={<HsbcAuth />} />
          <Route path="fundTransfer" element={<FundTransfer />} />
        </Routes>
        : isWalletConnected === false && settledDown && collateralizedLoanGateway
          ?
          <Routes>
            {settledDown ? <Route path='*' element={<NotFound />} /> : null}
            <Route index element={<Home />} />
          </Routes>
          : isWalletConnected === false
            ? <WalletError />
            : settledDown === false
              ? <ConnectionError />
              : null
        }
      </BrowserRouter>
    </div>
  );
}

export default App;
