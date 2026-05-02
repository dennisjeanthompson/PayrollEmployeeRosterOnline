import { a0 as useTheme, r as reactExports, $ as useLocation, Q as jsxRuntimeExports, X as Box, dh as Container, br as Grid, ag as alpha, aj as Typography, aJ as Stack, di as CheckCircleOutline, bt as Card, bu as CardContent, bE as Alert, aK as Button, dj as AdminPanelSettings, dk as SupervisorAccount, c7 as PersonIcon, bA as TextField, b_ as InputAdornment, af as IconButton, bX as VisibilityOff, bV as Visibility, aM as CircularProgress, bo as ArrowForward } from './vendor-5dgU3tca.js';
import { L as Logo, c as apiRequest, s as setAuthState } from './main-2BvCZ7pP.js';
import { u as useToast } from './use-toast-DLYGmyYZ.js';

function MuiLogin() {
  const theme = useTheme();
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: "Invalid credentials" };
        }
        throw new Error(errorData.message || "Login failed");
      }
      const data = await response.json();
      setAuthState({ user: data.user, isAuthenticated: true });
      if (data.user?.role === "admin" || data.user?.role === "manager") {
        reactExports.startTransition(() => setLocation("/"));
      } else {
        reactExports.startTransition(() => setLocation("/employee/dashboard"));
      }
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.firstName} ${data.user.lastName}`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDemoLogin = (usernameStr, passwordStr) => {
    setUsername(usernameStr);
    setPassword(passwordStr);
    reactExports.startTransition(() => {
      setIsLoading(true);
      setError(null);
      apiRequest("POST", "/api/auth/login", {
        username: usernameStr,
        password: passwordStr
      }).then(async (response) => {
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: "Invalid credentials" };
          }
          throw new Error(errorData.message || "Login failed");
        }
        return response.json();
      }).then((data) => {
        setAuthState({ user: data.user, isAuthenticated: true });
        if (data.user?.role === "admin" || data.user?.role === "manager") {
          setLocation("/");
        } else {
          setLocation("/employee/dashboard");
        }
        toast({
          title: "Demo Login Success",
          description: `Logged in as ${data.user.firstName} ${data.user.lastName}`
        });
      }).catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive"
        });
      }).finally(() => {
        setIsLoading(false);
      });
    });
  };
  const features = [
    {
      title: "Easy Scheduling",
      description: "Visual calendar-based shift scheduling for your whole team",
      color: theme.palette.success.main
    },
    {
      title: "Automated Payroll",
      description: "Philippine statutory deductions calculated automatically",
      color: theme.palette.info.main
    },
    {
      title: "Mobile Ready",
      description: "Employees can access schedules and payslips on any device",
      color: theme.palette.secondary.main
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Box,
    {
      sx: {
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 6, alignItems: "center", justifyContent: "center", sx: { minHeight: "100vh" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, sx: { display: { xs: "none", md: "block" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 50%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 6,
              borderRadius: 4,
              minHeight: 400
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    position: "absolute",
                    top: "25%",
                    left: "25%",
                    width: 256,
                    height: 256,
                    background: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: "50%",
                    filter: "blur(80px)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    position: "absolute",
                    bottom: "25%",
                    right: "25%",
                    width: 320,
                    height: 320,
                    background: alpha(theme.palette.secondary.main, 0.1),
                    borderRadius: "50%",
                    filter: "blur(80px)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", zIndex: 10 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 40 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 700, color: "text.primary", gutterBottom: true, children: "PERO" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Smart Payroll & Employee Management" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 3, sx: { mt: 6 }, children: features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", gap: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Box,
                    {
                      sx: {
                        width: 40,
                        height: 40,
                        borderRadius: 3,
                        bgcolor: alpha(feature.color, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutline, { sx: { color: feature.color, fontSize: 20 } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, color: "text.primary", children: feature.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: feature.description })
                  ] })
                ] }, index)) })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 8, md: 5, lg: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                display: { xs: "flex", lg: "none" },
                flexDirection: "column",
                alignItems: "center",
                mb: 4
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 40 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, color: "text.primary", children: "PERO" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Smart Payroll System" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              elevation: 0,
              sx: {
                borderRadius: 4,
                boxShadow: `0 4px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(20px)"
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, color: "text.primary", gutterBottom: true, children: "Welcome back" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Sign in to your account" })
                ] }),
                error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3, borderRadius: 2 }, children: error }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", sx: { display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Quick Login Demo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 1.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        onClick: () => handleDemoLogin("admin", "password123"),
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettings, {}),
                        sx: {
                          flex: 1,
                          minWidth: "100px",
                          borderRadius: 2,
                          textTransform: "none",
                          color: theme.palette.primary.main,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        },
                        children: "Admin"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        onClick: () => handleDemoLogin("jose", "password123"),
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SupervisorAccount, {}),
                        sx: {
                          flex: 1,
                          minWidth: "100px",
                          borderRadius: 2,
                          textTransform: "none",
                          color: theme.palette.info.main,
                          borderColor: alpha(theme.palette.info.main, 0.3),
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          "&:hover": {
                            borderColor: theme.palette.info.main,
                            bgcolor: alpha(theme.palette.info.main, 0.1)
                          }
                        },
                        children: "Manager"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        onClick: () => handleDemoLogin("beatriz", "password123"),
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}),
                        sx: {
                          flex: 1,
                          minWidth: "100px",
                          borderRadius: 2,
                          textTransform: "none",
                          color: theme.palette.secondary.main,
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          bgcolor: alpha(theme.palette.secondary.main, 0.05),
                          "&:hover": {
                            borderColor: theme.palette.secondary.main,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1)
                          }
                        },
                        children: "Employee"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", my: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: "50%", left: 0, right: 0, borderTop: `1px solid ${theme.palette.divider}` } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { position: "relative", display: "inline-block", bgcolor: "background.paper", px: 2, left: "50%", transform: "translateX(-50%)", color: "text.secondary" }, children: "or sign in with your account" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    {
                      fullWidth: true,
                      label: "Username",
                      value: username,
                      onChange: (e) => setUsername(e.target.value),
                      placeholder: "Enter your username",
                      required: true,
                      variant: "outlined",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.action.hover, 0.7)
                          },
                          "&.Mui-focused": {
                            bgcolor: "transparent"
                          }
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    {
                      fullWidth: true,
                      label: "Password",
                      type: showPassword ? "text" : "password",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      placeholder: "Enter your password",
                      required: true,
                      variant: "outlined",
                      slotProps: {
                        input: {
                          endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            IconButton,
                            {
                              onClick: () => setShowPassword(!showPassword),
                              edge: "end",
                              size: "small",
                              children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                            }
                          ) })
                        }
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.action.hover, 0.7)
                          },
                          "&.Mui-focused": {
                            bgcolor: "transparent"
                          }
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "submit",
                      fullWidth: true,
                      variant: "contained",
                      size: "large",
                      disabled: isLoading,
                      endIcon: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
                      sx: {
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "1rem",
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                        },
                        transition: "all 0.2s ease"
                      },
                      children: isLoading ? "Signing in..." : "Sign In"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Typography,
                  {
                    variant: "caption",
                    color: "text.secondary",
                    sx: { display: "block", textAlign: "center", mt: 4 },
                    children: "Protected by enterprise-grade security"
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "caption",
              color: "text.secondary",
              sx: { display: "block", textAlign: "center", mt: 3 },
              children: "© 2026 PERO Payroll System. All rights reserved."
            }
          )
        ] }) })
      ] }) })
    }
  );
}

export { MuiLogin as default };
