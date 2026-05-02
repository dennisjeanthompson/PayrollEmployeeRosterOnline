import { r as reactExports, a0 as useTheme, Q as jsxRuntimeExports, X as Box, a6 as AssignmentIcon, aj as Typography, c5 as Tabs, c6 as Tab, a3 as CalendarIcon } from './vendor-5dgU3tca.js';
import MuiTimeOff from './mui-time-off-9H0ImVmZ.js';
import './main-2BvCZ7pP.js';
import './use-toast-DLYGmyYZ.js';
import './use-realtime-D4CN5B-U.js';

function MuiRequests() {
  const [tabIndex, setTabIndex] = reactExports.useState(0);
  const theme = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%", bgcolor: "background.default", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: { xs: 2, sm: 4 }, pt: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentIcon, { sx: { fontSize: 32, color: theme.palette.primary.main, mr: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: "bold", children: "Employee Requests Hub" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Review and approve Time Off requests" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tabs,
        {
          value: tabIndex,
          onChange: (e, v) => setTabIndex(v),
          "aria-label": "manager request tabs",
          variant: "scrollable",
          scrollButtons: "auto",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small" }), iconPosition: "start", label: "Time Off", sx: { textTransform: "none", fontWeight: "bold" } })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
      display: tabIndex === 0 ? "block" : "none",
      "& > div": { pt: 2, minHeight: "auto", bgcolor: "transparent" },
      "& .MuiContainer-root": { pt: 0 },
      "& h1": { display: "none" }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiTimeOff, {}) })
  ] });
}

export { MuiRequests as default };
