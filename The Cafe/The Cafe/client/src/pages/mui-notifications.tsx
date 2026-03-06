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
  alpha, Fade,
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
  FiberManualRecord as DotIcon,
  KeyboardArrowDown as ExpandIcon,
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
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  shift_update:      { icon: <ScheduleIcon sx={{ fontSize: 20 }} />, color: '#3B82F6', bg: '#EFF6FF', label: 'Schedule' },
  shift_assigned:    { icon: <ScheduleIcon sx={{ fontSize: 20 }} />, color: '#3B82F6', bg: '#EFF6FF', label: 'Assigned' },
  schedule:          { icon: <ScheduleIcon sx={{ fontSize: 20 }} />, color: '#3B82F6', bg: '#EFF6FF', label: 'Schedule' },
  shift_trade:       { icon: <SwapIcon sx={{ fontSize: 20 }} />,     color: '#8B5CF6', bg: '#F5F3FF', label: 'Trade' },
  trade_request:     { icon: <SwapIcon sx={{ fontSize: 20 }} />,     color: '#8B5CF6', bg: '#F5F3FF', label: 'Trade' },
  time_off:          { icon: <EventIcon sx={{ fontSize: 20 }} />,    color: '#F59E0B', bg: '#FFFBEB', label: 'Time Off' },
  time_off_approved: { icon: <SuccessIcon sx={{ fontSize: 20 }} />,  color: '#10B981', bg: '#ECFDF5', label: 'Approved' },
  time_off_rejected: { icon: <ErrorIcon sx={{ fontSize: 20 }} />,    color: '#EF4444', bg: '#FEF2F2', label: 'Rejected' },
  payroll:           { icon: <PayIcon sx={{ fontSize: 20 }} />,      color: '#06B6D4', bg: '#ECFEFF', label: 'Payroll' },
  payment:           { icon: <PayIcon sx={{ fontSize: 20 }} />,      color: '#06B6D4', bg: '#ECFEFF', label: 'Payment' },
  approval:          { icon: <SuccessIcon sx={{ fontSize: 20 }} />,  color: '#10B981', bg: '#ECFDF5', label: 'Approved' },
  rejection:         { icon: <ErrorIcon sx={{ fontSize: 20 }} />,    color: '#EF4444', bg: '#FEF2F2', label: 'Rejected' },
  clock_in:          { icon: <ClockIcon sx={{ fontSize: 20 }} />,    color: '#10B981', bg: '#ECFDF5', label: 'Clock In' },
  clock_out:         { icon: <ClockIcon sx={{ fontSize: 20 }} />,    color: '#F59E0B', bg: '#FFFBEB', label: 'Clock Out' },
  adjustment:        { icon: <MoneyIcon sx={{ fontSize: 20 }} />,    color: '#06B6D4', bg: '#ECFEFF', label: 'Adjustment' },
  warning:           { icon: <WarningIcon sx={{ fontSize: 20 }} />,  color: '#F59E0B', bg: '#FFFBEB', label: 'Warning' },
  success:           { icon: <SuccessIcon sx={{ fontSize: 20 }} />,  color: '#10B981', bg: '#ECFDF5', label: 'Success' },
  error:             { icon: <ErrorIcon sx={{ fontSize: 20 }} />,    color: '#EF4444', bg: '#FEF2F2', label: 'Error' },
  info:              { icon: <InfoIcon sx={{ fontSize: 20 }} />,     color: '#6B7280', bg: '#F9FAFB', label: 'Info' },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] || { icon: <InfoIcon sx={{ fontSize: 20 }} />, color: '#6B7280', bg: '#F9FAFB', label: 'General' };
}

const MANAGER_ACTION_TYPES = new Set(['trade_request', 'time_off']);

function getNavigatePath(type: string): string | null {
  if (type.includes('trade') || type.includes('shift') || type.includes('time_off') || type === 'schedule') return '/schedule';
  if (type === 'payroll' || type === 'payment') return '/pay-summary';
  return null;
}

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

  const filterBtns: { id: FilterType; label: string; count: number; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All', count: all.length },
    { id: 'unread', label: 'Unread', count: unread.length },
    ...(isManagerRole ? [{ id: 'action' as FilterType, label: 'Action Required', count: actionRequired.length, icon: <ShieldIcon sx={{ fontSize: 15 }} /> }] : []),
  ];

  // Theme tokens
  const bg = isDark ? '#151010' : '#F8F9FB';
  const surface = isDark ? '#1C1410' : '#FFFFFF';
  const surfaceAlt = isDark ? '#241B14' : '#F9FAFB';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const txt1 = isDark ? '#F5EDE4' : '#111827';
  const txt2 = isDark ? 'rgba(245,237,228,0.55)' : '#6B7280';
  const txt3 = isDark ? 'rgba(245,237,228,0.3)' : '#D1D5DB';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg }}>
      {/* ─── Header area ─────────────────────────────────────── */}
      <Box sx={{
        bgcolor: surface,
        borderBottom: `1px solid ${border}`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3 },
        pb: 0,
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{
                fontWeight: 800,
                fontSize: { xs: '1.35rem', sm: '1.6rem' },
                color: txt1,
                letterSpacing: '-0.02em',
              }}>
                Notifications
              </Typography>
              {unread.length > 0 && (
                <Box sx={{
                  bgcolor: '#EF4444', color: '#FFF', borderRadius: '12px',
                  px: 1, fontSize: '0.72rem', fontWeight: 800, lineHeight: '22px',
                  minWidth: 24, textAlign: 'center',
                }}>
                  {unread.length} new
                </Box>
              )}
            </Stack>
            <Typography sx={{ color: txt2, fontSize: '0.82rem', fontWeight: 500, mt: 0.25 }}>
              {all.length === 0 ? 'No notifications yet' :
                unread.length > 0 ? `${unread.length} unread of ${all.length} total` : `${all.length} notifications · All read`}
              {isManagerRole && actionRequired.length > 0 && ` · ${actionRequired.length} need review`}
            </Typography>
          </Box>

          {unread.length > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                px: 2.5, py: 0.85, fontSize: '0.8rem',
                color: txt1, bgcolor: surfaceAlt,
                border: `1px solid ${border}`,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' },
              }}
            >
              {isMobile ? 'Read all' : 'Mark all read'}
            </Button>
          )}
        </Stack>

        {/* ─── Filter tabs ──────────────────────────────────── */}
        <Stack direction="row" spacing={0}>
          {filterBtns.map(f => {
            const active = filter === f.id;
            return (
              <Box
                key={f.id}
                onClick={() => setFilter(f.id)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.75,
                  px: { xs: 1.5, sm: 2.5 }, py: 1.25,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? txt1 : txt2,
                  borderBottom: '2px solid',
                  borderColor: active ? (f.id === 'action' ? '#F59E0B' : (isDark ? '#F5EDE4' : '#111827')) : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { color: txt1 },
                  userSelect: 'none',
                }}
              >
                {f.icon}
                <span>{f.label}</span>
                {f.count > 0 && (
                  <Box sx={{
                    bgcolor: active
                      ? (f.id === 'action' ? alpha('#F59E0B', 0.15) : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'))
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    color: active
                      ? (f.id === 'action' ? '#D97706' : txt1)
                      : txt2,
                    borderRadius: '10px',
                    px: 0.85, fontSize: '0.65rem', fontWeight: 800,
                    lineHeight: '18px', minWidth: 20, textAlign: 'center',
                  }}>
                    {f.count}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ─── Content ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        {isLoading ? (
          <Stack spacing={1}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : visibleList.length === 0 ? (
          <Box sx={{
            bgcolor: surface, borderRadius: 4, border: `1px solid ${border}`,
            textAlign: 'center', py: { xs: 8, sm: 12 }, px: 3,
          }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: surfaceAlt, border: `2px dashed ${border}`,
            }}>
              <EmptyIcon sx={{ fontSize: 36, color: txt3 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: txt1, mb: 0.5 }}>
              {filter === 'action' ? 'No pending actions' : filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Typography>
            <Typography sx={{ color: txt2, fontSize: '0.85rem', maxWidth: 380, mx: 'auto' }}>
              {filter === 'action' ? 'All employee requests have been reviewed'
                : filter === 'unread' ? 'You\'ve read all your notifications'
                : 'Updates about shifts, trades, and time off will show up here'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {grouped.map(group => (
              <Box key={group.label}>
                {/* Date header */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1, px: 0.5 }}>
                  <Typography sx={{
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: txt3, whiteSpace: 'nowrap',
                  }}>
                    {group.label}
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: border }} />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: txt3 }}>
                    {group.items.length}
                  </Typography>
                </Stack>

                {/* Card container */}
                <Box sx={{
                  bgcolor: surface,
                  borderRadius: 3,
                  border: `1px solid ${border}`,
                  overflow: 'hidden',
                }}>
                  {group.items.map((n, idx) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      isExpanded={expandedId === n.id}
                      isManagerRole={isManagerRole}
                      isDark={isDark}
                      isLast={idx === group.items.length - 1}
                      surfaceAlt={surfaceAlt}
                      border={border}
                      txt1={txt1}
                      txt2={txt2}
                      txt3={txt3}
                      onClick={() => handleClick(n)}
                      onNavigate={() => handleNav(n)}
                      onDelete={() => deleteNotif.mutate(n.id)}
                      onMarkRead={() => markRead.mutate(n.id)}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}


// ─── Notification Row ───────────────────────────────────────────
function NotificationRow({
  notification: n, isExpanded, isManagerRole, isDark, isLast,
  surfaceAlt, border, txt1, txt2, txt3,
  onClick, onNavigate, onDelete, onMarkRead,
}: {
  notification: Notification;
  isExpanded: boolean;
  isManagerRole: boolean;
  isDark: boolean;
  isLast: boolean;
  surfaceAlt: string;
  border: string;
  txt1: string;
  txt2: string;
  txt3: string;
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
    try { return typeof n.data === 'string' ? JSON.parse(n.data) : n.data; } catch { return null; }
  }, [n.data]);

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        px: { xs: 2, sm: 3 },
        py: { xs: 1.75, sm: 2 },
        borderBottom: isLast ? 'none' : `1px solid ${border}`,
        transition: 'background 0.15s ease',
        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' },
        // Left accent bar for unread
        ...(!n.isRead ? {
          '&::before': {
            content: '""', position: 'absolute',
            left: 0, top: 8, bottom: 8,
            width: 3, bgcolor: cfg.color,
            borderRadius: '0 3px 3px 0',
          },
        } : {}),
        // Action tint
        ...(isAction ? { bgcolor: isDark ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.02)' } : {}),
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={{ xs: 1.5, sm: 2 }}>
        {/* Icon box */}
        <Box sx={{
          width: 42, height: 42, borderRadius: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: isDark ? alpha(cfg.color, 0.12) : cfg.bg,
          color: cfg.color, flexShrink: 0, mt: 0.25,
          border: `1px solid ${alpha(cfg.color, isDark ? 0.18 : 0.1)}`,
        }}>
          {cfg.icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title line */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.15 }}>
            <Typography sx={{
              fontWeight: n.isRead ? 500 : 700,
              fontSize: '0.88rem',
              color: n.isRead ? txt2 : txt1,
              lineHeight: 1.35, flex: 1, minWidth: 0,
            }} noWrap>
              {n.title}
            </Typography>

            {!n.isRead && <DotIcon sx={{ fontSize: 9, color: cfg.color, flexShrink: 0 }} />}

            {isAction && (
              <Chip label="Needs Review" size="small" sx={{
                height: 22, fontSize: '0.63rem', fontWeight: 800,
                bgcolor: alpha('#F59E0B', 0.12), color: '#D97706',
                border: `1px solid ${alpha('#F59E0B', 0.2)}`, flexShrink: 0,
              }} />
            )}

            {/* Time */}
            <Typography sx={{
              fontSize: '0.72rem', fontWeight: 500, color: txt3,
              whiteSpace: 'nowrap', flexShrink: 0,
              display: { xs: 'none', md: 'block' },
            }}>
              {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
            </Typography>
          </Stack>

          {/* Message */}
          <Typography sx={{
            fontSize: '0.82rem', color: txt2, lineHeight: 1.5,
            ...(!isExpanded && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
          }}>
            {n.message}
          </Typography>

          {/* Meta line */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              px: 0.85, py: 0.1, borderRadius: 1.5,
              bgcolor: isDark ? alpha(cfg.color, 0.08) : cfg.bg,
              border: `1px solid ${alpha(cfg.color, isDark ? 0.12 : 0.08)}`,
            }}>
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em',
                color: cfg.color, textTransform: 'uppercase',
              }}>
                {cfg.label}
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: '0.68rem', fontWeight: 500, color: txt3,
              display: { xs: 'block', md: 'none' },
            }}>
              {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <ExpandIcon sx={{
              fontSize: 18, color: txt3,
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(180deg)' : 'none',
            }} />
          </Stack>
        </Box>
      </Stack>

      {/* ─── Expanded ──────────────────────────────────────── */}
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2, ml: { xs: 0, sm: 6.5 } }}>
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
                    <Box key={k} sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.75,
                      px: 1.5, py: 0.5, borderRadius: 2,
                      fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      bgcolor: sColor ? alpha(sColor, isDark ? 0.1 : 0.06) : surfaceAlt,
                      border: '1px solid', borderColor: sColor ? alpha(sColor, 0.2) : border,
                      color: sColor || txt2,
                    }}>
                      <span style={{ opacity: 0.55, fontWeight: 500 }}>{label}:</span>
                      <span style={{ fontWeight: 700 }}>{isStatus ? display.replace(/_/g, ' ') : display}</span>
                    </Box>
                  );
                })}
              </Stack>
            );
          })()}

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            {hasNav && (
              <Button
                size="small" startIcon={<OpenIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                  px: 2.5, py: 0.75, fontSize: '0.8rem',
                  color: '#FFF', bgcolor: cfg.color,
                  '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                }}
              >
                {n.type.includes('payroll') || n.type === 'payment' ? 'View Payroll' : 'View Schedule'}
              </Button>
            )}
            {isAction && (
              <Button
                size="small" startIcon={<ShieldIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onNavigate(); }}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                  px: 2.5, py: 0.75, fontSize: '0.8rem',
                  color: '#FFF', bgcolor: '#F59E0B',
                  '&:hover': { bgcolor: '#D97706' },
                }}
              >
                Review
              </Button>
            )}
            {!n.isRead && (
              <Button
                size="small" startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                onClick={e => { e.stopPropagation(); onMarkRead(); }}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 2.5,
                  px: 2, py: 0.75, fontSize: '0.8rem',
                  color: txt2, bgcolor: surfaceAlt,
                  border: `1px solid ${border}`,
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' },
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
                sx={{ width: 34, height: 34, color: txt3, '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.08) } }}
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
