import React from "react";
import {
  Box
} from '@mui/material';


function NotAuthorized() {
    return (
      <Box className="text-center">
        <p>You are not authorized to see this page.</p>
      </Box>
    );
}

export default NotAuthorized;
