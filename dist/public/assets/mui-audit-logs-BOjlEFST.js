import { a0 as useTheme, r as reactExports, ax as useQuery, Q as jsxRuntimeExports, X as Box, aM as CircularProgress, ag as alpha, ad as HistoryIcon, aJ as Stack, aj as Typography, an as Tooltip, av as Badge, c_ as DotIcon, bt as Card, bu as CardContent, de as CardHeader, ds as FilterIcon, bA as TextField, b2 as MenuItem, aK as Button, ae as DownloadIcon, cP as TableContainer, b7 as Paper, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, bl as format, am as Chip, c7 as PersonIcon, aO as formatDistanceToNow, af as IconButton, bV as Visibility, dt as TablePagination, aq as Drawer, bx as CloseIcon, bm as Divider, b4 as Snackbar, bE as Alert, bp as AddIcon, bG as DeleteIcon, aU as CheckCircleIcon, bU as CancelIcon, du as PaymentIcon, aD as TradeIcon, aC as ScheduleIcon, ac as SettingsIcon, bW as EditIcon } from './vendor-v-EuVKxF.js';
import { c as apiRequest } from './main-fla130dr.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';

const actionLabels = {
  employee_create: "Employee Created",
  employee_update: "Employee Updated",
  employee_delete: "Employee Deleted",
  employee_activate: "Employee Activated",
  employee_deactivate: "Employee Deactivated",
  deduction_change: "Deduction Changed",
  rate_create: "Rate Created",
  rate_update: "Rate Updated",
  rate_delete: "Rate Deleted",
  settings_update: "Settings Updated",
  payroll_process: "Payroll Processed",
  payroll_approve: "Payroll Approved",
  payroll_paid: "Payroll Paid",
  payroll_close: "Payroll Closed",
  shift_create: "Shift Created",
  shift_update: "Shift Updated",
  shift_delete: "Shift Deleted",
  trade_approve: "Trade Approved",
  trade_reject: "Trade Rejected",
  time_off_approve: "Time Off Approved",
  time_off_reject: "Time Off Rejected",
  holiday_create: "Holiday Created",
  holiday_update: "Holiday Updated",
  holiday_delete: "Holiday Deleted",
  create: "Created",
  update: "Updated",
  delete: "Deleted"
};
const actionColors = {
  employee_create: "success",
  employee_update: "warning",
  employee_delete: "error",
  employee_activate: "success",
  employee_deactivate: "error",
  deduction_change: "warning",
  rate_create: "success",
  rate_update: "info",
  rate_delete: "error",
  settings_update: "info",
  payroll_process: "primary",
  payroll_approve: "success",
  payroll_paid: "success",
  payroll_close: "info",
  shift_create: "success",
  shift_update: "warning",
  shift_delete: "error",
  trade_approve: "success",
  trade_reject: "error",
  time_off_approve: "success",
  time_off_reject: "error",
  holiday_create: "success",
  holiday_update: "warning",
  holiday_delete: "error",
  create: "success",
  update: "warning",
  delete: "error"
};
const getActionIcon = (action) => {
  if (action.includes("create") || action.includes("add")) return /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { fontSize: "small" });
  if (action.includes("delete")) return /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" });
  if (action.includes("approve") || action.includes("activate") || action.includes("paid")) return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { fontSize: "small" });
  if (action.includes("reject") || action.includes("deactivate")) return /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { fontSize: "small" });
  if (action.includes("payroll")) return /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { fontSize: "small" });
  if (action.includes("trade") || action.includes("swap")) return /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { fontSize: "small" });
  if (action.includes("shift") || action.includes("schedule")) return /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { fontSize: "small" });
  if (action.includes("settings") || action.includes("rate")) return /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, { fontSize: "small" });
  if (action.includes("update") || action.includes("change")) return /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, { fontSize: "small" });
};
const entityTypeLabels = {
  employee: "Employee",
  deduction_rate: "Deduction Rate",
  deduction_settings: "Deduction Settings",
  payroll_entry: "Payroll Entry",
  payroll_period: "Payroll Period",
  shift: "Shift",
  shift_trade: "Shift Trade",
  time_off_request: "Time Off",
  holiday: "Holiday"
};
function JsonViewer({ data, label }) {
  if (!data) return null;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", sx: { mb: 0.5, display: "block" }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            bgcolor: "action.hover",
            borderRadius: 1,
            p: 1.5,
            fontFamily: "monospace",
            fontSize: "0.75rem",
            maxHeight: 200,
            overflow: "auto"
          },
          children: Object.entries(parsed).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 0.25 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "span", variant: "caption", color: "primary.main", fontWeight: 600, fontFamily: "monospace", children: [
              key,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "caption", fontFamily: "monospace", children: String(value) })
          ] }, key))
        }
      )
    ] });
  } catch {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", sx: { fontSize: "0.75rem" }, children: data })
    ] });
  }
}
function MuiAuditLogs() {
  const theme = useTheme();
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(25);
  const [entityTypeFilter, setEntityTypeFilter] = reactExports.useState("");
  const [actionFilter, setActionFilter] = reactExports.useState("");
  const [selectedLog, setSelectedLog] = reactExports.useState(null);
  const [drawerOpen, setDrawerOpen] = reactExports.useState(false);
  const [liveIndicator, setLiveIndicator] = reactExports.useState(false);
  const [snackbarOpen, setSnackbarOpen] = reactExports.useState(false);
  const [snackbarMessage, setSnackbarMessage] = reactExports.useState("");
  const buildQueryParams = reactExports.useCallback(() => {
    const params = new URLSearchParams();
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (actionFilter) params.set("action", actionFilter);
    params.set("limit", String(rowsPerPage));
    params.set("offset", String(page * rowsPerPage));
    return params.toString();
  }, [entityTypeFilter, actionFilter, page, rowsPerPage]);
  const { data: logsData, isLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/audit-logs", entityTypeFilter, actionFilter, page, rowsPerPage],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/audit-logs?${buildQueryParams()}`);
      return res.json();
    }
  });
  const { data: statsData } = useQuery({
    queryKey: ["/api/audit-logs/stats"]
  });
  const handleRealtimeEvent = reactExports.useCallback(
    (event, data) => {
      if (event === "audit:created") {
        setLiveIndicator(true);
        setTimeout(() => setLiveIndicator(false), 2e3);
        const action = data?.auditLog?.action || "unknown";
        const entity = data?.auditLog?.entityType || "unknown";
        const user = data?.auditLog?.userName || "Unknown user";
        setSnackbarMessage(`${user} â€” ${actionLabels[action] || action} (${entityTypeLabels[entity] || entity})`);
        setSnackbarOpen(true);
        refetchLogs();
      }
    },
    []
  );
  useRealtime({
    enabled: true,
    onEvent: handleRealtimeEvent
  });
  const logs = logsData?.logs || [];
  const totalCount = logsData?.total || statsData?.stats?.totalLogs || 0;
  const stats = statsData?.stats;
  const totalCreates = stats ? Object.entries(stats.byAction).filter(([k]) => k.includes("create")).reduce((sum, [, v]) => sum + v, 0) : 0;
  const totalUpdates = stats ? Object.entries(stats.byAction).filter(([k]) => k.includes("update") || k.includes("change")).reduce((sum, [, v]) => sum + v, 0) : 0;
  const totalDeletes = stats ? Object.entries(stats.byAction).filter(([k]) => k.includes("delete")).reduce((sum, [, v]) => sum + v, 0) : 0;
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };
  const handleExport = () => {
    const params = new URLSearchParams();
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (actionFilter) params.set("action", actionFilter);
    const now = /* @__PURE__ */ new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const a = document.createElement("a");
    a.href = `/api/audit-logs/export?${params.toString()}`;
    a.download = `audit_logs_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const availableActions = stats ? Object.keys(stats.byAction).sort() : [];
  const availableEntityTypes = stats ? Object.keys(stats.byEntityType).sort() : [];
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.info.main, 0.3)}`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, { sx: { color: "white" } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Audit Logs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Real-time updates active", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "dot", color: liveIndicator ? "success" : "default", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DotIcon,
            {
              sx: {
                fontSize: 12,
                color: liveIndicator ? "success.main" : "text.disabled",
                transition: "color 0.3s"
              }
            }
          ) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Track all system changes for compliance â€” updates appear in real time" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", md: "row" }, spacing: 2, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 700, color: "primary.main", children: stats?.totalLogs ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Audit Entries" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 700, color: "success.main", children: totalCreates }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Create Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 700, color: "warning.main", children: totalUpdates }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Update Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 700, color: "error.main", children: totalDeletes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Delete Actions" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        {
          title: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FilterIcon, { fontSize: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "Filters" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            select: true,
            label: "Entity Type",
            value: entityTypeFilter,
            onChange: (e) => {
              setEntityTypeFilter(e.target.value);
              setPage(0);
            },
            size: "small",
            sx: { minWidth: 180 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Types" }),
              (availableEntityTypes.length > 0 ? availableEntityTypes : ["employee", "deduction_rate", "deduction_settings", "payroll_entry", "payroll_period", "shift", "shift_trade", "time_off_request", "holiday"]).map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: type, children: entityTypeLabels[type] || type.replace(/_/g, " ") }, type))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            select: true,
            label: "Action",
            value: actionFilter,
            onChange: (e) => {
              setActionFilter(e.target.value);
              setPage(0);
            },
            size: "small",
            sx: { minWidth: 180 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Actions" }),
              (availableActions.length > 0 ? availableActions : [
                "employee_create",
                "employee_update",
                "employee_delete",
                "employee_deactivate",
                "deduction_change",
                "rate_update",
                "payroll_process",
                "payroll_approve",
                "payroll_paid",
                "shift_create",
                "shift_update",
                "shift_delete",
                "trade_approve",
                "trade_reject",
                "time_off_approve",
                "time_off_reject"
              ]).map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: action, children: actionLabels[action] || action.replace(/_/g, " ") }, action))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
            onClick: handleExport,
            sx: { borderRadius: 2 },
            children: "Export CSV"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { borderRadius: 3, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Timestamp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Entity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { width: 60 }, children: "View" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 6, align: "center", sx: { py: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, { sx: { fontSize: 48, color: "text.disabled", mb: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No audit logs found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.disabled", children: "Changes to employees, deductions, and payroll will appear here in real time" })
        ] }) }) : logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            hover: true,
            sx: {
              cursor: "pointer",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) }
            },
            onClick: () => handleViewDetails(log),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: log.createdAt ? format(new Date(log.createdAt), "MMM dd, yyyy") : "N/A" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: log.createdAt ? format(new Date(log.createdAt), "hh:mm:ss a") : "" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: getActionIcon(log.action),
                  label: actionLabels[log.action] || log.action.replace(/_/g, " "),
                  size: "small",
                  color: actionColors[log.action] || "default",
                  variant: "outlined"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: entityTypeLabels[log.entityType] || log.entityType.replace(/_/g, " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", fontFamily: "monospace", children: log.entityId.length > 12 ? `${log.entityId.substring(0, 8)}...` : log.entityId })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { fontSize: "small", color: "action" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: log.userName || (log.userId.length > 12 ? `${log.userId.substring(0, 8)}...` : log.userId) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                log.reason && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", noWrap: true, sx: { maxWidth: 200 }, children: log.reason }),
                !log.reason && log.createdAt && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.disabled", children: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleViewDetails(log);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small" })
                }
              ) })
            ]
          },
          log.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablePagination,
        {
          rowsPerPageOptions: [10, 25, 50, 100],
          component: "div",
          count: totalCount,
          rowsPerPage,
          page,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Drawer,
      {
        anchor: "right",
        open: drawerOpen,
        onClose: () => setDrawerOpen(false),
        PaperProps: { sx: { width: { xs: "100%", sm: 420 }, p: 3 } },
        children: selectedLog && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, children: "Audit Log Detail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setDrawerOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "Action" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: getActionIcon(selectedLog.action),
                  label: actionLabels[selectedLog.action] || selectedLog.action.replace(/_/g, " "),
                  color: actionColors[selectedLog.action] || "default",
                  variant: "outlined"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "Entity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: entityTypeLabels[selectedLog.entityType] || selectedLog.entityType.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", fontFamily: "monospace", children: [
                "ID: ",
                selectedLog.entityId
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "Performed By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mt: 0.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { fontSize: "small", color: "action" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: selectedLog.userName || selectedLog.userId })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "Timestamp" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: selectedLog.createdAt ? format(new Date(selectedLog.createdAt), "EEEE, MMMM d, yyyy 'at' hh:mm:ss a") : "N/A" }),
              selectedLog.createdAt && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: formatDistanceToNow(new Date(selectedLog.createdAt), { addSuffix: true }) })
            ] }),
            selectedLog.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: selectedLog.reason })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(JsonViewer, { data: selectedLog.oldValues, label: "Previous Values" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(JsonViewer, { data: selectedLog.newValues, label: "New Values" }),
            selectedLog.ipAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "text.secondary", children: "IP Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", children: selectedLog.ipAddress })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Snackbar,
      {
        open: snackbarOpen,
        autoHideDuration: 4e3,
        onClose: () => setSnackbarOpen(false),
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Alert,
          {
            onClose: () => setSnackbarOpen(false),
            severity: "info",
            variant: "filled",
            sx: { width: "100%" },
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, {}),
            children: snackbarMessage
          }
        )
      }
    )
  ] });
}

export { MuiAuditLogs as default };
