import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, bl as format, cV as parseISO, Q as jsxRuntimeExports, X as Box, df as AnalyticsIcon, aj as Typography, aJ as Stack, am as Chip, aK as Button, cN as RefreshIcon, bE as Alert, b7 as Paper, ag as alpha, aM as CircularProgress, br as Grid, bt as Card, bu as CardContent, aC as ScheduleIcon, a7 as TrendingUpIcon, dg as TrendingDownIcon, d1 as ToggleButtonGroup, d2 as ToggleButton, aR as InfoIcon } from './vendor-v-EuVKxF.js';
import { P as PesoIcon, c as apiRequest } from './main-fla130dr.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';
import { R as ResponsiveContainer, C as ComposedChart, a as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, A as Area, L as Line, b as AreaChart } from './vendor-charts-C9Zoo-Dy.js';

function EmptyChart({ message }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
        borderRadius: 2
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 36, color: "text.disabled" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", textAlign: "center", children: message })
      ]
    }
  );
}
function MuiAnalytics() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isConnected } = useRealtime({
    queryKeys: [
      "analytics-trends",
      "forecast-labor",
      "forecast-payroll",
      "forecast-peaks",
      "forecast-staffing"
    ]
  });
  const [forecastDays, setForecastDays] = reactExports.useState(14);
  const {
    data: trendsData,
    dataUpdatedAt: trendsUpdatedAt,
    isLoading: trendsLoading,
    isError: trendsError
  } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/trends?days=56&view=daily");
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1e3,
    refetchInterval: isConnected ? false : 60 * 1e3,
    refetchIntervalInBackground: true
  });
  const {
    data: laborForecast,
    dataUpdatedAt: laborUpdatedAt,
    isLoading: laborLoading,
    isError: laborError,
    refetch: refetchLabor
  } = useQuery({
    queryKey: ["forecast-labor", forecastDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forecast/labor?days=${forecastDays}`);
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1e3,
    refetchInterval: isConnected ? false : 60 * 1e3,
    refetchIntervalInBackground: true
  });
  const {
    data: payrollForecast,
    dataUpdatedAt: payrollUpdatedAt,
    isLoading: payrollLoading,
    isError: payrollError,
    refetch: refetchPayroll
  } = useQuery({
    queryKey: ["forecast-payroll", forecastDays],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forecast/payroll?days=${forecastDays}`);
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1e3,
    refetchInterval: isConnected ? false : 60 * 1e3,
    refetchIntervalInBackground: true
  });
  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-labor"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-payroll"] });
  };
  const isLoading = trendsLoading || laborLoading || payrollLoading;
  const hoursChange = trendsData?.comparison?.hoursChange ?? 0;
  const forecastChartData = (laborForecast?.forecasts ?? []).filter((f) => !isNaN(f.predicted)).map((f) => ({
    date: format(parseISO(f.date), "MMM d"),
    fullDate: f.date,
    dayOfWeek: f.dayOfWeek,
    predicted: Number(f.predicted) || 0,
    lower: Number(f.lower) || 0,
    upper: Number(f.upper) || 0,
    isHoliday: f.isHoliday?.name || null
  }));
  (trendsData?.weeklyPatterns ?? []).map((p) => ({
    day: p.dayOfWeek,
    hours: Math.round((Number(p.avgHours) || 0) * 10) / 10
  }));
  const payrollChartData = (payrollForecast?.forecasts ?? []).filter((f) => !isNaN(f.predicted)).map((f) => ({
    date: format(parseISO(f.date), "MMM d"),
    predicted: Number(f.predicted) || 0,
    isHoliday: f.isHoliday?.name || null
  }));
  const isLowConfidence = laborForecast?.confidence === "low";
  const forecastMeta = laborForecast?.meta ?? payrollForecast?.meta;
  const forecastModelLabel = forecastMeta?.label ?? "Seasonal Naive (Day-of-Week Average)";
  const forecastModelDescription = forecastMeta?.description ?? "Uses the last 8 weeks of branch shift history, groups by weekday, and applies holiday-aware adjustments.";
  const forecastTrainingWindow = forecastMeta?.trainingWindow ?? "8 weeks";
  const forecastConfidenceBand = forecastMeta?.confidenceBand ?? "±10%";
  const forecastRangeLabel = forecastConfidenceBand === "±10%" ? "Usually within about 10%" : `Usually within ${forecastConfidenceBand}`;
  const lastSyncedAt = Math.max(trendsUpdatedAt ?? 0, laborUpdatedAt ?? 0, payrollUpdatedAt ?? 0);
  const lastSyncedLabel = lastSyncedAt > 0 ? format(new Date(lastSyncedAt), "MMM d, h:mm a") : "waiting for first sync";
  const liveSyncLabel = isConnected ? "Auto-updating" : "Updating every minute";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 }, width: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsIcon, { sx: { color: "white", fontSize: 22 } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Forecasting" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
          "Forecast method: ",
          forecastModelLabel,
          " • ",
          forecastModelDescription
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 1, sx: { mt: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: liveSyncLabel,
              color: isConnected ? "success" : "warning",
              variant: "outlined"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Based on ${forecastTrainingWindow} of recent shifts`, variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: forecastRangeLabel, variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Last sync: ${lastSyncedLabel}`, variant: "outlined" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "small",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
          onClick: handleRefreshAll,
          sx: { borderRadius: 2, textTransform: "none" },
          disabled: isLoading,
          children: "Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Alert,
      {
        severity: isConnected ? "success" : "warning",
        variant: "outlined",
        sx: { mb: 2, borderRadius: 2 },
        children: isConnected ? "This view updates automatically when shifts, employee rates, or trade approvals change." : "This view keeps refreshing every minute until the live connection comes back."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 0,
        sx: {
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.18)}`,
          bgcolor: alpha(theme.palette.info.main, 0.04)
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", md: "row" }, spacing: 2, alignItems: { md: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 700, color: "text.primary", children: "How to read this forecast" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: "The line shows the most likely daily hours or payroll cost. The shaded area is the usual range we expect, not a guarantee. Use it for staffing and budgeting, then click Refresh if you want the latest numbers right away." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", color: "info", label: "Line = expected number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", color: "info", variant: "outlined", label: "Shaded area = usual range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", color: "info", variant: "outlined", label: "More shifts = better accuracy" })
          ] })
        ] })
      }
    ),
    !isLoading && isLowConfidence && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 2, borderRadius: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Limited data:" }),
      " ",
      laborForecast?.message ?? "The forecast is using default staffing patterns right now. Add more shifts to make it more accurate."
    ] }),
    (laborError || payrollError || trendsError) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Alert,
      {
        severity: "error",
        sx: { mb: 2, borderRadius: 2 },
        action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", color: "inherit", onClick: handleRefreshAll, children: "Retry" }),
        children: "Failed to load forecast data. Please check your connection and try again."
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { py: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { color: "primary", fontSize: "small" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Hours This Week" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, sx: { mt: 1, mb: 0.5 }, children: [
                trendsData?.comparison?.thisWeek?.hours ?? 0,
                "h"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  size: "small",
                  icon: hoursChange >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUpIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDownIcon, {}),
                  label: `${hoursChange >= 0 ? "+" : ""}${hoursChange.toFixed(0)}% vs last week`,
                  color: hoursChange >= 0 ? "success" : "error",
                  variant: "outlined",
                  sx: { height: 22 }
                }
              )
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 0,
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { py: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { color: "success", fontSize: "small" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                  "Est. Payroll (",
                  forecastDays,
                  "d)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 700, sx: { mt: 1, mb: 0.5 }, children: [
                "₱",
                (payrollForecast?.summary?.totalPredicted ?? 0).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                "~₱",
                (payrollForecast?.summary?.avgDaily ?? 0).toLocaleString(),
                "/day"
              ] })
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 0,
            sx: {
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              height: "100%"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2 }, flexWrap: "wrap", gap: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Labor Hours Forecast" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Projected daily staff-hours" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  ToggleButtonGroup,
                  {
                    value: forecastDays,
                    exclusive: true,
                    onChange: (_, v) => v && setForecastDays(v),
                    size: "small",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: 7, children: "7d" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: 14, children: "14d" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: 30, children: "30d" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { height: 280 }, children: forecastChartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChart, { message: "No forecast data available. The server may be restarting. Click Refresh to try again." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: forecastChartData, margin: { left: 0, right: 10 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "laborBand", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: theme.palette.primary.main, stopOpacity: 0.15 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: theme.palette.primary.main, stopOpacity: 0.03 })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: alpha(theme.palette.divider, 0.2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 11 }, interval: "preserveStartEnd" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  YAxis,
                  {
                    tick: { fontSize: 11 },
                    domain: [0, "auto"],
                    label: { value: "Hours", angle: -90, position: "insideLeft", style: { fontSize: 11 } }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Tooltip,
                  {
                    contentStyle: {
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      fontSize: 13
                    },
                    formatter: (value, name) => {
                      if (name === "Range") {
                        const [lo, hi] = Array.isArray(value) ? value : [value, value];
                        return [`${lo} – ${hi} hrs`, "±10% Range"];
                      }
                      return [`${value} hrs`, "Predicted"];
                    },
                    labelFormatter: (label, payload) => {
                      const holiday = payload?.[0]?.payload?.isHoliday;
                      const dow = payload?.[0]?.payload?.dayOfWeek;
                      return holiday ? `${dow}, ${label} — 🎌 ${holiday}` : `${dow}, ${label}`;
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Area,
                  {
                    type: "monotone",
                    dataKey: "upper",
                    fill: alpha(theme.palette.primary.main, 0.08),
                    stroke: "none",
                    name: "Upper",
                    isAnimationActive: false
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Area,
                  {
                    type: "monotone",
                    dataKey: "lower",
                    fill: theme.palette.background.paper,
                    stroke: "none",
                    name: "Lower",
                    isAnimationActive: false
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Line,
                  {
                    type: "monotone",
                    dataKey: "predicted",
                    stroke: theme.palette.primary.main,
                    strokeWidth: 2.5,
                    dot: { r: 3, fill: theme.palette.primary.main },
                    activeDot: { r: 5 },
                    name: "Predicted Hours",
                    isAnimationActive: false
                  }
                )
              ] }) }) })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 0,
            sx: {
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              height: "100%"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2 }, flexWrap: "wrap", gap: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Payroll Cost Forecast" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Projected daily costs (includes holiday premiums)" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { height: 280 }, children: payrollChartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyChart, { message: "No payroll forecast data available." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: payrollChartData, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "payrollGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "5%", stopColor: theme.palette.success.main, stopOpacity: 0.25 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "95%", stopColor: theme.palette.success.main, stopOpacity: 0 })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: alpha(theme.palette.divider, 0.2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 11 }, interval: "preserveStartEnd" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  YAxis,
                  {
                    tick: { fontSize: 11 },
                    domain: [0, "auto"],
                    tickFormatter: (v) => `₱${(v / 1e3).toFixed(0)}k`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Tooltip,
                  {
                    formatter: (value) => [`₱${Number(value).toLocaleString()}`, "Est. Cost"],
                    contentStyle: {
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      fontSize: 13
                    },
                    labelFormatter: (label, payload) => {
                      const holiday = payload?.[0]?.payload?.isHoliday;
                      return holiday ? `${label} — 🎌 ${holiday}` : label;
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Area,
                  {
                    type: "monotone",
                    dataKey: "predicted",
                    stroke: theme.palette.success.main,
                    fillOpacity: 1,
                    fill: "url(#payrollGradient)",
                    strokeWidth: 2,
                    isAnimationActive: false
                  }
                )
              ] }) }) })
            ]
          }
        ) })
      ] })
    ] })
  ] });
}

export { MuiAnalytics as default };
