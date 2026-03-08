import React from 'react';
import {
  Box, Typography, Avatar, Chip, Button, Card, CardContent,
  Divider, useTheme, Stack, IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  BeachAccess as TimeOffIcon,
  Schedule as ClockIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { TimeOffRequest, ShiftTrade, Employee } from './types';

interface RequestsPanelProps {
  timeOffRequests: TimeOffRequest[];
  shiftTrades: ShiftTrade[];
  employees: Employee[];
  isManager: boolean;
  currentUserId: string;
  onApproveTimeOff: (id: string) => void;
  onRejectTimeOff: (id: string) => void;
  onApproveTrade: (id: string) => void;
  onRejectTrade: (id: string) => void;
  onAcceptTrade: (id: string) => void;
  onDeclineTrade: (id: string) => void;
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
  const emp = employees.find(e => e.id === userId);
  return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
}

export default function RequestsPanel({
  timeOffRequests,
  shiftTrades,
  employees,
  isManager,
  currentUserId,
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

  const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending');
  const pendingTrades = shiftTrades.filter(t => t.status === 'pending' || t.status === 'accepted');
  const recentResolved = [
    ...timeOffRequests.filter(r => r.status !== 'pending'),
    ...shiftTrades.filter(t => t.status !== 'pending' && t.status !== 'accepted'),
  ]
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || b.requestedAt || 0).getTime()
                             - new Date(a.updatedAt || a.createdAt || a.requestedAt || 0).getTime())
    .slice(0, 5);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Pending Time-Off Requests */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TimeOffIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Time-Off Requests
          </Typography>
          {pendingTimeOff.length > 0 && (
            <Chip label={pendingTimeOff.length} size="small" color="warning" sx={{ height: 22, fontWeight: 700 }} />
          )}
        </Box>

        {pendingTimeOff.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            No pending time-off requests
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {pendingTimeOff.map(req => (
              <Card
                key={req.id}
                variant="outlined"
                sx={{
                  borderColor: isDark ? '#3D3228' : '#FDE68A',
                  borderLeft: '4px solid #F59E0B',
                  bgcolor: isDark ? '#342A1E' : '#FFFBEB',
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {req.userName || getEmployeeName(employees, req.userId)}
                    </Typography>
                    <StatusChip status={req.status} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    <strong>{req.type}</strong> · {format(new Date(req.startDate), 'MMM d')} – {format(new Date(req.endDate), 'MMM d, yyyy')}
                  </Typography>
                  {req.reason && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
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
                        onClick={() => onApproveTimeOff(req.id)}
                        sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => onRejectTimeOff(req.id)}
                        sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ borderColor: isDark ? '#3D3228' : '#E8E0D4' }} />

      {/* Pending Shift Trades */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SwapIcon sx={{ fontSize: 20, color: '#8B5CF6' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Shift Trades
          </Typography>
          {pendingTrades.length > 0 && (
            <Chip label={pendingTrades.length} size="small" color="secondary" sx={{ height: 22, fontWeight: 700 }} />
          )}
        </Box>

        {pendingTrades.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            No pending shift trades
          </Typography>
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
              const targetLast = trade.targetUser?.lastName || trade.toUser?.lastName || '';

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
                        {trade.shift.date && format(new Date(trade.shift.date), 'MMM d')}
                        {trade.shift.startTime && ` · ${format(new Date(trade.shift.startTime), 'h:mm a')}`}
                        {trade.shift.endTime && ` – ${format(new Date(trade.shift.endTime), 'h:mm a')}`}
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
                            onClick={() => onRejectTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
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
                            onClick={() => onDeclineTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                            Decline
                          </Button>
                        </>
                      )}

                      {/* Anyone can take an open trade */}
                      {isOpenTrade && isPending && !isRequester && (
                        <Button size="small" variant="contained" color="primary"
                          onClick={() => onTakeOpenTrade(trade.id)} sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                          Take This Shift
                        </Button>
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
      </Box>

      {/* Recently resolved (collapsed) */}
      {recentResolved.length > 0 && (
        <>
          <Divider sx={{ borderColor: isDark ? '#3D3228' : '#E8E0D4' }} />
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Activity
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {recentResolved.map((item: any, i) => {
                const name = item.userName
                  || (item.requester ? `${item.requester.firstName} ${item.requester.lastName || ''}`.trim() : null)
                  || (item.fromUser ? `${item.fromUser.firstName} ${item.fromUser.lastName || ''}`.trim() : null)
                  || getEmployeeName(employees, item.userId || item.requesterId || item.fromUserId || '');
                const isTimeOff = 'startDate' in item || (item.type && !['pending','accepted','approved','rejected'].includes(item.type) && item.type !== 'open' && item.type !== 'direct');
                return (
                  <Box key={item.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    {isTimeOff ? (
                      <TimeOffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    ) : (
                      <SwapIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                      {name} — {item.type || 'trade'}
                    </Typography>
                    <StatusChip status={item.status} />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}
