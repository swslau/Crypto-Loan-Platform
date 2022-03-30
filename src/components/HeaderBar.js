import React, { useState, useContext } from "react";
import { AppContext } from "../AppProvider";

import {
  AppBar, Box, Toolbar,
  Button, IconButton,
  Menu, Typography,
  Avatar, Grid, Stack, Link
} from '@mui/material';

import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizontalCircleIcon from '@mui/icons-material/SwapHorizontalCircle';

import { NavLink } from 'react-router-dom';

const appName = 'Crypto Loan Platform';
const pages = [
  {href: '/', title: 'Home'},
  {href: '/searchLoan', title: 'Search loan'},
  {href: '/initiateLending', title: 'Initiate lending'},
  {href: '/manageLoan', title: 'Manage loan'},
];
const settings = [
  {href: '/dashboard', title: 'Dashboard'},
  {href: '/bankAccount', title: 'Bank Account'},
];

function HeaderBar({ isWalletConnected }) {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const { username, userAddress } = useContext(AppContext);
  
    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
  
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
  
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };
  
    return (
      isWalletConnected && username !== null
      ?
      <AppBar position="sticky" style={{ background: '#2E3B55'}}>
        <Toolbar>

          {/* Small-size HeaderBar */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
              transitionDuration={0}
            >
              <Grid container style={{margin: 20, width: 300, height: 300}}>
                <Grid item className="flex" xs={6}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/" style={{ textDecoration: 'none', color: 'black' }}>
                        <HomeIcon sx={{width: 100, height: 100}} />
                        <Typography>Home</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item className="flex" xs={6}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/searchLoan" style={{ textDecoration: 'none', color: 'black' }}>
                        <SearchIcon sx={{width: 100, height: 100}} />
                        <Typography>Search loan</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item className="flex" xs={6}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/initiateLending" style={{ textDecoration: 'none', color: 'black' }}>
                        <AddCircleOutlineIcon sx={{width: 100, height: 100}} />
                        <Typography>Initiate lending</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item className="flex" xs={6}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/manageLoan" style={{ textDecoration: 'none', color: 'black' }}>
                        <ManageSearchIcon sx={{width: 100, height: 100}} />
                        <Typography>Manage loan</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Menu>
          </Box>

          <VolunteerActivismIcon sx={{ display: { xs: 'flex', md: 'none' } }} style={{marginRight: '1rem'}}/>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            {appName}
          </Typography>

          {/* Medium-size HeaderBar */}

          <VolunteerActivismIcon sx={{ display: { xs: 'none', md: 'flex' } }} style={{marginRight: '1rem'}}/>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            {appName}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((pageObj) => (
              <NavLink key={pageObj.title} to={pageObj.href} style={{ textDecoration: 'none' }}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {pageObj.title}
                </Button>
              </NavLink>
            ))}
          </Box>

          {/* Icon Menu */}
          <Box sx={{ flexGrow: 0, display: "flex" }}>
            <Box sx={{ alignItems: "center", paddingRight: 2 }}>
              <Typography>
                Wallet address:
              </Typography>
              <Typography>
                {userAddress}
              </Typography>
            </Box>
            
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={username} src="/static/images/avatar/2.jpg" />
            </IconButton>

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              transitionDuration={0}
            >
              <Grid container style={{margin: 20, width: 500, height: 'auto'}}>
                <Grid item className="flex word-break mb-3" xs={12} style={{ marginBottom: 20 }}>
                  {/* <Typography>
                    Wallet address: {userAddress}
                  </Typography> */}
                  <Typography>
                    Username: {username}
                  </Typography>
                </Grid>
                <Grid item className="flex" xs={4}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/dashboard" style={{ textDecoration: 'none', color: 'black' }}>
                        <DashboardIcon sx={{width: 100, height: 100}} />
                        <Typography>Dashboard</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item className="flex" xs={4}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/bankAccount" style={{ textDecoration: 'none', color: 'black' }}>
                        <AccountBalanceIcon sx={{width: 100, height: 100}} />
                        <Typography>Bank Account</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item className="flex" xs={4}>
                  <Box className="text-center m-auto">
                    <Stack direction="column" spacing={2}>
                      <Link href="/fundTransfer" style={{ textDecoration: 'none', color: 'black' }}>
                        <SwapHorizontalCircleIcon sx={{width: 100, height: 100}} />
                        <Typography>Fund Tranfer</Typography>
                      </Link>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Menu>
          </Box>

        </Toolbar>
      </AppBar>
      :
      <AppBar position="sticky" style={{ background: '#2E3B55'}}>
        <Toolbar>
          <VolunteerActivismIcon sx={{ display: { xs: 'flex', md: 'none' } }} style={{marginRight: '1rem'}}/>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            {appName}
          </Typography>

          {/* Medium-size HeaderBar */}
          <VolunteerActivismIcon sx={{ display: { xs: 'none', md: 'flex' } }} style={{marginRight: '1rem'}}/>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            {appName}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
  
  export default HeaderBar;
  