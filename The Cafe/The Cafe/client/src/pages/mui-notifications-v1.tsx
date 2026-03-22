import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, getCurrentUser } from "@/lib/auth";
import { format, parseISO, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useRealtime } from "@/hooks/use-realtime";

import {
  Box, Typography, Button, IconButton, Chip, Paper, Stack, Avatar,
  Tooltip, Tabs, Tab, Skeleton, Collapse, useTheme, useMediaQuery,
  alpha, Divider,
} from "@mui/material";

import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapIcon,
  EventAvailable as EventIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsNone as EmptyIcon,
  OpenInNew as OpenIcon,
  AdminPanelSettings as ManagerIcon,
  AccessTime as ClockIcon,
  Sell as PayIcon,
} from "@mui/icons-material";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// â”€â”€â”€ Notification type â†’ visual mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  shift_update:      { icon: <ScheduleIcon fontSize="small" />, color: '#3B82F6', label: 'Schedule' },
  shift_assigned:    { icon: <ScheduleIcon fontSize="small" />, color: '#3B82F6', label: 'Assigned' },
  schedule:          { icon: <ScheduleIcon fontSize="small" />, color: '#3B82F6', label: 'Schedule' },
  shift_trade:       { icon: <SwapIcon fontSize="small" />,     color: '#8B5CF6', label: 'Trade' },
  trade_request:     { icon: <SwapIcon fontSize="small" />,     color: '#8B5CF6', label: 'Trade' },
  time_off:          { icon: <EventIcon fontSize="small" />,    color: '#F59E0B', label: 'Time Off' },
  time_off_approved: { icon: <SuccessIcon fontSize="small" />,  color: '#10B981', label: 'Approved' },
  time_off_rejected: { icon: <ErrorIcon fontSize="small" />,    color: '#EF4444', label: 'Rejected' },
  payroll:           { icon: <PayIcon fontSize="small" />,      color: '#06B6D4', label: 'Payroll' },
  payment:           { icon: <PayIcon fontSize="small" />,      color: '#06B6D4', label: 'Payment' },
  approval:          { icon: <SuccessIcon fontSize="small" />,  color: '#10B981', label: 'Approved' },
  rejection:         { icon: <ErrorIcon fontSize="small" />,    color: '#EF4444', label: 'Rejected' },
  clock_in:          { icon: <ClockIcon fontSize="small" />,    color: '#10B981', label: 'Clock In' },
  clock_out:         { icon: <ClockIcon fontSize="small" />,    color: '#F59E0B', label: 'Clock Out' },
  adjustment:        { icon: <MoneyIcon fontSize="small" />,    color: '#06B6D4', label: 'Adjustment' },
  warning:           { icon: <WarningIcon fontSize="small" />,  color: '#F59E0B', label: 'Warning' },
  success:           { icon: <SuccessIcon fontSize="small" />,  color: '#10B981', label: 'Success' },
  error:             { icon: <ErrorIcon fontSize="small" />,    color: '#EF4444', label: 'Error' },
  info:              { icon: <InfoIcon fontSize="small" />,     color: '#6B7280', label: 'Info' },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] || { icon: <InfoIcon fontSize="small" />, color: '#6B7280', label: 'General' };
}

// Manager "action required" types â€” these need the manager to do something
const MANAGER_ACTION_TYPES = new Set([
  'trade_request', 'time_off',
]);

// Types that link somewhere useful
function getNavigatePath(type: string): string | null {
  if (type.includes('trade') || type.includes('shift') || type.includes('time_off') || type === 'schedule') return '/schedule';
  if (type === 'payroll' || type === 'payment') return '/pay-summary';
  return null;
}

// â”€â”€â”€ Group by date â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const order: string[] = [];

  for (const n of notifications) {
    const d = parseISO(n.createdAt);
    let label: string;
    if (isToday(d)) label = 'Today';
    else if (isYesterday(d)) label = 'Yesterday';
    else if (isThisWeek(d, { weekStartsOn: 1 })) label = format(d, 'EEEE');
    else label = format(d, 'MMM d, yyyy');

    if (!groups[label]) { groups[label] = []; order.push(label); }
    groups[label].push(n);
  }
  return order.map(label => ({ label, items: groups[label] }));
}

export default function MuiNotifications() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useRealtime({
    enabled: true,
    queryKeys: ['/api/notifications'],
  });

  const { data: resp, isLoading, refetch } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/notifications");
      return r.json();
    },
    refetchOnWindowFocus: true,
  });

  const all: Notification[] = resp?.notifications || [];
  const unread = useMemo(() => all.filter(n => !n.isRead), [all]);
  const actionRequired = useMemo(() =>
    isManagerRole ? all.filter(n => MANAGER_ACTION_TYPES.has(n.type) && !n.isRead) : [],
    [all, isManagerRole]
  );

  const visibleList = useMemo(() => {
    if (tab === 1) return unread;
    if (tab === 2) return actionRequired;
    return all;
  }, [tab, all, unread, actionRequired]);

  const grouped = useMemo(() => groupByDate(visibleList), [visibleList]);

  // â”€â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const markRead = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All marked as read" });
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Deleted" });
    },
  });

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    setExpandedId(prev => prev === n.id ? null : n.id);
  };

  const handleNav = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    const path = getNavigatePath(n.type);
    if (path) setLocation(path);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* â”€â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: isDark ? '#F5EDE4' : '#1F2937' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {all.length === 0 ? 'No notifications yet' : unread.length > 0 ? `${unread.length} unread of ${all.length}` : `${all.length} notifications Â· All read`}
            {isManagerRole && actionRequired.length > 0 && ` Â· ${actionRequired.length} need${actionRequired.length === 1 ? 's' : ''} action`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => refetch()}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {unread.length > 0 && (
            <Button
              size="small" variant="outlined" startIcon={<DoneAllIcon />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {isMobile ? 'Read All' : 'Mark All Read'}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* â”€â”€â”€ TABS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: isDark ? '#3D3228' : '#E5E7EB', mb: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
            borderBottom: '1px solid', borderColor: isDark ? '#3D3228' : '#E5E7EB',
          }}
        >
          <Tab label={
            <Stack direction="row" spacing={0.75} alignItems="center">
              <span>All</span>
              <Chip label={all.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
            </Stack>
          } />
          <Tab label={
            <Stack direction="row" spacing={0.75} alignItems="center">
              <span>Unread</span>
              {unread.length > 0 && (
                <Chip label={unread.length} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
              )}
            </Stack>
          } />
          {isManagerRole && (
            <Tab label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <ManagerIcon sx={{ fontSize: 16 }} />
                <span>Action Required</span>
                {actionRequired.length > 0 && (
                  <Chip label={actionRequired.length} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                )}
              </Stack>
            } />
          )}
        </Tabs>

        {/* â”€â”€â”€ LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          {isLoading ? (
            <Stack spacing={1.5}>
              {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />)}
            </Stack>
          ) : visibleList.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <EmptyIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body1" fontWeight={600} color="text.secondary">
                {tab === 2 ? 'No pending actions' : tab === 1 ? 'All caught up!' : 'No notifications yet'}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {tab === 2 ? 'All requests have been handled' : "You'll see updates about shifts, trades, and time off here"}
              </Typography>
            </Box>
          ) : (
            grouped.map(group => (
              <Box key={group.label} sx={{ mb: 2 }}>
                <Typography variant="overline" fontWeight={700} color="text.disabled" sx={{ px: 1, mb: 0.5, display: 'block', fontSize: '0.65rem', letterSpacing: 1.2 }}>
                  {group.label}
                </Typography>
                <Stack spacing={0.75}>
                  {group.items.map(n => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      isExpanded={expandedId === n.id}
                      isManagerRole={isManagerRole}
                      isDark={isDark}
                      onClick={() => handleClick(n)}
                      onNavigate={() => handleNav(n)}
                      onDelete={() => deleteNotif.mutate(n.id)}
                      onMarkRead={() => markRead.mutate(n.id)}
                    />
                  ))}
                </Stack>
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// â”€â”€â”€ SINGLE NOTIFICATION ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NotificationRow({
  notification: n, isExpanded, isManagerRole, isDark,
  onClick, onNavigate, onDelete, onMarkRead,
}: {
  notification: Notification;
  isExpanded: boolean;
  isManagerRole: boolean;
  isDark: boolean;
  onClick: () => void;
  onNavigate: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
}) {
  const cfg = getConfig(n.type);
  const isAction = isManagerRole && MANAGER_ACTION_TYPES.has(n.type) && !n.isRead;
  const hasNav = !!getNavigatePath(n.type);

  const parsedData = useMemo(() => {
    if (!n.data) return null;
    try { return typeof n.data === 'string' ? JSON.parse(n.data) : n.data; }
    catch { return null; }
  }, [n.data]);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: isAction
          ? (isDark ? '#78350F' : '#FDE68A')
          : (n.isRead ? (isDark ? '#2D2418' : '#F3F4F6') : (isDark ? '#3D3228' : '#E5E7EB')),
        bgcolor: isAction
          ? (isDark ? alpha('#F59E0B', 0.06) : '#FFFBEB')
          : (n.isRead ? 'transparent' : (isDark ? alpha('#FBF8F4', 0.02) : '#FAFAFA')),
        transition: 'all 0.15s',
        '&:hover': {
          borderColor: cfg.color,
          bgcolor: alpha(cfg.color, 0.04),
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
        {/* Icon */}
        <Avatar
          sx={{
            width: 36, height: 36,
            bgcolor: alpha(cfg.color, isDark ? 0.2 : 0.1),
            color: cfg.color,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography
              variant="body2" fontWeight={n.isRead ? 500 : 700} noWrap
              sx={{ color: n.isRead ? 'text.primary' : (isDark ? '#F5EDE4' : '#1F2937'), lineHeight: 1.3 }}
            >
              {n.title}
            </Typography>
            {!n.isRead && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
            )}
            {isAction && (
              <Chip
                label="Action" size="small"
                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.4 }}>
            {n.message}
          </Typography>
        </Box>

        {/* Time + type chip */}
        <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={500} sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
            {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
          </Typography>
          <Chip
            label={cfg.label} size="small"
            sx={{
              height: 18, fontSize: '0.58rem', fontWeight: 700,
              bgcolor: alpha(cfg.color, isDark ? 0.2 : 0.08),
              color: cfg.color,
              border: `1px solid ${alpha(cfg.color, 0.2)}`,
            }}
          />
        </Stack>
      </Stack>

      {/* â”€â”€â”€ Expanded Detail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Divider sx={{ mb: 1.5 }} />

          {parsedData && (() => {
            const HIDE = new Set([
              'tradeId','shiftId','requestId','userId','fromUserId','toUserId',
              'branchId','approvedBy','id','periodId','shortNotice','minimumAdvanceDays',
              'employeeId','managerId','notificationId','createdAt','updatedAt',
            ]);
            const LABELS: Record<string, string> = {
              shiftDate:'Shift Date', requesterName:'From', takerName:'Accepted By',
              employeeName:'Employee', tradeType:'Type', status:'Status',
              startDate:'Start', endDate:'End', reason:'Reason', netPay:'Net Pay',
              position:'Position', advanceDays:'Notice',
            };
            const entries = Object.entries(parsedData).filter(([k, v]) => !HIDE.has(k) && v != null && typeof v !== 'object');
            if (entries.length === 0) return null;

            const statusColors: Record<string, string> = {
              approved: '#10B981', rejected: '#EF4444', pending: '#F59E0B',
              pending_approval: '#F59E0B', taken: '#3B82F6', open: '#8B5CF6',
              direct: '#6366F1', cancelled: '#9CA3AF',
            };

            return (
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                {entries.map(([k, v]) => {
                  let display = String(v);
                  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                    try { display = format(new Date(v), 'MMM d, yyyy'); } catch { /* keep raw */ }
                  }
                  const label = LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                  const isStatus = k === 'status' || k === 'tradeType';

                  return (
                    <Chip
                      key={k} size="small" variant="outlined"
                      label={`${label}: ${isStatus ? display.replace(/_/g, ' ') : display}`}
                      sx={{
                        height: 24, fontSize: '0.7rem', fontWeight: 600,
                        textTransform: 'capitalize',
                        borderColor: isStatus ? alpha(statusColors[String(v)] || '#6B7280', 0.4) : undefined,
                        color: isStatus ? (statusColors[String(v)] || undefined) : undefined,
                      }}
                    />
                  );
                })}
              </Stack>
            );
          })()}

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            {hasNav && (
              <Button
                size="small" variant="contained" startIcon={<OpenIcon />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.75rem' }}
              >
                {n.type.includes('payroll') || n.type === 'payment' ? 'Pay Summary' : 'Schedule'}
              </Button>
            )}
            {isAction && (
              <Button
                size="small" variant="contained" color="warning" startIcon={<ManagerIcon />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.75rem' }}
              >
                Review
              </Button>
            )}
            {!n.isRead && (
              <Button
                size="small" variant="outlined" startIcon={<CheckIcon />}
                onClick={e => { e.stopPropagation(); onMarkRead(); }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.75rem' }}
              >
                Mark Read
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onDelete(); }}
              sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
