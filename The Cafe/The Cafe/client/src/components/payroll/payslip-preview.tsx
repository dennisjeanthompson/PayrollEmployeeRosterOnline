/**
 * Payslip Preview Component - Excel-Style Grid Layout
 * 
 * This is the main payslip preview modal component that displays
 * payroll data with complete grid lines, alternating row colors,
 * and a professional two-column layout for earnings/deductions.
 * 
 * @author The Café Payroll System
 * @version 3.0.0
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { getPaymentDate } from "@shared/payroll-dates";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, Printer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface PayslipData {
  id: string;
  employeeName: string;
  employeeId: string;
  position: string;
  department?: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  
  // Hours
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  nightDiffHours?: number;
  totalHours: number;
  
  // Rate
  hourlyRate?: number;

  // Earnings
  basicPay: number;
  holidayPay: number;
  overtimePay: number;
  nightDifferential: number;
  restDayPay?: number;
  grossPay: number;
  
  // Deductions
  sssContribution: number;
  sssLoan: number;
  philHealthContribution: number;
  pagibigContribution: number;
  pagibigLoan: number;
  withholdingTax: number;
  advances: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net
  netPay: number;
  
  // Optional company info
  companyName?: string;
  companyAddress?: string;
  companyTin?: string;
  companyLogoUrl?: string;
  companyEmail?: string;
  // Employee government IDs
  employeeTin?: string | null;
  employeeSss?: string | null;
  employeePhilhealth?: string | null;
  employeePagibig?: string | null;
}

interface PayslipPreviewProps {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================
// CSS STYLES - Excel-Style Grid with Complete Grid Lines
// ============================================================

const payslipStyles = `
  .payslip-preview-container {
    font-family: 'Arial', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 24px;
    color: #000;
  }

  /* Header Section - 3 column grid */
  .payslip-header {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #000;
  }

  .payslip-logo-box {
    width: 80px;
    height: 80px;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    font-size: 10px;
    color: #666;
    text-align: center;
  }

  .payslip-company-info h1 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 5px 0;
  }

  .payslip-company-info p {
    font-size: 11px;
    margin: 2px 0;
    color: #333;
  }

  .payslip-title {
    text-align: right;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 2px;
  }

  /* Employee Info Grid Table */
  .payslip-info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    font-size: 12px;
  }

  .payslip-info-table td {
    border: 1px solid #666;
    padding: 8px 10px;
  }

  .payslip-info-table .label {
    background: #f0f0f0;
    font-weight: bold;
    width: 15%;
  }

  .payslip-info-table .value {
    background: white;
    width: 35%;
  }

  /* Combined Earnings & Deductions Table */
  .payslip-combined-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 12px;
  }

  .payslip-combined-table td {
    border: 1px solid #999;
    padding: 8px 10px;
  }

  .payslip-section-header {
    background: #333;
    color: white;
    font-weight: bold;
    text-align: center;
    padding: 10px;
    font-size: 13px;
    letter-spacing: 1px;
  }

  .payslip-combined-table tr:nth-child(even) td:not(.payslip-section-header) {
    background: #f9f9f9;
  }

  .payslip-combined-table tr:nth-child(odd) td:not(.payslip-section-header) {
    background: white;
  }

  .payslip-combined-table .item-label {
    font-weight: 500;
    width: 30%;
  }

  .payslip-combined-table .item-amount {
    text-align: right;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    width: 20%;
  }

  .payslip-subtotal-row {
    background: #e8e8e8 !important;
    font-weight: bold;
    border-top: 2px solid #333;
  }

  .payslip-subtotal-row td {
    padding: 10px !important;
    font-size: 13px !important;
    background: #e8e8e8 !important;
  }

  /* Summary Table */
  .payslip-summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    font-size: 13px;
  }

  .payslip-summary-table td {
    border: 1px solid #666;
    padding: 10px 15px;
  }

  .payslip-summary-table .summary-label {
    background: #f0f0f0;
    font-weight: bold;
    width: 30%;
  }

  .payslip-summary-table .summary-amount {
    text-align: right;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    width: 20%;
  }

  .payslip-net-pay-row {
    background: #333 !important;
    color: white;
    font-size: 16px;
    font-weight: bold;
  }

  .payslip-net-pay-row td {
    padding: 15px !important;
    border: 2px solid #000 !important;
    background: #333 !important;
  }

  /* Footer */
  .payslip-footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #999;
    text-align: center;
    font-size: 10px;
    color: #666;
  }

  .payslip-footer p {
    margin: 3px 0;
  }

  /* Print styles */
  @media print {
    .payslip-preview-container {
      padding: 0;
      max-width: 100%;
    }
    .payslip-actions {
      display: none !important;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .payslip-preview-container {
      padding: 12px;
    }

    .payslip-header {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .payslip-logo-box {
      margin: 0 auto;
    }

    .payslip-title {
      text-align: center;
      margin-top: 10px;
      font-size: 22px;
    }

    .payslip-info-table td {
      display: block;
      width: 100% !important;
      border: none;
      border-bottom: 1px solid #ddd;
      padding: 6px 8px;
    }

    .payslip-info-table tr {
      display: block;
      margin-bottom: 5px;
    }

    .payslip-combined-table td,
    .payslip-summary-table td {
      padding: 6px 8px;
      font-size: 11px;
    }

    .payslip-section-header {
      font-size: 12px;
      padding: 8px;
    }

    .payslip-net-pay-row td {
      font-size: 14px !important;
      padding: 12px !important;
    }
  }
`;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const safeNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const formatCurrency = (amount: number): string => {
  return `PHP ${safeNumber(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PayslipPreview({ entryId, open, onOpenChange }: PayslipPreviewProps) {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['payslip', entryId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/payroll/payslip/${entryId}`);
      return response.json();
    },
    enabled: open && !!entryId,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const payslip: PayslipData | null = data?.payslip || null;

  // PDF Generation
  const generatePDF = (payslipData: PayslipData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const black = [0, 0, 0] as [number, number, number];
    const darkGray = [51, 51, 51] as [number, number, number];
    const lightGray = [240, 240, 240] as [number, number, number];
    const mediumGray = [153, 153, 153] as [number, number, number];

    let y = 20;
    const companyName = payslipData.companyName || "PERO";
    const companyAddress = payslipData.companyAddress || "Philippines";
    const companyTin = payslipData.companyTin || "N/A";
    const companyEmail = payslipData.companyEmail || "hr@thecafe.com.ph";

    // Header
    doc.setTextColor(...black);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PAYSLIP", pageWidth - 20, y, { align: "right" });
    
    doc.setFontSize(16);
    doc.text(companyName.toUpperCase(), 20, y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyAddress, 20, y);
    
    y += 5;
    doc.text(`TIN: ${companyTin}`, 20, y);
    
    y += 10;
    doc.setDrawColor(...mediumGray);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Employee Info Grid
    const drawInfoRow = (y: number, label1: string, value1: string, label2: string, value2: string) => {
      const rowHeight = 8;
      const col1Width = 35;
      const col2Width = (pageWidth - 40 - col1Width * 2) / 2;
      
      doc.setDrawColor(...mediumGray);
      doc.setLineWidth(0.3);
      
      // Draw cells
      let x = 20;
      
      // Label 1
      doc.setFillColor(...lightGray);
      doc.rect(x, y, col1Width, rowHeight, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(label1, x + 2, y + 5.5);
      x += col1Width;
      
      // Value 1
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, col2Width, rowHeight, 'FD');
      doc.setFont("helvetica", "normal");
      doc.text(value1, x + 2, y + 5.5);
      x += col2Width;
      
      // Label 2
      doc.setFillColor(...lightGray);
      doc.rect(x, y, col1Width, rowHeight, 'FD');
      doc.setFont("helvetica", "bold");
      doc.text(label2, x + 2, y + 5.5);
      x += col1Width;
      
      // Value 2
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, col2Width, rowHeight, 'FD');
      doc.setFont("helvetica", "normal");
      doc.text(value2, x + 2, y + 5.5);
      
      return y + rowHeight;
    };

    const dateStart = payslipData.periodStart ? format(new Date(payslipData.periodStart), "MMMM d") : "";
    const dateEnd = payslipData.periodEnd ? format(new Date(payslipData.periodEnd), "MMMM d, yyyy") : "";
    const payDate = payslipData.periodEnd ? format(getPaymentDate(payslipData.periodEnd), "MMMM d, yyyy") : "";
    
    y = drawInfoRow(y, "EMPLOYEE:", payslipData.employeeName, "PERIOD:", `${dateStart} - ${dateEnd}`);
    y = drawInfoRow(y, "POSITION:", payslipData.position, "PAY DATE:", payDate);
    y = drawInfoRow(y, "EMP ID:", payslipData.employeeId || "N/A", "DEPT:", payslipData.department || "Operations");
    y = drawInfoRow(y, "TIN:", payslipData.employeeTin || "—", "SSS No.:", payslipData.employeeSss || "—");
    y = drawInfoRow(y, "PhilHealth:", payslipData.employeePhilhealth || "—", "Pag-IBIG:", payslipData.employeePagibig || "—");
    
    y += 10;

    // Earnings & Deductions Grid
    const drawGridHeader = (y: number) => {
      const rowHeight = 10;
      const halfWidth = (pageWidth - 40) / 2;
      
      doc.setFillColor(...darkGray);
      doc.setTextColor(255, 255, 255);
      doc.setDrawColor(...black);
      doc.setLineWidth(0.5);
      
      doc.rect(20, y, halfWidth, rowHeight, 'FD');
      doc.rect(20 + halfWidth, y, halfWidth, rowHeight, 'FD');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("EARNINGS", 20 + halfWidth / 2, y + 7, { align: "center" });
      doc.text("DEDUCTIONS", 20 + halfWidth + halfWidth / 2, y + 7, { align: "center" });
      
      doc.setTextColor(...black);
      return y + rowHeight;
    };

    const drawGridRow = (y: number, earnLabel: string, earnValue: string, dedLabel: string, dedValue: string, isEven: boolean) => {
      const rowHeight = 7;
      const halfWidth = (pageWidth - 40) / 2;
      const labelWidth = halfWidth * 0.6;
      const amountWidth = halfWidth * 0.4;
      
      doc.setDrawColor(...mediumGray);
      doc.setLineWidth(0.3);
      
      // Background
      if (isEven) {
        doc.setFillColor(249, 249, 249);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(20, y, halfWidth, rowHeight, 'FD');
      doc.rect(20 + halfWidth, y, halfWidth, rowHeight, 'FD');
      
      // Vertical dividers
      doc.line(20 + labelWidth, y, 20 + labelWidth, y + rowHeight);
      doc.line(20 + halfWidth + labelWidth, y, 20 + halfWidth + labelWidth, y + rowHeight);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Earnings
      if (earnLabel) {
        doc.text(earnLabel, 22, y + 5);
        doc.text(earnValue, 20 + halfWidth - 2, y + 5, { align: "right" });
      }
      
      // Deductions
      if (dedLabel) {
        doc.text(dedLabel, 20 + halfWidth + 2, y + 5);
        doc.text(dedValue, pageWidth - 22, y + 5, { align: "right" });
      }
      
      return y + rowHeight;
    };

    y = drawGridHeader(y);

    // Build BIR-compliant earnings list — always show all standard rows
    const rateStr = payslipData.hourlyRate ? ` @ PHP ${safeNumber(payslipData.hourlyRate).toFixed(2)}/hr` : "";
    const ndHrs = safeNumber(payslipData.nightDiffHours);
    const earnings: Array<{ label: string; value: string }> = [];
    earnings.push({ label: `Regular Hours (${safeNumber(payslipData.regularHours).toFixed(1)}h${rateStr}):`, value: formatCurrency(payslipData.basicPay) });
    earnings.push({ label: `OT Pay (${safeNumber(payslipData.overtimeHours).toFixed(1)}h × 130%):`, value: formatCurrency(payslipData.overtimePay) });
    earnings.push({ label: `Night Diff (${ndHrs.toFixed(1)}h × +10%):`, value: formatCurrency(payslipData.nightDifferential) });
    earnings.push({ label: "Holiday Pay:", value: formatCurrency(payslipData.holidayPay) });
    const restDay = safeNumber(payslipData.restDayPay);
    earnings.push({ label: "Rest Day Premium:", value: formatCurrency(restDay) });

    // BIR-compliant deductions — always show statutory deductions even at ₱0
    const deductions: Array<{ label: string; value: string }> = [];
    deductions.push({ label: "SSS (Employee):", value: formatCurrency(payslipData.sssContribution) });
    deductions.push({ label: "PhilHealth (Employee):", value: formatCurrency(payslipData.philHealthContribution) });
    deductions.push({ label: "Pag-IBIG / HDMF:", value: formatCurrency(payslipData.pagibigContribution) });
    deductions.push({ label: "W/holding Tax (BIR):", value: formatCurrency(payslipData.withholdingTax) });
    if (payslipData.sssLoan > 0) deductions.push({ label: "SSS Loan:", value: formatCurrency(payslipData.sssLoan) });
    if (payslipData.pagibigLoan > 0) deductions.push({ label: "Pag-IBIG Loan:", value: formatCurrency(payslipData.pagibigLoan) });
    if (payslipData.advances > 0) deductions.push({ label: "Cash Advances:", value: formatCurrency(payslipData.advances) });
    if (payslipData.otherDeductions > 0) deductions.push({ label: "Other Deductions:", value: formatCurrency(payslipData.otherDeductions) });

    const maxRows = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows; i++) {
      const earn = earnings[i];
      const ded = deductions[i];
      y = drawGridRow(
        y,
        earn?.label || "",
        earn?.value || "",
        ded?.label || "",
        ded?.value || "",
        i % 2 === 0
      );
    }

    // Summary section
    const halfWidth = (pageWidth - 40) / 2;
    y += 5;
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...black);
    doc.setLineWidth(0.5);
    doc.rect(20, y, halfWidth, 8, 'FD');
    doc.rect(20 + halfWidth, y, halfWidth, 8, 'FD');
    doc.setFont("helvetica", "bold");
    doc.text("GROSS PAY:", 22, y + 5.5);
    doc.text(formatCurrency(payslipData.grossPay), 20 + halfWidth - 2, y + 5.5, { align: "right" });
    doc.text("TOTAL DEDUCTIONS:", 20 + halfWidth + 2, y + 5.5);
    doc.text(formatCurrency(payslipData.totalDeductions), pageWidth - 22, y + 5.5, { align: "right" });
    y += 8;

    // Net Pay
    doc.setFillColor(...darkGray);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y, pageWidth - 40, 12, 'FD');
    doc.setFontSize(14);
    doc.text("NET PAY:", 25, y + 8);
    doc.text(formatCurrency(payslipData.netPay), pageWidth - 25, y + 8, { align: "right" });
    
    y += 20;
    doc.setTextColor(...mediumGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This is a computer-generated document. No signature required.", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text(`For payroll inquiries: ${companyEmail}`, pageWidth / 2, y, { align: "center" });

    return doc;
  };

  const handleDownloadPDF = () => {
    if (!payslip) return;
    const doc = generatePDF(payslip);
    const filename = `payslip_${payslip.employeeName.replace(/\s+/g, '_')}_${format(new Date(payslip.period || new Date()), "yyyy-MM-dd")}.pdf`;
    doc.save(filename);
    toast({ title: "PDF Downloaded", description: "Payslip saved as PDF" });
  };

  const handlePrint = () => {
    if (!payslip) return;
    const doc = generatePDF(payslip);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <DialogDescription className="sr-only">Loading payslip data...</DialogDescription>
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !payslip) return null;

  // Prepare BIR-compliant earnings — always show all line items
  const ndHrsDisplay = safeNumber(payslip.nightDiffHours);
  const rateDisplay = payslip.hourlyRate ? `@ PHP ${safeNumber(payslip.hourlyRate).toFixed(2)}/hr` : "";
  const earningsList: Array<{ label: string; value: number | string; isMoney: boolean }> = [
    { label: `Basic Pay (${safeNumber(payslip.regularHours).toFixed(1)}h ${rateDisplay})`, value: payslip.basicPay, isMoney: true },
    { label: `Overtime Pay (${safeNumber(payslip.overtimeHours).toFixed(1)}h × 130%)`, value: payslip.overtimePay, isMoney: true },
    { label: `Night Differential (${ndHrsDisplay.toFixed(1)}h × +10%)`, value: payslip.nightDifferential, isMoney: true },
    { label: "Holiday Pay", value: payslip.holidayPay, isMoney: true },
    { label: "Rest Day Premium", value: safeNumber(payslip.restDayPay), isMoney: true },
  ];

  // Always show all statutory deductions (BIR / TRAIN Law compliance)
  const deductionsList: Array<{ label: string; value: number }> = [
    { label: "SSS (Employee)", value: payslip.sssContribution },
    { label: "PhilHealth (Employee)", value: payslip.philHealthContribution },
    { label: "Pag-IBIG / HDMF", value: payslip.pagibigContribution },
    { label: "Withholding Tax (BIR)", value: payslip.withholdingTax },
    ...(payslip.sssLoan > 0 ? [{ label: "SSS Loan", value: payslip.sssLoan }] : []),
    ...(payslip.pagibigLoan > 0 ? [{ label: "Pag-IBIG Loan", value: payslip.pagibigLoan }] : []),
    ...(payslip.advances > 0 ? [{ label: "Cash Advances", value: payslip.advances }] : []),
    ...(payslip.otherDeductions > 0 ? [{ label: "Other Deductions", value: payslip.otherDeductions }] : []),
  ];

  const maxRows = Math.max(earningsList.length, deductionsList.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden bg-white text-black border-0 rounded-xl">
        <style>{payslipStyles}</style>
        <ScrollArea className="max-h-[85vh] w-full" style={{ background: '#f8f8f8' }}>
          <div className="payslip-preview-container">
            
            {/* Header Section */}
            <div className="payslip-header">
              <div className="payslip-logo-box">
                {payslip.companyLogoUrl ? (
                  <img
                    src={payslip.companyLogoUrl}
                    alt="Company Logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "Company Logo"
                )}
              </div>
              <div className="payslip-company-info">
                <h1>{payslip.companyName || "PERO"}</h1>
                <p>{payslip.companyAddress || "Philippines"}</p>
                <p>TIN: {payslip.companyTin || "N/A"}</p>
              </div>
              <div className="payslip-title">
                PAYSLIP
              </div>
            </div>

            {/* Employee Info Table */}
            <table className="payslip-info-table">
              <tbody>
                <tr>
                  <td className="label">EMPLOYEE NAME:</td>
                  <td className="value">{payslip.employeeName}</td>
                  <td className="label">PERIOD COVERED:</td>
                  <td className="value">
                    {payslip.periodStart ? format(new Date(payslip.periodStart), "MMMM d") : ""} - {payslip.periodEnd ? format(new Date(payslip.periodEnd), "MMMM d, yyyy") : ""}
                  </td>
                </tr>
                <tr>
                  <td className="label">POSITION:</td>
                  <td className="value">{payslip.position}</td>
                  <td className="label">PAY DATE:</td>
                  <td className="value">
                    {payslip.periodEnd ? format(getPaymentDate(payslip.periodEnd), "MMMM d, yyyy") : ""}
                  </td>
                </tr>
                <tr>
                  <td className="label">EMPLOYEE ID:</td>
                  <td className="value">{payslip.employeeId || "N/A"}</td>
                  <td className="label">DEPARTMENT:</td>
                  <td className="value">{payslip.department || "Operations"}</td>
                </tr>
                <tr>
                  <td className="label">TIN:</td>
                  <td className="value">{payslip.employeeTin || "—"}</td>
                  <td className="label">SSS No.:</td>
                  <td className="value">{payslip.employeeSss || "—"}</td>
                </tr>
                <tr>
                  <td className="label">PhilHealth:</td>
                  <td className="value">{payslip.employeePhilhealth || "—"}</td>
                  <td className="label">Pag-IBIG:</td>
                  <td className="value">{payslip.employeePagibig || "—"}</td>
                </tr>
              </tbody>
            </table>

            {/* Combined Earnings & Deductions Table */}
            <table className="payslip-combined-table">
              <tbody>
                {/* Header Row */}
                <tr>
                  <td colSpan={2} className="payslip-section-header">EARNINGS</td>
                  <td colSpan={2} className="payslip-section-header">DEDUCTIONS</td>
                </tr>
                
                {/* Data Rows */}
                {Array.from({ length: maxRows }).map((_, i) => {
                  const earn = earningsList[i];
                  const ded = deductionsList[i];
                  return (
                    <tr key={i}>
                      <td className="item-label">{earn ? `${earn.label}:` : ""}</td>
                      <td className="item-amount">
                        {earn && (earn.isMoney !== false 
                          ? formatCurrency(Number(earn.value))
                          : earn.value)}
                      </td>
                      <td className="item-label">{ded ? `${ded.label}:` : ""}</td>
                      <td className="item-amount">
                        {ded && formatCurrency(Number(ded.value))}
                      </td>
                    </tr>
                  );
                })}
                
              </tbody>
            </table>

            {/* Summary Table */}
            <table className="payslip-summary-table">
              <tbody>
                <tr>
                  <td className="summary-label">GROSS PAY:</td>
                  <td className="summary-amount">{formatCurrency(payslip.grossPay)}</td>
                  <td className="summary-label">TOTAL DEDUCTIONS:</td>
                  <td className="summary-amount">{formatCurrency(payslip.totalDeductions)}</td>
                </tr>
                <tr className="payslip-net-pay-row">
                  <td colSpan={2}>NET PAY:</td>
                  <td colSpan={2} className="summary-amount">{formatCurrency(payslip.netPay)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="payslip-footer">
              <p>This is a computer-generated document. No signature required.</p>
              <p>For payroll inquiries: {payslip.companyEmail || "hr@thecafe.com.ph"}</p>
            </div>

            {/* Action Buttons */}
            <div className="payslip-actions mt-6 flex gap-3 print:hidden">
              <Button className="flex-1 bg-black hover:bg-gray-800" onClick={handleDownloadPDF}>
                <FileDown className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
            
            <DialogTitle className="sr-only">Payslip Details</DialogTitle>
            <DialogDescription className="sr-only">Detailed breakdown of earnings and deductions</DialogDescription>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default PayslipPreview;
