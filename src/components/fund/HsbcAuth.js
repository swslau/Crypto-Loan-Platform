import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../AppProvider";
import { useCookies } from 'react-cookie';

import {
  Box, Stack, Button, FormControl, TextField, Grid
} from '@mui/material';
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

import { addMinutes } from '../../utils/Utils.js';

const config = require('../../config/Config.js');

const CryptoJS = require('crypto-js');

function HsbcAuth() {
  const { handleSubmit, register, formState: { errors }, reset } = useForm();

  const [authenticated, setAuthenticated] = useState(false);
  const [hasAuthenticationError, setHasAuthenticationError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const {userAddress} = useContext(AppContext);
  const [cookies, setCookie] = useCookies(['isBankLogined']);
  const [isDisabled, setIsDisabled] = React.useState(false);
  
  const handleAPILogin = async (formData) => {
    const keyBase64 = process.env.REACT_APP_LOGIN_DECRYPT_SECRET;
    var key = CryptoJS.enc.Base64.parse(keyBase64);
    var srcs = CryptoJS.enc.Utf8.parse(formData['accountPassword']);

    var encryptedPhase = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    let encryptedPassword = encryptedPhase.toString();

    const reqBody = {
      'username': formData['accountName']
      , 'password': encryptedPassword
      , 'userAddress': userAddress
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

    return fetch(config.postLoginEndpoint, requestSpec)
    .then(res => {
      // console.log(res.status);
      if(res.status === 200)
        return res.text();
      else if(res.status === 404)
        return null;
      else
        return null;
    })
    .then(token => {
      // console.log('Success:', token);
      return token;
    })
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });

  }

  useEffect(() => {
    setCookie('isBankLogined', 'false', { path: '/', secure: 'false',  sameSite: 'none' });
    console.log(cookies['isBankLogined']);
    if(authenticated || cookies['isBankLogined'] === "true") {
      setTimeout(() => setRedirect(true), 3000);
    }
  }, []);

  const onSubmit = (formData) => {
    const timeOutMin = 15;
    let expiresAt = addMinutes(new Date(), timeOutMin);
    let maxAge = timeOutMin * 60;

    setIsDisabled(true);

    handleAPILogin(formData).then((res) => {
      if(res) {
        reset();
        setAuthenticated(true);
        setCookie('isBankLogined', 'true', { path: '/', secure: 'false', sameSite: 'none', expires: expiresAt, maxAge: maxAge });
        setCookie('bankName', 'HSBC', { path: '/', secure: 'false', sameSite: 'none', expires: expiresAt, maxAge: maxAge });
        setTimeout(() => setRedirect(true), 3000);
      } else {
        setHasAuthenticationError(true);
        setIsDisabled(false);
      }
    }).catch((err) => {
      console.log(err);
      setIsDisabled(false);
    });
  }

  if(authenticated || cookies['isBankLogined'] === "true") {
    return(
      <Box className="flex flex-col items-center">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <h4 className="text-md font-semibold">You have successfully login, now redirecting you to fund transfer page...</h4>
          {redirect ? <Navigate to="/fundTransfer" /> : null}
        </main>
      </Box>
    );
  }

  if(!cookies['isBankLogined'] || cookies['isBankLogined'] === "false") {
    return (
      <Box className="flex flex-col items-center">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <h1 className="text-xl font-semibold">HSBC Auth Page</h1>
          <form id="initiateLendingForm" onSubmit={handleSubmit(onSubmit)}>
            <Grid container className="h-28 items-center">
              <Grid item xs={5}>
                <h4 className="py-2 font-medium text-left">API Account Name</h4>
              </Grid>
              <Grid item xs={7}>
                <FormControl margin="normal" style={{minWidth: 300}}>
                  <TextField {...register("accountName", {
                    required: "Required"
                  })} aria-describedby="my-helper-text2" variant="outlined"/>
                  {errors.accountName && <h4 className="py-2 font-medium text-red-500 text-left">{errors.accountName.message}</h4>}
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container className="h-28 items-center">
              <Grid item xs={5}>
                <h4 className="py-2 font-medium text-left">API Account Password</h4>
              </Grid>
              <Grid item xs={7}>
                <FormControl margin="normal" style={{minWidth: 300}}>
                  <TextField {...register("accountPassword", {
                    required: "Required"
                  })} aria-describedby="my-helper-text2" variant="outlined" type="password"/>
                  {errors.accountPassword && <h4 className="py-2 font-medium text-red-500 text-left">{errors.accountPassword.message}</h4>}
                </FormControl>
              </Grid>
            </Grid>

            { hasAuthenticationError
            ?
            <Grid container className="items-center">
                <h4 className="py-2 font-medium text-left" style={{color: "red"}}>Invalid account name or password</h4>
            </Grid>
            : null
            }

            <Box className="py-8">
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <Button type="submit" variant="contained" disabled={isDisabled} >Submit</Button>
              </Stack>
            </Box>
          </form>
        </main>
      </Box>
    )
  }
}

export default HsbcAuth;
