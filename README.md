# The Cafe - HR & Payroll System

A complete, DOLE and BIR-compliant Human Resources and Payroll management system built for businesses in the Philippines. 

## 🌟 Key Features

* **Time & Attendance:** Schedule management, shift tracking, and automated computation of Regular Hours, Overtime, and Night Differential (10 PM - 6 AM).
* **Philippine Payroll & Taxes:** Automated, accurate deductions for SSS, PhilHealth, Pag-IBIG, and BIR Withholding Tax (TRAIN Law).
* **13th Month Pay:** Built-in ledger that complies with PD 851, automatically accruing 1/12th of basic annual salary.
* **Employee Management:** Cloudinary-backed document storage, minimal wage earner (MWE) tax exemptions, and leave tracking.
* **Role-Based Access:** Isolated views for Admins, Branch Managers, and Employees.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   cd "The Cafe/The Cafe"
   npm install
   ```

2. **Database Setup**
   Ensure your `.env` contains your PostgreSQL `DATABASE_URL`.
   ```bash
   npm run db:push
   ```

3. **Run the App**
   ```bash
   npm run dev
   ```
   *Access the app at `http://localhost:5000`*

## 🔑 Default Credentials

- **Admin:** `admin` / `admin123`
- **Manager:** `catherineocampo` / `password123`  
- **Test Employee:** `marksantos` / `password123`

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Material-UI, Vite
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** PostgreSQL (Neon)
