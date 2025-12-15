/**
 * Analytics & Forecasting Dashboard
 * Advanced predictive analytics for labor, payroll, and staffing
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
  AlertTitle,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Celebration as HolidayIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { format, parseISO } from "date-fns";

// Types
interface TrendsData {
  trends: Array<{
    date: string;
    hours: number;
    cost: number;
    shifts: number;
    dayOfWeek: string;
    isHoliday?: { name: string; type: string } | null;
  }>;
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

interface LaborForecast {
  forecasts: Array<{
    date: string;
    dayOfWeek: string;
    predicted: number;
    lower: number;
    upper: number;
    isHoliday?: { name: string; type: string } | null;
  }>;
  confidence: string;
  message: string;
}

interface PayrollForecast {
  forecasts: Array<{
    date: string;
    dayOfWeek: string;
    predicted: number;
    lower: number;
    upper: number;
    isHoliday?: { name: string; type: string } | null;
  }>;
  summary: {
    totalPredicted: number;
    avgDaily: number;
    period: string;
  };
}

interface PeaksData {
  peakDaysOfWeek: Array<{
    dayOfWeek: string;
    avgHours: number;
    isPeak: boolean;
  }>;
  upcomingPeaks: Array<{
    date: string;
    dayOfWeek: string;
    reason: string;
    type: string;
  }>;
  upcomingHolidays: Array<{
    date: string;
    name: string;
    type: string;
  }>;
}

interface StaffingAlerts {
  alerts: Array<{
    date: string;
    dayOfWeek: string;
    type: string;
    severity: string;
    scheduledShifts: number;
    expectedNeed: number;
    message: string;
    holiday?: string | null;
  }>;
  summary: {
    totalAlerts: number;
    highSeverity: number;
    activeEmployees: number;
    upcomingTimeOff: number;
  };
}

export default function MuiAnalytics() {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [forecastDays, setForecastDays] = useState<number>(14);

  // Queries - using proper URL format with query strings
  const { data: trendsData, isLoading: trendsLoading } = useQuery<TrendsData>({
    queryKey: ["analytics-trends", viewMode],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/trends?days=30&view=${viewMode}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch trends");
      return res.json();
    },
  });

  const { data: laborForecast, isLoading: laborLoading } = useQuery<LaborForecast>({
    queryKey: ["forecast-labor", forecastDays],
    queryFn: async () => {
      const res = await fetch(`/api/forecast/labor?days=${forecastDays}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch labor forecast");
      return res.json();
    },
  });

  const { data: payrollForecast, isLoading: payrollLoading } = useQuery<PayrollForecast>({
    queryKey: ["forecast-payroll", forecastDays],
    queryFn: async () => {
      const res = await fetch(`/api/forecast/payroll?days=${forecastDays}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch payroll forecast");
      return res.json();
    },
  });

  const { data: peaksData } = useQuery<PeaksData>({
    queryKey: ["forecast-peaks"],
    queryFn: async () => {
      const res = await fetch("/api/forecast/peaks?days=30", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch peaks");
      return res.json();
    },
  });

  const { data: staffingData } = useQuery<StaffingAlerts>({
    queryKey: ["forecast-staffing"],
    queryFn: async () => {
      const res = await fetch("/api/forecast/staffing?days=14", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch staffing alerts");
      return res.json();
    },
  });

  // Loading state
  const isLoading = trendsLoading || laborLoading || payrollLoading;

  // Calculate comparison percentages
  const hoursChange = trendsData?.comparison?.hoursChange || 0;
  const shiftsChange = trendsData?.comparison?.shiftsChange || 0;

  // Prepare chart data with confidence bands
  const forecastChartData = laborForecast?.forecasts.map((f) => ({
    date: format(parseISO(f.date), "MMM d"),
    predicted: f.predicted,
    lower: f.lower,
    upper: f.upper,
    band: [f.lower, f.upper],
    isHoliday: f.isHoliday?.name || null,
  })) || [];

  // Weekly patterns data
  const patternsData = trendsData?.weeklyPatterns?.map((p) => ({
    day: p.dayOfWeek,
    hours: Math.round(p.avgHours * 10) / 10,
    cost: Math.round(p.avgCost),
  })) || [];

  // Payroll forecast data
  const payrollChartData = payrollForecast?.forecasts.map((f) => ({
    date: format(parseISO(f.date), "MMM d"),
    predicted: f.predicted,
    lower: f.lower,
    upper: f.upper,
  })) || [];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
        >
          <AnalyticsIcon sx={{ color: "white" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Analytics & Forecasting
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Predictive insights for smarter scheduling
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={4}>
          {/* Summary Cards with Comparisons */}
          <Grid container spacing={2}>
            {/* This Week Hours */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      This Week
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                    {trendsData?.comparison?.thisWeek?.hours || 0}h
                  </Typography>
                  <Chip
                    size="small"
                    icon={hoursChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={`${hoursChange >= 0 ? "+" : ""}${hoursChange.toFixed(0)}% vs last week`}
                    color={hoursChange >= 0 ? "success" : "error"}
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Predicted Payroll */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MoneyIcon color="success" />
                    <Typography variant="caption" color="text.secondary">
                      Next {forecastDays} Days
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                    ₱{(payrollForecast?.summary?.totalPredicted || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg ₱{(payrollForecast?.summary?.avgDaily || 0).toLocaleString()}/day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Peak Days */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon color="warning" />
                    <Typography variant="caption" color="text.secondary">
                      Peak Days
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                    {peaksData?.peakDaysOfWeek?.map((p) => p.dayOfWeek).join(", ") || "None"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {peaksData?.upcomingPeaks?.length || 0} busy days ahead
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Staffing Alerts */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor:
                    (staffingData?.summary?.highSeverity || 0) > 0
                      ? alpha(theme.palette.error.main, 0.05)
                      : alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${
                    (staffingData?.summary?.highSeverity || 0) > 0
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.info.main, 0.1)
                  }`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GroupsIcon color={(staffingData?.summary?.highSeverity || 0) > 0 ? "error" : "info"} />
                    <Typography variant="caption" color="text.secondary">
                      Staffing Alerts
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                    {staffingData?.summary?.totalAlerts || 0}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={(staffingData?.summary?.highSeverity || 0) > 0 ? "error" : "text.secondary"}
                  >
                    {staffingData?.summary?.highSeverity || 0} high priority
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Labor Hours Forecast with Confidence Bands */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Labor Hours Forecast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Predicted hours with ±10% confidence band
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
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "Confidence Range") return null;
                      return [`${value} hrs`, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const holiday = payload?.[0]?.payload?.isHoliday;
                      return holiday ? `${label} (${holiday})` : label;
                    }}
                  />
                  <Legend />
                  {/* Confidence band using Area */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="url(#confidenceBand)"
                    name="Confidence Range"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill={theme.palette.background.paper}
                  />
                  {/* Predicted line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2 }}
                    name="Predicted Hours"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            {laborForecast?.confidence === "low" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {laborForecast.message}
              </Alert>
            )}
          </Paper>

          {/* Two-Column Layout: Payroll Trends + Weekly Patterns */}
          <Grid container spacing={3}>
            {/* Payroll Cost Forecast */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Payroll Cost Forecast
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Projected labor costs including holiday premiums
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payrollChartData}>
                      <defs>
                        <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip
                        formatter={(value: number) => [`₱${value.toLocaleString()}`, "Cost"]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stroke={theme.palette.success.main}
                        fillOpacity={1}
                        fill="url(#payrollGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Weekly Patterns */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Day-of-Week Patterns
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Average hours by day (past 30 days)
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        formatter={(value: number, name: string) => [
                          name === "hours" ? `${value} hrs` : `₱${value.toLocaleString()}`,
                          name === "hours" ? "Avg Hours" : "Avg Cost",
                        ]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="hours" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Predictive Alerts */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight={600}>
                Predictive Alerts
              </Typography>
            </Stack>

            {/* Upcoming Holidays */}
            {peaksData?.upcomingHolidays && peaksData.upcomingHolidays.length > 0 && (
              <Alert
                severity="info"
                icon={<HolidayIcon />}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <AlertTitle>Upcoming Philippine Holidays</AlertTitle>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {peaksData.upcomingHolidays.slice(0, 5).map((h) => (
                    <Chip
                      key={h.date}
                      size="small"
                      label={`${h.name} (${format(parseISO(h.date), "MMM d")})`}
                      color={h.type === "regular" ? "error" : "warning"}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Alert>
            )}

            {/* Staffing Alerts */}
            {staffingData?.alerts && staffingData.alerts.length > 0 ? (
              <Stack spacing={2}>
                {staffingData.alerts.slice(0, 5).map((alert, idx) => (
                  <Alert
                    key={idx}
                    severity={alert.severity === "high" ? "error" : "warning"}
                    sx={{ borderRadius: 2 }}
                  >
                    <AlertTitle>
                      {format(parseISO(alert.date), "EEEE, MMM d")}
                      {alert.holiday && ` (${alert.holiday})`}
                    </AlertTitle>
                    {alert.message}
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Scheduled: {alert.scheduledShifts} / Expected: {alert.expectedNeed}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <AlertTitle>All Clear!</AlertTitle>
                No staffing issues detected for the next {forecastDays} days.
              </Alert>
            )}
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
