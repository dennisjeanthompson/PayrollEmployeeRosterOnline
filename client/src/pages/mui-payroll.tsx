import PesoIcon from "@/components/PesoIcon";
import { lazy, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { useRealtime } from "@/hooks/use-realtime";
import { motion } from "framer-motion";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  alpha,
  useTheme,
  Skeleton,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import {
  AccessTime as ClockIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Tune as AdjustmentIcon,
} from "@mui/icons-material";
import { getPaymentDate } from "@shared/payroll-dates";

const DigitalPayslip = lazy(() => import("@/components/payroll/payslip-preview"));

interface PayrollEntry {
  id: string;
  userId: string;
  payrollPeriodId: string;
  totalHours: number | string;
  regularHours: number | string;
  overtimeHours: number | string;
  grossPay: number | string;
  deductions: number | string;
  netPay: number | string;
  status: string;
  createdAt: string;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  paidAt?: string | null;
}

interface PayrollPeriod {
  id: string;
  branchId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalHours?: number;
  totalPay?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MuiPayroll() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);

  // Enable real-time updates
  useRealtime({ 
    queryKeys: ["payroll-entries"],
    enabled: !!currentUser
  });

  // Fetch payroll entries for current user with real-time updates
  const { data: payrollData, isLoading: payrollLoading, refetch: refetchPayroll } = useQuery({
    queryKey: ["payroll-entries"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payroll");
      return response.json();
    },
    enabled: !!currentUser,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const payrollEntries = useMemo<PayrollEntry[]>(() => payrollData?.entries || [], [payrollData?.entries]);
  const currentEntry = useMemo(
    () => payrollEntries.find((e) => e.status === "draft" || e.status === "pending"),
    [payrollEntries]
  );
  const paidEntries = useMemo(() => payrollEntries.filter((e) => e.status === "paid"), [payrollEntries]);

  // Calculate summary stats
  const totalEarningsYTD = useMemo(
    () => paidEntries.reduce((sum, entry) => sum + parseFloat(String(entry.netPay || 0)), 0),
    [paidEntries]
  );
  const totalHoursYTD = useMemo(
    () => paidEntries.reduce((sum, entry) => sum + parseFloat(String(entry.totalHours || 0)), 0),
    [paidEntries]
  );
  const averagePay = useMemo(
    () => (paidEntries.length > 0 ? totalEarningsYTD / paidEntries.length : 0),
    [paidEntries.length, totalEarningsYTD]
  );

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleViewPayslip = (entry: PayrollEntry) => {
    setSelectedPayslip(entry);
    setPayslipDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha('#111', 0.9)} 50%, ${alpha(theme.palette.success.dark, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, #fff 50%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            {/* Decorative orbs */}
            <Box sx={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -80, left: -20, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: -0.5 }}>
                  My Payroll
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                  View your earnings, payslips, and payment history • Updates in real-time
                </Typography>
              </Box>
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
                <Tooltip title="Refresh data">
                  <IconButton
                    onClick={() => {
                      refetchPayroll();
                    }}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </Stack>
          </Box>
        </motion.div>

        {payrollLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'YTD Earnings', value: formatCurrency(totalEarningsYTD), icon: <PesoIcon fontSize="small" />, color: theme.palette.success.main },
            { label: 'Total Hours', value: `${totalHoursYTD.toFixed(1)}h`, icon: <ClockIcon fontSize="small" />, color: theme.palette.primary.main },
            { label: 'Average Pay', value: formatCurrency(averagePay), icon: <TrendingUpIcon fontSize="small" />, color: theme.palette.info.main },
            { label: 'Pay Periods', value: String(paidEntries.length), icon: <ReceiptIcon fontSize="small" />, color: theme.palette.secondary.main },
          ].map((stat, idx) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(stat.color, 0.15)}`,
                    boxShadow: `0 4px 20px ${alpha(stat.color, 0.08)}`,
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      borderColor: alpha(stat.color, 0.35),
                      boxShadow: `0 8px 30px ${alpha(stat.color, 0.15)}`,
                    },
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(stat.color, 0.1)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, position: 'relative', zIndex: 1 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(stat.color, 0.12), color: stat.color }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
                      {stat.label}
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight={800} noWrap sx={{ position: 'relative', zIndex: 1, letterSpacing: -0.3 }}>
                    {stat.value}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Current Period Card */}
        <Box sx={{ mb: 4, minHeight: 220 }}>
          {payrollLoading && !currentEntry ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                minHeight: 220,
                bgcolor: alpha(theme.palette.background.paper, 0.55),
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <Stack spacing={2}>
                <Skeleton variant="text" width={180} height={34} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="text" width="45%" height={20} />
                    <Skeleton variant="text" width="65%" height={44} />
                    <Skeleton variant="text" width="75%" height={16} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="text" width="45%" height={20} />
                    <Skeleton variant="text" width="60%" height={44} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="text" width="55%" height={20} />
                    <Skeleton variant="text" width="70%" height={44} />
                    <Skeleton variant="text" width="65%" height={16} />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          ) : currentEntry ? (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Paper
                elevation={theme.palette.mode === 'dark' ? 0 : 8}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, #111 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.4)' : `0 16px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <Box sx={{ position: 'absolute', top: -100, right: -50, width: 250, height: 250, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)` }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Current Pay Period
                  </Typography>
                  <Chip
                    label={currentEntry.status.toUpperCase()}
                    color={currentEntry.status === "pending" ? "warning" : "default"}
                    size="small"
                  />
                </Stack>

                <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Hours Worked
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {parseFloat(String(currentEntry.totalHours)).toFixed(1)}h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Regular: {parseFloat(String(currentEntry.regularHours)).toFixed(1)}h | OT: {parseFloat(String(currentEntry.overtimeHours)).toFixed(1)}h
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Gross Pay
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {formatCurrency(currentEntry.grossPay)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Before deductions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Net Pay
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {formatCurrency(currentEntry.netPay)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        After {formatCurrency(currentEntry.deductions)} deductions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                minHeight: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.background.paper, 0.55),
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No current pay period
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You’ll see the active payroll cycle here once it’s created.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: alpha(theme.palette.divider, 0.1),
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                minHeight: 56,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab icon={<HistoryIcon />} iconPosition="start" label="Payment History" />
            <Tab icon={<ReceiptIcon />} iconPosition="start" label="Payslips" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>
              {paidEntries.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <HistoryIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No payment history yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Your paid payroll entries will appear here
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {/* Desktop Table View */}
                  <TableContainer sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Pay Period</TableCell>
                          <TableCell align="right">Hours</TableCell>
                          <TableCell align="right">Gross Pay</TableCell>
                          <TableCell align="right">Deductions</TableCell>
                          <TableCell align="right">Net Pay</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paidEntries.map((entry) => (
                          <TableRow key={entry.id} hover>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <CalendarIcon fontSize="small" color="action" />
                                <Box>
                                  {entry.periodStartDate && entry.periodEndDate ? (
                                    <>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {format(new Date(entry.periodStartDate), "MMM d")} – {format(new Date(entry.periodEndDate), "MMM d, yyyy")}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Paid {entry.paidAt
                                          ? format(new Date(entry.paidAt), "MMM d, yyyy")
                                          : format(getPaymentDate(entry.periodEndDate!), "MMM d, yyyy")}
                                      </Typography>
                                    </>
                                  ) : (
                                    <span>{format(parseISO(entry.createdAt), "MMM d, yyyy")}</span>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{parseFloat(String(entry.totalHours)).toFixed(1)}h</TableCell>
                            <TableCell align="right">{formatCurrency(entry.grossPay)}</TableCell>
                            <TableCell align="right" sx={{ color: "error.main" }}>
                              -{formatCurrency(entry.deductions)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatCurrency(entry.netPay)}
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <Chip 
                                  icon={<AdjustmentIcon sx={{ fontSize: '14px !important' }} />}
                                  label="Audit Trail" 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ color: 'info.main', borderColor: alpha(theme.palette.info.main, 0.4), fontWeight: 600 }}
                                />
                                <Chip
                                  label="Paid"
                                  color="success"
                                  size="small"
                                  icon={<CheckCircleIcon />}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="View digital payslip (PH — Compliant 2026)">
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => handleViewPayslip(entry)}
                                  >
                                    <DescriptionIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download PDF">
                                  <IconButton size="small" onClick={() => handleViewPayslip(entry)}>
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Mobile Card View */}
                  <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, overflowX: 'hidden' }}>
                    {paidEntries.map((entry) => (
                      <Paper 
                        key={entry.id}
                        variant="outlined" 
                        sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            {entry.periodStartDate && entry.periodEndDate ? (
                              <>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {format(new Date(entry.periodStartDate), "MMM d")} – {format(new Date(entry.periodEndDate), "MMM d, yyyy")}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  Paid {entry.paidAt
                                    ? format(new Date(entry.paidAt), "MMM d, yyyy")
                                    : format(getPaymentDate(entry.periodEndDate!), "MMM d, yyyy")}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{format(parseISO(entry.createdAt), "MMM d, yyyy")}</Typography>
                            )}
                          </Box>
                          <Chip label="Paid" color="success" size="small" icon={<CheckCircleIcon />} sx={{ height: 24, flexShrink: 0 }} />
                        </Box>
                        
                        <Divider />
                        
                        <Grid container spacing={1}>
                          <Grid size={{xs: 4}}>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>Hours</Typography>
                            <Typography variant="body2" fontWeight={600} noWrap>{parseFloat(String(entry.totalHours)).toFixed(1)}h</Typography>
                          </Grid>
                          <Grid size={{xs: 4}}>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>Gross</Typography>
                            <Typography variant="body2" fontWeight={600} noWrap>{formatCurrency(entry.grossPay)}</Typography>
                          </Grid>
                          <Grid size={{xs: 4}}>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>Deductions</Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main" noWrap>-{formatCurrency(entry.deductions)}</Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                          <Typography variant="body2" fontWeight={700}>Net Pay</Typography>
                          <Typography variant="h6" fontWeight={800} color="success.main" noWrap>{formatCurrency(entry.netPay)}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<DescriptionIcon />}
                            onClick={() => handleViewPayslip(entry)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            View Payslip
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={2}>
                {paidEntries.map((entry, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          cursor: "pointer",
                          bgcolor: alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "border-color 0.3s, box-shadow 0.3s",
                          "&:hover": {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                        }}
                        onClick={() => handleViewPayslip(entry)}
                      >
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)` }} />
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44 }}>
                            <ReceiptIcon />
                          </Avatar>
                          <Stack direction="row" spacing={1}>
                            <Chip 
                              icon={<AdjustmentIcon sx={{ fontSize: '12px !important' }} />}
                              label="Audit Trail" 
                              size="small" 
                              sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 700, fontSize: '0.65rem', borderRadius: 1.5 }}
                            />
                            <Chip 
                              label="Paid" 
                              size="small" 
                              color="success" 
                              sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }} 
                            />
                          </Stack>
                        </Stack>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.5, display: 'block', position: 'relative', zIndex: 1 }}>
                          Pay Period
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary', position: 'relative', zIndex: 1 }}>
                          {entry.periodStartDate && entry.periodEndDate
                            ? `${format(new Date(entry.periodStartDate), "MMM d")} – ${format(new Date(entry.periodEndDate), "MMM d, yyyy")}`
                            : format(parseISO(entry.createdAt), "MMMM d, yyyy")}
                        </Typography>
                        <Divider sx={{ my: 2, opacity: 0.6 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Net Pay
                          </Typography>
                          <Typography variant="h5" fontWeight={900} color="success.main" lineHeight={1}>
                            {formatCurrency(entry.netPay)}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
        </motion.div>

        {/* Digital Payslip Viewer (PH-Compliant 2026) */}
        {selectedPayslip && (
          <Suspense fallback={null}>
            <DigitalPayslip
              entryId={selectedPayslip.id}
              open={payslipDialogOpen}
              onOpenChange={setPayslipDialogOpen}
            />
          </Suspense>
        )}
      </Box>
    </>
  );
}