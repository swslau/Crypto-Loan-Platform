import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Box, Stack, Button, Grid
} from '@mui/material';
import { useForm } from "react-hook-form";
import { Navigate, useParams, useNavigate } from "react-router-dom";

import { initiateLoan } from '../../utils/ContractCall';
import {
  displayAddress, displayEtherAmount, displayFiatAmount, displayLTV, displayLoanTerm, displayRepaymentSchedule,
  calculateTotalRepaymentAmount, calculateTotalInterestAmount, 
} from '../../utils/Utils.js';

import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

function ConfirmInitiateLending({ formData }) {
  return (
    <Box className="text-center text-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="">
          <h1 className="text-xl font-semibold">Confirmation of the lending offer</h1>
        </Box>
        <Box className="mt-4">
          <ConfirmInitiateLendingTable formData={formData} />
        </Box>
      </main>
    </Box>
  );
}

function ConfirmInitiateLendingTable({ formData }) {
  const navigate = useNavigate();
  const [redirect, setRedirect] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [displayData, setDisplayData] = React.useState({});
  const {userAddress, collateralizedLoanGateway} = useContext(AppContext);

  const { handleSubmit, register, formState: { errors }, reset } = useForm();

  useEffect(() => {
    console.log(formData);
    if(formData != {}){
      const data = {
        'Lender': displayAddress(userAddress),
        'Collateral Amount': displayEtherAmount(formData['collateralAmount'], "ether") + " @USD" + formData['intervalEthPrice'],
        'Loan Amount': displayFiatAmount(formData['loanAmount']),
        'APR': formData['apr'] + "%",
        'Loan Term': displayLoanTerm(formData['loanTerm']),
        'Repayment Frequency': displayRepaymentSchedule(formData['repaymentSchedule']),
        'Repayment per instalment': displayFiatAmount(formData['monthlyRepayment']),
        'Total interest amount': displayFiatAmount(calculateTotalInterestAmount(formData['monthlyRepayment'], formData['loanTerm'], formData['repaymentSchedule'], formData['loanAmount'])),
        'Total repayment amount': displayFiatAmount(calculateTotalRepaymentAmount(formData['monthlyRepayment'], formData['loanTerm'], formData['repaymentSchedule'])),
        'Initial LTV': displayLTV(formData['initialLTV']),
        'Margin LTV': displayLTV(formData['marginLTV']),
        'Liquidation LTV': displayLTV(formData['liquidationLTV']),
      }
      setDisplayData(data);
      setReady(true);
    }
  }, []);

  const goBack = (event) => {
    navigate(-1);
  }

  // apr: since smart contract cannot store decimal places, mult it by 10
  const handleRequestForLoan = async (formData) => {
    await initiateLoan(
      collateralizedLoanGateway, userAddress, userAddress, formData['loanAmount'], web3.utils.toWei(formData['collateralAmount'], 'ether'),
      formData['loanTerm'], formData['apr'] * 10, formData['repaymentSchedule'], formData['monthlyRepayment'], formData['remainingPaymentCount']
      , formData['initialLTV'], formData['marginLTV'], formData['liquidationLTV']
    );
  }

  const onSubmit = () => {
    if(window.confirm('Confirm to submit the lending details?')) {
      console.log(formData);

      setIsDisabled(true);

      handleRequestForLoan(formData).then((msg) => {
        console.log(msg);
        reset();
        setRedirect(true);
      }).catch((err) => {
        console.log(err);
        setIsDisabled(false);
      });
    }
  }

  if(redirect) {
    return(
      <Navigate to="/manageLoan" />
    );
  }

  return (
    <Box className="flex flex-col items-center" style={{margin: 'auto'}}>
      {ready
      ?
      <form id="initiateLendingForm" onSubmit={handleSubmit(onSubmit)} style={{width: 'inherit'}}>
        {/* <Grid container className="h-24 items-top">
          <Grid item xs={6}>
            <p className="py-2 text-left">Loan amount</p>
          </Grid>
          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">{formData['loanAmount} USD</h4>
          </Grid>
        </Grid>
        
        <Grid container className="h-24 items-top">
          <Grid item xs={6}>
            <h4 className="py-2 font-bold text-left">Collateral amount</h4>
          </Grid>

          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">{formData['collateralAmount} {formData['collateralCoin}</h4>
          </Grid>
        </Grid>
        
        <Grid container className="h-24 items-top">
          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">Loan Term</h4>
          </Grid>
          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">{formData['loanTerm} days</h4>
          </Grid>
        </Grid>

        <Grid container className="h-24 items-top">
          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">APR</h4>
          </Grid>
          <Grid item xs={6}>
            <h4 className="py-2 font-medium text-left">{formData['apr}%</h4>
          </Grid>
        </Grid> */}

        {Object.entries(displayData).map(([key, value], i) => {
          return(
            <Grid container key={'field' + i} className="h-24 items-top">
              <Grid item xs={6}>
                <h4 className="py-2 font-medium text-left">{key}</h4>
              </Grid>
              <Grid item xs={6}>
                <h4 className="py-2 font-medium text-left">{value}</h4>
              </Grid>
            </Grid>
          )
        })}

        <Box className="py-8">
          <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>
            <Button type="submit" variant="contained" disabled={isDisabled} >Confirm</Button>
            <Button variant="contained" onClick={goBack} disabled={isDisabled} >Back</Button>
          </Stack>
        </Box>
      </form>
      : null}
    </Box>
  )
}
export default ConfirmInitiateLending;
  