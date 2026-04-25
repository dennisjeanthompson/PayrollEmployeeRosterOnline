/**
 * Transition-aware location hook for Wouter.
 * 
 * Wraps Wouter's setLocation in React.startTransition so that
 * lazy-loaded route components can suspend without React throwing
 * the "synchronous input" error or replacing the UI with a fallback.
 */
import { useLocation as useWouterLocation } from "wouter";
import { startTransition, useCallback } from "react";

type NavigateOptions = Parameters<ReturnType<typeof useWouterLocation>[1]>[1];

export function useTransitionLocation() {
  const [location, setLocation] = useWouterLocation();

  const navigate = useCallback(
    (to: string, options?: NavigateOptions) => {
      startTransition(() => {
        setLocation(to, options);
      });
    },
    [setLocation]
  );

  return [location, navigate] as const;
}
