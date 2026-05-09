/**
 * The Café — Schedule Design System (2026 Redesign)
 * 
 * Role-based color coding (never per-employee).
 * Coffee-shop aesthetic: warm beige/cream + coffee brown + subtle greens.
 * Inspired by 7shifts, Homebase, Deputy best practices.
 */

// ─── ROLE COLOR PALETTE ─────────────────────────────────────────────
// Colors are keyed by normalized role string. Each role gets ONE color.
// Employees are distinguished by name + initials avatar inside the block.
export interface RoleColor {
  /** Solid fill for shift blocks */
  bg: string;
  /** Lighter tint for backgrounds / hover states */
  bgLight: string;
  /** Dark mode tint */
  bgDark: string;
  /** Text on top of bg */
  text: string;
  /** Border accent */
  border: string;
  /** Human-readable label */
  label: string;
}

const PROFESSIONAL_SHIFT_COLOR: RoleColor = {
  bg: '#3B82F6',       // Modern Professional Blue (Blue 500)
  bgLight: '#EFF6FF',  // Pale blue background (Blue 50)
  bgDark: '#1E40AF',   // Deep blue for dark mode (Blue 800)
  text: '#FFFFFF',     // White text
  border: '#93C5FD',   // Soft blue border (Blue 300)
  label: 'Shift',
};

/**
 * Enforces a single unified professional shift color 
 * regardless of the employee's role/position.
 */
export function getRoleColor(position?: string | null, role?: string | null): RoleColor {
  return PROFESSIONAL_SHIFT_COLOR;
}

// ─── CAFÉ PALETTE ────────────────────────────────────────────────────
// Light mode: warm beige/cream. Dark mode: deep espresso tones.
export const CAFE_PALETTE = {
  light: {
    background: '#FBF8F4',       // warm cream
    surface: '#FFFFFF',           // card surface
    surfaceHover: '#F7F3ED',      // card hover
    border: '#E8E0D4',            // warm border
    borderSubtle: '#F0EBE3',      // very subtle divider
    text: '#3C2415',              // espresso text
    textSecondary: '#8B7355',     // muted brown
    textMuted: '#B8A68E',         // faint text
    accent: '#166534',            // deep green accent
    accentLight: '#DCFCE7',       // light green tint
    published: '#166534',         // green = published
    publishedBg: '#F0FDF4',       // published background
    draft: '#B45309',             // amber = draft
    draftBg: '#FFFBEB',           // draft background
    todayHighlight: '#FEF3C7',    // amber-50 for today column
    restDay: '#FEF2F2',           // red-50 for rest day
    headerBg: '#F5F0E8',          // warm header
  },
  dark: {
    background: '#1C1410',        // deep espresso
    surface: '#2A2018',           // dark card surface
    surfaceHover: '#342A1E',      // card hover
    border: '#3D3228',            // warm dark border
    borderSubtle: '#2E261C',      // very subtle divider
    text: '#F5EDE4',              // warm white text
    textSecondary: '#C4AA88',     // warm muted text
    textMuted: '#8B7355',         // faint text
    accent: '#34D399',            // emerald accent (bright for dark)
    accentLight: '#064E3B',       // dark green tint
    published: '#34D399',         // green = published
    publishedBg: '#064E3B',       // published background
    draft: '#FBBF24',             // amber = draft
    draftBg: '#451A03',           // draft background
    todayHighlight: 'rgba(251, 191, 36, 0.08)', // subtle amber
    restDay: 'rgba(239, 68, 68, 0.08)',          // subtle red
    headerBg: '#241C14',          // warm header
  },
} as const;

// ─── HOLIDAY COLORS (unchanged but refined) ─────────────────────────
export const HOLIDAY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  regular: { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', label: 'Regular Holiday' },
  special_non_working: { bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316', label: 'Special Non-Working' },
  special_working: { bg: 'rgba(234, 179, 8, 0.08)', border: '#eab308', label: 'Special Working' },
  company: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', label: 'Company Holiday' },
};

// ─── SHIFT TEMPLATES (unchanged) ────────────────────────────────────
export const SHIFT_TEMPLATES = {
  morning: { start: 7, end: 15, label: 'Morning (7 AM – 3 PM)' },
  afternoon: { start: 15, end: 23, label: 'Afternoon (3 PM – 11 PM)' },
  night: { start: 23, end: 7, label: 'Night (11 PM – 7 AM)' },
};

// ─── UNIQUE ROLE LIST (for legend) ──────────────────────────────────
export function getUniqueRoleColors(employees: Array<{ position?: string; role?: string }>): RoleColor[] {
  // Rainbow legend removed to match professional UI standards.
  return [];
}
