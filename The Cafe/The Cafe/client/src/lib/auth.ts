import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

let authState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const listeners: Set<(state: AuthState) => void> = new Set();

// Branch switch listeners (separate from auth state listeners)
const branchSwitchListeners: Set<(branchId: string) => void> = new Set();

export function getAuthState(): AuthState {
  return authState;
}

export function setAuthState(newState: Partial<AuthState>) {
  authState = { ...authState, ...newState };
  listeners.forEach(listener => listener(authState));
}

export function subscribeToAuth(listener: (state: AuthState) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function onBranchSwitch(listener: (branchId: string) => void) {
  branchSwitchListeners.add(listener);
  return () => { branchSwitchListeners.delete(listener); };
}

export function isManager(): boolean {
  return authState.user?.role === "manager" || authState.user?.role === "admin";
}

export function isAdmin(): boolean {
  return authState.user?.role === "admin";
}

export function isManagerOnly(): boolean {
  return authState.user?.role === "manager";
}

export function isEmployee(): boolean {
  return authState.user?.role === "employee";
}

export function getCurrentUser(): User | null {
  return authState.user;
}

export function getActiveBranchId(): string | undefined {
  return authState.user?.branchId;
}

export function logout() {
  setAuthState({ user: null, isAuthenticated: false });
}

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "./queryClient";

export function useAuth() {
  const [state, setState] = useState(getAuthState());

  useEffect(() => {
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
      console.error("Failed to refresh user", err);
    }
  };

  /**
   * Switch the active branch for the current session.
   * This updates the server session and refreshes all client-side data.
   * Only available to managers and admins.
   */
  const switchBranch = useCallback(async (branchId: string): Promise<boolean> => {
    try {
      const res = await apiRequest("PUT", "/api/auth/switch-branch", { branchId });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to switch branch");
      }

      // Update client-side auth state with new branchId
      const currentUser = getAuthState().user;
      if (currentUser) {
        setAuthState({
          user: { ...currentUser, branchId } as User,
          isAuthenticated: true,
        });
      }

      // Notify all branch switch listeners
      branchSwitchListeners.forEach(listener => listener(branchId));

      // Persist selection for auto-detect on next visit
      try { localStorage.setItem('lastBranchId', branchId); } catch {}

      return true;
    } catch (err) {
      console.error("Failed to switch branch:", err);
      return false;
    }
  }, []);

  return { ...state, refreshUser, switchBranch };
}

/**
 * Hook to react to branch switches across the app.
 * Usage: useBranchSwitch(() => { refetchData(); });
 */
export function useBranchSwitch(callback: (branchId: string) => void) {
  useEffect(() => {
    const unsub = onBranchSwitch(callback);
    return unsub;
  }, [callback]);
}
