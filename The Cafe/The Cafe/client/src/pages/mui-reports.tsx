/**
 * Reports Page
 * Export payroll and employee data as CSV
 */

import PesoIcon from "@/components/PesoIcon";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { apiUrl } from "@/lib/api";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Assessment as ReportIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { format, subMonths } from "date-fns";

export default function MuiReports() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: periodsData } = useQuery<{ periods: Array<{ id: string; startDate: string; endDate: string; status: string }> }>({
    queryKey: ["/api/payroll/periods"],
  });

  const { data: summaryData, isLoading } = useQuery<{ summary: { totalEmployees: number; activeEmployees: number; totalGross: string; totalDeductions: string; totalNet: string; totalHours: string; totalSSS: string; totalPhilHealth: string; totalPagibig: string; totalTax: string; } }>({
    queryKey: ["/api/reports/summary", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const res = await apiRequest("GET", `/api/reports/summary?month=${month}&year=${year}`);
      return await res.json();
    },
  });

  const { data: remittances = [], isLoading: loadingRemittances } = useQuery<any[]>({
    queryKey: ["/api/reports/remittance", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const res = await apiRequest("GET", `/api/reports/remittance?month=${month}&year=${year}`);
      return await res.json();
    },
  });

  const periods = periodsData?.periods || [];
  const summary = summaryData?.summary;

  const handleExport = async (type: "payroll" | "employees" | "deductions") => {
    setExporting(type);
    try {
      const url = type === "employees"
        ? "/api/reports/employees/export"
        : type === "deductions" && periods[0]
          ? `/api/reports/deductions/export?periodId=${periods[0].id}`
          : "/api/reports/payroll/export";

      const res = await fetch(apiUrl(url), { credentials: "include" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Download failed" }));
        alert(err.message || "Failed to download CSV");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `${type}_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to download CSV. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  // Generate last 12 months for dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <ReportIcon sx={{ color: "white" }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Reports & Exports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and download payroll reports
          </Typography>
        </Box>
      </Box>

      {/* Month Selector */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalendarIcon color="action" />
            <TextField
              select
              label="Report Period"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {monthOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : summary && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PeopleIcon color="primary" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.activeEmployees}/{summary.totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Employees
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PesoIcon color="success" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    ₱{parseFloat(summary.totalGross || "0").toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Gross Pay
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ReceiptIcon color="info" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {parseFloat(summary.totalHours || "0").toFixed(0)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours Worked
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Detailed Deductions Summary Cards */}
      {!isLoading && summary && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <CardContent>
              <Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  ₱{parseFloat(summary.totalSSS || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total SSS
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <CardContent>
              <Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  ₱{parseFloat(summary.totalPhilHealth || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total PhilHealth
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <CardContent>
              <Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  ₱{parseFloat(summary.totalPagibig || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Pag-IBIG
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
            <CardContent>
              <Box>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  ₱{parseFloat(summary.totalTax || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tax
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Export Options */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Export Data
      </Typography>
      
      <Stack spacing={2}>
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<PesoIcon color="success" />}
            title="Payroll Summary"
            subheader="Export all payroll entries with earnings and deductions"
            action={
              <Button
                variant="contained"
                color="success"
                startIcon={exporting === "payroll" ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => handleExport("payroll")}
                disabled={!!exporting}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Download CSV
              </Button>
            }
          />
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<PeopleIcon color="primary" />}
            title="Employee List"
            subheader="Export all employee information (excluding passwords)"
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={exporting === "employees" ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => handleExport("employees")}
                disabled={!!exporting}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Download CSV
              </Button>
            }
          />
        </Card>

        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<ReceiptIcon color="warning" />}
            title="Deductions Summary"
            subheader="Export SSS, PhilHealth, Pag-IBIG, and tax deductions by employee"
            action={
              <Button
                variant="contained"
                color="warning"
                startIcon={exporting === "deductions" ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => handleExport("deductions")}
                disabled={!!exporting || periods.length === 0}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Download CSV
              </Button>
            }
          />
          {periods.length === 0 && (
            <CardContent sx={{ pt: 0 }}>
              <Alert severity="info">
                Create a payroll period first to export deduction summaries.
              </Alert>
            </CardContent>
          )}
        </Card>
      </Stack>

      {/* Remittance Report Table */}
      <Card elevation={0} sx={{ mt: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardHeader
          avatar={<ReportIcon color="primary" />}
          title="Government Remittance Tracking (PRN Generation)"
          subheader="Monthly pending contributions and loan amortizations to be paid to SSS, PhilHealth, and Pag-IBIG"
        />
        {loadingRemittances ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
        ) : (
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">SSS Contrib (₱)</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>SSS Loan (₱)</TableCell>
                <TableCell align="right">PhilHealth (₱)</TableCell>
                <TableCell align="right">Pag-IBIG Contrib (₱)</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>Pag-IBIG Loan (₱)</TableCell>
                <TableCell align="right">Total Due (₱)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {remittances.map((row, idx) => {
                const total = row.sssContribution + row.sssLoan + row.philHealthContribution + row.pagibigContribution + row.pagibigLoan;
                return (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.employeeName}</TableCell>
                  <TableCell align="right">{row.sssContribution.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.sssLoan.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.philHealthContribution.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.pagibigContribution.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.pagibigLoan.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{total.toFixed(2)}</TableCell>
                </TableRow>
              )})}
              {remittances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No remittance data for this month.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Card>

      <Divider sx={{ my: 4 }} />

      <Alert severity="success" icon={false}>
        <Typography variant="body2">
          <strong>✅ DOLE Compliant:</strong> All exports include itemized earnings and deductions as required by DOLE Order 174.
        </Typography>
      </Alert>
    </Box>
  );
}
