import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aJ as Stack, aj as Typography, dN as AccountBalance, b0 as FormControl, b_ as InputLabel, b1 as Select, b2 as MenuItem, bs as Card, ag as alpha, bt as CardContent, aK as Button, aM as CircularProgress, dR as Calculate, aU as CheckCircle, cR as TableContainer, b7 as Paper, cS as Table, cT as TableHead, cU as TableRow, cV as TableCell, cW as TableBody, am as Chip, ay as Dialog, bx as DialogTitle, bA as DialogContent, dS as DialogContentText, bH as DialogActions } from './vendor-BZHHI3oX.js';
import { c as apiRequest } from './main-DLAah6Z1.js';
import { u as useToast } from './use-toast-CI81V-xA.js';

function Mui13thMonth() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [confirmDialog, setConfirmDialog] = reactExports.useState({
    open: false,
    type: "all",
    ids: []
  });
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["/api/13th-month", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/13th-month/${selectedYear}`);
      if (!res.ok) throw new Error("Failed to fetch 13th month records");
      return res.json();
    }
  });
  const computeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/13th-month/compute", { year: selectedYear });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/13th-month", selectedYear] });
      toast({
        title: "Computation Complete",
        description: `Successfully computed 13th month pay for ${data.count} employees.`
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Computation Failed",
        description: String(error)
      });
    }
  });
  const releaseMutation = useMutation({
    mutationFn: async (ids) => {
      const res = await apiRequest("PUT", "/api/13th-month/release", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/13th-month", selectedYear] });
      toast({
        title: "Release Successful",
        description: "The selected records have been marked as released and permanently locked."
      });
      setConfirmDialog({ open: false, type: "all", ids: [] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Release Failed",
        description: String(error)
      });
    }
  });
  const handleComputeAll = () => {
    computeMutation.mutate();
  };
  const handleRelease = (id) => {
    setConfirmDialog({ open: true, type: "single", ids: [id] });
  };
  const handleReleaseAll = () => {
    const pendingIds = records.filter((r) => r.status === "pending").map((r) => r.id);
    if (pendingIds.length === 0) return;
    setConfirmDialog({ open: true, type: "all", ids: pendingIds });
  };
  const confirmRelease = () => {
    releaseMutation.mutate(confirmDialog.ids);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(amount));
  };
  const pendingCount = records.filter((r) => r.status === "pending").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", mb: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: "bold", gutterBottom: true, sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalance, { color: "primary", fontSize: "large" }),
          "13th Month Pay"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Manage mandatory 13th month pay computations and releases for your branch." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { sx: { minWidth: 150 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Select,
          {
            value: selectedYear,
            label: "Year",
            onChange: (e) => setSelectedYear(Number(e.target.value)),
            children: [(/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getFullYear() - 1, (/* @__PURE__ */ new Date()).getFullYear() - 2].map((year) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: year, children: year }, year))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[2] }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", mb: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", fontWeight: "bold", children: [
          "Employees (",
          records.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: computeMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Calculate, {}),
              onClick: handleComputeAll,
              disabled: computeMutation.isPending,
              children: "Compute All"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "contained",
              color: "success",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, {}),
              onClick: handleReleaseAll,
              disabled: pendingCount === 0 || releaseMutation.isPending,
              children: [
                "Release All Pending (",
                pendingCount,
                ")"
              ]
            }
          )
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", p: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", flexDirection: "column", alignItems: "center", p: 4, sx: { bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: "No Records Found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", align: "center", mb: 2, children: [
          "There are no 13th month pay records for ",
          selectedYear,
          '. Click "Compute All" to generate them based on the payroll data for this year.'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleComputeAll, disabled: computeMutation.isPending, children: "Compute Now" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: `1px solid ${theme.palette.divider}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.05) }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold" }, children: "Employee Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold" }, children: "YTD Basic Salary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold" }, children: "13th Month Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold" }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: "bold", textAlign: "right" }, children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: records.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: record.employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatCurrency(record.totalBasicSalary) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: "bold", color: "primary.main", children: formatCurrency(record.amount) }),
            record.isTaxable && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", color: "warning", label: "> ₱90k Taxable", sx: { mt: 0.5, height: 20, fontSize: "0.65rem" } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: record.status === "released" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, {}), label: "Released", color: "success", size: "small", variant: "filled" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Pending", color: "default", size: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { textAlign: "right" }, children: record.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              variant: "contained",
              onClick: () => handleRelease(record.id),
              children: "Release"
            }
          ) })
        ] }, record.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: confirmDialog.open, onClose: () => setConfirmDialog({ open: false, type: "all", ids: [] }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirm Release" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContentText, { children: [
        confirmDialog.type === "all" ? `Are you sure you want to release 13th month pay for all ${confirmDialog.ids.length} pending employees?` : "Are you sure you want to release the 13th month pay for this employee?",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "This action cannot be undone." }),
        " Once released, the records will be permanently locked and automatically attached to their December payslips."
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setConfirmDialog({ open: false, type: "all", ids: [] }), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmRelease, color: "success", variant: "contained", disabled: releaseMutation.isPending, children: releaseMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24, color: "inherit" }) : "Confirm Release" })
      ] })
    ] })
  ] });
}

export { Mui13thMonth as default };
