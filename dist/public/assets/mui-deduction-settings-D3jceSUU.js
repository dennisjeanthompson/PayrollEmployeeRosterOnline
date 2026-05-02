import { a0 as useTheme, $ as useLocation, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aM as CircularProgress, ag as alpha, aU as CheckCircleIcon, aj as Typography, am as Chip, ak as AutoAwesome, bt as Card, bu as CardContent, aJ as Stack, dl as InfoIcon, br as Grid, c9 as SecurityIcon, ca as HealthIcon, cb as HomeIcon, bq as TaxIcon, an as Tooltip, c3 as Switch, bm as Divider, d9 as ToggleOff, aK as Button, aQ as OpenIcon } from './vendor-5dgU3tca.js';
import { g as getCurrentUser, c as apiRequest } from './main-2BvCZ7pP.js';

const deductions = [
  {
    key: "sss",
    dbField: "deductSSS",
    label: "SSS",
    fullLabel: "Social Security System",
    rate: "5%",
    employeeShare: "5% of MSC",
    employerShare: "10% of MSC",
    floor: "₱5,000",
    ceiling: "₱35,000",
    cap: null,
    icon: SecurityIcon,
    color: "#3b82f6",
    note: "61 salary brackets | MPF/WISP applies above ₱20,000",
    basis: "SSS Circular 2024-006"
  },
  {
    key: "philhealth",
    dbField: "deductPhilHealth",
    label: "PhilHealth",
    fullLabel: "Philippine Health Insurance",
    rate: "2.5%",
    employeeShare: "2.5% of monthly salary",
    employerShare: "2.5% of monthly salary",
    floor: "₱10,000",
    ceiling: "₱100,000",
    cap: "Max ₱2,500/mo",
    icon: HealthIcon,
    color: "#10b981",
    note: "5% total rate split equally between employee and employer",
    basis: "PhilHealth Circular 2025-0001"
  },
  {
    key: "pagibig",
    dbField: "deductPagibig",
    label: "Pag-IBIG",
    fullLabel: "Home Development Mutual Fund",
    rate: "2%",
    employeeShare: "2% of basic salary",
    employerShare: "2% of basic salary",
    floor: null,
    ceiling: "₱10,000",
    cap: "Max ₱200/mo",
    icon: HomeIcon,
    color: "#8b5cf6",
    note: "Maximum employee monthly contribution capped at ₱200 (2026 update)",
    basis: "HDMF 2nd Amendment of Circular No. 274"
  },
  {
    key: "tax",
    dbField: "deductWithholdingTax",
    label: "Withholding Tax",
    fullLabel: "BIR Withholding Tax (TRAIN Law)",
    rate: "0–35%",
    employeeShare: "Progressive brackets",
    employerShare: "—",
    floor: null,
    ceiling: null,
    cap: null,
    icon: TaxIcon,
    color: "#f59e0b",
    note: "Annual ≤₱250k = 0% · ₱250k–₱400k = 15% · ₱400k–₱800k = 20% · ₱800k–₱2M = 25% · ₱2M–₱8M = 30% · >₱8M = 35%",
    basis: "BIR RR 11-2018 / TRAIN Law"
  }
];
function MuiDeductionSettings() {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isManager = currentUser?.role === "manager" || currentUser?.role === "admin";
  const [toggles, setToggles] = reactExports.useState({
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true
  });
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["deduction-settings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/deduction-settings");
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  reactExports.useEffect(() => {
    if (settingsData?.settings) {
      const s = settingsData.settings;
      setToggles({
        deductSSS: s.deductSSS ?? true,
        deductPhilHealth: s.deductPhilHealth ?? true,
        deductPagibig: s.deductPagibig ?? true,
        deductWithholdingTax: s.deductWithholdingTax ?? true
      });
    }
  }, [settingsData]);
  const saveMutation = useMutation({
    mutationFn: async (newToggles) => {
      const res = await apiRequest("PUT", "/api/deduction-settings", newToggles);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deduction-settings"] });
    }
  });
  const handleToggle = (field) => {
    if (!isManager) return;
    const newToggles = { ...toggles, [field]: !toggles[field] };
    setToggles(newToggles);
    saveMutation.mutate(newToggles);
  };
  if (settingsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      sx: {
        p: { xs: 2, md: 4 },
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
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
                  boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.35)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { color: "white", fontSize: 24 } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Deductions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Philippine mandatory deductions — ",
                isManager ? "toggle on/off per branch" : "auto-applied per 2026 law"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoAwesome, { sx: { fontSize: 16 } }),
              label: isManager ? "Configurable" : "Auto-Compliant",
              color: isManager ? "primary" : "success",
              sx: { fontWeight: 700, px: 1 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.07),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { py: 2, "&:last-child": { pb: 2 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "flex-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { color: "info", sx: { mt: 0.25 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 600, color: "info.main", children: isManager ? "Toggle deductions on or off for payroll processing" : "Mandatory deductions are calculated automatically" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: isManager ? "Use the switches below to enable or disable specific government deductions for this branch. Changes apply to all future payroll runs." : "SSS, PhilHealth, Pag-IBIG, and BIR withholding tax are applied to every payroll run using the official 2026 government rate tables." })
              ] })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: deductions.map((item) => {
          const Icon = item.icon;
          const isEnabled = toggles[item.dbField] ?? true;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              elevation: 0,
              sx: {
                borderRadius: 3,
                border: `1px solid ${isEnabled ? alpha(item.color, 0.3) : alpha(theme.palette.divider, 0.1)}`,
                height: "100%",
                transition: "box-shadow 0.2s, transform 0.2s, opacity 0.3s",
                opacity: isEnabled ? 1 : 0.6,
                "&:hover": {
                  boxShadow: `0 8px 24px ${alpha(item.color, 0.15)}`,
                  transform: "translateY(-2px)"
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 3, "&:last-child": { pb: 3 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Box,
                    {
                      sx: {
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: alpha(item.color, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { sx: { color: item.color, fontSize: 22 } })
                    }
                  ),
                  isManager ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: isEnabled ? `Disable ${item.label}` : `Enable ${item.label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: isEnabled,
                      onChange: () => handleToggle(item.dbField),
                      color: "success",
                      size: "small",
                      disabled: saveMutation.isPending
                    }
                  ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: item.rate,
                      size: "small",
                      sx: {
                        bgcolor: alpha(item.color, 0.12),
                        color: item.color,
                        fontWeight: 700,
                        fontSize: "0.8rem"
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: item.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: item.fullLabel })
                ] }),
                isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: item.rate,
                    size: "small",
                    sx: {
                      alignSelf: "flex-start",
                      bgcolor: alpha(item.color, 0.12),
                      color: item.color,
                      fontWeight: 700,
                      fontSize: "0.8rem"
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.75, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Employee" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, children: item.employeeShare })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Employer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, children: item.employerShare })
                  ] }),
                  item.cap && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Cap" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, color: "warning.main", children: item.cap })
                  ] }),
                  item.floor && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Floor" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, children: item.floor })
                  ] }),
                  item.ceiling && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Ceiling" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 600, children: item.ceiling })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: item.basis, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Box,
                  {
                    sx: {
                      display: "flex",
                      gap: 0.75,
                      alignItems: "flex-start",
                      bgcolor: alpha(item.color, 0.08),
                      border: `1px solid ${alpha(item.color, 0.2)}`,
                      borderRadius: 2,
                      p: 1.25
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 14, color: item.color, mt: 0.2, flexShrink: 0 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.primary", fontWeight: 500, lineHeight: 1.4 }, children: item.note })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: isEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: "14px !important" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOff, { sx: { fontSize: "14px !important" } }),
                    label: isEnabled ? "Active" : "Disabled",
                    size: "small",
                    color: isEnabled ? "success" : "default",
                    variant: "outlined",
                    sx: { alignSelf: "flex-start" }
                  }
                )
              ] }) })
            }
          ) }, item.key);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { py: 2.5, "&:last-child": { pb: 2.5 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, color: "warning.main", children: "Per-Employee Deductions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                  "SSS Loan, Pag-IBIG Loan, Cash Advance, and other recurring deductions are managed per employee under",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " Employees → Select Employee → Deductions" }),
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  color: "warning",
                  size: "small",
                  endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenIcon, { sx: { fontSize: 16 } }),
                  onClick: () => reactExports.startTransition(() => setLocation("/employees")),
                  sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                  children: "Go to Employees"
                }
              )
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "text",
            size: "small",
            endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenIcon, { sx: { fontSize: 14 } }),
            onClick: () => reactExports.startTransition(() => setLocation("/admin/deduction-rates")),
            sx: { textTransform: "none", color: "text.secondary" },
            children: "View Deduction Rate Tables"
          }
        ) })
      ]
    }
  );
}

export { MuiDeductionSettings as default };
