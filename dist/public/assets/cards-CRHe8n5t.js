import { a0 as useTheme, Q as jsxRuntimeExports, X as Box, ag as alpha, aj as Typography } from './vendor-BZHHI3oX.js';

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

export { EmptyState as E };
