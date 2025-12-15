/**
 * Audit Logs Page
 * View and filter compliance audit logs
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "@mui/material";
import {
  History as HistoryIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  oldValues: string | null;
  newValues: string | null;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const actionColors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  create: "success",
  update: "warning",
  delete: "error",
  view: "info",
  deduction_change: "warning",
  rate_update: "info",
  payroll_process: "success",
};

const getActionIcon = (action: string) => {
  if (action.includes("create") || action.includes("add")) return <AddIcon fontSize="small" />;
  if (action.includes("update") || action.includes("change")) return <EditIcon fontSize="small" />;
  if (action.includes("delete")) return <DeleteIcon fontSize="small" />;
  return <HistoryIcon fontSize="small" />;
};

export default function MuiAuditLogs() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data: logsData, isLoading } = useQuery<{ logs: AuditLog[] }>({
    queryKey: ["/api/audit-logs", entityTypeFilter, actionFilter, page, rowsPerPage],
    refetchInterval: 10000,
  });

  const { data: statsData } = useQuery<{ stats: { totalLogs: number; byAction: Record<string, number>; byEntityType: Record<string, number> } }>({
    queryKey: ["/api/audit-logs/stats"],
    refetchInterval: 30000,
  });

  const logs = logsData?.logs || [];
  const stats = statsData?.stats;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all system changes for compliance
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stats.totalLogs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Audit Entries
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats.byAction?.create || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create Actions
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats.byAction?.update || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update Actions
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

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
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="deduction_rate">Deduction Rate</MenuItem>
              <MenuItem value="payroll_entry">Payroll Entry</MenuItem>
            </TextField>
            <TextField
              select
              label="Action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="create">Create</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
              <MenuItem value="deduction_change">Deduction Change</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => window.open("/api/reports/payroll/export", "_blank")}
              sx={{ borderRadius: 2 }}
            >
              Export
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
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">
                      No audit logs found
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Changes to employees, deductions, and payroll will appear here
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {log.createdAt ? format(new Date(log.createdAt), "MMM dd, yyyy") : "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.createdAt ? format(new Date(log.createdAt), "HH:mm:ss") : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={log.action.replace(/_/g, " ")}
                        size="small"
                        color={actionColors[log.action] || "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {log.entityType.replace(/_/g, " ")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {log.entityId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {log.userId.substring(0, 8)}...
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {log.reason && (
                        <Typography variant="body2" color="text.secondary">
                          {log.reason}
                        </Typography>
                      )}
                      {log.ipAddress && (
                        <Typography variant="caption" color="text.disabled">
                          IP: {log.ipAddress}
                        </Typography>
                      )}
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
          count={stats?.totalLogs || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
