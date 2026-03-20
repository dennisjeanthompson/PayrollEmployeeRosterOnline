import React, { useState } from 'react';
import { Box, Tabs, Tab, useTheme, Typography } from '@mui/material';
import MuiTimeOff from './mui-time-off';
import MuiLoans from './mui-loans';
import MuiLeaveCredits from './mui-leave-credits';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function MuiRequests() {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 2, sm: 4 }, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">Employee Requests Hub</Typography>
            <Typography variant="body2" color="text.secondary">
              Review and approve Time Off, Service Incentive Leaves (SIL), Government Loans and Leave Credits
            </Typography>
          </Box>
        </Box>
        <Tabs 
          value={tabIndex} 
          onChange={(e, v) => setTabIndex(v)} 
          aria-label="manager request tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<CalendarMonthIcon fontSize="small"/>} iconPosition="start" label="Time Off / SIL" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<AccountBalanceWalletIcon fontSize="small"/>} iconPosition="start" label="Government Loans" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<AssessmentIcon fontSize="small"/>} iconPosition="start" label="Leave Credits LEDGER" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* 
        For the tab panels, we use CSS overrides to gracefully wrap the imported pages.
        MuiTimeOff and MuiLoans have their own internal paddings and headers, 
        so we soften them slightly to make it look like a unified interface.
      */}
      <Box sx={{ 
        display: tabIndex === 0 ? 'block' : 'none', 
        '& > div': { pt: 2, minHeight: 'auto', bgcolor: 'transparent' },
        '& .MuiContainer-root': { pt: 0 },
        '& h1': { display: 'none' } // Hide duplicate header
      }}>
        <MuiTimeOff />
      </Box>
      <Box sx={{ 
        display: tabIndex === 1 ? 'block' : 'none', 
        '& > div': { pt: 2, minHeight: 'auto' },
        '& h4': { display: 'none' } // Hide duplicate header
      }}>
        <MuiLoans />
      </Box>
      <Box sx={{ 
        display: tabIndex === 2 ? 'block' : 'none', 
        '& > div': { pt: 2, minHeight: 'auto', bgcolor: 'transparent' },
        '& > div > .MuiStack-root > div:first-of-type': { display: 'none' } // Hides Leave Credits Header
      }}>
        <MuiLeaveCredits />
      </Box>
    </Box>
  );
}
