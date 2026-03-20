import { useState, useEffect } from "react";
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton
} from "@mui/material";
import {
  HomeRounded as HomeIcon,
  EventRounded as ScheduleIcon,
  PaymentsRounded as PayrollIcon,
  PersonRounded as ProfileIcon,
  MenuRounded as MenuIcon,
  Coffee
} from "@mui/icons-material";
import { useLocation } from "wouter";
import { getCurrentUser } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import MuiSidebar from "../mui/mui-sidebar"; // Fallback sidebar for non-bottom-nav links

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const [value, setValue] = useState(0);
  const currentUser = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync bottom nav value with current route
  useEffect(() => {
    if (location.includes("/employee/dashboard")) setValue(0);
    else if (location.includes("/employee/schedule")) setValue(1);
    else if (location.includes("/employee/payroll")) setValue(2);
    else if (location.includes("/employee/profile") || location.includes("/employee/more") || location.includes("/employee/requests")) setValue(3);
  }, [location]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default", overflow: "hidden" }}>
      
      {/* Top App Bar for Mobile */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: "background.paper", 
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Coffee sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              PERO
            </Typography>
          </Box>
          <IconButton onClick={() => setLocation("/employee/profile")} sx={{ p: 0.5 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: "primary.main", 
                fontSize: "0.875rem",
                fontWeight: 600
              }}
            >
              {getInitials(currentUser?.firstName, currentUser?.lastName)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Scrollable Content */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1, 
          overflowY: "auto", 
          overflowX: "hidden",
          pb: "70px", // Padding for bottom nav
          // Use smooth momentum scrolling on iOS
          WebkitOverflowScrolling: "touch"
        }}
      >
        {children}
      </Box>

      {/* Fixed Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: '1px solid',
          borderColor: 'divider',
          pb: "env(safe-area-inset-bottom)", // Handle iPhone notch/home bar
        }} 
        elevation={8}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            switch(newValue) {
              case 0: setLocation("/employee/dashboard"); break;
              case 1: setLocation("/employee/schedule"); break;
              case 2: setLocation("/employee/payroll"); break;
              case 3: setLocation("/employee/more"); break;
            }
          }}
          sx={{
            height: 65,
            bgcolor: "background.paper",
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              padding: "6px 0",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main"
              }
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.7rem",
              fontWeight: 500,
              mt: 0.5,
              "&.Mui-selected": {
                fontSize: "0.75rem",
                fontWeight: 600
              }
            }
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Schedule" icon={<ScheduleIcon />} />
          <BottomNavigationAction label="Payslips" icon={<PayrollIcon />} />
          <BottomNavigationAction label="More" icon={<MenuIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
