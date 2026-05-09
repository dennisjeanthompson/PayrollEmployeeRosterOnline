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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
          <Typography variant="body2" color="text.secondary">Manage your leave requests</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="request tabs">
          <Tab icon={<CalendarMonthIcon fontSize="small"/>} iconPosition="start" label="Time Off" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabIndex} index={0}>
        <TimeOffTab />
      </CustomTabPanel>
    </Box>
  );
}

// ==========================================
// TIME OFF TAB
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
  const requests = Array.isArray(requestsData) ? requestsData : ((requestsData as any)?.requests || []);

  const { data: balancesData } = useQuery({
    queryKey: ['/api/leave-credits/my'],
  });
  const balances = Array.isArray(balancesData) ? balancesData : ((balancesData as any)?.credits || []);

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
      {/* Leave Balances hidden per user request */}

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
