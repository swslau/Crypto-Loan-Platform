import {
  Typography, Grid, Box
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

function Home() {
  return (
    <Grid className="text-center">
      <Grid container spacing={2} sx={{ mx: 20, display: { xs: 'none', md: 'flex', lg: 'flex' } }} style={{height: '550px', width: '90%', alignItems: 'center', margin: '0 auto'}}>
        <Grid item md={3} lg={6} style={{ alignItems: 'center' }}>
          <VolunteerActivismIcon
          style={{ width: 80, height: 80 }}
          />
        </Grid>
        <Grid item md={9} lg={6} style={{ textAlign: 'left' }}>
          <Box>
            <Typography
              component='p'
              sx={{ mb: 2 }}
              style={{fontSize: 40}}
              className="animate__animated animate__fadeIn"
            >
                Welcome to Crypto Loan Platform!
            </Typography>
            <Typography
              component='p'
              style={{fontSize: 25}}
              className="animate__animated animate__fadeIn"
            >
                The best place for searching crypto loan.
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }} style={{width: '90%', margin: '0 auto'}}>
        <Grid item sm={12} sx={{mt: 10, mb: 5}} style={{ alignItems: 'center' }}>
          <VolunteerActivismIcon style={{ height: '100%', fontSize: '100' }}/>
        </Grid>
        <Grid item sm={12} style={{ textAlign: 'center' }}>
          <Typography
            // variant='h1'
            component='p'
            sx={{ mb: 2 }}
            style={{fontSize: 70}}
            className="animate__animated animate__fadeIn"
          >
              Welcome to Crypto Loan Platform!
          </Typography>
          <Typography
            component='p'
            style={{fontSize: 25}}
            className="animate__animated animate__fadeIn"
          >
              The best place for searching crypto loan.
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Home;
