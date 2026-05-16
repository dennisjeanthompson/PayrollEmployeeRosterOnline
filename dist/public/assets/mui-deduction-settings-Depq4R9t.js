import { a0 as useTheme, $ as useLocation, aG as useQueryClient, ax as useQuery, r as reactExports, aH as useMutation, Q as jsxRuntimeExports, X as Box, aM as CircularProgress, ag as alpha, aU as CheckCircle, aj as Typography, am as Chip, ak as AutoAwesome, br as Card, bs as CardContent, aJ as Stack, dn as InfoOutlined, bp as Grid, c8 as Security, c9 as LocalHospital, ca as Home, bv as Receipt, an as Tooltip, c2 as Switch, bm as Divider, db as ToggleOff, a3 as CalendarIcon, da as ToggleOn, aK as Button, aQ as OpenIcon } from './vendor-CQpdGtSm.js';
import { u as useRealtime } from './use-realtime-BljrbXiu.js';
import { g as getCurrentUser, c as apiRequest } from './main-CJ-55pyl.js';
import { u as useToast } from './use-toast-CyhX0tAV.js';

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
    icon: Security,
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
    icon: LocalHospital,
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
    icon: Home,
    color: "#8b5cf6",
    note: "Maximum employee monthly contribution capped at ₱200 (latest update)",
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
    icon: Receipt,
    color: "#f59e0b",
    note: "Annual ≤₱250k = 0% · ₱250k–₱400k = 15% · ₱400k–₱800k = 20% · ₱800k–₱2M = 25% · ₱2M–₱8M = 30% · >₱8M = 35%",
    basis: "BIR RR 11-2018 / TRAIN Law"
  }
];
function MuiDeductionSettings() {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useRealtime({ queryKeys: ["deduction-settings"] });
  const currentUser = getCurrentUser();
  const isManager = currentUser?.role === "manager" || currentUser?.role === "admin";
  const { data: companySettingsData } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/company-settings");
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const [toggles, setToggles] = reactExports.useState({
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true,
    includeExceptionLogs: true
  });
  const [includeHolidayPay, setIncludeHolidayPay] = reactExports.useState(false);
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
        deductWithholdingTax: s.deductWithholdingTax ?? true,
        includeExceptionLogs: s.includeExceptionLogs ?? true,
        includeNightDiff: s.includeNightDiff ?? true
      });
    }
  }, [settingsData]);
  reactExports.useEffect(() => {
    if (companySettingsData?.settings) {
      setIncludeHolidayPay(companySettingsData.settings.includeHolidayPay ?? false);
    }
  }, [companySettingsData]);
  const saveDeductionMutation = useMutation({
    mutationFn: async (deductionToggles) => {
      const res = await apiRequest("PUT", "/api/deduction-settings", deductionToggles);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deduction-settings"] });
    }
  });
  const saveHolidayPayMutation = useMutation({
    mutationFn: async (nextValue) => {
      let companySettingsId = companySettingsData?.settings?.id;
      if (!companySettingsId) {
        const fullSettingsRes = await apiRequest("GET", "/api/company-settings/full");
        const fullSettingsResult = await fullSettingsRes.json();
        companySettingsId = fullSettingsResult?.settings?.id;
      }
      if (!companySettingsId) {
        const defaultCreated = await apiRequest("POST", "/api/company-settings", {
          name: "My Company",
          address: "Company Address",
          tin: "000-000-000-000",
          includeHolidayPay: nextValue
        });
        return defaultCreated.json();
      }
      const res = await apiRequest("PUT", `/api/company-settings/${companySettingsId}`, {
        includeHolidayPay: nextValue
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: (error, nextValue) => {
      setIncludeHolidayPay(!nextValue);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const handleToggle = (field) => {
    if (!isManager) return;
    const newToggles = { ...toggles, [field]: !toggles[field] };
    setToggles(newToggles);
    saveDeductionMutation.mutate(newToggles);
  };
  const handleHolidayPayToggle = () => {
    if (!isManager) return;
    const nextValue = !includeHolidayPay;
    setIncludeHolidayPay(nextValue);
    saveHolidayPayMutation.mutate(nextValue);
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
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { sx: { color: "white", fontSize: 24 } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Deductions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Philippine mandatory deductions — ",
                isManager ? "toggle on/off per branch" : "auto-applied per official rates"
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(InfoOutlined, { color: "info", sx: { mt: 0.25 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 600, color: "info.main", children: isManager ? "Toggle deductions on or off for payroll processing" : "Mandatory deductions are calculated automatically" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: isManager ? "Use the switches below to enable or disable specific government deductions for this branch. Changes apply to all future payroll runs." : "SSS, PhilHealth, Pag-IBIG, and BIR withholding tax are applied to every payroll run using the latest official government rate tables." })
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
                      disabled: saveDeductionMutation.isPending
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
                      /* @__PURE__ */ jsxRuntimeExports.jsx(InfoOutlined, { sx: { fontSize: 14, color: item.color, mt: 0.2, flexShrink: 0 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.primary", fontWeight: 500, lineHeight: 1.4 }, children: item.note })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: isEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { sx: { fontSize: "14px !important" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOff, { sx: { fontSize: "14px !important" } }),
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
        isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${includeHolidayPay ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.15)}`,
              transition: "border-color 0.3s, opacity 0.3s",
              opacity: includeHolidayPay ? 1 : 0.75
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(theme.palette.success.main, 0.12), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { color: theme.palette.success.main, fontSize: 22 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Include Holiday Pay in Payroll" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "When enabled, holiday pay premiums are included in payroll computations for this branch. Disable it to exclude holiday pay from payroll runs." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Holiday premiums included", sx: { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 600 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Payroll impact only", sx: { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, fontWeight: 600 } })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: includeHolidayPay ? "Disable holiday pay integration" : "Enable holiday pay integration", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: includeHolidayPay,
                  onChange: handleHolidayPayToggle,
                  color: "success",
                  disabled: saveHolidayPayMutation.isPending
                }
              ) })
            ] }) })
          }
        ),
        isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${toggles.includeExceptionLogs ? alpha("#10b981", 0.3) : alpha(theme.palette.divider, 0.15)}`,
              transition: "border-color 0.3s, opacity 0.3s",
              opacity: toggles.includeExceptionLogs ? 1 : 0.75
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha("#10b981", 0.12), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOn, { sx: { color: "#10b981", fontSize: 22 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Include Exception Logs in Payroll" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "When enabled, approved overtime, tardiness (lateness), undertime, and absences from the Exception Log will automatically affect payroll computations. Overtime adds to gross pay; lateness, undertime, and absences deduct from hours worked." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "OT → +gross pay", sx: { bgcolor: alpha("#10b981", 0.1), color: "#10b981", fontWeight: 600 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Late → -minutes", sx: { bgcolor: alpha("#f97316", 0.1), color: "#f97316", fontWeight: 600 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Absent → -day pay", sx: { bgcolor: alpha("#ef4444", 0.1), color: "#ef4444", fontWeight: 600 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Undertime → -minutes", sx: { bgcolor: alpha("#ec4899", 0.1), color: "#ec4899", fontWeight: 600 } })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: toggles.includeExceptionLogs ? "Disable exception log payroll integration" : "Enable exception log payroll integration", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: toggles.includeExceptionLogs ?? true,
                  onChange: () => handleToggle("includeExceptionLogs"),
                  color: "success",
                  disabled: saveDeductionMutation.isPending
                }
              ) })
            ] }) })
          }
        ),
        isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${toggles.includeNightDiff ? alpha("#8b5cf6", 0.3) : alpha(theme.palette.divider, 0.15)}`,
              transition: "border-color 0.3s, opacity 0.3s",
              opacity: toggles.includeNightDiff ? 1 : 0.75
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha("#8b5cf6", 0.12), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOn, { sx: { color: "#8b5cf6", fontSize: 22 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Include Night Differential" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "When enabled, shifts overlapping 10:00 PM to 6:00 AM automatically receive a 10% premium." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Night Diff   +10% hourly", sx: { bgcolor: alpha("#8b5cf6", 0.1), color: "#8b5cf6", fontWeight: 600 } }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: toggles.includeNightDiff ? "Disable night differential" : "Enable night differential", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: toggles.includeNightDiff ?? true,
                  onChange: () => handleToggle("includeNightDiff"),
                  color: "secondary",
                  disabled: saveDeductionMutation.isPending
                }
              ) })
            ] }) })
          }
        ),
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
                  "SSS Loan, Pag-IBIG Loan, and other recurring deductions are managed per employee under",
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
