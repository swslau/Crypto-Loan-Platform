import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";

import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  TablePagination, Box,
  ToggleButton, Button,
  Typography, Grid, Stack, NativeSelect,
  FormControl, TextField
} from '@mui/material';

import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import { useForm } from "react-hook-form";

import { NavLink } from 'react-router-dom';
import { useTable, useSortBy, useFilters } from "react-table";

import { getAvailableCoin, getAvailableLoanTerm, getAvailableRangeOption, displayAddress, displayEtherAmount, displayFiatAmount, displayLoanStatus, displayAPR, displayLTV, displayRepaymentSchedule, timeConverter } from '../../utils/Utils.js';

const config = require('../../config/Config.js');

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  // border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    // expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  // backgroundColor:
  //   theme.palette.mode === 'dark'
  //     ? 'rgba(255, 255, 255, .05)'
  //     : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  // '& .MuiAccordionSummary-content': {
  //   marginLeft: theme.spacing(1),
  // },
  padding: 0
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  border: '1px solid rgba(0, 0, 0, .125)',
  textAlign: "left"
}));

function SearchLoan() {
  const columns = React.useMemo(
    () => [
      { Header: "Loan No.", accessor: "index" },
      { Header: "Cryptocurrency", accessor: "cryptocurrency" },
      { Header: "Collateral Amount", accessor: "collateralAmount" },
      { Header: "Loan Amount", accessor: "loanAmount" },
      { Header: "APR", accessor: "apr" },
      { Header: "Loan Term (days)", accessor: "loanTerm" },
      { Header: "Initial LTV", accessor: "initialLTV" },
      { Header: "Margin LTV", accessor: "marginLTV" },
      { Header: "Liquidation LTV", accessor: "liquidationLTV" },
    ],
    []
  );

  // const data = React.useMemo(() => getData(), []);

  const [serviceAvailable, setServiceAvailable] = useState(null);
  const [openFilter, setOpenFilter] = React.useState(false);
  const [isBorrowAmountFilterBetween, setIsBorrowAmountFilterBetween] = React.useState(false);
  const [isCollateralAmountFilterBetween, setIsCollateralAmountFilterBetween] = React.useState(false);
  const [isAPRFilterBetween, setIsAPRFilterBetween] = React.useState(false);

  const [loanItemData, setLoanItemData] = useState([]);
  const [loanItemDataReady, setLoanItemDataReady] = useState(false);
  const {collateralizedLoanGateway, userAddress} = useContext(AppContext);

  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('sm');
  
  const { handleSubmit, register, formState: { errors }, reset } = useForm();

  const onFilterFormSubmit = (formData) => {
    setOpenFilter(false);

    let queryString = "";

    let i = 0;
    for(const key in formData) {
      queryString += `${key}=${formData[key]}`;
      if(i != Object.keys(formData).length - 1) {
        queryString += "&";
      }
      i++;
    }

    console.log(queryString);

    const requestSpec = {
      method: 'GET',
      headers: {
        'User-Address': userAddress,
      },
    };

    return fetch(`${config.initiatedLoansByFilterEndpoint}?${queryString}`, requestSpec)
    .then(res => {
      console.log(res.status);
      return res.json();
    })
    .then(rawData => {
      console.log(rawData);
      let displayData = [];

      if(rawData) {
        rawData.forEach((loanItem) => {
          if(loanItem && parseInt(loanItem['loan_id']) !== 0 && displayAddress(loanItem['lender']) !== userAddress && displayLoanStatus(loanItem['loan_status_code']) === "Loan Initiated") {
            displayData.push(
              {
                'index': loanItem['loan_id'],
                'loanId': loanItem['loan_id'],
                'cryptocurrency': 'ETH',
                'collateralAmount': displayEtherAmount(loanItem['collateral_amount'], "ether"),
                'loanAmount': displayFiatAmount(loanItem['loan_amount']),
                'apr': displayAPR(loanItem['apr'], false),
                'loanTerm': loanItem['loan_term'],
                'initialLTV': displayLTV(loanItem['initial_ltv']),
                'marginLTV': displayLTV(loanItem['margin_ltv']),
                'liquidationLTV': displayLTV(loanItem['liquidation_ltv']),
                'loanStatus': displayLoanStatus(loanItem['loan_status_code']),
                'buttonDisplayOption': {
                  'displayDetails': true,
                  'displayCancel': false,
                  'displayRepay': false,
                }
              }
            );
          }
        });
      }

      console.log(displayData);

      setLoanItemData(displayData);
      setLoanItemDataReady(true);
      setServiceAvailable(true);
    })
    .catch((error) => {
      console.error('Error:', error);
      setServiceAvailable(false);
    });
  }

  const handleClick = () => {
    setOpenFilter(!openFilter);
  };

  const cleanFilter = () => {
    reset();
  }

  const handleGetInitiatedLoansByDefault = async () => {
    const requestSpec = {
      method: 'GET',
      headers: {
        'User-Address': userAddress,
      },
    };

    return fetch(config.initiatedLoansByDefaultEndpoint, requestSpec)
    .then(res => {
      console.log(res.status);
      return res.json();
    })
    .then(loanData => {
      // console.log('Success:', loanData);
      setServiceAvailable(true);
      return loanData;
    })
    .catch((error) => {
      // console.error('Error:', error);
      setServiceAvailable(false);
      return [];
    });

  }

  useEffect(() => {
    let getLoanData = async () => {
      let rawData = await handleGetInitiatedLoansByDefault();

      let displayData = [];

      if(rawData) {
        rawData.forEach((loanItem) => {
          if(loanItem && parseInt(loanItem['loan_id']) !== 0 && displayAddress(loanItem['lender']) !== userAddress && displayLoanStatus(loanItem['loan_status_code']) === "Loan Initiated") {
            displayData.push(
              {
                'index': loanItem['loan_id'],
                'loanId': loanItem['loan_id'],
                'cryptocurrency': 'ETH',
                'collateralAmount': displayEtherAmount(loanItem['collateral_amount'], "ether"),
                'loanAmount': displayFiatAmount(loanItem['loan_amount']),
                'apr': displayAPR(loanItem['apr'], false),
                'loanTerm': loanItem['loan_term'],
                'initialLTV': displayLTV(loanItem['initial_ltv']),
                'marginLTV': displayLTV(loanItem['margin_ltv']),
                'liquidationLTV': displayLTV(loanItem['liquidation_ltv']),
                'loanStatus': displayLoanStatus(loanItem['loan_status_code']),
                'buttonDisplayOption': {
                  'displayDetails': true,
                  'displayCancel': false,
                  'displayRepay': false,
                }
              }
            );
          }
        });
      }

      console.log(displayData);

      setLoanItemData(displayData);
      setLoanItemDataReady(true);
    }

    getLoanData();
  }, []);

  return (
    <Box className="text-center text-gray-900">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="flex">

          <Box style={{margin: "0 auto"}}>
            <h1 className="text-xl font-semibold">Search Loan</h1>
            <h4 className="text-sm">Borrow the crypto loan with the latest market information</h4>
          </Box>
          <Box className="w-0"></Box>
        </Box>

        <Box>
          <Accordion expanded={openFilter}>
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <ToggleButton
                value="check"
                selected={openFilter}
                onClick={handleClick}
              >
                {openFilter ? <FilterAltOffIcon /> : <FilterAltIcon />}
              </ToggleButton>
            </AccordionSummary>
            <AccordionDetails className="shadow">
              <h6 className="font-semibold">Filtering options</h6>
              <form id="filteringForm" onSubmit={handleSubmit(onFilterFormSubmit)}>
                <Grid container spacing={2} className="items-center">
                  <Grid item xs={3}>
                    <Typography>Cryptocurrency</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl margin="normal" style={{maxWidth: 100, display: 'flex'}}>
                      <NativeSelect {...register("cryptocurrencyFilterValue", {
                        // required: "Required",
                        pattern: {
                          value: /^[A-Z]+$/i,
                          message: "Invalid cryptocurrency"
                        }
                      })}>
                        {
                          getAvailableCoin().map((coin) => (<option key={'coinOption' + coin} value={coin}>{coin}</option>))
                        }
                      </NativeSelect>

                      {errors.cryptocurrencyFilterValue && <h4 className="py-2 font-medium text-red-500 text-left">{errors.cryptocurrencyFilterValue.message}</h4>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography>Collateral amount</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl margin="normal">
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                        <Grid item xs={6} className="text-left">
                          <NativeSelect {...register("collateralAmountRangeFilterValue", {
                            // required: "Required",
                            pattern: {
                              value: /^(LESS_THAN|LESS_THAN_OR_EQUAL_TO|EQAUL_TO|GREATER_THAN|GREATER_THAN_OR_EQAUL_TO|NOT_EQUAL_TO|BETWEEN)$/i,
                              message: "Invalid collateral amount range filter"
                            }
                          })} onChange={(event) => setIsCollateralAmountFilterBetween(event.target.value === "BETWEEN")}>
                            {
                              getAvailableRangeOption().map((option) => (<option key={'coinOption' + option.key} value={option.value}>{option.key}</option>))
                            }
                          </NativeSelect>
                        </Grid>
                        <Grid item xs={6} className="text-right">
                          <TextField {...register("collateralAmountFrom", {
                            // required: "Required",
                            pattern: {
                              value: /^\d+\.?\d*$/i,
                              message: "Invalid collateral amount" + (isCollateralAmountFilterBetween ? " start value" : "")
                            }
                          })} />
                        </Grid>
                      </Stack>

                      { isCollateralAmountFilterBetween &&
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                        <Grid item xs={6} className="text-right">
                          <Typography>and</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField {...register("collateralAmountTo", {
                            // required: "Required",
                            pattern: {
                              value: /^\d+\.?\d*$/i,
                              message: "Invalid collateral amount" + (isCollateralAmountFilterBetween ? " end value" : "")
                            }
                          })} />
                        </Grid>
                      </Stack>
                      }
                      {errors.collateralAmountRangeFilterValue && <h4 className="py-2 font-medium text-red-500 text-left">{errors.collateralAmountRangeFilterValue.message}</h4>}
                      {errors.collateralAmountFrom && <h4 className="py-2 font-medium text-red-500 text-left">{errors.collateralAmountFrom.message}</h4>}
                      {errors.collateralAmountTo && <h4 className="py-2 font-medium text-red-500 text-left">{errors.collateralAmountTo.message}</h4>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography>Borrow amount</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl margin="normal">
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                        <Grid item xs={6} className="text-left">
                          <NativeSelect {...register("borrowAmountRangeFilterValue", {
                            // required: "Required",
                            pattern: {
                              value: /^(LESS_THAN|LESS_THAN_OR_EQUAL_TO|EQAUL_TO|GREATER_THAN|GREATER_THAN_OR_EQAUL_TO|NOT_EQUAL_TO|BETWEEN)$/i,
                              message: "Invalid borrow range filter"
                            }
                          })} onChange={(event) => setIsBorrowAmountFilterBetween(event.target.value === "BETWEEN")}>
                            {
                              getAvailableRangeOption().map((option) => (<option key={'coinOption' + option.key} value={option.value}>{option.key}</option>))
                            }
                          </NativeSelect>
                        </Grid>
                        <Grid item xs={6} className="text-right">
                          <Stack className="pt-4 items-center" direction="row" spacing={2}>              
                            <TextField {...register("borrowAmountFrom", {
                              // required: "Required",
                              pattern: {
                                value: /^[0-9]+$/i,
                                message: "Invalid borrow amount" + (isBorrowAmountFilterBetween ? " start value" : "")
                              }
                            })} />
                            <Typography>USD</Typography>
                          </Stack>
                        </Grid>
                      </Stack>

                      { isBorrowAmountFilterBetween &&
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                        <Grid item xs={6} className="text-right">
                          <Typography>and</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack className="pt-4 items-center" direction="row" spacing={2}>              
                            <TextField {...register("borrowAmountTo", {
                              // required: "Required",
                              pattern: {
                                value: /^[0-9]+$/i,
                                message: "Invalid borrow amount" + (isBorrowAmountFilterBetween ? " end value" : "")
                              }
                            })} />
                            <Typography>USD</Typography>
                          </Stack>
                        </Grid>
                      </Stack>
                      }
                      {errors.borrowRangeFilterValue && <h4 className="py-2 font-medium text-red-500 text-left">{errors.borrowRangeFilterValue.message}</h4>}
                      {errors.borrowAmountFrom && <h4 className="py-2 font-medium text-red-500 text-left">{errors.borrowAmountFrom.message}</h4>}
                      {errors.borrowAmountTo && <h4 className="py-2 font-medium text-red-500 text-left">{errors.borrowAmountTo.message}</h4>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography>APR</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl margin="normal">
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                        <Grid item xs={6} className="text-left">
                          <NativeSelect {...register("aprRangeFilterValue", {
                            // required: "Required",
                            pattern: {
                              value: /^(LESS_THAN|LESS_THAN_OR_EQUAL_TO|EQAUL_TO|GREATER_THAN|GREATER_THAN_OR_EQAUL_TO|NOT_EQUAL_TO|BETWEEN)$/i,
                              message: "Invalid APR range filter"
                            }
                          })} onChange={(event) => setIsAPRFilterBetween(event.target.value === "BETWEEN")}>
                            {
                              getAvailableRangeOption().map((option) => (<option key={'coinOption' + option.key} value={option.value}>{option.key}</option>))
                            }
                          </NativeSelect>
                        </Grid>
                        <Grid item xs={6} className="text-right">
                          <Stack className="pt-4 items-center" direction="row" spacing={2}>
                            <TextField {...register("aprFrom", {
                              // required: "Required",
                              pattern: {
                                value: /^[0-9]+$/i,
                                message: "Invalid APR" + (isAPRFilterBetween ? " start value" : "")
                              }
                            })} />
                            <Typography>%</Typography>
                          </Stack>
                        </Grid>
                      </Stack>

                      { isAPRFilterBetween &&
                      <Stack className="pt-4 items-center" direction="row" spacing={2}>
                          <Grid item xs={6} className="text-right">
                            <Typography>and</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Stack className="pt-4 items-center" direction="row" spacing={2}>
                              <TextField {...register("aprTo", {
                                // required: "Required",
                                pattern: {
                                  value: /^[0-9]+$/i,
                                  message: "Invalid APR" + (isAPRFilterBetween ? " end value" : "")
                                }
                              })} />
                              <Typography>%</Typography>
                            </Stack>
                          </Grid>
                      </Stack>
                      }
                      {errors.aprRangeFilterValue && <h4 className="py-2 font-medium text-red-500 text-left">{errors.aprRangeFilterValue.message}</h4>}
                      {errors.aprFrom && <h4 className="py-2 font-medium text-red-500 text-left">{errors.aprFrom.message}</h4>}
                      {errors.aprTo && <h4 className="py-2 font-medium text-red-500 text-left">{errors.aprTo.message}</h4>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography>Loan term</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl margin="normal" style={{maxWidth: 100, display: 'flex'}}>
                      <NativeSelect {...register("loanTerm", {
                        // required: "Required",
                        pattern: {
                          value: /^[0-9]+$/i,
                          message: "Invalid loan term"
                        }
                      })} defaultValue={""} >
                        {
                          ["", ...getAvailableLoanTerm()]
                          .map((loanTerm) => (
                            <option
                              key={'loanTermOption' + loanTerm}
                              value={loanTerm}>{loanTerm !== "" ? loanTerm + " days" : ""}
                            </option>
                          ))
                        }
                      </NativeSelect>

                      {errors.loanTerm && <h4 className="py-2 font-medium text-red-500 text-left">{errors.loanTerm.message}</h4>}
                    </FormControl>
                  </Grid>
                </Grid>

                <Stack className="pt-4" direction="row" spacing={2}>
                  <Box><Button type="submit" variant="contained">Filter</Button></Box>
                  <Box><Button variant="contained" onClick={cleanFilter}>Clean</Button></Box>
                </Stack>
              </form>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* <Dialog
          fullWidth={fullWidth}
          maxWidth={maxWidth}
          open={openFilter}
          onClose={handleClose}
        >
          <DialogTitle>Filter</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You can set my maximum width and whether to adapt or not.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog> */}

        {
        serviceAvailable && loanItemDataReady
        ?
        <Box className="mt-4">
          <AvailableLoanTable columns={columns} data={loanItemData} />
        </Box>
        : null
        }

        {
        serviceAvailable === false
        ?
          <Grid container className="items-center">
              <h4 className="py-2 font-medium text-left" style={{color: "red"}}>Service temporarily unavailable</h4>
          </Grid>
        : null
        }
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

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

function AvailableLoanTable({ columns, data }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
  useTable({
    columns,
    data,
    defaultColumn,
  }, useFilters, useSortBy);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box className="flex flex-col">
      <Box className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <Box className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <TableContainer className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column, i) => {
                      return [
                        <TableCell
                          scope="col"
                          className="group px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                        >
                          <Box className="flex items-center justify-between">
                            {column.render('Header')}
                            {/* <div>{column.canFilter ? column.render('Filter') : null}</div> */}
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? <SortDownIcon className="w-4 h-4 text-gray-400" />
                                  : <SortUpIcon className="w-4 h-4 text-gray-400" />
                                : (
                                  <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                )}
                            </span>
                          </Box>
                        </TableCell>
                        ,
                        i === headerGroup.headers.length - 1
                        ? <TableCell key='rowHeaderDetails'></TableCell>
                        : null
                      ]
                    })}
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
                            <TableCell key={'cell' + cell.column.id + i}className="inline-flex px-4 py-4 whitespace-nowrap text-sm text-gray-900 content-center" align="center">
                              <Box className="inline-flex items-center align-middle">
                                <img src={getCryptoImgLocation(cell.value)} alt={cell.value} style={{height: 25, margin: 10}} />
                              </Box>
                              <Box className="inline-flex items-center align-middle">
                                {cell.value}
                              </Box>
                            </TableCell>
                          )
                        }

                        return[
                          <TableCell {...cell.getCellProps()} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cell.render("Cell")}
                          </TableCell>
                          ,
                          j === row.cells.length - 1
                          ?
                          <TableCell key={'cellDetails' + i} className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <NavLink to={"/loanDetails/" + row.original.loanId} className="text-indigo-600 hover:text-indigo-900">Details</NavLink>
                          </TableCell>
                          : null
                        ]
                      })}
                    </TableRow>
                  );
              })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

        </Box>
      </Box>
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


export default SearchLoan;
