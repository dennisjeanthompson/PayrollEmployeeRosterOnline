# The Café — Schedule Page Redesign (2026)

> **Complete redesign** of the Schedule page from rainbow chaos → professional café scheduling tool.  
> Inspired by **7shifts + Homebase simplicity**, optimized for small teams (2–6 employees).

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Before → After Summary](#before--after-summary)
3. [Color Palette (Hex Values)](#color-palette)
4. [Role Color System](#role-color-system)
5. [Layout Wireframes (ASCII)](#wireframes)
6. [Component Changes](#component-changes)
7. [Files Modified](#files-modified)

---

## Design Philosophy

### Why the old design was confusing

| Problem | Root cause |
|---------|-----------|
| **Rainbow shift blocks** | Each *employee* got a random color (#F87171, #60A5FA, #A78BFA, …). With 5 employees you had 5 clashing colors that meant nothing. |
| **Dark mode was unreadable** | Black background + dark shift blocks + no text shadow = invisible text. |
| **Month view was cluttered** | Full employee names crammed into tiny cells. More than 2 shifts → visual overflow. |
| **No role identity** | Looking at the calendar, you couldn't tell if a slot was covered by a barista, cashier, or manager. |
| **Generic look** | Could have been any app. No café personality. |

### What the redesign fixes

1. **Role-based colors** — Every shift block's color tells you the *role*, not the *person*. Baristas are always teal; managers are always coffee-brown. Employees are identified by name + initials inside the block.
2. **Coffee-shop aesthetic** — Warm cream backgrounds, espresso text, subtle green accents. It *feels* like a café tool.
3. **Dark mode that works** — Deep espresso tones (#1C1410) instead of pure black. Text shadows on events. High-contrast role colors that glow against dark surfaces.
4. **Simplified views** — Month view shows colored dots + initials. Week view shows short names + times. Day view shows full detail.
5. **Role legend** — A row of color-coded chips at the top so new managers instantly know what each color means.
6. **Status indicators** — Green dot = working today, gray = off. Weekly hours displayed per employee.

---

## Before → After Summary

| Aspect | Before | After |
|--------|--------|-------|
| Shift block colors | 10-color rainbow per employee | Role-based (8 roles × 1 color each) |
| Default view | Month (desktop) / List (mobile) | Week (desktop) / Week (mobile) |
| Calendar initial view | `dayGridMonth` | `timeGridDay` |
| Background (light) | `#fafafa` (cool gray) | `#FBF8F4` (warm cream) |
| Background (dark) | `#0a0a0a` (pure black) | `#1C1410` (deep espresso) |
| Text color (dark) | `#fafafa` (cool white) | `#F5EDE4` (warm white) |
| Borders | Cool gray dividers | Warm coffee borders |
| Published/Draft toggle | Switch + label | Styled Chip (green/amber) |
| View mode button | Rainbow gradient border | Warm café-styled button |
| Roster sidebar | Plain list, rainbow dots | Role avatars, status dots, role badges, weekly hours |
| Tooltip | Default dark | Café-themed with role-colored time, initials avatar |
| MUI primary | `#10b981` (emerald) | `#166534` (deep forest green) |
| MUI secondary | `#8b5cf6` (violet) | `#92400E` (coffee brown) |

---

## Color Palette

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FBF8F4` | Page background (warm cream) |
| `surface` | `#FFFFFF` | Cards, panels, calendar container |
| `surfaceHover` | `#F7F3ED` | Hovered card/row |
| `border` | `#E8E0D4` | Panel borders, dividers |
| `borderSubtle` | `#F0EBE3` | Faint inner dividers |
| `text` | `#3C2415` | Primary text (espresso) |
| `textSecondary` | `#8B7355` | Muted labels |
| `textMuted` | `#B8A68E` | Faint captions |
| `accent` | `#166534` | CTA buttons, active states |
| `accentLight` | `#DCFCE7` | Accent backgrounds |
| `published` | `#166534` | Published badge |
| `publishedBg` | `#F0FDF4` | Published badge background |
| `draft` | `#B45309` | Draft badge |
| `draftBg` | `#FFFBEB` | Draft badge background |
| `todayHighlight` | `#FEF3C7` | Today column tint |
| `restDay` | `#FEF2F2` | Rest day tint |
| `headerBg` | `#F5F0E8` | Calendar header row |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#1C1410` | Page background (deep espresso) |
| `surface` | `#2A2018` | Cards, panels |
| `surfaceHover` | `#342A1E` | Hovered card/row |
| `border` | `#3D3228` | Warm dark borders |
| `borderSubtle` | `#2E261C` | Subtle dividers |
| `text` | `#F5EDE4` | Primary text (warm white) |
| `textSecondary` | `#C4AA88` | Muted text |
| `textMuted` | `#8B7355` | Faint text |
| `accent` | `#34D399` | Bright emerald accent |
| `accentLight` | `#064E3B` | Dark green tint |
| `published` | `#34D399` | Published badge |
| `publishedBg` | `#064E3B` | Published badge background |
| `draft` | `#FBBF24` | Draft badge |
| `draftBg` | `#451A03` | Draft badge background |
| `todayHighlight` | `rgba(251,191,36,0.08)` | Subtle amber today |
| `restDay` | `rgba(239,68,68,0.08)` | Subtle red rest day |
| `headerBg` | `#241C14` | Warm header |

---

## Role Color System

Every shift block is colored by the **employee's role**, not their index.

| Role | Background | Light Tint | Dark Tint | Border | Visual |
|------|-----------|------------|-----------|--------|--------|
| **Barista** | `#14B8A6` | `#CCFBF1` | `#115E59` | `#0D9488` | Soft teal |
| **Senior Barista** | `#0D9488` | `#CCFBF1` | `#134E4A` | `#0F766E` | Deep teal |
| **Branch Manager** | `#92400E` | `#FEF3C7` | `#78350F` | `#78350F` | Warm coffee brown |
| **Manager** | `#92400E` | `#FEF3C7` | `#78350F` | `#78350F` | Warm coffee brown |
| **Administrator** | `#78350F` | `#FEF3C7` | `#451A03` | `#451A03` | Dark espresso |
| **Cashier** | `#D97706` | `#FEF9C3` | `#92400E` | `#B45309` | Soft amber |
| **Kitchen Staff** | `#4D7C0F` | `#ECFCCB` | `#365314` | `#3F6212` | Olive green |
| **Server** | `#65A30D` | `#ECFCCB` | `#3F6212` | `#4D7C0F` | Bright olive |
| **Shift Lead** | `#166534` | `#DCFCE7` | `#14532D` | `#15803D` | Deep forest green |
| *Unknown* | `#6B7280` | `#F3F4F6` | `#374151` | `#4B5563` | Neutral gray |

### Why role colors > employee colors

```
BEFORE (per-employee rainbow):
┌──────────────────────────────────────┐
│ Mon  │ Tue  │ Wed  │ Thu  │ Fri     │
│ ████ │ ████ │ ████ │ ████ │ ████    │  ← 5 random colors
│ ████ │ ████ │ ████ │ ████ │ ████    │     NO meaning
│ ████ │      │ ████ │ ████ │         │
└──────────────────────────────────────┘
Q: "Is there a barista on Thursday?" → Can't tell at a glance

AFTER (role-based):
┌──────────────────────────────────────┐
│ Mon  │ Tue  │ Wed  │ Thu  │ Fri     │
│ ▓▓▓▓ │ ▓▓▓▓ │ ▓▓▓▓ │ ▓▓▓▓ │ ▓▓▓▓  │  ← teal = barista
│ ████ │ ████ │ ████ │ ████ │ ████    │  ← brown = manager
│ ░░░░ │      │ ░░░░ │ ░░░░ │        │  ← amber = cashier
└──────────────────────────────────────┘
Q: "Is there a barista on Thursday?" → See teal? Yes ✓
```

---

## Wireframes

### Day View (Default — what managers see first)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☕ Schedule  │  < May 28, 2025 >  │ [Day|Week|Month]  │ 🟢 Published │
│──────────────┤─────────────────────┤───────────────────┤──────────────│
│  [Legend: ● Barista  ● Manager  ● Cashier  ● Kitchen  ● Server]       │
├─────────┬───────────────────────────────────────────────────────────────┤
│ ROSTER  │                                                               │
│         │  7 AM  ┌──────────────────────────────────┐                   │
│ ┌─────┐ │        │  🟢 Ana M.                        │                  │
│ │ AM  │ │        │  ─────────────────────────────────│                  │
│ │ 🟢  │ │  8 AM  │  (AM)  ● Barista  7:00a–3:00p   │                  │
│ │Ana M│ │        │  8.0 hrs                          │                  │
│ │Barst│ │        └──────────────────────────────────┘                   │
│ │32h  │ │                                                               │
│ └─────┘ │  9 AM  ┌──────────────────────────────────┐                   │
│         │        │  🟢 Carlos R.                     │                  │
│ ┌─────┐ │        │  (CR)  ● Branch Manager           │                  │
│ │ CR  │ │ 10 AM  │  9:00a–5:00p  8.0 hrs            │                  │
│ │ ⚫  │ │        └──────────────────────────────────┘                   │
│ │Carlo│ │                                                               │
│ │Mgr  │ │  ...                                                          │
│ │40h  │ │                                                               │
│ └─────┘ │                                                               │
├─────────┴───────────────────────────────────────────────────────────────┤
│  Weekly Hours: Ana 32h · Carlos 40h · May 24h                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Week View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☕ Schedule  │  < Week of May 26 >  │ [Day|Week|Month]                 │
├─────────┬────┬────┬────┬────┬────┬────┬────┬────────────────────────────┤
│ ROSTER  │    │Mon │Tue │Wed │Thu │Fri │Sat │Sun                         │
│         │    │ 26 │ 27 │ 28 │ 29 │ 30 │ 31 │  1                        │
│ ┌─────┐ │7am│    │    │    │    │    │    │                             │
│ │ AM  │ │   │┌──┐│┌──┐│┌──┐│┌──┐│┌──┐│    │        Short name          │
│ │Ana M│ │8am││AM ││AM ││AM ││AM ││AM ││    │        + time range        │
│ └─────┘ │   ││7-3││7-3││7-3││7-3││7-3││    │        Role-colored bg     │
│         │9am│└──┘│└──┘│└──┘│└──┘│└──┘│    │                             │
│ ┌─────┐ │   │    │    │    │    │    │    │                             │
│ │ CR  │ │   │┌──┐│┌──┐│┌──┐│┌──┐│┌──┐│    │                             │
│ │Carlo│ │   ││CR ││CR ││CR ││CR ││CR ││    │                             │
│ └─────┘ │   ││9-5││9-5││9-5││9-5││9-5││    │                             │
│         │   │└──┘│└──┘│└──┘│└──┘│└──┘│    │                             │
├─────────┴───┴────┴────┴────┴────┴────┴────┴────────────────────────────┤
│  [Legend: ● Barista  ● Manager  ● Cashier]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Month View (Simplified)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☕ Schedule  │  < May 2025 >  │ [Day|Week|Month]                       │
├────────┬────────┬────────┬────────┬────────┬────────┬────────┬─────────┤
│  Mon   │  Tue   │  Wed   │  Thu   │  Fri   │  Sat   │  Sun   │         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┤         │
│   5    │   6    │   7    │   8    │   9    │  10    │  11    │         │
│ ●AM 7a │ ●AM 7a │ ●AM 7a │ ●AM 7a │ ●AM 7a │        │        │         │
│ ●CR 9a │ ●CR 9a │ ●CR 9a │ ●CR 9a │ ●CR 9a │        │        │         │
│ ●MP 2p │        │ ●MP 2p │        │ ●MP 2p │        │        │         │
│        │        │        │        │        │        │        │         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┤         │
│  12    │  13    │  ...                                       │         │
│        │        │                                            │         │
│  ● = colored dot (role color)                                │         │
│  AM = initials  7a = start time                              │         │
└────────┴────────┴────────────────────────────────────────────┴─────────┘
```

### Roster Sidebar (Desktop)

```
┌────────────────────┐
│  Roster          ✕ │
├────────────────────┤
│                    │
│  ┌──────────────┐  │
│  │ [AM] Ana M.  │  │
│  │ 🟢 ● Barista │  │
│  │     32h/week │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │ [CR] Carlos  │  │
│  │ 🟢 ● Manager │  │
│  │     40h/week │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │ [MP] May P.  │  │
│  │ ⚫ ● Cashier │  │
│  │     24h/week │  │
│  └──────────────┘  │
│                    │
│ 🟢 = working today │
│ ⚫ = day off       │
├────────────────────┤
│ Drag to calendar   │
│ to create a shift  │
└────────────────────┘
```

---

## Component Changes

### 1. New File: `client/src/lib/schedule-theme.ts`

Centralized design system containing:
- `ROLE_COLORS` — 8-role color map with bg/bgLight/bgDark/text/border for each
- `getRoleColor(position, role)` — case-insensitive lookup with partial-match fallback
- `CAFE_PALETTE` — full light + dark mode token set (17 tokens each)
- `HOLIDAY_COLORS` — holiday type → color map
- `SHIFT_TEMPLATES` — morning/afternoon/night presets
- `getUniqueRoleColors(employees)` — generates de-duped role legend from employee list

### 2. Modified: `client/src/pages/mui-schedule.tsx`

| Area | Change |
|------|--------|
| **Imports** | Added `getRoleColor`, `getUniqueRoleColors`, `CAFE_PALETTE`, etc. from schedule-theme |
| **getEmployeeColor()** | Now calls `getRoleColor(employee.position, employee.role)` instead of indexing `EMPLOYEE_COLORS` |
| **Default view** | Changed from `isDesktop ? 'timeline' : 'list'` to `'week'` |
| **Initial FullCalendar view** | Changed from `dayGridMonth` to `timeGridDay` |
| **Month event render** | Initials circle + 8px role-colored dot + start time pill |
| **Week event render** | 18px initials avatar + short name + time on single line |
| **Day event render** | 28px avatar + full name + role badge pill + time + hours duration |
| **CSS `<style>` block** | Replaced ~200 lines: warm borders, coffee-tinted slots, amber now-indicator, text-shadow on events, dark mode high-contrast overrides |
| **Main container** | `bgcolor` → `#1C1410` (dark) / `#FBF8F4` (light) |
| **Toolbar** | Warm border + café surface colors + espresso text |
| **Published/Draft** | `FormControlLabel+Switch` → styled `Chip` (green/amber) |
| **View mode button** | Rainbow gradient border → warm café border |
| **Role legend** | NEW — row of `Chip` pills with role-colored dots from `getUniqueRoleColors()` |
| **Desktop roster** | Role-based avatar colors, green/gray status dots, role badge Chips, weekly hours |
| **Mobile roster** | Same updates — `getRoleColor()` instead of `EMPLOYEE_COLORS[index]` |
| **Tooltip** | Café-themed dark popup with role-colored time, initials avatar |
| **Weekly hours card** | Warm styling with café surface colors |

### 3. Modified: `client/src/components/mui/mui-theme-provider.tsx`

| Token | Before | After |
|-------|--------|-------|
| `primary.main` | `#10b981` (emerald) | `#166534` (deep forest green) |
| `secondary.main` | `#8b5cf6` (violet) | `#92400E` (coffee brown) |
| `background.default` (dark) | `#0a0a0a` | `#1C1410` |
| `background.default` (light) | `#fafafa` | `#FBF8F4` |
| `background.paper` (dark) | `#171717` | `#2A2018` |
| `background.paper` (light) | `#ffffff` | `#FFFFFF` |
| `text.primary` (dark) | `#fafafa` | `#F5EDE4` |
| `text.primary` (light) | `#0a0a0a` | `#3C2415` |
| `text.secondary` (dark) | `#a1a1aa` | `#C4AA88` |
| `text.secondary` (light) | `#71717a` | `#8B7355` |
| `info.main` | blue | `#0D9488` (teal) |

---

## Design Explanation

### Why this works for a 2–6 person café

1. **Role = color** means the schedule is scannable in <2 seconds. A manager glances at the week and instantly sees "we have teal (barista) coverage every morning and brown (manager) every afternoon."

2. **Warm palette** builds brand identity. The deep espresso dark mode and cream light mode feel distinctly *café* — not generic corporate. Employees and managers feel ownership.

3. **Day view as default** solves the original complaint: "dark mode was hard to see in month view." Day view has the most space per shift block, making text always readable. The user can still switch to week/month.

4. **Status dots** (green = working, gray = off) answer the #1 question a small café manager asks: "who's here today?"

5. **Weekly hours** in the roster prevent accidental overtime in a small team where everyone wears multiple hats.

6. **Role legend chips** eliminate the learning curve for new staff. No need to memorize — the legend is always visible at the top of the toolbar.

7. **Simplified month view** (dots + initials instead of full names) prevents the visual clutter that made the old month view unusable with more than 3 employees per day.

---

*Generated for The Café scheduling tool redesign, 2025.*
