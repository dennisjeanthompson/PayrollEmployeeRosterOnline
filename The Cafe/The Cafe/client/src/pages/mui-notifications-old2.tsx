import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager } from "@/lib/auth";
import { format, parseISO, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useRealtime } from "@/hooks/use-realtime";

import {
  Box, Typography, Button, IconButton, Chip, Stack, Avatar,
  Tooltip, Skeleton, Collapse, useTheme, useMediaQuery,
  alpha, Fade, Badge,
} from "@mui/material";

import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
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
  Shield as ShieldIcon,
  AccessTime as ClockIcon,
  Sell as PayIcon,
  Close as CloseIcon,
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

// ─── Type config ────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string; label: string }> = {
  shift_update:      { icon: <ScheduleIcon />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', label: 'Schedule' },
  shift_assigned:    { icon: <ScheduleIcon />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', label: 'Assigned' },
  schedule:          { icon: <ScheduleIcon />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', label: 'Schedule' },
  shift_trade:       { icon: <SwapIcon />,     color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', label: 'Trade' },
  trade_request:     { icon: <SwapIcon />,     color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', label: 'Trade' },
  time_off:          { icon: <EventIcon />,    color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', label: 'Time Off' },
  time_off_approved: { icon: <SuccessIcon />,  color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Approved' },
  time_off_rejected: { icon: <ErrorIcon />,    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', label: 'Rejected' },
  payroll:           { icon: <PayIcon />,      color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', label: 'Payroll' },
  payment:           { icon: <PayIcon />,      color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', label: 'Payment' },
  approval:          { icon: <SuccessIcon />,  color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Approved' },
  rejection:         { icon: <ErrorIcon />,    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', label: 'Rejected' },
  clock_in:          { icon: <ClockIcon />,    color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Clock In' },
  clock_out:         { icon: <ClockIcon />,    color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', label: 'Clock Out' },
  adjustment:        { icon: <MoneyIcon />,    color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', label: 'Adjustment' },
  warning:           { icon: <WarningIcon />,  color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', label: 'Warning' },
  success:           { icon: <SuccessIcon />,  color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Success' },
  error:             { icon: <ErrorIcon />,    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', label: 'Error' },
  info:              { icon: <InfoIcon />,     color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4B5563)', label: 'Info' },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] || { icon: <InfoIcon />, color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4B5563)', label: 'General' };
}

const MANAGER_ACTION_TYPES = new Set(['trade_request', 'time_off']);

function getNavigatePath(type: string): string | null {
  if (type.includes('trade') || type.includes('shift') || type.includes('time_off') || type === 'schedule') return '/schedule';
  if (type === 'payroll' || type === 'payment') return '/pay-summary';
  return null;
}

// ─── Group by date ──────────────────────────────────────────────
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

type FilterType = 'all' | 'unread' | 'action';

export default function MuiNotifications() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useRealtime({ enabled: true, queryKeys: ['/api/notifications'] });

  const { data: resp, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/notifications"); return r.json(); },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const all: Notification[] = resp?.notifications || [];
  const unread = useMemo(() => all.filter(n => !n.isRead), [all]);
  const actionRequired = useMemo(() =>
    isManagerRole ? all.filter(n => MANAGER_ACTION_TYPES.has(n.type) && !n.isRead) : [],
    [all, isManagerRole]
  );

  const visibleList = useMemo(() => {
    if (filter === 'unread') return unread;
    if (filter === 'action') return actionRequired;
    return all;
  }, [filter, all, unread, actionRequired]);

  const grouped = useMemo(() => groupByDate(visibleList), [visibleList]);

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
      toast({ title: "Notification dismissed" });
    },
  });

  const handleClick = useCallback((n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    setExpandedId(prev => prev === n.id ? null : n.id);
  }, [markRead]);

  const handleNav = useCallback((n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    const path = getNavigatePath(n.type);
    if (path) setLocation(path);
  }, [markRead, setLocation]);

  // ─── Filter pill component ────────────────────────────────────
  const FilterPill = ({ id, label, count, icon }: { id: FilterType; label: string; count?: number; icon?: React.ReactNode }) => {
    const active = filter === id;
    return (
      <Box
        onClick={() => setFilter(id)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75,
          px: 2, py: 0.85,
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: active ? 700 : 500,
          color: active
            ? (isDark ? '#FBF8F4' : '#1F2937')
            : (isDark ? alpha('#FBF8F4', 0.5) : '#6B7280'),
          bgcolor: active
            ? (isDark ? alpha('#FBF8F4', 0.08) : '#FFF')
            : 'transparent',
          border: '1px solid',
          borderColor: active
            ? (isDark ? alpha('#FBF8F4', 0.15) : '#E5E7EB')
            : 'transparent',
          boxShadow: active ? (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)') : 'none',
          transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
          '&:hover': {
            bgcolor: active
              ? (isDark ? alpha('#FBF8F4', 0.1) : '#FFF')
              : (isDark ? alpha('#FBF8F4', 0.04) : alpha('#6B7280', 0.06)),
          },
          userSelect: 'none',
        }}
      >
        {icon}
        {label}
        {count != null && count > 0 && (
          <Box sx={{
            ml: 0.25,
            bgcolor: id === 'action' ? '#F59E0B' : (active ? (isDark ? '#F5EDE4' : '#3C2415') : (isDark ? alpha('#FBF8F4', 0.2) : '#D1D5DB')),
            color: id === 'action' ? '#fff' : (active ? (isDark ? '#1C1410' : '#FFF') : (isDark ? '#FBF8F4' : '#374151')),
            borderRadius: 8,
            px: 0.75,
            fontSize: '0.65rem',
            fontWeight: 800,
            lineHeight: '18px',
            minWidth: 18,
            textAlign: 'center',
          }}>
            {count}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 5 }, py: { xs: 2, sm: 4 }, maxWidth: 960, mx: 'auto' }}>

      {/* ─── Header ──────────────────────────────────────────── */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.5rem', sm: '1.85rem' },
                  color: isDark ? '#F5EDE4' : '#111827',
                  letterSpacing: '-0.02em',
                }}
              >
                Notifications
              </Typography>
              {unread.length > 0 && (
                <Badge
                  badgeContent={unread.length}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 800, minWidth: 22, height: 22, borderRadius: 11 } }}
                >
                  <Box />
                </Badge>
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: isDark ? alpha('#FBF8F4', 0.45) : '#9CA3AF', fontWeight: 500 }}>
              {all.length === 0 ? 'Nothing here yet' :
                unread.length > 0
                  ? `${unread.length} unread notification${unread.length > 1 ? 's' : ''}`
                  : 'You\'re all caught up'}
              {isManagerRole && actionRequired.length > 0 && ` \u00B7 ${actionRequired.length} awaiting review`}
            </Typography>
          </Box>

          {unread.length > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2.5,
                px: 2, py: 0.75, mt: 0.5,
                color: isDark ? '#F5EDE4' : '#374151',
                bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
                '&:hover': { bgcolor: isDark ? alpha('#FBF8F4', 0.1) : '#E5E7EB' },
              }}
            >
              {isMobile ? 'Read all' : 'Mark all read'}
            </Button>
          )}
        </Stack>

        {/* ─── Filter pills ────────────────────────────────── */}
        <Stack
          direction="row" spacing={0.75} alignItems="center"
          sx={{
            p: 0.5,
            bgcolor: isDark ? alpha('#FBF8F4', 0.03) : '#F9FAFB',
            borderRadius: 3,
            border: '1px solid',
            borderColor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
            width: 'fit-content',
          }}
        >
          <FilterPill id="all" label="All" count={all.length} />
          <FilterPill id="unread" label="Unread" count={unread.length} />
          {isManagerRole && (
            <FilterPill
              id="action" label="Action Required" count={actionRequired.length}
              icon={<ShieldIcon sx={{ fontSize: 14 }} />}
            />
          )}
        </Stack>
      </Box>

      {/* ─── Stream ──────────────────────────────────────────── */}
      {isLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3, opacity: 0.5 }} />
          ))}
        </Stack>
      ) : visibleList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: { xs: 8, sm: 12 }, px: 3 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: isDark ? alpha('#FBF8F4', 0.04) : '#F3F4F6',
            border: '2px dashed',
            borderColor: isDark ? alpha('#FBF8F4', 0.08) : '#E5E7EB',
          }}>
            <EmptyIcon sx={{ fontSize: 36, color: isDark ? alpha('#FBF8F4', 0.2) : '#D1D5DB' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#F5EDE4' : '#374151', mb: 0.75 }}>
            {filter === 'action' ? 'No pending actions' : filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? alpha('#FBF8F4', 0.35) : '#9CA3AF', maxWidth: 360, mx: 'auto' }}>
            {filter === 'action' ? 'All employee requests have been handled'
              : filter === 'unread' ? 'You\'ve read all your notifications'
              : 'Notifications about shifts, trades, and time off will appear here'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={{ xs: 3, sm: 4 }}>
          {grouped.map(group => (
            <Box key={group.label}>
              {/* Date section header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5, px: 0.5 }}>
                <Typography sx={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isDark ? alpha('#FBF8F4', 0.3) : '#9CA3AF',
                  whiteSpace: 'nowrap',
                }}>
                  {group.label}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: isDark ? alpha('#FBF8F4', 0.2) : '#D1D5DB' }}>
                  {group.items.length}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                {group.items.map(n => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    isExpanded={expandedId === n.id}
                    isHovered={hoveredId === n.id}
                    isManagerRole={isManagerRole}
                    isDark={isDark}
                    onClick={() => handleClick(n)}
                    onHover={setHoveredId}
                    onNavigate={() => handleNav(n)}
                    onDelete={() => deleteNotif.mutate(n.id)}
                    onMarkRead={() => markRead.mutate(n.id)}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}


// ─── Notification Card ──────────────────────────────────────────
function NotificationCard({
  notification: n, isExpanded, isHovered, isManagerRole, isDark,
  onClick, onHover, onNavigate, onDelete, onMarkRead,
}: {
  notification: Notification;
  isExpanded: boolean;
  isHovered: boolean;
  isManagerRole: boolean;
  isDark: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
  onNavigate: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
}) {
  const cfg = getConfig(n.type);
  const isAction = isManagerRole && MANAGER_ACTION_TYPES.has(n.type) && !n.isRead;
  const hasNav = !!getNavigatePath(n.type);

  const parsedData = useMemo(() => {
    if (!n.data) return null;
    try { return typeof n.data === 'string' ? JSON.parse(n.data) : n.data; } catch { return null; }
  }, [n.data]);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => onHover(n.id)}
      onMouseLeave={() => onHover(null)}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: isAction
          ? (isDark ? alpha('#F59E0B', 0.06) : '#FFFBEB')
          : (n.isRead
            ? (isDark ? alpha('#FBF8F4', 0.015) : '#FAFAFA')
            : (isDark ? alpha('#FBF8F4', 0.035) : '#FFF')),
        border: '1px solid',
        borderColor: isAction
          ? (isDark ? alpha('#F59E0B', 0.2) : '#FDE68A')
          : (isDark ? alpha('#FBF8F4', 0.06) : (n.isRead ? '#F3F4F6' : '#E5E7EB')),
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        transform: isHovered ? 'translateY(-1px)' : 'none',
        boxShadow: isHovered
          ? (isDark ? `0 8px 32px ${alpha('#000', 0.3)}` : `0 4px 20px ${alpha(cfg.color, 0.12)}`)
          : 'none',
        '&::before': !n.isRead ? {
          content: '""',
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: cfg.gradient,
          borderRadius: '3px 0 0 3px',
        } : undefined,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
        {/* Gradient icon */}
        <Avatar
          sx={{
            width: 42, height: 42,
            background: n.isRead ? (isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6') : cfg.gradient,
            color: n.isRead ? (isDark ? alpha('#FBF8F4', 0.4) : '#9CA3AF') : '#FFF',
            flexShrink: 0,
            fontSize: 20,
            boxShadow: n.isRead ? 'none' : `0 4px 12px ${alpha(cfg.color, 0.3)}`,
            transition: 'all 0.2s',
          }}
        >
          {cfg.icon}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.35 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: n.isRead ? 500 : 700,
                color: n.isRead ? (isDark ? alpha('#FBF8F4', 0.6) : '#6B7280') : (isDark ? '#F5EDE4' : '#111827'),
                lineHeight: 1.35,
                fontSize: '0.875rem',
              }}
              noWrap
            >
              {n.title}
            </Typography>
            {!n.isRead && (
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: cfg.gradient,
                boxShadow: `0 0 8px ${alpha(cfg.color, 0.5)}`,
              }} />
            )}
            {isAction && (
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '12px !important' }} />}
                label="Review"
                size="small"
                sx={{
                  height: 20, fontSize: '0.6rem', fontWeight: 800,
                  bgcolor: alpha('#F59E0B', 0.15), color: '#D97706',
                  border: `1px solid ${alpha('#F59E0B', 0.3)}`,
                  '& .MuiChip-icon': { color: '#D97706', ml: 0.5 },
                }}
              />
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: isDark ? alpha('#FBF8F4', 0.4) : '#9CA3AF',
              lineHeight: 1.5,
              fontSize: '0.8rem',
              ...(isExpanded ? {} : {
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }),
            }}
          >
            {n.message}
          </Typography>

          {/* Time + type */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
            <Typography sx={{
              fontSize: '0.7rem', fontWeight: 500,
              color: isDark ? alpha('#FBF8F4', 0.25) : '#D1D5DB',
            }}>
              {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: isDark ? alpha('#FBF8F4', 0.15) : '#E5E7EB' }} />
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
              color: cfg.color, textTransform: 'uppercase',
            }}>
              {cfg.label}
            </Typography>
          </Stack>
        </Box>

        {/* Hover quick-actions */}
        <Fade in={isHovered && !isExpanded}>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, mt: 0.5 }}>
            {!n.isRead && (
              <Tooltip title="Mark read" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); onMarkRead(); }}
                  sx={{
                    width: 30, height: 30,
                    bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
                    '&:hover': { bgcolor: alpha('#10B981', isDark ? 0.15 : 0.1), color: '#10B981' },
                  }}
                >
                  <CheckIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            {hasNav && (
              <Tooltip title="Open" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); onNavigate(); }}
                  sx={{
                    width: 30, height: 30,
                    bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
                    '&:hover': { bgcolor: alpha('#3B82F6', isDark ? 0.15 : 0.1), color: '#3B82F6' },
                  }}
                >
                  <OpenIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Dismiss" arrow placement="top">
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onDelete(); }}
                sx={{
                  width: 30, height: 30,
                  bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
                  '&:hover': { bgcolor: alpha('#EF4444', isDark ? 0.15 : 0.1), color: '#EF4444' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Fade>
      </Stack>

      {/* ─── Expanded ──────────────────────────────────────── */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 0 }}>
          <Box sx={{ height: 1, bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6', mb: 2, mx: -0.5 }} />

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
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {entries.map(([k, v]) => {
                  let display = String(v);
                  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                    try { display = format(new Date(v), 'MMM d, yyyy'); } catch {/* */}
                  }
                  const label = LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                  const isStatus = k === 'status' || k === 'tradeType';
                  const sColor = isStatus ? statusColors[String(v)] : undefined;

                  return (
                    <Box
                      key={k}
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                        px: 1.5, py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        bgcolor: isDark ? alpha('#FBF8F4', 0.04) : '#F9FAFB',
                        border: '1px solid',
                        borderColor: sColor ? alpha(sColor, 0.3) : (isDark ? alpha('#FBF8F4', 0.08) : '#F3F4F6'),
                        color: sColor || (isDark ? alpha('#FBF8F4', 0.6) : '#6B7280'),
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>{label}:</span> {isStatus ? display.replace(/_/g, ' ') : display}
                    </Box>
                  );
                })}
              </Stack>
            );
          })()}

          <Stack direction="row" spacing={1} alignItems="center">
            {hasNav && (
              <Button
                size="small"
                startIcon={<OpenIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                  px: 2, py: 0.65, fontSize: '0.78rem',
                  color: '#FFF', bgcolor: cfg.color,
                  boxShadow: `0 2px 8px ${alpha(cfg.color, 0.3)}`,
                  '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                }}
              >
                {n.type.includes('payroll') || n.type === 'payment' ? 'View Payroll' : 'View Schedule'}
              </Button>
            )}
            {isAction && (
              <Button
                size="small"
                startIcon={<ShieldIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                  px: 2, py: 0.65, fontSize: '0.78rem',
                  color: '#FFF', bgcolor: '#F59E0B',
                  boxShadow: `0 2px 8px ${alpha('#F59E0B', 0.3)}`,
                  '&:hover': { bgcolor: '#D97706' },
                }}
              >
                Review Request
              </Button>
            )}
            {!n.isRead && (
              <Button
                size="small"
                startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onMarkRead(); }}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 2.5,
                  px: 2, py: 0.65, fontSize: '0.78rem',
                  color: isDark ? alpha('#FBF8F4', 0.6) : '#6B7280',
                  bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6',
                  '&:hover': { bgcolor: isDark ? alpha('#FBF8F4', 0.1) : '#E5E7EB' },
                }}
              >
                Mark Read
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Dismiss" arrow>
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onDelete(); }}
                sx={{
                  width: 32, height: 32,
                  color: isDark ? alpha('#FBF8F4', 0.25) : '#D1D5DB',
                  '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.08) },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}
