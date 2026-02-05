# The Café POS & Payroll System - Tech Stack

> Philippine-compliant payroll and employee scheduling system with modern React frontend and Express backend.

---

## 🏗️ Core Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI framework with type safety |
| **Build Tool** | Vite 7 | Fast HMR and bundling |
| **Backend** | Express 4 + TypeScript | REST API server |
| **Database** | PostgreSQL (Neon Serverless) | Cloud-native database |
| **ORM** | Drizzle ORM | Type-safe SQL queries |
| **Real-time** | Socket.IO + WebSockets | Live updates (shifts, payroll) |

---

## 🎨 UI Component Libraries

### Primary: Material UI (MUI) v7
Main design system for desktop and admin interfaces.

```
@mui/material          - Core components (Button, Dialog, Card, etc.)
@mui/x-data-grid       - Advanced data tables with sorting/filtering
@mui/x-date-pickers    - Date/time pickers with localization
@mui/icons-material    - 2000+ Material Design icons
```

### Secondary: Radix UI + shadcn/ui
Headless primitives for custom, accessible components.

| Component | Package |
|-----------|---------|
| Dialog, Alert Dialog | `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog` |
| Dropdown, Context Menu | `@radix-ui/react-dropdown-menu`, `@radix-ui/react-context-menu` |
| Popover, Tooltip | `@radix-ui/react-popover`, `@radix-ui/react-tooltip` |
| Select, Checkbox, Switch | `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch` |
| Tabs, Accordion | `@radix-ui/react-tabs`, `@radix-ui/react-accordion` |
| Scroll Area, Slider | `@radix-ui/react-scroll-area`, `@radix-ui/react-slider` |
| Toast, Progress | `@radix-ui/react-toast`, `@radix-ui/react-progress` |
| Avatar, Badge, Label | `@radix-ui/react-avatar`, `@radix-ui/react-label` |
| Navigation Menu, Menubar | `@radix-ui/react-navigation-menu`, `@radix-ui/react-menubar` |
| Hover Card, Collapsible | `@radix-ui/react-hover-card`, `@radix-ui/react-collapsible` |
| Toggle, Toggle Group | `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group` |
| Radio Group, Separator | `@radix-ui/react-radio-group`, `@radix-ui/react-separator` |
| Aspect Ratio | `@radix-ui/react-aspect-ratio` |

---

## 📅 Calendar & Scheduling

| Library | Version | Purpose |
|---------|---------|---------|
| **FullCalendar** | 6.1.19 | Main schedule calendar |
| ├─ `@fullcalendar/react` | | React wrapper |
| ├─ `@fullcalendar/daygrid` | | Month view |
| ├─ `@fullcalendar/timegrid` | | Week/Day views |
| ├─ `@fullcalendar/list` | | List view |
| ├─ `@fullcalendar/interaction` | | Drag-and-drop |
| └─ `@fullcalendar/resource-timeline` | | Resource scheduling |
| **DayPilot Lite** | 3.20.0 | Scheduler widget |
| **react-day-picker** | 8.10.1 | Date picker component |
| **react-datepicker** | 9.0.0 | Date input |

---

## 📊 Data & State Management

| Library | Purpose |
|---------|---------|
| **@tanstack/react-query** | Server state, caching, real-time sync |
| **react-hook-form** | Form state management |
| **@hookform/resolvers** | Zod validation integration |
| **Zod** | Schema validation |

---

## 🎯 Drag & Drop

| Library | Purpose |
|---------|---------|
| `@dnd-kit/core` | Core drag-and-drop engine |
| `@dnd-kit/sortable` | Sortable lists |
| `@dnd-kit/utilities` | Helper utilities |

---

## 📈 Charts & Analytics

| Library | Purpose |
|---------|---------|
| **Recharts** | Charts (Bar, Line, Pie, Area) |

---

## 📄 PDF Generation

| Library | Purpose |
|---------|---------|
| **jsPDF** | Client-side PDF creation |
| **jspdf-autotable** | Table generation for PDF |
| **@react-pdf/renderer** | React component-based PDFs |
| **pdf-lib** | PDF manipulation |
| **QRCode** | QR code generation for payslips |

---

## 🎨 Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS 3.4** | Utility-first CSS |
| **tailwindcss-animate** | Animation utilities |
| **@emotion/react** | CSS-in-JS (MUI requirement) |
| **@emotion/styled** | Styled components |
| **class-variance-authority** | Variant component styling |
| **clsx** + **tailwind-merge** | Class name utilities |

---

## 🔀 Routing & Navigation

| Library | Purpose |
|---------|---------|
| **Wouter** | Lightweight client-side routing |

---

## ⚡ Animation

| Library | Purpose |
|---------|---------|
| **Framer Motion** | Declarative animations |
| **tw-animate-css** | Tailwind animation utilities |

---

## 🔒 Authentication

| Library | Purpose |
|---------|---------|
| **Passport.js** | Authentication middleware |
| **passport-local** | Username/password strategy |
| **bcrypt** | Password hashing |
| **express-session** | Session management |
| **connect-pg-simple** | PostgreSQL session store |

---

## 🌐 Real-time Communication

| Library | Purpose |
|---------|---------|
| **Socket.IO** | WebSocket server |
| **socket.io-client** | WebSocket client |
| **ws** | Raw WebSocket support |

---

## ⛓️ Blockchain (Optional)

| Library | Purpose |
|---------|---------|
| **ethers** | Ethereum interaction |
| **web3** | Web3 utilities |

---

## 📅 Date/Time Utilities

| Library | Purpose |
|---------|---------|
| **date-fns** | Date manipulation |
| **dayjs** | Lightweight date library |

---

## 🔔 Notifications

| Library | Purpose |
|---------|---------|
| **react-toastify** | Toast notifications |
| **Radix Toast** | Custom toast component |

---

## 🛠️ Development Tools

| Tool | Purpose |
|------|---------|
| **TypeScript 5.6** | Static typing |
| **Vite 7** | Dev server & bundler |
| **tsx** | TypeScript execution |
| **esbuild** | Fast bundling |
| **drizzle-kit** | Database migrations |
| **Vitest** | Unit testing |

---

## 🗂️ Project Structure

```
The Cafe/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/              # 58 Radix/shadcn components
│       │   ├── mui/             # 8 MUI layout components
│       │   ├── calendar/        # Calendar components
│       │   ├── employees/       # Employee management
│       │   ├── payroll/         # Payslip components
│       │   ├── schedule/        # Shift scheduling
│       │   └── shift-trading/   # Trade requests
│       ├── pages/               # 28 page components
│       │   ├── mui-*.tsx        # Desktop pages (MUI)
│       │   └── mobile-*.tsx     # Mobile pages
│       ├── hooks/               # Custom React hooks
│       └── lib/                 # Utilities & API
├── server/
│   ├── routes/                  # API endpoints
│   ├── utils/                   # Server utilities
│   └── db.ts                    # Database connection
└── shared/                      # Shared types & schemas
```

---

## 📱 Custom UI Components (58)

### Form Elements
`button`, `input`, `textarea`, `checkbox`, `radio-group`, `select`, `switch`, `slider`, `input-otp`, `form`, `label`

### Layout
`card`, `dialog`, `sheet`, `drawer`, `tabs`, `accordion`, `collapsible`, `resizable`, `sidebar`, `separator`, `scroll-area`

### Feedback
`alert`, `alert-dialog`, `toast`, `toaster`, `progress`, `skeleton`, `loading`, `loading-skeleton`, `empty-state`

### Navigation
`navigation-menu`, `menubar`, `dropdown-menu`, `context-menu`, `breadcrumb`, `pagination`, `command`

### Data Display
`table`, `data-table`, `badge`, `avatar`, `calendar`, `chart`, `stat-card`, `tooltip`, `hover-card`, `popover`

### Actions
`toggle`, `toggle-group`, `floating-action-button`, `quick-action-button`, `confirm-dialog`

### Specialized
`modern-date-picker`, `modern-notifications`, `carousel`, `page-header`, `aspect-ratio`

---

## 📄 Pages (28)

### Desktop (MUI-based)
- `mui-dashboard` - Main dashboard
- `mui-schedule` - Calendar & shift management
- `mui-employees` - Employee CRUD
- `mui-payroll` - Employee payroll view
- `mui-payroll-management` - Admin payroll processing
- `mui-notifications` - Notification center
- `mui-shift-trading` - Trade requests
- `mui-time-off` - Leave management
- `mui-branches` - Branch management
- `mui-reports` - Report generation
- `mui-analytics` - Business analytics
- `mui-deduction-settings` - Employee deductions
- `mui-admin-deduction-rates` - SSS/PhilHealth/Pag-IBIG rates
- `mui-audit-logs` - System audit trail
- `mui-compliance-dashboard` - Compliance monitoring
- `mui-holiday-calendar` - Philippine holidays
- `mui-login` - Authentication
- `setup` - Initial system setup

### Mobile (React Native-style)
- `mobile-dashboard` - Employee home
- `mobile-schedule` - View shifts
- `mobile-payroll` - View payslips
- `mobile-clock` - Time in/out
- `mobile-notifications` - Push notifications
- `mobile-shift-trading` - Trade shifts
- `mobile-time-off` - Request leave
- `mobile-profile` - Edit profile
- `mobile-more` - Settings & more

---

## 🇵🇭 Philippine Compliance

- **SSS 2025 contribution tables** - Auto-calculated
- **PhilHealth rates** - Based on salary bracket
- **Pag-IBIG mandatory contributions** - 2% employee, 2% employer
- **Withholding tax computation** - BIR tax tables
- **13th month pay** - Auto-computed
- **Holiday pay premiums** - Regular (200%) and Special (130%)
- **Night differential** - 10% premium (10PM-6AM)
- **Overtime computation** - 25% regular, 30% rest day

---

*Last updated: December 2025*
