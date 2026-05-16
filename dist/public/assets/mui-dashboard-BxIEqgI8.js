import { aG as useQueryClient, a0 as useTheme, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, $ as useLocation, ag as alpha, aC as ScheduleIcon, aD as SwapIcon, ak as AutoAwesome, bk as motion, b7 as Paper, aJ as Stack, aj as Typography, bl as format, am as Chip, bm as Divider, aK as Button, r as reactExports, bn as Skeleton, bo as ArrowForward, ab as VerifiedIcon, aF as ReportIcon, a as React, bp as AddIcon, bq as Grid, a3 as CalendarIcon, a5 as PeopleIcon, br as BellIcon, bs as Card, bt as CardContent, al as Avatar, bu as CheckIcon, aW as EventIcon, bv as TaxIcon, bw as isValid } from './vendor-Br1LjuIs.js';
import { g as getCurrentUser, i as isManager, a as isAdmin, P as PesoIcon, T as TransitionLink, b as getInitials, c as apiRequest } from './main-xSSzBk_D.js';
import { u as useToast } from './use-toast-D9VL1-uB.js';
import MuiBranches from './mui-branches-9-npld9L.js';

function MuiDashboard() {
  const isManagerRole = isManager();
  const isAdminRole = isAdmin();
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useTheme();
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats/manager"],
    enabled: isManagerRole,
    staleTime: 10 * 1e3,
    refetchInterval: 15 * 1e3,
    // Auto-refresh every 15s for live dashboard
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  const { data: employeeShifts, isLoading: employeeShiftsLoading } = useQuery({
    queryKey: ["/api/shifts"],
    enabled: !isManagerRole,
    staleTime: 10 * 1e3,
    refetchInterval: 15 * 1e3,
    // Auto-refresh every 15s for live dashboard
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  const approvals = dashboardStats ? { approvals: dashboardStats.approvals || [] } : void 0;
  const shiftTrades = dashboardStats?.shiftTrades || [];
  const timeOffResponse = dashboardStats ? { requests: dashboardStats.timeOffRequests || [] } : void 0;
  const shifts = dashboardStats ? { shifts: dashboardStats.shifts || [] } : void 0;
  const teamHours = dashboardStats?.teamHours || {};
  const currentPeriod = dashboardStats?.currentPeriod || null;
  const payrollPeriodsCount = dashboardStats?.payrollPeriodsCount || 0;
  const shiftsLoading = isManagerRole ? statsLoading : employeeShiftsLoading;
  const timeOffLoading = isManagerRole ? statsLoading : false;
  const approvalsLoading = isManagerRole ? statsLoading : false;
  const teamHoursLoading = isManagerRole ? statsLoading : false;
  const toDateStringPHT = (d) => d.toLocaleDateString("en-PH", { timeZone: "Asia/Manila" });
  const todayPHT = toDateStringPHT(/* @__PURE__ */ new Date());
  const todayShifts = isManagerRole ? shifts?.shifts?.filter((shift) => {
    return toDateStringPHT(new Date(shift.startTime)) === todayPHT;
  }) || [] : employeeShifts?.shifts?.filter((shift) => {
    return toDateStringPHT(new Date(shift.startTime)) === todayPHT;
  }) || [];
  const pendingTimeOffRequests = (timeOffResponse?.requests || []).filter(
    (request) => request.status === "pending"
  );
  const approveTimeOffMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${requestId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Approved", description: "Time off request approved" });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const rejectTimeOffMutation = useMutation({
    mutationFn: async ({ requestId, rejectionReason }) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${requestId}/reject`, {
        status: "rejected",
        rejectionReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Rejected", description: "Time off request rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", bgcolor: "background.default", p: 0 }, children: isAdminRole ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, { currentUser, teamHours, teamHoursLoading, todayShifts, shiftsLoading }) : isManagerRole ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    ManagerDashboard,
    {
      currentUser,
      teamHours,
      teamHoursLoading,
      todayShifts,
      shiftsLoading,
      pendingTimeOffRequests,
      shiftTrades,
      currentPeriod,
      payrollPeriodsCount,
      timeOffLoading,
      approvals,
      approvalsLoading,
      approveTimeOffMutation,
      rejectTimeOffMutation
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
    EmployeeDashboard,
    {
      currentUser,
      todayShifts,
      employeeShifts,
      shiftsLoading: employeeShiftsLoading
    }
  ) });
}
function AdminDashboard({ currentUser }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { width: "100%", maxWidth: "none" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 0,
        sx: {
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
          p: { xs: 2.5, md: 3 }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", zIndex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedIcon, { sx: { fontSize: 16 } }),
              label: "System Administrator",
              sx: {
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                fontWeight: 600
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 0.5, letterSpacing: "-0.02em" }, children: [
            "Welcome, ",
            currentUser?.firstName || "Admin"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", sx: { fontSize: "1rem", maxWidth: 800, mb: 3 }, children: "As a System Administrator, you have bird's-eye access to all locations. Use the branch switcher in the top navigation menu to view data for specific branches, or access reports below." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/reports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              color: "success",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportIcon, {}),
              sx: { px: 3, py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 2, "&:hover": { borderWidth: 2 } },
              children: "Payroll Analytics"
            }
          ) }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiBranches, { isEmbedded: true }) })
  ] });
}
function ManagerDashboard({ currentUser, teamHours, teamHoursLoading, todayShifts, shiftsLoading, pendingTimeOffRequests, shiftTrades, currentPeriod, payrollPeriodsCount, timeOffLoading, approvals, approvalsLoading, approveTimeOffMutation, rejectTimeOffMutation }) {
  const theme = useTheme();
  const pendingTrades = (shiftTrades || []).filter((t) => t.status === "pending" || t.status === "accepted");
  const allPendingApprovals = [...(pendingTimeOffRequests || []).map((r) => ({ ...r, _kind: "time_off" })), ...pendingTrades.map((t) => ({ ...t, _kind: "shift_trade" }))];
  const todayRoster = React.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    [...todayShifts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).forEach((s) => {
      const eid = s.user?.id || s.userId || s.id;
      if (!map.has(eid)) map.set(eid, s);
    });
    return Array.from(map.values());
  }, [todayShifts]);
  const pendingLeaves = pendingTimeOffRequests?.length || 0;
  const pendingTradeCount = pendingTrades.length;
  const startD = currentPeriod ? new Date(currentPeriod.startDate) : new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
  const endD = currentPeriod ? new Date(currentPeriod.endDate) : new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() + 1, 0);
  const totalDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1e3 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.ceil(((/* @__PURE__ */ new Date()).getTime() - startD.getTime()) / (1e3 * 60 * 60 * 24))));
  const daysLeft = totalDays - elapsedDays;
  const periodStatus = currentPeriod?.status || "draft";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { width: "100%", pb: 8 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { borderRadius: 3, bgcolor: "#1b4332", color: "white", p: { xs: 2.5, lg: 3 }, position: "relative", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" }, position: "relative", zIndex: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: { mb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80", ml: 1 } }), label: "Active session", sx: { bgcolor: alpha("#4ade80", 0.15), color: "#4ade80", fontWeight: 600, fontSize: "0.75rem", height: 24, "& .MuiChip-label": { px: 1.5 } } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 0.5, letterSpacing: "-0.01em" }, children: [
            "Good afternoon, ",
            currentUser?.firstName || "Manager"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { sx: { fontSize: "0.95rem", color: alpha("#ffffff", 0.8) }, children: [
            format(/* @__PURE__ */ new Date(), "EEEE, MMMM d, yyyy"),
            currentPeriod && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " · ",
              daysLeft > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Period: ",
                format(startD, "MMM d"),
                " – ",
                format(endD, "MMM d"),
                " · ",
                daysLeft,
                " days left"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Period ended ",
                format(endD, "MMM d")
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: { xs: 2, lg: 0 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), sx: { color: "white", borderColor: alpha("#ffffff", 0.3), px: 2.5, borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: alpha("#ffffff", 0.1), borderColor: "white" } }, children: "Add shift" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/payroll-management", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", sx: { bgcolor: "white", color: "#1b4332", px: 3, borderRadius: 2, fontWeight: 700, "&:hover": { bgcolor: "#f0fdf4" } }, children: "Run payroll" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 4 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontWeight: 600, mb: 0.5 }, children: "Today's shifts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 1 }, children: todayRoster.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          format(/* @__PURE__ */ new Date(), "EEEE"),
          " — ",
          todayRoster.length === 0 ? "No shifts scheduled" : "scheduled"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 4 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { fontSize: "small" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontWeight: 600, mb: 0.5 }, children: "Active staff" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 1 }, children: teamHours?.employeeCount || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          pendingLeaves,
          " on leave today"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 4 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { p: 2.5, borderRadius: 3, border: `1px solid ${allPendingApprovals.length > 0 ? theme.palette.error.main : theme.palette.divider}`, height: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, { fontSize: "small" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontWeight: 600, mb: 0.5 }, children: "Pending approvals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, color: allPendingApprovals.length > 0 ? "error.main" : "text.primary", mb: 1 }, children: allPendingApprovals.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          pendingLeaves,
          " leave · ",
          pendingTradeCount,
          " trade"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 7 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 3, bgcolor: "background.paper", boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small", color: "success" }),
                " Today's roster"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                format(/* @__PURE__ */ new Date(), "EEEE, MMM d"),
                " — ",
                todayRoster.length === 0 ? "No shifts scheduled" : `${todayRoster.length} scheduled`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}), sx: { fontWeight: 600 }, children: "Manage" }) })
          ] }),
          shiftsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 60, sx: { borderRadius: 2 } }, i)) }) : todayRoster.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 0, divider: /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}), children: todayRoster.slice(0, 5).map((shift) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: shift.user?.photoUrl || void 0, sx: { bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 40, height: 40, fontWeight: 700 }, children: getInitials(shift.user?.firstName, shift.user?.lastName, shift.user?.username) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: shift.user?.firstName ? `${shift.user.firstName} ${shift.user.lastName || ""}`.trim() : shift.position }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: shift.position })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: [
                format(new Date(shift.startTime), "h:mm a"),
                " – ",
                format(new Date(shift.endTime), "h:mm a")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Scheduled", variant: "outlined", color: "info", sx: { height: 20, mt: 0.5, fontSize: "0.65rem", fontWeight: 600 } })
            ] })
          ] }, shift.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 4, textAlign: "center", opacity: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 36, mb: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", children: "No shifts scheduled today" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 3, bgcolor: "background.paper", boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { fontSize: "small", color: "success" }),
                " Approvals & requests"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                allPendingApprovals.length,
                " pending your review"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/time-off", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", color: "success", endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}), sx: { fontWeight: 600 }, children: "View all" }) })
          ] }),
          timeOffLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 70, sx: { borderRadius: 2 } }, i)) }) : allPendingApprovals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: allPendingApprovals.slice(0, 4).map((item) => {
            const isTimeOff = item._kind === "time_off";
            const isTrade = item._kind === "shift_trade";
            const label = isTimeOff ? "Leave request" : "Shift trade";
            const name = isTimeOff ? item.employeeName || (item.user ? `${item.user.firstName} ${item.user.lastName}` : "Employee") : item.fromUserName || "Employee";
            const detail = isTimeOff ? `${format(new Date(item.startDate), "MMM d")}–${format(new Date(item.endDate), "MMM d")} · ${(item.type || "leave").replace("_", " ")}` : `Requesting trade · ${item.status === "accepted" ? "Accepted by peer" : "Pending"}`;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: 2, bgcolor: "background.paper", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${theme.palette.divider}` }, children: isTimeOff ? /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { fontSize: "small", sx: { color: "warning.main" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SwapIcon, { fontSize: "small", sx: { color: "info.main" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: [
                    label,
                    " — ",
                    name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: detail })
                ] })
              ] }),
              isTimeOff && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "contained", color: "success", sx: { borderRadius: 2, px: 2, boxShadow: "none" }, onClick: () => approveTimeOffMutation.mutate(item.id), children: "Approve" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "outlined", color: "inherit", sx: { borderRadius: 2 }, onClick: () => rejectTimeOffMutation.mutate({ requestId: item.id }), children: "Deny" })
              ] }),
              isTrade && /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "outlined", sx: { borderRadius: 2 }, children: "Review" }) })
            ] }, item.id);
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 4, textAlign: "center", opacity: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedIcon, { sx: { fontSize: 36, mb: 1, color: "success.main" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", children: "All caught up!" })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 3, bgcolor: "background.paper", boxShadow: (t) => `0 2px 10px ${alpha(t.palette.common.black, 0.03)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { fontSize: "small", color: "success" }),
              " Payroll period"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              format(startD, "MMM d"),
              " – ",
              format(endD, "MMM d, yyyy")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: periodStatus === "generated" ? "Generated" : periodStatus === "completed" || periodStatus === "paid" ? "Completed" : periodStatus === "closed" ? "Closed" : periodStatus === "open" ? "Pending" : "In progress",
              color: periodStatus === "generated" || periodStatus === "completed" || periodStatus === "paid" ? "success" : periodStatus === "closed" ? "default" : "primary",
              variant: "outlined",
              sx: { fontWeight: 600 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { fontSize: "small", sx: { color: "text.secondary" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Employees" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: teamHours?.employeeCount || 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { fontSize: "small", sx: { color: "text.secondary" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Deductions" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Included", color: "success", variant: "outlined", sx: { fontWeight: 600, height: 24 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/payroll-management", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "outlined", sx: { borderRadius: 2, fontWeight: 600, mt: 1 }, children: "View payroll details" }) })
        ] })
      ] }) }) }) })
    ] })
  ] });
}
function sfmt(val, fmt) {
  try {
    if (!val) return "--";
    const d = val instanceof Date ? val : new Date(val);
    if (!isValid(d)) return "--";
    return format(d, fmt);
  } catch {
    return "--";
  }
}
function EmployeeDashboard({ currentUser, todayShifts, employeeShifts, shiftsLoading }) {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const { data: payrollData } = useQuery({
    queryKey: ["/api/payroll/periods/current"],
    enabled: true
  });
  const { data: payrollHistory } = useQuery({
    queryKey: ["/api/payroll"],
    enabled: true
  });
  const thisWeekShifts = (employeeShifts?.shifts || []).filter((s) => {
    if (!s.startTime || !s.endTime) return false;
    const d = new Date(s.startTime);
    if (isNaN(d.getTime())) return false;
    const now = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d >= startOfWeek && d <= endOfWeek;
  });
  const totalHoursThisWeek = thisWeekShifts.reduce((sum, s) => {
    const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
    const hours = diffMs / 36e5;
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);
  const upcomingShifts = (employeeShifts?.shifts || []).filter((s) => s.startTime && !isNaN(new Date(s.startTime).getTime()) && new Date(s.startTime) >= /* @__PURE__ */ new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5);
  const isDark = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;
  const records = payrollHistory?.entries || payrollHistory?.records || payrollHistory?.payroll || [];
  const activeEntry = records.find((r) => r.status === "draft" || r.status === "pending");
  records.find((r) => r.status === "paid" || r.status === "completed");
  const currentPeriod = payrollData?.period;
  const currentPeriodShifts = (employeeShifts?.shifts || []).filter((s) => {
    if (!s.startTime || !currentPeriod) return false;
    const d = new Date(s.startTime);
    if (isNaN(d.getTime())) return false;
    const periodStart = new Date(currentPeriod.startDate);
    const periodEnd = new Date(currentPeriod.endDate);
    periodEnd.setHours(23, 59, 59, 999);
    return d >= periodStart && d <= periodEnd;
  });
  const hoursWorked = activeEntry ? Number(activeEntry.totalHours || 0) : payrollData?.totalHours ?? totalHoursThisWeek;
  const hourlyRate = Number(currentUser?.hourlyRate || 0);
  const estNetPay = activeEntry ? Number(activeEntry.netPay || 0) : hoursWorked * hourlyRate;
  [
    {
      label: "Schedule",
      sub: "View shifts",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 24 } }),
      color: primaryColor,
      bgColor: alpha(primaryColor, 0.12),
      route: "/employee/schedule"
    },
    {
      label: "Trade",
      sub: "Swap shifts",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SwapIcon, { sx: { fontSize: 24 } }),
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.12),
      route: "/employee/schedule"
    },
    {
      label: "Payslips",
      sub: "Earnings",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { sx: { fontSize: 24 } }),
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.12),
      route: "/employee/payroll"
    },
    {
      label: "Profile",
      sub: "My account",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoAwesome, { sx: { fontSize: 24 } }),
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.12),
      route: "/employee/profile"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pb: 10, bgcolor: "background.default", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 2, pt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: isDark ? 0 : 8,
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${alpha("#ffffff", isDark ? 0.05 : 0.4)}`,
              boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.08)",
              background: "transparent",
              position: "relative"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Box,
                {
                  sx: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    background: isDark ? `linear-gradient(135deg, #2A1608 0%, #1C0F05 100%)` : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    overflow: "hidden"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        animate: {
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                          rotate: [0, 90, 0]
                        },
                        transition: { duration: 15, repeat: Infinity, ease: "linear" },
                        style: {
                          position: "absolute",
                          top: "-20%",
                          right: "-10%",
                          width: "60%",
                          height: "60%",
                          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
                          borderRadius: "50%"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        animate: {
                          scale: [1, 1.5, 1],
                          opacity: [0.2, 0.4, 0.2],
                          rotate: [0, -90, 0]
                        },
                        transition: { duration: 20, repeat: Infinity, ease: "linear" },
                        style: {
                          position: "absolute",
                          bottom: "-10%",
                          left: "-10%",
                          width: "70%",
                          height: "70%",
                          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
                          borderRadius: "50%"
                        }
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "relative", zIndex: 1, px: 2.5, pt: 3, pb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: alpha("#fff", 0.8), fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }, children: format(/* @__PURE__ */ new Date(), "EEEE, MMM d") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 800, color: "#fff", lineHeight: 1.2, mt: 0.5, textShadow: "0 2px 10px rgba(0,0,0,0.1)" }, children: [
                    "Hi, ",
                    currentUser?.firstName || "Employee",
                    " 👋"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: alpha("#fff", 0.7), fontWeight: 500 }, children: currentUser?.position || currentUser?.role || "Team Member" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: "● Online",
                    sx: {
                      bgcolor: alpha("#4ade80", 0.15),
                      color: "#4ade80",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(74,222,128,0.3)",
                      boxShadow: "0 0 12px rgba(74,222,128,0.2)"
                    }
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "relative", zIndex: 2, px: 1.5, pb: 2, mt: -3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Paper,
                {
                  elevation: isDark ? 0 : 4,
                  sx: {
                    borderRadius: 3,
                    background: isDark ? alpha("#111", 0.8) : alpha("#ffffff", 0.9),
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(isDark ? "#fff" : "#000", 0.05)}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    overflow: "hidden"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }, children: "Current Pay Period" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 800, color: "primary.main" }, children: currentPeriod ? `${sfmt(currentPeriod.startDate, "MMM d")} – ${sfmt(currentPeriod.endDate, "MMM d, yyyy")}` : "This Pay Period" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", divider: /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true, sx: { opacity: 0.6 } }), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, textAlign: "center", py: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }, children: "Hours" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 900, color: isDark ? "#fff" : "text.primary", lineHeight: 1.2, mt: 0.5 }, children: [
                          hoursWorked ? `${Number(hoursWorked).toFixed(0)}` : `${totalHoursThisWeek.toFixed(0)}`,
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "body2", sx: { color: "text.secondary", fontWeight: 600 }, children: "h" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, textAlign: "center", py: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }, children: "Net Pay" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: "success.main", lineHeight: 1.2, mt: 0.5 }, children: estNetPay > 0 ? `₱${Number(estNetPay).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "--" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, textAlign: "center", py: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }, children: "Shifts" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: "info.main", lineHeight: 1.2, mt: 0.5 }, children: currentPeriod ? currentPeriodShifts.length : thisWeekShifts.length })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 1.5, pb: 1.5, pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        fullWidth: true,
                        variant: "contained",
                        onClick: () => reactExports.startTransition(() => setLocation("/employee/payroll")),
                        size: "small",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, {}),
                        sx: {
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 2,
                          py: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
                        },
                        children: "View Payslips"
                      }
                    ) }) })
                  ]
                }
              ) })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 2, mt: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", color: "text.secondary", sx: { fontWeight: 800, letterSpacing: 1.5, display: "block", mb: 2 }, children: "Today's Schedule" }),
      shiftsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 80, sx: { borderRadius: 3 } }) : todayShifts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: todayShifts.map((shift, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.4, delay: i * 0.1 },
          whileHover: { scale: 1.02, y: -2 },
          whileTap: { scale: 0.98 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: isDark ? 0 : 2,
              onClick: () => reactExports.startTransition(() => setLocation("/employee/schedule")),
              sx: {
                p: 2.5,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                background: isDark ? alpha(primaryColor, 0.05) : "#fff",
                border: `1px solid ${shift.status === "completed" ? alpha(theme.palette.success.main, 0.3) : alpha(primaryColor, 0.2)}`,
                boxShadow: `0 8px 24px ${alpha(primaryColor, 0.08)}`,
                position: "relative",
                overflow: "hidden"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: shift.status === "completed" ? "success.main" : "primary.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 50, height: 50, borderRadius: 3, bgcolor: alpha(primaryColor, 0.1), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontSize: "0.6rem", fontWeight: 800, color: "primary.main", lineHeight: 1 }, children: "TODAY" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 800, color: "text.primary" }, children: shift.position || "Shift" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary", fontWeight: 500, mt: 0.5 }, children: [
                    sfmt(shift.startTime, "h:mm a"),
                    " – ",
                    sfmt(shift.endTime, "h:mm a")
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: shift.status === "completed" ? "Done" : "Active",
                    color: shift.status === "completed" ? "success" : "primary",
                    sx: { fontWeight: 800, borderRadius: 1.5 }
                  }
                )
              ]
            }
          )
        },
        shift.id
      )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { variant: "outlined", sx: { borderRadius: 4, py: 4, textAlign: "center", borderStyle: "dashed", bgcolor: "transparent" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { fontWeight: 700 }, children: "No shifts today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.disabled", sx: { mt: 1 }, children: "Enjoy your day off! 🎉" })
      ] }) })
    ] }),
    upcomingShifts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 2, mt: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", color: "text.secondary", sx: { fontWeight: 800, letterSpacing: 1.5 }, children: "Upcoming Shifts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}), onClick: () => reactExports.startTransition(() => setLocation("/employee/schedule")), sx: { textTransform: "none", fontWeight: 700, borderRadius: 2 }, children: "View All" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: upcomingShifts.map((shift, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay: 0.2 + i * 0.1 },
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: 0,
              onClick: () => reactExports.startTransition(() => setLocation("/employee/schedule")),
              sx: {
                p: 2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                border: `1px solid ${theme.palette.divider}`,
                background: isDark ? alpha("#000", 0.2) : alpha("#fff", 0.5),
                backdropFilter: "blur(10px)",
                "&:hover": {
                  borderColor: alpha(primaryColor, 0.3),
                  background: isDark ? alpha(primaryColor, 0.05) : "#fff"
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(primaryColor, 0.08), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontSize: "0.6rem", fontWeight: 800, color: "primary.main", lineHeight: 1 }, children: sfmt(shift.startTime, "MMM").toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 900, color: "primary.main", lineHeight: 1.2 }, children: sfmt(shift.startTime, "d") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 800 }, noWrap: true, children: shift.position || "Shift" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 500 }, noWrap: true, children: [
                    sfmt(shift.startTime, "EEE"),
                    " · ",
                    sfmt(shift.startTime, "h:mm a"),
                    " – ",
                    sfmt(shift.endTime, "h:mm a")
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, { sx: { color: "text.disabled", fontSize: 20 } })
              ]
            }
          )
        },
        shift.id
      )) })
    ] })
  ] });
}

export { MuiDashboard as default };
