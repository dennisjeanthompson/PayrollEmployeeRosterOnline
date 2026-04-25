import { a0 as useTheme, r as reactExports, bl as format, ax as useQuery, bY as subMonths, Q as jsxRuntimeExports, X as Box, ag as alpha, aF as ReportIcon, aj as Typography, bt as Card, bu as CardContent, aJ as Stack, a3 as CalendarIcon, bA as TextField, b2 as MenuItem, aM as CircularProgress, a5 as PeopleIcon, bq as TaxIcon, de as CardHeader, aK as Button, ae as DownloadIcon, bE as Alert, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, bm as Divider } from './vendor-v-EuVKxF.js';
import { P as PesoIcon, j as apiUrl, c as apiRequest } from './main-fla130dr.js';

function MuiReports() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = reactExports.useState(format(/* @__PURE__ */ new Date(), "yyyy-MM"));
  const [exporting, setExporting] = reactExports.useState(null);
  const { data: periodsData } = useQuery({
    queryKey: ["/api/payroll/periods"]
  });
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["/api/reports/summary", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const res = await apiRequest("GET", `/api/reports/summary?month=${month}&year=${year}`);
      return await res.json();
    }
  });
  const { data: remittances = [], isLoading: loadingRemittances } = useQuery({
    queryKey: ["/api/reports/remittance", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-");
      const res = await apiRequest("GET", `/api/reports/remittance?month=${month}&year=${year}`);
      return await res.json();
    }
  });
  const periods = periodsData?.periods || [];
  const summary = summaryData?.summary;
  const handleExport = async (type) => {
    setExporting(type);
    try {
      const url = type === "employees" ? "/api/reports/employees/export" : type === "deductions" && periods[0] ? `/api/reports/deductions/export?periodId=${periods[0].id}` : "/api/reports/payroll/export";
      const res = await fetch(apiUrl(url), { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Download failed" }));
        alert(err.message || "Failed to download CSV");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `${type}_export_${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
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
      alert("Failed to download CSV. Please try again.");
    } finally {
      setExporting(null);
    }
  };
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(/* @__PURE__ */ new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy")
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportIcon, { sx: { color: "white" } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Reports & Exports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Generate and download payroll reports" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { color: "action" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          select: true,
          label: "Report Period",
          value: selectedMonth,
          onChange: (e) => setSelectedMonth(e.target.value),
          size: "small",
          sx: { minWidth: 200 },
          children: monthOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: opt.value, children: opt.label }, opt.value))
        }
      )
    ] }) }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : summary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", md: "row" }, spacing: 2, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, children: [
            summary.activeEmployees,
            "/",
            summary.totalEmployees
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Active Employees" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { color: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, children: [
            "₱",
            parseFloat(summary.totalGross || "0").toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Gross Pay" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { color: "info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, children: [
            parseFloat(summary.totalHours || "0").toFixed(0),
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Hours Worked" })
        ] })
      ] }) }) })
    ] }),
    !isLoading && summary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, color: "error.main", children: [
          "₱",
          parseFloat(summary.totalSSS || "0").toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total SSS" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, color: "error.main", children: [
          "₱",
          parseFloat(summary.totalPhilHealth || "0").toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total PhilHealth" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, color: "error.main", children: [
          "₱",
          parseFloat(summary.totalPagibig || "0").toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Pag-IBIG" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { flex: 1, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, color: "warning.main", children: [
          "₱",
          parseFloat(summary.totalTax || "0").toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Tax" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Export Data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        {
          avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { color: "success" }),
          title: "Payroll Summary",
          subheader: "Export all payroll entries with earnings and deductions",
          action: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              color: "success",
              startIcon: exporting === "payroll" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
              onClick: () => handleExport("payroll"),
              disabled: !!exporting,
              sx: { borderRadius: 2, textTransform: "none" },
              children: "Download CSV"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        {
          avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { color: "primary" }),
          title: "Employee List",
          subheader: "Export all employee information (excluding passwords)",
          action: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              color: "primary",
              startIcon: exporting === "employees" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
              onClick: () => handleExport("employees"),
              disabled: !!exporting,
              sx: { borderRadius: 2, textTransform: "none" },
              children: "Download CSV"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardHeader,
          {
            avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { color: "warning" }),
            title: "Deductions Summary",
            subheader: "Export SSS, PhilHealth, Pag-IBIG, and tax deductions by employee",
            action: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "warning",
                startIcon: exporting === "deductions" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
                onClick: () => handleExport("deductions"),
                disabled: !!exporting || periods.length === 0,
                sx: { borderRadius: 2, textTransform: "none" },
                children: "Download CSV"
              }
            )
          }
        ),
        periods.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "Create a payroll period first to export deduction summaries." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { mt: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        {
          avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportIcon, { color: "primary" }),
          title: "Government Remittance Tracking (PRN Generation)",
          subheader: "Monthly pending contributions and loan amortizations to be paid to SSS, PhilHealth, and Pag-IBIG"
        }
      ),
      loadingRemittances ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "SSS Contrib (₱)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { color: "error.main" }, children: "SSS Loan (₱)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "PhilHealth (₱)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Pag-IBIG Contrib (₱)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { color: "error.main" }, children: "Pag-IBIG Loan (₱)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Total Due (₱)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          remittances.map((row, idx) => {
            const total = row.sssContribution + row.sssLoan + row.philHealthContribution + row.pagibigContribution + row.pagibigLoan;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold" }, children: row.employeeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: row.sssContribution.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { color: "error.main", fontWeight: "bold" }, children: row.sssLoan.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: row.philHealthContribution.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: row.pagibigContribution.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { color: "error.main", fontWeight: "bold" }, children: row.pagibigLoan.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: "bold" }, children: total.toFixed(2) })
            ] }, idx);
          }),
          remittances.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, align: "center", sx: { py: 3, color: "text.secondary" }, children: "No remittance data for this month." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 4 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", icon: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "✅ DOLE Compliant:" }),
      " All exports include itemized earnings and deductions as required by DOLE Order 174."
    ] }) })
  ] });
}

export { MuiReports as default };
