/**
 * API base URL helper.
 *
 * In development (same-origin), all API calls use relative paths like `/api/...`
 * so the Vite proxy or Express server handles them directly.
 *
 * In production with a split deployment (frontend on Vercel, backend on Render),
 * set the VITE_API_URL environment variable on Vercel to point to your Render backend:
 *   VITE_API_URL=https://your-backend.onrender.com
 *
 * All API calls will then be prefixed with that URL automatically.
 */
export const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_URL ?? '';
  if (!envUrl) return '';
  // Ensure the URL has a protocol if user entered a bare domain like "myapp.onrender.com"
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('//')) {
    return `https://${envUrl}`;
  }
  return envUrl;
})();

/**
 * Prepends the API base URL to a relative API path.
 * @param path  A path starting with `/api/...`
 * @returns     Full URL with the backend host if VITE_API_URL is set, or just the path.
 * @example
 *   apiUrl('/api/shifts') // → 'https://your-backend.onrender.com/api/shifts'
 */
export function apiUrl(path: string): string {
  if (API_BASE) {
    // Remove trailing slash from base and ensure path starts with /
    return `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}
