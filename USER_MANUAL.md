# P.E.R.O. Payroll System - User Manual

Welcome to the **P.E.R.O. (Payroll, Employee, Roster, and Operations) System**, the all-in-one platform for managing staff scheduling, attendance exceptions, government compliance, and payroll processing.

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Dashboard Navigation](#2-dashboard-navigation)
3. [Employee Management](#3-employee-management)
4. [Scheduling & Roster (Schedule V2)](#4-scheduling--roster-schedule-v2)
5. [Exception Logs (Lates, Breaks, & OT)](#5-exception-logs-lates-breaks--ot)
6. [Time Off & Shift Trades](#6-time-off--shift-trades)
7. [Deductions & Compliance Settings](#7-deductions--compliance-settings)
8. [Payroll Processing](#8-payroll-processing)
9. [Reports & Analytics](#9-reports--analytics)

---

## 1. Getting Started

### Roles & Access
*   **Admin / Manager**: Full access to scheduling, payroll generation, settings, and employee management.
*   **Staff / Employee**: Limited access to view personal schedules, digital payslips, request time off, and trade shifts.

### Logging In
1. Navigate to the system URL (e.g., `http://localhost:5000`).
2. Enter your unique **Username** and **Password**.
3. You will be routed to the Dashboard (Managers) or the Employee Portal (Staff).

---

## 2. Dashboard Navigation

The Manager Dashboard provides a high-level overview of daily operations:
*   **Today's Roster**: See who is scheduled to work today and their exact hours.
*   **Pending Approvals**: Review pending Time Off requests, Shift Trades, and Exception Logs waiting for manager approval.
*   **Quick Actions**: Shortcuts to generate payroll, create schedules, or add new employees.
*   **Payroll Stats**: Displays total gross pay, net pay, and total hours processed across all historical pay periods for the branch.

---

## 3. Employee Management

Navigate to the **Employees** tab on the left sidebar.
*   **Add Employee**: Click the "+ Add Employee" button. You will need to provide their Name, Job Title, Base Hourly Rate, and Government ID numbers (TIN, SSS, PhilHealth, Pag-IBIG).
*   **Edit Profiles**: Click on any employee card to update their basic information or adjust their hourly pay rate.
*   **Deactivate**: Employees who leave the company can be marked as "Inactive" to preserve their historical payroll records without showing up in active schedule grids.

---

## 4. Scheduling & Roster (Schedule V2)

The system features a streamlined drag-and-drop unified schedule.

### Viewing the Schedule
*   **Week View**: A desktop grid showing employees on the left and days of the week across the top.
*   **Time Formatting**: Shifts are displayed in full clarity (e.g., `9:00 AM – 6:56 PM (8.9h)`).
*   **Mobile View**: Automatically stacks the schedule into readable daily cards when viewed on a mobile device.

### Creating a Shift
1. Click the **+ Shift** button or click on any empty cell in the grid.
2. Select the Employee, and set the **Start Time** and **End Time**.
3. (Optional) Add internal notes for the shift (e.g., "Opening shift, check inventory").

---

## 5. Exception Logs (Lates, Breaks, & OT)

To maintain true-to-life payroll accuracy, all deviations from the standard schedule must be logged via **Exception Logs**.

### Exception Types:
*   **Tardiness (Late)**: Logs exactly how many minutes an employee was late based on their scheduled start time. This deducts from their base pay.
*   **Break (Unpaid)**: Automatically deducts break times (e.g., 1 hour) out of a continuous single-block shift.
*   **Regular Overtime (OT)**: Logs approved extra hours worked, paid at 125% of the base rate.
*   **Holiday Overtime**: Re-calculates hours worked on declared holidays at standard DOLE premium rates (up to 260% for Regular Holidays).

*Note: Exception logs must be approved by a Manager before they affect the final payroll calculation.*

---

## 6. Time Off & Shift Trades

Employees can submit requests directly from their portal. Managers review these in the **Requests Hub** (Inbox icon on the schedule).

*   **Time Off**: Employees request Vacation or Sick leaves. Approved time off visually blocks out the schedule grid to prevent accidental scheduling.
*   **Shift Trades**: An employee can offer their shift to a colleague. If the colleague accepts, the trade goes to the Manager for final approval. Once approved, the schedule automatically reassignment ownership of the shift.

---

## 7. Deductions & Compliance Settings

Navigate to **Settings > Deductions**.

The system handles standard Philippine DOLE/BIR compliance. By default, deductions are active.
*   **Interactive Toggles**: Managers can manually turn on or off specific government deductions (SSS, PhilHealth, Pag-IBIG, Withholding Tax) per branch. 
*   **When to Toggle**: If a branch operates with fewer than 10 employees, or if you are running an isolated test/adjustment payroll, you may choose to disable these deductions via the toggle switches. Changes apply instantly to all future payroll calculations.

### Holiday Compliance
Navigate to **Settings > Company**.
*   **Include Holiday Pay Rules**: A global switch that enables or disables premium pay (130%, 200%, 260%) for declared national holidays.

---

## 8. Payroll Processing

Navigate to the **Payroll** tab. The system automates calculations based on schedules, exceptions, and deductions.

### Generating Payroll
1. Click **+ Generate Payroll**.
2. Select the **Pay Period Configuration** (e.g., Semi-Monthly: 1st-15th, or 16th-End of Month).
3. Review the summary of generated entries. The system automatically pulls from approved Exception Logs to calculate exact Base Pay, Lateness Deductions, Overtime Pay, and net Deductions.
4. **Approve and Close**: Once finalized, approve the period. This locks the records and generates the digital payslips.

### Digital Payslips
Employees can view their fully itemized payslips from their mobile devices, showing basic pay, premium splits, and exact government contributions.

---

## 9. Reports & Analytics

Navigate to **Reports**.
*   Download comprehensive CSV and PDF reports outlining Labor Costs, Tax Withholding summaries, and SSS/PhilHealth contribution matrixes for easy government remittance filing.
*   **Forecast**: View projected labor costs for the upcoming scheduled week to maintain budget thresholds before costs are incurred.
