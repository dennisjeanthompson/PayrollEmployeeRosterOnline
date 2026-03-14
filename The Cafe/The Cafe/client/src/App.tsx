import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { Route, Switch, Redirect, useLocation } from "wouter";
import ErrorBoundary from "@/components/layout/error-boundary";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { getAuthState, setAuthState, subscribeToAuth } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// React-Toastify for modern toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme Providers
import { ThemeProvider } from "@/components/theme-provider";
import { MuiThemeProvider } from "@/components/mui/mui-theme-provider";

// MUI Components
import { Box, CircularProgress, Typography, Button, alpha } from "@mui/material";
import CoffeeIcon from "@mui/icons-material/LocalCafe";

// MUI Layout Components
import MuiSidebar from "@/components/mui/mui-sidebar";
import MuiHeader from "@/components/mui/mui-header";
import MobileLayout from "@/components/layout/mobile-layout";

// MUI-based Pages - Lazy loaded for code splitting
const MuiDashboard = lazy(() => import("@/pages/mui-dashboard"));
const MuiEmployees = lazy(() => import("@/pages/mui-employees"));
const ScheduleV2 = lazy(() => import("@/pages/schedule-v2"));
const MuiPayroll = lazy(() => import("@/pages/mui-payroll"));
const MuiNotifications = lazy(() => import("@/pages/mui-notifications"));
const MuiShiftTrading = lazy(() => import("@/pages/mui-shift-trading"));
const MuiBranches = lazy(() => import("@/pages/mui-branches"));
const MuiReports = lazy(() => import("@/pages/mui-reports"));
const MuiAnalytics = lazy(() => import("@/pages/mui-analytics"));
const MuiLogin = lazy(() => import("@/pages/mui-login"));
const MuiTimeOff = lazy(() => import("@/pages/mui-time-off"));
const MuiDeductionSettings = lazy(() => import("@/pages/mui-deduction-settings"));
const MuiPayrollManagement = lazy(() => import("@/pages/mui-payroll-management"));
const MuiAdminDeductionRates = lazy(() => import("@/pages/mui-admin-deduction-rates"));
const MuiAuditLogs = lazy(() => import("@/pages/mui-audit-logs"));
const MuiHolidayCalendar = lazy(() => import("@/pages/mui-holiday-calendar"));
const MuiComplianceDashboard = lazy(() => import("@/pages/mui-compliance-dashboard"));
const MuiProfileSettings = lazy(() => import("@/pages/mui-profile-settings"));
const MuiCompanySettings = lazy(() => import("@/pages/mui-company-settings"));

const Setup = lazy(() => import("@/pages/setup"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading Screen Component (MUI)
function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <CoffeeIcon sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <CircularProgress size={24} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    </Box>
  );
}

// Lazy-loaded route wrapper with loading fallback
function RouteLoader({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// Desktop Layout with MUI Components
function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <Box
          sx={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "33%",
            left: -240,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
            animation: "pulse 10s ease-in-out infinite 2s",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -160,
            right: "25%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.06)} 0%, transparent 70%)`,
            animation: "pulse 12s ease-in-out infinite 4s",
          }}
        />
      </Box>

      <MuiSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <MuiHeader onMenuClick={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// Admin only route guard
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = getAuthState();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || !user) {
    return <LoadingScreen />;
  }

  if (user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

// Manager/Admin route guard
function RequireManagerOrAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = getAuthState();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "manager" && user.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || !user) {
    return <LoadingScreen />;
  }

  if (user.role !== "manager" && user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

// Desktop Router (All authenticated users)
function DesktopRouter({ authState }: { authState: { isAuthenticated: boolean; user: any } }) {
  const { isAuthenticated, user } = authState;

  if (!isAuthenticated) {
    return (
      <RouteLoader>
        <MuiLogin />
      </RouteLoader>
    );
  }

  if (!user) {
    return <LoadingScreen />;
  }

  // Redirect employees to their dedicated mobile-first namespace
  if (user.role === "employee") {
    return <Redirect to="/employee/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiDashboard />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/schedule">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <ScheduleV2 />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      {/* UNIFIED SCHEDULE: Redirect old pages to new unified schedule */}
      <Route path="/shift-trading">
        <Redirect to="/schedule" />
      </Route>

      <Route path="/time-off">
        <Redirect to="/schedule" />
      </Route>

      <Route path="/payroll">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiPayroll />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/notifications">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiNotifications />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/profile">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiProfileSettings />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/settings">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiProfileSettings />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/employees">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiEmployees />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/payroll-management">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiPayrollManagement />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/reports">
        <DesktopLayout>
          <RouteLoader>
            <ErrorBoundary>
              <MuiReports />
            </ErrorBoundary>
          </RouteLoader>
        </DesktopLayout>
      </Route>

      <Route path="/analytics">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiAnalytics />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/branches">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiBranches />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/deduction-settings">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiDeductionSettings />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/company-settings">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiCompanySettings />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>

      <Route path="/admin/deduction-rates">
        <RequireAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiAdminDeductionRates />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireAdmin>
      </Route>

      <Route path="/audit-logs">
        <RequireAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiAuditLogs />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireAdmin>
      </Route>

      <Route path="/compliance">
        <RequireAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiComplianceDashboard />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireAdmin>
      </Route>

      <Route path="/holiday-calendar">
        <RequireManagerOrAdmin>
          <DesktopLayout>
            <RouteLoader>
              <ErrorBoundary>
                <MuiHolidayCalendar />
              </ErrorBoundary>
            </RouteLoader>
          </DesktopLayout>
        </RequireManagerOrAdmin>
      </Route>



      <Route>
        <DesktopLayout>
          <RouteLoader>
            <NotFound />
          </RouteLoader>
        </DesktopLayout>
      </Route>
    </Switch>
  );
}

// Mobile Router (Employee namespace)
function MobileRouter({ authState }: { authState: { isAuthenticated: boolean; user: any } }) {
  const { isAuthenticated, user } = authState;

  // Defensive redirect: if not authenticated, send user to login immediately
  // If not authenticated, show the login route (avoid premature null return)
  if (!isAuthenticated) {
    return (
      <RouteLoader>
        <MuiLogin />
      </RouteLoader>
    );
  }

  if (user?.role === "manager" || user?.role === "admin") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/employee">
        <MobileLayout>
          <RouteLoader>
            <MuiDashboard />
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route path="/employee/dashboard">
        <MobileLayout>
          <RouteLoader>
            <MuiDashboard />
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route path="/employee/schedule">
        <MobileLayout>
          <RouteLoader>
            <ErrorBoundary>
              <ScheduleV2 />
            </ErrorBoundary>
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route path="/employee/payroll">
        <MobileLayout>
          <RouteLoader>
            <MuiPayroll />
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route path="/employee/notifications">
        <MobileLayout>
          <RouteLoader>
            <MuiNotifications />
          </RouteLoader>
        </MobileLayout>
      </Route>

      {/* UNIFIED SCHEDULE: Redirect old employee pages to unified schedule */}
      <Route path="/employee/time-off">
        <Redirect to="/employee/schedule" />
      </Route>

      <Route path="/employee/shift-trading">
        <Redirect to="/employee/schedule" />
      </Route>

      <Route path="/employee/profile">
        <MobileLayout>
          <RouteLoader>
            <MuiProfileSettings />
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route path="/employee/more">
        <MobileLayout>
          <RouteLoader>
            <MuiProfileSettings />
          </RouteLoader>
        </MobileLayout>
      </Route>

      <Route>
        <Redirect to="/employee/dashboard" />
      </Route>
    </Switch>
  );
}

// Main App Component
function App() {
  const [authState, setLocalAuthState] = useState(getAuthState());
  const [isLoading, setIsLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const setupResponse = await apiRequest("GET", "/api/setup/status");
      const setupData = await setupResponse.json();
      setSetupComplete(setupData.isSetupComplete);

      if (setupData.isSetupComplete) {
        try {
          const authResponse = await apiRequest("GET", "/api/auth/status");
          const authData = await authResponse.json();
          if (authData.authenticated && authData.user) {
            setAuthState({ user: authData.user, isAuthenticated: true });
          } else {
            setAuthState({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.warn("Auth status check failed:", error);
          setAuthState({ user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error("Setup check error:", error);
      setSetupComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const unsubscribe = subscribeToAuth(setLocalAuthState);

    // Auth polling - backup to subscription (reduced to 60s from 5s for performance)
    const authPollInterval = setInterval(async () => {
      if (setupComplete) {
        try {
          // Use status endpoint which is safe for unauthenticated users
          const authResponse = await apiRequest("GET", "/api/auth/status");
          const authData = await authResponse.json();
          if (authData.authenticated && authData.user) {
            setAuthState({ user: authData.user, isAuthenticated: true });
          } else {
            setAuthState({ user: null, isAuthenticated: false });
          }
        } catch (err: any) {
          // Only treat as logged-out if the server explicitly rejected the session (401/403)
          // Network errors (offline, timeout) should not log the user out
          if (err?.status === 401 || err?.status === 403) {
            setAuthState({ user: null, isAuthenticated: false });
          }
        }
      }
    }, 60000); // 60 seconds (was 5 seconds - way too aggressive)

    return () => {
      unsubscribe();
      clearInterval(authPollInterval);
    };
  }, [checkAuth, setupComplete]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <MuiThemeProvider>
          <LoadingScreen />
        </MuiThemeProvider>
      </ThemeProvider>
    );
  }

  if (setupComplete === false) {
    return (
      <ThemeProvider>
        <MuiThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RouteLoader>
              <Setup />
            </RouteLoader>
          </QueryClientProvider>
        </MuiThemeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <MuiThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Switch>
              {/* Convenience redirect: legacy route */}
              <Route path="/employee/mobile">
                <Redirect to="/employee/dashboard" />
              </Route>

              {/* Legacy mobile paths -> new /employee/* namespace */}
              <Route path="/mobile-dashboard">
                <Redirect to="/employee/dashboard" />
              </Route>
              <Route path="/mobile-schedule">
                <Redirect to="/employee/schedule" />
              </Route>
              <Route path="/mobile-payroll">
                <Redirect to="/employee/payroll" />
              </Route>
              <Route path="/mobile-notifications">
                <Redirect to="/employee/notifications" />
              </Route>
              <Route path="/mobile-time_off">
                <Redirect to="/employee/time-off" />
              </Route>
              <Route path="/mobile-shift-trading">
                <Redirect to="/employee/shift-trading" />
              </Route>
              <Route path="/mobile-profile">
                <Redirect to="/employee/profile" />
              </Route>
              <Route path="/mobile-more">
                <Redirect to="/employee/more" />
              </Route>

              {/* Employee namespace - mount MobileRouter */}
              <Route path="/employee/:rest*">
                <MobileRouter authState={authState} />
              </Route>

              {/* Desktop root - catch all others */}
              <Route>
                <DesktopRouter authState={authState} />
              </Route>
            </Switch>
          </TooltipProvider>
        </QueryClientProvider>
      </MuiThemeProvider>
      
      {/* Global Toast Notifications - Dark Theme */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1e1e1e',
          color: '#fff',
          borderRadius: '8px',
        }}
      />
    </ThemeProvider>
  );
}

export default App;
