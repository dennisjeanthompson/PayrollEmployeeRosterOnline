/**
 * Compliance Dashboard
 * Overview of Philippine payroll compliance status
 */

import { startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
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
  Security as SecurityIcon,
  LocalHospital as HealthIcon,
  Home as HomeIcon,
  Receipt as TaxIcon,
  Verified as VerifiedIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import { useLocation } from "wouter";

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

  // Fetch employees for compliance checks
  const { data: employeesData, isLoading: loadingEmployees } = useQuery<{ employees: any[] }>({
    queryKey: ["/api/hours/all-employees"],
  });

  // Fetch deduction rates
  const { data: ratesData, isLoading: loadingRates } = useQuery<{ rates: any[] }>({
    queryKey: ["/api/admin/deduction-rates"],
  });

  const employees = employeesData?.employees || [];
  const rates = ratesData?.rates || [];

  // Calculate compliance checks
  const complianceChecks: ComplianceCheck[] = [];

  // 1. Check SSS rates configured
  const sssRates = rates.filter(r => r.type === "sss");
  complianceChecks.push({
    id: "sss-rates",
    name: "SSS Contribution Table",
    status: sssRates.length >= 30 ? "pass" : sssRates.length > 0 ? "warning" : "fail",
    message: sssRates.length >= 30 
      ? `${sssRates.length} brackets configured (2025 compliant)`
      : sssRates.length > 0 
        ? `Only ${sssRates.length} brackets. Should be 33 for full 2025 compliance.`
        : "No SSS rates configured. Add 2025 rate brackets.",
    icon: <SecurityIcon />,
  });

  // 2. Check PhilHealth rates
  const philhealthRates = rates.filter(r => r.type === "philhealth");
  complianceChecks.push({
    id: "philhealth-rates",
    name: "PhilHealth Contribution",
    status: philhealthRates.length > 0 ? "pass" : "warning",
    message: philhealthRates.length > 0 
      ? "PhilHealth 5% rate configured"
      : "Add PhilHealth rate (5% shared, 2.5% employee)",
    icon: <HealthIcon />,
  });

  // 3. Check Pag-IBIG rates
  const pagibigRates = rates.filter(r => r.type === "pagibig");
  complianceChecks.push({
    id: "pagibig-rates",
    name: "Pag-IBIG (HDMF) Contribution",
    status: pagibigRates.length > 0 ? "pass" : "warning",
    message: pagibigRates.length > 0 
      ? "Pag-IBIG rate configured"
      : "Add Pag-IBIG rate (2% each, max ₱200)",
    icon: <HomeIcon />,
  });

  // 4. Check BIR withholding tax rates
  const taxRates = rates.filter(r => r.type === "tax");
  complianceChecks.push({
    id: "tax-rates",
    name: "BIR Withholding Tax (TRAIN)",
    status: taxRates.length >= 5 ? "pass" : taxRates.length > 0 ? "warning" : "fail",
    message: taxRates.length >= 5 
      ? `${taxRates.length} tax brackets configured`
      : taxRates.length > 0 
        ? "Incomplete tax brackets. TRAIN law requires 6 brackets."
        : "Add BIR withholding tax brackets per TRAIN law.",
    icon: <TaxIcon />,
  });

  // 5. Check employee data completeness
  const employeesWithMissingData = employees.filter(e => 
    !e.tin || !e.sss || !e.philhealth || !e.pagibig
  );
  complianceChecks.push({
    id: "employee-data",
    name: "Employee Government IDs",
    status: employeesWithMissingData.length === 0 ? "pass" : 
            employeesWithMissingData.length <= 2 ? "warning" : "fail",
    message: employeesWithMissingData.length === 0 
      ? "All employees have complete government IDs"
      : `${employeesWithMissingData.length} employee(s) missing TIN/SSS/PhilHealth/Pag-IBIG`,
    icon: <VerifiedIcon />,
  });

  // 6. Min wage compliance
  const minWageLaUnion = 470; // ₱470/day La Union 2025
  const minHourlyRate = minWageLaUnion / 8;
  const belowMinWage = employees.filter(e => 
    e.hourlyRate && parseFloat(e.hourlyRate) < minHourlyRate
  );
  complianceChecks.push({
    id: "min-wage",
    name: "Minimum Wage (La Union)",
    status: belowMinWage.length === 0 ? "pass" : "fail",
    message: belowMinWage.length === 0 
      ? `All employees meet ₱${minWageLaUnion}/day minimum`
      : `${belowMinWage.length} employee(s) below ₱${minWageLaUnion}/day minimum!`,
    icon: <WarningIcon />,
  });

  // Calculate overall score
  const passCount = complianceChecks.filter(c => c.status === "pass").length;
  const score = Math.round((passCount / complianceChecks.length) * 100);

  const isLoading = loadingEmployees || loadingRates;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: score >= 80 
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
            Philippine Payroll Compliance Status (2025)
          </Typography>
        </Box>
        <Chip
          icon={score >= 80 ? <CheckIcon /> : score >= 50 ? <WarningIcon /> : <ErrorIcon />}
          label={`${score}% Compliant`}
          color={score >= 80 ? "success" : score >= 50 ? "warning" : "error"}
          sx={{ fontWeight: 700, fontSize: "1rem", py: 2.5, px: 1 }}
        />
      </Box>

      {/* Overall Score Card */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          bgcolor: alpha(
            score >= 80 ? theme.palette.success.main : 
            score >= 50 ? theme.palette.warning.main : 
            theme.palette.error.main, 
            0.05
          ),
          border: `1px solid ${alpha(
            score >= 80 ? theme.palette.success.main : 
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
                Overall Compliance Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={score}
                color={score >= 80 ? "success" : score >= 50 ? "warning" : "error"}
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
                onClick={() => startTransition(() => setLocation("/admin/deduction-rates"))}
                sx={{ borderRadius: 2 }}
              >
                Configure Rates
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Compliance Checks */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Compliance Checks
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

      {/* Reference Information */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>2025 Rate References:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          • SSS: CI-2024-006 (15% total, 5% employee, 10% employer, 33 brackets)
          <br />
          • PhilHealth: PA2025-0002 (5% total, 2.5% each, ₱10k-₱100k salary range)
          <br />
          • Pag-IBIG: Circular 460 (2% each, max ₱200/share)
          <br />
          • BIR: RR 11-2018/TRAIN Law (progressive 0%-35%)
          <br />
          • Min Wage La Union: RB I-D-26 (₱470/day non-agri)
        </Typography>
      </Alert>
    </Box>
  );
}
