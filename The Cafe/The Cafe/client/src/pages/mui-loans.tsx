import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';

export default function MuiLoans() {
  const { toast } = useToast();
  const theme = useTheme();

  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [hrNote, setHrNote] = useState('');

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['/api/loans/branch'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, hrApprovalNote }: { id: string, status: string, hrApprovalNote: string }) => {
      const res = await apiRequest('PUT', `/api/loans/${id}`, { status, hrApprovalNote });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loans/branch'] });
      toast({ title: 'Success', description: `Loan ${actionDialog}d successfully.` });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update loan status', variant: 'destructive' });
    }
  });

  const handleOpenDialog = (loan: any, action: 'approve' | 'reject') => {
    setSelectedLoan(loan);
    setActionDialog(action);
    setHrNote('');
  };

  const handleCloseDialog = () => {
    setSelectedLoan(null);
    setActionDialog(null);
    setHrNote('');
  };

  const submitAction = () => {
    if (!selectedLoan) return;
    if (actionDialog === 'reject' && !hrNote.trim()) {
      toast({ title: 'Required', description: 'You must provide a reason for rejection.', variant: 'destructive' });
      return;
    }
    updateStatusMutation.mutate({
      id: selectedLoan.id,
      status: actionDialog === 'approve' ? 'approved' : 'rejected',
      hrApprovalNote: hrNote
    });
  };

  const columns: GridColDef[] = [
    { field: 'employeeName', headerName: 'Employee', width: 180 },
    { field: 'loanType', headerName: 'Type', width: 120, renderCell: (params) => (
      <Chip 
        label={params.value} 
        size="small" 
        color={params.value === 'SSS' ? 'primary' : 'error'} 
        variant="outlined" 
      />
    )},
    { field: 'referenceNumber', headerName: 'Ref Number', width: 160 },
    { field: 'accountNumber', headerName: 'Account Num', width: 160 },
    { field: 'totalAmount', headerName: 'Total Loan', width: 130, valueFormatter: (value: any) => {
        const val = value?.value || value;
        return val ? `₱${Number(val).toFixed(2)}` : '₱0.00';
    }},
    { field: 'remainingBalance', headerName: 'Remaining Bal.', width: 140, renderCell: (params: GridRenderCellParams) => (
      <Typography variant="body2" color="error.main" sx={{ pt: 1.5 }}>{params.row.remainingBalance ? `₱${Number(params.row.remainingBalance).toFixed(2)}` : '₱0.00'}</Typography>
    )},
    { field: 'monthlyAmortization', headerName: 'Monthly Amort.', width: 140, renderCell: (params: GridRenderCellParams) => {
        if (params.row.status === 'completed') return <Typography variant="body2" sx={{ pt: 1.5 }}>₱0.00</Typography>;
        return <Typography variant="body2" sx={{ pt: 1.5 }}>{params.row.monthlyAmortization ? `₱${Number(params.row.monthlyAmortization).toFixed(2)}` : '₱0.00'}</Typography>;
    }},
    { field: 'deductionStartDate', headerName: 'Start Cutoff', width: 140, valueFormatter: (params: any) => {
        try { 
          const val = params?.value || params;
          return val ? format(new Date(val), 'MMM d, yyyy') : '—'; 
        } catch { return 'Invalid Date'; }
    }},
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) => {
        let color: 'warning' | 'success' | 'error' = 'warning';
        if (params.value === 'approved') color = 'success';
        if (params.value === 'rejected') color = 'error';
        return <Chip label={params.value.toUpperCase()} size="small" color={color} />;
    }},
    { field: 'actions', headerName: 'Verification (DOLE Art.113)', width: 200, renderCell: (params: GridRenderCellParams) => {
        if (params.row.status !== 'pending') return null;
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Verify Proof Document">
              <IconButton size="small" color="primary" onClick={() => {
                const renderUrl = params.row.proofFileUrl?.replace(/\.pdf$/i, '.jpg');
                window.open(renderUrl || params.row.proofFileUrl, '_blank');
              }}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Signed Authorization Form (DOLE Art. 113)">
              <IconButton size="small" color="info" onClick={() => {
                window.open(params.row.proofFileUrl, '_blank');
              }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button size="small" variant="contained" color="success" onClick={() => handleOpenDialog(params.row, 'approve')}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleOpenDialog(params.row, 'reject')}>
              Reject
            </Button>
          </Box>
        );
    }}
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4, width: '100%', maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">Government Loans</Typography>
          <Typography variant="body2" color="text.secondary">
            DOLE Art. 113 Compliant Verification Queue. Approve SSS or Pag-IBIG loans to map them into the payroll engine.
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ height: 600, width: '100%', border: `1px solid ${theme.palette.divider}` }}>
        <DataGrid
          rows={loans}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] }
          }}
          pageSizeOptions={[10, 15, 25, 50]}
          sx={{ border: 0 }}
        />
      </Paper>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!actionDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: actionDialog === 'approve' ? 'success.main' : 'error.main' }}>
          {actionDialog === 'approve' ? 'Approve Loan Deduction' : 'Reject Loan Request'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLoan && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                You are about to {actionDialog} a <strong>{selectedLoan.loanType}</strong> loan for <strong>{selectedLoan.employeeName}</strong>.
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2"><strong>Ref #:</strong> {selectedLoan.referenceNumber}</Typography>
                <Typography variant="body2"><strong>Acct #:</strong> {selectedLoan.accountNumber}</Typography>
                <Typography variant="body2"><strong>Total Amount:</strong> ₱{Number(selectedLoan.totalAmount).toFixed(2)}</Typography>
                <Typography variant="body2" color="error.main"><strong>Remaining Bal.:</strong> ₱{Number(selectedLoan.remainingBalance).toFixed(2)}</Typography>
                <Typography variant="body2" color="primary.main"><strong>Monthly Deduction:</strong> ₱{Number(selectedLoan.monthlyAmortization).toFixed(2)}</Typography>
                <Typography variant="body2"><strong>Starts On:</strong> {
                  selectedLoan.deductionStartDate 
                    ? (() => { try { return format(new Date(selectedLoan.deductionStartDate), 'MMMM d, yyyy'); } catch { return 'Invalid Date'; } })()
                    : '—'
                }</Typography>
              </Box>

              <TextField
                label={actionDialog === 'reject' ? "Reason for Rejection (Required)" : "HR / Admin Note (Optional)"}
                multiline
                rows={3}
                fullWidth
                value={hrNote}
                onChange={(e) => setHrNote(e.target.value)}
                required={actionDialog === 'reject'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color={actionDialog === 'approve' ? 'success' : 'error'}
            onClick={submitAction}
            disabled={updateStatusMutation.isPending || (actionDialog === 'reject' && !hrNote.trim())}
            startIcon={actionDialog === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            Confirm {actionDialog === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
