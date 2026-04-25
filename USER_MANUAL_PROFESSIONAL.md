# User Manual: P.E.R.O. Payroll System

## 1. System Overview
The **P.E.R.O. (Payroll, Employee, Roster, and Operations) System** is a web-based application designed to streamline workforce scheduling, attendance tracking, and automated payroll generation in compliance with labor standards.

## 2. Accessing the System
1. Open a web browser and navigate to the designated system URL.
2. Enter your assigned **Username** and **Password** on the login screen.
3. Upon authentication, users are directed to either the **Manager Dashboard** (for administrative functions) or the **Employee Portal** (for viewing schedules and payslips).

## 3. Creating and Managing Schedules
The scheduling module allows managers to build and adjust the weekly roster.
1. Navigate to the **Schedule** tab on the left sidebar.
2. The grid displays employees alongside the days of the week. To add a shift, click on an empty cell corresponding to the employee and date.
3. Select the exact **Start Time** and **End Time** (e.g., 9:00 AM to 6:00 PM).
4. The system will automatically prevent scheduling on approved employee vacation days or closed company holidays.

## 4. Logging Attendance Exceptions
To ensure payroll precision, variations from the scheduled shift must be recorded via **Exception Logs**.
1. Navigate to the **Exception Logs** tab.
2. Select the employee and the date of the exception.
3. Choose the appropriate exception type:
   * **Late**: Deducts compensation based on the exact minutes an employee was tardy.
   * **Break (Unpaid)**: Deducts designated break hours from a continuous shift block.
   * **Overtime**: Rewards approved excess hours at the standard premium rate.
4. Managers must **Approve** these logs before they are calculated into the final payroll.

## 5. Configuring Government Deductions
The system handles mandatory government contributions (SSS, PhilHealth, Pag-IBIG) and tax withholding automatically.
1. Navigate to **Settings > Deductions**.
2. Managers can view the current deduction matrix and use the interactive toggle switches to enable or disable specific contributions for the entire branch.
3. Modifying these settings will immediately apply to all subsequent payroll calculations.

## 6. Processing Payroll and Payslips
Payroll calculations synthesize the schedules, approved exceptions, and active deductions into final compensation packages.
1. Navigate to the **Payroll** tab and click **+ Generate Payroll**.
2. Select the date range for the current cut-off period.
3. The system will display a draft computation for each employee. Review the calculated Gross Pay, Total Deductions, and Net Pay.
4. Click **Approve Period** to finalize the payroll.
5. Once approved, secure **Digital Payslips** are automatically generated and made available to employees via their personal portals.
