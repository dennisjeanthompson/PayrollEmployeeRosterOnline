import { a0 as useTheme, $ as useLocation, ax as useQuery, Q as jsxRuntimeExports, a8 as StoreIcon, a5 as PeopleIcon, X as Box, aM as CircularProgress, ag as alpha, ab as VerifiedIcon, aj as Typography, am as Chip, aU as CheckCircle, by as WarningIcon, aT as ErrorIcon, br as Card, bs as CardContent, aJ as Stack, cQ as LinearProgress, aK as Button, cP as RefreshIcon, r as reactExports, aQ as OpenIcon, ar as List, as as ListItem, au as ListItemIcon, aw as ListItemText, bm as Divider, a9 as BusinessIcon } from './vendor-CQpdGtSm.js';
import { c as apiRequest } from './main-CXSQmcn6.js';

function MuiComplianceDashboard() {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const { data: companyData, isLoading: loadingCompany } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-settings");
      return res.json();
    }
  });
  const { data: branchesData, isLoading: loadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/branches");
      return res.json();
    }
  });
  const { data: employeesData, isLoading: loadingEmployees } = useQuery({
    queryKey: ["all-employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return res.json();
    }
  });
  const company = companyData?.settings || companyData;
  const branches = branchesData?.branches || [];
  const employees = employeesData?.employees || [];
  const complianceChecks = [];
  const isCompanyComplete = company?.name && company?.address && company?.industry;
  complianceChecks.push({
    id: "company-profile",
    name: "Company Identity Setup",
    status: isCompanyComplete ? "pass" : company ? "warning" : "fail",
    message: isCompanyComplete ? "Core company details configured" : "Company identity is missing core details (Name, Address, or Industry)",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, {})
  });
  const activeBranches = branches.filter((b) => b.isActive);
  const branchesWithIncompleteData = activeBranches.filter((b) => !b.name || !b.address);
  complianceChecks.push({
    id: "branch-config",
    name: "Branch Details",
    status: activeBranches.length === 0 ? "fail" : branchesWithIncompleteData.length === 0 ? "pass" : "warning",
    message: activeBranches.length === 0 ? "No active branches configured" : branchesWithIncompleteData.length === 0 ? "All active branches have complete details" : `${branchesWithIncompleteData.length} branch(es) missing required address/name`,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, {})
  });
  const activeEmployees = employees.filter((e) => e.isActive);
  const employeesWithoutRate = activeEmployees.filter((e) => !e.hourlyRate || parseFloat(e.hourlyRate) <= 0);
  complianceChecks.push({
    id: "employee-rates",
    name: "Employee Pay Rates",
    status: activeEmployees.length === 0 ? "fail" : employeesWithoutRate.length === 0 ? "pass" : "fail",
    message: activeEmployees.length === 0 ? "No active employees found" : employeesWithoutRate.length === 0 ? "All active employees have an assigned hourly rate" : `${employeesWithoutRate.length} employee(s) missing hourly rate configuration`,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {})
  });
  const passCount = complianceChecks.filter((c) => c.status === "pass").length;
  const score = complianceChecks.length > 0 ? Math.round(passCount / complianceChecks.length * 100) : 0;
  const isLoading = loadingCompany || loadingBranches || loadingEmployees;
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
            background: score === 100 ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` : score >= 50 ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` : `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "System Configuration Readiness" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          icon: score === 100 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, {}) : score >= 50 ? /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, {}),
          label: `${score}% Ready`,
          color: score === 100 ? "success" : score >= 50 ? "warning" : "error",
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
            score === 100 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main,
            0.05
          ),
          border: `1px solid ${alpha(
            score === 100 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main,
            0.2
          )}`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", md: "row" }, alignItems: "center", spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, width: "100%" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "System Configuration Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LinearProgress,
              {
                variant: "determinate",
                value: score,
                color: score === 100 ? "success" : score >= 50 ? "warning" : "error",
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
                onClick: () => reactExports.startTransition(() => setLocation("/admin/company-settings")),
                sx: { borderRadius: 2 },
                children: "Company Settings"
              }
            )
          ] })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, sx: { mb: 2 }, children: "Configuration Checks" }),
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
            check.status === "pass" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { color: "success" }),
            check.status === "warning" && /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }),
            check.status === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error" })
          ]
        }
      ),
      index < complianceChecks.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, check.id)) }) })
  ] });
}

export { MuiComplianceDashboard as default };
