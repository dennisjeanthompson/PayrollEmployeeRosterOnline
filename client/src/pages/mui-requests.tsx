import React, { useState } from 'react';
import { Box, Tabs, Tab, useTheme, Typography } from '@mui/material';
import MuiTimeOff from './mui-time-off';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

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
              Review and approve Time Off requests
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
          <Tab icon={<CalendarMonthIcon fontSize="small"/>} iconPosition="start" label="Time Off" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <Box sx={{ 
        display: tabIndex === 0 ? 'block' : 'none', 
        '& > div': { pt: 2, minHeight: 'auto', bgcolor: 'transparent' },
        '& .MuiContainer-root': { pt: 0 },
        '& h1': { display: 'none' } 
      }}>
        <MuiTimeOff />
      </Box>
    </Box>
  );
}

