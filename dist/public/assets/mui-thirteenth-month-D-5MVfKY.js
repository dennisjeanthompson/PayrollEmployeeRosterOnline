import { a0 as useTheme, $ as useLocation, r as reactExports, ax as useQuery, Q as jsxRuntimeExports, X as Box, aJ as Stack, aj as Typography, b7 as Paper, af as IconButton, ai as ChevronLeftIcon, a3 as CalendarIcon, ah as ChevronRightIcon, aK as Button, ae as DownloadIcon, bE as Alert, br as Grid, dP as LedgerIcon, c1 as DataGrid, c2 as GridToolbar, bl as format, an as Tooltip, dl as InfoIcon } from './vendor-5dgU3tca.js';
import { i as isManager, a as isAdmin, j as apiUrl, c as apiRequest } from './main-2BvCZ7pP.js';
import { u as useToast } from './use-toast-DLYGmyYZ.js';
import { S as StatCard, E as EmptyState } from './cards-BHjkR-RN.js';

function MuiThirteenthMonth() {
  useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [isExporting, setIsExporting] = reactExports.useState(false);
  const hasAccess = isManager() || isAdmin();
  if (!hasAccess) {
    reactExports.startTransition(() => setLocation("/"));
    return null;
  }
  const { data, isLoading } = useQuery({
    queryKey: ["thirteenth-month-summary", selectedYear],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/thirteenth-month/summary?year=${selectedYear}`);
      return res.json();
    }
  });
  const summaryData = data?.summary || [];
  const totalProjected = summaryData.reduce((sum, row) => sum + row.projectedThirteenthMonth, 0);
  const eligibleCount = summaryData.length;
  const handleExport = () => {
    const now = /* @__PURE__ */ new Date();
    const ts = format(now, "yyyyMMdd_HHmm");
    const a = document.createElement("a");
    a.href = apiUrl(`/api/thirteenth-month/export?year=${selectedYear}`);
    a.download = `13th_month_${selectedYear}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Success", description: "Ledger exported successfully" });
  };
  const columns = [
    {
      field: "employeeName",
      headerName: "Employee Name",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", fontWeight: 600, noWrap: true, children: params.row.employeeName || "Unknown Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", noWrap: true, children: params.row.position || "No Position" })
      ] })
    },
    {
      field: "periodsCount",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderHeader: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Number of payroll cutoffs this employee was included in this year.", placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Periods" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 16, color: "text.secondary" } })
      ] }) }),
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: params.row.periodsCount })
    },
    {
      field: "totalBasicPaid",
      flex: 1,
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      renderHeader: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Sum of all basic pay earned this year. Excludes overtime, holiday pay, and night diff per DOLE rules.", placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", width: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 16, color: "text.secondary" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Total Basic Earned" })
      ] }) }),
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 500, children: [
        "₱",
        params.row.totalBasicPaid.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ] })
    },
    {
      field: "projectedThirteenthMonth",
      flex: 1,
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      renderHeader: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Formula: Total Basic Earned ÷ 12. This is exactly what you currently owe the employee.", placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", width: "100%" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 16, color: "primary.main" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, color: "primary.main", children: "Projected 13th Month" })
      ] }) }),
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, color: "primary.main", children: [
        "₱",
        params.row.projectedThirteenthMonth.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3, minHeight: "100vh", bgcolor: "background.default" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 0.5 }, children: "13th Month Ledger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "Track year-to-date running totals for mandatory 13th-month pay (PD 851)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 0,
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 0.5,
              borderRadius: 2,
              bgcolor: "action.hover"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => setSelectedYear((y) => y - 1),
                  sx: { color: "primary.main" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 18, color: "primary.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: selectedYear })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => setSelectedYear((y) => y + 1),
                  sx: { color: "primary.main" },
                  disabled: selectedYear >= (/* @__PURE__ */ new Date()).getFullYear(),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {})
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
            onClick: handleExport,
            disabled: isExporting || summaryData.length === 0,
            sx: { boxShadow: 2 },
            children: isExporting ? "Exporting..." : "Export CSV"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { borderRadius: 2 }, children: "Per BIR regulations, 13th-month pay is computed as 1/12 of the total basic salary earned during the year. Overtime, holiday pay, and night differential are legally excluded from this computation base." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: `Total Projected Liability (${selectedYear})`,
          value: `₱${totalProjected.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtitle: "Sum of all accumulated 13th month balances",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LedgerIcon, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Eligible Employees",
          value: eligibleCount,
          subtitle: "Employees with basic pay records this year",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LedgerIcon, {}),
          color: "info"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { elevation: 0, sx: { height: 600, width: "100%", borderRadius: 3, overflow: "hidden" }, children: summaryData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataGrid,
      {
        rows: summaryData.map((d) => ({ ...d, id: d.userId })),
        columns,
        loading: isLoading,
        disableRowSelectionOnClick: true,
        rowHeight: 72,
        density: "comfortable",
        slots: { toolbar: GridToolbar },
        slotProps: {
          toolbar: { showQuickFilter: true }
        },
        initialState: {
          pagination: { paginationModel: { pageSize: 15 } },
          sorting: { sortModel: [{ field: "employeeName", sort: "asc" }] }
        },
        pageSizeOptions: [15, 30, 50],
        sx: {
          border: "none",
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover", borderRadius: 0 },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
          "& .MuiDataGrid-row:hover": { bgcolor: "action.hover" }
        }
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LedgerIcon, {}),
        title: "No ledger records found",
        description: `No payroll periods have been processed yet for ${selectedYear}. Basic pay will accumulate here automatically when payroll is run.`
      }
    ) })
  ] }) });
}

export { MuiThirteenthMonth as default };
