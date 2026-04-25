import { useMemo, ReactNode } from "react";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type {} from '@mui/x-data-grid/themeAugmentation';
import { useTheme } from "@/components/theme-provider";

interface MuiThemeProviderProps {
  children: ReactNode;
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: {
            main: "#166534", // deep green (café accent)
            light: "#22C55E",
            dark: "#14532D",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#92400E", // coffee brown
            light: "#B45309",
            dark: "#78350F",
            contrastText: "#ffffff",
          },
          error: {
            main: "#DC2626",
            light: "#EF4444",
            dark: "#B91C1C",
          },
          warning: {
            main: "#D97706",
            light: "#F59E0B",
            dark: "#B45309",
          },
          info: {
            main: "#0D9488",
            light: "#14B8A6",
            dark: "#0F766E",
          },
          success: {
            main: "#166534",
            light: "#22C55E",
            dark: "#14532D",
          },
          background: {
            default: isDark ? "#1C1410" : "#FBF8F4",
            paper: isDark ? "#2A2018" : "#FFFFFF",
          },
          text: {
            primary: isDark ? "#F5EDE4" : "#3C2415",
            secondary: isDark ? "#C4AA88" : "#8B7355",
          },
          divider: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(60, 36, 21, 0.08)",
        },
        typography: {
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            letterSpacing: "-0.02em",
          },
          h2: {
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            letterSpacing: "-0.01em",
          },
          h3: {
            fontWeight: 600,
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            letterSpacing: "-0.01em",
          },
          h4: {
            fontWeight: 600,
            fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
          },
          h5: {
            fontWeight: 600,
            fontSize: "clamp(1rem, 2vw, 1.1rem)",
          },
          h6: {
            fontWeight: 600,
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          },
          body1: {
            fontSize: "0.9375rem",
          },
          body2: {
            fontSize: "0.875rem",
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          "none",
          "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          ...Array(18).fill("0 25px 50px -12px rgb(0 0 0 / 0.25)"),
        ] as any,
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              /* NUCLEAR RESET: Force remove the pesky global border from Tailwind/Shadcn */
              *, *::before, *::after {
                border-width: 0;
                border-style: none;
              }

              body {
                scrollbar-width: thin;
              }
              body::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              body::-webkit-scrollbar-track {
                background: transparent;
              }
              body::-webkit-scrollbar-thumb {
                background-color: ${isDark ? "#404040" : "#d1d5db"};
                border-radius: 4px;
              }
              
              /* Remove ALL borders from standard HTML tables */
              table, th, td {
                border: none !important;
                border-color: transparent !important;
              }
              table {
                border-collapse: collapse;
              }
              
              /* Target all common MUI classes for a clean slate */
              .MuiPaper-root,
              .MuiCard-root,
              .MuiDrawer-paper {
                border: none !important;
              }
            `,
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: "8px 16px",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
              },
              contained: {
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                },
              },
              outlined: {
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: isDark
                  ? "0 1px 3px 0 rgb(0 0 0 / 0.3)"
                  : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                border: "none",
                backgroundImage: "none",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              rounded: {
                borderRadius: 16,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontSize: "1.25rem",
                fontWeight: 600,
              },
            },
          },
          MuiTable: {
            styleOverrides: {
              root: {
                border: "none",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: "none !important",
              },
              head: {
                fontWeight: 600,
                backgroundColor: isDark ? "#171717" : "#f5f5f5",
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: "none",
                "& .MuiDataGrid-row": {
                  border: "none",
                },
              },
              cell: {
                border: "none !important",
              },
              columnHeader: {
                border: "none !important",
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                minHeight: 44,
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              indicator: {
                borderRadius: 2,
                height: 3,
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                borderRadius: 4,
                height: 6,
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 8,
                fontSize: "0.8125rem",
                padding: "8px 12px",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
                marginTop: 4,
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)",
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                margin: "2px 8px",
                padding: "10px 12px",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                padding: 8,
              },
              switchBase: {
                padding: 11,
              },
              thumb: {
                width: 16,
                height: 16,
              },
              track: {
                borderRadius: 22,
              },
            },
          },
        },
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
