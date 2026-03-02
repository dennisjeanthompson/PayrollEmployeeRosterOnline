# The Café — System Summary

The Café is a web-based payroll and employee scheduling system designed for Philippine café and restaurant operations. It is built with React, Express, PostgreSQL, and Material UI, and deployed on Render.com. The system provides real-time updates through WebSocket and supports multiple branch locations under a single platform.

## What the System Does

The system manages the day-to-day operations of a café's workforce. Managers create and publish employee schedules using a drag-and-drop calendar. Employees view their shifts, request time off, and trade shifts with coworkers. Payroll is processed with full Philippine government compliance, automatically computing SSS, PhilHealth, Pag-IBIG, and BIR withholding tax deductions. The system also handles holidays, overtime, night differential, and 13th month pay.

## Features

**Dashboard** — A summary page showing today's shifts, upcoming holidays, pending requests, and quick actions.

**Schedule** — A calendar with Day, Week, Month, and Grid views. Managers drag employees from the Roster onto the calendar to assign shifts. Schedules start in Draft mode and are published when finalized. Employees only see the published version. Schedules can be copied week to week and printed.

**Roster** — A sidebar listing all employees with their roles. On desktop, employees are dragged onto the calendar. On mobile, employees are tapped to select, then a calendar date is tapped to assign.

**Payroll** — Processes semi-monthly or monthly pay with automatic computation of government contributions, overtime, holiday pay, and night differential. Generates PDF payslips and keeps a full audit trail of every payroll run.

**Employee Management** — Add, edit, and deactivate employees. Each employee has personal details, position, pay rate, branch assignment, and a profile photo stored via Cloudinary.

**Shift Trading** — Employees request to swap shifts with coworkers. Managers approve or deny the trade before it takes effect. Notifications are sent in real time.

**Time-Off Requests** — Employees submit leave requests with dates and a reason. Managers approve or deny them. Approved leave automatically blocks those dates from scheduling.

**Holidays** — Manage Philippine public holidays. Holidays appear on the schedule calendar and affect payroll rates.

**Branch Management** — Support for multiple café locations. Each branch has its own schedules, employees, and payroll. A branch selector in the navigation allows quick switching.

**Pay Summary** — Employees view their own pay history, deduction breakdowns, and net pay by pay period.

**Notifications** — Real-time alerts for schedule changes, shift trade requests, time-off decisions, and payroll availability.

**Forecasting** — Charts showing labor cost trends, overtime patterns, and staffing levels to help managers plan.

**Deductions** — Custom deductions like cash advances or uniform fees, applied per employee or in bulk, on top of mandatory government contributions.

**Export & Print** — Export payroll reports and employee data to CSV. Print schedules directly from the app.

**Profile Settings** — Users update their own information, password, and profile photo.

**Audit Logs** — A record of every payroll change, schedule edit, and employee update for accountability and compliance tracking.

## User Roles

**Admin** — Full access to everything. Configures the system, manages all branches, sets pay rates, runs payroll across all locations, manages holidays and deductions, and views all reports and audit logs.

**Manager** — Manages their branch's schedule, roster, and payroll. Creates and publishes shifts, approves shift trades and time-off requests, generates payslips, accesses forecasting, and exports reports.

**Employee** — Views their own published schedule, submits shift trade and time-off requests, checks their pay summary and payslips, updates their profile, and receives notifications.
