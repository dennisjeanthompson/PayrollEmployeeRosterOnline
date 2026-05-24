import PesoIcon from "@/components/PesoIcon";
import React, { startTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, isAdmin, getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isValid } from "date-fns";
import { TransitionLink as Link } from "@/components/TransitionLink";
import { useLocation } from "wouter";
import { getInitials } from "@/lib/utils";
import { StatCard, InfoCard, UserCard, EmptyState, ActionButtons } from "@/components/mui/cards";
import { motion, AnimatePresence } from "framer-motion";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import ClockIcon from '@mui/icons-material/AccessTime';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import UsersIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowRightIcon from '@mui/icons-material/ArrowForward';
import PlusIcon from '@mui/icons-material/Add';
import UserPlusIcon from '@mui/icons-material/PersonAdd';
import FileTextIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import BellIcon from '@mui/icons-material/NotificationsActive';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SwapIcon from '@mui/icons-material/SwapHoriz';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/EventAvailable';
import AnalyticsIcon from '@mui/icons-material/Assessment';
import ReceiptIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import StoreIcon from '@mui/icons-material/Store';
import AssignmentIcon from '@mui/icons-material/Assignment';

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

  // Queries
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats/manager"],
    enabled: isManagerRole,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000, // Auto-refresh every 15s for live dashboard
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: employeeShifts, isLoading: employeeShiftsLoading } = useQuery<ShiftsResponse>({
    queryKey: ["/api/shifts"],
    enabled: !isManagerRole,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000, // Auto-refresh every 15s for live dashboard
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const approvals = dashboardStats ? { approvals: dashboardStats.approvals || [] } : undefined;
  const shiftTrades = dashboardStats?.shiftTrades || [];
  const timeOffResponse = dashboardStats ? { requests: dashboardStats.timeOffRequests || [] } : undefined;
  const shifts = dashboardStats ? { shifts: dashboardStats.shifts || [] } : undefined;
  const teamHours = dashboardStats?.teamHours || {};
  const currentPeriod = dashboardStats?.currentPeriod || null;
  const payrollPeriodsCount = dashboardStats?.payrollPeriodsCount || 0;
  
  const shiftsLoading = isManagerRole ? statsLoading : employeeShiftsLoading;
  const timeOffLoading = isManagerRole ? statsLoading : false;
  const approvalsLoading = isManagerRole ? statsLoading : false;
  const teamHoursLoading = isManagerRole ? statsLoading : false;

  // Filter today's shifts using Philippine timezone
  const todayShifts = React.useMemo(() => {
    const toDateStringPHT = (d: Date) => d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
    const todayPHT = toDateStringPHT(new Date());
    if (isManagerRole) {
      return shifts?.shifts?.filter((shift: any) => toDateStringPHT(new Date(shift.startTime)) === todayPHT) || [];
    }
    return employeeShifts?.shifts?.filter((shift: any) => toDateStringPHT(new Date(shift.startTime)) === todayPHT) || [];
  }, [isManagerRole, shifts?.shifts, employeeShifts?.shifts]);

  const pendingTimeOffRequests = React.useMemo(() => {
    return (timeOffResponse?.requests || []).filter((request: any) => request.status === "pending");
  }, [timeOffResponse?.requests]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 0 }}>
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
          shiftTrades={shiftTrades}
          currentPeriod={currentPeriod}
          payrollPeriodsCount={payrollPeriodsCount}
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
function AdminDashboard({ currentUser }: any) {
  const theme = useTheme();
  
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/admin"],
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          {[1,2,3,4].map(i => <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      </Box>
    );
  }

  const { stats, branchStatuses, staffOverview, recentActivity, alerts } = data || {};

  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: "none" }}>
      {/* 1. Hero Strip */}
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
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              size="small"
              icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
              label="System Administrator"
              sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main", fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.02em" }}>
            Welcome, {currentUser?.firstName || "Admin"}
          </Typography>
        </Box>
        <Box>
           <Chip label="Company-Wide View (All Branches)" color="primary" sx={{ fontWeight: 600, px: 1 }} />
        </Box>
      </Paper>

      {/* 5. Alerts Panel */}
      {alerts && alerts.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 3, borderLeft: `4px solid ${theme.palette.warning.main}`, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <BellIcon color="warning" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700} color="warning.dark">System Alerts ({alerts.length})</Typography>
          </Stack>
          <ul style={{ margin: 0, paddingLeft: '20px', color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
            {alerts.map((a: string, i: number) => <li key={i}>{a}</li>)}
          </ul>
        </Paper>
      )}

      {/* 2. Stat Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Payroll (Current)"
            value={`₱${(stats?.totalPayroll || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<PesoIcon />}
            subtitle={`${stats?.branchesGenerated || 0} of ${stats?.totalBranches || 0} branches done`}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Branches Generated"
            value={`${stats?.branchesGenerated || 0} / ${stats?.totalBranches || 0}`}
            icon={<StoreIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon={<AssignmentIcon />}
            subtitle="Across all branches"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Staff"
            value={stats?.totalStaff || 0}
            icon={<UsersIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 3. Branch Payroll Status Table */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Typography variant="h6" fontWeight={700}>Branch Payroll Status</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: theme.palette.text.secondary }}>Branch</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: theme.palette.text.secondary }}>Status</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: theme.palette.text.secondary }}>Net Payroll</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStatuses?.map((b: any) => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{b.branchName}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <Chip 
                          size="small" 
                          label={b.isGenerated ? 'Generated' : (b.status === 'No Payroll Yet' ? 'No Payroll' : 'Pending')} 
                          color={b.isGenerated ? 'success' : (b.status === 'No Payroll Yet' ? 'default' : 'warning')} 
                          variant="outlined"
                        />
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700 }}>
                        ₱{(b.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {(!branchStatuses || branchStatuses.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: theme.palette.text.secondary }}>No branches found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Card>
        </Grid>

        {/* 6. Staff Overview (Bar Chart) & 7. Recent Activity */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Staff Overview */}
            <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                 <Typography variant="subtitle1" fontWeight={700}>Staff Distribution</Typography>
              </Box>
              <CardContent>
                <Stack spacing={2}>
                  {staffOverview?.map((s: any, idx: number) => {
                    const max = Math.max(...(staffOverview.map((st:any) => st.headcount) || [1]));
                    const pct = max > 0 ? (s.headcount / max) * 100 : 0;
                    return (
                      <Box key={idx}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '80%' }}>{s.branchName}</Typography>
                          <Typography variant="body2" color="text.secondary">{s.headcount}</Typography>
                        </Stack>
                        <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 3 }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
               <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                 <Typography variant="subtitle1" fontWeight={700}>Recent Activity</Typography>
               </Box>
               <List disablePadding>
                 {recentActivity?.map((log: any, idx: number) => (
                   <ListItem key={idx} divider={idx < recentActivity.length - 1} sx={{ px: 2.5, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}><HistoryIcon fontSize="small" color="secondary" /></ListItemIcon>
                      <ListItemText 
                        primary={log.action} 
                        secondary={`${log.userName || log.userId || 'System'} • ${log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm a') : 'Unknown'}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                   </ListItem>
                 ))}
                 {(!recentActivity || recentActivity.length === 0) && (
                   <ListItem><ListItemText secondary="No recent activity" /></ListItem>
                 )}
               </List>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

// Manager Dashboard Component
function ManagerDashboard({ currentUser, teamHours, teamHoursLoading, todayShifts, shiftsLoading, pendingTimeOffRequests, shiftTrades, currentPeriod, payrollPeriodsCount, timeOffLoading, approvals, approvalsLoading, approveTimeOffMutation, rejectTimeOffMutation }: any) {
  const theme = useTheme();

  // Combine time-off requests + shift trades as "pending approvals"
  const pendingTrades = (shiftTrades || []).filter((t: any) => t.status === 'pending' || t.status === 'accepted');
  const allPendingApprovals = [...(pendingTimeOffRequests || []).map((r: any) => ({ ...r, _kind: 'time_off' })), ...pendingTrades.map((t: any) => ({ ...t, _kind: 'shift_trade' }))];

  const todayRoster = React.useMemo(() => {
    const map = new Map<string, any>();
    [...todayShifts].sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).forEach((s: any) => {
      const eid = s.user?.id || s.userId || s.id;
      if (!map.has(eid)) map.set(eid, s);
    });
    return Array.from(map.values());
  }, [todayShifts]);

  const pendingLeaves = pendingTimeOffRequests?.length || 0;
  const pendingTradeCount = pendingTrades.length;

  // Period dates
  const startD = currentPeriod ? new Date(currentPeriod.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endD = currentPeriod ? new Date(currentPeriod.endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  const totalDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.ceil((new Date().getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))));
  const daysLeft = totalDays - elapsedDays;

  // Real payroll data from currentPeriod
  const periodStatus = currentPeriod?.status || 'draft';

  return (
    <Stack spacing={3} sx={{ width: "100%", pb: 8 }}>
      {/* Hero Strip */}
      <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: '#1b4332', color: 'white', p: { xs: 2.5, lg: 3 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" }, position: 'relative', zIndex: 2 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Chip size="small" icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80", ml: 1 }} />} label="Active session" sx={{ bgcolor: alpha('#4ade80', 0.15), color: "#4ade80", fontWeight: 600, fontSize: '0.75rem', height: 24, '& .MuiChip-label': { px: 1.5 } }} />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.01em" }}>
              Good afternoon, {currentUser?.firstName || "Manager"}
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: alpha('#ffffff', 0.8) }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
              {currentPeriod && <> &middot; {daysLeft > 0 ? <>Period: {format(startD, "MMM d")} – {format(endD, "MMM d")} &middot; {daysLeft} days left</> : <>Period ended {format(endD, "MMM d")}</>}</>}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, lg: 0 } }}>
            <Link href="/schedule">
              <Button variant="outlined" startIcon={<PlusIcon />} sx={{ color: 'white', borderColor: alpha('#ffffff', 0.3), px: 2.5, borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: alpha('#ffffff', 0.1), borderColor: 'white' } }}>Add shift</Button>
            </Link>
            <Link href="/payroll-management">
              <Button variant="contained" sx={{ bgcolor: 'white', color: '#1b4332', px: 3, borderRadius: 2, fontWeight: 700, "&:hover": { bgcolor: '#f0fdf4' } }}>Run payroll</Button>
            </Link>
          </Stack>
        </Box>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
      </Paper>

      {/* Stats Row — 3 actionable cards only */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}><CalendarIcon fontSize="small" /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>Today's shifts</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{todayRoster.length}</Typography>
              <Typography variant="caption" color="text.secondary">{format(new Date(), "EEEE")} — {todayRoster.length === 0 ? 'No shifts scheduled' : 'scheduled'}</Typography>
            </Paper>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}><UsersIcon fontSize="small" /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>Active staff</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{teamHours?.employeeCount || 0}</Typography>
              <Typography variant="caption" color="text.secondary">{pendingLeaves} on leave today</Typography>
            </Paper>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {teamHoursLoading ? <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /> : (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${allPendingApprovals.length > 0 ? theme.palette.error.main : theme.palette.divider}`, height: '100%' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}><BellIcon fontSize="small" /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>Pending approvals</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: allPendingApprovals.length > 0 ? 'error.main' : 'text.primary', mb: 1 }}>{allPendingApprovals.length}</Typography>
              <Typography variant="caption" color="text.secondary">{pendingLeaves} leave · {pendingTradeCount} trade</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Main 2-Column Layout */}
      <Grid container spacing={3}>
        {/* LEFT: Roster + Approvals */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* Today's Roster */}
            <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><CalendarIcon fontSize="small" color="success" /> Today's roster</Typography>
                    <Typography variant="body2" color="text.secondary">{format(new Date(), "EEEE, MMM d")} — {todayRoster.length === 0 ? "No shifts scheduled" : `${todayRoster.length} scheduled`}</Typography>
                  </Box>
                  <Link href="/schedule"><Button size="small" endIcon={<ArrowRightIcon />} sx={{ fontWeight: 600 }}>Manage</Button></Link>
                </Box>
                {shiftsLoading ? (
                  <Stack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />)}</Stack>
                ) : todayRoster.length > 0 ? (
                  <Stack spacing={0} divider={<Divider />}>
                    {todayRoster.slice(0, 5).map((shift: any) => (
                      <Box key={shift.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={shift.user?.photoUrl || undefined} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40, fontWeight: 700 }}>{getInitials(shift.user?.firstName, shift.user?.lastName, shift.user?.username)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{shift.user?.firstName ? `${shift.user.firstName} ${shift.user.lastName || ''}`.trim() : shift.position}</Typography>
                            <Typography variant="caption" color="text.secondary">{shift.position}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{format(new Date(shift.startTime), "h:mm a")} – {format(new Date(shift.endTime), "h:mm a")}</Typography>
                          <Chip size="small" label="Scheduled" variant="outlined" color="info" sx={{ height: 20, mt: 0.5, fontSize: '0.65rem', fontWeight: 600 }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="subtitle2">No shifts scheduled today</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Approvals & Requests */}
            <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><CheckIcon fontSize="small" color="success" /> Approvals & requests</Typography>
                    <Typography variant="body2" color="text.secondary">{allPendingApprovals.length} pending your review</Typography>
                  </Box>
                  <Link href="/time-off"><Button size="small" color="success" endIcon={<ArrowRightIcon />} sx={{ fontWeight: 600 }}>View all</Button></Link>
                </Box>
                {timeOffLoading ? (
                  <Stack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: 2 }} />)}</Stack>
                ) : allPendingApprovals.length > 0 ? (
                  <Stack spacing={2}>
                    {allPendingApprovals.slice(0, 4).map((item: any) => {
                      const isTimeOff = item._kind === 'time_off';
                      const isTrade = item._kind === 'shift_trade';
                      const label = isTimeOff ? 'Leave request' : 'Shift trade';
                      const name = isTimeOff
                        ? (item.employeeName || (item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Employee'))
                        : (item.fromUserName || 'Employee');
                      const detail = isTimeOff
                        ? `${format(new Date(item.startDate), "MMM d")}–${format(new Date(item.endDate), "MMM d")} · ${(item.type || 'leave').replace('_', ' ')}`
                        : `Requesting trade · ${item.status === 'accepted' ? 'Accepted by peer' : 'Pending'}`;
                      return (
                        <Box key={item.id} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}` }}>
                              {isTimeOff ? <EventIcon fontSize="small" sx={{ color: 'warning.main' }} /> : <SwapIcon fontSize="small" sx={{ color: 'info.main' }} />}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label} — {name}</Typography>
                              <Typography variant="caption" color="text.secondary">{detail}</Typography>
                            </Box>
                          </Box>
                          {isTimeOff && (
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="contained" color="success" sx={{ borderRadius: 2, px: 2, boxShadow: 'none' }} onClick={() => approveTimeOffMutation.mutate(item.id)}>Approve</Button>
                              <Button size="small" variant="outlined" color="inherit" sx={{ borderRadius: 2 }} onClick={() => rejectTimeOffMutation.mutate({ requestId: item.id })}>Deny</Button>
                            </Stack>
                          )}
                          {isTrade && (
                            <Link href="/schedule"><Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Review</Button></Link>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                    <VerifiedIcon sx={{ fontSize: 36, mb: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2">All caught up!</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT: Payroll Period */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {/* Current Payroll Period - Simplified */}
            <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><FileTextIcon fontSize="small" color="success" /> Payroll period</Typography>
                    <Typography variant="body2" color="text.secondary">{format(startD, "MMM d")} – {format(endD, "MMM d, yyyy")}</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={
                      periodStatus === 'generated' ? 'Generated' :
                      periodStatus === 'completed' || periodStatus === 'paid' ? 'Completed' :
                      periodStatus === 'closed' ? 'Closed' :
                      periodStatus === 'open' ? 'Pending' :
                      'In progress'
                    }
                    color={
                      periodStatus === 'generated' || periodStatus === 'completed' || periodStatus === 'paid' ? 'success' :
                      periodStatus === 'closed' ? 'default' :
                      'primary'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Stack spacing={2}>
                  {/* Employee count */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <UsersIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Employees</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{teamHours?.employeeCount || 0}</Typography>
                  </Box>

                  {/* Deductions status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Deductions</Typography>
                    </Box>
                    <Chip size="small" label="Included" color="success" variant="outlined" sx={{ fontWeight: 600, height: 24 }} />
                  </Box>

                  <Link href="/payroll-management">
                    <Button fullWidth variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, mt: 1 }}>View payroll details</Button>
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

// Safe date formatter to prevent RangeError crashes on employee views
function sfmt(val: any, fmt: string): string {
  try {
    if (!val) return '--';
    const d = val instanceof Date ? val : new Date(val);
    if (!isValid(d)) return '--';
    return format(d, fmt);
  } catch { return '--'; }
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
  const thisWeekShifts = React.useMemo(() => {
    return (employeeShifts?.shifts || []).filter((s: any) => {
      if (!s.startTime || !s.endTime) return false;
      const d = new Date(s.startTime);
      if (isNaN(d.getTime())) return false;
      
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return d >= startOfWeek && d <= endOfWeek;
    });
  }, [employeeShifts?.shifts]);

  const totalHoursThisWeek = React.useMemo(() => {
    return thisWeekShifts.reduce((sum: number, s: any) => {
      const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
      const hours = diffMs / 3600000;
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
  }, [thisWeekShifts]);

  const upcomingShifts = React.useMemo(() => {
    return (employeeShifts?.shifts || [])
      .filter((s: any) => s.startTime && !isNaN(new Date(s.startTime).getTime()) && new Date(s.startTime) >= new Date())
      .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, [employeeShifts?.shifts]);

  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  // Get latest payslip and current period estimates
  const records = payrollHistory?.entries || payrollHistory?.records || payrollHistory?.payroll || [];
  const activeEntry = records.find((r: any) => r.status === 'draft' || r.status === 'pending');
  const latestPaidEntry = records.find((r: any) => r.status === 'paid' || r.status === 'completed');
  const currentPeriod = payrollData?.period;
  
  // Always display the latest fully processed (generated) payroll on the dashboard
  const displayEntry = latestPaidEntry;

  // Count shifts in the current pay period only (not all-time)
  const currentPeriodShifts = React.useMemo(() => {
    return (employeeShifts?.shifts || []).filter((s: any) => {
      if (!s.startTime) return false;
      const d = new Date(s.startTime);
      if (isNaN(d.getTime())) return false;
      
      if (displayEntry?.periodStartDate && displayEntry?.periodEndDate) {
        const periodStart = new Date(displayEntry.periodStartDate);
        const periodEnd = new Date(displayEntry.periodEndDate);
        periodEnd.setHours(23, 59, 59, 999);
        return d >= periodStart && d <= periodEnd;
      }

      if (!currentPeriod) return false;
      const periodStart = new Date(currentPeriod.startDate);
      const periodEnd = new Date(currentPeriod.endDate);
      periodEnd.setHours(23, 59, 59, 999);
      return d >= periodStart && d <= periodEnd;
    });
  }, [employeeShifts?.shifts, displayEntry?.periodStartDate, displayEntry?.periodEndDate, currentPeriod]);
  
  // Hours worked this period. Fallback to this week's scheduled hours.
  const hoursWorked = displayEntry ? Number(displayEntry.totalHours || 0) : (payrollData?.totalHours ?? totalHoursThisWeek);
  
  // Calculate Estimated Net Pay
  // If there's already a payroll record for the current period, use its netPay.
  // Otherwise, estimate it based on hours * hourlyRate
  const hourlyRate = Number(currentUser?.hourlyRate || 0);
  const estNetPay = displayEntry ? Number(displayEntry.netPay || 0) : (hoursWorked * hourlyRate);

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Paper
            elevation={isDark ? 0 : 8}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${alpha('#ffffff', isDark ? 0.05 : 0.4)}`,
              boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : '0 16px 40px rgba(0,0,0,0.08)',
              background: 'transparent',
              position: 'relative',
            }}
          >
            {/* Animated Mesh Gradient Background Layer */}
            <Box
              sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 0,
                background: isDark
                  ? `linear-gradient(135deg, #2A1608 0%, #1C0F05 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                  borderRadius: '50%',
                }}
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute', bottom: '-10%', left: '-10%', width: '70%', height: '70%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                  borderRadius: '50%',
                }}
              />
            </Box>

            {/* Content Layer (Glass) */}
            <Box sx={{ position: 'relative', zIndex: 1, px: 2.5, pt: 3, pb: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {format(new Date(), 'EEEE, MMM d')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2, mt: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    Hi, {currentUser?.firstName || 'Employee'} 👋
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 500 }}>
                    {currentUser?.position || currentUser?.role || 'Team Member'}
                  </Typography>
                </Box>
                <Box sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' }, '&:active': { transform: 'scale(0.95)' } }}>
                  <Chip
                    size="small"
                    label="● Online"
                    sx={{ 
                      bgcolor: alpha('#4ade80', 0.15), 
                      color: '#4ade80', 
                      fontWeight: 800, 
                      fontSize: '0.65rem', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      boxShadow: '0 0 12px rgba(74,222,128,0.2)' 
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Overlapping Glass Stats Card */}
            <Box sx={{ position: 'relative', zIndex: 2, px: 1.5, pb: 2, mt: -3 }}>
              <Paper
                elevation={isDark ? 0 : 4}
                sx={{
                  borderRadius: 3,
                  background: isDark ? alpha('#111', 0.8) : alpha('#ffffff', 0.9),
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(isDark ? '#fff' : '#000', 0.05)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {latestPaidEntry ? 'Latest Payslip' : 'Current Pay Period'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {displayEntry && displayEntry.periodStartDate && displayEntry.periodEndDate
                        ? `${sfmt(displayEntry.periodStartDate, 'MMM d')} – ${sfmt(displayEntry.periodEndDate, 'MMM d, yyyy')}`
                        : currentPeriod
                        ? `${sfmt(currentPeriod.startDate, 'MMM d')} – ${sfmt(currentPeriod.endDate, 'MMM d, yyyy')}`
                        : 'This Pay Period'}
                    </Typography>
                  </Stack>
                </Box>

                <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ opacity: 0.6 }} />}>
                  <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Hours</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: isDark ? '#fff' : 'text.primary', lineHeight: 1.2, mt: 0.5 }}>
                      {hoursWorked ? `${Number(hoursWorked).toFixed(0)}` : `${totalHoursThisWeek.toFixed(0)}`}<Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>h</Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Net Pay</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', lineHeight: 1.2, mt: 0.5 }}>
                      {estNetPay > 0 ? `₱${Number(estNetPay).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Shifts</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'info.main', lineHeight: 1.2, mt: 0.5 }}>
                      {currentPeriod ? currentPeriodShifts.length : thisWeekShifts.length}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
                  <Box sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)' }, '&:active': { transform: 'scale(0.99)' } }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => startTransition(() => setLocation('/employee/payroll'))}
                      size="small"
                      startIcon={<PesoIcon />}
                      sx={{ 
                        textTransform: 'none', 
                        fontWeight: 700, 
                        borderRadius: 2, 
                        py: 1,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
                      }}
                    >
                      View Payslips
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </motion.div>
      </Box>



      {/* — TODAY'S SHIFT —————————————————————————————————— */}
      <Box sx={{ px: 2, mt: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.5, display: 'block', mb: 2 }}>
          Today's Schedule
        </Typography>
        {shiftsLoading ? (
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
        ) : todayShifts.length > 0 ? (
          <Stack spacing={2}>
            {todayShifts.map((shift: any, i: number) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Paper
                    elevation={isDark ? 0 : 2}
                    onClick={() => startTransition(() => setLocation('/employee/schedule'))}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      background: isDark ? alpha(primaryColor, 0.05) : '#fff',
                      border: `1px solid ${shift.status === 'completed' ? alpha(theme.palette.success.main, 0.3) : alpha(primaryColor, 0.2)}`,
                      boxShadow: `0 8px 24px ${alpha(primaryColor, 0.08)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02) translateY(-2px)' },
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                  >
                  <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: shift.status === 'completed' ? 'success.main' : 'primary.main' }} />
                  <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: alpha(primaryColor, 0.1), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                      TODAY
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>{shift.position || 'Shift'}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                      {sfmt(shift.startTime, 'h:mm a')} – {sfmt(shift.endTime, 'h:mm a')}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={shift.status === 'completed' ? 'Done' : 'Active'} 
                    color={shift.status === 'completed' ? 'success' : 'primary'} 
                    sx={{ fontWeight: 800, borderRadius: 1.5 }} 
                  />
                </Paper>
              </motion.div>
            ))}
          </Stack>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper variant="outlined" sx={{ borderRadius: 4, py: 4, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'transparent' }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 700 }}>No shifts today</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Enjoy your day off! 🎉</Typography>
            </Paper>
          </motion.div>
        )}
      </Box>

      {/* — UPCOMING SHIFTS —————————————————————————————————— */}
      {upcomingShifts.length > 0 && (
        <Box sx={{ px: 2, mt: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
              Upcoming Shifts
            </Typography>
            <Button size="small" endIcon={<ArrowRightIcon />} onClick={() => startTransition(() => setLocation('/employee/schedule'))} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
              View All
            </Button>
          </Stack>
          <Stack spacing={2}>
            {upcomingShifts.map((shift: any, i: number) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
              >
                <Paper
                  elevation={0}
                  onClick={() => startTransition(() => setLocation('/employee/schedule'))}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    cursor: 'pointer', 
                    border: `1px solid ${theme.palette.divider}`,
                    background: isDark ? alpha('#000', 0.2) : alpha('#fff', 0.5),
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
                    '&:hover': {
                      borderColor: alpha(primaryColor, 0.3),
                      background: isDark ? alpha(primaryColor, 0.05) : '#fff',
                      transform: 'scale(1.02)'
                    },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(primaryColor, 0.08), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                      {sfmt(shift.startTime, 'MMM').toUpperCase()}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1.2 }}>
                      {sfmt(shift.startTime, 'd')}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{shift.position || 'Shift'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
                      {sfmt(shift.startTime, 'EEE')} · {sfmt(shift.startTime, 'h:mm a')} – {sfmt(shift.endTime, 'h:mm a')}
                    </Typography>
                  </Box>
                  <ArrowRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </Paper>
              </motion.div>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
