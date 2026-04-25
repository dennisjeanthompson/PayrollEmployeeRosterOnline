import { a0 as useTheme, aG as useQueryClient, $ as useLocation, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, ag as alpha, bq as TaxIcon, aj as Typography, aJ as Stack, bA as TextField, b_ as InputAdornment, az as Search, aK as Button, bp as AddIcon, br as Grid, a3 as CalendarIcon, dm as Speed, bs as AccessTime, c5 as Tabs, c6 as Tab, dn as Groups, ce as NoteAdd, aM as CircularProgress, bt as Card, bu as CardContent, bl as format, dp as differenceInDays, am as Chip, bm as Divider, dq as PlayArrow, bV as Visibility, an as Tooltip, af as IconButton, cL as MoreVert, aU as CheckCircleIcon, bU as CancelIcon, ac as SettingsIcon, cO as LinearProgress, b0 as FormControl, b1 as Select, b2 as MenuItem, ae as DownloadIcon, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, al as Avatar, cW as DescriptionIcon, cr as Send, aC as ScheduleIcon, c3 as Switch, ay as Dialog, by as DialogTitle, bz as DialogContent, cB as LocalizationProvider, cC as AdapterDateFns, cF as DatePicker, b7 as Paper, bB as DialogActions, b$ as InputLabel, cJ as eachDayOfInterval, aI as Menu, au as ListItemIcon, aw as ListItemText, dr as ExportIcon, bG as DeleteIcon, bS as startOfMonth, bT as endOfMonth, ch as subDays } from './vendor-v-EuVKxF.js';
import { P as PesoIcon, b as getInitials, j as apiUrl, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';
import { PayslipPreview } from './payslip-preview-DYzGOcZC.js';
import './payroll-dates-BmATSNY8.js';
import './dialog-C9UQy7j1.js';
import './button-CBOKXpNF.js';

const getStatusColor = (status) => {
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
function MuiPayrollManagement() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = reactExports.useState(false);
  const [selectedPeriod, setSelectedPeriod] = reactExports.useState(null);
  const [startDate, setStartDate] = reactExports.useState(null);
  const [endDate, setEndDate] = reactExports.useState(null);
  const [payDate, setPayDate] = reactExports.useState(null);
  const [periodType, setPeriodType] = reactExports.useState("semi-monthly");
  const [payslipViewerOpen, setPayslipViewerOpen] = reactExports.useState(false);
  const [selectedEntryForPayslip, setSelectedEntryForPayslip] = reactExports.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = reactExports.useState(null);
  const [menuPeriod, setMenuPeriod] = reactExports.useState(null);
  const openPeriodMenu = (e, period) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setMenuPeriod(period);
  };
  const closePeriodMenu = () => {
    setMenuAnchorEl(null);
    setMenuPeriod(null);
  };
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = reactExports.useState(false);
  const [adjEmployeeId, setAdjEmployeeId] = reactExports.useState("");
  const [adjDate, setAdjDate] = reactExports.useState(null);
  const [adjEndDate, setAdjEndDate] = reactExports.useState(null);
  const [adjIsRange, setAdjIsRange] = reactExports.useState(false);
  const [adjType, setAdjType] = reactExports.useState("overtime");
  const [adjValue, setAdjValue] = reactExports.useState("");
  const [adjRemarks, setAdjRemarks] = reactExports.useState("");
  const [rejectLogId, setRejectLogId] = reactExports.useState(null);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  useRealtime({
    queryKeys: ["payroll-periods", "payroll-entries-branch"]
  });
  const handleViewPayslip = (entry) => {
    setSelectedEntryForPayslip(entry);
    setPayslipViewerOpen(true);
  };
  const [exporting, setExporting] = reactExports.useState(false);
  const handleExport = () => {
    if (!selectedPeriod) return;
    setExporting(true);
    const url = `/api/reports/payroll/export?periodId=${selectedPeriod.id}`;
    const now = /* @__PURE__ */ new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const a = document.createElement("a");
    a.href = apiUrl(url);
    a.download = `payroll_export_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setExporting(false), 1e3);
  };
  const getCurrentSemiMonthlyDates = () => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDate();
    if (day <= 15) {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth(), 15)
      };
    } else {
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 16),
        end: endOfMonth(today)
      };
    }
  };
  const openCreateDialog = () => {
    const { start, end } = getCurrentSemiMonthlyDates();
    setStartDate(start);
    setEndDate(end);
    setPayDate(end);
    setPeriodType("semi-monthly");
    setIsCreateDialogOpen(true);
  };
  const handlePeriodTypeChange = (type) => {
    setPeriodType(type);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (type === "semi-monthly") {
      const { start, end } = getCurrentSemiMonthlyDates();
      setStartDate(start);
      setEndDate(end);
      setPayDate(end);
    } else if (type === "month") {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
      setPayDate(endOfMonth(today));
    }
  };
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const { data: periodsData, isLoading: periodsLoading, refetch: refetchPeriods } = useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payroll/periods");
      return response.json();
    },
    staleTime: 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const { data: entriesData, isLoading: entriesLoading, refetch: refetchEntries } = useQuery({
    queryKey: ["payroll-entries-branch", selectedPeriod?.id],
    queryFn: async () => {
      const url = selectedPeriod ? `/api/payroll/entries/branch?periodId=${selectedPeriod.id}` : "/api/payroll/entries/branch";
      const response = await apiRequest("GET", url);
      return response.json();
    },
    enabled: !!selectedPeriod,
    staleTime: 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  reactExports.useEffect(() => {
    if (!selectedPeriod && periodsData?.periods?.length > 0) {
      const openPeriod = periodsData.periods.find((p) => p.status === "open");
      setSelectedPeriod(openPeriod || periodsData.periods[0]);
    }
  }, [periodsData, selectedPeriod]);
  const createPeriodMutation = useMutation({
    mutationFn: async (data) => {
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
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const processPayrollMutation = useMutation({
    mutationFn: async (periodId) => {
      const response = await apiRequest("POST", `/api/payroll/periods/${periodId}/process`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "✓ Payroll Processed", description: data.message || "All entries calculated" });
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const approveEntryMutation = useMutation({
    mutationFn: async (entryId) => {
      const response = await apiRequest("PUT", `/api/payroll/entries/${entryId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Entry Approved" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const markPaidMutation = useMutation({
    mutationFn: async (entryId) => {
      const response = await apiRequest("PUT", `/api/payroll/entries/${entryId}/paid`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Marked as Paid" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const sendPayslipMutation = useMutation({
    mutationFn: async (entryId) => {
      const response = await apiRequest("POST", `/api/payroll/entries/${entryId}/send`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Payslip Sent" });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const deletePeriodMutation = useMutation({
    mutationFn: async (periodId) => {
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
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      closePeriodMenu();
    }
  });
  const { data: adjustmentLogsData, isLoading: adjLogsLoading } = useQuery({
    queryKey: ["adjustment-logs-branch"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/adjustment-logs/branch");
      return response.json();
    },
    staleTime: 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const { data: employeesData } = useQuery({
    queryKey: ["branch-employees"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/employees");
      return response.json();
    },
    staleTime: 5 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const branchEmployees = reactExports.useMemo(() => {
    const employees = employeesData?.employees || employeesData || [];
    return employees.filter((e) => e.isActive !== false);
  }, [employeesData]);
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data) => {
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
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const approveAdjustmentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("PUT", `/api/adjustment-logs/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✓ Adjustment Approved" });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const rejectAdjustmentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PUT", `/api/adjustment-logs/${data.id}/reject`, { reason: data.reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Adjustment Rejected" });
      setRejectLogId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const { data: deductionSettingsData } = useQuery({
    queryKey: ["deduction-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/deduction-settings");
      return res.json();
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const { data: companySettingsData } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-settings");
      return res.json();
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const toggleIncludedMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${id}/toggle-included`);
      return res.json();
    },
    onSuccess: (data) => {
      const included = data?.log?.isIncluded;
      toast({ title: included ? "✓ Included in Payroll" : "Excluded from Payroll", description: included ? "This log will affect the next payroll run" : "This log will be skipped during payroll" });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const deductionProfile = deductionSettingsData?.settings;
  const companySettings = companySettingsData?.settings || companySettingsData;
  const handleCreateAdjustment = async () => {
    if (!adjEmployeeId || !adjDate || !adjValue) {
      toast({ title: "Missing Fields", description: "Employee, date, and value are required", variant: "destructive" });
      return;
    }
    let datesToLog = [adjDate];
    if (adjIsRange && adjEndDate && adjEndDate > adjDate) {
      datesToLog = eachDayOfInterval({ start: adjDate, end: adjEndDate });
    }
    for (const d of datesToLog) {
      await createAdjustmentMutation.mutateAsync({
        employeeId: adjEmployeeId,
        date: format(d, "yyyy-MM-dd"),
        type: adjType,
        value: adjValue,
        remarks: adjRemarks
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
    { value: "absent", label: "Absent (days)", color: "#dc2626" }
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
  const applyTemplate = (template) => {
    const today = /* @__PURE__ */ new Date();
    let start, end;
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
  const totalPeriods = periods.length;
  const openPeriods = periods.filter((p) => p.status === "open").length;
  const totalPaid = periods.reduce(
    (sum, p) => sum + (parseFloat(String(p.totalPay)) || 0),
    0
  );
  const totalHours = periods.reduce(
    (sum, p) => sum + (parseFloat(String(p.totalHours)) || 0),
    0
  );
  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color
  }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      elevation: 0,
      sx: {
        borderRadius: 4,
        border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 40px ${alpha(color, 0.15)}`
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 2.5, "&:last-child": { pb: 2.5 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { sx: { color, fontSize: 28 } })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { overflow: "hidden", flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", fontWeight: 600, noWrap: true, children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 800, sx: { mt: 0.25, mb: 0.25, lineHeight: 1.2, letterSpacing: "-0.02em" }, noWrap: true, children: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", noWrap: true, sx: { display: "block", opacity: 0.8 }, children: subtitle })
        ] })
      ] }) })
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { sx: { color: "white" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Payroll Management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Process payments, manage periods & track earnings" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                placeholder: "Search periods...",
                size: "small",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                slotProps: {
                  input: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { sx: { color: "text.secondary", fontSize: 20 } }) })
                  }
                },
                sx: {
                  display: { xs: "none", md: "block" },
                  width: 240,
                  "& .MuiOutlinedInput-root": { borderRadius: 3 }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: openCreateDialog,
                sx: {
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: "New Period"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Total Periods",
          value: totalPeriods.toString(),
          subtitle: "All time payroll cycles",
          icon: CalendarIcon,
          color: theme.palette.primary.main
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Open Periods",
          value: openPeriods.toString(),
          subtitle: "Awaiting processing",
          icon: Speed,
          color: theme.palette.warning.main
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Total Disbursed",
          value: `₱${totalPaid.toLocaleString()}`,
          subtitle: "Paid to employees",
          icon: PesoIcon,
          color: theme.palette.success.main
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Hours Logged",
          value: `${totalHours.toFixed(0)}h`,
          subtitle: "Total work hours",
          icon: AccessTime,
          color: theme.palette.secondary.main
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Tabs,
      {
        value: activeTab,
        onChange: (_, newValue) => setActiveTab(newValue),
        sx: {
          bgcolor: theme.palette.mode === "dark" ? "#2A2018" : "#F5F0E8",
          borderRadius: 3,
          p: 0.5,
          border: "1px solid",
          borderColor: theme.palette.mode === "dark" ? "#3D3228" : "#E0D5C5",
          "& .MuiTabs-indicator": {
            height: "100%",
            borderRadius: 2.5,
            bgcolor: theme.palette.mode === "dark" ? "#4A3820" : "#FFFFFF",
            boxShadow: theme.palette.mode === "dark" ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.12)",
            zIndex: 0
          },
          "& .MuiTab-root": {
            zIndex: 1,
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            borderRadius: 2.5,
            color: theme.palette.mode === "dark" ? "#C4AA88" : "#6B5944",
            "&.Mui-selected": {
              color: theme.palette.mode === "dark" ? "#F5E6D3" : "#3C2415",
              fontWeight: 700
            }
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 18 } }),
              iconPosition: "start",
              label: `Periods ${periods.length > 0 ? `(${periods.length})` : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Groups, { sx: { fontSize: 18 } }),
              iconPosition: "start",
              label: `Entries ${entries.length > 0 ? `(${entries.length})` : ""}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { sx: { fontSize: 18 } }),
              iconPosition: "start",
              label: `Exception Logs ${adjLogs.length > 0 ? `(${adjLogs.length})` : ""}`
            }
          )
        ]
      }
    ) }),
    activeTab === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 8 }, children: periodsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : periods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          elevation: 0,
          sx: {
            borderRadius: 4,
            border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
            p: 6,
            textAlign: "center"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 40, color: "primary.main" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, gutterBottom: true, children: "Start Your First Payroll" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 4 }, children: "Create a payroll period to start tracking employee hours and processing payments." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                size: "large",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: openCreateDialog,
                sx: { borderRadius: 3, px: 4, textTransform: "none", fontWeight: 600 },
                children: "Create Payroll Period"
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: periods.map((period) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${selectedPeriod?.id === period.id ? theme.palette.primary.main : "rgba(255, 255, 255, 0.02)"}`,
            transition: "all 0.2s",
            cursor: "pointer",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
            }
          },
          onClick: () => setSelectedPeriod(period),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Box,
                      {
                        sx: {
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { color: "primary.main" } })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", fontWeight: 600, sx: { lineHeight: 1.2 }, children: [
                        format(new Date(period.startDate), "MMM d"),
                        " –",
                        " ",
                        format(new Date(period.endDate), "MMM d, yyyy")
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                        (() => {
                          const days = differenceInDays(new Date(period.endDate), new Date(period.startDate)) + 1;
                          return days <= 16 ? "Semi-Monthly" : days <= 31 ? "Monthly" : `${days}-day period`;
                        })(),
                        period.createdAt ? ` • Generated: ${format(new Date(period.createdAt), "MMM d, yyyy h:mm a")}` : ""
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: period.status,
                        size: "small",
                        color: getStatusColor(period.status),
                        sx: { fontWeight: 600, textTransform: "capitalize" }
                      }
                    ),
                    period.totalHours && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                      parseFloat(String(period.totalHours)).toFixed(1),
                      "h"
                    ] }),
                    period.totalPay && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, color: "success.main", children: [
                      "₱",
                      parseFloat(String(period.totalPay)).toLocaleString()
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1.5 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [
              period.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "contained",
                  color: "success",
                  startIcon: processPayrollMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, {}),
                  onClick: (e) => {
                    e.stopPropagation();
                    processPayrollMutation.mutate(period.id);
                  },
                  disabled: processPayrollMutation.isPending,
                  sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                  children: "Process"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {}),
                  onClick: (e) => {
                    e.stopPropagation();
                    setSelectedPeriod(period);
                    setActiveTab(1);
                  },
                  sx: { borderRadius: 2, textTransform: "none" },
                  children: "View"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "More actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: (e) => openPeriodMenu(e, period),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVert, { fontSize: "small" })
                }
              ) })
            ] })
          ] })
        },
        period.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, lg: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
            p: 2.5
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, gutterBottom: true, children: "Quick Start Templates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Pre-configured periods" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: [
              { label: "Semi-Monthly", desc: "1st-15th or 16th-end", template: "semi-monthly" },
              { label: "Weekly", desc: "Last 7 days", template: "weekly" },
              { label: "Monthly", desc: "Full month cycle", template: "monthly" }
            ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "outlined",
                onClick: () => applyTemplate(item.template),
                sx: {
                  borderRadius: 2.5,
                  py: 1.5,
                  textTransform: "none",
                  justifyContent: "flex-start",
                  borderColor: "rgba(255, 255, 255, 0.04)",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "left" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: item.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: item.desc })
                ] })
              },
              item.template
            )) })
          ]
        }
      ) })
    ] }) : activeTab === 1 ? (
      /* Entries Tab */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              mb: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.04)} 0%, ${alpha(theme.palette.info.main, 0.01)} 100%)`
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { py: 1.5, px: 2.5, "&:last-child": { pb: 1.5 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, color: "text.secondary", sx: { mr: 0.5 }, children: "Deduction Profile:" }),
                [
                  { key: "deductSSS", label: "SSS" },
                  { key: "deductPhilHealth", label: "PhilHealth" },
                  { key: "deductPagibig", label: "Pag-IBIG" },
                  { key: "deductWithholdingTax", label: "Tax" }
                ].map((item) => {
                  const isActive = deductionProfile ? deductionProfile[item.key] : true;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      icon: isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { sx: { fontSize: 16 } }),
                      label: item.label,
                      size: "small",
                      color: isActive ? "success" : "default",
                      variant: isActive ? "filled" : "outlined",
                      sx: {
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        opacity: isActive ? 1 : 0.6
                      }
                    },
                    item.key
                  );
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true, sx: { mx: 0.5 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, color: "text.secondary", sx: { mr: 0.5 }, children: "Holiday Pay:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: companySettings?.includeHolidayPay ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { sx: { fontSize: 16 } }),
                    label: companySettings?.includeHolidayPay ? "Enabled" : "Disabled",
                    size: "small",
                    color: companySettings?.includeHolidayPay ? "success" : "default",
                    variant: companySettings?.includeHolidayPay ? "filled" : "outlined",
                    sx: { fontWeight: 700, fontSize: "0.75rem", opacity: companySettings?.includeHolidayPay ? 1 : 0.6 }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, { sx: { fontSize: 16 } }),
                  onClick: () => reactExports.startTransition(() => setLocation("/deduction-settings")),
                  sx: { textTransform: "none", fontWeight: 600, borderRadius: 2 },
                  children: "Configure"
                }
              )
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
              overflow: "hidden"
            },
            children: !selectedPeriod ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 6, textAlign: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { sx: { fontSize: 48, color: "text.disabled", mb: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "No Period Selected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Select a payroll period to view its entries" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => setActiveTab(0), sx: { borderRadius: 2 }, children: "Go to Periods" })
            ] }) : entriesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, {}) }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 6, textAlign: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { sx: { fontSize: 48, color: "warning.main", mb: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "No Entries Yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Process this payroll period to generate employee entries" }),
              selectedPeriod.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, {}),
                  onClick: () => processPayrollMutation.mutate(selectedPeriod.id),
                  sx: { borderRadius: 2, textTransform: "none" },
                  children: "Process Payroll Now"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Box,
                {
                  sx: {
                    p: 2,
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    borderBottom: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { minWidth: 260 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Select,
                        {
                          value: selectedPeriod?.id || "",
                          onChange: (e) => {
                            const newPeriod = periods.find((p) => p.id === e.target.value);
                            if (newPeriod) setSelectedPeriod(newPeriod);
                          },
                          sx: {
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: alpha(theme.palette.primary.main, 0.2)
                            }
                          },
                          children: periods.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: p.id, children: [
                            format(new Date(p.startDate), "MMM d"),
                            " – ",
                            format(new Date(p.endDate), "MMM d, yyyy")
                          ] }, p.id))
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                        entries.length,
                        " employees"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        startIcon: exporting ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
                        size: "small",
                        onClick: handleExport,
                        disabled: exporting || entries.length === 0,
                        sx: { textTransform: "none" },
                        children: exporting ? "Exporting..." : "Export"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Employee" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Hours" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Gross Pay" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Deductions" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Net Pay" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Actions" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: entries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Avatar,
                      {
                        src: entry.employee?.photoUrl || void 0,
                        sx: {
                          width: 36,
                          height: 36,
                          bgcolor: "primary.main",
                          fontSize: "0.85rem"
                        },
                        children: getInitials(entry.employee?.firstName, entry.employee?.lastName, entry.employee?.email)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                        entry.employee?.firstName,
                        " ",
                        entry.employee?.lastName
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: entry.employee?.position })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
                    parseFloat(String(entry.totalHours)).toFixed(1),
                    "h"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
                    "₱",
                    parseFloat(String(entry.grossPay)).toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { color: "error.main" }, children: [
                    "-₱",
                    parseFloat(String(entry.totalDeductions || entry.deductions || 0)).toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { fontWeight: 600, color: "success.main" }, children: [
                    "₱",
                    parseFloat(String(entry.netPay)).toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      size: "small",
                      label: entry.status === "paid" ? "Paid" : entry.status === "approved" ? "Approved" : "Pending",
                      color: entry.status === "paid" ? "success" : entry.status === "approved" ? "info" : "warning",
                      variant: "outlined"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 0.5, justifyContent: "flex-end", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View digital payslip (PH — Compliant 2026)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "info",
                        onClick: () => handleViewPayslip(entry),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionIcon, { fontSize: "small" })
                      }
                    ) }),
                    entry.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Approve", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "success",
                        disabled: approveEntryMutation.isPending,
                        onClick: () => approveEntryMutation.mutate(entry.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { fontSize: "small" })
                      }
                    ) }),
                    entry.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Mark as Paid", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "primary",
                        disabled: markPaidMutation.isPending,
                        onClick: () => markPaidMutation.mutate(entry.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { fontSize: "small" })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Send Payslip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        disabled: sendPayslipMutation.isPending,
                        onClick: () => sendPayslipMutation.mutate(entry.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { fontSize: "small" })
                      }
                    ) })
                  ] }) })
                ] }, entry.id)) })
              ] }) })
            ] })
          }
        )
      ] })
    ) : activeTab === 2 ? (
      /* Exception Logs Tab — Manager OT/Lateness Logging */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 2,
                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                  borderBottom: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: "Daily Exception Logs" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "OT, tardiness, and other adjustments logged by managers — DOLE compliant" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "contained",
                      startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, {}),
                      onClick: () => setIsAdjustmentDialogOpen(true),
                      sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                      children: "Log Exception"
                    }
                  )
                ]
              }
            ),
            adjLogsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, {}) }) : adjLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 6, textAlign: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 48, color: "text.disabled", mb: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "No Exception Logs Yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Log overtime, tardiness, or other adjustments when they happen. These will be factored into payroll processing." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, {}),
                  onClick: () => setIsAdjustmentDialogOpen(true),
                  sx: { borderRadius: 2, textTransform: "none" },
                  children: "Log First Exception"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Employee" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Remarks" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Include/exclude from payroll run", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 700, children: "Payroll" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Amount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: adjLogs.map((log) => {
                const typeConfig = adjustmentTypeOptions.find((t) => t.value === log.type);
                const isDeduction = ["late", "undertime", "absent"].includes(log.type);
                const valueUnit = log.type === "late" || log.type === "undertime" ? "mins" : log.type === "absent" ? "days" : "hrs";
                const logIncluded = log.isIncluded !== false;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, sx: {
                  opacity: logIncluded ? 1 : 0.5,
                  transition: "opacity 0.2s ease"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: log.employeeName || "Unknown" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { whiteSpace: "nowrap" }, children: log.startDate && log.endDate && log.startDate !== log.endDate && new Date(log.startDate).getTime() !== new Date(log.endDate).getTime() ? `${format(new Date(log.startDate), "MMM d, yy")} - ${format(new Date(log.endDate), "MMM d, yy")}` : log.startDate ? format(new Date(log.startDate), "MMM d, yyyy") : log.createdAt ? format(new Date(log.createdAt), "MMM d, yyyy") : "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: typeConfig?.label || log.type,
                      size: "small",
                      sx: {
                        bgcolor: alpha(typeConfig?.color || "#666", 0.1),
                        color: typeConfig?.color || "#666",
                        fontWeight: 600
                      }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                    log.value,
                    " ",
                    valueUnit
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis" }, children: log.remarks || "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: log.status === "disputed" ? "⚠️ Disputed" : log.status?.replace("_", " "),
                      size: "small",
                      color: log.status === "approved" ? "success" : log.status === "employee_verified" ? "info" : log.status === "rejected" ? "error" : log.status === "disputed" ? "error" : "warning",
                      variant: log.status === "disputed" ? "outlined" : "filled",
                      sx: { fontWeight: 600, textTransform: "capitalize" }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: log.status !== "approved" ? "Cannot include pending/disputed/rejected logs" : logIncluded ? "Included — will affect next payroll run" : "Excluded — will be skipped during payroll", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      size: "small",
                      checked: logIncluded,
                      onChange: () => toggleIncludedMutation.mutate(log.id),
                      disabled: toggleIncludedMutation.isPending || log.status !== "approved",
                      color: "success"
                    }
                  ) }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: log.calculatedAmount ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Typography,
                    {
                      variant: "body2",
                      fontWeight: 600,
                      color: isDeduction ? "error.main" : "success.main",
                      sx: { textDecoration: logIncluded ? "none" : "line-through" },
                      children: [
                        isDeduction ? "-" : "+",
                        "₱",
                        Math.abs(parseFloat(log.calculatedAmount)).toLocaleString(void 0, { minimumFractionDigits: 2 })
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.disabled", children: "Pending" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.5, justifyContent: "flex-end", children: (log.status === "pending" || log.status === "employee_verified") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Approve", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "success",
                        disabled: approveAdjustmentMutation.isPending,
                        onClick: () => approveAdjustmentMutation.mutate(log.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { fontSize: "small" })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Reject", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "error",
                        onClick: () => {
                          setRejectLogId(log.id);
                          setRejectReason("");
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { fontSize: "small" })
                      }
                    ) })
                  ] }) }) })
                ] }, log.id);
              }) })
            ] }) })
          ]
        }
      )
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isCreateDialogOpen,
        onClose: () => setIsCreateDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${theme.palette.background.paper} 100%)`
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { pb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { color: "white", fontSize: 24 } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Create Payroll Period" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Define the date range for this payroll cycle" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mx: 3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { pt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "info.main", fontWeight: 600, sx: { mb: 2 }, children: "⏱️ Period Duration" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: periodType === "semi-monthly" ? "contained" : "outlined",
                        onClick: () => handlePeriodTypeChange("semi-monthly"),
                        sx: {
                          flex: 1,
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600
                        },
                        children: "Semi-Monthly"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: periodType === "month" ? "contained" : "outlined",
                        onClick: () => handlePeriodTypeChange("month"),
                        sx: {
                          flex: 1,
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600
                        },
                        children: "Monthly"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: periodType === "custom" ? "contained" : "outlined",
                        onClick: () => handlePeriodTypeChange("custom"),
                        sx: {
                          flex: 1,
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600
                        },
                        children: "Custom"
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "primary", fontWeight: 600, sx: { mb: 2 }, children: "📅 Period Start Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DatePicker,
                    {
                      value: startDate,
                      onChange: (newValue) => setStartDate(newValue),
                      slotProps: {
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                              fontSize: "1.1rem",
                              fontWeight: 500,
                              "& input": {
                                padding: "14px 16px"
                              },
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.primary.main
                              }
                            }
                          }
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              borderRadius: 3,
                              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
                            }
                          }
                        }
                      }
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "secondary", fontWeight: 600, sx: { mb: 2 }, children: "📅 Period End Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DatePicker,
                    {
                      value: endDate,
                      onChange: (newValue) => setEndDate(newValue),
                      minDate: startDate || void 0,
                      slotProps: {
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                              fontSize: "1.1rem",
                              fontWeight: 500,
                              "& input": {
                                padding: "14px 16px"
                              },
                              "&:hover": {
                                bgcolor: alpha(theme.palette.secondary.main, 0.02)
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(theme.palette.secondary.main, 0.2)
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.secondary.main
                              }
                            }
                          }
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              borderRadius: 3,
                              boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.15)}`
                            }
                          }
                        }
                      }
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "warning.main", fontWeight: 600, sx: { mb: 2 }, children: "💰 Expected Pay Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DatePicker,
                    {
                      value: payDate,
                      onChange: (newValue) => setPayDate(newValue),
                      minDate: endDate || void 0,
                      slotProps: {
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "background.paper",
                              fontSize: "1.1rem",
                              fontWeight: 500,
                              "& input": {
                                padding: "14px 16px"
                              },
                              "&:hover": {
                                bgcolor: alpha(theme.palette.warning.main, 0.02)
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(theme.palette.warning.main, 0.2)
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.warning.main
                              }
                            }
                          }
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              borderRadius: 3,
                              boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.15)}`
                            }
                          }
                        }
                      }
                    }
                  )
                ]
              }
            ),
            startDate && endDate && payDate && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Paper,
              {
                elevation: 0,
                sx: {
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { color: "success.main", fontSize: 20 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "success.main", fontWeight: 500, children: [
                    "Period: ",
                    format(startDate, "MMM d, yyyy"),
                    " - ",
                    format(endDate, "MMM d, yyyy"),
                    " | Pays on ",
                    format(payDate, "MMM d")
                  ] })
                ] })
              }
            )
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setIsCreateDialogOpen(false),
                sx: { borderRadius: 2, textTransform: "none" },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: handleCreatePeriod,
                disabled: !startDate || !endDate || !payDate || createPeriodMutation.isPending,
                sx: {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: "Create Period"
              }
            )
          ] })
        ]
      }
    ),
    selectedEntryForPayslip && selectedPeriod && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PayslipPreview,
      {
        entryId: selectedEntryForPayslip.id,
        open: payslipViewerOpen,
        onOpenChange: (isOpen) => {
          setPayslipViewerOpen(isOpen);
          if (!isOpen) setSelectedEntryForPayslip(null);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isAdjustmentDialogOpen,
        onClose: () => setIsAdjustmentDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${theme.palette.background.paper} 100%)`
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { pb: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { color: "primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, children: "Log Exception" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Record overtime, tardiness, or other adjustments — DOLE compliant" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: adjEmployeeId,
                  label: "Employee",
                  onChange: (e) => setAdjEmployeeId(e.target.value),
                  children: branchEmployees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: emp.id, children: [
                    emp.firstName,
                    " ",
                    emp.lastName
                  ] }, emp.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DatePicker,
                  {
                    label: adjIsRange ? "Start Date" : "Date",
                    value: adjDate,
                    onChange: (val) => setAdjDate(val),
                    slotProps: { textField: { size: "small", fullWidth: true } }
                  }
                ),
                adjIsRange && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DatePicker,
                  {
                    label: "End Date",
                    value: adjEndDate,
                    onChange: (val) => setAdjEndDate(val),
                    minDate: adjDate || void 0,
                    slotProps: { textField: { size: "small", fullWidth: true } }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "text",
                  onClick: () => {
                    setAdjIsRange(!adjIsRange);
                    setAdjEndDate(null);
                  },
                  sx: { textTransform: "none", alignSelf: "flex-start", mt: -1 },
                  children: adjIsRange ? "← Single day" : "📅 Log for multiple days (date range)"
                }
              ),
              adjIsRange && adjDate && adjEndDate && adjEndDate > adjDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "info.main", sx: { mt: -1 }, children: [
                "This will create ",
                eachDayOfInterval({ start: adjDate, end: adjEndDate }).length,
                " entries (one per day)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: adjType,
                  label: "Type",
                  onChange: (e) => setAdjType(e.target.value),
                  children: adjustmentTypeOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: opt.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Box,
                      {
                        sx: {
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: opt.color
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opt.label })
                  ] }) }, opt.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: adjType === "late" || adjType === "undertime" ? "Minutes" : adjType === "absent" ? "Days" : "Hours",
                type: "number",
                size: "small",
                fullWidth: true,
                value: adjValue,
                onChange: (e) => setAdjValue(e.target.value),
                InputProps: {
                  endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: adjType === "late" || adjType === "undertime" ? "mins" : adjType === "absent" ? "days" : "hrs" })
                },
                helperText: adjType === "overtime" ? "Regular OT: 125% of hourly rate" : adjType === "special_holiday_ot" ? "Special Holiday OT: 169% of hourly rate" : adjType === "regular_holiday_ot" ? "Regular Holiday OT: 260% of hourly rate" : adjType === "night_diff" ? "Night differential: +10% of hourly rate" : adjType === "late" ? "Deduction = (hourly rate / 60) × minutes" : ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Remarks (DOLE compliance)",
                size: "small",
                fullWidth: true,
                multiline: true,
                rows: 2,
                value: adjRemarks,
                onChange: (e) => setAdjRemarks(e.target.value),
                placeholder: "e.g., Extended shift for rush hour, approved by supervisor"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setIsAdjustmentDialogOpen(false),
                sx: { borderRadius: 2, textTransform: "none" },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: handleCreateAdjustment,
                disabled: !adjEmployeeId || !adjDate || !adjType || !adjValue || createAdjustmentMutation.isPending,
                sx: {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: createAdjustmentMutation.isPending ? "Logging..." : "Log Exception"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!rejectLogId, onClose: () => setRejectLogId(null), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject Exception Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dividers: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Please provide a reason for rejecting this exception log. This will be visible to the employee." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            autoFocus: true,
            margin: "dense",
            label: "Rejection Reason",
            fullWidth: true,
            multiline: true,
            rows: 3,
            value: rejectReason,
            onChange: (e) => setRejectReason(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setRejectLogId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => rejectLogId && rejectAdjustmentMutation.mutate({ id: rejectLogId, reason: rejectReason }),
            color: "error",
            variant: "contained",
            disabled: !rejectReason.trim() || rejectAdjustmentMutation.isPending,
            children: rejectAdjustmentMutation.isPending ? "Rejecting..." : "Reject"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl: menuAnchorEl,
        open: Boolean(menuAnchorEl),
        onClose: closePeriodMenu,
        PaperProps: {
          elevation: 4,
          sx: {
            borderRadius: 3,
            minWidth: 220,
            overflow: "visible",
            mt: 1
          }
        },
        transformOrigin: { horizontal: "right", vertical: "top" },
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        children: [
          menuPeriod?.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                if (menuPeriod) processPayrollMutation.mutate(menuPeriod.id);
                closePeriodMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, { fontSize: "small", color: "success" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Process Payroll", secondary: "Calculate & generate entries" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                if (menuPeriod) {
                  setSelectedPeriod(menuPeriod);
                  setActiveTab(1);
                }
                closePeriodMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small", color: "primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "View Entries", secondary: "See employee pay details" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                if (menuPeriod) {
                  const url = `/api/reports/payroll/export?periodId=${menuPeriod.id}`;
                  const now = /* @__PURE__ */ new Date();
                  const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                  const a = document.createElement("a");
                  a.href = apiUrl(url);
                  a.download = `payroll_export_${ts}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
                closePeriodMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExportIcon, { fontSize: "small", color: "info" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Export CSV", secondary: "Download payroll report" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                if (menuPeriod && window.confirm(`Delete payroll period? This action cannot be undone.`)) {
                  deletePeriodMutation.mutate(menuPeriod.id);
                } else {
                  closePeriodMenu();
                }
              },
              sx: { color: "error.main" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small", color: "error" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Delete Period", secondary: "Remove this payroll period" })
              ]
            }
          )
        ]
      }
    )
  ] });
}

export { MuiPayrollManagement as default };
