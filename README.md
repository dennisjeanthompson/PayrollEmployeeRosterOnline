# The Cafe - Workforce Management System

A comprehensive workforce management application for The Cafe, featuring scheduling, payroll, shift trading, and employee management.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Database Setup**
    Ensure your `.env` file contains the correct `DATABASE_URL` (PostgreSQL/Neon).
    ```bash
    npm run db:push
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

## 🔑 Login Credentials

The following sample accounts have been seeded into the database for testing purposes.

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Full System Access

### Manager
- **Username**: `catherineocampo`
- **Password**: `password123`
- **Role**: Branch Manager (Can manage schedules, payroll, and employees)

### Employees
All employees use the default password: **`password123`**

| Name | Username | Role | Position |
|------|----------|------|----------|
| Mark Santos | `marksantos` | Employee | Barista |
| Jennifer Reyes | `jenniferreyes` | Employee | Cashier |
| Ryan Cruz | `ryancruz` | Employee | Server |
| Michelle Garcia | `michellegarcia` | Employee | Kitchen Staff |
| Paulo Dizon | `paulodizon` | Employee | Barista |
| Jeffrey Lim | `jeffreylim` | Employee | Server |
| Christine Bautista | `christinebautista` | Employee | Cashier |
| Michael Tan | `michaeltan` | Employee | Kitchen Staff |
| Jessica Mendoza | `jessicamendoza` | Employee | Barista |

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Material-UI (MUI), FullCalendar
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (via Neon), Drizzle ORM
- **Authentication**: Session-based (express-session), Bcrypt
- **File Storage**: Cloudinary (Profile Photos & Documents)

## ✨ Recent Updates

- **Cloudinary Integration**: Supports uploading profile photos and employee documents (IDs, contracts).
- **Payroll System**: Automated payroll calculation with Philippine tax/benefit deductions (SSS, PhilHealth, Pag-IBIG).
- **Mobile Responsive**: Optimized views for schedule and payslip access on mobile devices.
