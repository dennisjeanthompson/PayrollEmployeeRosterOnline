import { useEffect, useCallback, useRef, startTransition, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { getCurrentUser } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

interface UseRealtimeOptions {
  enabled?: boolean;
  queryKeys?: string[];
  onEvent?: (event: string, data: any) => void;
}

// Singleton socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let globalSocketUserId: string | null = null;
let globalIsConnected = false;
const connectionListeners = new Set<() => void>();
let notificationInvalidationTimer: ReturnType<typeof setTimeout> | null = null;

function invalidateManagerDashboardQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/manager"] });
}

function setGlobalIsConnected(connected: boolean) {
  if (globalIsConnected === connected) return;
  globalIsConnected = connected;
  connectionListeners.forEach((listener) => listener());
}

function subscribeToConnectionState(listener: () => void) {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}

function getConnectionSnapshot() {
  return globalIsConnected;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { enabled = true, queryKeys = [], onEvent } = options;
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const currentUser = getCurrentUser();
  const isConnected = useSyncExternalStore(
    subscribeToConnectionState,
    getConnectionSnapshot,
    getConnectionSnapshot
  );
  
  // Use refs to store callbacks so they don't cause reconnections
  const onEventRef = useRef(onEvent);
  const queryKeysRef = useRef(queryKeys);
  
  // Update refs when values change
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);
  
  useEffect(() => {
    queryKeysRef.current = queryKeys;
  }, [queryKeys]);

  useEffect(() => {
    if (!enabled || !currentUser?.id) return;

    // If there's already a global socket for this user, reuse it unconditionally
    // Wait for it to connect if it's currently connecting, but DO NOT spawn a duplicate.
    if (globalSocket && globalSocketUserId === currentUser.id) {
      socketRef.current = globalSocket;
      setGlobalIsConnected(globalSocket.connected);
      
      // If it was disconnected manually (or by network drop) and we're reusing it, attempt to reconnect
      if (globalSocket.disconnected) {
        globalSocket.connect();
      }
      return;
    }

    // Completely tear down existing socket only if the mapped userID has changed
    if (globalSocket && globalSocketUserId !== currentUser.id) {
      setGlobalIsConnected(false);
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketUserId = null;
    }

    // Connect to WebSocket with proper base URL if needed for Vercel/Render deployments
    const socketUrl = API_BASE ? API_BASE : window.location.origin;
    const socket = io(socketUrl, {
      query: { userId: currentUser.id },
      auth: {
        token: localStorage.getItem("auth_token") || "",
      },
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      // Default to websocket, but allow polling as fallback if proxy blocks it
      transports: ["websocket", "polling"],
      // Don't force a new connection on each creation
      forceNew: false,
    });

    globalSocket = socket;
    globalSocketUserId = currentUser.id;
    socketRef.current = socket;

    socket.on("connect", () => {
      setGlobalIsConnected(true);
      console.log("✅ Connected to real-time updates");
      // Subscribe to relevant events
      socket.emit("subscribe:employee-shifts");
      socket.emit("subscribe:shift-trades");
    });

    socket.on("disconnect", (reason) => {
      setGlobalIsConnected(false);
      console.log("❌ Disconnected from real-time updates:", reason);
    });

    socket.on("connect_error", (error) => {
      setGlobalIsConnected(false);
      console.error("Socket connect error:", error);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    const invalidateForecastQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-labor"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-payroll"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-peaks"] });
        queryClient.invalidateQueries({ queryKey: ["forecast-staffing"] });
      });
    };

    // Shift events — invalidate all known shift query keys (desktop + mobile)
    const invalidateShiftQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts/branch"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
        // Dashboard components that depend on shift data
        queryClient.invalidateQueries({ queryKey: ["upcoming-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/hours/team-summary"] });
        // Mobile query keys
        queryClient.invalidateQueries({ queryKey: ["mobile-schedule-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-shifts"] });
      });
      invalidateForecastQueries();
    };

    const invalidateTimeOffQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
        invalidateManagerDashboardQueries(queryClient);
        // Mobile query keys
        queryClient.invalidateQueries({ queryKey: ["mobile-time-off"] });
      });
    };

    const invalidateNotifications = () => {
      if (notificationInvalidationTimer) {
        clearTimeout(notificationInvalidationTimer);
      }

      notificationInvalidationTimer = setTimeout(() => {
        startTransition(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        });
        notificationInvalidationTimer = null;
      }, 150);
    };

    const invalidateEmployeeQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey[0] as string | undefined;
            return (
              key === "/api/hours/all-employees" ||
              key === "/api/employees" ||
              key === "employees" ||
              key === "employee-stats"
            );
          },
        });
      });
    };

    const invalidateTradeQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shift-trades"] });
        invalidateManagerDashboardQueries(queryClient);
        // Mobile query keys
        queryClient.invalidateQueries({ queryKey: ["mobile-shift-trades-available"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-shift-trades-my"] });
      });
    };

    socket.on("shift:created", (data) => {
      console.log("📍 New shift created:", data);
      invalidateShiftQueries();
      onEventRef.current?.("shift:created", data);
    });

    socket.on("shift:updated", (data) => {
      console.log("🔄 Shift updated:", data);
      invalidateShiftQueries();
      onEventRef.current?.("shift:updated", data);
    });

    socket.on("shift:deleted", (data) => {
      console.log("🗑️ Shift deleted:", data);
      invalidateShiftQueries();
      onEventRef.current?.("shift:deleted", data);
    });

    socket.on("shift:ownership-changed", (data) => {
      console.log("🔄 Shift ownership changed:", data);
      invalidateShiftQueries();
      invalidateTradeQueries();
      onEventRef.current?.("shift:ownership-changed", data);
    });

    // Trade events
    socket.on("trade:created", (data) => {
      console.log("📨 New trade request:", data);
      invalidateTradeQueries();
      invalidateShiftQueries();
      onEventRef.current?.("trade:created", data);
    });

    socket.on("trade:status-changed", (data) => {
      console.log("📝 Trade status changed:", data);
      invalidateTradeQueries();
      invalidateShiftQueries();
      onEventRef.current?.("trade:status-changed", data);
    });

    socket.on("trade:approved", (data) => {
      console.log("✅ Trade approved:", data);
      startTransition(() => {
        invalidateTradeQueries();
        invalidateShiftQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("trade:approved", data);
    });

    // Time-off events
    socket.on("time-off:created", (data) => {
      console.log("📅 Time-off request created:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:created", data);
    });

    socket.on("time-off:updated", (data) => {
      console.log("📅 Time-off request updated:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:updated", data);
    });

    socket.on("time-off:approved", (data) => {
      console.log("✅ Time-off approved:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        invalidateShiftQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:approved", data);
    });

    socket.on("time-off:rejected", (data) => {
      console.log("❌ Time-off rejected:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        invalidateNotifications();
      });
      onEventRef.current?.("time-off:rejected", data);
    });

    // Availability events
    socket.on("availability:updated", (data) => {
      console.log("👥 Availability updated:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      });
      onEventRef.current?.("availability:updated", data);
    });

    // Employee events - refresh the shared employee caches
    socket.on("employee:created", (data) => {
      console.log("👤 New employee created:", data);
      startTransition(() => {
        invalidateEmployeeQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:created", data);
    });

    socket.on("employee:updated", (data) => {
      console.log("👤 Employee updated:", data);
      startTransition(() => {
        invalidateEmployeeQueries();
        invalidateManagerDashboardQueries(queryClient);
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:updated", data);
    });

    socket.on("employee:deleted", (data) => {
      console.log("👤 Employee deleted:", data);
      startTransition(() => {
        invalidateEmployeeQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        invalidateManagerDashboardQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        invalidateForecastQueries();
      });
      onEventRef.current?.("employee:deleted", data);
    });

    // Payroll events
    socket.on("payroll:period-created", (data) => {
      console.log("📅 Payroll period created:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:period-created", data);
    });

    socket.on("payroll:period-updated", (data) => {
      console.log("📅 Payroll period updated:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:period-updated", data);
    });

    socket.on("payroll:processed", (data) => {
      console.log("💰 Payroll processed:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:processed", data);
    });

    socket.on("payroll:entry-updated", (data) => {
      console.log("💵 Payroll entry updated:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
        queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      });
      onEventRef.current?.("payroll:entry-updated", data);
    });

    socket.on("payroll:sent", (data) => {
      console.log("📧 Payslip sent:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-payroll"] });
      });
      onEventRef.current?.("payroll:sent", data);
    });

    // Notification events
    socket.on("notification:created", (data) => {
      console.log("🔔 New notification:", data);
      startTransition(() => {
        invalidateNotifications();
        // Also refresh related data based on notification type
        const notif = data?.notification || data;
        if (notif?.type) {
          if (notif.type.includes('time_off')) invalidateTimeOffQueries();
          if (notif.type.includes('shift') || notif.type.includes('trade')) {
            invalidateShiftQueries();
            invalidateTradeQueries();
          }
        }
      });
      onEventRef.current?.("notification:created", data);
    });

    socket.on("notification", (data) => {
      console.log("🔔 Notification event:", data);
      startTransition(() => {
        invalidateNotifications();
      });
      onEventRef.current?.("notification", data);
    });

    // Audit log events - real-time updates for audit logs page
    socket.on("audit:created", (data) => {
      console.log("📝 New audit log:", data);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/audit-logs/stats"] });
      });
      onEventRef.current?.("audit:created", data);
    });

    // Invalidate custom query keys if provided
    socket.on("data-refresh-needed", () => {
      const keys = queryKeysRef.current;
      if (keys.length > 0) {
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    });

    // Only clean up on unmount if this is the last component using the socket
    // The socket will stay alive as a singleton
    return () => {
      // Don't disconnect - let the socket stay connected as singleton
      socketRef.current = null;
    };
  }, [enabled, currentUser?.id, queryClient]);

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );

  return { socket: socketRef.current, isConnected, emit };
}
