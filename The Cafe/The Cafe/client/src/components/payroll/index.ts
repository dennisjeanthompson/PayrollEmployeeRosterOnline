/**
 * Payroll Components Index
 * 
 * Export all payroll-related components for the Philippine Payroll System.
 */

// Main payslip preview modal (Excel-Style Grid Layout)
export { PayslipPreview, default as PayslipPreviewDefault } from './payslip-preview';

// Alias for backward compatibility
export { default as DigitalPayslip } from './payslip-preview';

// Full-featured payslip viewer with print/download (used by mobile-payroll)
export { default as PayslipViewer } from './payslip-viewer';

// PDF generation component using @react-pdf/renderer
export { default as PayslipPDF } from './PayslipPDF';

