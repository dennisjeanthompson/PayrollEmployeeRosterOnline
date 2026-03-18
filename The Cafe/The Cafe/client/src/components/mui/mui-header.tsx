import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, isManager, isAdmin, useAuth } from "@/lib/auth";
import { invalidateQueries, getQueryFn } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { useTheme as useAppTheme } from "@/components/theme-provider";
import CommandPalette from "../search/CommandPalette";
import NotificationBell from "./notification-bell";

// MUI Components
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Chip,
  Badge,
  Tooltip,
  alpha,
  useTheme,
  styled,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
} from "@mui/material";

// MUI Icons
import {
  Search as SearchIcon,
  LightMode as SunIcon,
  DarkMode as MoonIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Keyboard as KeyboardIcon,
  Menu as MenuIcon,
  Store as StoreIcon,
  SwapHoriz as SwapHorizIcon,
} from "@mui/icons-material";

// Styled search component
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  backgroundColor: alpha(theme.palette.action.hover, 0.08),
  border: `1px solid rgba(255, 255, 255, 0.08)`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.12),
  },
  "&:focus-within": {
    backgroundColor: alpha(theme.palette.action.hover, 0.12),
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
  transition: "all 0.2s ease-in-out",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: theme.spacing(8),
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: 14,
    [theme.breakpoints.up("md")]: {
      width: "24ch",
      "&:focus": {
        width: "32ch",
      },
    },
  },
}));

export default function MuiHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user: currentUser, switchBranch, isAuthenticated } = useAuth();
  const canSwitchBranch = isAdmin() || isManager();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useLocation();
  const theme = useTheme();
  const { theme: appTheme, setTheme } = useAppTheme();
  const queryClient = useQueryClient();
  
  // Branch switching state
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);

  // Global search state (trigger for Command Palette)
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const shouldLoadBranches = canSwitchBranch && isAuthenticated;
  const { data: branchesData } = useQuery<{ branches?: Array<{ id: string; name: string; isActive?: boolean }> } | null>({
    queryKey: ["/api/branches"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: shouldLoadBranches,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Global keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeBranches = branchesData?.branches?.filter((b) => b.isActive !== false) || [];
  const currentBranch = branchesData?.branches?.find(
    (branch) => branch.id === currentUser?.branchId
  );
  const branchNameFromProfile = (currentUser ? (currentUser as typeof currentUser & { branchName?: string })?.branchName : undefined) ?? undefined;

  const handleBranchSwitch = useCallback(async (branchId: string) => {
    if (branchId === currentUser?.branchId || isSwitching) return;
    setIsSwitching(true);
    try {
      const success = await switchBranch(branchId);
      if (success) {
        const targetBranch = branchesData?.branches?.find((b) => b.id === branchId);
        setSwitchToast(`Switched to ${targetBranch?.name || 'branch'}`);
        // Invalidate all branch-dependent queries so every page refetches
        invalidateQueries.branchSwitch();
      } else {
        setSwitchToast('Failed to switch branch');
      }
    } finally {
      setIsSwitching(false);
    }
  }, [currentUser?.branchId, isSwitching, switchBranch, branchesData?.branches]);

  const getPageInfo = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      "/": { title: "Dashboard", subtitle: "" },
      "/schedule": { title: "Schedule", subtitle: "Manage shifts and schedules" },
      "/shift-trading": { title: "Shift Trading", subtitle: "Trade shifts with teammates" },
      "/payroll": { title: "Pay Summary", subtitle: "View your earnings" },
      "/notifications": { title: "Notifications", subtitle: "Recent updates" },
      "/employees": { title: "Employees", subtitle: "Manage team members" },
      "/payroll-management": { title: "Payroll", subtitle: "Process payroll" },
      "/deduction-settings": { title: "Deductions", subtitle: "Configure deductions" },
      "/admin/deduction-rates": { title: "Rates", subtitle: "Set deduction rates" },
      "/reports": { title: "Analytics", subtitle: "Business insights & reports" },
      "/branches": { title: "Branches", subtitle: "Manage locations" },
    };
    return titles[location] || { title: "PERO", subtitle: "Payroll System" };
  };

  const pageInfo = getPageInfo();

  const toggleTheme = () => {
    setTheme(appTheme === "dark" ? "light" : "dark");
  };

  return (
    <>
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }}>
        {/* Mobile Menu Toggle */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}
            noWrap
          >
            {pageInfo.title}
          </Typography>
          {pageInfo.subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {pageInfo.subtitle}
            </Typography>
          )}
        </Box>

        {/* Search */}
        {/* Search Trigger (Click to open Command Palette) */}
        <Search sx={{ display: { xs: "none", md: "flex" } }} onClick={() => setSearchOpen(true)}>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            inputRef={searchInputRef}
            placeholder="Search… (Ctrl+K)"
            inputProps={{ "aria-label": "search", readOnly: true }}
            onClick={() => setSearchOpen(true)}
            sx={{ cursor: 'pointer' }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: alpha(theme.palette.action.hover, 0.1),
              borderRadius: 1,
              pointerEvents: "none",
            }}
          >
            <KeyboardIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              K
            </Typography>
          </Box>
        </Search>

        {/* Branch Switcher */}
        {currentBranch && canSwitchBranch && activeBranches.length > 1 ? (
          <Tooltip title="Switch branch — all pages will update" arrow>
            <FormControl size="small" sx={{ mr: 1.5, minWidth: 140, display: { xs: "none", sm: "flex" } }}>
              <Select
                value={currentUser?.branchId || ''}
                onChange={(e) => handleBranchSwitch(e.target.value)}
                disabled={isSwitching}
                variant="outlined"
                sx={{
                  height: 32,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                  '& .MuiSelect-icon': {
                    color: 'primary.main',
                  },
                }}
                startAdornment={
                  isSwitching 
                    ? <CircularProgress size={14} sx={{ mr: 0.5 }} />
                    : <StoreIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                }
                renderValue={(value) => {
                  const branch = activeBranches.find((b) => b.id === value);
                  return branch?.name || 'Branch';
                }}
              >
                {activeBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id} sx={{ fontSize: 13 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StoreIcon sx={{ fontSize: 16, color: branch.id === currentUser?.branchId ? 'primary.main' : 'text.secondary' }} />
                      <span>{branch.name}</span>
                      {branch.id === currentUser?.branchId && (
                        <Chip label="Current" size="small" color="primary" sx={{ height: 18, fontSize: 10, ml: 0.5 }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
        ) : currentBranch || branchNameFromProfile ? (
          <Chip
            icon={<LocationIcon sx={{ fontSize: 16 }} />}
            label={currentBranch?.name || branchNameFromProfile || 'Assigned Branch'}
            size="small"
            variant="outlined"
            sx={{
              display: { xs: "none", sm: "flex" },
              mr: 1.5,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              "& .MuiChip-icon": {
                color: "primary.main",
              },
            }}
          />
        ) : null}

        {/* Branch switch toast */}
        <Snackbar
          open={!!switchToast}
          autoHideDuration={3000}
          onClose={() => setSwitchToast(null)}
          message={switchToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        {/* Date */}
        <Chip
          icon={<CalendarIcon sx={{ fontSize: 16 }} />}
          label={currentTime.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          size="small"
          variant="outlined"
          sx={{
            display: { xs: "none", lg: "flex" },
            mr: 1.5,
            borderColor: `rgba(255, 255, 255, 0.08)`,
            "& .MuiChip-icon": {
              color: "text.secondary",
            },
          }}
        />

        {/* Theme Toggle */}
        <Tooltip title={appTheme === "dark" ? "Light mode" : "Dark mode"} arrow>
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              mr: 1,
              bgcolor: alpha(theme.palette.action.hover, 0.08),
              "&:hover": {
                bgcolor: alpha(
                  appTheme === "dark"
                    ? theme.palette.warning.main
                    : theme.palette.primary.main,
                  0.15
                ),
                color: appTheme === "dark" ? "warning.main" : "primary.main",
              },
            }}
          >
            {appTheme === "dark" ? (
              <SunIcon fontSize="small" />
            ) : (
              <MoonIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Notifications - Using dedicated dropdown component */}
        <NotificationBell />
      </Toolbar>
    </AppBar>

    {/* Global Command Palette */}
    <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
