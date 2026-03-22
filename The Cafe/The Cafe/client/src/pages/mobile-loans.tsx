import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
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
  alpha
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { format } from 'date-fns';

export default function MobileLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const theme = useTheme();

  const [openDialog, setOpenDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    loanType: 'SSS',
    referenceNumber: '',
    accountNumber: '',
    totalAmount: '',
    monthlyAmortization: '',
    deductionStartDate: '',
    proofFileUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: loans = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/loans/my'],
  });

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
      toast({ title: 'Submission Failed', description: error.message || 'Error auto-verifying duplicate loan overlap.', variant: 'destructive' });
    }
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      loanType: 'SSS',
      referenceNumber: '',
      accountNumber: '',
      totalAmount: '',
      monthlyAmortization: '',
      deductionStartDate: '',
      proofFileUrl: ''
    });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // 1. Get Signature
    const pubId = `loan_${user?.id}_${Date.now()}`;
    const sigRes = await fetch(`/api/employees/upload-signature?folder=loans&public_id=${pubId}`);
    if (!sigRes.ok) throw new Error("Failed to get upload signature");
    
    const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

    // 2. Upload to Cloudinary
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
        totalAmount: formData.totalAmount,
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
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1.5 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>My Loans</Typography>
            <Typography variant="body2" color="text.secondary">Government Loan Deductions</Typography>
          </Box>
        </Box>
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
          <Typography color="text.secondary">No loan requests found.</Typography>
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
                    <Typography variant="caption" color="text.secondary" display="block">Remaining Bal.</Typography>
                    <Typography variant="body2" fontWeight={500} color="error.main">₱{Number(loan.remainingBalance).toFixed(2)}</Typography>
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

      {/* New Loan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Apply for Branch Payroll Deduction</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 2, pt: 3 }}>
            
            <TextField
              select
              label="Loan Type"
              fullWidth
              required
              value={formData.loanType}
              onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
            >
              <MenuItem value="SSS">SSS Salary / Calamity Loan</MenuItem>
              <MenuItem value="Pag-IBIG">Pag-IBIG Multi-Purpose / Calamity Loan</MenuItem>
            </TextField>

            <TextField
              label="Reference Number"
              fullWidth
              required
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              helperText="Important: Must match your approved SSS/Pag-IBIG voucher"
            />

            <TextField
              label="Biller Account Number"
              fullWidth
              required
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />

            <TextField
              label="Total Approved Loan Amount (₱)"
              type="number"
              fullWidth
              required
              inputProps={{ min: "1", step: "0.01" }}
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
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

            <TextField
              label="Deduction Start Cut-off"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.deductionStartDate}
              onChange={(e) => setFormData({ ...formData, deductionStartDate: e.target.value })}
            />

            {/* File Upload UI */}
            <Box sx={{ border: `1px dashed ${theme.palette.primary.main}`, borderRadius: 2, p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="proof-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="proof-upload">
                <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} sx={{ textTransform: 'none' }}>
                  {selectedFile ? 'Change Proof Document' : 'Upload Proof Document'}
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>
                  {selectedFile.name}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Screenshot or PDF from SSS / Pag-IBIG showing approval & amount.
              </Typography>
            </Box>

          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={isUploading || submitMutation.isPending}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isUploading || submitMutation.isPending}
            >
              {isUploading || submitMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Submit Requisition'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
