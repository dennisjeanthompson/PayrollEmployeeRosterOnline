import PesoIcon from "@/components/PesoIcon";
import { useLocation } from "wouter";
import { useAuth, isManager, isAdmin, setAuthState } from "@/lib/auth";
import { getInitials, capitalizeFirstLetter } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import React, { useState, useEffect, startTransition, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// MUI Components
import {
  Box,

  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Tooltip,
  Chip,
  Badge,
  alpha,
  useTheme,
  Collapse,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";

import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CoffeeIcon from '@mui/icons-material/LocalCafe';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ProfileIcon from '@mui/icons-material/ManageAccounts';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletIcon';
import AssignmentIcon from '@mui/icons-material/Assignment';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: DashboardIcon, roles: ["employee", "manager", "admin"] },
  { name: "Schedule", href: "/schedule", icon: CalendarIcon, roles: ["employee", "manager"] },
  { name: "Pay Summary", href: "/payroll", icon: PesoIcon, roles: ["employee", "manager"] },
  { name: "Notifications", href: "/notifications", icon: NotificationsIcon, roles: ["employee", "manager", "admin"], badge: true },
];

const managementNavigation: NavItem[] = [
  { name: "Employees", href: "/employees", icon: PeopleIcon, roles: ["manager", "admin"] },
  { name: "Payroll", href: "/payroll-management", icon: PesoIcon, roles: ["manager", "admin"] },
  { name: "Holidays", href: "/holiday-calendar", icon: CalendarIcon, roles: ["manager", "admin"] },
  { name: "Employee Requests", href: "/requests", icon: AssignmentIcon, roles: ["manager"] },
  { name: "Forecasting", href: "/analytics", icon: TrendingUpIcon, roles: ["manager", "admin"] },
  { name: "Branches", href: "/branches", icon: StoreIcon, roles: ["admin"] },
];

const settingsNavigation: NavItem[] = [
  { name: "Company Settings", href: "/company-settings", icon: BusinessIcon, roles: ["manager", "admin"] },
  { name: "Profile Settings", href: "/profile", icon: ProfileIcon, roles: ["employee", "manager"] },
  { name: "Compliance", href: "/compliance", icon: VerifiedIcon, roles: ["admin"] },
  { name: "Deductions", href: "/deduction-settings", icon: SettingsIcon, roles: ["manager", "admin"] },
  { name: "13th Month Pay", href: "/13th-month", icon: PesoIcon, roles: ["manager", "admin"] },
  { name: "Deduction Rates", href: "/admin/deduction-rates", icon: SettingsIcon, roles: ["admin"] },
  { name: "Audit Logs", href: "/audit-logs", icon: HistoryIcon, roles: ["admin"] },
  { name: "Export Reports", href: "/reports", icon: DownloadIcon, roles: ["manager", "admin"] },
];

interface MuiSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function MuiSidebar({ mobileOpen = false, onMobileClose }: MuiSidebarProps) {
  const [location, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Reset collapse state on mobile (always expanded in drawer)
  useEffect(() => {
    if (!isDesktop && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isDesktop, isCollapsed]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({ user: null, isAuthenticated: false });
      window.location.replace("/login");
    }
  };

  // Unread notification count — drives the badge on the Notifications nav item
  const { data: notifData } = useQuery<{ notifications: { isRead: boolean }[] }>({
    queryKey: ['/api/notifications'],
    queryFn: async () => { const r = await apiRequest('GET', '/api/notifications'); return r.json(); },
    enabled: !!currentUser,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const { data: dashboardData } = useQuery<{ alerts: string[] }>({
    queryKey: ['/api/dashboard/admin'],
    queryFn: async () => { const r = await apiRequest('GET', '/api/dashboard/admin'); return r.json(); },
    enabled: currentUser?.role === 'admin',
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const unreadCount = useMemo(() => {
    const unreadNotifs = notifData?.notifications?.filter(n => !n.isRead).length ?? 0;
    const alertCount = currentUser?.role === 'admin' ? (dashboardData?.alerts?.length ?? 0) : 0;
    return unreadNotifs + alertCount;
  }, [notifData, dashboardData, currentUser?.role]);

  const filterByRole = (items: NavItem[]) =>
    items.filter((item) => item.roles.includes(currentUser?.role || "employee"));

  const mainNavItems = filterByRole(navigation);
  const managementNavItems = filterByRole(managementNavigation);
  const settingsNavItems = filterByRole(settingsNavigation);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "secondary";
      case "manager":
        return "info";
      default:
        return "success";
    }
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    const showBadge = item.badge && unreadCount > 0;

    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <Tooltip title={isCollapsed ? item.name : ""} placement="right" arrow>
          <ListItemButton
            selected={isActive}
            onClick={(e) => {
              e.preventDefault();
              if (onMobileClose) onMobileClose();
              startTransition(() => {
                setLocation(item.href);
              });
            }}
            sx={{
              borderRadius: 3,
              mx: 1,
              minHeight: 48,
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 2 : 2.5,
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                },
              },
              "&:hover": {
                background: alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 0 : 40,
                mr: isCollapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              {showBadge ? (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={99}
                  sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 16, height: 16, animation: "pulse 2s infinite" } }}
                >
                  <Icon sx={{ color: isActive ? "primary.main" : "text.secondary", fontSize: 22 }} />
                </Badge>
              ) : (
                <Icon sx={{ color: isActive ? "primary.main" : "text.secondary", fontSize: 22 }} />
              )}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "primary.main" : "text.primary",
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
    if (items.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {!isCollapsed && (
          <Typography
            variant="overline"
            sx={{
              px: 3,
              mb: 1,
              display: "block",
              color: "text.secondary",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            {title}
          </Typography>
        )}
        <List disablePadding>
          {items.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </List>
      </Box>
    );
  };

  const drawerContent = (
    <>
      {/* Collapse Toggle Button */}
      {isDesktop && ( // Only show collapse button on desktop
        <IconButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="small"
          sx={{
            position: "absolute",
            right: -12,
            top: 72,
            zIndex: theme.zIndex.drawer + 2,
            width: 24,
            height: 24,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.primary.main}`,
            color: "primary.main",
            boxShadow: 3,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon sx={{ fontSize: 14 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      )}

      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          height: 70,
          borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
          bgcolor: isCollapsed ? "transparent" : alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: isCollapsed ? "auto" : "100%",
          }}
        >
          <Logo size={isCollapsed ? 28 : 34} />
          {!isCollapsed && (
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                PERO
                <SparklesIcon
                  sx={{
                    fontSize: 14,
                    color: "primary.main",
                    animation: "pulse 2s infinite",
                  }}
                />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Payroll System
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          py: 2,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `rgba(255, 255, 255, 0.05)`,
            borderRadius: 2,
          },
        }}
      >
        <NavSection title="Main Menu" items={mainNavItems} />
        <NavSection title="Management" items={managementNavItems} />
        <NavSection title="Settings" items={settingsNavItems} />
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid rgba(255, 255, 255, 0.08)`,
          bgcolor: `rgba(255, 255, 255, 0.02)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={currentUser?.photoUrl ?? undefined}
            sx={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {currentUser && getInitials(currentUser.firstName, currentUser.lastName)}
          </Avatar>
          {!isCollapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                  noWrap
                >
                  {(currentUser?.firstName || currentUser?.lastName) 
                    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                    : currentUser?.username || 'User'}
                </Typography>
                <Chip
                  label={capitalizeFirstLetter(currentUser?.role || "employee")}
                  size="small"
                  color={getRoleColor(currentUser?.role || "employee") as any}
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                />
              </Box>
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={handleLogout}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "error.main",
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </>
  );

  // Mobile Drawer (Swipeable)
  if (!isDesktop) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose || (() => {})}
        onOpen={() => {}}
        ModalProps={{ keepMounted: false }} // Disabled to fix ghost backdrop bug on hydration
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: `1px solid rgba(255, 255, 255, 0.08)`,
            background: `rgba(20, 20, 20, 0.95)`,
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  // Desktop Drawer (Permanent)
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        transition: "width 0.3s ease-in-out",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: `1px solid rgba(255, 255, 255, 0.08)`,
          background: `rgba(0, 0, 0, 0.4)`,
          backdropFilter: "blur(20px)",
          transition: "width 0.3s ease-in-out",
          overflow: "visible", // Allow toggle button to hang off edge
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
