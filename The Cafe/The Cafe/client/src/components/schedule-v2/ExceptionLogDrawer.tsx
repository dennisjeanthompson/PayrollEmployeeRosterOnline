import { useState } from 'react';
import {
  Drawer, Box, Typography, Button, TextField, Chip, Avatar, Stack,
  Divider, IconButton, CircularProgress, alpha, useTheme,
} from '@mui/material';
import {
  Close, CheckCircle, Warning, Send, Schedule, Person,
  Chat as ChatIcon, AccessTime,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

interface ExceptionLogDrawerProps {
  open: boolean;
  onClose: () => void;
  log: any;
  isManager: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  overtime: 'Overtime',
  late: 'Tardiness',
  undertime: 'Undertime',
  absent: 'Absent',
  rest_day_ot: 'Rest Day OT',
  special_holiday_ot: 'Special Holiday OT',
  regular_holiday_ot: 'Regular Holiday OT',
  night_diff: 'Night Differential',
};

const TYPE_COLORS: Record<string, string> = {
  overtime: '#10b981',
  late: '#f97316',
  undertime: '#ec4899',
  absent: '#dc2626',
  rest_day_ot: '#3b82f6',
  special_holiday_ot: '#f59e0b',
  regular_holiday_ot: '#ef4444',
  night_diff: '#8b5cf6',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending Review', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  employee_verified: { label: 'Confirmed by Employee', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  disputed: { label: 'Disputed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  approved: { label: 'Approved for Payroll', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  rejected: { label: 'Rejected', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

export default function ExceptionLogDrawer({ open, onClose, log, isManager, onApprove, onReject }: ExceptionLogDrawerProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Fetch comments for this log
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['adjustment-log-comments', log?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/adjustment-logs/${log.id}/comments`);
      return res.json();
    },
    enabled: !!log?.id && open,
  });

  // Verify (Confirm) mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PUT', `/api/adjustment-logs/${log.id}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustment-logs-mine'] });
      queryClient.invalidateQueries({ queryKey: ['adjustment-logs-branch'] });
      onClose();
    },
  });

  // Dispute mutation
  const disputeMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest('PUT', `/api/adjustment-logs/${log.id}/dispute`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustment-logs-mine'] });
      queryClient.invalidateQueries({ queryKey: ['adjustment-logs-branch'] });
      setShowDisputeInput(false);
      setDisputeReason('');
      onClose();
    },
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', `/api/adjustment-logs/${log.id}/comments`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustment-log-comments', log?.id] });
      setCommentText('');
    },
  });

  if (!log) return null;

  const typeLabel = TYPE_LABELS[log.type] || log.type;
  const typeColor = TYPE_COLORS[log.type] || '#6b7280';
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
  const isDeduction = ['late', 'undertime', 'absent'].includes(log.type);
  const valueUnit = log.type === 'late' || log.type === 'undertime' ? 'mins' : log.type === 'absent' ? 'days' : 'hrs';
  const canRespond = !isManager && (log.status === 'pending' || log.status === 'disputed');
  const comments = commentsData?.comments || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(typeColor, 0.08)} 0%, ${alpha(typeColor, 0.02)} 100%)`,
        borderBottom: `1px solid ${alpha(typeColor, 0.15)}`,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Chip
              label={typeLabel}
              size="small"
              sx={{
                bgcolor: alpha(typeColor, 0.12),
                color: typeColor,
                fontWeight: 700,
                mb: 1,
              }}
            />
            <Typography variant="h6" fontWeight={700}>
              Exception Log Detail
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.startDate ? format(new Date(log.startDate), 'EEEE, MMMM d, yyyy') : 'Date not available'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Status Banner */}
      <Box sx={{
        mx: 2.5,
        mt: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: statusConfig.bgColor,
        border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: statusConfig.color,
          boxShadow: `0 0 8px ${alpha(statusConfig.color, 0.5)}`,
          animation: log.status === 'pending' ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.4 },
          },
        }} />
        <Typography variant="body2" fontWeight={600} sx={{ color: statusConfig.color }}>
          {statusConfig.label}
        </Typography>
      </Box>

      {/* Detail Cards */}
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Value Card */}
          <Box sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {isDeduction ? 'Deduction' : 'Earning'}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: isDeduction ? 'error.main' : 'success.main', mt: 0.5 }}>
              {log.value} {valueUnit}
            </Typography>
            {log.calculatedAmount && (
              <Typography variant="body2" fontWeight={600} sx={{ color: isDeduction ? 'error.main' : 'success.main', mt: 0.5 }}>
                {isDeduction ? '-' : '+'}₱{Math.abs(parseFloat(log.calculatedAmount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            )}
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">Logged by</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>{log.loggedByName || 'Manager'}</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">Created</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm a') : '—'}
              </Typography>
            </Box>
          </Box>

          {/* Remarks */}
          {log.remarks && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Manager Remarks</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{log.remarks}</Typography>
            </Box>
          )}

          {/* Dispute Reason (if disputed) */}
          {log.disputeReason && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#ef4444', 0.04), border: `1px solid ${alpha('#ef4444', 0.15)}` }}>
              <Typography variant="caption" color="error" fontWeight={600}>Dispute Reason</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{log.disputeReason}</Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Action Buttons — Employee */}
        {canRespond && !showDisputeInput && (
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={verifyMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              sx={{ borderRadius: 2.5, py: 1.5, textTransform: 'none', fontWeight: 700 }}
            >
              Confirm
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<Warning />}
              onClick={() => setShowDisputeInput(true)}
              sx={{ borderRadius: 2.5, py: 1.5, textTransform: 'none', fontWeight: 700, borderWidth: 2 }}
            >
              Dispute
            </Button>
          </Stack>
        )}

        {/* Dispute Reason Input */}
        {showDisputeInput && (
          <Box sx={{ mb: 2.5 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Explain why you're disputing this record..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                startIcon={disputeMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Warning />}
                onClick={() => disputeReason.trim() && disputeMutation.mutate(disputeReason)}
                disabled={!disputeReason.trim() || disputeMutation.isPending}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Submit Dispute
              </Button>
              <Button
                variant="outlined"
                onClick={() => { setShowDisputeInput(false); setDisputeReason(''); }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}

        {/* Manager Actions */}
        {isManager && (log.status === 'pending' || log.status === 'employee_verified' || log.status === 'disputed') && (
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => onApprove?.(log.id)}
              sx={{ borderRadius: 2.5, py: 1.5, textTransform: 'none', fontWeight: 700 }}
            >
              Approve
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => onReject?.(log.id)}
              sx={{ borderRadius: 2.5, py: 1.5, textTransform: 'none', fontWeight: 700 }}
            >
              Reject
            </Button>
          </Stack>
        )}

        {/* Comment Thread */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ChatIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Comments {comments.length > 0 ? `(${comments.length})` : ''}
            </Typography>
          </Box>

          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No comments yet. Start a conversation about this log.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2, maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
              {comments.map((comment: any) => (
                <Box
                  key={comment.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(
                      comment.userRole === 'manager' || comment.userRole === 'admin'
                        ? theme.palette.primary.main
                        : theme.palette.success.main,
                      0.06
                    ),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: comment.userRole === 'manager' || comment.userRole === 'admin' ? 'primary.main' : 'success.main' }}>
                        {comment.userName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="caption" fontWeight={700}>{comment.userName}</Typography>
                      <Chip
                        label={comment.userRole === 'manager' || comment.userRole === 'admin' ? 'Manager' : 'Employee'}
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, h:mm a') : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 4 }}>
                    {comment.message}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}

          {/* Add Comment Input */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                  e.preventDefault();
                  postCommentMutation.mutate(commentText);
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <IconButton
              color="primary"
              onClick={() => commentText.trim() && postCommentMutation.mutate(commentText)}
              disabled={!commentText.trim() || postCommentMutation.isPending}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              {postCommentMutation.isPending ? <CircularProgress size={20} /> : <Send sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
