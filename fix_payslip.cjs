const fs = require('fs');

let text = fs.readFileSync('client/src/components/payroll/payslip-preview.tsx', 'utf8');
text = text.replace(/payDate\?: string;/g, 'runType?: string;');
text = text.replace(/let payDate = "";/g, 'let runTypeStr = "";');
text = text.replace(/if \(payslipData.payDate\) {/g, 'if (payslipData.runType) {');
text = text.replace(/payDate = format\(new Date\(payslipData.payDate\), "MMMM d, yyyy"\);/g, 'runTypeStr = String(payslipData.runType);');
text = text.replace(/payDate = format\(getPaymentDate\(payslipData.periodEnd\), "MMMM d, yyyy"\);/g, 'runTypeStr = "Regular";');
text = text.replace(/y = drawInfoRow\(y, "POSITION:", payslipData.position, "PAY DATE:", payDate\);/g, 'y = drawInfoRow(y, "POSITION:", payslipData.position, "RUN TYPE:", runTypeStr);');
text = text.replace(/\{payslip.payDate\s*\n*\s*\?\s*format\(new Date\(payslip.payDate\), "MMMM d, yyyy"\)\s*\n*\s*:\s*format\(getPaymentDate\(payslip.periodEnd\), "MMMM d, yyyy"\)\}/g, '{String(payslip.runType || "Regular")}');
fs.writeFileSync('client/src/components/payroll/payslip-preview.tsx', text);

let pdf = fs.readFileSync('client/src/lib/payslip-pdf.ts', 'utf8');
pdf = pdf.replace(/payDate: string;/g, 'runType: string;');
pdf = pdf.replace(/doc.text\(\`Pay Date: \$\{data.payDate\}\`, pageWidth - margin - 3, y \+ 5.5, \{ align: 'right' \}\);/g, 'doc.text(\`Run Type: \${data.runType || "Regular"}\`, pageWidth - margin - 3, y + 5.5, { align: "right" });');
fs.writeFileSync('client/src/lib/payslip-pdf.ts', pdf);
