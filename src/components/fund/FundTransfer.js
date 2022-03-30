import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";
import { useCookies } from 'react-cookie';

import {
  Grid, Box, Stack, Button, TextField
} from '@mui/material';
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

import { transferFiatMoneyBackToBank, checkFiatBalanceAmount } from '../../utils/ContractCall.js';
import { displayFiatAmount } from '../../utils/Utils.js';

const config = require('../../config/Config.js');

function FundTransfer() {

  const [serviceAvailable, setServiceAvailable] = useState(null);
  const [userBankBalance, setUserBankBalance] = useState(null);
  const [userBankBalanceRetrieveStatus, setUserBankBalanceRetrieveStatus] = useState(false);
  const [userDEXBalance, setDEXBalance] = useState(null);
  const [userDEXBalanceRetrieveStatus, setDEXBalanceRetrieveStatus] = useState(false);
  const [bankAccountNo, setBankAccountNo] = useState(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { userAddress, collateralizedLoanGateway } = useContext(AppContext);
  const [cookies, setCookie] = useCookies(['isBankLogined', 'bankName']);
  
  const { handleSubmit: handleSubmit1, register: register1, formState: { errors: errors1 }, reset: reset1 } = useForm();
  const { handleSubmit: handleSubmit2, register: register2, formState: { errors: errors2 }, reset: reset2 } = useForm();
  const [isDisabled1, setIsDisabled1] = React.useState(false);
  const [isDisabled2, setIsDisabled2] = React.useState(false);

  const retrieveBalances = async() => {
    const requestSpec = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Request-Method': 'GET, POST, DELETE, PUT, OPTIONS',
        'Content-Type': 'application/json'
      },
    };

    fetch(`${config.getAccountInfoEndpoint}/${userAddress}`, requestSpec)
    .then(res => {
      console.log(res.status);
      return res.text();
    })
    .then(accountInfo => {
      let bankAccount = JSON.parse(accountInfo)[0];
      console.log(accountInfo);
      setBankAccountNo(bankAccount['accountNumber']);
      setUserBankBalance(bankAccount['accountBalance'][0]['currentBalance']);
      setUserBankBalanceRetrieveStatus("ready");
      setServiceAvailable(true);
      return JSON.parse(accountInfo)[0];
    })
    .catch((error) => {
      console.error('Error:', error);
      setServiceAvailable(false);
    });


    checkFiatBalanceAmount(collateralizedLoanGateway, userAddress, userAddress).then((fiatBalance) => {
      setDEXBalance(fiatBalance);
      setDEXBalanceRetrieveStatus(true);
    });
  }

  const onTransferFiatMoneyToDEXSubmit = (formData) => {
    onClickTransferFiatMoneyToDEX(formData['fiatMoneyToDEX']);
  }

  const onTransferFiatMoneyToBankSubmit = (formData) => {
    onClickTransferFiatMoneyToBank(formData['fiatMoneyToBank']);
  }

  const handleTransferFiatMoneyToDEX = async (fiatAmount) => {
    const reqBody = {
      'userAddress': userAddress,
      'txnAmount': fiatAmount,
      'bankAccountNo': bankAccountNo,
    };

    const requestSpec = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Request-Method': 'GET, POST, DELETE, PUT, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    };

    return fetch(config.transferFiatToDEXEndpoint, requestSpec)
    .then(res => {
      console.log(res.status);
      return res.text();
    })
    .then(msg => {
      console.log(msg);
      return msg;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  const onClickTransferFiatMoneyToDEX = (fiatAmount) => {
    if(window.confirm('Confirm to transfer USD to DEX?')) {
      setIsDisabled1(true);
      handleTransferFiatMoneyToDEX(fiatAmount).then((msg) => {
        console.log(msg);
        retrieveBalances();
        setIsDisabled1(false);
      }).catch((err) => {
        console.log(err);
        setIsDisabled1(false);
      });
      reset1();
    }
  }

  const handleTransferFiatMoneyToBank = async (fiatAmount) => {
    await transferFiatMoneyBackToBank(
      collateralizedLoanGateway, userAddress, userAddress, bankAccountNo, fiatAmount
    );
  }

  const onClickTransferFiatMoneyToBank = (fiatAmount) => {
    if(window.confirm('Confirm to transfer USD to bank?')) {
      setIsDisabled2(true);
      handleTransferFiatMoneyToBank(fiatAmount).then((msg) => {
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
    if(!cookies['isBankLogined'] || cookies['isBankLogined'] === "false") {
        setTimeout(() => setRedirect(true), 3000);
        setAuthenticated(true);
    } else {
      retrieveBalances();
    }
  }, []);

  if(authenticated) {
    return(
      <Box className="flex flex-col items-center">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <h4 className="text-md font-semibold">You have not login to the bank API account, now redirecting you to bank login page...</h4>
          {redirect ? <Navigate to="/bankAccount" /> : null}
        </main>
      </Box>
    );
  }

  return (
    <Box className="text-gray-900">
        {
        (serviceAvailable && userBankBalanceRetrieveStatus && userDEXBalanceRetrieveStatus)
        ?
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate__animated animate__fadeIn">

          <Stack direction="column" spacing={5}>
            <Box>
              <h1 className="text-xl font-semibold">Fund transfer</h1>
              <h4 className="text-md">Here is your bank account information.</h4>
            </Box>
            <Box>
              <h1 className="text-md font-semibold">Bank name</h1>
              <h4 className="text-md">{cookies['bankName']}</h4>
            </Box>
            <Box>
              <h1 className="text-md font-semibold">Balance of bank account no. {bankAccountNo} (in USD)</h1>
              <h4 className="text-md">{userBankBalanceRetrieveStatus ? displayFiatAmount(userBankBalance) : null}</h4>
            </Box>
            <Box>
              <h1 className="text-md font-semibold">Balance of DEX account (in USD)</h1>
              <h4 className="text-md">{userDEXBalanceRetrieveStatus ? displayFiatAmount(userDEXBalance) : null}</h4>
            </Box>
            <Box>
              <form id="storeFiatMoneyForm" onSubmit={handleSubmit1(onTransferFiatMoneyToDEXSubmit)}>
                <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>
                  <TextField {...register1("fiatMoneyToDEX", {
                    required: "Required",
                    pattern: {
                      value: /^\d+\.?\d*$/i,
                      message: "Invalid fiat amount"
                    }
                  })} variant="outlined"/>
                  <Button type="submit" variant="contained" disabled={isDisabled1}>Transfer USD from bank account to DEX</Button>
                </Stack>
                {errors1.fiatMoneyToDEX && <h4 className="py-2 font-medium text-red-500 text-left">{errors1.fiatMoneyToDEX.message}</h4>}
              </form>
            </Box>

            <Box>
              <form id="storeEtherForm" onSubmit={handleSubmit2(onTransferFiatMoneyToBankSubmit)}>
                <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>
                  <TextField {...register2("fiatMoneyToBank", {
                    required: "Required",
                    pattern: {
                      value: /^\d+\.?\d*$/i,
                      message: "Invalid fiat amount"
                    }
                  })} variant="outlined"/>
                  <Button type="submit" variant="contained" disabled={isDisabled2}>Transfer USD from DEX to bank account</Button>
                </Stack>
                {errors2.fiatMoneyToBank && <h4 className="py-2 font-medium text-red-500 text-left">{errors2.fiatMoneyToBank.message}</h4>}
              </form>
            </Box>
          </Stack>
        </main>
        : null
        }

        {
        serviceAvailable === false
        ?
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate__animated animate__fadeIn">
          <Grid container className="items-center">
              <h4 className="py-2 font-medium text-left" style={{color: "red"}}>Service temporarily unavailable</h4>
          </Grid>
        </main>
        : null
        }
    </Box>
  );
}

export default FundTransfer;
