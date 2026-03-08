import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { PayslipData, formatPHP, formatPayslipDate, formatPayPeriod, maskId } from '@shared/payslip-types';

// Helvetica is a built-in font in @react-pdf/renderer — no registration needed

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10
  },
  companyInfo: {
    flexDirection: 'column'
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  companyDetails: {
    fontSize: 9,
    color: '#6b7280'
  },
  payslipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right'
  },
  payslipMeta: {
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4,
    color: '#6b7280'
  },
  employeeSection: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20
  },
  employeeName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2
  },
  employeeRole: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 8
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  col: {
    width: '25%',
    marginBottom: 4
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  tablesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },
  table: {
    flex: 1
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6'
  },
  rowLabel: {
    flex: 1,
    fontSize: 9
  },
  rowValue: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  subtext: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 1
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  netPaySection: {
    backgroundColor: '#ecfdf5', // emerald-50
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1fae5'
  },
  netPayLabel: {
    fontSize: 12,
    color: '#065f46', // emerald-800
    fontWeight: 'bold'
  },
  netPayValue: {
    fontSize: 20,
    color: '#059669', // emerald-600
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af'
  }
});

interface PayslipPDFProps {
  data: PayslipData;
}

export const PayslipPDF: React.FC<PayslipPDFProps> = ({ data }) => {
  const employerContributionsTotal = data.employer_contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text style={styles.companyDetails}>{data.company.address}</Text>
            <Text style={styles.companyDetails}>TIN: {data.company.tin}</Text>
          </View>
          <View>
            <Text style={styles.payslipTitle}>PAYSLIP</Text>
            <Text style={styles.payslipMeta}>ID: {data.payslip_id}</Text>
            <Text style={styles.payslipMeta}>{formatPayPeriod(data.pay_period.start, data.pay_period.end)}</Text>
            <Text style={styles.payslipMeta}>Date: {formatPayslipDate(data.pay_period.payment_date)}</Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.employeeSection}>
          <Text style={styles.employeeName}>{data.employee.name}</Text>
          <Text style={styles.employeeRole}>{data.employee.position} • {data.employee.department}</Text>
          
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Employee ID</Text>
              <Text style={styles.value}>{data.employee.id}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>TIN</Text>
              <Text style={styles.value}>{maskId(data.employee.tin)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>SSS</Text>
              <Text style={styles.value}>{maskId(data.employee.sss)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Pag-IBIG</Text>
              <Text style={styles.value}>{maskId(data.employee.pagibig)}</Text>
            </View>
          </View>
        </View>

        {/* Earnings & Deductions Tables */}
        <View style={styles.tablesContainer}>
          {/* Earnings */}
          <View style={styles.table}>
            <Text style={styles.tableHeader}>EARNINGS</Text>
            
            {data.earnings.map((earning, i) => (
              <View key={i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{earning.label}</Text>
                  {earning.hours !== undefined && (
                    <Text style={styles.subtext}>
                      {earning.hours.toFixed(1)} hrs {earning.rate ? `× ${formatPHP(earning.rate)}` : ''} 
                      {earning.multiplier ? ` (${earning.multiplier}%)` : ''}
                    </Text>
                  )}
                </View>
                <Text style={styles.rowValue}>{formatPHP(earning.amount)}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Gross Pay</Text>
              <Text style={styles.totalValue}>{formatPHP(data.gross)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.table}>
            <Text style={styles.tableHeader}>DEDUCTIONS</Text>
            
            {data.deductions.map((deduction, i) => (
              <View key={i} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{deduction.label}</Text>
                  {deduction.loan_balance !== undefined && (
                    <Text style={styles.subtext}>Bal: {formatPHP(deduction.loan_balance)}</Text>
                  )}
                </View>
                <Text style={{ ...styles.rowValue, color: '#dc2626' }}>({formatPHP(deduction.amount)})</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Deductions</Text>
              <Text style={{ ...styles.totalValue, color: '#dc2626' }}>({formatPHP(data.total_deductions)})</Text>
            </View>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPaySection}>
          <Text style={styles.netPayLabel}>NET PAY</Text>
          <Text style={styles.netPayValue}>{formatPHP(data.net_pay)}</Text>
        </View>

        {/* YTD Summary */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Year-to-Date Summary</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>YTD Gross</Text>
              <Text style={styles.value}>{formatPHP(data.ytd.gross)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>YTD Deductions</Text>
              <Text style={styles.value}>{formatPHP(data.ytd.deductions)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>YTD Net</Text>
              <Text style={styles.value}>{formatPHP(data.ytd.net)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Verified Payslip Code: {data.verification_code.toUpperCase()}</Text>
            <Text style={styles.footerText}>Generated: {formatPayslipDate(data.generated_at || new Date().toISOString())}</Text>
          </View>
          <View>
            <Text style={styles.footerText}>This is a system generated document.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PayslipPDF;
