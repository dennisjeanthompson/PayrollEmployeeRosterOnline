# Appendix A: P.E.R.O. System User Manual

This section details the operational workflow of the Payroll, Employee, Roster, and Operations (P.E.R.O.) System, specifically designed for managerial use.

## A.1 System Access and Authentication

The system emphasizes secure role-based access control. All administrative and managerial operations begin at the secure login gateway.

1. Navigate to the application portal.
2. Enter the designated managerial credentials.
3. Click the "Sign In" button to access the secure session.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Login Page here. Ensure the username/password text fields and the "Sign In" button are clearly visible.]**

## A.2 Manager Dashboard and Analytics

Upon successful authentication, the user is redirected to the Manager Dashboard. This interface serves as the central command hub, offering real-time analytics.

The dashboard displays four key statistical cards:
*   Total Shifts Today
*   Pending Approvals
*   Total Weekly Hours
*   Total Monthly Hours

> **[IMAGE PLACEHOLDER: Insert a screenshot of the entire Manager Dashboard. Make sure the four statistical top cards are visible at the top, along with the "Pending Approvals" list below them.]**

## A.3 Schedule and Roster Management

The Schedule module acts as the definitive source of truth for the payroll engine's base calculations.

1. Navigate to the **Schedule** tab on the sidebar.
2. The calendar UI displays employee shifts natively across the entire week, including weekends.
3. Each scheduled shift displays the exact time parameter (e.g., `9:00 AM – 6:56 PM`).

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Schedule V2 grid. Ensure the shift pills with the full time format (h:mm AM/PM) are visible across the days of the week.]**

## A.4 Exception Logging (Attendance Adjustments)

Because the system relies on exact mathematics, any deviations from the base schedule must be documented in the Exception Logs.

1. Navigate to the **Requests Hub** or **Exception Logs** panel.
2. **Lates:** Log precise minutes an employee was late to automatically calculate the exact deduction against their base pay.
3. **Breaks (Unpaid):** Log a standard break duration (e.g., 1 hour) to seamlessly deduct the unpaid period from the continuous shift block.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the "Log Exception" modal. Open the dropdown menu in the screenshot to show the newly added "Break (Unpaid)" option alongside Overtime/Late.]**

## A.5 Compliance and Deduction Settings

The system calculates required Philippine government deductions (SSS, PhilHealth, Pag-IBIG, Withholding Tax). Managers have the authority to toggle these settings on a per-branch basis.

1. Navigate to **Settings > Deductions**.
2. To exempt a branch for a specific payroll period or test generation, interact with the deduction toggle switches.

> **[IMAGE PLACEHOLDER: Insert a screenshot of the Deduction Settings page showing the 4 interactive toggle switches (SSS, PhilHealth, Pag-IBIG, Tax) alongside their visual icons.]**

## A.6 Payroll Generation and Digital Payslips

The Payroll Generation engine aggregates the scheduled hours, applies recorded exception logs, factors in the deduction toggles, and computes the final net pay.

1. Navigate to the **Payroll** tab and select **+ Generate Payroll**.
2. Review the aggregated total hours versus the deduced break hours.
3. Once approved, the system generates a BIR-compliant digital payslip for the employee.

> **[IMAGE PLACEHOLDER: Insert a screenshot of a generated Digital Payslip. Ensure the exact breakdown of "Base Pay", "Overtime", "Late Deductions", and "Government Deductions" (all showing ₱0.00 if disabled) are clearly visible and mathematically accurate.]**
