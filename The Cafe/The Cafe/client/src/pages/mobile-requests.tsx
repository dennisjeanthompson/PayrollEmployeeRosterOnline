import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  useTheme,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MobileRequests() {
  const { user } = useAuth();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssignmentIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1.5 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>Employee Requests</Typography>
          <Typography variant="body2" color="text.secondary">Manage your leaves and loans</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="request tabs">
          <Tab icon={<CalendarMonthIcon fontSize="small"/>} iconPosition="start" label="Time Off / SIL" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<AccountBalanceWalletIcon fontSize="small"/>} iconPosition="start" label="Loans" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabIndex} index={0}>
        <TimeOffTab />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        <LoansTab user={user} theme={theme} />
      </CustomTabPanel>
    </Box>
  );
}

// ==========================================
// TIME OFF / SIL TAB
// ==========================================
function TimeOffTab() {
  const { toast } = useToast();
  const theme = useTheme();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['/api/time-off-requests'],
  });
  const requests = Array.isArray(requestsData) ? requestsData : (requestsData?.requests || []);

  const { data: balancesData } = useQuery({
    queryKey: ['/api/leave-credits/my'],
  });
  const balances = Array.isArray(balancesData) ? balancesData : (balancesData?.credits || []);

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/time-off-requests', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-off-requests/my'] });
      toast({ title: 'Success', description: 'Time off request submitted.' });
      setOpenDialog(false);
      setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Failed to submit request', variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({ title: 'Invalid Dates', description: 'End date must be after start date.', variant: 'destructive' });
      return;
    }
    submitMutation.mutate({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Leave Requests</Typography>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 6, textTransform: 'none' }}
        >
          Request
        </Button>
      </Box>

      {/* Balance Summary */}
      <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 1, mt: -1 }}>Available Leave Balances (Year-End)</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="caption" color="text.secondary">SIL</Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {balances?.find((b: any) => b.leaveType === 'SIL')?.remainingCredits || 0}
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
          <Typography variant="caption" color="text.secondary">Vacation</Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {balances?.find((b: any) => b.leaveType === 'Vacation')?.remainingCredits || 0}
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Typography variant="caption" color="text.secondary">Sick</Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {balances?.find((b: any) => b.leaveType === 'Sick')?.remainingCredits || 0}
          </Typography>
        </Card>
      </Box>

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : requests.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }}>
          <Typography color="text.secondary">No leave requests found.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {requests.map((req: any) => (
            <Card key={req.id} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{req.type} Leave</Typography>
                  <Chip 
                    label={req.status.toUpperCase()} 
                    size="small" 
                    color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'} 
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>"{req.reason}"</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Request Time Off</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 2, pt: 3 }}>
            <TextField
              select
              label="Leave Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="vacation">Vacation Leave</MenuItem>
              <MenuItem value="sick">Sick Leave</MenuItem>
              <MenuItem value="emergency">Emergency Leave</MenuItem>
              <MenuItem value="personal">Personal Leave</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(newValue) => setFormData({ ...formData, startDate: newValue ? format(newValue, 'yyyy-MM-dd') : '' })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(newValue) => setFormData({ ...formData, endDate: newValue ? format(newValue, 'yyyy-MM-dd') : '' })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Box>
            </LocalizationProvider>
            <TextField
              label="Reason (Required)"
              fullWidth
              required
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

// ==========================================
// GOVERNMENT LOANS TAB
// ==========================================
function LoansTab({ user, theme }: any) {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    loanType: 'SSS',
    referenceNumber: '',
    accountNumber: '',
    monthlyAmortization: '',
    deductionStartDate: '',
    proofFileUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: loansRaw, isLoading } = useQuery({ queryKey: ['/api/loans/my'] });
  const loans: any[] = Array.isArray(loansRaw) ? loansRaw : (loansRaw as any)?.loans || [];

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/loans', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loans/my'] });
      toast({ title: 'Success', description: 'Loan request submitted successfully.' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Submission Failed', description: error.message || 'Error parsing loan details.', variant: 'destructive' });
    }
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ loanType: 'SSS', referenceNumber: '', accountNumber: '', monthlyAmortization: '', deductionStartDate: '', proofFileUrl: '' });
    setSelectedFile(null);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const pubId = `loan_${user?.id}_${Date.now()}`;
    const sigRes = await fetch(`/api/employees/upload-signature?folder=loans&public_id=${pubId}`);
    if (!sigRes.ok) throw new Error("Failed to get upload signature");
    
    const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("api_key", apiKey);
    formDataObj.append("timestamp", timestamp.toString());
    formDataObj.append("signature", signature);
    formDataObj.append("folder", "loans");
    formDataObj.append("public_id", pubId);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formDataObj,
    });

    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: 'Proof Required', description: 'Please upload a proof document.', variant: 'destructive' });
      return;
    }

    try {
      setIsUploading(true);
      const fileUrl = await uploadToCloudinary(selectedFile);
      const payload = {
        userId: user!.id,
        branchId: user!.branchId,
        loanType: formData.loanType,
        referenceNumber: formData.referenceNumber,
        accountNumber: formData.accountNumber,
        monthlyAmortization: formData.monthlyAmortization,
        deductionStartDate: new Date(formData.deductionStartDate).toISOString(),
        proofFileUrl: fileUrl
      };
      submitMutation.mutate(payload);
    } catch (err: any) {
      toast({ title: 'Upload Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Active Loans & Payroll Deductions</Typography>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 6, textTransform: 'none' }}
        >
          New Loan
        </Button>
      </Box>

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : loans.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }}>
          <Typography color="text.secondary">No active loan requests found.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loans.map((loan: any) => (
            <Card key={loan.id} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography fontWeight="bold">{loan.loanType} Loan</Typography>
                  <Chip 
                    label={loan.status.toUpperCase()} 
                    size="small" 
                    color={loan.status === 'approved' ? 'success' : loan.status === 'rejected' ? 'error' : 'warning'} 
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Ref Number</Typography>
                    <Typography variant="body2" fontWeight={500}>{loan.referenceNumber}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Deduction Starts</Typography>
                    <Typography variant="body2" fontWeight={500}>{format(new Date(loan.deductionStartDate), 'MMM d, yyyy')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Acct Number</Typography>
                    <Typography variant="body2" fontWeight={500}>{loan.accountNumber}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Monthly Amort.</Typography>
                    <Typography variant="body2" fontWeight={500} color="primary.main">₱{Number(loan.monthlyAmortization).toFixed(2)}</Typography>
                  </Box>
                </Box>

                {loan.hrApprovalNote && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 1.5 }}>
                    <Typography variant="caption" color="error" fontWeight="bold">HR Note:</Typography>
                    <Typography variant="body2" color="error">{loan.hrApprovalNote}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Register Payroll Deduction</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 2, pt: 3 }}>
            <TextField
              select
              label="Loan Type"
              fullWidth
              required
              value={formData.loanType}
              onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
            >
              <MenuItem value="SSS">SSS</MenuItem>
              <MenuItem value="Pag-IBIG">Pag-IBIG</MenuItem>
            </TextField>
            <TextField
              label="Reference Number"
              fullWidth
              required
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            />
            <TextField
              label="Biller Account Number"
              fullWidth
              required
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <TextField
              label="Monthly Amortization (₱)"
              type="number"
              fullWidth
              required
              inputProps={{ min: "1", step: "0.01" }}
              value={formData.monthlyAmortization}
              onChange={(e) => setFormData({ ...formData, monthlyAmortization: e.target.value })}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deduction Start Cut-off"
                value={formData.deductionStartDate ? new Date(formData.deductionStartDate) : null}
                onChange={(newValue) => setFormData({ ...formData, deductionStartDate: newValue ? format(newValue, 'yyyy-MM-dd') : '' })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
            <Box sx={{ border: `1px dashed ${theme.palette.primary.main}`, borderRadius: 2, p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="proof-upload"
                type="file"
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
              />
              <label htmlFor="proof-upload">
                <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} sx={{ textTransform: 'none' }}>
                  {selectedFile ? 'Change Proof Document' : 'Upload Proof Document'}
                </Button>
              </label>
              {selectedFile && <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>{selectedFile.name}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={isUploading || submitMutation.isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isUploading || submitMutation.isPending}>
              {isUploading || submitMutation.isPending ? <CircularProgress size={24} /> : 'Submit Requisition'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
