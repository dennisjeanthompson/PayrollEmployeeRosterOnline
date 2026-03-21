/**
 * Deductions Page (PERO Payroll System)
 * Clean reference view for mandatory Philippine government deductions.
 * No configuration needed — rates are applied automatically.
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  useTheme,
  alpha,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  CheckCircle,
  Security,
  LocalHospital,
  Home,
  Receipt,
  OpenInNew,
  InfoOutlined,
  AutoAwesome,
} from "@mui/icons-material";
import { useLocation } from "wouter";

const deductions = [
  {
    key: "sss",
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
    basis: "SSS Circular 2024-006",
  },
  {
    key: "philhealth",
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
    basis: "PhilHealth Circular 2025-0001",
  },
  {
    key: "pagibig",
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
    note: "Maximum employee monthly contribution capped at ₱200 (2026 update)",
    basis: "HDMF 2nd Amendment of Circular No. 274",
  },
  {
    key: "tax",
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
    basis: "BIR RR 11-2018 / TRAIN Law",
  },
];

export default function MuiDeductionSettings() {
  const theme = useTheme();
  const [, setLocation] = useLocation();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.35)}`,
            }}
          >
            <CheckCircle sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Deductions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Philippine mandatory deductions — auto-applied per 2026 law
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<AutoAwesome sx={{ fontSize: 16 }} />}
          label="Auto-Compliant"
          color="success"
          sx={{ fontWeight: 700, px: 1 }}
        />
      </Box>

      {/* Info Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: alpha(theme.palette.success.main, 0.07),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        }}
      >
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <CheckCircle color="success" sx={{ mt: 0.25 }} />
            <Box>
              <Typography fontWeight={600} color="success.main">
                Mandatory deductions are calculated automatically
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SSS, PhilHealth, Pag-IBIG, and BIR withholding tax are applied to every payroll run using the official
                2026 government rate tables. No manual setup is required.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Deduction Rate Cards */}
      <Grid container spacing={3}>
        {deductions.map((item) => {
          const Icon = item.icon;
          return (
            <Grid key={item.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  height: "100%",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: `0 8px 24px ${alpha(item.color, 0.15)}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Stack spacing={2}>
                    {/* Icon + label */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: alpha(item.color, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon sx={{ color: item.color, fontSize: 22 }} />
                      </Box>
                      <Chip
                        label={item.rate}
                        size="small"
                        sx={{
                          bgcolor: alpha(item.color, 0.12),
                          color: item.color,
                          fontWeight: 700,
                          fontSize: "0.8rem",
                        }}
                      />
                    </Box>

                    {/* Name */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.fullLabel}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Details */}
                    <Stack spacing={0.75}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">Employee</Typography>
                        <Typography variant="caption" fontWeight={600}>{item.employeeShare}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">Employer</Typography>
                        <Typography variant="caption" fontWeight={600}>{item.employerShare}</Typography>
                      </Box>
                      {item.cap && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary">Cap</Typography>
                          <Typography variant="caption" fontWeight={600} color="warning.main">{item.cap}</Typography>
                        </Box>
                      )}
                      {item.floor && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary">Floor</Typography>
                          <Typography variant="caption" fontWeight={600}>{item.floor}</Typography>
                        </Box>
                      )}
                      {item.ceiling && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary">Ceiling</Typography>
                          <Typography variant="caption" fontWeight={600}>{item.ceiling}</Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Note */}
                    <Tooltip title={item.basis} placement="top">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          alignItems: "flex-start",
                          bgcolor: alpha(item.color, 0.08),
                          border: `1px solid ${alpha(item.color, 0.2)}`,
                          borderRadius: 2,
                          p: 1.25,
                        }}
                      >
                        <InfoOutlined sx={{ fontSize: 14, color: item.color, mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.4 }}>
                          {item.note}
                        </Typography>
                      </Box>
                    </Tooltip>

                    {/* Active badge */}
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                      label="Active"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Per-Employee Extra Deductions */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        }}
      >
        <CardContent sx={{ py: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="warning.main">
                Per-Employee Deductions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SSS Loan, Pag-IBIG Loan, Cash Advance, and other recurring deductions are managed per employee under
                <strong> Employees → Select Employee → Deductions</strong>.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
              onClick={() => setLocation("/employees")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Go to Employees
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Admin Rate Tables Link */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="text"
          size="small"
          endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
          onClick={() => setLocation("/admin/deduction-rates")}
          sx={{ textTransform: "none", color: "text.secondary" }}
        >
          View Deduction Rate Tables
        </Button>
      </Box>
    </Box>
  );
}
