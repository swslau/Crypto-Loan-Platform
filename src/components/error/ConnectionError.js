import React from "react";
import {
  Box
} from '@mui/material';


function ConnectionError() {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box className="text-center">
          <h4>The application is currently unable to connect to the Ethereum network.</h4>
          <h6>Please retry again later.</h6>
        </Box>
      </main>
    );
}

export default ConnectionError;
