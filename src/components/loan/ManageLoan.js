import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  TablePagination, Box,
  Stack, Button
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useTable, useSortBy } from "react-table";

import { getLenderLoans, getBorrowerLoans, cancelLoan } from '../../utils/ContractCall';
import { displayLoanStatus, displayEtherAmount, displayFiatAmount, displayLTV, timeConverter } from '../../utils/Utils.js';

const getBorrowerTableColumn = () => [
  { Header: "Loan No.", accessor: "index" },
  { Header: "Cryptocurrency", accessor: "cryptocurrency" },
  { Header: "Loan Status", accessor: "loanStatus" },
  { Header: "Collateral Amount", accessor: "collateralAmount" },
  { Header: "Loan Amount", accessor: "loanAmount" },
  { Header: "Loan Term (days)", accessor: "loanTerm" },
  { Header: "Initial LTV", accessor: "initialLTV" },
  { Header: "Margin LTV", accessor: "marginLTV" },
  { Header: "Liquidation LTV", accessor: "liquidationLTV" },
  { Header: "Next Repayment Deadline", accessor: "nextRepaymentDeadline" },
];

const getLenderTableColumn = () => [
  { Header: "Loan No.", accessor: "index" },
  { Header: "Cryptocurrency", accessor: "cryptocurrency" },
  { Header: "Loan Status", accessor: "loanStatus" },
  { Header: "Collateral Amount", accessor: "collateralAmount" },
  { Header: "Loan Amount", accessor: "loanAmount" },
  { Header: "Loan Term (days)", accessor: "loanTerm" },
  { Header: "Initial LTV", accessor: "initialLTV" },
  { Header: "Margin LTV", accessor: "marginLTV" },
  { Header: "Liquidation LTV", accessor: "liquidationLTV" },
  { Header: "Next Repayment Deadline", accessor: "nextRepaymentDeadline" },
];

function ManageLoan() {
  const [borrowerData, setBorrowerData] = useState([]);
  const [lenderData, setLenderData] = useState([]);
  const {collateralizedLoanGateway, userAddress} = useContext(AppContext);

  const borrowerDataColumns = React.useMemo(
    () => getBorrowerTableColumn(), []
  );
  const lenderDataColumns = React.useMemo(
    () => getLenderTableColumn(), []
  );


  useEffect(() => {
    getBorrowerLoans(collateralizedLoanGateway, userAddress, userAddress).then((rawData) => {
      let data = rawData.map(loanItem => {
        return {
          'index': loanItem['loanId'],
          'loanId': loanItem['loanId'],
          'cryptocurrency': 'ETH',
          'collateralAmount': displayEtherAmount(loanItem['collateralAmount']),
          'loanAmount': displayFiatAmount(loanItem['loanAmount']),
          'loanTerm': loanItem['loanTerm'],
          'initialLTV': displayLTV(loanItem['initialLTV']),
          'marginLTV': displayLTV(loanItem['marginLTV']),
          'liquidationLTV': displayLTV(loanItem['liquidationLTV']),
          'nextRepaymentDeadline': timeConverter(loanItem['nextRepaymentDeadline']),
          'loanStatus': displayLoanStatus(loanItem['loanStatus']),
          'buttonDisplayOption': {
            'displayDetails': true,
            'displayCancel': false,
            'displayRepay': displayLoanStatus(loanItem['loanStatus']) === "Loan Repaying",
          }
        }
      });
      setBorrowerData(data);
    });

    getLenderLoans(collateralizedLoanGateway, userAddress, userAddress).then((rawData) => {
      let data = rawData.map(loanItem => {
        return {
          'index': loanItem['loanId'],
          'loanId': loanItem['loanId'],
          'cryptocurrency': 'ETH',
          'collateralAmount': displayEtherAmount(loanItem['collateralAmount']),
          'loanAmount': displayFiatAmount(loanItem['loanAmount']),
          'loanTerm': loanItem['loanTerm'],
          'initialLTV': displayLTV(loanItem['initialLTV']),
          'marginLTV': displayLTV(loanItem['marginLTV']),
          'liquidationLTV': displayLTV(loanItem['liquidationLTV']),
          'nextRepaymentDeadline': timeConverter(loanItem['nextRepaymentDeadline']),
          'loanStatus': displayLoanStatus(loanItem['loanStatus']),
          'buttonDisplayOption': {
            'displayDetails': true,
            'displayCancel': ["Loan Initiated", "Loan Requested"].includes(displayLoanStatus(loanItem['loanStatus'])),
            'displayRepay': false,
          }
        }
      });
      setLenderData(data);
    });
  }, []);

  return (
    <Box className="text-center text-gray-900">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="">
          <h1 className="text-xl font-semibold">Manage Loan</h1>
          <h4 className="text-sm">View all the details of your borrowed/lent loan</h4>
        </Box>
        <Box className="mt-4 text-l font-semibold text-left">
          You have borrowed ...
        </Box>
        <Box className="mt-4">
          <AvailableLoanTable columns={borrowerDataColumns} data={borrowerData} />
        </Box>
        <Box className="mt-4 text-l font-semibold text-left">
          You have lent ...
        </Box>
        <Box className="mt-4">
          <AvailableLoanTable columns={lenderDataColumns} data={lenderData} />
        </Box>
      </main>
    </Box>
  );
}

function getCryptoImgLocation(cryptoName) {
  switch(cryptoName) {
    case 'BNB': return 'cryptoPNG/binance-coin.png'
    case 'BTC': return 'cryptoPNG/bitcoin.png'
    case 'ADA': return 'cryptoPNG/cardano.png'
    case 'CRO': return 'cryptoPNG/crypto-com-coin.png'
    case 'DOGE': return 'cryptoPNG/dogecoin.png'
    case 'LTC': return 'cryptoPNG/litecoin.png'
    case 'ETH': return 'cryptoPNG/ethereum.png'
    case 'DOT': return 'cryptoPNG/polkadot-new.png'
    case 'SOL': return 'cryptoPNG/solana.png'
    case 'LUNA': return 'cryptoPNG/terra-luna.png'
  }
}

function AvailableLoanTable({ columns, data }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const {userAddress, collateralizedLoanGateway} = useContext(AppContext);

  let navigate = useNavigate(); 

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
  useTable({
    columns,
    data,
    initialState: {
      sortBy: [
        {
          id: 'index',
          desc: true
        }
      ]
    }
  }, useSortBy);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onClickRepay = (loanId) => {
    navigate(`/repayLoan/${loanId}`);
  }

  const handleCancelLoan = async (loanId) => {
    await cancelLoan(
      collateralizedLoanGateway, userAddress, userAddress, loanId
    );
  }

  const onClickCancel = (loanId) => {
    if(window.confirm('Confirm to cancel the loan?')) {
      handleCancelLoan(loanId).then((msg) => {
        console.log(msg);
        window.location.reload();
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  return (
    <Box className="flex flex-col">
      {/* <Box className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"> */}
        {/* <Box className="py-2 align-middle min-w-full sm:px-6 lg:px-8"> */}
          <TableContainer className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column, i) => 
                      (
                        <TableCell
                          scope="col"
                          className="group text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          style={{padding: 10}}
                        >
                          <Box className="flex items-center justify-between">
                            <Box className="px-2 flex items-center justify-between">
                              {column.render('Header')}
                            </Box>
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? <SortDownIcon className="w-4 h-4 text-gray-400" />
                                  : <SortUpIcon className="w-4 h-4 text-gray-400" />
                                : (
                                  <SortIcon className="w-4 h-4 text-gray-400" />
                                )}
                            </span>
                          </Box>
                        </TableCell>
                      )
                    )}
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableHead>
              <TableBody className="bg-white divide-y divide-gray-200">
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
                  prepareRow(row);
                  return (
                    <TableRow key={'row' + i} {...row.getRowProps()}>
                      {row.cells.map((cell, j) => {
                        if(cell.column.id === 'cryptocurrency') {
                          return(
                            <TableCell
                              key={'cell' + cell.column.id + i}
                              className="inline-flex whitespace-nowrap text-sm text-gray-900 content-center"
                              align="center"
                              style={{padding: 10}}
                            >
                              <Box className="inline-flex items-center align-middle">
                                <img src={getCryptoImgLocation(cell.value)} alt={cell.value} style={{height: 25, margin: 10}} />
                              </Box>
                              <Box className="inline-flex items-center align-middle">
                                {cell.value}
                              </Box>
                            </TableCell>
                          )
                        } else if(cell.column.id === 'index') {
                          return(
                            <TableCell
                              key={'cell' + cell.column.id + i}
                              className="inline-flex whitespace-nowrap text-sm text-gray-900 content-center"
                              align="center"
                              style={{padding: 10}}
                            >
                              <Box className="inline-flex items-center align-middle">
                                {cell.value}
                              </Box>
                            </TableCell>
                          )
                        }
                        return (
                          <TableCell
                            {...cell.getCellProps()}
                            className="whitespace-nowrap text-sm text-gray-900"
                            align="center"
                            style={{padding: 10}}
                          >
                            {cell.render("Cell")}
                          </TableCell>
                        )
                      })}

                      <TableCell key={'cellButtons' + i} className="whitespace-nowrap text-right text-sm font-medium">
                        <Stack direction="row" justifyContent="left" alignItems="center" spacing={2}>
                          {row.original.buttonDisplayOption.displayDetails ? <Button variant="contained" href={"/loanDetails/" + row.original.loanId}>Details</Button> : null}
                          {row.original.buttonDisplayOption.displayRepay ? <Button variant="contained" color="success" onClick={() => onClickRepay(row.original.loanId)}>Repay</Button> : null}
                          {row.original.buttonDisplayOption.displayCancel ? <Button variant="contained" color="error" onClick={() => onClickCancel(row.original.loanId)}>Cancel</Button> : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
              })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

        {/* </Box> */}
      {/* </Box> */}
    </Box>
  )
}

function SortIcon({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path></svg>
  )
}

function SortUpIcon({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path></svg>
  )
}

function SortDownIcon({ className }) {
  return (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path></svg>
  )
}


export default ManageLoan;
