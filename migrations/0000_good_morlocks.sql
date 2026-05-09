CREATE TABLE "adjustment_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"logged_by" text NOT NULL,
	"date" timestamp NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"remarks" text,
	"status" text DEFAULT 'pending',
	"verified_by_employee" boolean DEFAULT false,
	"verified_at" timestamp,
	"approved_by" text,
	"approved_at" timestamp,
	"payroll_period_id" text,
	"calculated_amount" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"request_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"approved_by" text,
	"status" text DEFAULT 'pending',
	"reason" text,
	"request_data" text,
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "archived_payroll_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"original_period_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text NOT NULL,
	"total_hours" text,
	"total_pay" text,
	"archived_at" timestamp DEFAULT now(),
	"archived_by" text,
	"entries_snapshot" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"old_values" text,
	"new_values" text,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deduction_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"min_salary" text NOT NULL,
	"max_salary" text,
	"employee_rate" text,
	"employee_contribution" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deduction_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"deduct_sss" boolean DEFAULT true,
	"deduct_philhealth" boolean DEFAULT false,
	"deduct_pagibig" boolean DEFAULT false,
	"deduct_withholding_tax" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"public_id" text NOT NULL,
	"url" text NOT NULL,
	"format" text,
	"size" integer,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" timestamp NOT NULL,
	"type" text NOT NULL,
	"year" integer NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"work_allowed" boolean DEFAULT true,
	"notes" text,
	"premium_override" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"data" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payroll_period_id" text NOT NULL,
	"total_hours" text NOT NULL,
	"regular_hours" text NOT NULL,
	"overtime_hours" text DEFAULT '0',
	"night_diff_hours" text DEFAULT '0',
	"basic_pay" text NOT NULL,
	"holiday_pay" text DEFAULT '0',
	"overtime_pay" text DEFAULT '0',
	"night_diff_pay" text DEFAULT '0',
	"rest_day_pay" text DEFAULT '0',
	"gross_pay" text NOT NULL,
	"sss_contribution" text DEFAULT '0',
	"sss_loan" text DEFAULT '0',
	"philhealth_contribution" text DEFAULT '0',
	"pagibig_contribution" text DEFAULT '0',
	"pagibig_loan" text DEFAULT '0',
	"withholding_tax" text DEFAULT '0',
	"advances" text DEFAULT '0',
	"other_deductions" text DEFAULT '0',
	"total_deductions" text DEFAULT '0',
	"deductions" text DEFAULT '0',
	"net_pay" text NOT NULL,
	"pay_breakdown" text,
	"status" text DEFAULT 'pending',
	"blockchain_hash" text,
	"block_number" integer,
	"transaction_hash" text,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'open',
	"total_hours" text,
	"total_pay" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "setup_status" (
	"id" text PRIMARY KEY NOT NULL,
	"is_setup_complete" boolean DEFAULT false,
	"setup_completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "shift_trades" (
	"id" text PRIMARY KEY NOT NULL,
	"shift_id" text NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending',
	"urgency" text DEFAULT 'normal',
	"notes" text,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" text
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"position" text NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" text,
	"status" text DEFAULT 'scheduled',
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_off_policy" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"leave_type" text NOT NULL,
	"minimum_advance_days" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_off_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending',
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"position" text NOT NULL,
	"hourly_rate" text NOT NULL,
	"branch_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"blockchain_verified" boolean DEFAULT false,
	"blockchain_hash" text,
	"verified_at" timestamp,
	"sss_loan_deduction" text DEFAULT '0',
	"pagibig_loan_deduction" text DEFAULT '0',
	"cash_advance_deduction" text DEFAULT '0',
	"philhealth_deduction" text DEFAULT '0',
	"other_deductions" text DEFAULT '0',
	"photo_url" text,
	"photo_public_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_payroll_period_id_payroll_periods_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_payroll_periods" ADD CONSTRAINT "archived_payroll_periods_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_payroll_periods" ADD CONSTRAINT "archived_payroll_periods_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deduction_settings" ADD CONSTRAINT "deduction_settings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_payroll_period_id_payroll_periods_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_trades" ADD CONSTRAINT "shift_trades_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_trades" ADD CONSTRAINT "shift_trades_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_trades" ADD CONSTRAINT "shift_trades_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_trades" ADD CONSTRAINT "shift_trades_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_policy" ADD CONSTRAINT "time_off_policy_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;