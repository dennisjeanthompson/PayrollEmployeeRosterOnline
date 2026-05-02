import { a0 as useTheme, Q as jsxRuntimeExports, bt as Card, ag as alpha, bu as CardContent, X as Box, aj as Typography, am as Chip, a7 as TrendingUpIcon, dg as TrendingDownIcon, cO as LinearProgress } from './vendor-5dgU3tca.js';

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
  progress,
  action,
  sx
}) {
  const theme = useTheme();
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main
  };
  const mainColor = colorMap[color];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      sx: {
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${alpha(mainColor, 0.15)}`
        },
        ...sx
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${alpha(mainColor, 0.2)} 0%, ${alpha(mainColor, 0.05)} 100%)`,
                  color: mainColor,
                  "& svg": {
                    fontSize: 24
                  }
                },
                children: icon
              }
            ),
            action
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 0.5, fontWeight: 500 }, children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "baseline", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 700,
                  background: value === 0 || value === "0" ? theme.palette.text.disabled : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: value === 0 || value === "0" ? void 0 : "transparent"
                },
                children: value
              }
            ),
            trend && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                size: "small",
                icon: trend.isPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUpIcon, { fontSize: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDownIcon, { fontSize: "small" }),
                label: `${trend.isPositive ? "+" : ""}${trend.value}%`,
                sx: {
                  height: 22,
                  fontSize: "0.75rem",
                  bgcolor: trend.isPositive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  color: trend.isPositive ? "success.main" : "error.main",
                  "& .MuiChip-icon": {
                    color: "inherit"
                  }
                }
              }
            )
          ] }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1 }, children: subtitle }),
          progress !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            LinearProgress,
            {
              variant: "determinate",
              value: progress,
              sx: {
                bgcolor: alpha(mainColor, 0.1),
                "& .MuiLinearProgress-bar": {
                  bgcolor: mainColor
                }
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background: `radial-gradient(circle at top right, ${alpha(mainColor, 0.1)} 0%, transparent 70%)`,
              pointerEvents: "none"
            }
          }
        )
      ]
    }
  );
}
function EmptyState({ icon, title, description, action, sx }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 3,
        m: 2,
        textAlign: "center",
        bgcolor: alpha(theme.palette.background.default, 0.4),
        borderRadius: 4,
        border: `2px dashed ${theme.palette.divider}`,
        ...sx
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              width: 64,
              height: 64,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "text.secondary",
              mb: 3,
              "& svg": {
                fontSize: 32
              }
            },
            children: icon
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { maxWidth: 280, mb: action ? 3 : 0 }, children: description }),
        action
      ]
    }
  );
}

export { EmptyState as E, StatCard as S };
