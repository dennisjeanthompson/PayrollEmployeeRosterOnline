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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
          <Typography variant="body2" color="text.secondary">Manage your requests</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="request tabs" variant="scrollable" scrollButtons="auto">
          <Tab icon={<CalendarMonthIcon fontSize="small"/>} iconPosition="start" label="Time Off" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<AccessTimeIcon fontSize="small"/>} iconPosition="start" label="Overtime" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab icon={<SwapHorizIcon fontSize="small"/>} iconPosition="start" label="Shift Trades" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabIndex} index={0}>
        <TimeOffTab />
      </CustomTabPanel>

      <CustomTabPanel value={tabIndex} index={1}>
        <OvertimeTab />
      </CustomTabPanel>

      <CustomTabPanel value={tabIndex} index={2}>
        <ShiftTradesTab />
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

// ==========================================
// SHIFT TRADES TAB
// ==========================================
function ShiftTradesTab() {
  const { user } = useAuth();
  const theme = useTheme();

  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['/api/shift-trades'],
  });
  const trades = Array.isArray(tradesData) ? tradesData : ((tradesData as any)?.trades || []);

  const myTrades = trades.filter((t: any) =>
    t.fromUserId === user?.id || t.toUserId === user?.id
  );

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>My Shift Trades</Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : myTrades.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }}>
          <SwapHorizIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No shift trade requests found.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {myTrades.map((trade: any) => {
            const isRequester = trade.fromUserId === user?.id;
            return (
              <Card key={trade.id} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight="bold">
                      {isRequester ? 'Trade Request Sent' : 'Trade Request Received'}
                    </Typography>
                    <Chip
                      label={(trade.status || 'pending').toUpperCase()}
                      size="small"
                      color={getStatusColor(trade.status || 'pending')}
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                    />
                  </Box>
                  {trade.shiftDate && (
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(trade.shiftDate), 'MMM d, yyyy')}
                    </Typography>
                  )}
                  {trade.reason && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>"{trade.reason}"</Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ==========================================
// OVERTIME / EXCEPTION TAB
// ==========================================
const OT_TYPES = [
  { value: 'overtime', label: 'Overtime' },
  { value: 'rest_day_ot', label: 'Rest Day Overtime' },
  { value: 'night_diff', label: 'Night Differential' },
  { value: 'late', label: 'Late (DTR Correction)' },
  { value: 'undertime', label: 'Undertime (DTR Correction)' },
];

function OvertimeTab() {
  const { toast } = useToast();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'overtime',
    date: '',
    hours: '',
    remarks: '',
  });

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['/api/adjustment-logs/mine'],
  });
  const logs = Array.isArray(logsData) ? logsData : ((logsData as any)?.logs || []);

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/adjustment-logs/request', payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/adjustment-logs/mine'] });
      toast({ title: 'Submitted', description: 'Your request is pending manager approval.' });
      setOpenDialog(false);
      setFormData({ type: 'overtime', date: '', hours: '', remarks: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Failed to submit request', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(formData.hours);
    if (!formData.date || isNaN(hours) || hours <= 0) {
      toast({ title: 'Invalid input', description: 'Please fill in all fields with valid values.', variant: 'destructive' });
      return;
    }
    if (hours > 24) {
      toast({ title: 'Invalid hours', description: 'Hours cannot exceed 24.', variant: 'destructive' });
      return;
    }
    const dateISO = new Date(formData.date).toISOString();
    submitMutation.mutate({
      type: formData.type,
      startDate: dateISO,
      endDate: dateISO,
      value: hours,
      remarks: formData.remarks,
    });
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const getTypeLabel = (type: string) =>
    OT_TYPES.find(t => t.value === type)?.label ?? type;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Exception Requests</Typography>
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }}>
          <AccessTimeIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No exception requests yet.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.map((log: any) => (
            <Card key={log.id} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">{getTypeLabel(log.type)}</Typography>
                  <Chip
                    label={(log.status || 'pending').toUpperCase()}
                    size="small"
                    color={getStatusColor(log.status)}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {log.startDate ? format(new Date(log.startDate), 'MMM d, yyyy') : '—'}
                  {' · '}{log.value} hr{parseFloat(log.value) !== 1 ? 's' : ''}
                </Typography>
                {log.remarks && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>"{log.remarks}"</Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Request Exception</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 2, pt: 3 }}>
            <TextField
              select
              label="Type"
              fullWidth
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {OT_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date ? new Date(formData.date) : null}
                onChange={(newValue) =>
                  setFormData({ ...formData, date: newValue ? format(newValue, 'yyyy-MM-dd') : '' })
                }
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
            <TextField
              label="Hours"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0.5, max: 24, step: 0.5 }}
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              helperText="Number of hours (e.g. 2 for 2 hours OT)"
            />
            <TextField
              label="Remarks"
              fullWidth
              multiline
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Brief reason for this request..."
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
