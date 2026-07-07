import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Chip, Button, Card, CardContent,
  Divider, useTheme, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Menu, MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SwapIcon from '@mui/icons-material/SwapHoriz';
import TimeOffIcon from '@mui/icons-material/BeachAccess';
import ClockIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { format, isValid } from 'date-fns';
import type { TimeOffRequest, ShiftTrade, Employee } from './types';

// Safe date helpers
function toDate(val: any): Date {
  if (!val) return new Date(0);
  const d = val instanceof Date ? val : new Date(val);
  return isValid(d) ? d : new Date(0);
}
function safeFormat(val: any, fmt: string): string {
  try { return format(toDate(val), fmt); } catch { return '--'; }
}

interface RequestsPanelProps {
  timeOffRequests: TimeOffRequest[];
  shiftTrades: ShiftTrade[];
  employees: Employee[];
  shifts?: any[];
  isManager: boolean;
  currentUserId: string;
  adjustmentLogs?: any[];
  onApproveTimeOff: (id: string, leavePaymentStatus: 'paid' | 'unpaid') => void;
  onRejectTimeOff: (id: string, reason: string, leavePaymentStatus: 'unpaid' | 'awol') => void;
  onApproveTrade: (id: string) => void;
  onRejectTrade: (id: string, notes?: string) => void;
  onAcceptTrade: (id: string) => void;
  onDeclineTrade: (id: string, notes?: string) => void;
  onCancelTrade: (id: string) => void;
  onTakeOpenTrade: (id: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  approved: { bg: '#DCFCE7', color: '#166534' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  accepted: { bg: '#DBEAFE', color: '#1E40AF' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

function StatusChip({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        height: 22, fontSize: '0.68rem', fontWeight: 700,
        bgcolor: colors.bg, color: colors.color,
      }}
    />
  );
}

function getEmployeeName(employees: Employee[], userId: string): string {
  const emp = employees.find(e => String(e.id) === String(userId));
  return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
}

export default function RequestsPanel({
  timeOffRequests,
  shiftTrades,
  employees,
  shifts = [],
  isManager,
  currentUserId,
  adjustmentLogs = [],
  onApproveTimeOff,
  onRejectTimeOff,
  onApproveTrade,
  onRejectTrade,
  onAcceptTrade,
  onDeclineTrade,
  onCancelTrade,
  onTakeOpenTrade,
}: RequestsPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Rejection reason dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectPaymentStatus, setRejectPaymentStatus] = useState<'unpaid' | 'awol'>('unpaid');

  // Trade reject/decline dialog state
  const [tradeRejectDialogOpen, setTradeRejectDialogOpen] = useState(false);
  const [tradeRejectingId, setTradeRejectingId] = useState<string | null>(null);
  const [tradeRejectReason, setTradeRejectReason] = useState('');
  const [tradeRejectAction, setTradeRejectAction] = useState<'reject' | 'decline'>('reject');

  const handleOpenTradeRejectDialog = (id: string, action: 'reject' | 'decline') => {
    setTradeRejectingId(id);
    setTradeRejectReason('');
    setTradeRejectAction(action);
    setTradeRejectDialogOpen(true);
  };

  const handleConfirmTradeReject = () => {
    if (!tradeRejectingId) return;
    if (tradeRejectAction === 'reject') {
      onRejectTrade(tradeRejectingId, tradeRejectReason.trim() || undefined);
    } else {
      onDeclineTrade(tradeRejectingId, tradeRejectReason.trim() || undefined);
    }
    setTradeRejectDialogOpen(false);
    setTradeRejectingId(null);
    setTradeRejectReason('');
  };

  // Approve Menu state
  const [approveAnchorEl, setApproveAnchorEl] = useState<null | HTMLElement>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleOpenApproveMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setApproveAnchorEl(event.currentTarget);
    setApprovingId(id);
  };

  const handleCloseApproveMenu = () => {
    setApproveAnchorEl(null);
    setApprovingId(null);
  };

  const scheduleAlerts = React.useMemo(() => {
    if (!shifts || shifts.length === 0 || !employees) return [];
    
    const now = new Date();
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const thisWeekStart = new Date(now.setDate(diff));
    thisWeekStart.setHours(0,0,0,0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23,59,59,999);
    
    const currentWeekShifts = shifts.filter(s => {
      const start = new Date(s.startTime);
      return start >= thisWeekStart && start <= thisWeekEnd;
    });

    const alerts: { type: 'error' | 'warning', message: string }[] = [];
    
    // Group shifts by employee for conflict/zero shift/rest day checks
    const shiftsByEmp: Record<string, typeof currentWeekShifts> = {};
    employees.forEach(emp => { shiftsByEmp[emp.id] = []; });
    
    currentWeekShifts.forEach(shift => {
      if (!shiftsByEmp[shift.userId]) shiftsByEmp[shift.userId] = [];
      shiftsByEmp[shift.userId].push(shift);
    });

    Object.keys(shiftsByEmp).forEach(userId => {
      const empShifts = shiftsByEmp[userId];
      const empName = getEmployeeName(employees, userId);
      
      // Yellow: Employee with zero shifts this week
      if (empShifts.length === 0) {
        // Check if employee has absent adjustment logs this week
        const empAbsentLogs = adjustmentLogs.filter((log: any) => {
          if (String(log.employeeId) !== String(userId)) return false;
          if (log.type !== 'absent') return false;
          const logDate = new Date(log.startDate || log.date);
          return logDate >= thisWeekStart && logDate <= thisWeekEnd;
        });
        if (empAbsentLogs.length > 0) {
          alerts.push({ type: 'warning', message: `${empName} — all shifts marked absent this week. Verify leave status.` });
        } else {
          alerts.push({ type: 'warning', message: `${empName} has zero shifts assigned this week.` });
        }
        return;
      }

      // Red: Overlapping shifts for the same employee
      empShifts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      for (let i = 0; i < empShifts.length - 1; i++) {
        if (new Date(empShifts[i].endTime) > new Date(empShifts[i+1].startTime)) {
          alerts.push({ type: 'error', message: `${empName} has overlapping shifts on ${safeFormat(empShifts[i].startTime, 'MMM d')}.` });
          break; // Avoid spamming multiple for the same user
        }
      }


    });

    // Red: Pending leave overlap with scheduled shifts
    timeOffRequests.filter(r => r.status === 'pending' || r.status === 'approved').forEach(req => {
      const reqStart = new Date(req.startDate);
      reqStart.setHours(0,0,0,0);
      const reqEnd = new Date(req.endDate);
      reqEnd.setHours(23,59,59,999);
      
      const overlappingShifts = shifts.filter(s => {
        if (s.userId !== req.userId) return false;
        const sTime = new Date(s.startTime);
        return sTime >= reqStart && sTime <= reqEnd;
      });
      
      if (overlappingShifts.length > 0) {
        const empName = getEmployeeName(employees, req.userId);
        alerts.push({ type: 'error', message: `${empName} has approved/pending leave but is scheduled for ${overlappingShifts.length} shift(s) during that time.` });
      }
    });

    // Yellow: Pending shift trade over 48 hours unresolved
    shiftTrades.filter(t => t.status === 'pending' && !(t.shift?.startTime && new Date(t.shift.startTime) < now)).forEach(trade => {
      const created = new Date(trade.createdAt || new Date());
      const ageHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      if (ageHours > 48) {
        const requesterName = trade.requester?.firstName || trade.fromUser?.firstName || 'Unknown';
        alerts.push({ type: 'warning', message: `Pending shift trade request from ${requesterName} is older than 48 hours.` });
      }
    });
    
    return alerts;
  }, [shifts, timeOffRequests, employees, shiftTrades]);

  const handleConfirmApprove = (leavePaymentStatus: 'paid' | 'unpaid') => {
    if (approvingId) {
      onApproveTimeOff(approvingId, leavePaymentStatus);
    }
    handleCloseApproveMenu();
  };

  const handleOpenRejectDialog = (id: string) => {
    setRejectingId(id);
    setRejectionReason('');
    setRejectPaymentStatus('unpaid');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingId) {
      onRejectTimeOff(rejectingId, rejectionReason.trim(), rejectPaymentStatus);
    }
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectionReason('');
    setRejectPaymentStatus('unpaid');
  };

  const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending');
  const pendingTrades = shiftTrades.filter(t => {
    if (t.status !== 'pending' && t.status !== 'accepted') return false;
    // Auto-expire past shifts
    if (t.shift?.startTime && new Date(t.shift.startTime) < new Date()) return false;
    return true;
  });
  const recentResolved = [
    ...timeOffRequests.filter(r => r.status !== 'pending'),
    ...shiftTrades.filter(t => t.status !== 'pending' && t.status !== 'accepted'),
    ...adjustmentLogs,
  ]
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || b.requestedAt || b.date || 0).getTime()
                             - new Date(a.updatedAt || a.createdAt || a.requestedAt || a.date || 0).getTime())
    .slice(0, 10);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Pending Time-Off Requests */}
        <Accordion 
          defaultExpanded 
          disableGutters 
          elevation={0}
          sx={{ 
            bgcolor: 'transparent',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, minHeight: 48, '& .MuiAccordionSummary-content': { my: 0 } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeOffIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Time-Off Requests
              </Typography>
              {pendingTimeOff.length > 0 && (
                <Chip label={pendingTimeOff.length} size="small" color="warning" sx={{ height: 22, fontWeight: 700 }} />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
            {pendingTimeOff.length === 0 ? (
            <Box sx={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              py: 3, gap: 1, 
              bgcolor: isDark ? alpha('#F59E0B', 0.03) : alpha('#F59E0B', 0.04),
              borderRadius: 2,
            }}>
              <EventBusyIcon sx={{ fontSize: 28, color: isDark ? alpha('#F59E0B', 0.25) : alpha('#92400E', 0.15) }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                No pending requests
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {pendingTimeOff.map(req => {
                const reqStart = new Date(req.startDate);
                reqStart.setHours(0, 0, 0, 0);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const isOverdue = reqStart < now;

                return (
                <Card
                  key={req.id}
                  variant="outlined"
                  sx={{
                    borderColor: isDark ? (isOverdue ? '#451A1A' : '#3D3228') : (isOverdue ? '#FECACA' : '#FDE68A'),
                    borderLeft: `4px solid ${isOverdue ? '#EF4444' : '#F59E0B'}`,
                    bgcolor: isDark ? (isOverdue ? '#2A1212' : '#342A1E') : (isOverdue ? '#FEF2F2' : '#FFFBEB'),
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {req.userName || getEmployeeName(employees, req.userId)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />}
                        <StatusChip status={req.status} />
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      <strong>{req.type}</strong> · {safeFormat(req.startDate, 'MMM d')} – {safeFormat(req.endDate, 'MMM d, yyyy')}
                    </Typography>
                    {req.reason && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 0.5 }}>
                        "{req.reason}"
                      </Typography>
                    )}
                    {isManager && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={(e) => handleOpenApproveMenu(e, req.id)}
                          sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<BlockIcon />}
                          onClick={() => handleOpenRejectDialog(req.id)}
                          sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </Stack>
          )}
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ borderColor: isDark ? '#3D3228' : '#E8E0D4' }} />

        {/* Pending Shift Trades */}
        <Accordion 
          defaultExpanded 
          disableGutters 
          elevation={0}
          sx={{ 
            bgcolor: 'transparent',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, minHeight: 48, '& .MuiAccordionSummary-content': { my: 0 } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwapIcon sx={{ fontSize: 20, color: '#8B5CF6' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Shift Trades
              </Typography>
              {pendingTrades.length > 0 && (
                <Chip label={pendingTrades.length} size="small" color="secondary" sx={{ height: 22, fontWeight: 700 }} />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>          {pendingTrades.length === 0 ? (
            <Box sx={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              py: 3, gap: 1,
              bgcolor: isDark ? alpha('#8B5CF6', 0.03) : alpha('#8B5CF6', 0.04),
              borderRadius: 2,
            }}>
              <SwapIcon sx={{ fontSize: 28, color: isDark ? alpha('#8B5CF6', 0.25) : alpha('#5B21B6', 0.15) }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                No pending shift trades
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {pendingTrades.map(trade => {
                const isRequester = trade.requesterId === currentUserId || trade.fromUserId === currentUserId;
                const isTarget = trade.targetUserId === currentUserId || trade.toUserId === currentUserId;
                const hasTarget = !!(trade.targetUserId || trade.toUserId);
                const isOpenTrade = !hasTarget;
                const isPending = trade.status === 'pending';
                const isAccepted = trade.status === 'accepted';

                const requesterName = trade.requester?.firstName || trade.fromUser?.firstName || 'Unknown';
                const requesterLast = trade.requester?.lastName || trade.fromUser?.lastName || '';
                const targetName = trade.targetUser?.firstName || trade.toUser?.firstName || '';

                return (
                  <Card
                    key={trade.id}
                    variant="outlined"
                    sx={{
                      borderColor: isDark ? '#3D3228' : (isAccepted ? '#93C5FD' : '#C4B5FD'),
                      borderLeft: `4px solid ${isAccepted ? '#3B82F6' : '#8B5CF6'}`,
                      bgcolor: isDark ? '#342A1E' : (isAccepted ? '#EFF6FF' : '#F5F3FF'),
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {isOpenTrade ? `${requesterName} ${requesterLast}` : `${requesterName} → ${targetName}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip label={isOpenTrade ? 'Open' : 'Direct'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                          <StatusChip status={trade.status} />
                        </Box>
                      </Box>

                      {trade.shift && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          <ClockIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                          {trade.shift.date && safeFormat(trade.shift.date, 'MMM d')}
                          {trade.shift.startTime && ` · ${safeFormat(trade.shift.startTime, 'h:mm a')}`}
                          {trade.shift.endTime && ` – ${safeFormat(trade.shift.endTime, 'h:mm a')}`}
                        </Typography>
                      )}

                      {trade.reason && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          "{trade.reason}"
                        </Typography>
                      )}

                      {/* Action buttons based on role */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                        {/* Manager: approve/reject accepted trades */}
                        {isManager && hasTarget && (isPending || isAccepted) && !isRequester && (
                          <>
                            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
                              onClick={() => onApproveTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />}
                              onClick={() => handleOpenTradeRejectDialog(trade.id, 'reject')} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Target: accept/decline pending direct trade */}
                        {isTarget && isPending && !isManager && (
                          <>
                            <Button size="small" variant="contained" color="primary" startIcon={<CheckIcon />}
                              onClick={() => onAcceptTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Accept
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />}
                              onClick={() => handleOpenTradeRejectDialog(trade.id, 'decline')} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Decline
                            </Button>
                          </>
                        )}

                        {/* Anyone can take an open trade */}
                        {isOpenTrade && isPending && !isRequester && !isManager && (
                          <Button size="small" variant="contained" color="primary"
                            onClick={() => onTakeOpenTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                            Take This Shift
                          </Button>
                        )}
                        {isOpenTrade && isManager && (isPending || isAccepted) && (
                          <>
                            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
                              onClick={() => onApproveTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />}
                              onClick={() => handleOpenTradeRejectDialog(trade.id, 'reject')} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Requester: cancel own trade */}
                        {isRequester && (isPending || isAccepted) && (
                          <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}
                            onClick={() => onCancelTrade(trade.id)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
          </AccordionDetails>
        </Accordion>

        {/* Schedule Alerts (Managers only) */}
        {isManager && scheduleAlerts?.length > 0 && (
          <>
            <Divider sx={{ borderColor: isDark ? '#3D3228' : '#E8E0D4' }} />
            <Accordion 
              defaultExpanded
              disableGutters 
              elevation={0}
              sx={{ 
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 0, minHeight: 40, '& .MuiAccordionSummary-content': { my: 0 } }}
              >
                <Typography variant="caption" fontWeight={600} color="error" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentLateIcon fontSize="small" /> Schedule Alerts
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
                <Stack spacing={1}>
                  {scheduleAlerts.map((alert) => (
                    <Box key={alert.message} sx={{
                      p: 1.5, borderRadius: 2,
                      bgcolor: alert.type === 'error' ? alpha('#EF4444', 0.1) : alpha('#F59E0B', 0.1), 
                      border: `1px solid ${alert.type === 'error' ? alpha('#EF4444', 0.2) : alpha('#F59E0B', 0.2)}`,
                    }}>
                      <Typography variant="caption" color={alert.type === 'error' ? "error.dark" : "warning.dark"} fontWeight={600}>
                        {alert.type === 'error' ? '🔴 ' : '🟡 '} {alert.message}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>

      {/* Rejection Reason Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main', pb: 1 }}>
          Reject Time-Off Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Optionally provide a reason for the rejection. This will be sent to the employee.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            placeholder="e.g. Insufficient coverage on that date, please try another date."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            InputProps={{ sx: { borderRadius: 2 } }}
            inputProps={{ maxLength: 300 }}
            helperText={`${rejectionReason.length}/300`}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pay Treatment
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={rejectPaymentStatus === 'unpaid' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setRejectPaymentStatus('unpaid')}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Unpaid Leave
              </Button>
              <Button
                size="small"
                variant={rejectPaymentStatus === 'awol' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setRejectPaymentStatus('awol')}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                AWOL
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {rejectPaymentStatus === 'awol' ? 'Absence Without Official Leave — affects disciplinary record' : 'Leave Without Pay (LWOP) — standard absence'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCloseRejectDialog} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Trade Reject / Decline Dialog */}
      <Dialog open={tradeRejectDialogOpen} onClose={() => setTradeRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{tradeRejectAction === 'reject' ? 'Reject Trade Request' : 'Decline Trade Request'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {tradeRejectAction === 'reject'
                ? 'Provide an optional reason. Both employees will be notified.'
                : 'Provide an optional reason. The requester will be notified.'}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason (optional)"
              value={tradeRejectReason}
              onChange={(e) => setTradeRejectReason(e.target.value)}
              placeholder="e.g. Insufficient staffing for that shift..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setTradeRejectDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleConfirmTradeReject}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {tradeRejectAction === 'reject' ? 'Confirm Rejection' : 'Confirm Decline'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Time Off Details Menu */}
      <Menu
        anchorEl={approveAnchorEl}
        open={Boolean(approveAnchorEl)}
        onClose={handleCloseApproveMenu}
        PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 240 } }}
      >
        <MenuItem onClick={() => handleConfirmApprove('paid')} sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={700} color="success.main">Approve as Paid Leave ✓</Typography>
          <Typography variant="caption" color="text.secondary">Deducts from Leave Balance — Employee gets full pay</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleConfirmApprove('unpaid')} sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={700} color="warning.main">Approve as Unpaid Leave</Typography>
          <Typography variant="caption" color="text.secondary">Leave Without Pay (LWOP) — No pay for absent days</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
