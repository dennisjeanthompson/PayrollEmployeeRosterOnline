const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/sss-contribution-table-Cn3wuX3B.js","assets/vendor-v-EuVKxF.js","assets/vendor-Bi9pq-j3.css"])))=>i.map(i=>d[i]);
import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aM as CircularProgress, ag as alpha, aj as Typography, aJ as Stack, aK as Button, cN as RefreshIcon, bp as AddIcon, c9 as SecurityIcon, ca as HealthIcon, cb as HomeIcon, bq as TaxIcon, cO as LinearProgress, cj as Accordion, ck as AccordionSummary, am as Chip, cl as ExpandMore, cm as AccordionDetails, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, an as Tooltip, af as IconButton, bW as EditIcon, bG as DeleteIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, bA as TextField, b2 as MenuItem, bB as DialogActions, T as __vitePreload } from './vendor-v-EuVKxF.js';
import { P as PesoIcon, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';

const SSSContributionTable = reactExports.lazy(() => __vitePreload(() => import('./sss-contribution-table-Cn3wuX3B.js'),true              ?__vite__mapDeps([0,1,2]):void 0));
const deductionTypes = [
  { value: "sss", label: "SSS", icon: SecurityIcon, color: "#3b82f6" },
  { value: "philhealth", label: "PhilHealth", icon: HealthIcon, color: "#10b981" },
  { value: "pagibig", label: "Pag-IBIG", icon: HomeIcon, color: "#8b5cf6" },
  { value: "tax", label: "Withholding Tax", icon: TaxIcon, color: "#f59e0b" }
];
function MuiAdminDeductionRates() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingRate, setEditingRate] = reactExports.useState(null);
  const [expandedType, setExpandedType] = reactExports.useState("sss");
  const [formData, setFormData] = reactExports.useState({
    type: "sss",
    minSalary: "",
    maxSalary: "",
    employeeRate: "",
    employeeContribution: "",
    description: ""
  });
  const { data: ratesData, isLoading } = useQuery({
    queryKey: ["/api/admin/deduction-rates"],
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/admin/deduction-rates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deduction-rates"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Deduction rate created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/admin/deduction-rates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deduction-rates"] });
      setIsDialogOpen(false);
      setEditingRate(null);
      resetForm();
      toast({ title: "Success", description: "Deduction rate updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("DELETE", `/api/admin/deduction-rates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deduction-rates"] });
      toast({ title: "Success", description: "Deduction rate deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const seedAllRatesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/seed-all-rates");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deduction-rates"] });
      toast({
        title: "Success",
        description: data.message || "All 2026 rates seeded successfully!"
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const resetForm = () => {
    setFormData({
      type: "sss",
      minSalary: "",
      maxSalary: "",
      employeeRate: "",
      employeeContribution: "",
      description: ""
    });
  };
  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      type: rate.type,
      minSalary: rate.minSalary,
      maxSalary: rate.maxSalary || "",
      employeeRate: rate.employeeRate || "",
      employeeContribution: rate.employeeContribution || "",
      description: rate.description || ""
    });
    setIsDialogOpen(true);
  };
  const handleSubmit = () => {
    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this deduction rate?")) {
      deleteMutation.mutate(id);
    }
  };
  const groupedRates = ratesData?.rates?.reduce((acc, rate) => {
    if (!acc[rate.type]) acc[rate.type] = [];
    acc[rate.type].push(rate);
    return acc;
  }, {}) || {};
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
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
                  background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.3)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { sx: { color: "white" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Deduction Rates Management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure Philippine government contribution tables and tax brackets (Admin Only)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                color: "warning",
                startIcon: seedAllRatesMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                onClick: () => {
                  if (confirm("This will replace ALL existing rates with official 2026 Philippine deduction rates (SSS, PhilHealth, Pag-IBIG, Tax). Continue?")) {
                    seedAllRatesMutation.mutate();
                  }
                },
                disabled: seedAllRatesMutation.isPending,
                sx: {
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none"
                },
                children: "Seed 2026 Rates"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: () => {
                  setEditingRate(null);
                  resetForm();
                  setIsDialogOpen(true);
                },
                sx: {
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: "Add Rate"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { borderRadius: 1 } }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SSSContributionTable, {}) }),
      deductionTypes.filter((t) => t.value !== "sss").map((typeConfig) => {
        const rates = groupedRates[typeConfig.value] || [];
        const Icon = typeConfig.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Accordion,
          {
            expanded: expandedType === typeConfig.value,
            onChange: (_, isExpanded) => setExpandedType(isExpanded ? typeConfig.value : false),
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${"rgba(255, 255, 255, 0.02)"}`,
              "&:before": { display: "none" },
              overflow: "hidden"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                AccordionSummary,
                {
                  expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, {}),
                  sx: {
                    bgcolor: alpha(typeConfig.color, 0.05),
                    "&:hover": { bgcolor: alpha(typeConfig.color, 0.08) }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, flex: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Box,
                        {
                          sx: {
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(typeConfig.color, 0.15),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { sx: { color: typeConfig.color } })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", fontWeight: 600, children: [
                          typeConfig.label,
                          " Contribution Table"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                          rates.length,
                          " rate bracket",
                          rates.length !== 1 ? "s" : "",
                          " configured"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: `${rates.length} brackets`,
                        size: "small",
                        sx: {
                          mr: 2,
                          bgcolor: alpha(typeConfig.color, 0.1),
                          color: typeConfig.color,
                          fontWeight: 600
                        }
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { sx: { p: 0 }, children: rates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 4, textAlign: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
                  "No rate brackets configured for ",
                  typeConfig.label
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "small",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                    onClick: () => {
                      setEditingRate(null);
                      setFormData({ ...formData, type: typeConfig.value });
                      setIsDialogOpen(true);
                    },
                    sx: { textTransform: "none" },
                    children: "Add First Bracket"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: typeConfig.value === "sss" ? "Compensation Range" : "Min Salary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: typeConfig.value === "sss" ? "Max Range" : "Max Salary" }),
                  typeConfig.value === "sss" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600, color: "success.main" }, children: "EE Share (Fixed)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Details (MSC/ER/Total)" })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Rate (%)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Fixed Amount" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Description" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 600 }, children: "Actions" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rates.map((rate) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 500, children: [
                    "₱",
                    parseFloat(rate.minSalary).toLocaleString(void 0, {
                      minimumFractionDigits: 2
                    })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: rate.maxSalary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                    "₱",
                    parseFloat(rate.maxSalary).toLocaleString(void 0, {
                      minimumFractionDigits: 2
                    })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "& Above", size: "small", variant: "outlined", color: "warning" }) }),
                  typeConfig.value === "sss" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: rate.employeeContribution ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: `₱${parseFloat(rate.employeeContribution).toLocaleString(void 0, {
                          minimumFractionDigits: 2
                        })}`,
                        color: "success",
                        size: "small",
                        sx: { fontWeight: 700 }
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", maxWidth: 280 }, children: rate.description || "-" }) })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: rate.employeeRate ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: `${rate.employeeRate}%`,
                        size: "small",
                        color: "info",
                        variant: "outlined",
                        sx: { fontWeight: 600 }
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: rate.employeeContribution ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 500, children: [
                      "₱",
                      parseFloat(rate.employeeContribution).toLocaleString(void 0, {
                        minimumFractionDigits: 2
                      })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Calculated" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { maxWidth: 200 }, children: rate.description || "-" }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 0.5, justifyContent: "flex-end", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleEdit(rate), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        size: "small",
                        color: "error",
                        onClick: () => handleDelete(rate.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" })
                      }
                    ) })
                  ] }) })
                ] }, rate.id)) })
              ] }) }) })
            ]
          },
          typeConfig.value
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isDialogOpen,
        onClose: () => setIsDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", fontWeight: 600, children: [
              editingRate ? "Edit" : "Add",
              " Deduction Rate"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure the deduction rate bracket for Philippine contributions" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                select: true,
                label: "Type",
                value: formData.type,
                onChange: (e) => setFormData({ ...formData, type: e.target.value }),
                fullWidth: true,
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                children: deductionTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: type.value, children: type.label }, type.value))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Minimum Salary (₱)",
                type: "number",
                value: formData.minSalary,
                onChange: (e) => setFormData({ ...formData, minSalary: e.target.value }),
                fullWidth: true,
                inputProps: { step: "0.01" },
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Maximum Salary (₱) - Leave empty for unlimited",
                type: "number",
                value: formData.maxSalary,
                onChange: (e) => setFormData({ ...formData, maxSalary: e.target.value }),
                fullWidth: true,
                inputProps: { step: "0.01" },
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Employee Rate (%) - For percentage-based",
                type: "number",
                value: formData.employeeRate,
                onChange: (e) => setFormData({ ...formData, employeeRate: e.target.value }),
                fullWidth: true,
                inputProps: { step: "0.01" },
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Fixed Contribution (₱) - For fixed amount",
                type: "number",
                value: formData.employeeContribution,
                onChange: (e) => setFormData({ ...formData, employeeContribution: e.target.value }),
                fullWidth: true,
                inputProps: { step: "0.01" },
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Description",
                value: formData.description,
                onChange: (e) => setFormData({ ...formData, description: e.target.value }),
                fullWidth: true,
                multiline: true,
                rows: 2,
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setIsDialogOpen(false),
                sx: { borderRadius: 2, textTransform: "none" },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: handleSubmit,
                disabled: createMutation.isPending || updateMutation.isPending,
                startIcon: createMutation.isPending || updateMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : null,
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                children: createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"
              }
            )
          ] })
        ]
      }
    )
  ] });
}

export { MuiAdminDeductionRates as default };
