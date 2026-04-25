const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/payslip-preview-DYzGOcZC.js","assets/vendor-v-EuVKxF.js","assets/vendor-Bi9pq-j3.css","assets/payroll-dates-BmATSNY8.js","assets/dialog-C9UQy7j1.js","assets/main-fla130dr.js","assets/main-B6bxn-dl.css","assets/button-CBOKXpNF.js","assets/use-toast-BDUJuTfF.js"])))=>i.map(i=>d[i]);
import { a0 as useTheme, r as reactExports, ax as useQuery, Q as jsxRuntimeExports, X as Box, bk as motion, ag as alpha, aJ as Stack, aj as Typography, an as Tooltip, af as IconButton, cN as RefreshIcon, cO as LinearProgress, br as Grid, bs as AccessTime, a7 as TrendingUpIcon, bq as TaxIcon, b7 as Paper, al as Avatar, bn as Skeleton, am as Chip, c5 as Tabs, c6 as Tab, ad as HistoryIcon, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, a3 as CalendarIcon, bl as format, cV as parseISO, aS as AdjustmentIcon, aU as CheckCircleIcon, cW as DescriptionIcon, ae as DownloadIcon, bm as Divider, aK as Button, T as __vitePreload } from './vendor-v-EuVKxF.js';
import { P as PesoIcon, g as getCurrentUser, c as apiRequest } from './main-fla130dr.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';
import { g as getPaymentDate } from './payroll-dates-BmATSNY8.js';

const DigitalPayslip = reactExports.lazy(() => __vitePreload(() => import('./payslip-preview-DYzGOcZC.js'),true              ?__vite__mapDeps([0,1,2,3,4,5,6,7,8]):void 0));
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "tabpanel", hidden: value !== index, ...other, children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 3 }, children }) });
}
function MuiPayroll() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [selectedPayslip, setSelectedPayslip] = reactExports.useState(null);
  const [payslipDialogOpen, setPayslipDialogOpen] = reactExports.useState(false);
  useRealtime({
    queryKeys: ["payroll-entries"],
    enabled: !!currentUser
  });
  const { data: payrollData, isLoading: payrollLoading, refetch: refetchPayroll } = useQuery({
    queryKey: ["payroll-entries"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payroll");
      return response.json();
    },
    enabled: !!currentUser,
    staleTime: 60 * 1e3,
    refetchOnWindowFocus: false
  });
  const payrollEntries = reactExports.useMemo(() => payrollData?.entries || [], [payrollData?.entries]);
  const currentEntry = reactExports.useMemo(
    () => payrollEntries.find((e) => e.status === "draft" || e.status === "pending"),
    [payrollEntries]
  );
  const paidEntries = reactExports.useMemo(() => payrollEntries.filter((e) => e.status === "paid"), [payrollEntries]);
  const totalEarningsYTD = reactExports.useMemo(
    () => paidEntries.reduce((sum, entry) => sum + parseFloat(String(entry.netPay || 0)), 0),
    [paidEntries]
  );
  const totalHoursYTD = reactExports.useMemo(
    () => paidEntries.reduce((sum, entry) => sum + parseFloat(String(entry.totalHours || 0)), 0),
    [paidEntries]
  );
  const averagePay = reactExports.useMemo(
    () => paidEntries.length > 0 ? totalEarningsYTD / paidEntries.length : 0,
    [paidEntries.length, totalEarningsYTD]
  );
  const formatCurrency = (value) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const handleViewPayslip = (entry) => {
    setSelectedPayslip(entry);
    setPayslipDialogOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, minHeight: "100vh", bgcolor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              mb: 4,
              p: 3,
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
              background: theme.palette.mode === "dark" ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha("#111", 0.9)} 50%, ${alpha(theme.palette.success.dark, 0.1)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, #fff 50%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`, pointerEvents: "none" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", bottom: -80, left: -20, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.06)} 0%, transparent 70%)`, pointerEvents: "none" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { position: "relative", zIndex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 800, gutterBottom: true, sx: { letterSpacing: -0.5 }, children: "My Payroll" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { opacity: 0.8 }, children: "View your earnings, payslips, and payment history • Updates in real-time" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { whileHover: { rotate: 180 }, transition: { duration: 0.4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Refresh data", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    onClick: () => {
                      refetchPayroll();
                    },
                    sx: {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {})
                  }
                ) }) })
              ] })
            ]
          }
        )
      }
    ),
    payrollLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { mb: 3, borderRadius: 1 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
      { label: "YTD Earnings", value: formatCurrency(totalEarningsYTD), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { fontSize: "small" }), color: theme.palette.success.main },
      { label: "Total Hours", value: `${totalHoursYTD.toFixed(1)}h`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, { fontSize: "small" }), color: theme.palette.primary.main },
      { label: "Average Pay", value: formatCurrency(averagePay), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUpIcon, { fontSize: "small" }), color: theme.palette.info.main },
      { label: "Pay Periods", value: String(paidEntries.length), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { fontSize: "small" }), color: theme.palette.secondary.main }
    ].map((stat, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] },
        whileHover: { y: -4, scale: 1.02 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 0,
            sx: {
              p: 2.5,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${alpha(stat.color, 0.15)}`,
              boxShadow: `0 4px 20px ${alpha(stat.color, 0.08)}`,
              transition: "border-color 0.3s, box-shadow 0.3s",
              "&:hover": {
                borderColor: alpha(stat.color, 0.35),
                boxShadow: `0 8px 30px ${alpha(stat.color, 0.15)}`
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(stat.color, 0.1)} 0%, transparent 70%)`, pointerEvents: "none" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, sx: { mb: 1.5, position: "relative", zIndex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 36, height: 36, bgcolor: alpha(stat.color, 0.12), color: stat.color }, children: stat.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", noWrap: true, sx: { fontWeight: 600, letterSpacing: 0.3 }, children: stat.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 800, noWrap: true, sx: { position: "relative", zIndex: 1, letterSpacing: -0.3 }, children: stat.value })
            ]
          }
        )
      }
    ) }, stat.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 4, minHeight: 220 }, children: payrollLoading && !currentEntry ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 0,
        sx: {
          p: 3,
          borderRadius: 4,
          minHeight: 220,
          bgcolor: alpha(theme.palette.background.paper, 0.55),
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: 180, height: 34 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12, md: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "45%", height: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "65%", height: 44 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "75%", height: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12, md: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "45%", height: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "60%", height: 44 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "50%", height: 16 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12, md: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "55%", height: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "70%", height: 44 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "text", width: "65%", height: 16 })
            ] })
          ] })
        ] })
      }
    ) : currentEntry ? /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: theme.palette.mode === "dark" ? 0 : 8,
        sx: {
          p: 3,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          background: theme.palette.mode === "dark" ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, #111 100%)` : `linear-gradient(135deg, #ffffff 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: theme.palette.mode === "dark" ? "0 16px 40px rgba(0,0,0,0.4)" : `0 16px 40px ${alpha(theme.palette.primary.main, 0.08)}`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -100, right: -50, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)` } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2, position: "relative", zIndex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Current Pay Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: currentEntry.status.toUpperCase(),
                color: currentEntry.status === "pending" ? "warning" : "default",
                size: "small"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { position: "relative", zIndex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Hours Worked" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, children: [
                parseFloat(String(currentEntry.totalHours)).toFixed(1),
                "h"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                "Regular: ",
                parseFloat(String(currentEntry.regularHours)).toFixed(1),
                "h | OT: ",
                parseFloat(String(currentEntry.overtimeHours)).toFixed(1),
                "h"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Gross Pay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, children: formatCurrency(currentEntry.grossPay) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Before deductions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Estimated Net Pay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "success.main", children: formatCurrency(currentEntry.netPay) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                "After ",
                formatCurrency(currentEntry.deductions),
                " deductions"
              ] })
            ] }) })
          ] })
        ]
      }
    ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 0,
        sx: {
          p: 3,
          borderRadius: 4,
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          bgcolor: alpha(theme.palette.background.paper, 0.55),
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, gutterBottom: true, children: "No current pay period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "You’ll see the active payroll cycle here once it’s created." })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.5 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 0,
            sx: {
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Tabs,
                {
                  value: activeTab,
                  onChange: (_, v) => setActiveTab(v),
                  sx: {
                    borderBottom: 1,
                    borderColor: alpha(theme.palette.divider, 0.1),
                    px: 2,
                    "& .MuiTab-root": {
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "0.9rem",
                      minHeight: 56
                    },
                    "& .Mui-selected": {
                      color: "primary.main"
                    },
                    "& .MuiTabs-indicator": {
                      height: 3,
                      borderRadius: "3px 3px 0 0"
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, {}), iconPosition: "start", label: "Payment History" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, {}), iconPosition: "start", label: "Payslips" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: activeTab, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 3 }, children: paidEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 8, textAlign: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, { sx: { fontSize: 64, color: "text.disabled", mb: 2 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "No payment history yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.disabled", children: "Your paid payroll entries will appear here" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { sx: { display: { xs: "none", md: "block" }, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { sx: { minWidth: 650 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Pay Period" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Hours" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Gross Pay" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Deductions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Net Pay" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: "Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: "Actions" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paidEntries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small", color: "action" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: entry.periodStartDate && entry.periodEndDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: [
                          format(new Date(entry.periodStartDate), "MMM d"),
                          " – ",
                          format(new Date(entry.periodEndDate), "MMM d, yyyy")
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                          "Paid ",
                          entry.paidAt ? format(new Date(entry.paidAt), "MMM d, yyyy") : format(getPaymentDate(entry.periodEndDate), "MMM d, yyyy")
                        ] })
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(parseISO(entry.createdAt), "MMM d, yyyy") }) })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
                      parseFloat(String(entry.totalHours)).toFixed(1),
                      "h"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: formatCurrency(entry.grossPay) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { color: "error.main" }, children: [
                      "-",
                      formatCurrency(entry.deductions)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 600 }, children: formatCurrency(entry.netPay) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "center", spacing: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustmentIcon, { sx: { fontSize: "14px !important" } }),
                          label: "Audit Trail",
                          size: "small",
                          variant: "outlined",
                          sx: { color: "info.main", borderColor: alpha(theme.palette.info.main, 0.4), fontWeight: 600 }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          label: "Paid",
                          color: "success",
                          size: "small",
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {})
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 0.5, justifyContent: "center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View digital payslip (PH — Compliant 2026)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          color: "info",
                          onClick: () => handleViewPayslip(entry),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionIcon, { fontSize: "small" })
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Download PDF", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleViewPayslip(entry), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, { fontSize: "small" }) }) })
                    ] }) })
                  ] }, entry.id)) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, sx: { display: { xs: "flex", md: "none" }, overflowX: "hidden" }, children: paidEntries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Paper,
                  {
                    variant: "outlined",
                    sx: { p: 2, borderRadius: 3, display: "flex", flexDirection: "column", gap: 1.5, overflow: "hidden" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minWidth: 0, flex: 1 }, children: entry.periodStartDate && entry.periodEndDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }, children: [
                            format(new Date(entry.periodStartDate), "MMM d"),
                            " – ",
                            format(new Date(entry.periodEndDate), "MMM d, yyyy")
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }, children: [
                            "Paid ",
                            entry.paidAt ? format(new Date(entry.paidAt), "MMM d, yyyy") : format(getPaymentDate(entry.periodEndDate), "MMM d, yyyy")
                          ] })
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }, children: format(parseISO(entry.createdAt), "MMM d, yyyy") }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Paid", color: "success", size: "small", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}), sx: { height: 24, flexShrink: 0 } })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 4 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", noWrap: true, children: "Hours" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, noWrap: true, children: [
                            parseFloat(String(entry.totalHours)).toFixed(1),
                            "h"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 4 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", noWrap: true, children: "Gross" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, noWrap: true, children: formatCurrency(entry.grossPay) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 4 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", noWrap: true, children: "Deductions" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, color: "error.main", noWrap: true, children: [
                            "-",
                            formatCurrency(entry.deductions)
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, children: "Net Pay" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 800, color: "success.main", noWrap: true, children: formatCurrency(entry.netPay) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "flex-end", gap: 1, mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          size: "small",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionIcon, {}),
                          onClick: () => handleViewPayslip(entry),
                          sx: { borderRadius: 2, textTransform: "none" },
                          children: "View Payslip"
                        }
                      ) })
                    ]
                  },
                  entry.id
                )) })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: activeTab, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: paidEntries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.4, delay: idx * 0.1 },
                  whileHover: { scale: 1.03, y: -4 },
                  whileTap: { scale: 0.97 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Paper,
                    {
                      elevation: 0,
                      sx: {
                        p: 2.5,
                        borderRadius: 4,
                        cursor: "pointer",
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                        position: "relative",
                        overflow: "hidden",
                        transition: "border-color 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`
                        }
                      },
                      onClick: () => handleViewPayslip(entry),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)` } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2, position: "relative", zIndex: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 44, height: 44 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, {}) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Chip,
                              {
                                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustmentIcon, { sx: { fontSize: "12px !important" } }),
                                label: "Audit Trail",
                                size: "small",
                                sx: { bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main", fontWeight: 700, fontSize: "0.65rem", borderRadius: 1.5 }
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Chip,
                              {
                                label: "Paid",
                                size: "small",
                                color: "success",
                                sx: { fontWeight: 800, fontSize: "0.65rem", borderRadius: 1.5 }
                              }
                            )
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", color: "text.secondary", sx: { fontWeight: 800, letterSpacing: 0.5, display: "block", position: "relative", zIndex: 1 }, children: "Pay Period" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 700, mb: 1.5, color: "text.primary", position: "relative", zIndex: 1 }, children: entry.periodStartDate && entry.periodEndDate ? `${format(new Date(entry.periodStartDate), "MMM d")} – ${format(new Date(entry.periodEndDate), "MMM d, yyyy")}` : format(parseISO(entry.createdAt), "MMMM d, yyyy") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2, opacity: 0.6 } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 700 }, children: "Net Pay" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 900, color: "success.main", lineHeight: 1, children: formatCurrency(entry.netPay) })
                        ] })
                      ]
                    }
                  )
                }
              ) }, entry.id)) }) }) })
            ]
          }
        )
      }
    ),
    selectedPayslip && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DigitalPayslip,
      {
        entryId: selectedPayslip.id,
        open: payslipDialogOpen,
        onOpenChange: setPayslipDialogOpen
      }
    ) })
  ] }) });
}

export { MuiPayroll as default };
