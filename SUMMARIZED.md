# The Café — Payroll & Scheduling System

## Overview

**The Café** is a comprehensive, web-based payroll and employee scheduling management system purpose-built for Philippine café and restaurant operations. It handles everything from daily shift scheduling with drag-and-drop to fully compliant Philippine payroll processing (SSS, PhilHealth, Pag-IBIG, BIR withholding tax). The system supports multi-branch management, real-time updates via WebSocket, and role-based access for administrators, managers, and employees.

> **Live URL:** Deployed on [Render.com](https://render.com) as a single web service.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Material UI (MUI) v7, FullCalendar v6, Tailwind CSS, Recharts, @dnd-kit, Framer Motion |
| **Backend** | Node.js, Express 4, Socket.IO (real-time), Passport.js (session auth), bcrypt |
| **Database** | PostgreSQL (Neon serverless), Drizzle ORM |
| **Storage** | Cloudinary (employee profile photos) |
| **Deployment** | Render.com (web service), Vite + esbuild build pipeline |
| **Other** | TanStack React Query, Wouter (routing), React-to-Print, Zod (validation) |

---

## Main Features

### 1. Dashboard
- At-a-glance view of today's scheduled shifts, upcoming holidays, pending requests, and branch statistics.
- Quick-access cards for common actions (approve requests, view payroll, manage employees).

### 2. Schedule Management
- **Calendar Views:** Day, Week, Month, and Grid views powered by FullCalendar.
- **Drag & Drop Scheduling:** Managers can drag employees from the Roster sidebar directly onto the calendar to create shifts. Supports mobile tap-to-assign as well.
- **Draft / Published Modes:** Schedules start in Draft mode for editing. Once finalized, managers publish the schedule making it visible and locked for employees.
- **Shift Details:** Each shift includes start/end time, role assignment, and employee color-coding for visual clarity.
- **Copy Schedules:** Quickly duplicate a week's schedule to the next week.
- **Print Support:** Print-friendly layout for posting physical schedules.

### 3. Roster
- Sidebar panel listing all active employees with their roles and status indicators.
- Draggable employee cards for quick shift creation on desktop; tap-to-select on mobile.
- Visual indicators for inactive employees and published-schedule lock state.

### 4. Payroll Processing
- **Philippine Compliance:** Automatic computation of mandatory government contributions:
  - **SSS** (Social Security System) — bracket-based contributions
  - **PhilHealth** — percentage-based premium sharing
  - **Pag-IBIG** — monthly fund contributions
  - **BIR Withholding Tax** — graduated income tax table
- **Pay Period Management:** Semi-monthly or monthly payroll cycles.
- **Overtime, Holiday, & Night Differential Pay:** Automatic computation based on Philippine labor law rates.
- **13th Month Pay:** Automatic year-end computation.
- **Payslip Generation:** PDF payslips via server-side generation.
- **Payroll History & Audit Trail:** Complete records of every payroll run with change logs.

### 5. Employee Management
- Full CRUD for employee records: personal info, contact details, position, hire date, hourly/monthly rate.
- **Profile Photos:** Upload via Cloudinary integration.
- **Active/Inactive Status:** Soft-disable employees without deleting records.
- **Role Assignment:** Assign system roles (admin, manager, employee) and job positions (Barista, Senior Barista, Shift Lead, Branch Manager, Kitchen Staff, Cashier, Server, etc.).

### 6. Shift Trading
- Employees can request to trade shifts with coworkers.
- Real-time WebSocket notifications for trade requests and approvals.
- Manager approval workflow before trades are finalized.

### 7. Time-Off / Leave Requests
- Employees submit time-off requests with date range and reason.
- Managers approve or deny requests from a centralized queue.
- Approved time-off automatically blocks scheduling on those dates.
- Calendar integration shows approved leave days.

### 8. Holidays
- Philippine public holiday calendar management.
- Managers can add, edit, or remove holidays.
- Holidays affect payroll computation (holiday pay rates) and schedule display.
- Visual indicators on the schedule calendar for holiday dates.

### 9. Branch Management
- Multi-branch support: create and manage multiple café locations.
- Branch-specific schedules, employees, and payroll.
- Branch selector in the top navigation for quick switching.

### 10. Pay Summary
- Employee-facing view of their pay history, deductions breakdown, and net pay.
- Filterable by pay period.

### 11. Notifications
- Real-time in-app notifications via Socket.IO.
- Alerts for schedule changes, shift trade requests, time-off approvals/denials, and payroll availability.
- Notification badge with unread count.

### 12. Forecasting & Analytics
- Labor cost forecasting based on scheduled hours and pay rates.
- Visual charts (Recharts) for trends in labor costs, overtime, and staffing levels.
- Helps managers optimize scheduling decisions.

### 13. Deductions Management
- Configure custom deduction types (cash advances, uniform fees, etc.) beyond mandatory government contributions.
- Apply deductions to individual employees or in bulk.
- Deductions automatically reflected in payroll computation.

### 14. Export Reports
- Export payroll reports, schedules, and employee data to CSV.
- Print-ready schedule views via React-to-Print.

### 15. Profile Settings
- Users can update their own profile information, password, and notification preferences.
- Photo upload support.

### 16. Audit Logs & Compliance
- Comprehensive audit trail for payroll changes, schedule modifications, and employee record updates.
- Compliance dashboard for monitoring government contribution submissions.
- Adjustment logging for any manual payroll corrections.

### 17. Initial Setup & Onboarding
- First-run setup wizard for configuring the system: create admin account, set up first branch, and configure basic settings.

### 18. Mobile-Optimized Experience
- Fully responsive design with mobile-specific UX patterns.
- Swipeable drawers, bottom sheets, and touch-optimized controls.
- Mobile tap-to-assign scheduling workflow as alternative to drag-and-drop.

---

## User Roles & Permissions

The system uses three primary roles, each with distinct access levels:

### Administrator
| Area | Capabilities |
|------|-------------|
| **System Config** | Full system configuration, branch setup, initial onboarding |
| **Employee Management** | Create, edit, deactivate any employee across all branches |
| **Rate Management** | Set and modify hourly/monthly pay rates for all employees |
| **Payroll** | Full access to run, review, and adjust payroll for all branches |
| **Deductions** | Configure deduction types and government contribution settings |
| **Reports** | Access all reports, export data, view audit logs |
| **Holidays** | Manage the holiday calendar |
| **Branches** | Create and manage all branch locations |
| **Scheduling** | Full scheduling access (same as Manager) |

### Manager (Branch Manager)
| Area | Capabilities |
|------|-------------|
| **Scheduling** | Create, edit, publish, and copy schedules for their branch |
| **Roster** | View roster, drag-and-drop employees onto calendar |
| **Draft/Publish** | Toggle between Draft and Published schedule modes |
| **Shift Trades** | Approve or deny employee shift trade requests |
| **Time-Off** | Approve or deny employee leave requests |
| **Payroll** | Process payroll, generate payslips, view payroll history for their branch |
| **Employees** | View employee details, manage employees within their branch |
| **Forecasting** | Access labor cost forecasting and analytics |
| **Notifications** | Receive alerts for pending approvals and schedule conflicts |
| **Export** | Export schedules and payroll reports |

### Employee
| Area | Capabilities |
|------|-------------|
| **Schedule** | View their own published schedule (read-only) |
| **Shift Trades** | Request shift trades with coworkers |
| **Time-Off** | Submit time-off / leave requests |
| **Pay Summary** | View their own pay history, deductions, and payslips |
| **Profile** | Update personal information, password, and profile photo |
| **Notifications** | Receive alerts for schedule publications, trade responses, and pay availability |

---

## Database Schema

The system uses **18 PostgreSQL tables** managed via Drizzle ORM:

| Table | Purpose |
|-------|---------|
| `users` | Employee/user accounts with auth credentials, role, position, rates, branch assignment |
| `branches` | Café branch locations (name, address, contact) |
| `shifts` | Individual scheduled shifts (employee, date, start/end time, role, branch, status) |
| `schedules` | Weekly schedule metadata (branch, week start, published status) |
| `payroll` | Payroll run records (period, branch, status, totals) |
| `payroll_items` | Individual employee pay line items per payroll run |
| `deductions` | Deduction type definitions |
| `employee_deductions` | Deduction instances applied to specific employees |
| `holidays` | Holiday calendar entries |
| `time_off_requests` | Employee leave/time-off requests with approval status |
| `shift_trades` | Shift trade requests between employees |
| `notifications` | In-app notification records |
| `audit_logs` | System-wide audit trail |
| `adjustments` | Manual payroll adjustments |
| `forecasts` | Labor forecasting data |
| `settings` | System-wide configuration key-value pairs |
| `sessions` | Express session store for authentication |
| `blocked_dates` | Dates blocked from scheduling |

---

## Deployment

The application is deployed as a **single Render.com web service**:

- **Build:** `npm install && npm run build` (Vite frontend + esbuild backend)
- **Start:** `npm run start` (serves both API and static frontend)
- **Database:** PostgreSQL via Neon serverless (connection string in `DATABASE_URL`)
- **Environment Variables:**
  - `DATABASE_URL` — PostgreSQL connection string
  - `SESSION_SECRET` — Express session encryption key
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image upload config
  - `NODE_ENV` — Set to `production` for deployment

See [render.yaml](render.yaml) for the full deployment configuration.

---

## Project Structure

```
The Cafe/The Cafe/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # Page components (schedule, payroll, employees, etc.)
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       └── lib/             # Utilities, API client, constants
├── server/                  # Express backend
│   ├── routes.ts            # Main API routes
│   ├── routes/              # Modular route files
│   ├── services/            # Business logic (realtime, PDF, etc.)
│   ├── middleware/           # Auth, validation middleware
│   └── utils/               # Payroll computation, audit helpers
├── shared/                  # Shared types & schema
│   └── schema.ts            # Drizzle ORM database schema
├── migrations/              # Database migrations
├── package.json
├── vite.config.ts
├── drizzle.config.ts
└── render.yaml              # Render deployment config
```

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/dennisjeanthompson/cuddly-sniffle.git
   cd cuddly-sniffle/The\ Cafe/The\ Cafe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL, SESSION_SECRET, and Cloudinary credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the app** at `http://localhost:5000`

---

*Built for Philippine café and restaurant operations. Fully compliant with SSS, PhilHealth, Pag-IBIG, and BIR requirements.*
