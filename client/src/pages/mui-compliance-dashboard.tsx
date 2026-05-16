/**
 * Compliance Dashboard
 * Overview of internal company configuration and basic compliance status
 */

import { startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ComplianceCheck {
  id: string;
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  icon: React.ReactNode;
}

export default function MuiComplianceDashboard() {
  const theme = useTheme();
  const [, setLocation] = useLocation();

  const { data: companyData, isLoading: loadingCompany } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-settings");
      return res.json();
    },
  });

  const { data: branchesData, isLoading: loadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/branches");
      return res.json();
    },
  });

  const { data: employeesData, isLoading: loadingEmployees } = useQuery({
    queryKey: ["all-employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return res.json();
    },
  });

  const company = companyData?.settings || companyData;
  const branches = branchesData?.branches || [];
  const employees = employeesData?.employees || [];

  const complianceChecks: ComplianceCheck[] = [];

  // 1. Check Company Profile
  const isCompanyComplete = company?.name && company?.address && company?.industry;
  complianceChecks.push({
    id: "company-profile",
    name: "Company Identity Setup",
    status: isCompanyComplete ? "pass" : company ? "warning" : "fail",
    message: isCompanyComplete 
      ? "Core company details configured"
      : "Company identity is missing core details (Name, Address, or Industry)",
    icon: <BusinessIcon />,
  });

  // 2. Check Branch Configuration
  const activeBranches = branches.filter((b: any) => b.isActive);
  const branchesWithIncompleteData = activeBranches.filter((b: any) => !b.name || !b.address);
  complianceChecks.push({
    id: "branch-config",
    name: "Branch Details",
    status: activeBranches.length === 0 ? "fail" : branchesWithIncompleteData.length === 0 ? "pass" : "warning",
    message: activeBranches.length === 0
      ? "No active branches configured"
      : branchesWithIncompleteData.length === 0
        ? "All active branches have complete details"
        : `${branchesWithIncompleteData.length} branch(es) missing required address/name`,
    icon: <StoreIcon />,
  });

  // 3. Check Employee Payroll Details
  const activeEmployees = employees.filter((e: any) => e.isActive);
  const employeesWithoutRate = activeEmployees.filter((e: any) => !e.hourlyRate || parseFloat(e.hourlyRate) <= 0);
  complianceChecks.push({
    id: "employee-rates",
    name: "Employee Pay Rates",
    status: activeEmployees.length === 0 ? "fail" : employeesWithoutRate.length === 0 ? "pass" : "fail",
    message: activeEmployees.length === 0
      ? "No active employees found"
      : employeesWithoutRate.length === 0
        ? "All active employees have an assigned hourly rate"
        : `${employeesWithoutRate.length} employee(s) missing hourly rate configuration`,
    icon: <PeopleIcon />,
  });

  const passCount = complianceChecks.filter(c => c.status === "pass").length;
  const score = complianceChecks.length > 0 ? Math.round((passCount / complianceChecks.length) * 100) : 0;

  const isLoading = loadingCompany || loadingBranches || loadingEmployees;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: score === 100 
              ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
              : score >= 50
                ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                : `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <VerifiedIcon sx={{ color: "white" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Compliance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System Configuration Readiness
          </Typography>
        </Box>
        <Chip
          icon={score === 100 ? <CheckIcon /> : score >= 50 ? <WarningIcon /> : <ErrorIcon />}
          label={`${score}% Ready`}
          color={score === 100 ? "success" : score >= 50 ? "warning" : "error"}
          sx={{ fontWeight: 700, fontSize: "1rem", py: 2.5, px: 1 }}
        />
      </Box>

      <Card 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          bgcolor: alpha(
            score === 100 ? theme.palette.success.main : 
            score >= 50 ? theme.palette.warning.main : 
            theme.palette.error.main, 
            0.05
          ),
          border: `1px solid ${alpha(
            score === 100 ? theme.palette.success.main : 
            score >= 50 ? theme.palette.warning.main : 
            theme.palette.error.main, 
            0.2
          )}`,
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} alignItems="center" spacing={3}>
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                System Configuration Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={score}
                color={score === 100 ? "success" : score >= 50 ? "warning" : "error"}
                sx={{ height: 12, borderRadius: 6, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {passCount} of {complianceChecks.length} checks passed
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<OpenIcon />}
                onClick={() => startTransition(() => setLocation("/admin/company-settings"))}
                sx={{ borderRadius: 2 }}
              >
                Company Settings
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Configuration Checks
      </Typography>

      <Card elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <List disablePadding>
          {complianceChecks.map((check, index) => (
            <Box key={check.id}>
              <ListItem
                sx={{
                  py: 2,
                  bgcolor: check.status === "fail" 
                    ? alpha(theme.palette.error.main, 0.05) 
                    : check.status === "warning"
                      ? alpha(theme.palette.warning.main, 0.03)
                      : "transparent",
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(
                        check.status === "pass" ? theme.palette.success.main :
                        check.status === "warning" ? theme.palette.warning.main :
                        theme.palette.error.main,
                        0.1
                      ),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: check.status === "pass" ? "success.main" :
                             check.status === "warning" ? "warning.main" :
                             "error.main",
                    }}
                  >
                    {check.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={600}>{check.name}</Typography>
                      <Chip
                        size="small"
                        label={check.status.toUpperCase()}
                        color={check.status === "pass" ? "success" : check.status === "warning" ? "warning" : "error"}
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={check.message}
                />
                {check.status === "pass" && (
                  <CheckIcon color="success" />
                )}
                {check.status === "warning" && (
                  <WarningIcon color="warning" />
                )}
                {check.status === "fail" && (
                  <ErrorIcon color="error" />
                )}
              </ListItem>
              {index < complianceChecks.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Card>
    </Box>
  );
}
