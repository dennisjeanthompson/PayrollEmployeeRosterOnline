import { r as reactExports, Q as jsxRuntimeExports, e7 as Root, e8 as Viewport, e9 as Corner, ea as ScrollAreaScrollbar, eb as ScrollAreaThumb, ax as useQuery, bl as format, ec as FileDown, ed as Printer, ee as E } from './vendor-v-EuVKxF.js';
import { g as getPaymentDate } from './payroll-dates-BmATSNY8.js';
import { D as Dialog, a as DialogContent, c as DialogTitle, d as DialogDescription } from './dialog-C9UQy7j1.js';
import { B as Button } from './button-CBOKXpNF.js';
import { d as cn, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';

const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;

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
const safeNumber = (val) => {
  if (val === null || val === void 0) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};
const formatCurrency = (amount) => {
  return `PHP ${safeNumber(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};
function PayslipPreview({ entryId, open, onOpenChange }) {
  const { toast } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ["payslip", entryId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/payroll/payslip/${entryId}`);
      return response.json();
    },
    enabled: open && !!entryId,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0
  });
  const payslip = data?.payslip || null;
  const generatePDF = (payslipData) => {
    const doc = new E();
    const pageWidth = doc.internal.pageSize.getWidth();
    const black = [0, 0, 0];
    const darkGray = [51, 51, 51];
    const lightGray = [240, 240, 240];
    const mediumGray = [153, 153, 153];
    let y = 20;
    const companyName = payslipData.companyName || "PERO";
    const companyAddress = payslipData.companyAddress || "Philippines";
    const companyTin = payslipData.companyTin || "N/A";
    const companyEmail = payslipData.companyEmail || "hr@thecafe.com.ph";
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
    const drawInfoRow = (y2, label1, value1, label2, value2) => {
      const rowHeight = 8;
      const col1Width = 35;
      const col2Width = (pageWidth - 40 - col1Width * 2) / 2;
      doc.setDrawColor(...mediumGray);
      doc.setLineWidth(0.3);
      let x = 20;
      doc.setFillColor(...lightGray);
      doc.rect(x, y2, col1Width, rowHeight, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(label1, x + 2, y2 + 5.5);
      x += col1Width;
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y2, col2Width, rowHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.text(value1, x + 2, y2 + 5.5);
      x += col2Width;
      doc.setFillColor(...lightGray);
      doc.rect(x, y2, col1Width, rowHeight, "FD");
      doc.setFont("helvetica", "bold");
      doc.text(label2, x + 2, y2 + 5.5);
      x += col1Width;
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y2, col2Width, rowHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.text(value2, x + 2, y2 + 5.5);
      return y2 + rowHeight;
    };
    const dateStart = payslipData.periodStart ? format(new Date(payslipData.periodStart), "MMMM d") : "";
    const dateEnd = payslipData.periodEnd ? format(new Date(payslipData.periodEnd), "MMMM d, yyyy") : "";
    let payDate = "";
    if (payslipData.payDate) {
      payDate = format(new Date(payslipData.payDate), "MMMM d, yyyy");
    } else if (payslipData.periodEnd) {
      payDate = format(getPaymentDate(payslipData.periodEnd), "MMMM d, yyyy");
    }
    y = drawInfoRow(y, "EMPLOYEE:", payslipData.employeeName, "PERIOD:", `${dateStart} - ${dateEnd}`);
    y = drawInfoRow(y, "POSITION:", payslipData.position, "PAY DATE:", payDate);
    y = drawInfoRow(y, "EMP ID:", payslipData.employeeId || "N/A", "DEPT:", payslipData.department || "Operations");
    y = drawInfoRow(y, "TIN:", payslipData.employeeTin || "—", "SSS No.:", payslipData.employeeSss || "—");
    y = drawInfoRow(y, "PhilHealth:", payslipData.employeePhilhealth || "—", "Pag-IBIG:", payslipData.employeePagibig || "—");
    y += 10;
    const drawGridHeader = (y2) => {
      const rowHeight = 10;
      const halfWidth2 = (pageWidth - 40) / 2;
      doc.setFillColor(...darkGray);
      doc.setTextColor(255, 255, 255);
      doc.setDrawColor(...black);
      doc.setLineWidth(0.5);
      doc.rect(20, y2, halfWidth2, rowHeight, "FD");
      doc.rect(20 + halfWidth2, y2, halfWidth2, rowHeight, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("EARNINGS", 20 + halfWidth2 / 2, y2 + 7, { align: "center" });
      doc.text("DEDUCTIONS", 20 + halfWidth2 + halfWidth2 / 2, y2 + 7, { align: "center" });
      doc.setTextColor(...black);
      return y2 + rowHeight;
    };
    const drawGridRow = (y2, earnLabel, earnValue, dedLabel, dedValue, isEven) => {
      const rowHeight = 7;
      const halfWidth2 = (pageWidth - 40) / 2;
      const labelWidth = halfWidth2 * 0.6;
      doc.setDrawColor(...mediumGray);
      doc.setLineWidth(0.3);
      if (isEven) {
        doc.setFillColor(249, 249, 249);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(20, y2, halfWidth2, rowHeight, "FD");
      doc.rect(20 + halfWidth2, y2, halfWidth2, rowHeight, "FD");
      doc.line(20 + labelWidth, y2, 20 + labelWidth, y2 + rowHeight);
      doc.line(20 + halfWidth2 + labelWidth, y2, 20 + halfWidth2 + labelWidth, y2 + rowHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      if (earnLabel) {
        doc.text(earnLabel, 22, y2 + 5);
        doc.text(earnValue, 20 + halfWidth2 - 2, y2 + 5, { align: "right" });
      }
      if (dedLabel) {
        doc.text(dedLabel, 20 + halfWidth2 + 2, y2 + 5);
        doc.text(dedValue, pageWidth - 22, y2 + 5, { align: "right" });
      }
      return y2 + rowHeight;
    };
    y = drawGridHeader(y);
    const rateStr = payslipData.hourlyRate ? ` @ PHP ${safeNumber(payslipData.hourlyRate).toFixed(2)}/hr` : "";
    const ndHrs = safeNumber(payslipData.nightDiffHours);
    const earnings = [];
    earnings.push({ label: `Regular Hours (${safeNumber(payslipData.regularHours).toFixed(1)}h${rateStr}):`, value: formatCurrency(payslipData.basicPay) });
    earnings.push({ label: `OT Pay (${safeNumber(payslipData.overtimeHours).toFixed(1)}h × 125%):`, value: formatCurrency(payslipData.overtimePay) });
    earnings.push({ label: `Night Diff (${ndHrs.toFixed(1)}h × +10%):`, value: formatCurrency(payslipData.nightDifferential) });
    earnings.push({ label: "Holiday Pay:", value: formatCurrency(payslipData.holidayPay) });
    const restDay = safeNumber(payslipData.restDayPay);
    earnings.push({ label: "Rest Day Premium:", value: formatCurrency(restDay) });
    const deductions = [];
    deductions.push({ label: "SSS (MSC Bracketed, ÷ 2):", value: formatCurrency(payslipData.sssContribution) });
    deductions.push({ label: "PhilHealth (5% / 2):", value: formatCurrency(payslipData.philHealthContribution) });
    deductions.push({ label: "Pag-IBIG (MFS Capped):", value: formatCurrency(payslipData.pagibigContribution) });
    deductions.push({ label: "BIR Tax (Annualized):", value: formatCurrency(payslipData.withholdingTax) });
    if (payslipData.sssLoan > 0) deductions.push({ label: "SSS Loan:", value: formatCurrency(payslipData.sssLoan) });
    if (payslipData.pagibigLoan > 0) deductions.push({ label: "Pag-IBIG Loan:", value: formatCurrency(payslipData.pagibigLoan) });
    if (payslipData.advances > 0) deductions.push({ label: "Cash Advances:", value: formatCurrency(payslipData.advances) });
    if (payslipData.otherDeductions > 0) deductions.push({ label: "Other Deductions:", value: formatCurrency(payslipData.otherDeductions) });
    const maxRows2 = Math.max(earnings.length, deductions.length);
    for (let i = 0; i < maxRows2; i++) {
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
    const halfWidth = (pageWidth - 40) / 2;
    y += 5;
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...black);
    doc.setLineWidth(0.5);
    doc.rect(20, y, halfWidth, 8, "FD");
    doc.rect(20 + halfWidth, y, halfWidth, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.text("GROSS PAY:", 22, y + 5.5);
    doc.text(formatCurrency(payslipData.grossPay), 20 + halfWidth - 2, y + 5.5, { align: "right" });
    doc.text("TOTAL DEDUCTIONS:", 20 + halfWidth + 2, y + 5.5);
    doc.text(formatCurrency(payslipData.totalDeductions), pageWidth - 22, y + 5.5, { align: "right" });
    y += 8;
    doc.setFillColor(...darkGray);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y, pageWidth - 40, 12, "FD");
    doc.setFontSize(14);
    doc.text("NET PAY:", 25, y + 8);
    doc.text(formatCurrency(payslipData.netPay), pageWidth - 25, y + 8, { align: "right" });
    y += 15;
    if (payslipData.includedExceptions && payslipData.includedExceptions.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(...lightGray);
      doc.setDrawColor(...black);
      doc.setLineWidth(0.5);
      doc.rect(20, y, pageWidth - 40, 8, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...black);
      doc.setFontSize(10);
      doc.text("EXCEPTION LOG ADDENDUM (Included in Calculation)", 25, y + 5.5);
      y += 8;
      doc.setFillColor(...darkGray);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, y, pageWidth - 40, 7, "FD");
      doc.setFontSize(9);
      doc.text("DATE", 22, y + 5);
      doc.text("TYPE", 50, y + 5);
      doc.text("DURATION", 100, y + 5);
      doc.text("REMARKS", 130, y + 5);
      y += 7;
      doc.setTextColor(...black);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      payslipData.includedExceptions.forEach((log, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setDrawColor(...mediumGray);
        doc.setLineWidth(0.1);
        if (idx % 2 === 0) doc.setFillColor(249, 249, 249);
        else doc.setFillColor(255, 255, 255);
        doc.rect(20, y, pageWidth - 40, 6, "FD");
        doc.text(format(new Date(log.startDate), "MMM d, yyyy"), 22, y + 4.5);
        const typeLabels = { late: "Lateness", undertime: "Undertime", absent: "Absence", overtime: "Overtime", rest_day_ot: "Rest Day OT", special_holiday_ot: "Special Hol OT", regular_holiday_ot: "Reg Hol OT", night_diff: "Night Diff", holiday_pay: "Holiday Premium" };
        doc.text((typeLabels[log.type] || log.type).toUpperCase(), 50, y + 4.5);
        const unit = ["absent"].includes(log.type) ? "days" : ["late", "undertime"].includes(log.type) ? "m" : "h";
        doc.text(`${log.value}${unit}`, 100, y + 4.5);
        if (log.remarks) {
          const truncated = log.remarks.length > 50 ? log.remarks.substring(0, 47) + "..." : log.remarks;
          doc.text(truncated, 130, y + 4.5);
        }
        y += 6;
      });
      doc.setDrawColor(...black);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;
    }
    y += 10;
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
    const filename = `payslip_${payslip.employeeName.replace(/\s+/g, "_")}_${format(new Date(payslip.period || /* @__PURE__ */ new Date()), "yyyy-MM-dd")}.pdf`;
    doc.save(filename);
    toast({ title: "PDF Downloaded", description: "Payslip saved as PDF" });
  };
  const handlePrint = () => {
    if (!payslip) return;
    const doc = generatePDF(payslip);
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Loading" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "sr-only", children: "Loading payslip data..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" }) })
    ] }) });
  }
  if (error || !payslip) return null;
  const ndHrsDisplay = safeNumber(payslip.nightDiffHours);
  const rateDisplay = payslip.hourlyRate ? `@ PHP ${safeNumber(payslip.hourlyRate).toFixed(2)}/hr` : "";
  const earningsList = [
    { label: `Basic Pay (${safeNumber(payslip.regularHours).toFixed(1)}h ${rateDisplay})`, value: payslip.basicPay, isMoney: true },
    { label: `Overtime Pay (${safeNumber(payslip.overtimeHours).toFixed(1)}h × 125%)`, value: payslip.overtimePay, isMoney: true },
    { label: `Night Differential (${ndHrsDisplay.toFixed(1)}h × +10%)`, value: payslip.nightDifferential, isMoney: true },
    { label: "Holiday Pay", value: payslip.holidayPay, isMoney: true },
    { label: "Rest Day Premium", value: safeNumber(payslip.restDayPay), isMoney: true }
  ];
  const deductionsList = [
    { label: "SSS (MSC Bracketed, ÷ 2)", value: payslip.sssContribution },
    { label: "PhilHealth (5% / 2)", value: payslip.philHealthContribution },
    { label: "Pag-IBIG (MFS Capped)", value: payslip.pagibigContribution },
    { label: "BIR Tax (Annualized)", value: payslip.withholdingTax },
    ...payslip.sssLoan > 0 ? [{ label: "SSS Loan", value: payslip.sssLoan }] : [],
    ...payslip.pagibigLoan > 0 ? [{ label: "Pag-IBIG Loan", value: payslip.pagibigLoan }] : [],
    ...payslip.advances > 0 ? [{ label: "Cash Advances", value: payslip.advances }] : [],
    ...payslip.otherDeductions > 0 ? [{ label: "Other Deductions", value: payslip.otherDeductions }] : []
  ];
  const maxRows = Math.max(earningsList.length, deductionsList.length);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden bg-white text-black border-0 rounded-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: payslipStyles }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[85vh] w-full", style: { background: "#f8f8f8" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "payslip-preview-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "payslip-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "payslip-logo-box", children: payslip.companyLogoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: payslip.companyLogoUrl,
            alt: "Company Logo",
            style: { width: "100%", height: "100%", objectFit: "cover" }
          }
        ) : "Company Logo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "payslip-company-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: payslip.companyName || "PERO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: payslip.companyAddress || "Philippines" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "TIN: ",
            payslip.companyTin || "N/A"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "payslip-title", children: "PAYSLIP" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "payslip-info-table", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "EMPLOYEE NAME:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "PERIOD COVERED:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "value", children: [
            payslip.periodStart ? format(new Date(payslip.periodStart), "MMMM d") : "",
            " - ",
            payslip.periodEnd ? format(new Date(payslip.periodEnd), "MMMM d, yyyy") : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "POSITION:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.position }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "PAY DATE:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.payDate ? format(new Date(payslip.payDate), "MMMM d, yyyy") : payslip.periodEnd ? format(getPaymentDate(payslip.periodEnd), "MMMM d, yyyy") : "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "EMPLOYEE ID:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeeId || "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "DEPARTMENT:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.department || "Operations" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "TIN:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeeTin || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "SSS No.:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeeSss || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "PhilHealth:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeePhilhealth || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "label", children: "Pag-IBIG:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "value", children: payslip.employeePagibig || "—" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "payslip-combined-table", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "payslip-section-header", children: "EARNINGS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "payslip-section-header", children: "DEDUCTIONS" })
        ] }),
        Array.from({ length: maxRows }).map((_, i) => {
          const earn = earningsList[i];
          const ded = deductionsList[i];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "item-label", children: earn ? `${earn.label}:` : "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "item-amount", children: earn && (earn.isMoney !== false ? formatCurrency(Number(earn.value)) : earn.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "item-label", children: ded ? `${ded.label}:` : "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "item-amount", children: ded && formatCurrency(Number(ded.value)) })
          ] }, i);
        })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "payslip-summary-table", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "summary-label", children: "GROSS PAY:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "summary-amount", children: formatCurrency(payslip.grossPay) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "summary-label", children: "TOTAL DEDUCTIONS:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "summary-amount", children: formatCurrency(payslip.totalDeductions) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "payslip-net-pay-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, children: "NET PAY:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "summary-amount", children: formatCurrency(payslip.netPay) })
        ] })
      ] }) }),
      payslip.includedExceptions && payslip.includedExceptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 24, breakBefore: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#333", color: "white", padding: "8px 12px", fontSize: 13, fontWeight: "bold" }, children: "EXCEPTION LOG ADDENDUM (Included in Calculation)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#555", color: "white" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", border: "1px solid #999", textAlign: "left" }, children: "DATE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", border: "1px solid #999", textAlign: "left" }, children: "TYPE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", border: "1px solid #999", textAlign: "left" }, children: "DURATION" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px", border: "1px solid #999", textAlign: "left" }, children: "REMARKS" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: payslip.includedExceptions.map((log, idx) => {
            const bg = idx % 2 === 0 ? "#f9f9f9" : "white";
            const typeLabels = { late: "Lateness", undertime: "Undertime", absent: "Absence", overtime: "Overtime", rest_day_ot: "Rest Day OT", special_holiday_ot: "Special Hol OT", regular_holiday_ot: "Reg Hol OT", night_diff: "Night Diff", holiday_pay: "Holiday Premium" };
            const typeDisplay = (typeLabels[log.type] || log.type).toUpperCase();
            const unit = ["absent"].includes(log.type) ? "days" : ["late", "undertime"].includes(log.type) ? "m" : "h";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: bg }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 8px", border: "1px solid #ccc" }, children: format(new Date(log.startDate), "MMM d, yyyy") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 8px", border: "1px solid #ccc" }, children: typeDisplay }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "6px 8px", border: "1px solid #ccc" }, children: [
                log.value,
                unit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 8px", border: "1px solid #ccc" }, children: log.remarks || "—" })
            ] }, idx);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "payslip-footer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This is a computer-generated document. No signature required." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "For payroll inquiries: ",
          payslip.companyEmail || "hr@thecafe.com.ph"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "payslip-actions mt-6 flex gap-3 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 bg-black hover:bg-gray-800 text-white", onClick: handleDownloadPDF, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-2" }),
          " Download PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handlePrint,
            className: "flex-1 bg-white text-gray-800 border border-gray-400 hover:bg-gray-100 hover:text-gray-900",
            style: { color: "#1a1a1a", backgroundColor: "#ffffff", borderColor: "#9ca3af" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4 mr-2", style: { color: "#1a1a1a" } }),
              " Print"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Payslip Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "sr-only", children: "Detailed breakdown of earnings and deductions" })
    ] }) })
  ] }) });
}

export { PayslipPreview, PayslipPreview as default };
