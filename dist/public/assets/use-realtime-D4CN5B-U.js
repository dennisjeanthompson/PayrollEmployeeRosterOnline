import { aG as useQueryClient, r as reactExports, dQ as lookup } from './vendor-5dgU3tca.js';
import { g as getCurrentUser, A as API_BASE } from './main-2BvCZ7pP.js';

let globalSocket = null;
let globalSocketUserId = null;
let globalIsConnected = false;
const connectionListeners = /* @__PURE__ */ new Set();
let notificationInvalidationTimer = null;
function invalidateManagerDashboardQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
}
function setGlobalIsConnected(connected) {
  if (globalIsConnected === connected) return;
  globalIsConnected = connected;
  connectionListeners.forEach((listener) => listener());
}
function subscribeToConnectionState(listener) {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}
function getConnectionSnapshot() {
  return globalIsConnected;
}
function useRealtime(options = {}) {
  const { enabled = true, queryKeys = [], onEvent } = options;
  const queryClient = useQueryClient();
  const socketRef = reactExports.useRef(null);
  const currentUser = getCurrentUser();
  const isConnected = reactExports.useSyncExternalStore(
    subscribeToConnectionState,
    getConnectionSnapshot,
    getConnectionSnapshot
  );
  const onEventRef = reactExports.useRef(onEvent);
  const queryKeysRef = reactExports.useRef(queryKeys);
  reactExports.useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);
  reactExports.useEffect(() => {
    queryKeysRef.current = queryKeys;
  }, [queryKeys]);
  reactExports.useEffect(() => {
    if (!enabled || !currentUser?.id) return;
    if (globalSocket && globalSocketUserId === currentUser.id) {
      socketRef.current = globalSocket;
      setGlobalIsConnected(globalSocket.connected);
      if (globalSocket.disconnected) {
        globalSocket.connect();
      }
      return;
    }
    if (globalSocket && globalSocketUserId !== currentUser.id) {
      setGlobalIsConnected(false);
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketUserId = null;
    }
    const socketUrl = API_BASE ? API_BASE : window.location.origin;
    const socket = lookup(socketUrl, {
      query: { userId: currentUser.id },
      auth: {
        token: localStorage.getItem("auth_token") || ""
      },
      reconnectionDelay: 1e3,
      reconnection: true,
      reconnectionDelayMax: 5e3,
      reconnectionAttempts: 10,
      // Default to websocket, but allow polling as fallback if proxy blocks it
      transports: ["websocket", "polling"],
      // Don't force a new connection on each creation
      forceNew: false
    });
    globalSocket = socket;
    globalSocketUserId = currentUser.id;
    socketRef.current = socket;
    socket.on("connect", () => {
      setGlobalIsConnected(true);
      socket.emit("subscribe:employee-shifts");
      socket.emit("subscribe:shift-trades");
    });
    socket.on("disconnect", (reason) => {
      setGlobalIsConnected(false);
    });
    socket.on("connect_error", (error) => {
      setGlobalIsConnected(false);
    });
    socket.on("error", (error) => {
    });
    const invalidateForecastQueries = () => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-labor"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-payroll"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-peaks"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-staffing"] });
      });
    };
    const invalidateShiftQueries = () => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts/branch"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
        queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/hours/team-summary"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-schedule-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-shifts"] });
      });
      invalidateForecastQueries();
    };
    const invalidateTimeOffQueries = () => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["mobile-time-off"] });
      });
    };
    const invalidateNotifications = () => {
      if (notificationInvalidationTimer) {
        clearTimeout(notificationInvalidationTimer);
      }
      notificationInvalidationTimer = setTimeout(() => {
        reactExports.startTransition(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        });
        notificationInvalidationTimer = null;
      }, 150);
    };
    const invalidateEmployeeQueries = () => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return key === "/api/hours/all-employees" || key === "/api/employees" || key === "employees" || key === "employee-stats";
          }
        });
      });
    };
    const invalidateTradeQueries = () => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shift-trades"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["mobile-shift-trades-available"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-shift-trades-my"] });
      });
    };
    socket.on("shift:created", (data) => {
      invalidateShiftQueries();
      onEventRef.current?.("shift:created", data);
    });
    socket.on("shift:updated", (data) => {
      invalidateShiftQueries();
      onEventRef.current?.("shift:updated", data);
    });
    socket.on("shift:deleted", (data) => {
      invalidateShiftQueries();
      onEventRef.current?.("shift:deleted", data);
    });
    socket.on("shift:ownership-changed", (data) => {
      invalidateShiftQueries();
      invalidateTradeQueries();
      onEventRef.current?.("shift:ownership-changed", data);
    });
    socket.on("trade:created", (data) => {
      invalidateTradeQueries();
      invalidateShiftQueries();
      onEventRef.current?.("trade:created", data);
    });
    socket.on("trade:status-changed", (data) => {
      invalidateTradeQueries();
      invalidateShiftQueries();
      onEventRef.current?.("trade:status-changed", data);
    });
    socket.on("trade:approved", (data) => {
      reactExports.startTransition(() => {
        invalidateTradeQueries();
        invalidateShiftQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("trade:approved", data);
    });
    socket.on("time-off:created", (data) => {
      reactExports.startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:created", data);
    });
    socket.on("time-off:updated", (data) => {
      reactExports.startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:updated", data);
    });
    socket.on("time-off:approved", (data) => {
      reactExports.startTransition(() => {
        invalidateTimeOffQueries();
        invalidateShiftQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:approved", data);
    });
    socket.on("time-off:rejected", (data) => {
      reactExports.startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:rejected", data);
    });
    socket.on("availability:updated", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      });
      onEventRef.current?.("availability:updated", data);
    });
    socket.on("employee:created", (data) => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:created", data);
    });
    socket.on("employee:updated", (data) => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        invalidateManagerDashboardQueries(queryClient);
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:updated", data);
    });
    socket.on("employee:deleted", (data) => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:deleted", data);
    });
    socket.on("payroll:period-created", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:period-created", data);
    });
    socket.on("payroll:period-updated", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:period-updated", data);
    });
    socket.on("payroll:processed", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:processed", data);
    });
    socket.on("payroll:entry-updated", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:entry-updated", data);
    });
    socket.on("payroll:sent", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-payroll"] });
      });
      onEventRef.current?.("payroll:sent", data);
    });
    socket.on("notification:created", (data) => {
      reactExports.startTransition(() => {
        invalidateNotifications();
        const notif = data?.notification || data;
        if (notif?.type) {
          if (notif.type.includes("time_off")) invalidateTimeOffQueries();
          if (notif.type.includes("shift") || notif.type.includes("trade")) {
            invalidateShiftQueries();
            invalidateTradeQueries();
          }
        }
      });
      onEventRef.current?.("notification:created", data);
    });
    socket.on("notification", (data) => {
      reactExports.startTransition(() => {
        invalidateNotifications();
      });
      onEventRef.current?.("notification", data);
    });
    socket.on("audit:created", (data) => {
      reactExports.startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/audit-logs/stats"] });
      });
      onEventRef.current?.("audit:created", data);
    });
    socket.on("data-refresh-needed", () => {
      const keys = queryKeysRef.current;
      if (keys.length > 0) {
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    });
    return () => {
      socketRef.current = null;
    };
  }, [enabled, currentUser?.id, queryClient]);
  const emit = reactExports.useCallback(
    (event, data) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );
  return { socket: socketRef.current, isConnected, emit };
}

export { useRealtime as u };
