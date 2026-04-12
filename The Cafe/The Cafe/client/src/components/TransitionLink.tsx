/**
 * Transition-aware Link component for Wouter.
 * 
 * Drop-in replacement for Wouter's <Link> that wraps navigation in
 * React.startTransition so lazy-loaded routes can suspend without
 * React replacing the UI with the Suspense fallback.
 */
import React, { startTransition, useCallback } from "react";
import { useLocation } from "wouter";

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  replace?: boolean;
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, children, replace, onClick, ...rest }, ref) => {
    const [, setLocation] = useLocation();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Let modifier-key clicks through for open-in-new-tab, etc.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        onClick?.(e);
        startTransition(() => {
          setLocation(href, { replace });
        });
      },
      [href, replace, setLocation, onClick]
    );

    return (
      <a ref={ref} href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }
);

TransitionLink.displayName = "TransitionLink";

export default TransitionLink;
