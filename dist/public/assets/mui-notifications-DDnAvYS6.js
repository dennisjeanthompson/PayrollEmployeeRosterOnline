import { a0 as useTheme, a1 as useMediaQuery, aG as useQueryClient, $ as useLocation, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, cX as ShieldIcon, X as Box, aJ as Stack, aj as Typography, aK as Button, aL as DoneAllIcon, ag as alpha, bn as Skeleton, aN as EmptyIcon, cV as parseISO, cc as isToday, cY as isYesterday, cZ as isThisWeek, bl as format, c_ as DotIcon, am as Chip, aO as formatDistanceToNow, c$ as ExpandIcon, c0 as Collapse, aQ as OpenIcon, bw as CheckIcon, an as Tooltip, af as IconButton, bG as DeleteIcon, aR as InfoIcon, aT as ErrorIcon, aU as CheckCircleIcon, bD as WarningIcon, aV as PayIcon, aW as EventIcon, aD as TradeIcon, aC as ScheduleIcon } from './vendor-v-EuVKxF.js';
import { u as useAuth, i as isManager, c as apiRequest, P as PesoIcon } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';

const TYPE_CONFIG = {
  shift_update: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 20 } }), color: "#3B82F6", bg: "#EFF6FF", label: "Schedule" },
  shift_assigned: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 20 } }), color: "#3B82F6", bg: "#EFF6FF", label: "Assigned" },
  schedule: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 20 } }), color: "#3B82F6", bg: "#EFF6FF", label: "Schedule" },
  shift_trade: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 20 } }), color: "#8B5CF6", bg: "#F5F3FF", label: "Trade" },
  trade_request: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 20 } }), color: "#8B5CF6", bg: "#F5F3FF", label: "Trade" },
  time_off: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { sx: { fontSize: 20 } }), color: "#F59E0B", bg: "#FFFBEB", label: "Time Off" },
  time_off_approved: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 20 } }), color: "#10B981", bg: "#ECFDF5", label: "Approved" },
  time_off_rejected: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 20 } }), color: "#EF4444", bg: "#FEF2F2", label: "Rejected" },
  payroll: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PayIcon, { sx: { fontSize: 20 } }), color: "#06B6D4", bg: "#ECFEFF", label: "Payroll" },
  payment: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PayIcon, { sx: { fontSize: 20 } }), color: "#06B6D4", bg: "#ECFEFF", label: "Payment" },
  approval: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 20 } }), color: "#10B981", bg: "#ECFDF5", label: "Approved" },
  rejection: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 20 } }), color: "#EF4444", bg: "#FEF2F2", label: "Rejected" },
  adjustment: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { sx: { fontSize: 20 } }), color: "#06B6D4", bg: "#ECFEFF", label: "Adjustment" },
  warning: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { sx: { fontSize: 20 } }), color: "#F59E0B", bg: "#FFFBEB", label: "Warning" },
  success: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 20 } }), color: "#10B981", bg: "#ECFDF5", label: "Success" },
  error: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 20 } }), color: "#EF4444", bg: "#FEF2F2", label: "Error" },
  info: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 20 } }), color: "#6B7280", bg: "#F9FAFB", label: "Info" }
};
function getConfig(type) {
  return TYPE_CONFIG[type] || { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 20 } }), color: "#6B7280", bg: "#F9FAFB", label: "General" };
}
const MANAGER_ACTION_TYPES = /* @__PURE__ */ new Set(["trade_request", "time_off"]);
function getNavigatePath(type) {
  if (type.includes("trade") || type.includes("shift") || type.includes("time_off") || type === "schedule") return "/schedule";
  if (type === "payroll" || type === "payment") return "/pay-summary";
  return null;
}
function groupByDate(notifications) {
  const groups = {};
  const order = [];
  for (const n of notifications) {
    const d = parseISO(n.createdAt);
    let label;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else if (isThisWeek(d, { weekStartsOn: 1 })) label = format(d, "EEEE");
    else label = format(d, "MMM d, yyyy");
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(n);
  }
  return order.map((label) => ({ label, items: groups[label] }));
}
function MuiNotifications() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isManagerRole = isManager();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = reactExports.useState("all");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  useRealtime({
    enabled: isAuthenticated,
    queryKeys: ["/api/notifications"],
    onEvent: (event) => {
      if (event === "notification:created" || event === "notification" || event.startsWith("time-off:") || event.startsWith("trade:") || event.startsWith("shift:")) {
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      }
    }
  });
  const { data: resp, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/notifications");
      return r.json();
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: isAuthenticated
  });
  const isLoading = isAuthenticated && isNotificationsLoading;
  const all = resp?.notifications || [];
  const unread = reactExports.useMemo(() => all.filter((n) => !n.isRead), [all]);
  const actionRequired = reactExports.useMemo(
    () => isManagerRole ? all.filter((n) => MANAGER_ACTION_TYPES.has(n.type) && !n.isRead) : [],
    [all, isManagerRole]
  );
  const visibleList = reactExports.useMemo(() => {
    if (filter === "unread") return unread;
    if (filter === "action") return actionRequired;
    return all;
  }, [filter, all, unread, actionRequired]);
  const grouped = reactExports.useMemo(() => groupByDate(visibleList), [visibleList]);
  const markRead = useMutation({
    mutationFn: (id) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] })
  });
  const markAllRead = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All marked as read" });
    }
  });
  const deleteNotif = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Notification dismissed" });
    }
  });
  const handleClick = reactExports.useCallback((n) => {
    if (!n.isRead) markRead.mutate(n.id);
    setExpandedId((prev) => prev === n.id ? null : n.id);
  }, [markRead]);
  const handleNav = reactExports.useCallback((n) => {
    if (!n.isRead) markRead.mutate(n.id);
    const path = getNavigatePath(n.type);
    if (path) reactExports.startTransition(() => setLocation(path));
  }, [markRead, setLocation]);
  const filterBtns = [
    { id: "all", label: "All", count: all.length },
    { id: "unread", label: "Unread", count: unread.length },
    ...isManagerRole ? [{ id: "action", label: "Action Required", count: actionRequired.length, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldIcon, { sx: { fontSize: 15 } }) }] : []
  ];
  const bg = isDark ? "#151010" : "#F8F9FB";
  const surface = isDark ? "#1C1410" : "#FFFFFF";
  const surfaceAlt = isDark ? "#241B14" : "#F9FAFB";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const txt1 = isDark ? "#F5EDE4" : "#111827";
  const txt2 = isDark ? "rgba(245,237,228,0.55)" : "#6B7280";
  const txt3 = isDark ? "rgba(245,237,228,0.3)" : "#D1D5DB";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", bgcolor: bg }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      bgcolor: surface,
      borderBottom: `1px solid ${border}`,
      px: { xs: 2, sm: 3, md: 4 },
      pt: { xs: 2.5, sm: 3 },
      pb: 0
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", spacing: 1.5, sx: { mb: 2.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
              fontWeight: 800,
              fontSize: { xs: "1.35rem", sm: "1.6rem" },
              color: txt1,
              letterSpacing: "-0.02em"
            }, children: "Notifications" }),
            unread.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              bgcolor: "#EF4444",
              color: "#FFF",
              borderRadius: "12px",
              px: 1,
              fontSize: "0.72rem",
              fontWeight: 800,
              lineHeight: "22px",
              minWidth: 24,
              textAlign: "center"
            }, children: [
              unread.length,
              " new"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { sx: { color: txt2, fontSize: "0.82rem", fontWeight: 500, mt: 0.25 }, children: [
            all.length === 0 ? "No notifications yet" : unread.length > 0 ? `${unread.length} unread of ${all.length} total` : `${all.length} notifications · All read`,
            isManagerRole && actionRequired.length > 0 && ` · ${actionRequired.length} need review`
          ] })
        ] }),
        unread.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DoneAllIcon, { sx: { fontSize: 16 } }),
            onClick: () => markAllRead.mutate(),
            disabled: markAllRead.isPending,
            sx: {
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 0.85,
              fontSize: "0.8rem",
              color: txt1,
              bgcolor: surfaceAlt,
              border: `1px solid ${border}`,
              "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6" }
            },
            children: isMobile ? "Read all" : "Mark all read"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0, children: filterBtns.map((f) => {
        const active = filter === f.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            onClick: () => setFilter(f.id),
            sx: {
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: { xs: 1.5, sm: 2.5 },
              py: 1.25,
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: active ? 700 : 500,
              color: active ? txt1 : txt2,
              borderBottom: "2px solid",
              borderColor: active ? f.id === "action" ? "#F59E0B" : isDark ? "#F5EDE4" : "#111827" : "transparent",
              transition: "all 0.15s ease",
              "&:hover": { color: txt1 },
              userSelect: "none"
            },
            children: [
              f.icon,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.label }),
              f.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                bgcolor: active ? f.id === "action" ? alpha("#F59E0B", 0.15) : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: active ? f.id === "action" ? "#D97706" : txt1 : txt2,
                borderRadius: "10px",
                px: 0.85,
                fontSize: "0.65rem",
                fontWeight: 800,
                lineHeight: "18px",
                minWidth: 20,
                textAlign: "center"
              }, children: f.count })
            ]
          },
          f.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1, children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rounded", height: 72, sx: { borderRadius: 2 } }, i)) }) : visibleList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      bgcolor: surface,
      borderRadius: 4,
      border: `1px solid ${border}`,
      textAlign: "center",
      py: { xs: 8, sm: 12 },
      px: 3
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        mx: "auto",
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: surfaceAlt,
        border: `2px dashed ${border}`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyIcon, { sx: { fontSize: 36, color: txt3 } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontWeight: 700, fontSize: "1.05rem", color: txt1, mb: 0.5 }, children: filter === "action" ? "No pending actions" : filter === "unread" ? "All caught up!" : "No notifications yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { color: txt2, fontSize: "0.85rem", maxWidth: 380, mx: "auto" }, children: filter === "action" ? "All employee requests have been reviewed" : filter === "unread" ? "You've read all your notifications" : "Updates about shifts, trades, and time off will show up here" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 3, children: grouped.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, sx: { mb: 1, px: 0.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
          fontSize: "0.68rem",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: txt3,
          whiteSpace: "nowrap"
        }, children: group.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, height: "1px", bgcolor: border } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontSize: "0.62rem", fontWeight: 700, color: txt3 }, children: group.items.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        bgcolor: surface,
        borderRadius: 3,
        border: `1px solid ${border}`,
        overflow: "hidden"
      }, children: group.items.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        NotificationRow,
        {
          notification: n,
          isExpanded: expandedId === n.id,
          isManagerRole,
          isDark,
          isLast: idx === group.items.length - 1,
          surfaceAlt,
          border,
          txt1,
          txt2,
          txt3,
          onClick: () => handleClick(n),
          onNavigate: () => handleNav(n),
          onDelete: () => deleteNotif.mutate(n.id),
          onMarkRead: () => markRead.mutate(n.id)
        },
        n.id
      )) })
    ] }, group.label)) }) })
  ] });
}
function NotificationRow({
  notification: n,
  isExpanded,
  isManagerRole,
  isDark,
  isLast,
  surfaceAlt,
  border,
  txt1,
  txt2,
  txt3,
  onClick,
  onNavigate,
  onDelete,
  onMarkRead
}) {
  const cfg = getConfig(n.type);
  const isAction = isManagerRole && MANAGER_ACTION_TYPES.has(n.type) && !n.isRead;
  const hasNav = !!getNavigatePath(n.type);
  const parsedData = reactExports.useMemo(() => {
    if (!n.data) return null;
    try {
      return typeof n.data === "string" ? JSON.parse(n.data) : n.data;
    } catch {
      return null;
    }
  }, [n.data]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      onClick,
      sx: {
        position: "relative",
        cursor: "pointer",
        px: { xs: 2, sm: 3 },
        py: { xs: 1.75, sm: 2 },
        borderBottom: isLast ? "none" : `1px solid ${border}`,
        transition: "background 0.15s ease",
        "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.012)" },
        // Left accent bar for unread
        ...!n.isRead ? {
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            bgcolor: cfg.color,
            borderRadius: "0 3px 3px 0"
          }
        } : {},
        // Action tint
        ...isAction ? { bgcolor: isDark ? "rgba(245,158,11,0.04)" : "rgba(245,158,11,0.02)" } : {}
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "flex-start", spacing: { xs: 1.5, sm: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isDark ? alpha(cfg.color, 0.12) : cfg.bg,
            color: cfg.color,
            flexShrink: 0,
            mt: 0.25,
            border: `1px solid ${alpha(cfg.color, isDark ? 0.18 : 0.1)}`
          }, children: cfg.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 0.15 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
                fontWeight: n.isRead ? 500 : 700,
                fontSize: "0.88rem",
                color: n.isRead ? txt2 : txt1,
                lineHeight: 1.35,
                flex: 1,
                minWidth: 0
              }, noWrap: true, children: n.title }),
              !n.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(DotIcon, { sx: { fontSize: 9, color: cfg.color, flexShrink: 0 } }),
              isAction && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Needs Review", size: "small", sx: {
                height: 22,
                fontSize: "0.63rem",
                fontWeight: 800,
                bgcolor: alpha("#F59E0B", 0.12),
                color: "#D97706",
                border: `1px solid ${alpha("#F59E0B", 0.2)}`,
                flexShrink: 0
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
                fontSize: "0.72rem",
                fontWeight: 500,
                color: txt3,
                whiteSpace: "nowrap",
                flexShrink: 0,
                display: { xs: "none", md: "block" }
              }, children: formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
              fontSize: "0.82rem",
              color: txt2,
              lineHeight: 1.5,
              ...!isExpanded && { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
            }, children: n.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mt: 0.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                display: "inline-flex",
                alignItems: "center",
                px: 0.85,
                py: 0.1,
                borderRadius: 1.5,
                bgcolor: isDark ? alpha(cfg.color, 0.08) : cfg.bg,
                border: `1px solid ${alpha(cfg.color, isDark ? 0.12 : 0.08)}`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: cfg.color,
                textTransform: "uppercase"
              }, children: cfg.label }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: {
                fontSize: "0.68rem",
                fontWeight: 500,
                color: txt3,
                display: { xs: "block", md: "none" }
              }, children: formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandIcon, { sx: {
                fontSize: 18,
                color: txt3,
                transition: "transform 0.2s",
                transform: isExpanded ? "rotate(180deg)" : "none"
              } })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: isExpanded, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2, ml: { xs: 0, sm: 6.5 } }, children: [
          parsedData && (() => {
            const HIDE = /* @__PURE__ */ new Set([
              "tradeId",
              "shiftId",
              "requestId",
              "userId",
              "fromUserId",
              "toUserId",
              "branchId",
              "approvedBy",
              "id",
              "periodId",
              "shortNotice",
              "minimumAdvanceDays",
              "employeeId",
              "managerId",
              "notificationId",
              "createdAt",
              "updatedAt",
              "entryId",
              "entry_id",
              "adjustmentLogId",
              "adjustment_log_id",
              "logId",
              "log_id"
            ]);
            const LABELS = {
              shiftDate: "Shift Date",
              requesterName: "From",
              takerName: "Accepted By",
              employeeName: "Employee",
              tradeType: "Type",
              status: "Status",
              startDate: "Start",
              endDate: "End",
              reason: "Reason",
              netPay: "Net Pay",
              position: "Position",
              advanceDays: "Notice"
            };
            const entries = Object.entries(parsedData).filter(([k, v]) => !HIDE.has(k) && v != null && typeof v !== "object");
            if (entries.length === 0) return null;
            const statusColors = {
              approved: "#10B981",
              rejected: "#EF4444",
              pending: "#F59E0B",
              pending_approval: "#F59E0B",
              taken: "#3B82F6",
              open: "#8B5CF6",
              direct: "#6366F1",
              cancelled: "#9CA3AF"
            };
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", flexWrap: "wrap", gap: 1, sx: { mb: 2 }, children: entries.map(([k, v]) => {
              let display = String(v);
              if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                try {
                  display = format(new Date(v), "MMM d, yyyy");
                } catch {
                }
              }
              const label = LABELS[k] || k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
              const isStatus = k === "status" || k === "tradeType";
              const sColor = isStatus ? statusColors[String(v)] : void 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "capitalize",
                bgcolor: sColor ? alpha(sColor, isDark ? 0.1 : 0.06) : surfaceAlt,
                border: "1px solid",
                borderColor: sColor ? alpha(sColor, 0.2) : border,
                color: sColor || txt2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { opacity: 0.55, fontWeight: 500 }, children: [
                  label,
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700 }, children: isStatus ? display.replace(/_/g, " ") : display })
              ] }, k);
            }) });
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { mb: 0.5 }, children: [
            hasNav && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenIcon, { sx: { fontSize: 14 } }),
                onClick: (e) => {
                  e.stopPropagation();
                  onNavigate();
                },
                sx: {
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 0.75,
                  fontSize: "0.8rem",
                  color: "#FFF",
                  bgcolor: cfg.color,
                  "&:hover": { bgcolor: cfg.color, filter: "brightness(0.9)" }
                },
                children: n.type.includes("payroll") || n.type === "payment" ? "View Payroll" : "View Schedule"
              }
            ),
            isAction && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldIcon, { sx: { fontSize: 14 } }),
                onClick: (e) => {
                  e.stopPropagation();
                  onNavigate();
                },
                sx: {
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 0.75,
                  fontSize: "0.8rem",
                  color: "#FFF",
                  bgcolor: "#F59E0B",
                  "&:hover": { bgcolor: "#D97706" }
                },
                children: "Review"
              }
            ),
            !n.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }),
                onClick: (e) => {
                  e.stopPropagation();
                  onMarkRead();
                },
                sx: {
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.75,
                  fontSize: "0.8rem",
                  color: txt2,
                  bgcolor: surfaceAlt,
                  border: `1px solid ${border}`,
                  "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }
                },
                children: "Mark Read"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Dismiss", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (e) => {
                  e.stopPropagation();
                  onDelete();
                },
                sx: { width: 34, height: 34, color: txt3, "&:hover": { color: "#EF4444", bgcolor: alpha("#EF4444", 0.08) } },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { sx: { fontSize: 16 } })
              }
            ) })
          ] })
        ] }) })
      ]
    }
  );
}

export { MuiNotifications as default };
