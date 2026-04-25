# P.E.R.O. Payroll System - Comprehensive User & Installation Manual

---

# Part 1: Installation & Setup Guide

This section outlines how to deploy the P.E.R.O. System to a local or production environment.

### Prerequisites
*   **Node.js** (v20 or higher)
*   **PostgreSQL** (Neon Database recommended)
*   **Git**

### 1. Clone the Repository
Open your terminal and clone the project:
```bash
git clone https://github.com/dennisjeanthompson/cuddly-sniffle.git
cd "cuddly-sniffle/The Cafe/The Cafe"
```

### 2. Install Dependencies
Run the following command to install all required Node modules:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your Neon Database connection string:
```env
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
SESSION_SECRET=your_secure_random_string
```

### 4. Database Initialization & Seeding
The system comes with an automated initialization script that pushes the schema, seeds required government deduction tables (SSS, PhilHealth), and creates the default Admin account.
```bash
npm run db:push
npm run dev
```
*Note: The first time `npm run dev` executes, it will automatically detect an empty database and seed the default branches, users, and compliance rules.*

---

# Part 2: User Manual

Welcome to the **P.E.R.O. (Payroll, Employee, Roster, and Operations) System**. This guide covers daily operations for Managers.

## 1. System Access & Dashboard

Upon navigating to the application URL (e.g., `http://localhost:5000`), you will be greeted by the secure login portal.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Login Page (`/login`) here, showing the username and password fields.]**

Once logged in as a Manager, you are directed to the **Manager Dashboard**. This acts as your command center, offering a consolidated view of today's schedule, pending requests, and key performance metrics. This page has been heavily optimized to load critical data instantly.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Manager Dashboard (`/dashboard`) here. Make sure the 4 statistical top cards (Today's Shifts, Weekly Hours, etc.) and the "Approvals & Requests" column are clearly visible.]**

## 2. Roster & Scheduling (Schedule V2)

The system utilizes an intuitive drag-and-drop unified schedule calendar.

1. Navigate to the **Schedule** tab on the left sidebar.
2. The UI renders complete week blocks natively (including Saturdays and Sundays).
3. Shift blocks explicitly display real-time windows (e.g., `9:00 AM – 6:56 PM`).

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Schedule grid (`/schedule`). Show a shift pill displaying the "h:mm AM/PM" format, and ensure the employee avatars on the left column are visible.]**

## 3. Exception Logs (The Secret to Payroll Accuracy)

Because the system engine relies on math, any deviations from the scheduled shift must be accurately logged and approved. 

Navigate to the **Exception Logs** page via the Requests Hub. 
*   **Lates**: Automatically deducts exact minutes from the base compensation.
*   **Breaks (Unpaid)**: Seamlessly deducts a designated period (e.g., 1 hour) from a continuous shift block without the need to manually split shifts in the schedule.
*   **Overtime**: Pays excess hours at DOLE-standard premium rates.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the "Log Exception" modal or dropdown menu, highlighting the newly added "Break (Unpaid)" and "Late" options.]**

## 4. Government Deductions & Compliance Settings

The system automatically calculates SSS, PhilHealth, Pag-IBIG, and Tax withholding—but it places control in your hands.

1. Navigate to **Settings > Deductions**.
2. You will see interactive toggle switches corresponding to each government mandate.
3. **Usage**: If you need to temporarily disable standard deductions for isolated testing, or if your specific branch is exempt from certain mandates, you can simply toggle the switches off. The payroll engine respects these branch-level settings instantly.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Deduction Settings page (`/settings/deductions`) showing the 4 interactive toggle switches actively displayed on the screen.]**

## 5. Payroll Processing & Digital Payslips

Everything culminates in the Payroll generation engine. 

1. Navigate to the **Payroll** tab.
2. Click **+ Generate Payroll**. 
3. The server automatically pulls the hours logged on the Schedule, subtracts the precise minutes documented in the Exception Logs (Lates/Breaks), applies any active Government Deductions via your toggle settings, and scales Holiday Multipliers (if the employee worked on a declared holiday).
4. Once generated, **Approve** the period to lock the math and release the digital payslips to the employee portals.

> **[IMAGE PLACEHOLDER: Insert a screenshot of an Employee's Digital Payslip. Ideally, showing the breakdown of Base Pay, Overtime, and exactly ₱0.00 for disabled deductions if toggled off.]**
