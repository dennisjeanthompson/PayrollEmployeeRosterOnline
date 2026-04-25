const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/mui-dashboard-Z_bO033B.js","assets/vendor-v-EuVKxF.js","assets/vendor-Bi9pq-j3.css","assets/use-toast-BDUJuTfF.js","assets/cards-Du3qVCqM.js","assets/mui-branches-U1sk8tW8.js","assets/mui-employees-CJGgp0HM.js","assets/use-realtime-DiQyjgYE.js","assets/ProfilePhotoUpload-BZ8BADFR.js","assets/button-CBOKXpNF.js","assets/cloudinary-CkNgNQjm.js","assets/card-mE7iOYpd.js","assets/dialog-C9UQy7j1.js","assets/schedule-v2-C4wiOOO5.js","assets/mui-payroll-BNYwX8fO.js","assets/payroll-dates-BmATSNY8.js","assets/mui-notifications-DDnAvYS6.js","assets/mui-shift-trading-DvkQQiX6.js","assets/vendor-calendar-BweojRQ-.js","assets/mui-reports-2sd6vHLr.js","assets/mui-analytics-NBangYqV.js","assets/vendor-charts-C9Zoo-Dy.js","assets/mui-login-B4Pjy03e.js","assets/mui-time-off-X372fXr0.js","assets/mui-deduction-settings-BbbCIHSy.js","assets/mui-payroll-management-DEV_PVp1.js","assets/payslip-preview-DYzGOcZC.js","assets/mui-admin-deduction-rates-BWqwYC8o.js","assets/mui-audit-logs-BOjlEFST.js","assets/mui-holiday-calendar-DF3MmtvV.js","assets/mui-compliance-dashboard-DzKzy1u5.js","assets/mui-profile-settings-BnamTJjs.js","assets/mui-company-settings-nvkG8bp1.js","assets/mui-thirteenth-month-BQmXggIL.js","assets/mui-leave-credits-Ds37vMC3.js","assets/mui-requests-7ystX_xg.js","assets/mobile-requests-BDm3yztv.js","assets/mobile-more-CMvPGTnX.js","assets/setup-z-9ucIjP.js","assets/not-found-4S0rqO3M.js"])))=>i.map(i=>d[i]);
import { a as React, Q as jsxRuntimeExports, S as QueryClient, r as reactExports, T as __vitePreload, U as createTheme, V as ThemeProvider$1, W as CssBaseline, X as Box, Y as SvgIcon, Z as twMerge, o as clsx, $ as useLocation, a0 as useTheme$1, a1 as useMediaQuery, a2 as DashboardIcon, a3 as CalendarIcon, a4 as NotificationsIcon, a5 as PeopleIcon, a6 as AssignmentIcon, a7 as TrendingUpIcon, a8 as StoreIcon, a9 as BusinessIcon, aa as ProfileIcon, ab as VerifiedIcon, ac as SettingsIcon, ad as HistoryIcon, ae as DownloadIcon, af as IconButton, ag as alpha, ah as ChevronRightIcon, ai as ChevronLeftIcon, aj as Typography, ak as AutoAwesome, al as Avatar, am as Chip, an as Tooltip, ao as LogoutIcon, ap as SwipeableDrawer, aq as Drawer, ar as List, as as ListItem, at as ListItemButton, au as ListItemIcon, av as Badge, aw as ListItemText, ax as useQuery, ay as Dialog, az as Search$1, aA as InputBase, aB as ArrowIcon, aC as ScheduleIcon, aD as TradeIcon, aE as EventIcon, aF as ReportIcon, aG as useQueryClient, aH as useMutation, aI as Menu, aJ as Stack, aK as Button, aL as DoneAllIcon, aM as CircularProgress, aN as EmptyIcon, aO as formatDistanceToNow, aP as Link, aQ as OpenIcon, aR as InfoIcon, aS as AdjustmentIcon, aT as ErrorIcon, aU as CheckCircleIcon, aV as PayIcon, aW as EventIcon$1, aX as styled, aY as AppBar, aZ as Toolbar, a_ as MenuIcon, a$ as KeyboardIcon, b0 as FormControl, b1 as Select, b2 as MenuItem, b3 as LocationIcon, b4 as Snackbar, b5 as SunIcon, b6 as MoonIcon, b7 as Paper, b8 as BottomNavigation, b9 as BottomNavigationAction, ba as HomeIcon, bb as ScheduleIcon$1, bc as PayrollIcon, bd as MenuIcon$1, be as QueryClientProvider, bf as Switch, bg as Route, bh as Redirect, bi as Lt, bj as clientExports } from './vendor-v-EuVKxF.js';

true              &&(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
}());

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      const orphanedBackdrops = document.querySelectorAll(".MuiBackdrop-root");
      orphanedBackdrops.forEach((el) => el.remove());
    }
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 520, padding: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { marginBottom: 8 }, children: "Something went wrong." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#64748b", marginBottom: 16 }, children: "The page failed to render. Try refreshing, or go back to the dashboard." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => location.reload(), style: { padding: "8px 12px" }, children: "Reload" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", style: { padding: "8px 12px", border: "1px solid #ccc" }, children: "Go to Dashboard" })
        ] }),
        false
      ] }) });
    }
    return this.props.children;
  }
}

const API_BASE = (() => {
  return "";
})();
function apiUrl(path) {
  if (API_BASE) {
    return `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path;
}

const api = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	API_BASE,
	apiUrl
}, Symbol.toStringTag, { value: 'Module' }));

async function throwIfResNotOk(res, skipBodyCheck = false) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorData;
    try {
      errorData = contentType?.includes("application/json") ? await res.json() : await res.text();
    } catch (e) {
      errorData = res.statusText;
    }
    const error = new Error(
      typeof errorData === "object" ? errorData.message || errorData.error || "An error occurred" : errorData || res.statusText
    );
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
}
async function apiRequest(method, url, data) {
  const headers = {
    "Accept": "application/json"
  };
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  try {
    const res = await fetch(apiUrl(url), {
      method,
      headers,
      body: data ? JSON.stringify(data) : void 0,
      credentials: "include"
    });
    if (!res.ok) {
      await throwIfResNotOk(res);
    }
    return res;
  } catch (error) {
    throw error;
  }
}
const getQueryFn = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  const res = await fetch(apiUrl(queryKey.join("/")), {
    credentials: "include"
  });
  if (unauthorizedBehavior === "returnNull" && res.status === 401) {
    return null;
  }
  await throwIfResNotOk(res);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  } else {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Server returned non-JSON response");
    }
  }
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1e3,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
      gcTime: 30 * 60 * 1e3,
      refetchOnMount: true
    },
    mutations: {
      retry: false
    }
  }
});
const invalidateQueries = {
  payroll: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
    queryClient.invalidateQueries({ queryKey: ["/api/payroll/periods"] });
    queryClient.invalidateQueries({ queryKey: ["/api/payroll/entries"] });
  },
  shifts: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/shifts/branch"] });
  },
  employees: () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/employees/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/hours/all-employees"] });
  },
  notifications: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  },
  timeOff: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
    queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
  },
  branchSwitch: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/shifts/branch"] });
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["/api/deduction-settings"] });
    queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-labor"] });
    queryClient.invalidateQueries({ queryKey: ["forecast-payroll"] });
    queryClient.invalidateQueries({ queryKey: ["/api/adjustment-logs/branch"] });
    queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
    queryClient.invalidateQueries({ queryKey: ["/api/exception-logs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/loans/branch"] });
    queryClient.invalidateQueries({ queryKey: ["leave-credits"] });
  },
  all: () => {
    queryClient.invalidateQueries();
  }
};

let authState = {
  user: null,
  isAuthenticated: false
};
const listeners = /* @__PURE__ */ new Set();
const branchSwitchListeners = /* @__PURE__ */ new Set();
function getAuthState() {
  return authState;
}
function setAuthState(newState) {
  authState = { ...authState, ...newState };
  listeners.forEach((listener) => listener(authState));
}
function subscribeToAuth(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function isManager() {
  return authState.user?.role === "manager" || authState.user?.role === "admin";
}
function isAdmin() {
  return authState.user?.role === "admin";
}
function isEmployee() {
  return authState.user?.role === "employee";
}
function getCurrentUser() {
  return authState.user;
}
async function logout() {
  try {
    const { apiUrl } = await __vitePreload(async () => { const { apiUrl } = await Promise.resolve().then(() => api);return { apiUrl }},true              ?void 0:void 0);
    await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
  } catch (e) {
  }
  setAuthState({ user: null, isAuthenticated: false });
}
function useAuth() {
  const [state, setState] = reactExports.useState(getAuthState());
  reactExports.useEffect(() => {
    const unsubscribe = subscribeToAuth((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);
  const refreshUser = async () => {
    try {
      if (!state.isAuthenticated) return;
      const res = await apiRequest("GET", "/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setAuthState({ user: data.user, isAuthenticated: true });
      }
    } catch (err) {
    }
  };
  const switchBranch = reactExports.useCallback(async (branchId) => {
    try {
      const res = await apiRequest("PUT", "/api/auth/switch-branch", { branchId });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to switch branch");
      }
      const currentUser = getAuthState().user;
      if (currentUser) {
        setAuthState({
          user: { ...currentUser, branchId },
          isAuthenticated: true
        });
      }
      branchSwitchListeners.forEach((listener) => listener(branchId));
      try {
        localStorage.setItem("lastBranchId", branchId);
      } catch {
      }
      return true;
    } catch (err) {
      return false;
    }
  }, []);
  return { ...state, refreshUser, switchBranch };
}

const auth = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	getAuthState,
	getCurrentUser,
	isAdmin,
	isEmployee,
	isManager,
	logout,
	setAuthState,
	subscribeToAuth,
	useAuth
}, Symbol.toStringTag, { value: 'Module' }));

function Toaster() {
  return null;
}

const ThemeProviderContext = reactExports.createContext(void 0);
function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setThemeState] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      return defaultTheme;
    }
    return defaultTheme;
  });
  reactExports.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "light") {
      root.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    setThemeState((prev) => prev === "dark" ? "light" : "dark");
  };
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProviderContext.Provider, { value: { theme, setTheme, toggleTheme }, children });
}
function useTheme() {
  const context = reactExports.useContext(ThemeProviderContext);
  if (context === void 0) {
    return {
      theme: "light",
      setTheme: () => {
      },
      toggleTheme: () => {
      }
    };
  }
  return context;
}

function MuiThemeProvider({ children }) {
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === "dark";
  const theme = reactExports.useMemo(
    () => createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: "#166534",
          // deep green (café accent)
          light: "#22C55E",
          dark: "#14532D",
          contrastText: "#ffffff"
        },
        secondary: {
          main: "#92400E",
          // coffee brown
          light: "#B45309",
          dark: "#78350F",
          contrastText: "#ffffff"
        },
        error: {
          main: "#DC2626",
          light: "#EF4444",
          dark: "#B91C1C"
        },
        warning: {
          main: "#D97706",
          light: "#F59E0B",
          dark: "#B45309"
        },
        info: {
          main: "#0D9488",
          light: "#14B8A6",
          dark: "#0F766E"
        },
        success: {
          main: "#166534",
          light: "#22C55E",
          dark: "#14532D"
        },
        background: {
          default: isDark ? "#1C1410" : "#FBF8F4",
          paper: isDark ? "#2A2018" : "#FFFFFF"
        },
        text: {
          primary: isDark ? "#F5EDE4" : "#3C2415",
          secondary: isDark ? "#C4AA88" : "#8B7355"
        },
        divider: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(60, 36, 21, 0.08)"
      },
      typography: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
          letterSpacing: "-0.02em"
        },
        h2: {
          fontWeight: 700,
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          letterSpacing: "-0.01em"
        },
        h3: {
          fontWeight: 600,
          fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
          letterSpacing: "-0.01em"
        },
        h4: {
          fontWeight: 600,
          fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)"
        },
        h5: {
          fontWeight: 600,
          fontSize: "clamp(1rem, 2vw, 1.1rem)"
        },
        h6: {
          fontWeight: 600,
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)"
        },
        body1: {
          fontSize: "0.9375rem"
        },
        body2: {
          fontSize: "0.875rem"
        },
        button: {
          textTransform: "none",
          fontWeight: 600
        }
      },
      shape: {
        borderRadius: 12
      },
      shadows: [
        "none",
        "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        ...Array(18).fill("0 25px 50px -12px rgb(0 0 0 / 0.25)")
      ],
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
            `
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              padding: "8px 16px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }
            },
            contained: {
              "&:hover": {
                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)"
              }
            },
            outlined: {
              borderWidth: 1.5,
              "&:hover": {
                borderWidth: 1.5
              }
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: isDark ? "0 1px 3px 0 rgb(0 0 0 / 0.3)" : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              border: "none",
              backgroundImage: "none"
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none"
            },
            rounded: {
              borderRadius: 16
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500
            }
          }
        },
        MuiAvatar: {
          styleOverrides: {
            root: {
              fontWeight: 600
            }
          }
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 12
              }
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 20
            }
          }
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontSize: "1.25rem",
              fontWeight: 600
            }
          }
        },
        MuiTable: {
          styleOverrides: {
            root: {
              border: "none"
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: "none !important"
            },
            head: {
              fontWeight: 600,
              backgroundColor: isDark ? "#171717" : "#f5f5f5"
            }
          }
        },
        MuiDataGrid: {
          styleOverrides: {
            root: {
              border: "none",
              "& .MuiDataGrid-row": {
                border: "none"
              }
            },
            cell: {
              border: "none !important"
            },
            columnHeader: {
              border: "none !important"
            }
          }
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 10
            }
          }
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 44
            }
          }
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              borderRadius: 2,
              height: 3
            }
          }
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              height: 6
            }
          }
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: 12
            }
          }
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 8,
              fontSize: "0.8125rem",
              padding: "8px 12px"
            }
          }
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: 12,
              marginTop: 4,
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)"
            }
          }
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              margin: "2px 8px",
              padding: "10px 12px"
            }
          }
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12
            }
          }
        },
        MuiSwitch: {
          styleOverrides: {
            root: {
              padding: 8
            },
            switchBase: {
              padding: 11
            },
            thumb: {
              width: 16,
              height: 16
            },
            track: {
              borderRadius: 22
            }
          }
        }
      }
    }),
    [isDark]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemeProvider$1, { theme, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CssBaseline, {}),
    children
  ] });
}

function Logo({ size = 40, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      component: "svg",
      viewBox: "0 0 300 300",
      width: size,
      height: size,
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "bowl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "115", y: "54", width: "200", height: "180" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "300", height: "300", rx: "64", fill: "#0B1829" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "86", y: "66", width: "32", height: "168", rx: "16", fill: "#F0A821" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "150", cy: "120", r: "56", fill: "#F0A821", clipPath: "url(#bowl)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "90", y: "94", width: "114", height: "16", fill: "#0B1829" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "90", y: "123", width: "114", height: "16", fill: "#0B1829" })
      ]
    }
  );
}

function PesoIcon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SvgIcon, { ...props, viewBox: "0 0 100 100", children: /* @__PURE__ */ jsxRuntimeExports.jsx("text", { y: "0.9em", x: "0.1em", fontSize: "90", fontFamily: "Arial, sans-serif", fill: "currentColor", children: "₱" }) });
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function getInitials(firstName, lastName, username) {
  if (!firstName && !lastName) {
    if (username) return username.charAt(0).toUpperCase();
    return "U";
  }
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;
const navigation = [
  { name: "Dashboard", href: "/", icon: DashboardIcon, roles: ["employee", "manager", "admin"] },
  { name: "Schedule", href: "/schedule", icon: CalendarIcon, roles: ["employee", "manager", "admin"] },
  { name: "Pay Summary", href: "/payroll", icon: PesoIcon, roles: ["employee", "manager", "admin"] },
  { name: "Notifications", href: "/notifications", icon: NotificationsIcon, roles: ["employee", "manager", "admin"], badge: true }
];
const managementNavigation = [
  { name: "Employees", href: "/employees", icon: PeopleIcon, roles: ["manager", "admin"] },
  { name: "Payroll", href: "/payroll-management", icon: PesoIcon, roles: ["manager", "admin"] },
  { name: "Holidays", href: "/holiday-calendar", icon: CalendarIcon, roles: ["manager", "admin"] },
  { name: "13th Month", href: "/thirteenth-month", icon: PesoIcon, roles: ["manager", "admin"] },
  { name: "Employee Requests", href: "/requests", icon: AssignmentIcon, roles: ["manager", "admin"] },
  { name: "Forecasting", href: "/analytics", icon: TrendingUpIcon, roles: ["manager", "admin"] },
  { name: "Branches", href: "/branches", icon: StoreIcon, roles: ["manager"] }
];
const settingsNavigation = [
  { name: "Company Settings", href: "/company-settings", icon: BusinessIcon, roles: ["manager", "admin"] },
  { name: "Profile Settings", href: "/profile", icon: ProfileIcon, roles: ["employee", "manager", "admin"] },
  { name: "Compliance", href: "/compliance", icon: VerifiedIcon, roles: ["admin"] },
  { name: "Deductions", href: "/deduction-settings", icon: SettingsIcon, roles: ["manager", "admin"] },
  { name: "Deduction Rates", href: "/admin/deduction-rates", icon: SettingsIcon, roles: ["admin"] },
  { name: "Audit Logs", href: "/audit-logs", icon: HistoryIcon, roles: ["admin"] },
  { name: "Export Reports", href: "/reports", icon: DownloadIcon, roles: ["manager", "admin"] }
];
function MuiSidebar({ mobileOpen = false, onMobileClose }) {
  const [location, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = reactExports.useState(false);
  const theme = useTheme$1();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  if (!isDesktop && isCollapsed) {
    setIsCollapsed(false);
  }
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
    } finally {
      setAuthState({ user: null, isAuthenticated: false });
      window.location.replace("/login");
    }
  };
  const filterByRole = (items) => items.filter((item) => item.roles.includes(currentUser?.role || "employee"));
  const mainNavItems = filterByRole(navigation);
  const managementNavItems = filterByRole(managementNavigation);
  const settingsNavItems = filterByRole(settingsNavigation);
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "secondary";
      case "manager":
        return "info";
      default:
        return "success";
    }
  };
  const NavItem = ({ item }) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: isCollapsed ? item.name : "", placement: "right", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ListItemButton,
      {
        selected: isActive,
        onClick: (e) => {
          e.preventDefault();
          if (onMobileClose) onMobileClose();
          reactExports.startTransition(() => {
            setLocation(item.href);
          });
        },
        sx: {
          borderRadius: 3,
          mx: 1,
          minHeight: 48,
          justifyContent: isCollapsed ? "center" : "flex-start",
          px: isCollapsed ? 2 : 2.5,
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
            }
          },
          "&:hover": {
            background: alpha(theme.palette.action.hover, 0.08)
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemIcon,
            {
              sx: {
                minWidth: isCollapsed ? 0 : 40,
                mr: isCollapsed ? 0 : 2,
                justifyContent: "center"
              },
              children: item.badge ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "dot",
                  color: "error",
                  sx: {
                    "& .MuiBadge-dot": {
                      animation: "pulse 2s infinite"
                    }
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Icon,
                    {
                      sx: {
                        color: isActive ? "primary.main" : "text.secondary",
                        fontSize: 22
                      }
                    }
                  )
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Icon,
                {
                  sx: {
                    color: isActive ? "primary.main" : "text.secondary",
                    fontSize: 22
                  }
                }
              )
            }
          ),
          !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: item.name,
              primaryTypographyProps: {
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "primary.main" : "text.primary"
              }
            }
          )
        ]
      }
    ) }) });
  };
  const NavSection = ({ title, items }) => {
    if (items.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
      !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "overline",
          sx: {
            px: 3,
            mb: 1,
            display: "block",
            color: "text.secondary",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5
          },
          children: title
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { item }, item.name)) })
    ] });
  };
  const drawerContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    isDesktop && // Only show collapse button on desktop
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      IconButton,
      {
        onClick: () => setIsCollapsed(!isCollapsed),
        size: "small",
        sx: {
          position: "absolute",
          right: -12,
          top: 72,
          zIndex: theme.zIndex.drawer + 2,
          width: 24,
          height: 24,
          bgcolor: "background.paper",
          border: `1px solid ${theme.palette.primary.main}`,
          color: "primary.main",
          boxShadow: 3,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }
        },
        children: isCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, { sx: { fontSize: 14 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, { sx: { fontSize: 14 } })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Box,
      {
        sx: {
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          height: 70,
          borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
          bgcolor: isCollapsed ? "transparent" : alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(10px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: isCollapsed ? "auto" : "100%"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: isCollapsed ? 28 : 34 }),
              !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { overflow: "hidden" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Typography,
                  {
                    variant: "h6",
                    sx: {
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5
                    },
                    children: [
                      "PERO",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        AutoAwesome,
                        {
                          sx: {
                            fontSize: 14,
                            color: "primary.main",
                            animation: "pulse 2s infinite"
                          }
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Payroll System" })
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          flex: 1,
          py: 2,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: 4
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `rgba(255, 255, 255, 0.05)`,
            borderRadius: 2
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Main Menu", items: mainNavItems }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Management", items: managementNavItems }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Settings", items: settingsNavItems })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Box,
      {
        sx: {
          p: 2,
          borderTop: `1px solid rgba(255, 255, 255, 0.08)`,
          bgcolor: `rgba(255, 255, 255, 0.02)`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Avatar,
            {
              src: currentUser?.photoUrl ?? void 0,
              sx: {
                width: 44,
                height: 44,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              children: currentUser && getInitials(currentUser.firstName, currentUser.lastName)
            }
          ),
          !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "body2",
                  sx: { fontWeight: 600 },
                  noWrap: true,
                  children: currentUser?.firstName || currentUser?.lastName ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : currentUser?.username || "User"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: capitalizeFirstLetter(currentUser?.role || "employee"),
                  size: "small",
                  color: getRoleColor(currentUser?.role || "employee"),
                  sx: {
                    height: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    mt: 0.5
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Logout", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                onClick: handleLogout,
                size: "small",
                sx: {
                  color: "text.secondary",
                  "&:hover": {
                    color: "error.main",
                    bgcolor: alpha(theme.palette.error.main, 0.1)
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoutIcon, { sx: { fontSize: 20 } })
              }
            ) })
          ] })
        ] })
      }
    )
  ] });
  if (!isDesktop) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwipeableDrawer,
      {
        anchor: "left",
        open: mobileOpen,
        onClose: onMobileClose || (() => {
        }),
        onOpen: () => {
        },
        ModalProps: { keepMounted: false },
        sx: {
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: `1px solid rgba(255, 255, 255, 0.08)`,
            background: `rgba(20, 20, 20, 0.95)`,
            backdropFilter: "blur(20px)"
          }
        },
        children: drawerContent
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Drawer,
    {
      variant: "permanent",
      sx: {
        width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        transition: "width 0.3s ease-in-out",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: `1px solid rgba(255, 255, 255, 0.08)`,
          background: `rgba(0, 0, 0, 0.4)`,
          backdropFilter: "blur(20px)",
          transition: "width 0.3s ease-in-out",
          overflow: "visible"
          // Allow toggle button to hang off edge
        }
      },
      children: drawerContent
    }
  );
}

const TransitionLink = React.forwardRef(
  ({ href, children, replace, onClick, ...rest }, ref) => {
    const [, setLocation] = useLocation();
    const handleClick = reactExports.useCallback(
      (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        onClick?.(e);
        reactExports.startTransition(() => {
          setLocation(href, { replace });
        });
      },
      [href, replace, setLocation, onClick]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx("a", { ref, href, onClick: handleClick, ...rest, children });
  }
);
TransitionLink.displayName = "TransitionLink";

function CommandPalette({ open, onClose }) {
  const theme = useTheme$1();
  const [, setLocation] = useLocation();
  const [query, setQuery] = reactExports.useState("");
  const [selectedIndex, setSelectedIndex] = reactExports.useState(0);
  const listRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);
  const { data: employeesData } = useQuery({
    queryKey: ["/api/employees"],
    enabled: open
    // Only fetch when open
  });
  const pages = [
    {
      id: "page-dashboard",
      title: "Dashboard",
      subtitle: "Game overview and stats",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, { fontSize: "small" }),
      action: () => setLocation("/"),
      type: "page"
    },
    {
      id: "page-schedule",
      title: "Schedule",
      subtitle: "Manage shifts and timeline",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { fontSize: "small" }),
      action: () => setLocation("/schedule"),
      type: "page"
    },
    {
      id: "page-employees",
      title: "Employees",
      subtitle: "Team directory and profiles",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { fontSize: "small" }),
      action: () => setLocation("/employees"),
      type: "page"
    },
    {
      id: "page-payroll",
      title: "Payroll",
      subtitle: "Process payments and view history",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PesoIcon, { fontSize: "small" }),
      action: () => setLocation("/payroll-management"),
      type: "page"
    },
    {
      id: "page-trading",
      title: "Shift Trading",
      subtitle: "Marketplace for shift swaps",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { fontSize: "small" }),
      action: () => setLocation("/shift-trading"),
      type: "page"
    },
    {
      id: "page-timeoff",
      title: "Time Off",
      subtitle: "Vacation and leave requests",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { fontSize: "small" }),
      action: () => setLocation("/time-off"),
      type: "page"
    },
    {
      id: "page-reports",
      title: "Analytics",
      subtitle: "Business intelligence reports",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportIcon, { fontSize: "small" }),
      action: () => setLocation("/reports"),
      type: "page"
    },
    {
      id: "page-settings",
      title: "Settings",
      subtitle: "System configuration",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, { fontSize: "small" }),
      action: () => setLocation("/deduction-settings"),
      type: "page"
    }
  ];
  const results = reactExports.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pages;
    const filteredPages = pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)
    );
    const filteredEmployees = (employeesData?.employees || []).filter(
      (e) => e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q)
    ).slice(0, 5).map((e) => ({
      id: `emp-${e.id}`,
      title: `${e.firstName} ${e.lastName}`,
      subtitle: e.position || "Employee",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: "bold"
      }, children: [
        e.firstName[0],
        e.lastName[0]
      ] }),
      action: () => setLocation(`/employees?id=${e.id}`),
      // Navigate to employee details (logic might need adjustment in Employees page)
      type: "employee"
    }));
    return [...filteredPages, ...filteredEmployees];
  }, [query, employeesData, theme]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          reactExports.startTransition(() => {
            results[selectedIndex].action();
          });
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onClose]);
  reactExports.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);
  reactExports.useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "sm",
      fullWidth: true,
      PaperProps: {
        sx: {
          backgroundImage: "none",
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(16px)",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.25)",
          mt: -10
          // Position slightly higher than center
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search$1, { color: "action" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                InputBase,
                {
                  autoFocus: true,
                  fullWidth: true,
                  placeholder: "Type a command or search...",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  sx: {
                    fontSize: "1.1rem",
                    "& input::placeholder": {
                      color: "text.secondary",
                      opacity: 0.7
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    px: 0.8,
                    py: 0.4,
                    borderRadius: 0.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.action.active, 0.05)
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", fontWeight: 600, children: "ESC" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          List,
          {
            ref: listRef,
            sx: {
              maxHeight: 400,
              overflow: "auto",
              p: 1,
              "& .MuiListItemButton-root": {
                borderRadius: 1.5,
                mb: 0.5,
                transition: "all 0.1s ease",
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.15)
                  }
                }
              }
            },
            children: results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 4, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              'No results found for "',
              query,
              '"'
            ] }) }) : results.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              ListItemButton,
              {
                selected: index === selectedIndex,
                onClick: () => {
                  reactExports.startTransition(() => {
                    result.action();
                  });
                  onClose();
                },
                onMouseEnter: () => setSelectedIndex(index),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 40, color: index === selectedIndex ? "primary.main" : "text.secondary" }, children: result.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Typography,
                        {
                          variant: "body2",
                          fontWeight: index === selectedIndex ? 600 : 400,
                          color: index === selectedIndex ? "text.primary" : "text.secondary",
                          children: result.title
                        }
                      ),
                      secondary: result.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { opacity: 0.8 }, children: result.subtitle })
                    }
                  ),
                  index === selectedIndex && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowIcon, { fontSize: "small", color: "action", sx: { opacity: 0.5 } })
                ]
              }
            ) }, result.id))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: {
              p: 1,
              px: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.action.hover, 0.05),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { fontWeight: 600 }, children: "↑↓" }),
                " to navigate"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { fontWeight: 600 }, children: "↵" }),
                " to select"
              ] })
            ]
          }
        )
      ]
    }
  );
}

const TYPE_STYLE = {
  shift_update: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 16 } }), color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  shift_assigned: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 16 } }), color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  schedule: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 16 } }), color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  shift_trade: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 16 } }), color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  trade_request: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 16 } }), color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  time_off: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon$1, { sx: { fontSize: 16 } }), color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  time_off_approved: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16 } }), color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  time_off_rejected: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 16 } }), color: "#EF4444", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" },
  payroll: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PayIcon, { sx: { fontSize: 16 } }), color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  payment: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PayIcon, { sx: { fontSize: 16 } }), color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  approval: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16 } }), color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  rejection: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 16 } }), color: "#EF4444", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" },
  adjustment: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustmentIcon, { sx: { fontSize: 16 } }), color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" }
};
function getStyle(type) {
  return TYPE_STYLE[type] || { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { sx: { fontSize: 16 } }), color: "#6B7280", gradient: "linear-gradient(135deg, #6B7280, #4B5563)" };
}
function NotificationBell() {
  const theme = useTheme$1();
  const isDark = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const open = Boolean(anchorEl);
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications");
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const res = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
    onError: (error) => void 0
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/notifications/read-all");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
    onError: (error) => void 0
  });
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markReadMutation.mutate(notification.id);
    setAnchorEl(null);
    const type = notification.type;
    const role = user?.role;
    const isManager = role === "admin" || role === "manager";
    if (type.startsWith("shift_update") || type === "shift_assigned" || type === "schedule" || type === "adjustment") {
      setLocation(isManager ? "/schedule" : "/employee/schedule");
    } else if (type.startsWith("time_off") || type.startsWith("leave")) {
      setLocation(isManager ? "/requests" : "/employee/dashboard");
    } else if (type.includes("trade")) {
      setLocation(isManager ? "/schedule" : "/shift-trading");
    } else if (type === "payroll" || type === "payment") {
      setLocation("/payroll");
    }
  };
  const recentNotifications = notifications.slice(0, 6);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      IconButton,
      {
        onClick: (e) => setAnchorEl(e.currentTarget),
        size: "small",
        sx: {
          position: "relative",
          bgcolor: alpha(theme.palette.action.hover, 0.08),
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }
        },
        "aria-label": `${unreadCount} unread notifications`,
        "aria-haspopup": "true",
        "aria-expanded": open,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            badgeContent: unreadCount,
            color: "error",
            max: 99,
            sx: {
              "& .MuiBadge-badge": {
                fontSize: 10,
                minWidth: 18,
                height: 18,
                animation: unreadCount > 0 ? "pulse 2s infinite" : "none"
              }
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsIcon, { fontSize: "small" })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open,
        onClose: () => setAnchorEl(null),
        onClick: (e) => e.stopPropagation(),
        slotProps: {
          paper: {
            elevation: 16,
            sx: {
              width: 400,
              maxHeight: 520,
              overflow: "hidden",
              mt: 1.5,
              bgcolor: isDark ? "#1C1410" : "#FFF",
              border: `1px solid ${isDark ? alpha("#FBF8F4", 0.08) : "#E5E7EB"}`,
              borderRadius: 3.5,
              backdropFilter: "blur(20px)"
            }
          }
        },
        transformOrigin: { horizontal: "right", vertical: "top" },
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Stack,
            {
              direction: "row",
              alignItems: "center",
              justifyContent: "space-between",
              sx: {
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${isDark ? alpha("#FBF8F4", 0.06) : "#F3F4F6"}`
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontWeight: 800, fontSize: "1rem", color: isDark ? "#F5EDE4" : "#111827", letterSpacing: "-0.01em" }, children: "Notifications" }),
                  unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                    background: "linear-gradient(135deg, #EF4444, #DC2626)",
                    color: "#fff",
                    borderRadius: 10,
                    px: 0.8,
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    lineHeight: "18px",
                    minWidth: 18,
                    textAlign: "center",
                    boxShadow: "0 2px 6px rgba(239,68,68,0.3)"
                  }, children: unreadCount })
                ] }),
                unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "small",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DoneAllIcon, { sx: { fontSize: 13 } }),
                    onClick: () => markAllReadMutation.mutate(),
                    disabled: markAllReadMutation.isPending,
                    sx: {
                      textTransform: "none",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 0,
                      px: 1.5,
                      py: 0.4,
                      color: isDark ? alpha("#FBF8F4", 0.5) : "#9CA3AF",
                      "&:hover": { bgcolor: isDark ? alpha("#FBF8F4", 0.06) : "#F3F4F6" }
                    },
                    children: "Read all"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxHeight: 380, overflow: "auto", p: 2 }, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24, sx: { color: isDark ? alpha("#FBF8F4", 0.3) : "#D1D5DB" } }) }) : recentNotifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 6, textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
              width: 56,
              height: 56,
              borderRadius: "50%",
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isDark ? alpha("#FBF8F4", 0.04) : "#F3F4F6",
              border: "2px dashed",
              borderColor: isDark ? alpha("#FBF8F4", 0.08) : "#E5E7EB"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyIcon, { sx: { fontSize: 24, color: isDark ? alpha("#FBF8F4", 0.2) : "#D1D5DB" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: isDark ? alpha("#FBF8F4", 0.4) : "#9CA3AF", fontWeight: 500 }, children: "No notifications yet" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1.5, children: recentNotifications.map((n) => {
            const style = getStyle(n.type);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                onClick: () => handleNotificationClick(n),
                sx: {
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  p: 2,
                  cursor: "pointer",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: n.isRead ? isDark ? alpha("#FBF8F4", 0.05) : "#F3F4F6" : alpha(style.color, 0.3),
                  bgcolor: n.isRead ? "transparent" : isDark ? alpha(style.color, 0.05) : alpha(style.color, 0.02),
                  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${alpha(style.color, 0.15)}`,
                    bgcolor: n.isRead ? alpha(theme.palette.action.hover, 0.05) : alpha(style.color, 0.08),
                    borderColor: alpha(style.color, 0.4)
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: {
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    mt: 0.15,
                    background: n.isRead ? isDark ? alpha("#FBF8F4", 0.06) : "#F3F4F6" : style.gradient,
                    color: n.isRead ? isDark ? alpha("#FBF8F4", 0.35) : "#9CA3AF" : "#FFF",
                    boxShadow: n.isRead ? "none" : `0 3px 8px ${alpha(style.color, 0.3)}`
                  }, children: style.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.75, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Typography,
                        {
                          noWrap: true,
                          sx: {
                            fontWeight: n.isRead ? 500 : 700,
                            fontSize: "0.8rem",
                            color: n.isRead ? isDark ? alpha("#FBF8F4", 0.55) : "#6B7280" : isDark ? "#F5EDE4" : "#111827",
                            lineHeight: 1.3
                          },
                          children: n.title
                        }
                      ),
                      !n.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: style.gradient,
                        boxShadow: `0 0 6px ${alpha(style.color, 0.5)}`
                      } })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Typography,
                      {
                        noWrap: true,
                        sx: {
                          fontSize: "0.72rem",
                          lineHeight: 1.4,
                          mt: 0.15,
                          color: isDark ? alpha("#FBF8F4", 0.3) : "#9CA3AF"
                        },
                        children: n.message
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.75, sx: { mt: 0.4 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontSize: "0.62rem", color: isDark ? alpha("#FBF8F4", 0.2) : "#D1D5DB", fontWeight: 500 }, children: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 2, height: 2, borderRadius: "50%", bgcolor: isDark ? alpha("#FBF8F4", 0.12) : "#E5E7EB" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontSize: "0.58rem", fontWeight: 700, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em" }, children: TYPE_STYLE[n.type] ? n.type.replace(/_/g, " ") : "notification" })
                    ] })
                  ] })
                ]
              },
              n.id
            );
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            px: 2.5,
            py: 1.75,
            borderTop: `1px solid ${isDark ? alpha("#FBF8F4", 0.06) : "#F3F4F6"}`
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              component: Link,
              href: "/notifications",
              fullWidth: true,
              size: "small",
              endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenIcon, { sx: { fontSize: 13 } }),
              onClick: () => setAnchorEl(null),
              sx: {
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1,
                fontSize: "0.8rem",
                color: "#FFF",
                background: isDark ? "linear-gradient(135deg, #3C2415, #5C3A20)" : "linear-gradient(135deg, #3C2415, #2A1A0E)",
                boxShadow: `0 2px 8px ${alpha("#3C2415", 0.3)}`,
                "&:hover": {
                  background: isDark ? "linear-gradient(135deg, #5C3A20, #7A4F2A)" : "linear-gradient(135deg, #2A1A0E, #3C2415)"
                }
              },
              children: "View All Notifications"
            }
          ) })
        ]
      }
    )
  ] });
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: alpha(theme.palette.action.hover, 0.08),
  border: `1px solid rgba(255, 255, 255, 0.08)`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.12)
  },
  "&:focus-within": {
    backgroundColor: alpha(theme.palette.action.hover, 0.12),
    borderColor: alpha(theme.palette.primary.main, 0.5)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto"
  },
  transition: "all 0.2s ease-in-out"
}));
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: theme.spacing(8),
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: 14,
    [theme.breakpoints.up("md")]: {
      width: "24ch",
      "&:focus": {
        width: "32ch"
      }
    }
  }
}));
function MuiHeader({ onMenuClick }) {
  const { user: currentUser, switchBranch, isAuthenticated } = useAuth();
  const canSwitchBranch = isAdmin();
  const [currentTime, setCurrentTime] = reactExports.useState(/* @__PURE__ */ new Date());
  const [location] = useLocation();
  const theme = useTheme$1();
  const { theme: appTheme, setTheme } = useTheme();
  useQueryClient();
  const [isSwitching, setIsSwitching] = reactExports.useState(false);
  const [switchToast, setSwitchToast] = reactExports.useState(null);
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const searchInputRef = React.useRef(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setProfileMenuAnchor(null);
  }, [location]);
  const shouldLoadBranches = canSwitchBranch && isAuthenticated;
  const { data: branchesData } = useQuery({
    queryKey: ["/api/branches"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: shouldLoadBranches,
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(/* @__PURE__ */ new Date());
    }, 6e4);
    return () => clearInterval(timer);
  }, []);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const activeBranches = branchesData?.branches?.filter((b) => b.isActive !== false) || [];
  const currentBranch = branchesData?.branches?.find(
    (branch) => branch.id === currentUser?.branchId
  );
  const branchNameFromProfile = (currentUser ? currentUser?.branchName : void 0) ?? void 0;
  const handleBranchSwitch = reactExports.useCallback(async (branchId) => {
    if (branchId === currentUser?.branchId || isSwitching) return;
    setIsSwitching(true);
    try {
      const success = await switchBranch(branchId);
      if (success) {
        const targetBranch = branchesData?.branches?.find((b) => b.id === branchId);
        setSwitchToast(`Switched to ${targetBranch?.name || "branch"}`);
        invalidateQueries.branchSwitch();
      } else {
        setSwitchToast("Failed to switch branch");
      }
    } finally {
      setIsSwitching(false);
    }
  }, [currentUser?.branchId, isSwitching, switchBranch, branchesData?.branches]);
  const getPageInfo = () => {
    const titles = {
      "/": { title: "Dashboard", subtitle: "" },
      "/schedule": { title: "Schedule", subtitle: "Manage shifts and schedules" },
      "/shift-trading": { title: "Shift Trading", subtitle: "Trade shifts with teammates" },
      "/payroll": { title: "Pay Summary", subtitle: "View your earnings" },
      "/notifications": { title: "Notifications", subtitle: "Recent updates" },
      "/employees": { title: "Employees", subtitle: "Manage team members" },
      "/payroll-management": { title: "Payroll", subtitle: "Process payroll" },
      "/deduction-settings": { title: "Deductions", subtitle: "Configure deductions" },
      "/admin/deduction-rates": { title: "Rates", subtitle: "Set deduction rates" },
      "/reports": { title: "Analytics", subtitle: "Business insights & reports" },
      "/branches": { title: "Branches", subtitle: "Manage locations" }
    };
    return titles[location] || { title: "PERO", subtitle: "Payroll System" };
  };
  const pageInfo = getPageInfo();
  const toggleTheme = () => {
    setTheme(appTheme === "dark" ? "light" : "dark");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppBar,
      {
        position: "sticky",
        elevation: 0,
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
          color: "text.primary"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { sx: { minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              edge: "start",
              color: "inherit",
              "aria-label": "open drawer",
              onClick: onMenuClick,
              sx: { mr: 2, display: { md: "none" } },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h6",
                component: "h1",
                sx: { fontWeight: 600, fontSize: { xs: 16, sm: 18 } },
                noWrap: true,
                children: pageInfo.title
              }
            ),
            pageInfo.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "caption",
                color: "text.secondary",
                sx: { display: { xs: "none", sm: "block" } },
                children: pageInfo.subtitle
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Search, { sx: { display: { xs: "none", md: "flex" } }, onClick: () => setSearchOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIconWrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search$1, { fontSize: "small" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StyledInputBase,
              {
                inputRef: searchInputRef,
                placeholder: "Search… (Ctrl+K)",
                inputProps: { "aria-label": "search", readOnly: true },
                onClick: () => setSearchOpen(true),
                sx: { cursor: "pointer" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                  borderRadius: 1,
                  pointerEvents: "none"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(KeyboardIcon, { sx: { fontSize: 12, color: "text.secondary" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontWeight: 500 }, children: "K" })
                ]
              }
            )
          ] }),
          currentBranch && canSwitchBranch && activeBranches.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { mr: 1.5, minWidth: 140, display: { xs: "none", sm: "flex" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select,
            {
              value: currentUser?.branchId || "",
              onChange: (e) => handleBranchSwitch(e.target.value),
              disabled: isSwitching,
              variant: "outlined",
              sx: {
                height: 32,
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 2,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.primary.main, 0.5)
                },
                "& .MuiSelect-icon": {
                  color: "primary.main"
                }
              },
              startAdornment: isSwitching ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 14, sx: { mr: 0.5 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { sx: { fontSize: 16, mr: 0.5, color: "primary.main" } }),
              renderValue: (value) => {
                const branch = activeBranches.find((b) => b.id === value);
                return branch?.name || "Branch";
              },
              children: activeBranches.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: branch.id, sx: { fontSize: 13 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { sx: { fontSize: 16, color: branch.id === currentUser?.branchId ? "primary.main" : "text.secondary" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: branch.name }),
                branch.id === currentUser?.branchId && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Current", size: "small", color: "primary", sx: { height: 18, fontSize: 10, ml: 0.5 } })
              ] }) }, branch.id))
            }
          ) }) : currentBranch || branchNameFromProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, { sx: { fontSize: 16 } }),
              label: currentBranch?.name || branchNameFromProfile || "Assigned Branch",
              size: "small",
              variant: "outlined",
              sx: {
                display: { xs: "none", sm: "flex" },
                mr: 1.5,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                "& .MuiChip-icon": {
                  color: "primary.main"
                }
              }
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Snackbar,
            {
              open: !!switchToast,
              autoHideDuration: 3e3,
              onClose: () => setSwitchToast(null),
              message: switchToast,
              anchorOrigin: { vertical: "bottom", horizontal: "center" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 16 } }),
              label: currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
              }),
              size: "small",
              variant: "outlined",
              sx: {
                display: { xs: "none", lg: "flex" },
                mr: 1.5,
                borderColor: `rgba(255, 255, 255, 0.08)`,
                "& .MuiChip-icon": {
                  color: "text.secondary"
                }
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: appTheme === "dark" ? "Light mode" : "Dark mode", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              onClick: toggleTheme,
              size: "small",
              sx: {
                mr: 1,
                bgcolor: alpha(theme.palette.action.hover, 0.08),
                "&:hover": {
                  bgcolor: alpha(
                    appTheme === "dark" ? theme.palette.warning.main : theme.palette.primary.main,
                    0.15
                  ),
                  color: appTheme === "dark" ? "warning.main" : "primary.main"
                }
              },
              children: appTheme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SunIcon, { fontSize: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MoonIcon, { fontSize: "small" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              onClick: (e) => setProfileMenuAnchor(e.currentTarget),
              size: "small",
              sx: { ml: 1, p: 0.5 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Avatar,
                {
                  src: currentUser?.photoUrl || void 0,
                  sx: { width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.8), fontSize: "0.85rem", fontWeight: 600 },
                  children: getInitials(currentUser?.firstName, currentUser?.lastName, currentUser?.username)
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Menu,
            {
              anchorEl: profileMenuAnchor,
              open: Boolean(profileMenuAnchor),
              onClose: () => setProfileMenuAnchor(null),
              transformOrigin: { horizontal: "right", vertical: "top" },
              anchorOrigin: { horizontal: "right", vertical: "bottom" },
              slotProps: { paper: { sx: { mt: 1, width: 220, borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" } } },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 700, children: `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() || currentUser?.username }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { textTransform: "capitalize" }, children: currentUser?.role || "Employee" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { component: TransitionLink, href: "/profile", onClick: () => setProfileMenuAnchor(null), sx: { py: 1.5 }, children: "Profile Settings" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { onClick: async () => {
                  setProfileMenuAnchor(null);
                  try {
                    const { logout } = await __vitePreload(async () => { const { logout } = await Promise.resolve().then(() => auth);return { logout }},true              ?void 0:void 0);
                    await logout();
                    window.location.replace("/login");
                  } catch (err) {
                    window.location.replace("/login");
                  }
                }, sx: { py: 1.5, color: "error.main" }, children: "Log Out" })
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommandPalette, { open: searchOpen, onClose: () => setSearchOpen(false) })
  ] });
}

function MobileLayout({ children }) {
  const [location, setLocation] = useLocation();
  const [value, setValue] = reactExports.useState(0);
  const currentUser = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (location.includes("/employee/dashboard")) setValue(0);
    else if (location.includes("/employee/schedule")) setValue(1);
    else if (location.includes("/employee/payroll")) setValue(2);
    else if (location.includes("/employee/profile") || location.includes("/employee/more") || location.includes("/employee/requests")) setValue(3);
  }, [location]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppBar,
      {
        position: "static",
        elevation: 0,
        sx: {
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", flexGrow: 1, gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, color: "text.primary", children: "PERO" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => reactExports.startTransition(() => setLocation("/employee/profile")), sx: { p: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Avatar,
            {
              src: currentUser?.photoUrl || void 0,
              sx: {
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: "0.875rem",
                fontWeight: 600
              },
              children: getInitials(currentUser?.firstName, currentUser?.lastName)
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Box,
      {
        component: "main",
        sx: {
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: "70px",
          // Padding for bottom nav
          // Use smooth momentum scrolling on iOS
          WebkitOverflowScrolling: "touch"
        },
        children
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        sx: {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1e3,
          borderTop: "1px solid",
          borderColor: "divider",
          pb: "env(safe-area-inset-bottom)"
          // Handle iPhone notch/home bar
        },
        elevation: 8,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          BottomNavigation,
          {
            showLabels: true,
            value,
            onChange: (event, newValue) => {
              setValue(newValue);
              reactExports.startTransition(() => {
                switch (newValue) {
                  case 0:
                    setLocation("/employee/dashboard");
                    break;
                  case 1:
                    setLocation("/employee/schedule");
                    break;
                  case 2:
                    setLocation("/employee/payroll");
                    break;
                  case 3:
                    setLocation("/employee/more");
                    break;
                }
              });
            },
            sx: {
              height: 65,
              bgcolor: "background.paper",
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                padding: "6px 0",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main"
                }
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.7rem",
                fontWeight: 500,
                mt: 0.5,
                "&.Mui-selected": {
                  fontSize: "0.75rem",
                  fontWeight: 600
                }
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigationAction, { label: "Home", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigationAction, { label: "Schedule", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon$1, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigationAction, { label: "Payslips", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PayrollIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigationAction, { label: "More", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon$1, {}) })
            ]
          }
        )
      }
    )
  ] });
}

function UltimatumRouteCleanup() {
  const [location] = useLocation();
  reactExports.useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, [location]);
  return null;
}
const MuiDashboard = reactExports.lazy(() => __vitePreload(() => import('./mui-dashboard-Z_bO033B.js'),true              ?__vite__mapDeps([0,1,2,3,4,5]):void 0));
const MuiEmployees = reactExports.lazy(() => __vitePreload(() => import('./mui-employees-CJGgp0HM.js'),true              ?__vite__mapDeps([6,1,2,7,3,4,8,9,10,11,12]):void 0));
const ScheduleV2 = reactExports.lazy(() => __vitePreload(() => import('./schedule-v2-C4wiOOO5.js'),true              ?__vite__mapDeps([13,1,2,7]):void 0));
const MuiPayroll = reactExports.lazy(() => __vitePreload(() => import('./mui-payroll-BNYwX8fO.js'),true              ?__vite__mapDeps([14,1,2,7,15]):void 0));
const MuiNotifications = reactExports.lazy(() => __vitePreload(() => import('./mui-notifications-DDnAvYS6.js'),true              ?__vite__mapDeps([16,1,2,3,7]):void 0));
reactExports.lazy(() => __vitePreload(() => import('./mui-shift-trading-DvkQQiX6.js'),true              ?__vite__mapDeps([17,1,2,3,7,18]):void 0));
const MuiBranches = reactExports.lazy(() => __vitePreload(() => import('./mui-branches-U1sk8tW8.js'),true              ?__vite__mapDeps([5,1,2,3]):void 0));
const MuiReports = reactExports.lazy(() => __vitePreload(() => import('./mui-reports-2sd6vHLr.js'),true              ?__vite__mapDeps([19,1,2]):void 0));
const MuiAnalytics = reactExports.lazy(() => __vitePreload(() => import('./mui-analytics-NBangYqV.js'),true              ?__vite__mapDeps([20,1,2,7,21]):void 0));
const MuiLogin = reactExports.lazy(() => __vitePreload(() => import('./mui-login-B4Pjy03e.js'),true              ?__vite__mapDeps([22,1,2,3]):void 0));
reactExports.lazy(() => __vitePreload(() => import('./mui-time-off-X372fXr0.js'),true              ?__vite__mapDeps([23,1,2,3,7]):void 0));
const MuiDeductionSettings = reactExports.lazy(() => __vitePreload(() => import('./mui-deduction-settings-BbbCIHSy.js'),true              ?__vite__mapDeps([24,1,2]):void 0));
const MuiPayrollManagement = reactExports.lazy(() => __vitePreload(() => import('./mui-payroll-management-DEV_PVp1.js'),true              ?__vite__mapDeps([25,1,2,3,7,26,15,12,9]):void 0));
const MuiAdminDeductionRates = reactExports.lazy(() => __vitePreload(() => import('./mui-admin-deduction-rates-BWqwYC8o.js'),true              ?__vite__mapDeps([27,1,2,3]):void 0));
const MuiAuditLogs = reactExports.lazy(() => __vitePreload(() => import('./mui-audit-logs-BOjlEFST.js'),true              ?__vite__mapDeps([28,1,2,7]):void 0));
const MuiHolidayCalendar = reactExports.lazy(() => __vitePreload(() => import('./mui-holiday-calendar-DF3MmtvV.js'),true              ?__vite__mapDeps([29,1,2,3]):void 0));
const MuiComplianceDashboard = reactExports.lazy(() => __vitePreload(() => import('./mui-compliance-dashboard-DzKzy1u5.js'),true              ?__vite__mapDeps([30,1,2]):void 0));
const MuiProfileSettings = reactExports.lazy(() => __vitePreload(() => import('./mui-profile-settings-BnamTJjs.js'),true              ?__vite__mapDeps([31,1,2,8,9,10,3]):void 0));
const MuiCompanySettings = reactExports.lazy(() => __vitePreload(() => import('./mui-company-settings-nvkG8bp1.js'),true              ?__vite__mapDeps([32,1,2,3,10]):void 0));
const MuiThirteenthMonth = reactExports.lazy(() => __vitePreload(() => import('./mui-thirteenth-month-BQmXggIL.js'),true              ?__vite__mapDeps([33,1,2,3,4]):void 0));
const MuiLeaveCredits = reactExports.lazy(() => __vitePreload(() => import('./mui-leave-credits-Ds37vMC3.js'),true              ?__vite__mapDeps([34,1,2,3,4]):void 0));
const MuiRequests = reactExports.lazy(() => __vitePreload(() => import('./mui-requests-7ystX_xg.js'),true              ?__vite__mapDeps([35,1,2,23,3,7]):void 0));
const MobileRequests = reactExports.lazy(() => __vitePreload(() => import('./mobile-requests-BDm3yztv.js'),true              ?__vite__mapDeps([36,1,2,3]):void 0));
const MobileMore = reactExports.lazy(() => __vitePreload(() => import('./mobile-more-CMvPGTnX.js'),true              ?__vite__mapDeps([37,1,2]):void 0));
const Setup = reactExports.lazy(() => __vitePreload(() => import('./setup-z-9ucIjP.js'),true              ?__vite__mapDeps([38,1,2,11,9,3]):void 0));
const NotFound = reactExports.lazy(() => __vitePreload(() => import('./not-found-4S0rqO3M.js'),true              ?__vite__mapDeps([39,1,2,9]):void 0));
const prefetchRoutes = () => {
  const idleCallback = typeof requestIdleCallback !== "undefined" ? requestIdleCallback : setTimeout;
  idleCallback(() => {
    __vitePreload(() => import('./mui-dashboard-Z_bO033B.js'),true              ?__vite__mapDeps([0,1,2,3,4,5]):void 0);
    __vitePreload(() => import('./schedule-v2-C4wiOOO5.js'),true              ?__vite__mapDeps([13,1,2,7]):void 0);
  });
  idleCallback(() => {
    __vitePreload(() => import('./mui-employees-CJGgp0HM.js'),true              ?__vite__mapDeps([6,1,2,7,3,4,8,9,10,11,12]):void 0);
    __vitePreload(() => import('./mui-payroll-management-DEV_PVp1.js'),true              ?__vite__mapDeps([25,1,2,3,7,26,15,12,9]):void 0);
    __vitePreload(() => import('./mui-notifications-DDnAvYS6.js'),true              ?__vite__mapDeps([16,1,2,3,7]):void 0);
  });
  idleCallback(() => {
    __vitePreload(() => import('./mui-reports-2sd6vHLr.js'),true              ?__vite__mapDeps([19,1,2]):void 0);
    __vitePreload(() => import('./mui-requests-7ystX_xg.js'),true              ?__vite__mapDeps([35,1,2,23,3,7]):void 0);
    __vitePreload(() => import('./mui-profile-settings-BnamTJjs.js'),true              ?__vite__mapDeps([31,1,2,8,9,10,3]):void 0);
    __vitePreload(() => import('./mobile-requests-BDm3yztv.js'),true              ?__vite__mapDeps([36,1,2,3]):void 0);
  });
};
function LoadingScreen() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 32 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      width: 24,
      height: 24,
      border: "3px solid #e0e0e0",
      borderTopColor: "#2e7d32",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      margin: "0 auto 8px"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.7 } }
      ` })
  ] });
}
function RouteLoader({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {}), children }) });
}
function DesktopLayout({ children }) {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", minHeight: "100vh", bgcolor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "absolute",
            top: -160,
            right: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
            animation: "pulse 8s ease-in-out infinite"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "absolute",
            top: "33%",
            left: -240,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
            animation: "pulse 10s ease-in-out infinite 2s"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "absolute",
            bottom: -160,
            right: "25%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.06)} 0%, transparent 70%)`,
            animation: "pulse 12s ease-in-out infinite 4s"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MuiSidebar,
      {
        mobileOpen,
        onMobileClose: () => setMobileOpen(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MuiHeader, { onMenuClick: handleDrawerToggle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "main", sx: { flex: 1, overflow: "auto", minWidth: 0 }, children })
    ] })
  ] });
}
function RequireAdmin({ children }) {
  const { user, isAuthenticated } = getAuthState();
  const [, setLocation] = useLocation();
  reactExports.useEffect(() => {
    if (isAuthenticated && user && user.role !== "admin") {
      reactExports.startTransition(() => setLocation("/"));
    }
  }, [isAuthenticated, user, setLocation]);
  if (!isAuthenticated || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  }
  if (user.role !== "admin") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function RequireManagerOrAdmin({ children }) {
  const { user, isAuthenticated } = getAuthState();
  const [, setLocation] = useLocation();
  reactExports.useEffect(() => {
    if (isAuthenticated && user && user.role !== "manager" && user.role !== "admin") {
      reactExports.startTransition(() => setLocation("/"));
    }
  }, [isAuthenticated, user, setLocation]);
  if (!isAuthenticated || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  }
  if (user.role !== "manager" && user.role !== "admin") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function DesktopRouter({ authState }) {
  const { isAuthenticated, user } = authState;
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/login" });
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  }
  if (user.role === "employee") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/dashboard" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Switch, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiDashboard, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleV2, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/shift-trading", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/schedule" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/time-off", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/schedule" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/payroll", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiPayroll, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiNotifications, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiProfileSettings, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiProfileSettings, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/thirteenth-month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiThirteenthMonth, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/leave-credits", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiLeaveCredits, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/requests", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiRequests, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employees", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiEmployees, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/payroll-management", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiPayrollManagement, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/reports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiReports, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/analytics", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiAnalytics, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/branches", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiBranches, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/deduction-settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiDeductionSettings, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/company-settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiCompanySettings, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/admin/deduction-rates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiAdminDeductionRates, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/audit-logs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiAuditLogs, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/compliance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiComplianceDashboard, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/holiday-calendar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireManagerOrAdmin, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiHolidayCalendar, {}) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotFound, {}) }) }) })
  ] });
}
function MobileRouter({ authState }) {
  const { isAuthenticated, user } = authState;
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/login" });
  }
  if (user?.role === "manager" || user?.role === "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Switch, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiDashboard, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiDashboard, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleV2, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/payroll", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiPayroll, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiNotifications, {}) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/requests", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileRequests, {}) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/time-off", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/schedule" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/shift-trading", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/schedule" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiProfileSettings, {}) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/more", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileMore, {}) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/dashboard" }) })
  ] });
}
function App() {
  const [authState, setLocalAuthState] = reactExports.useState(getAuthState());
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [setupComplete, setSetupComplete] = reactExports.useState(null);
  const checkAuth = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const authResponse = await apiRequest("GET", "/api/auth/status");
      const authData = await authResponse.json();
      setSetupComplete(authData.isSetupComplete);
      if (authData.authenticated && authData.user) {
        setAuthState({ user: authData.user, isAuthenticated: true });
        prefetchRoutes();
      } else {
        setAuthState({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      setSetupComplete(false);
      setAuthState({ user: null, isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    checkAuth();
    const unsubscribe = subscribeToAuth(setLocalAuthState);
    return () => unsubscribe();
  }, [checkAuth]);
  reactExports.useEffect(() => {
    if (!setupComplete) return;
    const authPollInterval = setInterval(async () => {
      try {
        const authResponse = await apiRequest("GET", "/api/auth/status");
        const authData = await authResponse.json();
        if (authData.authenticated && authData.user) {
          setAuthState({ user: authData.user, isAuthenticated: true });
        } else {
          setAuthState({ user: null, isAuthenticated: false });
        }
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          setAuthState({ user: null, isAuthenticated: false });
        }
      }
    }, 6e4);
    return () => clearInterval(authPollInterval);
  }, [setupComplete]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {}) }) });
  }
  if (setupComplete === false) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MuiThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Setup, {}) }) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemeProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MuiThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UltimatumRouteCleanup, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Switch, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { children: authState.isAuthenticated ? authState.user?.role === "employee" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/dashboard" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MuiLogin, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/mobile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/dashboard" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/dashboard" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-schedule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/schedule" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-payroll", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/payroll" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/notifications" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-time_off", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/time-off" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-shift-trading", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/shift-trading" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/profile" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/mobile-more", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/employee/more" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee/:rest*", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MobileRouter, { authState }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopRouter, { authState }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Lt,
      {
        position: "bottom-right",
        autoClose: 3e3,
        hideProgressBar: false,
        newestOnTop: true,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "dark",
        toastStyle: {
          backgroundColor: "#1e1e1e",
          color: "#fff",
          borderRadius: "8px"
        }
      }
    )
  ] });
}

function showErrorOverlay(title, message, stack) {
  let overlay = document.getElementById("global-error-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "global-error-overlay";
    document.body.appendChild(overlay);
  }
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #ff6b6b;
    font-family: monospace;
    background: rgba(10, 10, 10, 0.98);
    text-align: left;
    overflow: auto;
  `;
  overlay.innerHTML = `
    <h1 style="margin-bottom: 10px; color: #ff6b6b;">⚠️ ${title}</h1>
    <pre style="background: #1a1a1a; padding: 15px; border: 1px solid #ff6b6b; border-radius: 8px; max-width: 700px; overflow: auto; color: #fca5a5; white-space: pre-wrap; word-wrap: break-word; font-size: 13px;">${message}${stack ? "\n\n" + stack : ""}</pre>
    <button onclick="document.getElementById('global-error-overlay').remove(); location.reload();" style="padding: 12px 24px; margin-top: 20px; cursor: pointer; background: #ff6b6b; color: #000; border: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
      Refresh Page
    </button>
  `;
}
window.addEventListener("unhandledrejection", (event) => {
  const errorMsg = event.reason?.message || String(event.reason);
  const errorStack = event.reason?.stack || "";
  showErrorOverlay("Unhandled Promise Rejection", errorMsg, errorStack);
});
window.addEventListener("error", (event) => {
  const errorMsg = event.error?.message || event.message || String(event.error);
  if (typeof errorMsg === "string" && (errorMsg.includes("ResizeObserver loop limit exceeded") || errorMsg.includes("ResizeObserver loop completed with undelivered notifications"))) {
    event.preventDefault();
    return;
  }
  const errorStack = event.error?.stack || "";
  showErrorOverlay(`Runtime Error`, errorMsg, errorStack);
});
const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}
try {
  clientExports.createRoot(root).render(/* @__PURE__ */ jsxRuntimeExports.jsx(App, {}));
} catch (error) {
  showErrorOverlay("Application Failed to Start", error.message, error.stack);
}

export { API_BASE as A, Logo as L, PesoIcon as P, TransitionLink as T, isAdmin as a, getInitials as b, apiRequest as c, cn as d, capitalizeFirstLetter as e, isEmployee as f, getCurrentUser as g, invalidateQueries as h, isManager as i, apiUrl as j, useTheme as k, auth as l, queryClient as q, setAuthState as s, useAuth as u };
