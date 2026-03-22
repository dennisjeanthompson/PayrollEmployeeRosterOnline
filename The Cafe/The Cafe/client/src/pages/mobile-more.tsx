import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Switch,
  Chip,
  useTheme as useMuiTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@/components/theme-provider";
import {
  CalendarMonth as CalendarIcon,
  SwapHoriz as TradeIcon,
  NotificationsOutlined as BellIcon,
  SettingsOutlined as SettingsIcon,
  DescriptionOutlined as DocsIcon,
  ChatBubbleOutlineRounded as FeedbackIcon,
  HelpOutlineRounded as HelpIcon,
  InfoOutlined as InfoIcon,
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { getCurrentUser } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { useLocation } from "wouter";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  color: string;
  badge?: string | null;
}

export default function MobileMore() {
  const currentUser = getCurrentUser();
  const [, setLocation] = useLocation();
  const { theme: mode, setTheme: setMode } = useTheme();
  const theme = useMuiTheme();

  const mainMenuItems: MenuItem[] = [
    {
      icon: <CalendarIcon />,
      label: "Employee Requests",
      description: "Manage Time Off, SIL, & Loans",
      path: "/employee/requests",
      color: theme.palette.success.main,
    },
    {
      icon: <TradeIcon />,
      label: "Shift Trading",
      description: "Swap or give away your shifts",
      path: "/employee/shift-trading",
      color: "#7C3AED",
    },
    {
      icon: <BellIcon />,
      label: "Notifications",
      description: "View all your alerts and updates",
      path: "/employee/notifications",
      color: theme.palette.warning.main,
    },
  ];

  const accountMenuItems: MenuItem[] = [
    {
      icon: <SettingsIcon />,
      label: "Profile Settings",
      description: "App preferences and account settings",
      path: "/employee/profile",
      color: theme.palette.text.secondary,
    },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <Paper
      key={item.path + index}
      elevation={0}
      onClick={() => item.path !== "#" && setLocation(item.path)}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: item.path !== "#" ? "pointer" : "default",
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover":
          item.path !== "#"
            ? {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                transform: "translateX(4px)",
              }
            : {},
        "&:active":
          item.path !== "#"
            ? { transform: "scale(0.98)" }
            : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: alpha(item.color, 0.12),
            color: item.color,
          }}
        >
          {item.icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" fontWeight={700}>
              {item.label}
            </Typography>
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {item.description}
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ color: "text.disabled", fontSize: 22 }} />
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 12,
      }}
    >
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Quick Welcome */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={currentUser?.photoUrl || undefined}
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                borderRadius: 3,
                fontSize: "1.25rem",
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {getInitials(currentUser?.firstName, currentUser?.lastName, currentUser?.username)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Hi, {currentUser?.firstName}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.position}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Appearance Section */}
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={700}
            sx={{ mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}
          >
            Appearance
          </Typography>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Dark Mode Toggle */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor:
                      mode === "dark"
                        ? alpha("#6366F1", 0.15)
                        : alpha("#F59E0B", 0.15),
                    color: mode === "dark" ? "#818CF8" : "#F59E0B",
                  }}
                >
                  {mode === "dark" ? (
                    <MoonIcon />
                  ) : (
                    <SunIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Dark Mode
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mode === "dark"
                      ? "Currently using dark theme"
                      : "Currently using light theme"}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={mode === "dark"}
                onChange={(e) =>
                  setMode(e.target.checked ? "dark" : "light")
                }
                color="primary"
              />
            </Box>

            {/* Quick Toggle Buttons */}
            <Box sx={{ p: 2, display: "flex", gap: 1.5 }}>
              <Paper
                elevation={0}
                onClick={() => setMode("light")}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2.5,
                  cursor: "pointer",
                  textAlign: "center",
                  border: "2px solid",
                  borderColor:
                    mode === "light"
                      ? "primary.main"
                      : "divider",
                  bgcolor:
                    mode === "light"
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <SunIcon
                  sx={{
                    fontSize: 22,
                    color:
                      mode === "light"
                        ? "primary.main"
                        : "text.secondary",
                    mb: 0.5,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={mode === "light" ? 700 : 500}
                  color={
                    mode === "light"
                      ? "primary.main"
                      : "text.secondary"
                  }
                >
                  Light
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                onClick={() => setMode("dark")}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2.5,
                  cursor: "pointer",
                  textAlign: "center",
                  border: "2px solid",
                  borderColor:
                    mode === "dark"
                      ? "primary.main"
                      : "divider",
                  bgcolor:
                    mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <MoonIcon
                  sx={{
                    fontSize: 22,
                    color:
                      mode === "dark"
                        ? "primary.main"
                        : "text.secondary",
                    mb: 0.5,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={mode === "dark" ? 700 : 500}
                  color={
                    mode === "dark"
                      ? "primary.main"
                      : "text.secondary"
                  }
                >
                  Dark
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>

        {/* Quick Actions Section */}
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={700}
            sx={{ mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mainMenuItems.map((item, index) => renderMenuItem(item, index))}
          </Box>
        </Box>

        {/* Account & Settings Section */}
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={700}
            sx={{ mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}
          >
            Account
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {accountMenuItems.map((item, index) =>
              renderMenuItem(item, index)
            )}
          </Box>
        </Box>

        {/* App Info */}
        <Box sx={{ textAlign: "center", pt: 2, pb: 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
          >
            The Café Management System
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 0.5 }}
          >
            Employee Portal v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
