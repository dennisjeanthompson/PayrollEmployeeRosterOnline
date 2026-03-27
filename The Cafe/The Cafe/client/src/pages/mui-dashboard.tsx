import PesoIcon from "@/components/PesoIcon";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, isAdmin, getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { getInitials } from "@/lib/utils";
import { StatCard, InfoCard, UserCard, EmptyState, ActionButtons } from "@/components/mui/cards";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  const isAdminRole = isAdmin();
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
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats/manager"],
    enabled: isManagerRole,
  });

  const { data: employeeShifts, isLoading: employeeShiftsLoading } = useQuery<ShiftsResponse>({
    queryKey: ["/api/shifts"],
    enabled: !isManagerRole,
  });

  const approvals = dashboardStats ? { approvals: dashboardStats.approvals || [] } : undefined;
  const timeOffResponse = dashboardStats ? { requests: dashboardStats.timeOffRequests || [] } : undefined;
  const shifts = dashboardStats ? { shifts: dashboardStats.shifts || [] } : undefined;
  const teamHours = dashboardStats?.teamHours || {};
  
  const shiftsLoading = isManagerRole ? statsLoading : employeeShiftsLoading;
  const timeOffLoading = isManagerRole ? statsLoading : false;
  const approvalsLoading = isManagerRole ? statsLoading : false;
  const teamHoursLoading = isManagerRole ? statsLoading : false;

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
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectTimeOffMutation = useMutation({
    mutationFn: async ({ requestId, rejectionReason }: { requestId: string; rejectionReason?: string }) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${requestId}/reject`, {
        status: "rejected",
        rejectionReason,
      });
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
      {isAdminRole ? (
        <AdminDashboard currentUser={currentUser} teamHours={teamHours} teamHoursLoading={teamHoursLoading} todayShifts={todayShifts} shiftsLoading={shiftsLoading} />
      ) : isManagerRole ? (
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

// Admin Dashboard Component
import MuiBranches from "./mui-branches";

function AdminDashboard({ currentUser }: any) {
  const theme = useTheme();
  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: "none" }}>
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              size="small"
              icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
              label="System Administrator"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.02em" }}>
            Welcome, {currentUser?.firstName || "Admin"}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1rem", maxWidth: 800, mb: 3 }}>
            As a System Administrator, you have bird's-eye access to all locations. Use the branch switcher in the top navigation menu to view data for specific branches, or access reports below.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link href="/reports">
              <Button
                variant="outlined"
                color="success"
                startIcon={<AnalyticsIcon />}
                sx={{ px: 3, py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Payroll Analytics
              </Button>
            </Link>
          </Stack>
        </Box>
      </Paper>

      {/* Embedded Branches Management */}
      <Box sx={{ mt: 2 }}>
        <MuiBranches isEmbedded={true} />
      </Box>
    </Stack>
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
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectingRequest, setRejectingRequest] = React.useState<any>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  // Extract recently rejected time-off requests from approvals history 
  // to display rejection reasons if applicable.
  const recentlyHandledApprovals = approvals?.approvals?.filter((a: any) => a.status === 'rejected' || a.status === 'approved')?.slice(0, 5) || [];

  return (
    <Stack spacing={4} sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          p: { xs: 3, lg: 4 },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" } }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Chip
                size="small"
                icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", animation: "pulse 2s infinite" }} />}
                label="Active Session"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  fontWeight: 600,
                  "& .MuiChip-icon": { ml: 1 },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }}>
              Welcome, {currentUser?.firstName || "Manager"}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "1.1rem" }}>
              Here's a quick overview of your team's schedule and tasks today.
            </Typography>
          </Box>

          {/* Quick Actions Array - More prominent and integrated */}
          <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, lg: 0 } }}>
            <Link href="/schedule">
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                sx={{
                  bgcolor: "primary.main",
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": { transform: "translateY(-1px)", boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.35)}` },
                }}
              >
                Add Shift
              </Button>
            </Link>
            <Link href="/payroll-management">
              <Button
                variant="outlined"
                startIcon={<FileTextIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                }}
              >
                Payroll
              </Button>
            </Link>
          </Stack>
        </Box>
        
        {/* Decorative Gradients */}
        <Box sx={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%)`, zIndex: 0 }} />
      </Paper>

      {/* Stats Grid - Unified Look */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <StatCard
              title="Today's Shifts"
              value={todayShifts.length}
              subtitle={format(new Date(), "PP")}
              icon={<CalendarIcon />}
              color="success"
              sx={{ height: '100%' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <StatCard
              title="Weekly Hours"
              value={teamHours?.thisWeek?.toFixed(1) || "0.0"}
              subtitle={`${teamHours?.weekShifts || 0} shifts completed`}
              icon={<ClockIcon />}
              color="primary"
              sx={{ height: '100%' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <StatCard
              title="Monthly Hours"
              value={teamHours?.thisMonth?.toFixed(1) || "0.0"}
              subtitle={`${teamHours?.monthShifts || 0} total shifts`}
              icon={<TrendingUpIcon />}
              color="secondary"
              sx={{ height: '100%' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <StatCard
              title="Team Members"
              value={teamHours?.employeeCount || 0}
              subtitle="Active staff"
              icon={<UsersIcon />}
              color="info"
              sx={{ height: '100%' }}
            />
          )}
        </Grid>
      </Grid>

      {/* Main Content Grid - Reduced whitespace, higher contrast cards */}
      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'background.paper', boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" /> Today's Roster
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todayShifts.length} employees scheduled
                  </Typography>
                </Box>
                <Link href="/schedule">
                  <Button size="small" endIcon={<ArrowRightIcon />} sx={{ fontWeight: 600 }}>Manage</Button>
                </Link>
              </Box>

              {shiftsLoading ? (
                <Stack spacing={2}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: 2 }} />)}</Stack>
              ) : todayShifts.length > 0 ? (
                <Stack spacing={1.5}>
                  {todayShifts.slice(0, 5).map((shift: any) => (
                    <Box
                      key={shift.id}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        p: 2, borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={shift.user?.photoUrl || undefined} sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 600 }}>
                          {getInitials(shift.user?.firstName, shift.user?.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {shift.user?.firstName} {shift.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 12 }} /> {shift.position}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary' }}>
                          {new Date(shift.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Start Time</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <EmptyState icon={<CalendarIcon sx={{ fontSize: 48, opacity: 0.5 }} />} title="No shifts scheduled" description="Your team has the day off." />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals & Recent Activity */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'background.paper', boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BellIcon color="warning" /> Approvals & Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pendingTimeOffRequests.length} pending requests
                  </Typography>
                </Box>
                <Link href="/time-off">
                  <Button size="small" color="warning" endIcon={<ArrowRightIcon />} sx={{ fontWeight: 600 }}>View All</Button>
                </Link>
              </Box>

              {timeOffLoading ? (
                <Stack spacing={2}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />)}</Stack>
              ) : pendingTimeOffRequests.length > 0 || recentlyHandledApprovals.length > 0 ? (
                <Stack spacing={2}>
                  
                  {/* PENDING REQUESTS */}
                  {pendingTimeOffRequests.slice(0, 3).map((request: any) => (
                    <Box
                      key={request.id}
                      sx={{
                        p: 2, borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: 'warning.main', fontWeight: 700 }}>
                          {getInitials(request.user?.firstName, request.user?.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {request.user?.firstName} {request.user?.lastName}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip size="small" label={request.type?.replace('_', ' ')} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize' }} />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d")}
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Approve">
                          <IconButton size="small" onClick={() => approveTimeOffMutation.mutate(request.id)} disabled={approveTimeOffMutation.isPending} sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main", "&:hover": { bgcolor: "success.main", color: "white" } }}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" onClick={() => { setRejectingRequest(request); setRejectionReason(''); setRejectDialogOpen(true); }} disabled={rejectTimeOffMutation.isPending} sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", "&:hover": { bgcolor: "error.main", color: "white" } }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  ))}

                  {/* RECENTLY HANDLED REQUESTS (to show Rejection Reasons) */}
                  {pendingTimeOffRequests.length < 3 && recentlyHandledApprovals.map((approval: any) => {
                    const isRejected = approval.status === 'rejected';
                    const color = isRejected ? theme.palette.error : theme.palette.success;
                    return (
                      <Box
                        key={approval.id}
                        sx={{
                          p: 1.5, borderRadius: 2,
                          bgcolor: alpha(color.main, 0.03),
                          border: `1px solid ${alpha(color.main, 0.1)}`,
                        }}
                      >
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {approval.requestedBy?.firstName} {approval.requestedBy?.lastName}
                            </Typography>
                            <Chip size="small" label={approval.status} color={isRejected ? "error" : "success"} variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize' }} />
                         </Box>
                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {approval.type?.replace('_', ' ')} request {isRejected ? 'rejected' : 'approved'}.
                         </Typography>
                         {/* Display Rejection Reason if available */}
                         {isRejected && approval.reason && (
                           <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 1, bgcolor: alpha(theme.palette.error.main, 0.08), borderRadius: 1, color: theme.palette.error.main, fontStyle: 'italic' }}>
                             Reason: {approval.reason}
                           </Typography>
                         )}
                      </Box>
                    );
                  })}
                  
                </Stack>
              ) : (
                <EmptyState icon={<VerifiedIcon color="success" sx={{ fontSize: 48, opacity: 0.5 }} />} title="All caught up!" description="No pending requests." />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main', pb: 1 }}>Reject Time-Off Request</DialogTitle>
        <DialogContent>
          {rejectingRequest && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Rejecting <strong>{rejectingRequest.user?.firstName}</strong>'s request. Optionally provide a reason so they know why.
            </Typography>
          )}
          <TextField
            autoFocus fullWidth multiline rows={3}
            label="Rejection Reason"
            placeholder="e.g. Insufficient staffing coverage on this date."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            inputProps={{ maxLength: 300 }}
            helperText={`${rejectionReason.length}/300`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => {
              if (rejectingRequest) rejectTimeOffMutation.mutate({ requestId: rejectingRequest.id, rejectionReason: rejectionReason.trim() || undefined });
              setRejectDialogOpen(false); setRejectingRequest(null); setRejectionReason('');
            }}
            variant="contained" color="error" disabled={rejectTimeOffMutation.isPending} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
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
  });

  // Fetch recent payroll history
  const { data: payrollHistory } = useQuery<any>({
    queryKey: ["/api/payroll"],
    enabled: true,
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

  // Get latest payslip and current period estimates
  const records = payrollHistory?.entries || payrollHistory?.records || payrollHistory?.payroll || [];
  const latestPay = records?.[0];
  const currentPeriod = payrollData?.period;
  
  // Hours worked this period. Fallback to this week\'s scheduled hours.
  const hoursWorked = payrollData?.totalHours ?? totalHoursThisWeek;
  
  // Calculate Estimated Net Pay
  // If there's already a payroll record for the current period, use its netPay.
  // Otherwise, estimate it based on hours * hourlyRate
  const hourlyRate = Number(currentUser?.hourlyRate || 0);
  const estNetPay = payrollData?.payrollRecord?.netPay ?? (hoursWorked * hourlyRate);

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
      icon: <PesoIcon sx={{ fontSize: 24 }} />,
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

      {/* â”€â”€ GREETING + PAYROLL CARD (top of page, no overlap) â”€â”€â”€ */}
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
            <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Hours</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.3, mt: 0.5 }}>
                {hoursWorked ? `${Number(hoursWorked).toFixed(0)}h` : `${totalHoursThisWeek.toFixed(0)}h`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Est. Net Pay</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1.3, mt: 0.5 }}>
                {estNetPay > 0 ? `₱${Number(estNetPay).toLocaleString('en-PH', { minimumFractionDigits: 0 })}` : '--'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Shifts</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main', lineHeight: 1.3, mt: 0.5 }}>
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
              startIcon={<PesoIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1 }}
            >
              View Payslips & History
            </Button>
          </Box>
        </Paper>
      </Box>


      {/* — QUICK ACTIONS —————————————————————————————————— */}
      <Box sx={{ px: 2, mt: 3, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
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
                  py: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.15s',
                  '&:active': { bgcolor: alpha(action.color, 0.08) },
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    mb: 0.5,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', lineHeight: 1.2, textAlign: 'center' }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* — TODAY'S SHIFT —————————————————————————————————— */}
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

      {/* — UPCOMING SHIFTS —————————————————————————————————— */}
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
