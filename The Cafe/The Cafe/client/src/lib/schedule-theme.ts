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

export const ROLE_COLORS: Record<string, RoleColor> = {
  // Barista / Senior Barista → soft teal
  barista: {
    bg: '#14B8A6',
    bgLight: '#CCFBF1',
    bgDark: '#115E59',
    text: '#FFFFFF',
    border: '#0D9488',
    label: 'Barista',
  },
  'senior barista': {
    bg: '#0891B2',
    bgLight: '#CFFAFE',
    bgDark: '#155E75',
    text: '#FFFFFF',
    border: '#0E7490',
    label: 'Senior Barista',
  },

  // Branch Manager → warm coffee brown
  'branch manager': {
    bg: '#92400E',
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    text: '#FFFFFF',
    border: '#78350F',
    label: 'Branch Manager',
  },
  manager: {
    bg: '#92400E',
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    text: '#FFFFFF',
    border: '#78350F',
    label: 'Manager',
  },
  'store manager': {
    bg: '#92400E',
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    text: '#FFFFFF',
    border: '#78350F',
    label: 'Store Manager',
  },
  administrator: {
    bg: '#78350F',
    bgLight: '#FEF3C7',
    bgDark: '#451A03',
    text: '#FFFFFF',
    border: '#451A03',
    label: 'Administrator',
  },

  // Cashier → soft amber
  cashier: {
    bg: '#D97706',
    bgLight: '#FEF9C3',
    bgDark: '#92400E',
    text: '#FFFFFF',
    border: '#B45309',
    label: 'Cashier',
  },

  // Kitchen Staff / Server → soft olive
  'kitchen staff': {
    bg: '#4D7C0F',
    bgLight: '#ECFCCB',
    bgDark: '#365314',
    text: '#FFFFFF',
    border: '#3F6212',
    label: 'Kitchen Staff',
  },
  server: {
    bg: '#7C3AED',
    bgLight: '#EDE9FE',
    bgDark: '#4C1D95',
    text: '#FFFFFF',
    border: '#6D28D9',
    label: 'Server',
  },

  // Shift Lead → deep green
  'shift lead': {
    bg: '#166534',
    bgLight: '#DCFCE7',
    bgDark: '#14532D',
    text: '#FFFFFF',
    border: '#15803D',
    label: 'Shift Lead',
  },
};

// Fallback for unknown roles
const DEFAULT_ROLE_COLOR: RoleColor = {
  bg: '#6B7280',
  bgLight: '#F3F4F6',
  bgDark: '#374151',
  text: '#FFFFFF',
  border: '#4B5563',
  label: 'Staff',
};

/**
 * Get role color by position/role string. Case-insensitive match.
 */
export function getRoleColor(position?: string | null, role?: string | null): RoleColor {
  const key = (position || role || '').toLowerCase().trim();
  if (!key) return DEFAULT_ROLE_COLOR;

  // Direct match
  if (ROLE_COLORS[key]) return ROLE_COLORS[key];

  // Partial match (e.g. "Senior Barista" contains "barista")
  for (const [roleKey, color] of Object.entries(ROLE_COLORS)) {
    if (key.includes(roleKey) || roleKey.includes(key)) return color;
  }

  return DEFAULT_ROLE_COLOR;
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
  const seenLabels = new Set<string>();
  const colors: RoleColor[] = [];

  for (const emp of employees) {
    const key = (emp.position || emp.role || '').toLowerCase().trim();
    if (!key) continue;
    const rc = getRoleColor(emp.position, emp.role);
    if (seenLabels.has(rc.label)) continue;
    seenLabels.add(rc.label);
    colors.push(rc);
  }

  return colors;
}
