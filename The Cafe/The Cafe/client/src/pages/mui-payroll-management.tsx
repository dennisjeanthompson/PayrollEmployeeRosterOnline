import PesoIcon from "@/components/PesoIcon";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Divider,
  Avatar,
  LinearProgress,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  CalendarMonth,
  AccessTime,
  Visibility,
  Download,
  Send,
  CheckCircle,
  PlayArrow,
  Search,
  MoreVert,
  TrendingUp,
  Receipt,
  Speed,
  Groups,
  Description as DescriptionIcon,
  NoteAdd,
  Schedule,
  Warning,
  Cancel,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, eachDayOfInterval, subDays, addDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";
import { getInitials } from "@/lib/utils";
import { PayslipPreview as DigitalPayslip } from "@/components/payroll/payslip-preview";


interface PayrollPeriod {
  id: string;
  branchId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalHours?: number | string;
  totalPay?: number | string;
  createdAt?: string;
}

interface PayrollEntry {
  id: string;
  userId: string;
  payrollPeriodId: string;
  totalHours: number | string;
  regularHours: number | string;
  overtimeHours: number | string;
  grossPay: number | string;
  deductions: number | string;
  netPay: number | string;
  status: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    photoUrl?: string | null;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "info";
    case "closed":
      return "default";
    case "processing":
      return "warning";
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "paid":
      return "primary";
    default:
      return "default";
  }
};

type PeriodType = '2weeks' | 'month' | 'custom';

export default function MuiPayrollManagement() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [payDate, setPayDate] = useState<Date | null>(null);
  const [periodType, setPeriodType] = useState<PeriodType>('2weeks');
  
  // Digital payslip viewer state
  const [payslipViewerOpen, setPayslipViewerOpen] = useState(false);
  const [selectedEntryForPayslip, setSelectedEntryForPayslip] = useState<PayrollEntry | null>(null);

  // Period context menu state (3-dot menu)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPeriod, setMenuPeriod] = useState<PayrollPeriod | null>(null);
  const openPeriodMenu = (e: React.MouseEvent<HTMLElement>, period: PayrollPeriod) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setMenuPeriod(period);
  };
  const closePeriodMenu = () => {
    setMenuAnchorEl(null);
    setMenuPeriod(null);
  };

  // Adjustment log (Exception Log) state
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [adjEmployeeId, setAdjEmployeeId] = useState("");
  const [adjDate, setAdjDate] = useState<Date | null>(null);
  const [adjEndDate, setAdjEndDate] = useState<Date | null>(null);
  const [adjIsRange, setAdjIsRange] = useState(false);
  const [adjType, setAdjType] = useState("overtime");
  const [adjValue, setAdjValue] = useState("");
  const [adjRemarks, setAdjRemarks] = useState("");
  const [rejectLogId, setRejectLogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Enable real-time updates for payroll management
  useRealtime({
    queryKeys: ["payroll-periods", "payroll-entries-branch"]
  });
  
  // Handle opening digital payslip viewer
  const handleViewPayslip = (entry: PayrollEntry) => {
    setSelectedEntryForPayslip(entry);
    setPayslipViewerOpen(true);
  };

  const [exporting, setExporting] = useState(false);
  const handleExport = () => {
    if (!selectedPeriod) return;
    setExporting(true);
    const url = `/api/reports/payroll/export?periodId=${selectedPeriod.id}`;
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    const a = document.createElement("a");
    a.href = apiUrl(url);
    a.download = `payroll_export_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setExporting(false), 1000);
  };

  // Get the current semi-monthly period dates (Philippine standard: 1-15, 16-end)
  const getCurrentSemiMonthlyDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDate();
    if (day <= 15) {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth(), 15),
      };
    } else {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 16),
        end: endOfMonth(today),
      };
    }
  };

  // Open create dialog with smart date initialization
  const openCreateDialog = () => {
    const { start, end } = getCurrentSemiMonthlyDates();
    setStartDate(start);
    setEndDate(end);
    setPayDate(end);
    setPeriodType('custom');
    setIsCreateDialogOpen(true);
  };

  // Handle period type change
  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === '2weeks') {
      setStartDate(today);
      setEndDate(addDays(today, 13)); // 14 days total (2 weeks)
      setPayDate(addDays(today, 13));
    } else if (type === 'month') {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
      setPayDate(endOfMonth(today));
    }
    // For 'custom', don't change dates - let user pick
  };
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch payroll periods with real-time updates
  const { data: periodsData, isLoading: periodsLoading, refetch: refetchPeriods } = useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payroll/periods");
      return response.json();
    },
    refetchOnWindowFocus: true,
  });

  // Fetch payroll entries for selected period with real-time updates
  const { data: entriesData, isLoading: entriesLoading, refetch: refetchEntries } = useQuery({
    queryKey: ["payroll-entries-branch", selectedPeriod?.id],
    queryFn: async () => {
      const url = selectedPeriod
        ? `/api/payroll/entries/branch?periodId=${selectedPeriod.id}`
        : "/api/payroll/entries/branch";
      const response = await apiRequest("GET", url);
      return response.json();
    },
    enabled: !!selectedPeriod,
    refetchOnWindowFocus: true,
  });

  // Mutations
  const createPeriodMutation = useMutation({
    mutationFn: async (data: { startDate: string; endDate: string; payDate: string }) => {
      const response = await apiRequest("POST", "/api/payroll/periods", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Payroll Period Created", description: "New payroll period is ready" });
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      setIsCreateDialogOpen(false);
      setStartDate(null);
      setEndDate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const processPayrollMutation = useMutation({
    mutationFn: async (periodId: string) => {
      const response = await apiRequest("POST", `/api/payroll/periods/${periodId}/process`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "✓ Payroll Processed", description: data.message || "All entries calculated" });
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await apiRequest("PUT", `/api/payroll/entries/${entryId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Entry Approved" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await apiRequest("PUT", `/api/payroll/entries/${entryId}/paid`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Marked as Paid" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendPayslipMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await apiRequest("POST", `/api/payroll/entries/${entryId}/send`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Payslip Sent" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: async (periodId: string) => {
      const response = await apiRequest("DELETE", `/api/payroll/periods/${periodId}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to delete period" }));
        throw new Error(err.message || "Failed to delete period");
      }
      return response.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast({ title: "Period Deleted", description: "Payroll period has been removed" });
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      if (selectedPeriod?.id === menuPeriod?.id) setSelectedPeriod(null);
      closePeriodMenu();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      closePeriodMenu();
    },
  });

  // Adjustment Logs (Exception Logs) queries & mutations
  const { data: adjustmentLogsData, isLoading: adjLogsLoading } = useQuery({
    queryKey: ["adjustment-logs-branch"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/adjustment-logs/branch");
      return response.json();
    },
    refetchOnWindowFocus: true,
  });

  // Fetch employees for the dropdown
  const { data: employeesData } = useQuery({
    queryKey: ["branch-employees"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/employees");
      return response.json();
    },
  });
  
  // Get active employees from the branch
  const branchEmployees = useMemo(() => {
    const employees = employeesData?.employees || employeesData || [];
    return employees.filter((e: any) => e.isActive !== false);
  }, [employeesData]);

  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: { employeeId: string; date: string; type: string; value: string; remarks: string }) => {
      const response = await apiRequest("POST", "/api/adjustment-logs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Exception Logged", description: "Employee will be notified to verify" });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
      setIsAdjustmentDialogOpen(false);
      setAdjEmployeeId("");
      setAdjDate(null);
      setAdjEndDate(null);
      setAdjIsRange(false);
      setAdjType("overtime");
      setAdjValue("");
      setAdjRemarks("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveAdjustmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/adjustment-logs/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Adjustment Approved" });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectAdjustmentMutation = useMutation({
    mutationFn: async (data: { id: string, reason: string }) => {
      const response = await apiRequest("PUT", `/api/adjustment-logs/${data.id}/reject`, { reason: data.reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Adjustment Rejected" });
      setRejectLogId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateAdjustment = async () => {
    if (!adjEmployeeId || !adjDate || !adjValue) {
      toast({ title: "Missing Fields", description: "Employee, date, and value are required", variant: "destructive" });
      return;
    }

    // Build array of dates to log
    let datesToLog: Date[] = [adjDate];
    if (adjIsRange && adjEndDate && adjEndDate > adjDate) {
      datesToLog = eachDayOfInterval({ start: adjDate, end: adjEndDate });
    }

    // Submit one entry per day
    for (const d of datesToLog) {
      await createAdjustmentMutation.mutateAsync({
        employeeId: adjEmployeeId,
        date: format(d, "yyyy-MM-dd"),
        type: adjType,
        value: adjValue,
        remarks: adjRemarks,
      });
    }
  };

  const adjustmentTypeOptions = [
    { value: "overtime", label: "Regular OT (125%)", color: "#10b981" },
    { value: "rest_day_ot", label: "Rest Day OT (169%)", color: "#3b82f6" },
    { value: "special_holiday_ot", label: "Special Holiday OT (169%)", color: "#f59e0b" },
    { value: "regular_holiday_ot", label: "Regular Holiday OT (260%)", color: "#ef4444" },
    { value: "night_diff", label: "Night Differential (+10%)", color: "#8b5cf6" },
    { value: "late", label: "Tardiness (minutes)", color: "#f97316" },
    { value: "undertime", label: "Undertime (minutes)", color: "#ec4899" },
    { value: "absent", label: "Absent (days)", color: "#dc2626" },
  ];

  const adjLogs = adjustmentLogsData?.logs || [];

  const handleCreatePeriod = () => {
    if (!startDate || !endDate || !payDate) {
      toast({ title: "Missing Dates", description: "Please select start, end, and pay dates", variant: "destructive" });
      return;
    }
    createPeriodMutation.mutate({ 
      startDate: format(startDate, "yyyy-MM-dd"), 
      endDate: format(endDate, "yyyy-MM-dd"),
      payDate: format(payDate, "yyyy-MM-dd")
    });
  };

  const applyTemplate = (template: "semi-monthly" | "weekly" | "monthly") => {
    const today = new Date();
    let start: Date, end: Date;

    if (template === "semi-monthly") {
      const day = today.getDate();
      if (day <= 15) {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth(), 15);
      } else {
        start = new Date(today.getFullYear(), today.getMonth(), 16);
        end = endOfMonth(today);
      }
    } else if (template === "weekly") {
      start = subDays(today, 7);
      end = today;
    } else {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }

    setStartDate(start);
    setEndDate(end);
    setPayDate(end);
    setIsCreateDialogOpen(true);
  };

  const periods = periodsData?.periods || [];
  const entries = entriesData?.entries || [];

  // Calculate summary stats
  const totalPeriods = periods.length;
  const openPeriods = periods.filter((p: PayrollPeriod) => p.status === "open").length;
  const totalPaid = periods.reduce(
    (sum: number, p: PayrollPeriod) => sum + (parseFloat(String(p.totalPay)) || 0),
    0
  );
  const totalHours = periods.reduce(
    (sum: number, p: PayrollPeriod) => sum + (parseFloat(String(p.totalHours)) || 0),
    0
  );

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
          <Box sx={{ overflow: "hidden", flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25, mb: 0.25, lineHeight: 1.2, letterSpacing: "-0.02em" }} noWrap>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', opacity: 0.8 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Receipt sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Payroll Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Process payments, manage periods & track earnings
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search periods..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              display: { xs: "none", md: "block" },
              width: 240,
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{
              borderRadius: 3,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            New Period
          </Button>
        </Stack>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Periods"
            value={totalPeriods.toString()}
            subtitle="All time payroll cycles"
            icon={CalendarMonth}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Open Periods"
            value={openPeriods.toString()}
            subtitle="Awaiting processing"
            icon={Speed}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Disbursed"
            value={`₱${totalPaid.toLocaleString()}`}
            subtitle="Paid to employees"
            icon={PesoIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Hours Logged"
            value={`${totalHours.toFixed(0)}h`}
            subtitle="Total work hours"
            icon={AccessTime}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#2A2018' : '#F5F0E8',
            borderRadius: 3,
            p: 0.5,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? '#3D3228' : '#E0D5C5',
            "& .MuiTabs-indicator": {
              height: "100%",
              borderRadius: 2.5,
              bgcolor: theme.palette.mode === 'dark' ? '#4A3820' : '#FFFFFF',
              boxShadow: theme.palette.mode === 'dark' ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.12)',
              zIndex: 0,
            },
            "& .MuiTab-root": {
              zIndex: 1,
              textTransform: "none",
              fontWeight: 600,
              minHeight: 44,
              borderRadius: 2.5,
              color: theme.palette.mode === 'dark' ? '#C4AA88' : '#6B5944',
              "&.Mui-selected": {
                color: theme.palette.mode === 'dark' ? '#F5E6D3' : '#3C2415',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab
            icon={<CalendarMonth sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Periods ${periods.length > 0 ? `(${periods.length})` : ""}`}
          />
          <Tab
            icon={<Groups sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Entries ${entries.length > 0 ? `(${entries.length})` : ""}`}
          />
          <Tab
            icon={<NoteAdd sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Exception Logs ${adjLogs.length > 0 ? `(${adjLogs.length})` : ""}`}
          />
        </Tabs>
      </Box>

      {/* Content */}
      {activeTab === 0 ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            {periodsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : periods.length === 0 ? (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
                  p: 6,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <CalendarMonth sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Start Your First Payroll
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Create a payroll period to start tracking employee hours and processing payments.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{ borderRadius: 3, px: 4, textTransform: "none", fontWeight: 600 }}
                >
                  Create Payroll Period
                </Button>
              </Card>
            ) : (
              <Stack spacing={2}>
                {periods.map((period: PayrollPeriod) => (
                  <Card
                    key={period.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${
                        selectedPeriod?.id === period.id
                          ? theme.palette.primary.main
                          : 'rgba(255, 255, 255, 0.02)'
                      }`,
                      transition: "all 0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    }}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CalendarMonth sx={{ color: "primary.main" }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                              {format(new Date(period.startDate), "MMM d")} –{" "}
                              {format(new Date(period.endDate), "MMM d, yyyy")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(() => {
                                const days = differenceInDays(new Date(period.endDate), new Date(period.startDate)) + 1;
                                return days <= 16 ? "Semi-Monthly" : days <= 31 ? "Monthly" : `${days}-day period`;
                              })()}{period.createdAt ? ` \u2022 Generated: ${format(new Date(period.createdAt), "MMM d, yyyy h:mm a")}` : ""}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip
                            label={period.status}
                            size="small"
                            color={getStatusColor(period.status) as any}
                            sx={{ fontWeight: 600, textTransform: "capitalize" }}
                          />
                          {period.totalHours && (
                            <Typography variant="body2" color="text.secondary">
                              {parseFloat(String(period.totalHours)).toFixed(1)}h
                            </Typography>
                          )}
                          {period.totalPay && (
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              ₱{parseFloat(String(period.totalPay)).toLocaleString()}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {period.status === "open" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={
                              processPayrollMutation.isPending ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <PlayArrow />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              processPayrollMutation.mutate(period.id);
                            }}
                            disabled={processPayrollMutation.isPending}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                          >
                            Process
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPeriod(period);
                            setActiveTab(1);
                          }}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          View
                        </Button>
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(e) => openPeriodMenu(e, period)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
                p: 2.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Quick Start Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Pre-configured periods
              </Typography>

              <Stack spacing={2}>
                {[
                  { label: "Semi-Monthly", desc: "1st-15th or 16th-end", template: "semi-monthly" as const },
                  { label: "Weekly", desc: "Last 7 days", template: "weekly" as const },
                  { label: "Monthly", desc: "Full month cycle", template: "monthly" as const },
                ].map((item) => (
                  <Button
                    key={item.template}
                    fullWidth
                    variant="outlined"
                    onClick={() => applyTemplate(item.template)}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.5,
                      textTransform: "none",
                      justifyContent: "flex-start",
                      borderColor: 'rgba(255, 255, 255, 0.04)',
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      ) : activeTab === 1 ? (
        /* Entries Tab */
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
            overflow: "hidden",
          }}
        >
          {!selectedPeriod ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Receipt sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Period Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a payroll period to view its entries
              </Typography>
              <Button variant="outlined" onClick={() => setActiveTab(0)} sx={{ borderRadius: 2 }}>
                Go to Periods
              </Button>
            </Box>
          ) : entriesLoading ? (
            <Box sx={{ p: 4 }}>
              <LinearProgress />
            </Box>
          ) : entries.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Receipt sx={{ fontSize: 48, color: "warning.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Entries Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Process this payroll period to generate employee entries
              </Typography>
              {selectedPeriod.status === "open" && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => processPayrollMutation.mutate(selectedPeriod.id)}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Process Payroll Now
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                  borderBottom: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {format(new Date(selectedPeriod.startDate), "MMM d")} –{" "}
                    {format(new Date(selectedPeriod.endDate), "MMM d, yyyy")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entries.length} employees
                  </Typography>
                </Box>
                <Button 
                  startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <Download />} 
                  size="small" 
                  onClick={handleExport}
                  disabled={exporting || entries.length === 0}
                  sx={{ textTransform: "none" }}
                >
                  {exporting ? "Exporting..." : "Export"}
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">Gross Pay</TableCell>
                      <TableCell align="right">Deductions</TableCell>
                      <TableCell align="right">Net Pay</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry: PayrollEntry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              src={entry.employee?.photoUrl || undefined}
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "primary.main",
                                fontSize: "0.85rem",
                              }}
                            >
                              {getInitials(entry.employee?.firstName, entry.employee?.lastName, entry.employee?.email)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {entry.employee?.firstName} {entry.employee?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.employee?.position}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(String(entry.totalHours)).toFixed(1)}h
                        </TableCell>
                        <TableCell align="right">
                          ₱{parseFloat(String(entry.grossPay)).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "error.main" }}>
                          -₱{parseFloat(String((entry as any).totalDeductions || entry.deductions || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "success.main" }}>
                          ₱{parseFloat(String(entry.netPay)).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={entry.status === 'paid' ? 'Paid' : entry.status === 'approved' ? 'Approved' : 'Pending'}
                            color={entry.status === 'paid' ? 'success' : entry.status === 'approved' ? 'info' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View digital payslip (PH — Compliant 2026)">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewPayslip(entry)}
                              >
                                <DescriptionIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {entry.status === "pending" && (
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={approveEntryMutation.isPending}
                                  onClick={() => approveEntryMutation.mutate(entry.id)}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {entry.status === "approved" && (
                              <Tooltip title="Mark as Paid">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  disabled={markPaidMutation.isPending}
                                  onClick={() => markPaidMutation.mutate(entry.id)}
                                >
                                  <PesoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Send Payslip">
                              <IconButton
                                size="small"
                                disabled={sendPayslipMutation.isPending}
                                onClick={() => sendPayslipMutation.mutate(entry.id)}
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Card>
      ) : activeTab === 2 ? (
        /* Exception Logs Tab — Manager OT/Lateness Logging */
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.action.hover, 0.3),
              borderBottom: `1px solid ${'rgba(255, 255, 255, 0.02)'}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Daily Exception Logs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                OT, tardiness, and other adjustments logged by managers — DOLE compliant
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<NoteAdd />}
              onClick={() => setIsAdjustmentDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Log Exception
            </Button>
          </Box>

          {adjLogsLoading ? (
            <Box sx={{ p: 4 }}><LinearProgress /></Box>
          ) : adjLogs.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Schedule sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" gutterBottom>No Exception Logs Yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Log overtime, tardiness, or other adjustments when they happen.
                These will be factored into payroll processing.
              </Typography>
              <Button
                variant="contained"
                startIcon={<NoteAdd />}
                onClick={() => setIsAdjustmentDialogOpen(true)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Log First Exception
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjLogs.map((log: any) => {
                    const typeConfig = adjustmentTypeOptions.find(t => t.value === log.type);
                    const isDeduction = ['late', 'undertime', 'absent'].includes(log.type);
                    const valueUnit = log.type === 'late' || log.type === 'undertime' ? 'mins' : log.type === 'absent' ? 'days' : 'hrs';
                    
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.employeeName || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {log.startDate && log.endDate && log.startDate !== log.endDate && new Date(log.startDate).getTime() !== new Date(log.endDate).getTime()
                              ? `${format(new Date(log.startDate), "MMM d, yy")} - ${format(new Date(log.endDate), "MMM d, yy")}`
                              : log.startDate
                              ? format(new Date(log.startDate), "MMM d, yyyy")
                              : log.createdAt 
                              ? format(new Date(log.createdAt), "MMM d, yyyy") 
                              : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeConfig?.label || log.type}
                            size="small"
                            sx={{
                              bgcolor: alpha(typeConfig?.color || '#666', 0.1),
                              color: typeConfig?.color || '#666',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {log.value} {valueUnit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {log.remarks || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status?.replace('_', ' ')}
                            size="small"
                            color={
                              log.status === 'approved' ? 'success' :
                              log.status === 'employee_verified' ? 'info' :
                              log.status === 'rejected' ? 'error' :
                              'warning'
                            }
                            sx={{ fontWeight: 600, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {log.calculatedAmount ? (
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={isDeduction ? "error.main" : "success.main"}
                            >
                              {isDeduction ? '-' : '+'}₱{Math.abs(parseFloat(log.calculatedAmount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled">Pending</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {(log.status === 'pending' || log.status === 'employee_verified') && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={approveAdjustmentMutation.isPending}
                                    onClick={() => approveAdjustmentMutation.mutate(log.id)}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setRejectLogId(log.id);
                                      setRejectReason("");
                                    }}
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      ) : null}

      {/* Create Period Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${theme.palette.background.paper} 100%)`,
          } 
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <CalendarMonth sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Create Payroll Period
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define the date range for this payroll cycle
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider sx={{ mx: 3 }} />
        <DialogContent sx={{ pt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              {/* Period Type Selection */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" color="info.main" fontWeight={600} sx={{ mb: 2 }}>
                  ⏱️ Period Duration
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={periodType === '2weeks' ? 'contained' : 'outlined'}
                    onClick={() => handlePeriodTypeChange('2weeks')}
                    sx={{ 
                      flex: 1, 
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    2 Weeks
                  </Button>
                  <Button
                    variant={periodType === 'month' ? 'contained' : 'outlined'}
                    onClick={() => handlePeriodTypeChange('month')}
                    sx={{ 
                      flex: 1, 
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    1 Month
                  </Button>
                  <Button
                    variant={periodType === 'custom' ? 'contained' : 'outlined'}
                    onClick={() => handlePeriodTypeChange('custom')}
                    sx={{ 
                      flex: 1, 
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Custom
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 2 }}>
                  📅 Period Start Date
                </Typography>
                <DatePicker
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          "& input": {
                            padding: "14px 16px",
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          borderRadius: 3,
                          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                      },
                    },
                  }}
                />
              </Box>
              
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" color="secondary" fontWeight={600} sx={{ mb: 2 }}>
                  📅 Period End Date
                </Typography>
                <DatePicker
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          "& input": {
                            padding: "14px 16px",
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.secondary.main, 0.02),
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(theme.palette.secondary.main, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          borderRadius: 3,
                          boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.15)}`,
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" color="warning.main" fontWeight={600} sx={{ mb: 2 }}>
                  💰 Expected Pay Date
                </Typography>
                <DatePicker
                  value={payDate}
                  onChange={(newValue) => setPayDate(newValue)}
                  minDate={endDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          "& input": {
                            padding: "14px 16px",
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.warning.main, 0.02),
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(theme.palette.warning.main, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          borderRadius: 3,
                          boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.15)}`,
                        },
                      },
                    },
                  }}
                />
              </Box>

              {startDate && endDate && payDate && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                    <Typography variant="body2" color="success.main" fontWeight={500}>
                      Period: {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")} | Pays on {format(payDate, "MMM d")}
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePeriod}
            disabled={!startDate || !endDate || !payDate || createPeriodMutation.isPending}
            sx={{ 
              borderRadius: 2, 
              textTransform: "none", 
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Create Period
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Digital Payslip Viewer */}
      {selectedEntryForPayslip && selectedPeriod && (
        <DigitalPayslip
          entryId={selectedEntryForPayslip.id}
          open={payslipViewerOpen}
          onOpenChange={(isOpen) => {
            setPayslipViewerOpen(isOpen);
            if (!isOpen) setSelectedEntryForPayslip(null);
          }}
        />
      )}

      {/* Adjustment Log Dialog */}
      <Dialog
        open={isAdjustmentDialogOpen}
        onClose={() => setIsAdjustmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${theme.palette.background.paper} 100%)`,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NoteAdd color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Log Exception
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Record overtime, tardiness, or other adjustments — DOLE compliant
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select
                value={adjEmployeeId}
                label="Employee"
                onChange={(e) => setAdjEmployeeId(e.target.value as string)}
              >
                {branchEmployees.map((emp: any) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DatePicker
                  label={adjIsRange ? "Start Date" : "Date"}
                  value={adjDate}
                  onChange={(val: Date | null) => setAdjDate(val)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
                {adjIsRange && (
                  <DatePicker
                    label="End Date"
                    value={adjEndDate}
                    onChange={(val: Date | null) => setAdjEndDate(val)}
                    minDate={adjDate || undefined}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                )}
              </Stack>
              <Button
                size="small"
                variant="text"
                onClick={() => { setAdjIsRange(!adjIsRange); setAdjEndDate(null); }}
                sx={{ textTransform: 'none', alignSelf: 'flex-start', mt: -1 }}
              >
                {adjIsRange ? '← Single day' : '📅 Log for multiple days (date range)'}
              </Button>
              {adjIsRange && adjDate && adjEndDate && adjEndDate > adjDate && (
                <Typography variant="caption" color="info.main" sx={{ mt: -1 }}>
                  This will create {eachDayOfInterval({ start: adjDate, end: adjEndDate }).length} entries (one per day)
                </Typography>
              )}
            </LocalizationProvider>

            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={adjType}
                label="Type"
                onChange={(e) => setAdjType(e.target.value as string)}
              >
                {adjustmentTypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: opt.color,
                        }}
                      />
                      <span>{opt.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={
                adjType === 'late' || adjType === 'undertime'
                  ? "Minutes"
                  : adjType === 'absent'
                  ? "Days"
                  : "Hours"
              }
              type="number"
              size="small"
              fullWidth
              value={adjValue}
              onChange={(e) => setAdjValue(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {adjType === 'late' || adjType === 'undertime'
                      ? 'mins'
                      : adjType === 'absent'
                      ? 'days'
                      : 'hrs'}
                  </InputAdornment>
                ),
              }}
              helperText={
                adjType === 'overtime'
                  ? "Regular OT: 125% of hourly rate"
                  : adjType === 'special_holiday_ot'
                  ? "Special Holiday OT: 169% of hourly rate"
                  : adjType === 'regular_holiday_ot'
                  ? "Regular Holiday OT: 260% of hourly rate"
                  : adjType === 'night_diff'
                  ? "Night differential: +10% of hourly rate"
                  : adjType === 'late'
                  ? "Deduction = (hourly rate / 60) × minutes"
                  : ""
              }
            />

            <TextField
              label="Remarks (DOLE compliance)"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={adjRemarks}
              onChange={(e) => setAdjRemarks(e.target.value)}
              placeholder="e.g., Extended shift for rush hour, approved by supervisor"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsAdjustmentDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAdjustment}
            disabled={!adjEmployeeId || !adjDate || !adjType || !adjValue || createAdjustmentMutation.isPending}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {createAdjustmentMutation.isPending ? "Logging..." : "Log Exception"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Exception Dialog */}
      <Dialog open={!!rejectLogId} onClose={() => setRejectLogId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Exception Log</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this exception log. This will be visible to the employee.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectLogId(null)}>Cancel</Button>
          <Button
            onClick={() => rejectLogId && rejectAdjustmentMutation.mutate({ id: rejectLogId, reason: rejectReason })}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejectAdjustmentMutation.isPending}
          >
            {rejectAdjustmentMutation.isPending ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Period Context Menu (3-dot menu) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closePeriodMenu}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 3,
            minWidth: 220,
            overflow: 'visible',
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuPeriod?.status === 'open' && (
          <MenuItem
            onClick={() => {
              if (menuPeriod) processPayrollMutation.mutate(menuPeriod.id);
              closePeriodMenu();
            }}
          >
            <ListItemIcon><PlayArrow fontSize="small" color="success" /></ListItemIcon>
            <ListItemText primary="Process Payroll" secondary="Calculate & generate entries" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (menuPeriod) {
              setSelectedPeriod(menuPeriod);
              setActiveTab(1);
            }
            closePeriodMenu();
          }}
        >
          <ListItemIcon><Visibility fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="View Entries" secondary="See employee pay details" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPeriod) {
              const url = `/api/reports/payroll/export?periodId=${menuPeriod.id}`;
              const now = new Date();
              const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
              const a = document.createElement("a");
              a.href = apiUrl(url);
              a.download = `payroll_export_${ts}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            closePeriodMenu();
          }}
        >
          <ListItemIcon><ExportIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText primary="Export CSV" secondary="Download payroll report" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (menuPeriod && window.confirm(`Delete payroll period? This action cannot be undone.`)) {
              deletePeriodMutation.mutate(menuPeriod.id);
            } else {
              closePeriodMenu();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete Period" secondary="Remove this payroll period" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
