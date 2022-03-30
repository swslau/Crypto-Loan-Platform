import React, { useState, useEffect } from "react";
import {
  Box, Stack, Button,
  FormControl, TextField, NativeSelect, Slider, FormHelperText, Grid
} from '@mui/material';
import ConfirmInitiateLending from "./ConfirmInitiateLending";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import ReconnectingWebSocket from "reconnecting-websocket";

import { getRepaymentSchedule, getAvailableLoanTerm, calculateRepaymentPerInterval } from '../../utils/Utils.js';

function InitiateLending() {
  const navigate = useNavigate();
  const [loanAmountInput, setLoanAmountInput] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [intervalEthPrice, setIntervalEthPrice] = useState(0);
  const [intervalEthPriceTrend, setIntervalEthPriceTrend] = useState(0);
  var streamEthPrice = 0;
  var lastIntervalEthPrice = 0;

  const [wsClient, setWSClient] = useState(null);
  const [wsClientReady, setWSClientReady] = useState(false);
  const [wsClientClosed, setWSClientClosed] = useState(false);
  const [wsInterval, setWSInterval] = useState(null);

  const [aprInput, setAprInput] = useState(0.1);
  const [initialLTVInput, setInitialLTVInput] = useState(65);
  const [redirect, setRedirect] = useState(false);
  const [formData, setFormData] = useState({});

  const { handleSubmit, register, formState: { errors }, reset } = useForm();

  const goBack = (event) => {
    navigate(-1);
  }

  const handleLoanAmountChange = (event) => {
    let newValue = event.target.value;
    setLoanAmountInput(newValue);
  };

  const handleAprInputChange = (event, newValue) => {
    setAprInput(newValue);
  };

  const handleInitialLTVInputChange = (event, newValue) => {
    setInitialLTVInput(newValue);
  };

  const initiateWebsocket = async () => {
    const wsOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      connectionTimeout: 5000,
      minUptime: 5000,
      maxRetries: 10,
      reconnectionDelayGrowFactor: 1.3,
      debug: false
    }
    const url = "wss://cnode.dynamicstrategies.io:9010";
    const ws = new ReconnectingWebSocket(url, [], wsOptions);

    ws.addEventListener('open', () => {
      console.log("Connection Established ...");
    });

    ws.addEventListener('message', (e) => {
      let dataFromServer = JSON.parse(e.data);
      if (dataFromServer.type === 'ethspot') {
        // setStreamEthPrice(dataFromServer.values.index);
        streamEthPrice = dataFromServer.values.index;
      }
    });

    ws.addEventListener('error', (e) => {
      console.log('error: ', e.data);
    });

    ws.addEventListener('close', (e) => {
      console.log('error: ', e.data);
    });

    return ws;
  }

  const onSubmit = (formData) => {
    formData['collateralAmount'] = collateralAmount.toString();
    formData['intervalEthPrice'] = intervalEthPrice;
    formData['repaymentSchedule'] = getRepaymentSchedule(formData['loanTerm']);
    formData['remainingPaymentCount'] = formData['loanTerm'] / formData['repaymentSchedule'];
    formData['monthlyRepayment'] = calculateRepaymentPerInterval(formData['loanAmount'], formData['repaymentSchedule'], formData['remainingPaymentCount'], formData['apr']);
    formData['marginLTV'] = (parseInt(formData['initialLTV']) + 5).toString();
    formData['liquidationLTV'] = "90";

    setFormData(formData);
    setRedirect(true);
  }

  useEffect(() => {
    if(!wsClientReady) {
      initiateWebsocket().then(e => {
        setWSClient(e);
        setWSClientReady(true);
      });
    }

    return () => {
      if(wsClient)
        wsClient.close();
      console.log('cleaned up websocket');
      setWSClientReady(false);
    };
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      let _intervalEthPrice = Math.round(streamEthPrice * Math.pow(10, 6)) / Math.pow(10, 6);
      setIntervalEthPrice(_intervalEthPrice);
      if(lastIntervalEthPrice < _intervalEthPrice)
        setIntervalEthPriceTrend(1);
      else if(lastIntervalEthPrice > _intervalEthPrice)
        setIntervalEthPriceTrend(-1);
      else if(lastIntervalEthPrice === _intervalEthPrice)
        setIntervalEthPriceTrend(0);
      lastIntervalEthPrice = _intervalEthPrice;
    }, 1000);

    return () => {
      console.log('cleaned up interval');
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // loanAmountInput / (intervalEthPrice * collaterallAmount) = 0.65
    // => collaterallAmount = (loanAmountInput / 0.65) / intervalEthPrice
    let _collaterallAmount = Math.round(
      (loanAmountInput / (initialLTVInput / 100)) / intervalEthPrice * Math.pow(10, 8)
    ) / Math.pow(10, 8);
    if(!isFinite(_collaterallAmount)) _collaterallAmount = 0;
    setCollateralAmount(_collaterallAmount);
  }, [loanAmountInput, intervalEthPrice]);

  if(redirect) {
    return(
      <ConfirmInitiateLending formData={formData} />
    );
  }
  return (
    <Box className="text-center text-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="">
          <h1 className="text-xl font-semibold">Initiate a lending offer</h1>
          <h4 className="text-sm">Make a loan offer in the marketplace</h4>
        </Box>
        <Box className="mt-4">
          <Box className="flex flex-col items-center">
            <form id="initiateLendingForm" onSubmit={handleSubmit(onSubmit)} style={{width: 500, height: 200}}>
              <Grid container className="h-28 items-center content-center">
                <Grid item xs={4}>
                  <h4 className="font-medium text-left">Loan amount</h4>
                </Grid>
                <Grid item xs={8}>
                  <FormControl style={{minWidth: 300}}>
                    <Grid container className="items-center">
                      <Grid item xs={8}>
                        <TextField {...register("loanAmount", {
                          required: "Required",
                          maxLength: 5,
                          pattern: {
                            value: /^[0-9]+$/i,
                            message: "Invalid loan amount"
                          }
                        })}
                        onChange={handleLoanAmountChange}
                        aria-describedby="my-helper-text2" variant="outlined"
                        />
                        {/* <FormHelperText id="my-helper-text2" className="text-left">The amount of money you want to lend</FormHelperText> */}
                      </Grid>
                      <Grid item xs={4}>
                        USD
                      </Grid>
                    </Grid>
                    {errors.loanAmount && <h4 className="py-2 font-medium text-red-500 text-left">{errors.loanAmount.message}</h4>}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container className="h-28 items-center content-center">
                <Grid item xs={4}>
                  <h4 className="font-medium text-left">Collateral amount</h4>
                </Grid>
                <Grid item xs={8}>
                  <FormControl style={{minWidth: 300}}>
                    <Grid container className="items-center">
                      <Grid item xs={6}>
                        {/* <TextField {...register("collateralAmount", {
                          required: "Required",
                          pattern: {
                            value: /^\d+\.?\d*$/i,
                            message: "Invalid collateral amount"
                          }
                        })} aria-describedby="my-helper-text2" variant="outlined"/>
                         */}
                        {/* <FormHelperText id="my-helper-text2" className="text-left">The amount of money you want to lend</FormHelperText> */}
                        <p className="text-left">{ collateralAmount !== 0 && !isNaN(collateralAmount) ? collateralAmount : null }</p>
                      </Grid>
                      {/* <Grid item xs={4}>
                        <NativeSelect {...register("collateralCoin", {
                          required: "Required",
                          pattern: {
                            value: /^[A-Z]+$/i,
                            message: "Invalid collateral coin"
                          }
                        })} aria-describedby="my-helper-text2" variant="outlined" >
                          {
                            getAvailableCoin().map((coin) => (<option key={'coinOption' + coin} value={coin}>{coin}</option>))
                          }
                        </NativeSelect>
                      </Grid> */}
                      {/* <Grid item xs={4}>
                        <Button variant="contained" onClick={calculateCollateral}>Calculate ETH</Button>
                      </Grid> */}
                      <Grid item xs={6}>
                        <p className="text-left" style={ intervalEthPriceTrend !== 0 ? {color: intervalEthPriceTrend === 1 ? "green" : "red"} : null }>{ collateralAmount !== 0 && !isNaN(collateralAmount) ? "@USD " + intervalEthPrice : null}</p>
                      </Grid>
                    </Grid>
                    {errors.collateralAmount && <h4 className="py-2 font-medium text-red-500 text-left">{errors.collateralAmount.message}</h4>}
                    {errors.collateralCoin && <h4 className="py-2 font-medium text-red-500 text-left">{errors.collateralCoin.message}</h4>}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container className="h-28 items-center content-center">
                <Grid item xs={4}>
                  <h4 className="font-medium text-left">Loan Term</h4>
                </Grid>
                <Grid item xs={8}>
                  <FormControl style={{minWidth: 300}}>
                    <NativeSelect {...register("loanTerm", {
                      required: "Required",
                      pattern: {
                        value: /^[0-9]+$/i,
                        message: "Invalid loan term"
                      }
                    })} aria-describedby="my-helper-text2" variant="outlined" defaultValue={7} >
                      {
                        getAvailableLoanTerm().map((loanTerm) => (<option key={'loanTermOption' + loanTerm} value={loanTerm}>{loanTerm} days</option>))
                      }
                    </NativeSelect>
                    {/* <FormHelperText id="my-helper-text2" className="text-left">The amount of money you want to lend</FormHelperText> */}
                    {errors.loanTerm && <h4 className="py-2 font-medium text-red-500 text-left">{errors.loanTerm.message}</h4>}
                  </FormControl>
                </Grid>
              </Grid>

              {/* <Box>
                <FormControl style={{width: 400}}>
                  <h4 className="py-2 font-medium text-left">Interest rate</h4>
                  <h4 className="py-2 font-medium text-left">0.002%</h4>
                </FormControl>
              </Box> */}

              <Grid container className="h-28 items-center content-center">
                <Grid item xs={4}>
                  <h4 className="font-medium text-left">APR</h4>
                </Grid>
                <Grid item xs={8}>
                  <FormControl style={{width: 300}}>
                    <Slider {...register("apr", {
                        required: "Required",
                        pattern: {
                          // value: /^[0-9]+(\.[0-9]+)?$/i,
                          value: /^\d+\.?\d*/i,
                          message: "Invalid APR"
                        }
                      })}
                      valueLabelDisplay="auto"
                      value={aprInput}
                      valueLabelFormat={value => <div>{value + '%'}</div>}
                      onChange={handleAprInputChange}
                      step={0.1}
                      min={0.1}
                      max={10}
                      style={{width: 'inherit'}}
                    />
                    {errors.apr && errors.apr.message}
                    <FormHelperText id="my-helper-text2" className="text-left">{aprInput}%</FormHelperText>
                    {errors.apr && <h4 className="py-2 font-medium text-red-500 text-left">{errors.apr.message}</h4>}
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container className="h-28 items-center content-center">
                <Grid item xs={4}>
                  <h4 className="font-medium text-left">Initial LTV</h4>
                </Grid>
                <Grid item xs={8}>
                  <FormControl style={{width: 300}}>
                    <Slider {...register("initialLTV", {
                        required: "Required",
                        pattern: {
                          // value: /^[0-9]+(\.[0-9]+)?$/i,
                          value: /^\d+/i,
                          message: "Invalid initial LTV"
                        }
                      })}
                      valueLabelDisplay="auto"
                      value={initialLTVInput}
                      valueLabelFormat={value => <div>{value + '%'}</div>}
                      onChange={handleInitialLTVInputChange}
                      step={1}
                      min={65}
                      max={75}
                      style={{width: 'inherit'}}
                    />
                    {errors.apr && errors.apr.message}
                    <FormHelperText id="my-helper-text2" className="text-left">{initialLTVInput}%</FormHelperText>
                    {errors.apr && <h4 className="py-2 font-medium text-red-500 text-left">{errors.apr.message}</h4>}
                  </FormControl>
                </Grid>
              </Grid>

              <Box>
                <Stack direction="row" justifyContent="left" alignItems="left" spacing={2}>
                  <Button type="submit" variant="contained" >Initiate the lending offer</Button>
                  <Button variant="contained" onClick={goBack}>Back</Button>
                </Stack>
              </Box>
            </form>
          </Box>
        </Box>
      </main>
    </Box>
  );
}

export default InitiateLending;
  