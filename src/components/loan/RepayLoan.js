import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Table, TableBody, TableCell
  , TableRow, TableContainer, Box
  , Stack, Button
} from '@mui/material';
import { Navigate, useParams, useNavigate } from "react-router-dom";

import { getLoanDetails, checkFiatBalanceAmount, makeRepaymentByBorrower } from '../../utils/ContractCall';
import { displayAddress, displayFiatAmount, displayLoanStatus, calculateNextRepaymentDeadline, timeConverter } from '../../utils/Utils.js';

import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

function RepayLoan() {
  const {loanId} = useParams();
  const [rawLoanDetails, setRawLoanDetails] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [allowRepay, setAllowRepay] = useState(false);
  const [displayButtonOptions, setDisplayButtonOptions] = useState({});
  const [isReady, setIsReady] = useState(false);
  const {collateralizedLoanGateway, userAddress} = useContext(AppContext);

  useEffect(() => {
    checkFiatBalanceAmount(collateralizedLoanGateway, userAddress, userAddress).then((userFiatBalance)=>{
      getLoanDetails(collateralizedLoanGateway, userAddress, loanId).then((loanItem) => {
        setRawLoanDetails(loanItem);
        let remainingFiatBalance = userFiatBalance - loanItem['monthlyRepaymentAmount'];
        let data = {
            'Loan ID': loanItem['loanId'],
            'Lender': displayAddress(loanItem['lender']),
            'Borrower': displayAddress(loanItem['borrower'], "N/A"),
            'Loan Amount': displayFiatAmount(loanItem['loanAmount']),
            'Your USD balance': displayFiatAmount(userFiatBalance),
            'Repayment amount': displayFiatAmount(loanItem['monthlyRepaymentAmount']),
            'Remaining amount': displayFiatAmount(remainingFiatBalance),
            'Remaining repayment count':loanItem['remainingRepaymentCount'],
            'Repayment deadline': timeConverter(loanItem['nextRepaymentDeadline'])
        };
        setLoanDetails(data);

        setAllowRepay(remainingFiatBalance >= 0);

        let displayButtonOptions = {};
        displayButtonOptions['repayLoanButton'] = false;

        if(remainingFiatBalance >= 0 && displayAddress(loanItem['borrower']) === userAddress && displayLoanStatus(loanItem['loanStatus']) === "Loan Repaying") {
          displayButtonOptions['repayLoanButton'] = true;
        }

        setDisplayButtonOptions(displayButtonOptions);

        setIsReady(true);
      });
    });
  }, []);

  return (
    <Box className="text-center text-gray-900">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        { isReady
          ?
          <>
            <Box className="">
              <h1 className="text-xl font-semibold">Loan Repayment</h1>
            </Box>
            <Box className="mt-4">
              <RepayLoanDetailsTable loanDetails={loanDetails} rawLoanDetails={rawLoanDetails} loanId={loanId} allowRepay={allowRepay} displayButtonOptions={displayButtonOptions} />
            </Box>
            </>
          : null
        }
        </main>
    </Box>
  );
}

function RepayLoanDetailsTable({ loanDetails, rawLoanDetails, loanId, allowRepay, displayButtonOptions }) {
  const navigate = useNavigate();
  const [redirect, setRedirect] = React.useState(false);
  const {userAddress, collateralizedLoanGateway} = useContext(AppContext);
  const [errMsg, setErrMsg] = useState(null);
  const [hasContractCallError, setHasContractCallError] = useState(false);
  const [isDisabled, setIsDisabled] = React.useState(false);

  const handleRepayLoan = async (loanId, rawLoanDetails) => {
    let payValue = rawLoanDetails['monthlyRepaymentAmount']
    let nextRepaymentDeadline = rawLoanDetails['nextRepaymentDeadline'], repaymentSchedule = rawLoanDetails['repaymentSchedule'];
    nextRepaymentDeadline = calculateNextRepaymentDeadline(nextRepaymentDeadline, repaymentSchedule);
    return await makeRepaymentByBorrower(
      collateralizedLoanGateway, userAddress, userAddress, loanId, payValue, nextRepaymentDeadline
    ).catch((err) => {
      throw(err);
    });
  }

  const onSubmitRepayLoan = (event) => {
    if(window.confirm('Confirm to repay the loan?')) {
      setIsDisabled(true);

      handleRepayLoan(loanId, rawLoanDetails).then((msg) => {
        console.log(msg);
        setRedirect(true);
      }).catch((err) => {
        let errMsg = "Unknown error";
        if('reason' in err) {
          errMsg = err['reason'];
        }
        setErrMsg(errMsg);
        setHasContractCallError(true);

        setIsDisabled(false);
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
          { allowRepay !== true
            ?
            <Box className="items-center">
                <h4 className="py-4 font-medium text-center" style={{color: "red"}}>You cannot repay the loan since you do not have enough fiat balance</h4>
            </Box>
            : null
          }
          { hasContractCallError === true
            ?
            <Box className="items-center">
                <h4 className="py-4 font-medium text-center" style={{color: "red"}}>{errMsg}</h4>
            </Box>
            : null
          }
          <Box className="py-4 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              { displayButtonOptions['repayLoanButton'] ? <Button variant="contained" disabled={isDisabled || !allowRepay} color="success" onClick={onSubmitRepayLoan} >Repay loan</Button> : null }
              <Button variant="contained" onClick={goBack} disabled={isDisabled} >Back</Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
export default RepayLoan;
  