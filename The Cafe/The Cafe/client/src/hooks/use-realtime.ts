import { useEffect, useCallback, useRef } from "react";
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

    // If there's already a global socket for this user, reuse it
    if (globalSocket && globalSocketUserId === currentUser.id && globalSocket.connected) {
      socketRef.current = globalSocket;
      return;
    }

    // Disconnect existing socket if user changed
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

    // Shift events
    socket.on("shift:created", (data) => {
      console.log("📍 New shift created:", data);
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      onEventRef.current?.("shift:created", data);
    });

    socket.on("shift:updated", (data) => {
      console.log("🔄 Shift updated:", data);
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      onEventRef.current?.("shift:updated", data);
    });

    socket.on("shift:deleted", (data) => {
      console.log("🗑️ Shift deleted:", data);
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      onEventRef.current?.("shift:deleted", data);
    });

    // Trade events
    socket.on("trade:created", (data) => {
      console.log("📨 New trade request:", data);
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      onEventRef.current?.("trade:created", data);
    });

    socket.on("trade:status-changed", (data) => {
      console.log("📝 Trade status changed:", data);
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      onEventRef.current?.("trade:status-changed", data);
    });

    // Availability events
    socket.on("availability:updated", (data) => {
      console.log("👥 Availability updated:", data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onEventRef.current?.("availability:updated", data);
    });

    // Employee events - with automatic query refetch for immediate UI updates
    socket.on("employee:created", (data) => {
      console.log("👤 New employee created:", data);
      queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employee-stats"] });
      onEventRef.current?.("employee:created", data);
    });

    socket.on("employee:updated", (data) => {
      console.log("👤 Employee updated:", data);
      queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employee-stats"] });
      onEventRef.current?.("employee:updated", data);
    });

    socket.on("employee:deleted", (data) => {
      console.log("👤 Employee deleted:", data);
      // Refetch all employee-related queries for immediate UI update
      queryClient.refetchQueries({ queryKey: ["/api/hours/all-employees"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees"] });
      queryClient.refetchQueries({ queryKey: ["employees"] });
      queryClient.refetchQueries({ queryKey: ["employee-stats"] });
      onEventRef.current?.("employee:deleted", data);
    });

    // Payroll events
    socket.on("payroll:period-created", (data) => {
      console.log("📅 Payroll period created:", data);
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      onEventRef.current?.("payroll:period-created", data);
    });

    socket.on("payroll:period-updated", (data) => {
      console.log("📅 Payroll period updated:", data);
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      onEventRef.current?.("payroll:period-updated", data);
    });

    socket.on("payroll:processed", (data) => {
      console.log("💰 Payroll processed:", data);
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
      queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      onEventRef.current?.("payroll:processed", data);
    });

    socket.on("payroll:entry-updated", (data) => {
      console.log("💵 Payroll entry updated:", data);
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-entries-branch"] });
      queryClient.invalidateQueries({ queryKey: ["current-payroll-period"] });
      onEventRef.current?.("payroll:entry-updated", data);
    });

    socket.on("payroll:sent", (data) => {
      console.log("📧 Payslip sent:", data);
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      onEventRef.current?.("payroll:sent", data);
    });

    // Notification events
    socket.on("notification:created", (data) => {
      console.log("🔔 New notification:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onEventRef.current?.("notification:created", data);
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
