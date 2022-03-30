import React from "react";
import {
  Box
} from '@mui/material';


function WalletError() {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="text-center">
          <h4>Please install Metamask and connect your wallet with the application.</h4>
        </Box>
      </main>
    );
}

export default WalletError;
