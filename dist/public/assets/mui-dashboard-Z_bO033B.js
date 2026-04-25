import { aG as useQueryClient, a0 as useTheme, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, $ as useLocation, ag as alpha, aC as ScheduleIcon, aD as TradeIcon, ak as AutoAwesome, bk as motion, b7 as Paper, aJ as Stack, aj as Typography, bl as format, am as Chip, bm as Divider, aK as Button, r as reactExports, bn as Skeleton, bo as ArrowForward, ab as VerifiedIcon, aF as ReportIcon, a as React, bp as AddIcon, bq as TaxIcon, br as Grid, a3 as CalendarIcon, bs as AccessTime, a7 as TrendingUpIcon, a5 as PeopleIcon, bt as Card, bu as CardContent, al as Avatar, bv as BellIcon, an as Tooltip, af as IconButton, bw as CheckIcon, bx as CloseIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, bA as TextField, bB as DialogActions, bC as isValid } from './vendor-v-EuVKxF.js';
import { g as getCurrentUser, i as isManager, a as isAdmin, P as PesoIcon, T as TransitionLink, b as getInitials, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { S as StatCard, E as EmptyState } from './cards-Du3qVCqM.js';
import MuiBranches from './mui-branches-U1sk8tW8.js';

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
    staleTime: 30 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const { data: employeeShifts, isLoading: employeeShiftsLoading } = useQuery({
    queryKey: ["/api/shifts"],
    enabled: !isManagerRole,
    staleTime: 30 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const approvals = dashboardStats ? { approvals: dashboardStats.approvals || [] } : void 0;
  const timeOffResponse = dashboardStats ? { requests: dashboardStats.timeOffRequests || [] } : void 0;
  const shifts = dashboardStats ? { shifts: dashboardStats.shifts || [] } : void 0;
  const teamHours = dashboardStats?.teamHours || {};
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", bgcolor: "background.default", p: isManagerRole ? 3 : 0 }, children: isAdminRole ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, { currentUser, teamHours, teamHoursLoading, todayShifts, shiftsLoading }) : isManagerRole ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    ManagerDashboard,
    {
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
  rejectTimeOffMutation
}) {
  const theme = useTheme();
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectingRequest, setRejectingRequest] = React.useState(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const todayRoster = React.useMemo(() => {
    const rosterByEmployee = /* @__PURE__ */ new Map();
    [...todayShifts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).forEach((shift) => {
      const employeeId = shift.user?.id || shift.userId || shift.id;
      if (!rosterByEmployee.has(employeeId)) {
        rosterByEmployee.set(employeeId, shift);
      }
    });
    return Array.from(rosterByEmployee.values());
  }, [todayShifts]);
  const recentlyHandledApprovals = approvals?.approvals?.filter((a) => a.status === "rejected" || a.status === "approved")?.slice(0, 5) || [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 4, sx: { maxWidth: 1400, mx: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 0,
        sx: {
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          p: { xs: 3, lg: 4 }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" } }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", animation: "pulse 2s infinite" } }),
                    label: "Active Session",
                    sx: {
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.main",
                      fontWeight: 600,
                      "& .MuiChip-icon": { ml: 1 }
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 500 }, children: format(/* @__PURE__ */ new Date(), "EEEE, MMMM d, yyyy") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h3", sx: { fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }, children: [
                "Welcome, ",
                currentUser?.firstName || "Manager"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", sx: { fontSize: "1.1rem" }, children: "Here's a quick overview of your team's schedule and tasks today." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: { xs: 2, lg: 0 } }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  sx: {
                    bgcolor: "primary.main",
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    "&:hover": { transform: "translateY(-1px)", boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.35)}` }
                  },
                  children: "Add Shift"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/payroll-management", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, {}),
                  sx: {
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                  },
                  children: "Payroll"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%)`, zIndex: 0 } })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 3 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Today's Shifts",
          value: todayRoster.length,
          subtitle: format(/* @__PURE__ */ new Date(), "PP"),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, {}),
          color: "success",
          sx: { height: "100%" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 3 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Weekly Hours",
          value: teamHours?.thisWeek?.toFixed(1) || "0.0",
          subtitle: `${teamHours?.weekShifts || 0} shifts completed`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, {}),
          color: "primary",
          sx: { height: "100%" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 3 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Monthly Hours",
          value: teamHours?.thisMonth?.toFixed(1) || "0.0",
          subtitle: `${teamHours?.monthShifts || 0} total shifts`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUpIcon, {}),
          color: "secondary",
          sx: { height: "100%" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 3 }, children: teamHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 130, sx: { borderRadius: 3 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Team Members",
          value: teamHours?.employeeCount || 0,
          subtitle: "Active staff",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}),
          color: "info",
          sx: { height: "100%" }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: (theme2) => `0 4px 20px ${alpha(theme2.palette.common.black, 0.05)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: { xs: 2, sm: 3 } }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { color: "primary" }),
              " Today's Roster"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              todayRoster.length,
              " employees scheduled"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}), sx: { fontWeight: 600 }, children: "Manage" }) })
        ] }),
        shiftsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 70, sx: { borderRadius: 2 } }, i)) }) : todayRoster.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1.5, children: todayRoster.slice(0, 5).map((shift) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              transition: "all 0.2s",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: shift.user?.photoUrl || void 0, sx: { bgcolor: "primary.main", width: 40, height: 40, fontSize: "0.9rem", fontWeight: 600 }, children: getInitials(shift.user?.firstName, shift.user?.lastName, shift.user?.username) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: shift.user?.firstName ? `${shift.user.firstName} ${shift.user.lastName || ""}`.trim() : shift.position }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 12 } }),
                    " ",
                    shift.position
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 700, fontFamily: "monospace", color: "text.primary" }, children: new Date(shift.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Start Time" })
              ] })
            ]
          },
          shift.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 48, opacity: 0.5 } }), title: "No shifts scheduled", description: "Your team has the day off." })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%", borderRadius: 4, bgcolor: "background.paper", boxShadow: (theme2) => `0 4px 20px ${alpha(theme2.palette.common.black, 0.05)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: { xs: 2, sm: 3 } }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, { color: "warning" }),
              " Approvals & Requests"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              pendingTimeOffRequests.length,
              " pending requests"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/time-off", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", color: "warning", endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}), sx: { fontWeight: 600 }, children: "View All" }) })
        ] }),
        timeOffLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 80, sx: { borderRadius: 2 } }, i)) }) : pendingTimeOffRequests.length > 0 || recentlyHandledApprovals.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
          pendingTimeOffRequests.slice(0, 3).map((request) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: request.user?.photoUrl || void 0, sx: { bgcolor: alpha(theme.palette.warning.main, 0.2), color: "warning.main", fontWeight: 700 }, children: getInitials(request.user?.firstName, request.user?.lastName, request.user?.username) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: request.user?.firstName ? `${request.user.firstName} ${request.user.lastName || ""}`.trim() : request.employeeName || "Team Member" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { mt: 0.5 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: request.type?.replace("_", " "), sx: { height: 18, fontSize: "0.65rem", fontWeight: 600, textTransform: "capitalize" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                        format(new Date(request.startDate), "MMM d"),
                        " - ",
                        format(new Date(request.endDate), "MMM d")
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Approve", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => approveTimeOffMutation.mutate(request.id), disabled: approveTimeOffMutation.isPending, sx: { bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main", "&:hover": { bgcolor: "success.main", color: "white" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { fontSize: "small" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Reject", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => {
                    setRejectingRequest(request);
                    setRejectionReason("");
                    setRejectDialogOpen(true);
                  }, disabled: rejectTimeOffMutation.isPending, sx: { bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", "&:hover": { bgcolor: "error.main", color: "white" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, { fontSize: "small" }) }) })
                ] })
              ]
            },
            request.id
          )),
          pendingTimeOffRequests.length < 3 && recentlyHandledApprovals.map((approval) => {
            const isRejected = approval.status === "rejected";
            const color = isRejected ? theme.palette.error : theme.palette.success;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(color.main, 0.03),
                  border: `1px solid ${alpha(color.main, 0.1)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600, color: "text.primary" }, children: approval.requestedByUser?.firstName ? `${approval.requestedByUser.firstName} ${approval.requestedByUser.lastName || ""}`.trim() : approval.requestedBy?.firstName ? `${approval.requestedBy.firstName} ${approval.requestedBy.lastName || ""}`.trim() : "Team Member" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: approval.status, color: isRejected ? "error" : "success", variant: "outlined", sx: { height: 20, fontSize: "0.65rem", fontWeight: 600, textTransform: "capitalize" } })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.5 }, children: [
                    approval.type?.replace("_", " "),
                    " request ",
                    isRejected ? "rejected" : "approved",
                    "."
                  ] }),
                  isRejected && approval.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { display: "block", mt: 1, p: 1, bgcolor: alpha(theme.palette.error.main, 0.08), borderRadius: 1, color: theme.palette.error.main, fontStyle: "italic" }, children: [
                    "Reason: ",
                    approval.reason
                  ] })
                ]
              },
              approval.id
            );
          })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedIcon, { color: "success", sx: { fontSize: 48, opacity: 0.5 } }), title: "All caught up!", description: "No pending requests." })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: rejectDialogOpen, onClose: () => setRejectDialogOpen(false), maxWidth: "xs", fullWidth: true, PaperProps: { sx: { borderRadius: 3 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: 800, color: "error.main", pb: 1 }, children: "Reject Time-Off Request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        rejectingRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
          "Rejecting ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: rejectingRequest.user?.firstName || rejectingRequest.employeeName || "this employee" }),
          "'s request. Optionally provide a reason so they know why."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            autoFocus: true,
            fullWidth: true,
            multiline: true,
            rows: 3,
            label: "Rejection Reason",
            placeholder: "e.g. Insufficient staffing coverage on this date.",
            value: rejectionReason,
            onChange: (e) => setRejectionReason(e.target.value),
            inputProps: { maxLength: 300 },
            helperText: `${rejectionReason.length}/300`
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2, gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setRejectDialogOpen(false), variant: "outlined", sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (rejectingRequest) rejectTimeOffMutation.mutate({ requestId: rejectingRequest.id, rejectionReason: rejectionReason.trim() || void 0 });
              setRejectDialogOpen(false);
              setRejectingRequest(null);
              setRejectionReason("");
            },
            variant: "contained",
            color: "error",
            disabled: rejectTimeOffMutation.isPending,
            sx: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
            children: "Confirm Rejection"
          }
        )
      ] })
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
  const currentPeriod = payrollData?.period;
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
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 24 } }),
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
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: "success.main", lineHeight: 1.2, mt: 0.5 }, children: estNetPay > 0 ? `₱${Number(estNetPay).toLocaleString("en-PH", { minimumFractionDigits: 0 })}` : "--" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, textAlign: "center", py: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }, children: "Shifts" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: "info.main", lineHeight: 1.2, mt: 0.5 }, children: employeeShifts?.shifts?.length || 0 })
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
