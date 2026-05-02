import { a0 as useTheme, $ as useLocation, ax as useQuery, Q as jsxRuntimeExports, c9 as SecurityIcon, ca as HealthIcon, cb as HomeIcon, bq as TaxIcon, ab as VerifiedIcon, bD as WarningIcon, X as Box, aM as CircularProgress, ag as alpha, aj as Typography, am as Chip, aU as CheckCircleIcon, aT as ErrorIcon, bt as Card, bu as CardContent, aJ as Stack, cO as LinearProgress, aK as Button, cN as RefreshIcon, r as reactExports, aQ as OpenIcon, ar as List, as as ListItem, au as ListItemIcon, aw as ListItemText, bm as Divider, bE as Alert } from './vendor-5dgU3tca.js';

function MuiComplianceDashboard() {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const { data: employeesData, isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/hours/all-employees"]
  });
  const { data: ratesData, isLoading: loadingRates } = useQuery({
    queryKey: ["/api/admin/deduction-rates"]
  });
  const employees = employeesData?.employees || [];
  const rates = ratesData?.rates || [];
  const complianceChecks = [];
  const sssRates = rates.filter((r) => r.type === "sss");
  complianceChecks.push({
    id: "sss-rates",
    name: "SSS Contribution Table",
    status: sssRates.length >= 30 ? "pass" : sssRates.length > 0 ? "warning" : "fail",
    message: sssRates.length >= 30 ? `${sssRates.length} brackets configured (2026 compliant)` : sssRates.length > 0 ? `Only ${sssRates.length} brackets. Should be 33 for full 2026 compliance.` : "No SSS rates configured. Add 2026 rate brackets.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityIcon, {})
  });
  const philhealthRates = rates.filter((r) => r.type === "philhealth");
  complianceChecks.push({
    id: "philhealth-rates",
    name: "PhilHealth Contribution",
    status: philhealthRates.length > 0 ? "pass" : "warning",
    message: philhealthRates.length > 0 ? "PhilHealth 5% rate configured" : "Add PhilHealth rate (5% shared, 2.5% employee)",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HealthIcon, {})
  });
  const pagibigRates = rates.filter((r) => r.type === "pagibig");
  complianceChecks.push({
    id: "pagibig-rates",
    name: "Pag-IBIG (HDMF) Contribution",
    status: pagibigRates.length > 0 ? "pass" : "warning",
    message: pagibigRates.length > 0 ? "Pag-IBIG rate configured" : "Add Pag-IBIG rate (2% each, max ₱200)",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeIcon, {})
  });
  const taxRates = rates.filter((r) => r.type === "tax");
  complianceChecks.push({
    id: "tax-rates",
    name: "BIR Withholding Tax (TRAIN)",
    status: taxRates.length >= 5 ? "pass" : taxRates.length > 0 ? "warning" : "fail",
    message: taxRates.length >= 5 ? `${taxRates.length} tax brackets configured` : taxRates.length > 0 ? "Incomplete tax brackets. TRAIN law requires 6 brackets." : "Add BIR withholding tax brackets per TRAIN law.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, {})
  });
  const employeesWithMissingData = employees.filter(
    (e) => !e.tin || !e.sss || !e.philhealth || !e.pagibig
  );
  complianceChecks.push({
    id: "employee-data",
    name: "Employee Government IDs",
    status: employeesWithMissingData.length === 0 ? "pass" : employeesWithMissingData.length <= 2 ? "warning" : "fail",
    message: employeesWithMissingData.length === 0 ? "All employees have complete government IDs" : `${employeesWithMissingData.length} employee(s) missing TIN/SSS/PhilHealth/Pag-IBIG`,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedIcon, {})
  });
  const minWageLaUnion = 470;
  const minHourlyRate = minWageLaUnion / 8;
  const belowMinWage = employees.filter(
    (e) => e.hourlyRate && parseFloat(e.hourlyRate) < minHourlyRate
  );
  complianceChecks.push({
    id: "min-wage",
    name: "Minimum Wage (La Union)",
    status: belowMinWage.length === 0 ? "pass" : "fail",
    message: belowMinWage.length === 0 ? `All employees meet ₱${minWageLaUnion}/day minimum` : `${belowMinWage.length} employee(s) below ₱${minWageLaUnion}/day minimum!`,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {})
  });
  const passCount = complianceChecks.filter((c) => c.status === "pass").length;
  const score = Math.round(passCount / complianceChecks.length * 100);
  const isLoading = loadingEmployees || loadingRates;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            width: 48,
            height: 48,
            borderRadius: 3,
            background: score >= 80 ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` : score >= 50 ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` : `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedIcon, { sx: { color: "white" } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Compliance Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Philippine Payroll Compliance Status (2026)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          icon: score >= 80 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : score >= 50 ? /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, {}),
          label: `${score}% Compliant`,
          color: score >= 80 ? "success" : score >= 50 ? "warning" : "error",
          sx: { fontWeight: 700, fontSize: "1rem", py: 2.5, px: 1 }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        elevation: 0,
        sx: {
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(
            score >= 80 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main,
            0.05
          ),
          border: `1px solid ${alpha(
            score >= 80 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main,
            0.2
          )}`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", md: "row" }, alignItems: "center", spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, width: "100%" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "Overall Compliance Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinearProgress,
              {
                variant: "determinate",
                value: score,
                color: score >= 80 ? "success" : score >= 50 ? "warning" : "error",
                sx: { height: 12, borderRadius: 6, mb: 1 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              passCount,
              " of ",
              complianceChecks.length,
              " checks passed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                onClick: () => window.location.reload(),
                sx: { borderRadius: 2 },
                children: "Refresh"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenIcon, {}),
                onClick: () => reactExports.startTransition(() => setLocation("/admin/deduction-rates")),
                sx: { borderRadius: 2 },
                children: "Configure Rates"
              }
            )
          ] })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Compliance Checks" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: complianceChecks.map((check, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ListItem,
        {
          sx: {
            py: 2,
            bgcolor: check.status === "fail" ? alpha(theme.palette.error.main, 0.05) : check.status === "warning" ? alpha(theme.palette.warning.main, 0.03) : "transparent"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(
                    check.status === "pass" ? theme.palette.success.main : check.status === "warning" ? theme.palette.warning.main : theme.palette.error.main,
                    0.1
                  ),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: check.status === "pass" ? "success.main" : check.status === "warning" ? "warning.main" : "error.main"
                },
                children: check.icon
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 600, children: check.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      size: "small",
                      label: check.status.toUpperCase(),
                      color: check.status === "pass" ? "success" : check.status === "warning" ? "warning" : "error",
                      variant: "outlined"
                    }
                  )
                ] }),
                secondary: check.message
              }
            ),
            check.status === "pass" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }),
            check.status === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }),
            check.status === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error" })
          ]
        }
      ),
      index < complianceChecks.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, check.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mt: 4, borderRadius: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", gutterBottom: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2026 Rate References:" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", component: "div", children: [
        "• SSS: CI-2024-006 (15% total, 5% employee, 10% employer, 33 brackets)",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• PhilHealth: PA2026-0002 (5% total, 2.5% each, ₱10k-₱100k salary range)",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• Pag-IBIG: Circular 460 (2% each, max ₱200/share)",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• BIR: RR 11-2018/TRAIN Law (progressive 0%-35%)",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• Min Wage La Union: RB I-D-26 (₱470/day non-agri)"
      ] })
    ] })
  ] });
}

export { MuiComplianceDashboard as default };
