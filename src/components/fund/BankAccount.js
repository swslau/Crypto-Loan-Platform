import * as React from 'react';
import {
  Box, Typography,
  Card, CardContent, CardMedia, CardActionArea, Grid
} from '@mui/material';
import { Link } from 'react-router-dom';

function BankAccount() {
  return (
    <Box className="text-center text-gray-900">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Box>
          <h1 className="text-xl font-semibold">Bank Account</h1>
          <h4 className="text-sm">Login to your bank account for direct fund transfer</h4>
        </Box>
        <Box className="py-4">
          <Box className="pb-8">
            <Typography>Please select one of the following bank account to login</Typography>
          </Box>
          <Grid
            container
            spacing={5}
            // direction="column"
            direction={{ xs: 'column', sm: 'row', md: 'row', lg: 'row', xl: 'row' }}
            alignItems="center"
            justifyContent="center"
            // sx={{ display: { xs: 'flex', md: 'none' }} }
          >
            <Grid item xs={12} sm={4} md={3} lg={3} xl={4}>
              <Card className="m-auto" sx={{ width: 250, height: 320 }} xs={12} >
                <CardActionArea style={{height: "inherit"}} >
                  <CardMedia
                    alt="HSBC" component={Link} to="/hsbc/auth" 
                  >
                    <img src="bankPNG/hsbc.png" className="m-auto my-6" style={{height: 160}}/>
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      HSBC
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} md={3} lg={3} xl={4}>
              <Card className="m-auto" sx={{ width: 250, height: 320 }}>
                <CardActionArea style={{height: "inherit"}} >
                  <CardMedia
                    alt="Hang Seng Bank"
                    component={Link} to="/" 
                  >
                    <img src="bankPNG/hangseng.png" className="m-auto my-6" style={{height: 160}}/>
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      Hang Seng Bank
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} md={3} lg={3} xl={4}>
              <Card className="m-auto" sx={{ width: 250, height: 320 }}>
                <CardActionArea style={{height: "inherit"}} >
                  <CardMedia
                    alt="Standard Chartered Bank"
                    // component={Link} to="/" 
                  >
                    <img src="bankPNG/scb.png" className="m-auto my-6" style={{height: 160}}/>
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      Standard Chartered Bank
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </main>
    </Box>
  );
}

export default BankAccount;
