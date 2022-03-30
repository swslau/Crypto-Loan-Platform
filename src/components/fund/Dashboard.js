import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Box, Stack, Button, TextField
} from '@mui/material';
import { useForm } from "react-hook-form";

import { checkEtherBalanceAmount, checkFiatBalanceAmount, storeEther, withdrawEther } from '../../utils/ContractCall';
import { displayEtherAmount, displayFiatAmount } from '../../utils/Utils.js';

import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

function Dashboard() {

  const [userFiatBalance, setUserFiatBalance] = useState(null);
  const [userFiatBalanceRetrieveStatus, setUserFiatBalanceRetrieveStatus] = useState(false);
  const [userEtherBalance, setUserEtherBalance] = useState(null);
  const [userEtherBalanceRetrieveStatus, setUserEtherBalanceRetrieveStatus] = useState(false);
  const { username, userAddress, collateralizedLoanGateway } = useContext(AppContext);
  
  const { handleSubmit: handleSubmit1, register: register1, formState: { errors: errors3 }, reset: reset1 } = useForm();
  const { handleSubmit: handleSubmit2, register: register2, formState: { errors: errors4 }, reset: reset2 } = useForm();
  const [isDisabled1, setIsDisabled1] = React.useState(false);
  const [isDisabled2, setIsDisabled2] = React.useState(false);

  const retrieveBalances = async() => {
    checkFiatBalanceAmount(collateralizedLoanGateway, userAddress, userAddress).then((fiatBalance) => {
      setUserFiatBalance(fiatBalance);
      setUserFiatBalanceRetrieveStatus(true);
    });

    checkEtherBalanceAmount(collateralizedLoanGateway, userAddress, userAddress).then((etherBalance) => {
      setUserEtherBalance(etherBalance);
      setUserEtherBalanceRetrieveStatus(true);
    });
  }

  const onStoreEtherFormFormSubmit = (formData) => {
    onClickStoreEther(formData['ethToStore']);
  }

  const onWithdrawEtherFormSubmit = (formData) => {
    onClickWithdrawEther(formData['ethToWithdraw']);
  }

  const handleStoreEther = async (wei) => {
    await storeEther(
      collateralizedLoanGateway, userAddress, userAddress, wei
    );
  }

  const onClickStoreEther = async (ethValue) => {
    let wei = web3.utils.toWei(ethValue, "ether");
    let weiInHex = web3.utils.toHex(wei);

    window.ethereum
    .request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: userAddress,
          to: collateralizedLoanGateway.address,
          value: weiInHex,
          // gasPrice: '0x09184e72a000',
          // gas: '0x2710',
        },
      ],
    })
    .then((txHash) => {
      console.log(txHash);
      setIsDisabled1(true);

      handleStoreEther(wei).then((msg) => {
        console.log(msg);
        retrieveBalances();
        setIsDisabled1(false);
      }).catch((err) => {
        console.log(err);
        setIsDisabled1(false);
      });
      reset1();
    })
    .catch((error) => {
      console.error(error);
      setIsDisabled1(false);
    });
    
  }

  const handleWithdrawEther = async (wei) => {
    await withdrawEther(
      collateralizedLoanGateway, userAddress, userAddress, wei
    );
  }

  const onClickWithdrawEther = (ethValue) => {
    if(window.confirm('Confirm to withdraw Ether from DEX?')) {
      setIsDisabled2(true);

      let wei = web3.utils.toWei(ethValue, "ether");
      handleWithdrawEther(wei).then((msg) => {
        console.log(msg);
        retrieveBalances();
        setIsDisabled2(false);
      }).catch((err) => {
        console.log(err);
        setIsDisabled2(false);
      });
      reset2();
    }
  }

  useEffect(() => {
    retrieveBalances();
  }, []);

  return (
    <Box className="min-h-screen text-gray-900 animate__animated animate__fadeIn">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Stack direction="column" spacing={5}>
          <Box>
            <h1 className="text-xl font-semibold">Hello, {username}</h1>
            <h4 className="text-md">Here is your account information.</h4>
          </Box>
          <Box>
            <h1 className="text-md font-semibold">Fiat balance (in USD)</h1>
            <h4 className="text-md">{userFiatBalanceRetrieveStatus ? displayFiatAmount(userFiatBalance) : null}</h4>
          </Box>
          <Box>
            <h1 className="text-md font-semibold">Crypto balance</h1>
            <h4 className="text-md">{userEtherBalanceRetrieveStatus ? displayEtherAmount(userEtherBalance) : null}</h4>
          </Box>
          <Box>
            <form id="storeEtherForm" onSubmit={handleSubmit1(onStoreEtherFormFormSubmit)}>
              <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>

                <TextField {...register1("ethToStore", {
                  required: "Required",
                  pattern: {
                    value: /^\d+\.?\d*$/i,
                    message: "Invalid Ether amount"
                  }
                })} variant="outlined"/>
                <Button type="submit" variant="contained" disabled={isDisabled1}>Store Ether to DEX</Button>
              </Stack>
              {errors3.ethToStore && <h4 className="py-2 font-medium text-red-500 text-left">{errors3.ethToStore.message}</h4>}
            </form>
          </Box>
          <Box>
            <form id="withdrawEtherForm" onSubmit={handleSubmit2(onWithdrawEtherFormSubmit)}>
              <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>
                <TextField {...register2("ethToWithdraw", {
                  required: "Required",
                  pattern: {
                    value: /^\d+\.?\d*$/i,
                    message: "Invalid Ether amount"
                  }
                })} variant="outlined"/>
                <Button type="submit" variant="contained" disabled={isDisabled2}>Withdraw Ether from DEX</Button>
              </Stack>
              {errors4.ethToWithdraw && <h4 className="py-2 font-medium text-red-500 text-left">{errors4.ethToWithdraw.message}</h4>}
            </form>
          </Box>
        </Stack>
      </main>
    </Box>
  );
}

export default Dashboard;
