import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Table, TableBody, TableCell,
  TableRow, TableContainer, Box,
  Stack, Button
} from '@mui/material';
import { Navigate, useParams, useNavigate } from "react-router-dom";

import NotAuthorized from '../error/NotAuthorized';
import { getLoanDetails, requestLoan, disburseLoan } from '../../utils/ContractCall';
import { displayAddress, displayEtherAmount, displayFiatAmount, displayLoanStatus, displayAPR, displayLTV, displayLoanTerm, displayRepaymentSchedule, calculateTotalRepaymentAmount, calculateTotalInterestAmount, calculateNextRepaymentDeadline, timeConverter } from '../../utils/Utils.js';

function LoanDetails() {
  const {loanId} = useParams();
  const [rawLoanDetails, setRawLoanDetails] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [displayButtonOptions, setDisplayButtonOptions] = useState({});
  const {collateralizedLoanGateway, userAddress} = useContext(AppContext);

  useEffect(() => {
    getLoanDetails(collateralizedLoanGateway, userAddress, loanId).then((loanItem) => {
      if(loanItem['loanId'] !== "0") {
        let authorized = userAddress === loanItem['lender'] || userAddress === loanItem['borrower'] || displayLoanStatus(loanItem['loanStatus']) === "Loan Initiated";
        if(authorized) {
          setIsAuthorized(true);
          setRawLoanDetails(loanItem);
          let data = {
              'Lender': displayAddress(loanItem['lender']),
              'Borrower': displayAddress(loanItem['borrower'], "N/A"),
              'Loan Status': displayLoanStatus(loanItem['loanStatus']),
              'Collateral Amount': displayEtherAmount(loanItem['collateralAmount']),
              'Loan Amount': displayFiatAmount(loanItem['loanAmount']),
              'APR': displayAPR(loanItem['apr']),
              'Loan Term': displayLoanTerm(loanItem['loanTerm']),
              'Repayment Frequency': displayRepaymentSchedule(loanItem['repaymentSchedule']),
              'Repayment per instalment': displayFiatAmount(loanItem['monthlyRepaymentAmount']),
              'Total interest amount': displayFiatAmount(calculateTotalInterestAmount(loanItem['monthlyRepaymentAmount'], loanItem['loanTerm'], loanItem['repaymentSchedule'], loanItem['loanAmount'])),
              'Total repayment amount': displayFiatAmount(calculateTotalRepaymentAmount(loanItem['monthlyRepaymentAmount'], loanItem['loanTerm'], loanItem['repaymentSchedule'])),
              'Initial LTV': displayLTV(loanItem['initialLTV']),
              'Margin LTV': displayLTV(loanItem['marginLTV']),
              'Liquidation LTV': displayLTV(loanItem['liquidationLTV']),
              'Loan creation time': timeConverter(loanItem['createTime']),
              'Last updated time': timeConverter(loanItem['lastUpdateTime']),
          };
          if(data['Loan Status'] === "Loan Repaying") {
            data['Next repayment deadline'] = timeConverter(loanItem['nextRepaymentDeadline']);
          }
          if(data['Loan Status'] === "Loan Repaying") {
            data['Remaining repayment count'] = loanItem['remainingRepaymentCount'];
          }
          setLoanDetails(data);

          let displayButtonOptions = {};
          displayButtonOptions['requestLoanButton'] = false;
          displayButtonOptions['disburseLoanButton'] = false;

          if(displayAddress(loanItem['lender']) !== userAddress && data['Loan Status'] === "Loan Initiated") {
            displayButtonOptions['requestLoanButton'] = true;
          }

          if(displayAddress(loanItem['lender']) === userAddress && data['Loan Status'] === "Loan Requested") {
            displayButtonOptions['disburseLoanButton'] = true;
          }

          setDisplayButtonOptions(displayButtonOptions);
        }

      }
      setIsReady(true);
    });
  }, []);

  return (
    <Box className="text-center text-gray-900">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      { isReady
        ?
          rawLoanDetails.length != 0
          ?
          <>
            <Box className="">
              <h1 className="text-xl font-semibold">Loan Details</h1>
              <h4 className="text-sm">Loan #{loanId}</h4>
            </Box>
            <Box className="mt-4">
              <LoanDetailsTable loanDetails={loanDetails} rawLoanDetails={rawLoanDetails} loanId={loanId} displayButtonOptions={displayButtonOptions} />
            </Box>
          </>
          : <NotAuthorized />
        : null
      }
      </main>
    </Box>
  );
}

function LoanDetailsTable({ loanDetails, rawLoanDetails, loanId, displayButtonOptions }) {
  const navigate = useNavigate();
  const [redirect, setRedirect] = React.useState(false);
  const {userAddress, collateralizedLoanGateway} = useContext(AppContext);
  const [errMsg, setErrMsg] = useState(null);
  const [hasContractCallError, setHasContractCallError] = useState(false);
  const [isDisabled, setIsDisabled] = React.useState(false);

  const handleRequestForLoan = async (loanId) => {
    await requestLoan(
      collateralizedLoanGateway, userAddress, userAddress, loanId
    );
  }

  const onSubmitRequestForLoan = (event) => {
    if(window.confirm('Confirm to request for the loan?')) {
      setIsDisabled(true);

      handleRequestForLoan(loanId).then((msg) => {
        console.log(msg);
        setRedirect(true);
      }).catch((err) => {
        console.log(err);
        setIsDisabled(false);
      });
    }
  }

  const handleLenderDisburseLoan = async (loanId, rawLoanDetails) => {
    let nextRepaymentDeadline = null, repaymentSchedule = rawLoanDetails['repaymentSchedule'];
    let firstRepaymentDeadline = calculateNextRepaymentDeadline(nextRepaymentDeadline, repaymentSchedule);
    return await disburseLoan(
      collateralizedLoanGateway, userAddress, userAddress, loanId, firstRepaymentDeadline
    ).catch((err) => {
      throw(err);
    });
  }
  
  const onSubmitDisburseLoan = (event) => {
    if(window.confirm('Confirm to disburse the loan?')) {
      setIsDisabled(false);

      handleLenderDisburseLoan(loanId, rawLoanDetails).then((msg) => {
        console.log(msg);
        setRedirect(true);
      }).catch((err) => {
        let errMsg = "Unknown error";
        if('reason' in err) {
          errMsg = err['reason'];
        }
        setErrMsg(errMsg);
        setHasContractCallError(true);

        setIsDisabled(true);
      });
    }
  }

  const goBack = (event) => {
    navigate(-1);
  }

  if(redirect) {
    return(
      <Navigate to="/manageLoan" />
    );
  }

  return (
    <Box className="flex flex-col">
      <Box className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <Box className="min-w-[70%] py-2 align-middle inline-block sm:px-6 lg:px-8">
          <TableContainer className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg" >
            <Table className="min-w-min divide-y divide-gray-200" >
              <TableBody>
                {Object.entries(loanDetails).map(([key, value], i) => {
                  return(
                    <TableRow key={'detailsField' + i}>
                      <th width="40%" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-gray-100 content-center">
                        {key}
                      </th>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          { hasContractCallError === true
            ?
            <Box className="items-center">
                <h4 className="py-4 font-medium text-center" style={{color: "red"}}>{errMsg}</h4>
            </Box>
            : null
          }
          <Box className="py-6 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              { displayButtonOptions['requestLoanButton'] ? <Button variant="contained" onClick={onSubmitRequestForLoan} disabled={isDisabled} >Request for loan</Button> : null }
              { displayButtonOptions['disburseLoanButton'] ? <Button variant="contained" onClick={onSubmitDisburseLoan} disabled={isDisabled} >Disburse loan</Button> : null }
              <Button variant="contained" onClick={goBack} disabled={isDisabled} >Back</Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default LoanDetails;
  