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

export function logout() {
  setAuthState({ user: null, isAuthenticated: false });
}

import { useState, useEffect } from "react";
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

  return { ...state, refreshUser };
}
