import { useEffect, useCallback, useRef, startTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { getCurrentUser } from "@/lib/auth";

interface UseRealtimeOptions {
  enabled?: boolean;
  queryKeys?: string[];
  onEvent?: (event: string, data: any) => void;
}

// Singleton socket instance to prevent multiple connections
let globalSocket: Socket | null = null;
let globalSocketUserId: string | null = null;

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { enabled = true, queryKeys = [], onEvent } = options;
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const currentUser = getCurrentUser();
  
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
      
      // If it was disconnected manually (or by network drop) and we're reusing it, attempt to reconnect
      if (globalSocket.disconnected) {
        globalSocket.connect();
      }
      return;
    }

    // Completely tear down existing socket only if the mapped userID has changed
    if (globalSocket && globalSocketUserId !== currentUser.id) {
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketUserId = null;
    }

    // Connect to WebSocket
    const socket = io({
      query: { userId: currentUser.id },
      auth: {
        token: localStorage.getItem("auth_token") || "",
      },
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      // Use polling first, then upgrade to websocket
      transports: ["polling", "websocket"],
      // Don't force a new connection on each creation
      forceNew: false,
    });

    globalSocket = socket;
    globalSocketUserId = currentUser.id;
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to real-time updates");
      // Subscribe to relevant events
      socket.emit("subscribe:employee-shifts");
      socket.emit("subscribe:shift-trades");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from real-time updates:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

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
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/hours/team-summary"] });
        // Mobile query keys
        queryClient.invalidateQueries({ queryKey: ["mobile-schedule-shifts"] });
        queryClient.invalidateQueries({ queryKey: ["mobile-shifts"] });
      });
    };

    const invalidateTimeOffQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
        // Mobile query keys
        queryClient.invalidateQueries({ queryKey: ["mobile-time-off"] });
      });
    };

    const invalidateTradeQueries = () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
        queryClient.invalidateQueries({ queryKey: ["/api/shift-trades"] });
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
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      });
      onEventRef.current?.("trade:approved", data);
    });

    // Time-off events
    socket.on("time-off:created", (data) => {
      console.log("📅 Time-off request created:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      });
      onEventRef.current?.("time-off:created", data);
    });

    socket.on("time-off:updated", (data) => {
      console.log("📅 Time-off request updated:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      });
      onEventRef.current?.("time-off:updated", data);
    });

    socket.on("time-off:approved", (data) => {
      console.log("✅ Time-off approved:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        invalidateShiftQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      });
      onEventRef.current?.("time-off:approved", data);
    });

    socket.on("time-off:rejected", (data) => {
      console.log("❌ Time-off rejected:", data);
      startTransition(() => {
        invalidateTimeOffQueries();
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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

    // Employee events - with automatic query refetch for immediate UI updates
    socket.on("employee:created", (data) => {
      console.log("👤 New employee created:", data);
      startTransition(() => {
        queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
        queryClient.refetchQueries({ queryKey: ["/api/employees"] });
        queryClient.refetchQueries({ queryKey: ["employees"] });
        queryClient.refetchQueries({ queryKey: ["employee-stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
      });
      onEventRef.current?.("employee:created", data);
    });

    socket.on("employee:updated", (data) => {
      console.log("👤 Employee updated:", data);
      startTransition(() => {
        queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
        queryClient.refetchQueries({ queryKey: ["/api/employees"] });
        queryClient.refetchQueries({ queryKey: ["employees"] });
        queryClient.refetchQueries({ queryKey: ["employee-stats"] });
      });
      onEventRef.current?.("employee:updated", data);
    });

    socket.on("employee:deleted", (data) => {
      console.log("👤 Employee deleted:", data);
      startTransition(() => {
        queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
        queryClient.refetchQueries({ queryKey: ["/api/employees"] });
        queryClient.refetchQueries({ queryKey: ["employees"] });
        queryClient.refetchQueries({ queryKey: ["employee-stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee-status"] });
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
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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

  const isConnected = socketRef.current?.connected ?? false;

  return { socket: socketRef.current, isConnected, emit };
}
