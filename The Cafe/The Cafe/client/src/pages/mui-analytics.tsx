/**
 * Forecasting Dashboard
 * Predicted labor hours & payroll costs
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ── Types ──────────────────────────────────────────────

interface TrendsData {
  weeklyPatterns: Array<{
    dayOfWeek: string;
    avgHours: number;
    avgCost: number;
  }>;
  comparison: {
    thisWeek: { hours: number; shifts: number };
    lastWeek: { hours: number; shifts: number };
    hoursChange: number;
    shiftsChange: number;
  };
}

interface ForecastPoint {
  date: string;
  dayOfWeek: string;
  predicted: number;
  lower: number;
  upper: number;
  isHoliday?: { name: string; type: string } | null;
}

interface LaborForecast {
  forecasts: ForecastPoint[];
  confidence: string;
  message: string;
}

interface PayrollForecast {
  forecasts: ForecastPoint[];
  summary: {
    totalPredicted: number;
    avgDaily: number;
    period: string;
  };
}

// ── Empty Chart Placeholder ──────────────────────────────
function EmptyChart({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
        borderRadius: 2,
      }}
    >
      <InfoIcon sx={{ fontSize: 36, color: "text.disabled" }} />
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );
}

// ── Component ──────────────────────────────────────────

export default function MuiAnalytics() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [forecastDays, setForecastDays] = useState<number>(14);

  // ── Data queries ──
  const {
    data: trendsData,
    isLoading: trendsLoading,
    isError: trendsError,
  } = useQuery<TrendsData>({
    queryKey: ["analytics-trends"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/trends?days=56&view=daily");
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: laborForecast,
    isLoading: laborLoading,
    isError: laborError,
    refetch: refetchLabor,
  } = useQuery<LaborForecast>({
    queryKey: ["forecast-labor", forecastDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forecast/labor?days=${forecastDays}`);
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: payrollForecast,
    isLoading: payrollLoading,
    isError: payrollError,
    refetch: refetchPayroll,
  } = useQuery<PayrollForecast>({
    queryKey: ["forecast-payroll", forecastDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forecast/payroll?days=${forecastDays}`);
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-labor"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-payroll"] });
  };

  // ── Derived data ──
  const isLoading = trendsLoading || laborLoading || payrollLoading;
  const hoursChange = trendsData?.comparison?.hoursChange ?? 0;

  // Build chart data — filter out any NaN values defensively
  const forecastChartData = (laborForecast?.forecasts ?? [])
    .filter((f) => !isNaN(f.predicted))
    .map((f) => ({
      date: format(parseISO(f.date), "MMM d"),
      fullDate: f.date,
      dayOfWeek: f.dayOfWeek,
      predicted: Number(f.predicted) || 0,
      lower: Number(f.lower) || 0,
      upper: Number(f.upper) || 0,
      isHoliday: f.isHoliday?.name || null,
    }));

  const patternsData = (trendsData?.weeklyPatterns ?? []).map((p) => ({
    day: p.dayOfWeek,
    hours: Math.round((Number(p.avgHours) || 0) * 10) / 10,
  }));

  const payrollChartData = (payrollForecast?.forecasts ?? [])
    .filter((f) => !isNaN(f.predicted))
    .map((f) => ({
      date: format(parseISO(f.date), "MMM d"),
      predicted: Number(f.predicted) || 0,
      isHoliday: f.isHoliday?.name || null,
    }));

  const isLowConfidence = laborForecast?.confidence === "low";

  // ── Render ──
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AnalyticsIcon sx={{ color: "white", fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Forecasting
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Predicted labor hours &amp; payroll costs
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshAll}
          sx={{ borderRadius: 2, textTransform: "none" }}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Low-data info banner */}
      {!isLoading && isLowConfidence && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Limited data:</strong> {laborForecast?.message ?? "Showing estimates based on default staffing patterns. Add more shifts to improve accuracy."}
        </Alert>
      )}

      {/* API Error banner */}
      {(laborError || payrollError || trendsError) && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button size="small" color="inherit" onClick={handleRefreshAll}>
              Retry
            </Button>
          }
        >
          Failed to load forecast data. Please check your connection and try again.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* ── Summary Cards ── */}
          <Grid container spacing={2}>
            {/* This Week Hours */}
            <Grid size={{ xs: 6 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ScheduleIcon color="primary" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Hours This Week
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
                    {trendsData?.comparison?.thisWeek?.hours ?? 0}h
                  </Typography>
                  <Chip
                    size="small"
                    icon={hoursChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={`${hoursChange >= 0 ? "+" : ""}${hoursChange.toFixed(0)}% vs last week`}
                    color={hoursChange >= 0 ? "success" : "error"}
                    variant="outlined"
                    sx={{ height: 22 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Predicted Payroll */}
            <Grid size={{ xs: 6 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MoneyIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Est. Payroll ({forecastDays}d)
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
                    ₱{(payrollForecast?.summary?.totalPredicted ?? 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ~₱{(payrollForecast?.summary?.avgDaily ?? 0).toLocaleString()}/day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Labor Hours Forecast ── */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Labor Hours Forecast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isLowConfidence
                    ? "Estimated daily hours (default patterns — no historical shifts found)"
                    : "Predicted daily staff-hours based on 8-week patterns"}
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={forecastDays}
                exclusive
                onChange={(_, v) => v && setForecastDays(v)}
                size="small"
              >
                <ToggleButton value={7}>7d</ToggleButton>
                <ToggleButton value={14}>14d</ToggleButton>
                <ToggleButton value={30}>30d</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Box sx={{ height: 280 }}>
              {forecastChartData.length === 0 ? (
                <EmptyChart message="No forecast data available. The server may be restarting. Click Refresh to try again." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastChartData} margin={{ left: 0, right: 10 }}>
                    <defs>
                      <linearGradient id="laborBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, "auto"]}
                      label={{ value: "Hours", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "Range") {
                          const [lo, hi] = Array.isArray(value) ? value : [value, value];
                          return [`${lo} – ${hi} hrs`, "±10% Range"];
                        }
                        return [`${value} hrs`, "Predicted"];
                      }}
                      labelFormatter={(label: any, payload: any[]) => {
                        const holiday = payload?.[0]?.payload?.isHoliday;
                        const dow = payload?.[0]?.payload?.dayOfWeek;
                        return holiday ? `${dow}, ${label} — 🎌 ${holiday}` : `${dow}, ${label}`;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      fill={alpha(theme.palette.primary.main, 0.08)}
                      stroke="none"
                      name="Upper"
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      fill={theme.palette.background.paper}
                      stroke="none"
                      name="Lower"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: theme.palette.primary.main }}
                      activeDot={{ r: 5 }}
                      name="Predicted Hours"
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>

          {/* ── Payroll Forecast + Weekly Patterns ── */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Payroll Cost Forecast
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isLowConfidence
                    ? "Estimated payroll (default ₱800/day base — add shifts for real predictions)"
                    : "Projected daily costs (includes holiday premiums)"}
                </Typography>
                <Box sx={{ height: 240 }}>
                  {payrollChartData.length === 0 ? (
                    <EmptyChart message="No payroll forecast data available." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={payrollChartData}>
                        <defs>
                          <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          domain={[0, "auto"]}
                          tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [`₱${Number(value).toLocaleString()}`, "Est. Cost"]}
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                          labelFormatter={(label, payload) => {
                            const holiday = payload?.[0]?.payload?.isHoliday;
                            return holiday ? `${label} — 🎌 ${holiday}` : label;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke={theme.palette.success.main}
                          fillOpacity={1}
                          fill="url(#payrollGradient)"
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Weekly Patterns
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Average daily hours (past 8 weeks)
                </Typography>
                <Box sx={{ height: 240 }}>
                  {patternsData.length === 0 || patternsData.every((d) => d.hours === 0) ? (
                    <EmptyChart message="No weekly patterns yet. Schedule some shifts to see patterns here." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patternsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                        <RechartsTooltip
                          formatter={(value: number) => [`${value} hrs`, "Avg Hours"]}
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        />
                        <Bar dataKey="hours" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
}
