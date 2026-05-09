# P.E.R.O. Payroll System - Quick Reference Guide

The **P.E.R.O. (Payroll, Employee, Roster, and Operations) System** is a platform designed to automate attendance tracking, schedule management, and DOLE/BIR-compliant payroll generation.

## 1. Dashboard & Core Navigation
*   **Manager Dashboard**: Provides a real-time overview of today's roster, pending requests (time off, trades, exceptions), and branch payroll statistics (gross/net pay and hours).
*   **Employee Portal**: Allows staff to view their personal schedules, download digital payslips, and submit time off or shift trade requests.

## 2. Scheduling (Roster Management)
*   **Schedule V2 Interface**: Features a unified drag-and-drop weekly calendar.
*   **Creating Shifts**: Managers can click any empty cell to assign a standard shift (e.g., `9:00 AM – 6:56 PM`). The interface automatically flags scheduling conflicts and prevents booking on approved leaves or closed holidays.

## 3. Exception Logging (True-to-Life Adjustments)
To ensure automated payroll accuracy, any deviations from the scheduled shift must be logged and approved:
*   **Lates**: Deducts exact minutes from base pay if an employee clocks in past their start time.
*   **Breaks (Unpaid)**: Automatically deducts 1 hour from continuous daily shifts without requiring complex schedule-splitting.
*   **Overtime (OT)**: Rewards approved extra hours at 125% base rate (or up to 260% on special/regular holidays).

## 4. Government Compliance & Deductions
*   **Branch-Level Toggles**: Managers have full control over mandatory deductions via `Settings > Deductions`. SSS, PhilHealth, Pag-IBIG, and Withholding Tax can be toggled on/off instantly to accommodate small-business exemptions or isolated testing scenarios.
*   **Holiday Premium Engine**: Automatically multiplies base rates by 130%, 200%, or 260% based on the type of Philippine national holiday.

## 5. Payroll Processing & Digital Payslips
1.  **Generate**: Navigate to `Payroll > + Generate Payroll` and select the current cut-off period.
2.  **Calculate**: The engine automatically aggregates Base Pay, Exception Logs (OT/Lates/Breaks), and active Government Deductions.
3.  **Approve**: Once the manager finalizes the period, the system generates secure, itemized **Digital Payslips** that employees can immediately access from their mobile dashboards.
