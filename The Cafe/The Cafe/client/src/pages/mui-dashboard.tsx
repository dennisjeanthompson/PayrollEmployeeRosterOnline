import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { getInitials } from "@/lib/utils";
import { StatCard, InfoCard, UserCard, EmptyState, ActionButtons } from "@/components/mui/cards";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  alpha,
  useTheme,
  Skeleton,
  Badge,
  LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import {
  AccessTime as ClockIcon,
  CalendarMonth as CalendarIcon,
  People as UsersIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowRightIcon,
  Add as PlusIcon,
  PersonAdd as UserPlusIcon,
  Receipt as FileTextIcon,
  Settings as SettingsIcon,
  NotificationsActive as BellIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  AttachMoney as DollarIcon,
  AutoAwesome as SparklesIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";

// Types
interface ShiftsResponse {
  shifts?: any[];
}

interface TimeOffResponse {
  requests?: any[];
}

interface TeamHoursResponse {
  thisWeek?: number;
  thisMonth?: number;
  weekShifts?: number;
  monthShifts?: number;
  employeeCount?: number;
}

interface ApprovalsResponse {
  approvals?: any[];
}

export default function MuiDashboard() {
  const isManagerRole = isManager();
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const theme = useTheme();

  // Enable real-time updates
  useRealtime({
    enabled: true,
    queryKeys: ["/api/approvals", "/api/time-off-requests", "/api/notifications", "/api/shifts/branch", "/api/shifts"],
    onEvent: (event: string) => {
      if (event.startsWith('time-off:') || event.startsWith('trade:') || event.startsWith('shift:') ||
          event === 'notification:created' || event === 'notification') {
        queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts/branch"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      }
    },
  });

  // Queries
  const { data: approvals, isLoading: approvalsLoading } = useQuery<ApprovalsResponse>({
    queryKey: ["/api/approvals"],
    enabled: isManagerRole,
    refetchInterval: 20000,
  });

  const { data: timeOffResponse, isLoading: timeOffLoading } = useQuery<TimeOffResponse>({
    queryKey: ["/api/time-off-requests"],
    enabled: isManagerRole,
    refetchInterval: 20000,
  });

  const { data: shifts, isLoading: shiftsLoading } = useQuery<ShiftsResponse>({
    queryKey: ["/api/shifts/branch"],
    enabled: isManagerRole,
    refetchInterval: 15000,
  });

  const { data: employeeShifts, isLoading: employeeShiftsLoading } = useQuery<ShiftsResponse>({
    queryKey: ["/api/shifts"],
    enabled: !isManagerRole,
    refetchInterval: 15000,
  });

  const { data: teamHours, isLoading: teamHoursLoading } = useQuery<TeamHoursResponse>({
    queryKey: ["/api/hours/team-summary"],
    enabled: isManagerRole,
    refetchInterval: 30000, // Keep slower polling for hours stats as they change frequently
  });

  // Filter today's shifts using Philippine timezone
  const toDateStringPHT = (d: Date) => d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
  const todayPHT = toDateStringPHT(new Date());
  const todayShifts = isManagerRole
    ? (shifts?.shifts?.filter((shift: any) => {
        return toDateStringPHT(new Date(shift.startTime)) === todayPHT;
      }) || [])
    : (employeeShifts?.shifts?.filter((shift: any) => {
        return toDateStringPHT(new Date(shift.startTime)) === todayPHT;
      }) || []);

  const pendingTimeOffRequests = (timeOffResponse?.requests || []).filter(
    (request: any) => request.status === "pending"
  );

  // Mutations
  const approveTimeOffMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${requestId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Approved", description: "Time off request approved" });
      // Invalidation handled by real-time events, but kept for immediate feedback
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectTimeOffMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${requestId}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Rejected", description: "Time off request rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: isManagerRole ? 3 : 0 }}>
      {isManagerRole ? (
        <ManagerDashboard
          currentUser={currentUser}
          teamHours={teamHours}
          teamHoursLoading={teamHoursLoading}
          todayShifts={todayShifts}
          shiftsLoading={shiftsLoading}
          pendingTimeOffRequests={pendingTimeOffRequests}
          timeOffLoading={timeOffLoading}
          approvals={approvals}
          approvalsLoading={approvalsLoading}
          approveTimeOffMutation={approveTimeOffMutation}
          rejectTimeOffMutation={rejectTimeOffMutation}
        />
      ) : (
        <EmployeeDashboard
          currentUser={currentUser}
          todayShifts={todayShifts}
          employeeShifts={employeeShifts}
          shiftsLoading={employeeShiftsLoading}
        />
      )}
    </Box>
  );
}

// Manager Dashboard Component
function ManagerDashboard({
  currentUser,
  teamHours,
  teamHoursLoading,
  todayShifts,
  shiftsLoading,
  pendingTimeOffRequests,
  timeOffLoading,
  approvals,
  approvalsLoading,
  approveTimeOffMutation,
  rejectTimeOffMutation,
}: any) {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          p: { xs: 3, lg: 4 },
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
          }}
        />

        <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" } }}>
          {/* Welcome Text */}
          <Box>
            <Chip
              size="small"
              icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", animation: "pulse 2s infinite" }} />}
              label="Online"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                mb: 2,
                "& .MuiChip-icon": { ml: 1 },
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {currentUser?.firstName || "Manager"}!
            </Typography>
            <Typography color="text.secondary">
              Here's what's happening with your team today.
            </Typography>

            {/* Date & Time */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Chip
                icon={<CalendarIcon fontSize="small" />}
                label={
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                      {format(new Date(), "EEEE")}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {format(new Date(), "MMMM d, yyyy")}
                    </Typography>
                  </Box>
                }
                sx={{
                  height: "auto",
                  py: 1,
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
              <Chip
                icon={<ClockIcon fontSize="small" sx={{ color: "secondary.main" }} />}
                label={format(new Date(), "h:mm a")}
                sx={{
                  height: 48,
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Box>

          {/* Quick Actions */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Link href="/schedule">
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  Add Shift
                </Button>
              </Link>
              <Link href="/employees">
                <Button variant="outlined" startIcon={<UserPlusIcon />}>
                  New Employee
                </Button>
              </Link>
              <Link href="/payroll-management">
                <Button
                  variant="outlined"
                  startIcon={<FileTextIcon />}
                  sx={{
                    borderColor: alpha(theme.palette.success.main, 0.5),
                    color: "success.main",
                    "&:hover": {
                      borderColor: "success.main",
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                    },
                  }}
                >
                  Run Payroll
                </Button>
              </Link>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 6, lg: 3 }}>
          {teamHoursLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Weekly Hours"
              value={teamHours?.thisWeek?.toFixed(1) || "0.0"}
              subtitle={`${teamHours?.weekShifts || 0} shifts completed`}
              icon={<ClockIcon />}
              color="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          {teamHoursLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Monthly Hours"
              value={teamHours?.thisMonth?.toFixed(1) || "0.0"}
              subtitle={`${teamHours?.monthShifts || 0} total shifts`}
              icon={<TrendingUpIcon />}
              color="warning"
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          {teamHoursLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Team Size"
              value={teamHours?.employeeCount || 0}
              subtitle="Active employees"
              icon={<UsersIcon />}
              color="info"
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          {shiftsLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Today's Shifts"
              value={todayShifts.length}
              subtitle={format(new Date(), "MMMM d")}
              icon={<CalendarIcon />}
              color="success"
            />
          )}
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <InfoCard
            title="Today's Schedule"
            subtitle={`${todayShifts.length} shifts scheduled`}
            icon={<CalendarIcon />}
            color="info"
            headerAction={
              <Link href="/schedule">
                <Button
                  size="small"
                  endIcon={<ArrowRightIcon />}
                  sx={{ color: "primary.main" }}
                >
                  View All
                </Button>
              </Link>
            }
          >
            {shiftsLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={72} />
                ))}
              </Stack>
            ) : todayShifts.length > 0 ? (
              <Stack spacing={2}>
                {todayShifts.slice(0, 5).map((shift: any) => (
                  <UserCard
                    key={shift.id}
                    name={`${shift.user?.firstName || ""} ${shift.user?.lastName || ""}`}
                    subtitle={shift.position}
                    initials={getInitials(shift.user?.firstName, shift.user?.lastName)}
                    action={
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                          {new Date(shift.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Start time
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState
                icon={<CalendarIcon />}
                title="No shifts today"
                description="Enjoy your day off!"
              />
            )}
          </InfoCard>
        </Grid>

        {/* Pending Approvals */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <InfoCard
            title="Pending Approvals"
            subtitle={`${pendingTimeOffRequests.length} requests waiting`}
            icon={<BellIcon />}
            color="warning"
          >
            {timeOffLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={80} />
                ))}
              </Stack>
            ) : pendingTimeOffRequests.length > 0 ? (
              <Stack spacing={2}>
                {pendingTimeOffRequests.slice(0, 4).map((request: any) => (
                  <Paper
                    key={request.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                      border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                            fontSize: "0.8rem",
                          }}
                        >
                          {getInitials(request.user?.firstName, request.user?.lastName)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {request.user?.firstName} {request.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.type} • {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d")}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            onClick={() => approveTimeOffMutation.mutate(request.id)}
                            disabled={approveTimeOffMutation.isPending}
                            sx={{
                              bgcolor: "success.main",
                              color: "white",
                              "&:hover": { bgcolor: "success.dark" },
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            onClick={() => rejectTimeOffMutation.mutate(request.id)}
                            disabled={rejectTimeOffMutation.isPending}
                            sx={{
                              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                              color: "error.main",
                              "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <EmptyState
                icon={<VerifiedIcon />}
                title="All caught up!"
                description="No pending requests to review"
              />
            )}
          </InfoCard>
        </Grid>
      </Grid>

      {/* Analytics Quick Access */}
      <InfoCard
        title="Analytics & Forecasting"
        subtitle="Predictive insights and labor forecasting"
        icon={<AnalyticsIcon />}
        color="secondary"
        headerAction={
          <Link href="/analytics">
            <Button size="small" endIcon={<ArrowRightIcon />} sx={{ color: "primary.main" }}>
              View Forecasts
            </Button>
          </Link>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Link href="/reports">
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <ClockIcon sx={{ color: "info.main", mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Attendance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Daily reports
                </Typography>
              </Paper>
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Link href="/reports">
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <DollarIcon sx={{ color: "success.main", mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Payroll
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Weekly breakdown
                </Typography>
              </Paper>
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Link href="/reports">
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <UsersIcon sx={{ color: "warning.main", mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Performance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Employee metrics
                </Typography>
              </Paper>
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Link href="/analytics">
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <TrendingUpIcon sx={{ color: "secondary.main", mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Forecasting
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Labor predictions
                </Typography>
              </Paper>
            </Link>
          </Grid>
        </Grid>
      </InfoCard>
    </Stack>
  );
}

// Employee Dashboard Component
function EmployeeDashboard({ currentUser, todayShifts, employeeShifts, shiftsLoading }: any) {
  const theme = useTheme();
  const [, setLocation] = useLocation();

  // Fetch current payroll period data
  const { data: payrollData } = useQuery<any>({
    queryKey: ["/api/payroll/periods/current"],
    enabled: true,
    refetchInterval: 60000,
  });

  // Fetch recent payroll history
  const { data: payrollHistory } = useQuery<any>({
    queryKey: ["/api/payroll"],
    enabled: true,
    refetchInterval: 60000,
  });

  // Calculate this week's total scheduled hours
  const thisWeekShifts = (employeeShifts?.shifts || []).filter((s: any) => {
    const d = new Date(s.startTime);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const totalHoursThisWeek = thisWeekShifts.reduce((sum: number, s: any) => {
    const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
    return sum + diffMs / 3600000;
  }, 0);

  const upcomingShifts = (employeeShifts?.shifts || [])
    .filter((s: any) => new Date(s.startTime) >= new Date())
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  // Get latest payslip
  const records = payrollHistory?.records || payrollHistory?.payroll || [];
  const latestPay = records?.[0];
  const netPay = latestPay?.netPay ?? null;
  const currentPeriod = payrollData?.period;
  const hoursWorked = payrollData?.totalHours ?? latestPay?.totalHours ?? totalHoursThisWeek;

  const quickActions = [
    {
      label: 'Schedule',
      sub: 'View shifts',
      icon: <ScheduleIcon sx={{ fontSize: 24 }} />,
      color: primaryColor,
      bgColor: alpha(primaryColor, 0.12),
      route: '/employee/schedule',
    },
    {
      label: 'Trade',
      sub: 'Swap shifts',
      icon: <SwapIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.12),
      route: '/employee/schedule',
    },
    {
      label: 'Payslips',
      sub: 'Earnings',
      icon: <DollarIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.12),
      route: '/employee/payroll',
    },
    {
      label: 'Profile',
      sub: 'My account',
      icon: <SparklesIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.12),
      route: '/employee/profile',
    },
  ];

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── GREETING + PAYROLL CARD (top of page, no overlap) ─── */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(primaryColor, 0.2)}`,
          }}
        >
          {/* Greeting header with gradient */}
          <Box
            sx={{
              background: isDark
                ? `linear-gradient(135deg, #3B1F0A 0%, #2A1608 100%)`
                : `linear-gradient(135deg, ${primaryColor} 0%, ${theme.palette.primary.dark} 100%)`,
              px: 2.5,
              pt: 2,
              pb: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', bgcolor: alpha('#fff', 0.05) }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {format(new Date(), 'EEEE, MMM d')}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                  Hi, {currentUser?.firstName || 'Employee'} 👋
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                  {currentUser?.position || currentUser?.role || 'Team Member'}
                </Typography>
              </Box>
              <Chip
                size="small"
                label="● Online"
                sx={{ bgcolor: alpha('#4ade80', 0.2), color: '#4ade80', fontWeight: 700, fontSize: '0.6rem', border: '1px solid rgba(74,222,128,0.3)' }}
              />
            </Stack>
          </Box>

          {/* Pay period label */}
          <Box sx={{ px: 2.5, pt: 1.5, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Current Pay Period
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {currentPeriod
                    ? `${format(new Date(currentPeriod.startDate), 'MMM d')} – ${format(new Date(currentPeriod.endDate), 'MMM d, yyyy')}`
                    : 'This Pay Period'}
                </Typography>
              </Box>
              <Chip size="small" label="Active" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
            </Stack>
          </Box>

          {/* Stats row */}
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
            <Box sx={{ flex: 1, textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hours</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.3 }}>
                {hoursWorked ? `${Number(hoursWorked).toFixed(0)}h` : `${totalHoursThisWeek.toFixed(0)}h`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Est. Net Pay</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1.3 }}>
                {netPay != null ? `₱${Number(netPay).toLocaleString('en-PH', { minimumFractionDigits: 0 })}` : '--'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Shifts</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'info.main', lineHeight: 1.3 }}>
                {employeeShifts?.shifts?.length || 0}
              </Typography>
            </Box>
          </Stack>

          {/* View payslip button */}
          <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setLocation('/employee/payroll')}
              size="small"
              startIcon={<DollarIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
            >
              View Payslips & History
            </Button>
          </Box>
        </Paper>
      </Box>


      {/* ── QUICK ACTIONS ────────────────────────────────── */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
          Quick Access
        </Typography>
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
            {quickActions.map((action) => (
              <Box
                key={action.label}
                onClick={() => setLocation(action.route)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2,
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.15s',
                  '&:active': { bgcolor: alpha(action.color, 0.08) },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    mb: 0.75,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1.2 }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* ── TODAY'S SHIFT ────────────────────────────────── */}
      <Box sx={{ px: 2, mt: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
          Today's Schedule
        </Typography>
        {shiftsLoading ? (
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2.5 }} />
        ) : todayShifts.length > 0 ? (
          <Stack spacing={1.5}>
            {todayShifts.map((shift: any) => (
              <Paper
                key={shift.id}
                variant="outlined"
                onClick={() => setLocation('/employee/schedule')}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  borderColor: alpha(primaryColor, 0.3),
                  bgcolor: alpha(primaryColor, 0.03),
                }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(primaryColor, 0.1), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                    TODAY
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{shift.position || 'Shift'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(shift.startTime), 'h:mm a')} – {format(new Date(shift.endTime), 'h:mm a')}
                  </Typography>
                </Box>
                <Chip size="small" label={shift.status === 'completed' ? 'Done' : 'Today'} color={shift.status === 'completed' ? 'success' : 'primary'} sx={{ fontSize: '0.6rem', height: 22, fontWeight: 700 }} />
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 2.5, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>No shifts today</Typography>
            <Typography variant="caption" color="text.disabled">Enjoy your day off! 🎉</Typography>
          </Paper>
        )}
      </Box>

      {/* ── UPCOMING SHIFTS ──────────────────────────────── */}
      {upcomingShifts.length > 0 && (
        <Box sx={{ px: 2, mt: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Upcoming Shifts
            </Typography>
            <Button size="small" endIcon={<ArrowRightIcon />} onClick={() => setLocation('/employee/schedule')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: 'primary.main', p: 0, minWidth: 0 }}>
              View All
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {upcomingShifts.map((shift: any) => (
              <Paper
                key={shift.id}
                variant="outlined"
                onClick={() => setLocation('/employee/schedule')}
                sx={{ p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:active': { bgcolor: alpha(primaryColor, 0.04) } }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(primaryColor, 0.08), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                    {format(new Date(shift.startTime), 'MMM').toUpperCase()}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1.2 }}>
                    {format(new Date(shift.startTime), 'd')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{shift.position || 'Shift'}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {format(new Date(shift.startTime), 'EEE')} · {format(new Date(shift.startTime), 'h:mm a')} – {format(new Date(shift.endTime), 'h:mm a')}
                  </Typography>
                </Box>
                <ArrowRightIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
