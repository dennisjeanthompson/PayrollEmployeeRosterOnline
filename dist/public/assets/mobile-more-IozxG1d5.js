import { $ as useLocation, a0 as useTheme$1, Q as jsxRuntimeExports, a3 as CalendarIcon, aD as TradeIcon, dS as BellIcon, dT as SettingsIcon, X as Box, b7 as Paper, ag as alpha, al as Avatar, aj as Typography, dU as MoonIcon, dV as SunIcon, c3 as Switch, r as reactExports, am as Chip, ah as ChevronRightIcon } from './vendor-5dgU3tca.js';
import { g as getCurrentUser, k as useTheme, b as getInitials } from './main-2BvCZ7pP.js';

function MobileMore() {
  const currentUser = getCurrentUser();
  const [, setLocation] = useLocation();
  const { theme: mode, setTheme: setMode } = useTheme();
  const theme = useTheme$1();
  const mainMenuItems = [
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, {}),
      label: "Employee Requests",
      description: "Manage Time Off & Loans",
      path: "/employee/requests",
      color: theme.palette.success.main
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, {}),
      label: "Shift Trading",
      description: "Swap or give away your shifts",
      path: "/employee/shift-trading",
      color: "#7C3AED"
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, {}),
      label: "Notifications",
      description: "View all your alerts and updates",
      path: "/employee/notifications",
      color: theme.palette.warning.main
    }
  ];
  const accountMenuItems = [
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}),
      label: "Profile Settings",
      description: "App preferences and account settings",
      path: "/employee/profile",
      color: theme.palette.text.secondary
    }
  ];
  const renderMenuItem = (item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Paper,
    {
      elevation: 0,
      onClick: () => item.path !== "#" && reactExports.startTransition(() => setLocation(item.path)),
      sx: {
        p: 2,
        borderRadius: 3,
        cursor: item.path !== "#" ? "pointer" : "default",
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": item.path !== "#" ? {
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          transform: "translateX(4px)"
        } : {},
        "&:active": item.path !== "#" ? { transform: "scale(0.98)" } : {}
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Avatar,
          {
            sx: {
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: alpha(item.color, 0.12),
              color: item.color
            },
            children: item.icon
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", fontWeight: 700, children: item.label }),
            item.badge && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: item.badge,
                size: "small",
                color: "error",
                sx: { height: 20, fontSize: "0.7rem", fontWeight: 700 }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "body2",
              color: "text.secondary",
              noWrap: true,
              children: item.description
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, { sx: { color: "text.disabled", fontSize: 22 } })
      ] })
    },
    item.path + index
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Box,
    {
      sx: {
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 12
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2.5, display: "flex", flexDirection: "column", gap: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Paper,
          {
            elevation: 0,
            sx: {
              p: 2.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.15)
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Avatar,
                {
                  src: currentUser?.photoUrl || void 0,
                  sx: {
                    width: 56,
                    height: 56,
                    bgcolor: "primary.main",
                    borderRadius: 3,
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  children: getInitials(currentUser?.firstName, currentUser?.lastName, currentUser?.username)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, children: [
                  "Hi, ",
                  currentUser?.firstName,
                  "!"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: currentUser?.position })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "subtitle2",
              color: "text.secondary",
              fontWeight: 700,
              sx: { mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" },
              children: "Appearance"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: 0,
              sx: {
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Box,
                  {
                    sx: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Avatar,
                          {
                            sx: {
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              bgcolor: mode === "dark" ? alpha("#6366F1", 0.15) : alpha("#F59E0B", 0.15),
                              color: mode === "dark" ? "#818CF8" : "#F59E0B"
                            },
                            children: mode === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MoonIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(SunIcon, {})
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", fontWeight: 600, children: "Dark Mode" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: mode === "dark" ? "Currently using dark theme" : "Currently using light theme" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Switch,
                        {
                          checked: mode === "dark",
                          onChange: (e) => setMode(e.target.checked ? "dark" : "light"),
                          color: "primary"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, display: "flex", gap: 1.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Paper,
                    {
                      elevation: 0,
                      onClick: () => setMode("light"),
                      sx: {
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: "pointer",
                        textAlign: "center",
                        border: "2px solid",
                        borderColor: mode === "light" ? "primary.main" : "divider",
                        bgcolor: mode === "light" ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                        transition: "all 0.2s"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SunIcon,
                          {
                            sx: {
                              fontSize: 22,
                              color: mode === "light" ? "primary.main" : "text.secondary",
                              mb: 0.5
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Typography,
                          {
                            variant: "body2",
                            fontWeight: mode === "light" ? 700 : 500,
                            color: mode === "light" ? "primary.main" : "text.secondary",
                            children: "Light"
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Paper,
                    {
                      elevation: 0,
                      onClick: () => setMode("dark"),
                      sx: {
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: "pointer",
                        textAlign: "center",
                        border: "2px solid",
                        borderColor: mode === "dark" ? "primary.main" : "divider",
                        bgcolor: mode === "dark" ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                        transition: "all 0.2s"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          MoonIcon,
                          {
                            sx: {
                              fontSize: 22,
                              color: mode === "dark" ? "primary.main" : "text.secondary",
                              mb: 0.5
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Typography,
                          {
                            variant: "body2",
                            fontWeight: mode === "dark" ? 700 : 500,
                            color: mode === "dark" ? "primary.main" : "text.secondary",
                            children: "Dark"
                          }
                        )
                      ]
                    }
                  )
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "subtitle2",
              color: "text.secondary",
              fontWeight: 700,
              sx: { mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" },
              children: "Quick Actions"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: mainMenuItems.map((item, index) => renderMenuItem(item, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "subtitle2",
              color: "text.secondary",
              fontWeight: 700,
              sx: { mb: 1.5, px: 0.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" },
              children: "Account"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: accountMenuItems.map(
            (item, index) => renderMenuItem(item, index)
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", pt: 2, pb: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "body2",
              color: "text.secondary",
              fontWeight: 600,
              children: "The Café Management System"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "caption",
              color: "text.disabled",
              sx: { display: "block", mt: 0.5 },
              children: "Employee Portal v1.0.0"
            }
          )
        ] })
      ] })
    }
  );
}

export { MobileMore as default };
