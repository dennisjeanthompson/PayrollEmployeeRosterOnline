/**
 * Audit Logs Page
 * Real-time view and filter compliance audit logs
 */

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRealtime } from "@/hooks/use-realtime";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Drawer,
  IconButton,
  Divider,
  Tooltip,
  Badge,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  History as HistoryIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  SwapHoriz as SwapIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  oldValues: string | null;
  newValues: string | null;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const actionLabels: Record<string, string> = {
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
  delete: "Deleted",
};

const actionColors: Record<string, "success" | "warning" | "error" | "info" | "default" | "primary" | "secondary"> = {
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
  delete: "error",
};

const getActionIcon = (action: string) => {
  if (action.includes("create") || action.includes("add")) return <AddIcon fontSize="small" />;
  if (action.includes("delete")) return <DeleteIcon fontSize="small" />;
  if (action.includes("approve") || action.includes("activate") || action.includes("paid")) return <CheckIcon fontSize="small" />;
  if (action.includes("reject") || action.includes("deactivate")) return <CancelIcon fontSize="small" />;
  if (action.includes("payroll")) return <PaymentIcon fontSize="small" />;
  if (action.includes("trade") || action.includes("swap")) return <SwapIcon fontSize="small" />;
  if (action.includes("shift") || action.includes("schedule")) return <ScheduleIcon fontSize="small" />;
  if (action.includes("settings") || action.includes("rate")) return <SettingsIcon fontSize="small" />;
  if (action.includes("update") || action.includes("change")) return <EditIcon fontSize="small" />;
  return <HistoryIcon fontSize="small" />;
};

const entityTypeLabels: Record<string, string> = {
  employee: "Employee",
  deduction_rate: "Deduction Rate",
  deduction_settings: "Deduction Settings",
  payroll_entry: "Payroll Entry",
  payroll_period: "Payroll Period",
  shift: "Shift",
  shift_trade: "Shift Trade",
  time_off_request: "Time Off",
  holiday: "Holiday",
};

function JsonViewer({ data, label }: { data: string | null; label: string }) {
  if (!data) return null;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
          {label}
        </Typography>
        <Box
          sx={{
            bgcolor: "action.hover",
            borderRadius: 1,
            p: 1.5,
            fontFamily: "monospace",
            fontSize: "0.75rem",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {Object.entries(parsed).map(([key, value]) => (
            <Box key={key} sx={{ py: 0.25 }}>
              <Typography component="span" variant="caption" color="primary.main" fontWeight={600} fontFamily="monospace">
                {key}:
              </Typography>{" "}
              <Typography component="span" variant="caption" fontFamily="monospace">
                {String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  } catch {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: "0.75rem" }}>{data}</Typography>
      </Box>
    );
  }
}

export default function MuiAuditLogs() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Build query params for filtered requests
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (actionFilter) params.set("action", actionFilter);
    params.set("limit", String(rowsPerPage));
    params.set("offset", String(page * rowsPerPage));
    return params.toString();
  }, [entityTypeFilter, actionFilter, page, rowsPerPage]);

  const { data: logsData, isLoading, refetch: refetchLogs } = useQuery<{ logs: AuditLog[]; total: number }>({
    queryKey: ["/api/audit-logs", entityTypeFilter, actionFilter, page, rowsPerPage],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/audit-logs?${buildQueryParams()}`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: statsData } = useQuery<{ stats: { totalLogs: number; byAction: Record<string, number>; byEntityType: Record<string, number> } }>({
    queryKey: ["/api/audit-logs/stats"],
    refetchInterval: 60000,
  });

  // Real-time WebSocket integration
  const handleRealtimeEvent = useCallback(
    (event: string, data: any) => {
      if (event === "audit:created") {
        setLiveIndicator(true);
        setTimeout(() => setLiveIndicator(false), 2000);
        const action = data?.auditLog?.action || "unknown";
        const entity = data?.auditLog?.entityType || "unknown";
        const user = data?.auditLog?.userName || "Unknown user";
        setSnackbarMessage(`${user} — ${actionLabels[action] || action} (${entityTypeLabels[entity] || entity})`);
        setSnackbarOpen(true);
        refetchLogs();
      }
    },
    []
  );

  useRealtime({
    enabled: true,
    onEvent: handleRealtimeEvent,
  });

  const logs = logsData?.logs || [];
  const totalCount = logsData?.total || statsData?.stats?.totalLogs || 0;
  const stats = statsData?.stats;

  const totalCreates = stats
    ? Object.entries(stats.byAction)
        .filter(([k]) => k.includes("create"))
        .reduce((sum, [, v]) => sum + v, 0)
    : 0;
  const totalUpdates = stats
    ? Object.entries(stats.byAction)
        .filter(([k]) => k.includes("update") || k.includes("change"))
        .reduce((sum, [, v]) => sum + v, 0)
    : 0;
  const totalDeletes = stats
    ? Object.entries(stats.byAction)
        .filter(([k]) => k.includes("delete"))
        .reduce((sum, [, v]) => sum + v, 0)
    : 0;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (entityTypeFilter) params.set("entityType", entityTypeFilter);
    if (actionFilter) params.set("action", actionFilter);
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
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
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          <HistoryIcon sx={{ color: "white" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              Audit Logs
            </Typography>
            <Tooltip title="Real-time updates active">
              <Badge variant="dot" color={liveIndicator ? "success" : "default"}>
                <DotIcon
                  sx={{
                    fontSize: 12,
                    color: liveIndicator ? "success.main" : "text.disabled",
                    transition: "color 0.3s",
                  }}
                />
              </Badge>
            </Tooltip>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Track all system changes for compliance — updates appear in real time
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="primary.main">
              {stats?.totalLogs ?? 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Audit Entries
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="success.main">
              {totalCreates}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create Actions
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="warning.main">
              {totalUpdates}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update Actions
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="error.main">
              {totalDeletes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Delete Actions
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Filters
              </Typography>
            </Stack>
          }
        />
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Entity Type"
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Types</MenuItem>
              {(availableEntityTypes.length > 0
                ? availableEntityTypes
                : ["employee", "deduction_rate", "deduction_settings", "payroll_entry", "payroll_period", "shift", "shift_trade", "time_off_request", "holiday"]
              ).map((type) => (
                <MenuItem key={type} value={type}>
                  {entityTypeLabels[type] || type.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Action"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Actions</MenuItem>
              {(availableActions.length > 0
                ? availableActions
                : [
                    "employee_create", "employee_update", "employee_delete", "employee_deactivate",
                    "deduction_change", "rate_update",
                    "payroll_process", "payroll_approve", "payroll_paid",
                    "shift_create", "shift_update", "shift_delete",
                    "trade_approve", "trade_reject",
                    "time_off_approve", "time_off_reject",
                  ]
              ).map((action) => (
                <MenuItem key={action} value={action}>
                  {actionLabels[action] || action.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ borderRadius: 2 }}
            >
              Export CSV
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="center" sx={{ width: 60 }}>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">
                      No audit logs found
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Changes to employees, deductions, and payroll will appear here in real time
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    }}
                    onClick={() => handleViewDetails(log)}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {log.createdAt ? format(new Date(log.createdAt), "MMM dd, yyyy") : "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.createdAt ? format(new Date(log.createdAt), "hh:mm:ss a") : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={actionLabels[log.action] || log.action.replace(/_/g, " ")}
                        size="small"
                        color={actionColors[log.action] || "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {entityTypeLabels[log.entityType] || log.entityType.replace(/_/g, " ")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {log.entityId.length > 12 ? `${log.entityId.substring(0, 8)}...` : log.entityId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {log.userName || (log.userId.length > 12 ? `${log.userId.substring(0, 8)}...` : log.userId)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {log.reason && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {log.reason}
                        </Typography>
                      )}
                      {!log.reason && log.createdAt && (
                        <Typography variant="caption" color="text.disabled">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(log);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 3 } }}
      >
        {selectedLog && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Audit Log Detail
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Action</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    icon={getActionIcon(selectedLog.action)}
                    label={actionLabels[selectedLog.action] || selectedLog.action.replace(/_/g, " ")}
                    color={actionColors[selectedLog.action] || "default"}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Entity</Typography>
                <Typography variant="body2">
                  {entityTypeLabels[selectedLog.entityType] || selectedLog.entityType.replace(/_/g, " ")}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  ID: {selectedLog.entityId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Performed By</Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {selectedLog.userName || selectedLog.userId}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Timestamp</Typography>
                <Typography variant="body2">
                  {selectedLog.createdAt
                    ? format(new Date(selectedLog.createdAt), "EEEE, MMMM d, yyyy 'at' hh:mm:ss a")
                    : "N/A"}
                </Typography>
                {selectedLog.createdAt && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(selectedLog.createdAt), { addSuffix: true })}
                  </Typography>
                )}
              </Box>

              {selectedLog.reason && (
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">Reason</Typography>
                  <Typography variant="body2">{selectedLog.reason}</Typography>
                </Box>
              )}

              <JsonViewer data={selectedLog.oldValues} label="Previous Values" />
              <JsonViewer data={selectedLog.newValues} label="New Values" />

              {selectedLog.ipAddress && (
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">IP Address</Typography>
                  <Typography variant="body2" fontFamily="monospace">{selectedLog.ipAddress}</Typography>
                </Box>
              )}
            </Stack>
          </>
        )}
      </Drawer>

      {/* Real-time notification snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
          icon={<HistoryIcon />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
