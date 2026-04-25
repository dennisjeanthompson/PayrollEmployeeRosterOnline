import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, cV as parseISO, d0 as isFuture, aH as useMutation, Q as jsxRuntimeExports, X as Box, aj as Typography, aJ as Stack, af as IconButton, cN as RefreshIcon, aK as Button, bp as AddIcon, d1 as ToggleButtonGroup, d2 as ToggleButton, a3 as CalendarIcon, d3 as ViewListIcon, cO as LinearProgress, bE as Alert, d4 as AlertTitle, br as Grid, b7 as Paper, ag as alpha, al as Avatar, cr as Send, aD as TradeIcon, d5 as PendingActionsIcon, aU as CheckCircleIcon, bl as format, c5 as Tabs, c6 as Tab, am as Chip, bw as CheckIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, b0 as FormControl, b$ as InputLabel, b1 as Select, b2 as MenuItem, bA as TextField, bB as DialogActions, bo as ArrowForward, bs as AccessTime, bx as CloseIcon, bU as CancelIcon } from './vendor-v-EuVKxF.js';
import { g as getCurrentUser, i as isManager, e as capitalizeFirstLetter, c as apiRequest, b as getInitials } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';
import { F as FullCalendar, i as index, a as index$1, b as index$2, c as index$3 } from './vendor-calendar-BweojRQ-.js';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "tabpanel", hidden: value !== index, ...other, children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 2 }, children }) });
}
function MuiShiftTrading() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [createDialogOpen, setCreateDialogOpen] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    shiftId: "",
    targetUserId: "",
    reason: "",
    urgency: "normal"
  });
  const [viewMode, setViewMode] = reactExports.useState("calendar");
  useRealtime({
    enabled: true,
    queryKeys: ["shift-trades", "my-shifts"]
  });
  const { data: tradesResponse, isLoading, refetch } = useQuery({
    queryKey: ["shift-trades"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/shift-trades");
      return response.json();
    },
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    }
  });
  const { data: myShiftsResponse } = useQuery({
    queryKey: ["my-shifts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/shifts");
      return response.json();
    },
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    }
  });
  const { data: employeesResponse } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/employees");
      return response.json();
    },
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    }
  });
  const trades = Array.isArray(tradesResponse?.trades) ? tradesResponse.trades : Array.isArray(tradesResponse) ? tradesResponse : [];
  const myShifts = Array.isArray(myShiftsResponse?.shifts) ? myShiftsResponse.shifts : Array.isArray(myShiftsResponse) ? myShiftsResponse : [];
  const employees = Array.isArray(employeesResponse?.employees) ? employeesResponse.employees : Array.isArray(employeesResponse) ? employeesResponse : [];
  const myRequests = trades.filter((t) => t.requesterId === currentUser?.id);
  const incomingRequests = trades.filter((t) => t.targetUserId === currentUser?.id);
  const pendingApprovals = trades.filter((t) => t.status === "pending" && isManagerRole);
  const futureShifts = myShifts.filter((shift) => {
    try {
      const dateToCheck = shift.startTime || shift.date;
      if (!dateToCheck) {
        return false;
      }
      const shiftDate = parseISO(String(dateToCheck));
      if (isNaN(shiftDate.getTime())) {
        return false;
      }
      const isFutureShift = isFuture(shiftDate);
      return isFutureShift;
    } catch (error) {
      return false;
    }
  });
  const createTrade = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/shift-trades", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      toast({ title: "Trade request sent" });
      setCreateDialogOpen(false);
      setFormData({ shiftId: "", targetUserId: "", reason: "", urgency: "normal" });
    },
    onError: (error) => {
      toast({ title: "Failed to send request", description: error?.message, variant: "destructive" });
    }
  });
  const respondToTrade = useMutation({
    mutationFn: async ({ id, accept }) => {
      const response = await apiRequest("PATCH", `/api/shift-trades/${id}`, {
        status: accept ? "accepted" : "rejected"
      });
      return response.json();
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      toast({ title: accept ? "Trade accepted" : "Trade rejected" });
    },
    onError: (error) => {
      toast({ title: "Failed to respond to trade", description: error?.message, variant: "destructive" });
    }
  });
  const approveTradeAsManager = useMutation({
    mutationFn: async ({ id, approve }) => {
      const response = await apiRequest("PATCH", `/api/shift-trades/${id}/approve`, {
        status: approve ? "approved" : "rejected"
      });
      return response.json();
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      toast({ title: approve ? "Trade approved" : "Trade rejected" });
    },
    onError: (error) => {
      toast({ title: "Failed to process trade", description: error?.message, variant: "destructive" });
    }
  });
  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Pending", color: "warning", size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PendingActionsIcon, {}) });
      case "accepted":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Accepted", color: "info", size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}) });
      case "approved":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Approved", color: "success", size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) });
      case "rejected":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Rejected", color: "error", size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}) });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: status, size: "small" });
    }
  };
  const TradeCard = ({ trade, type }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Paper,
    {
      sx: {
        p: 3,
        borderRadius: 2,
        border: `1px solid ${"rgba(255, 255, 255, 0.08)"}`,
        mb: 2
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", alignItems: "flex-start", justifyContent: "space-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, sx: { mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "Shift Trade Request" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: trade.createdAt ? format(parseISO(trade.createdAt), "MMM d, yyyy 'at' h:mm a") : "N/A" })
            ] }),
            getStatusChip(trade.status)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { variant: "outlined", sx: { p: 2, borderRadius: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "From" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mt: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 32, height: 32, bgcolor: "secondary.main", fontSize: "0.875rem" }, children: getInitials(trade.requester?.firstName, trade.requester?.lastName) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { fontWeight: 500, children: [
                  trade.requester?.firstName,
                  " ",
                  trade.requester?.lastName
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 2 }, sx: { display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, { color: "action" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { variant: "outlined", sx: { p: 2, borderRadius: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mt: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 32, height: 32, bgcolor: "info.main", fontSize: "0.875rem" }, children: getInitials(trade.targetUser?.firstName, trade.targetUser?.lastName) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { fontWeight: 500, children: [
                  trade.targetUser?.firstName,
                  " ",
                  trade.targetUser?.lastName
                ] })
              ] })
            ] }) })
          ] }),
          trade.shift && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Paper,
            {
              variant: "outlined",
              sx: {
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                mb: 2
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small", color: "action" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: trade.shift?.date ? format(parseISO(trade.shift.date), "EEEE, MMM d, yyyy") : "N/A" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, { fontSize: "small", color: "action" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: trade.shift?.startTime && trade.shift?.endTime ? `${format(parseISO(trade.shift.startTime), "h:mm a")} - ${format(parseISO(trade.shift.endTime), "h:mm a")}` : "N/A" })
                ] })
              ] })
            }
          ),
          trade.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: "italic" }, children: [
            '"',
            trade.reason,
            '"'
          ] })
        ] }) }),
        trade.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }, children: [
          type === "incoming" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "success",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                onClick: () => respondToTrade.mutate({ id: trade.id, accept: true }),
                disabled: respondToTrade.isPending,
                children: "Accept"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
                onClick: () => respondToTrade.mutate({ id: trade.id, accept: false }),
                disabled: respondToTrade.isPending,
                children: "Decline"
              }
            )
          ] }),
          type === "approval" && isManagerRole && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "success",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                onClick: () => approveTradeAsManager.mutate({ id: trade.id, approve: true }),
                disabled: approveTradeAsManager.isPending,
                children: "Approve"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
                onClick: () => approveTradeAsManager.mutate({ id: trade.id, approve: false }),
                disabled: approveTradeAsManager.isPending,
                children: "Reject"
              }
            )
          ] })
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, minHeight: "100vh", bgcolor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, gutterBottom: true, children: "Shift Trading" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Request to trade shifts with your teammates" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
            onClick: () => setCreateDialogOpen(true),
            children: "New Trade Request"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3, display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ToggleButtonGroup,
      {
        value: viewMode,
        exclusive: true,
        onChange: (_, newView) => {
          if (newView) setViewMode(newView);
        },
        "aria-label": "view mode",
        size: "small",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleButton, { value: "calendar", "aria-label": "calendar view", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { mr: 1 } }),
            "Calendar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleButton, { value: "list", "aria-label": "list view", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ViewListIcon, { sx: { mr: 1 } }),
            "List"
          ] })
        ]
      }
    ) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { mb: 3, borderRadius: 1 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "How Shift Trading Works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 1, sx: { fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", display: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1. Request:" }),
          " Select one of your ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "upcoming shifts" }),
          " and choose a colleague to trade with"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", display: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2. Accept/Decline:" }),
          " Your colleague reviews and accepts or declines your request"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", display: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3. Manager Approval:" }),
          " A manager reviews the accepted trade to ensure coverage"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "My Requests" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, children: myRequests.length })
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.info.main, 0.2), color: "info.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Incoming" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, children: incomingRequests.filter((r) => r.status === "pending").length })
            ] })
          ] })
        }
      ) }),
      isManagerRole && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.warning.main, 0.2), color: "warning.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PendingActionsIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Pending Approval" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, children: pendingApprovals.length })
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.success.main, 0.2), color: "success.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Approved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, children: trades.filter((t) => t.status === "approved").length })
            ] })
          ] })
        }
      ) })
    ] }),
    viewMode === "calendar" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2, height: "700px", borderRadius: 3, overflow: "hidden", "& .fc-event": { cursor: "pointer" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FullCalendar,
      {
        plugins: [index, index$1, index$2, index$3],
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek"
        },
        slotMinTime: "05:00:00",
        slotMaxTime: "23:59:00",
        nowIndicator: true,
        expandRows: true,
        events: [
          // My Shifts (Potential to trade)
          ...myShifts.map((shift) => ({
            id: `shift-${shift.id}`,
            groupId: "my-shifts",
            title: `My Shift: ${format(parseISO(shift.startTime), "h:mm a")}`,
            start: shift.startTime,
            end: shift.endTime,
            backgroundColor: "transparent",
            borderColor: "transparent",
            extendedProps: { type: "shift", originalColor: theme.palette.primary.main, ...shift }
          })),
          // Trades (Visualized)
          ...trades.map((trade) => {
            let color = theme.palette.warning.main;
            if (trade.status === "approved") color = theme.palette.success.main;
            if (trade.status === "accepted") color = theme.palette.info.main;
            if (trade.status === "rejected") color = theme.palette.error.main;
            const isIncoming = trade.targetUserId === currentUser?.id;
            const isOutgoing = trade.requesterId === currentUser?.id;
            const start = trade.shift?.startTime;
            const end = trade.shift?.endTime;
            if (!start) return null;
            return {
              id: `trade-${trade.id}`,
              title: `${isIncoming ? "Incoming" : isOutgoing ? "My Req" : "Trade"}: ${capitalizeFirstLetter(trade.status)}`,
              start,
              end,
              backgroundColor: "transparent",
              borderColor: "transparent",
              extendedProps: { type: "trade", originalColor: color, ...trade }
            };
          }).filter(Boolean)
        ],
        eventContent: (eventInfo) => {
          const color = eventInfo.event.extendedProps.originalColor || theme.palette.primary.main;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
            borderLeft: `4px solid ${color}`,
            borderTop: `1px solid rgba(255,255,255,0.05)`,
            borderRight: `1px solid rgba(255,255,255,0.05)`,
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
            fontWeight: 600,
            fontSize: "0.85em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            boxSizing: "border-box"
          }, children: eventInfo.event.title });
        },
        eventClick: (info) => {
          const props = info.event.extendedProps;
          if (props.type === "shift") {
            setFormData({
              ...formData,
              shiftId: props.id
            });
            setCreateDialogOpen(true);
          } else {
            toast({
              title: "Trade Details",
              description: `${info.event.title} - Switch to List View for actions.`
            });
          }
        },
        height: "100%"
      }
    ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { borderRadius: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: activeTab,
          onChange: (_, v) => setActiveTab(v),
          sx: { borderBottom: 1, borderColor: "divider", px: 2 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "My Requests" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Incoming" }),
                  incomingRequests.filter((r) => r.status === "pending").length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: incomingRequests.filter((r) => r.status === "pending").length,
                      size: "small",
                      color: "primary"
                    }
                  )
                ] })
              }
            ),
            isManagerRole && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Manager Approvals" }),
                  pendingApprovals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: pendingApprovals.length, size: "small", color: "warning" })
                ] })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: activeTab, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 3 }, children: myRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 8, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 64, color: "text.disabled", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "No trade requests yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.disabled", sx: { mb: 2 }, children: 'Use the "New Trade Request" button above to get started' })
      ] }) : myRequests.map((trade) => /* @__PURE__ */ jsxRuntimeExports.jsx(TradeCard, { trade, type: "outgoing" }, trade.id)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: activeTab, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 3 }, children: incomingRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 8, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 64, color: "text.disabled", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "No incoming requests" })
      ] }) : incomingRequests.map((trade) => /* @__PURE__ */ jsxRuntimeExports.jsx(TradeCard, { trade, type: "incoming" }, trade.id)) }) }),
      isManagerRole && /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: activeTab, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 3 }, children: pendingApprovals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 8, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 64, color: "success.main", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "All trades reviewed" })
      ] }) : pendingApprovals.map((trade) => /* @__PURE__ */ jsxRuntimeExports.jsx(TradeCard, { trade, type: "approval" }, trade.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: createDialogOpen,
        onClose: () => setCreateDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        slotProps: {
          backdrop: { sx: { backdropFilter: "blur(4px)" } }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Request Shift Trade" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 2 }, children: [
            futureShifts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "No upcoming shifts available for trading. Check back later for future schedule updates." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, disabled: futureShifts.length === 0, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Select Shift" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: formData.shiftId,
                  label: "Select Shift",
                  onChange: (e) => setFormData({ ...formData, shiftId: e.target.value }),
                  children: futureShifts.length > 0 ? futureShifts.map((shift) => {
                    try {
                      const startDate = shift.startTime ? parseISO(shift.startTime) : null;
                      const startTime = shift.startTime ? parseISO(shift.startTime) : null;
                      const endTime = shift.endTime ? parseISO(shift.endTime) : null;
                      if (!startDate || !startTime || !endTime) return null;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: shift.id, children: [
                        format(startDate, "EEE, MMM d, yyyy"),
                        " - ",
                        format(startTime, "h:mm a"),
                        " to ",
                        format(endTime, "h:mm a")
                      ] }, shift.id);
                    } catch (error) {
                      return null;
                    }
                  }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, children: "No future shifts available" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Trade With (Colleague)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: formData.targetUserId,
                  label: "Trade With (Colleague)",
                  onChange: (e) => setFormData({ ...formData, targetUserId: e.target.value }),
                  children: employees.filter((emp) => emp.id !== currentUser?.id && emp.isActive !== false && (!currentUser?.branchId || emp.branchId === currentUser.branchId)).map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: emp.id, children: [
                    emp.firstName,
                    " ",
                    emp.lastName
                  ] }, emp.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Urgency Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.urgency,
                  label: "Urgency Level",
                  onChange: (e) => setFormData({ ...formData, urgency: e.target.value }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "low", children: "Low - Flexible timeline" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "normal", children: "Normal - Standard request" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "urgent", children: "Urgent - Time sensitive" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Reason for Trade",
                multiline: true,
                rows: 4,
                fullWidth: true,
                value: formData.reason,
                onChange: (e) => setFormData({ ...formData, reason: e.target.value }),
                placeholder: "Explain why you need to trade this shift (helps manager decide)...",
                helperText: "Provide context for your trade request"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreateDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, {}),
                onClick: () => createTrade.mutate(formData),
                disabled: !formData.shiftId || !formData.targetUserId || !formData.reason || createTrade.isPending || futureShifts.length === 0,
                children: createTrade.isPending ? "Sending..." : "Send Trade Request"
              }
            )
          ] })
        ]
      }
    )
  ] }) });
}

export { MuiShiftTrading as default };
