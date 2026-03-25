import PesoIcon from "@/components/PesoIcon";
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { useRealtime } from '@/hooks/use-realtime';

import {
  IconButton, Badge, Menu, Typography, Box, Button,
  Avatar, Stack, alpha, useTheme, CircularProgress,
} from '@mui/material';

import {
  Notifications as NotificationsIcon,
  SwapHoriz as TradeIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  OpenInNew as OpenIcon,
  NotificationsNone as EmptyIcon,
  CalendarMonth as ScheduleIcon,
  EventAvailable as EventIcon,
  EventBusy as TimeOffRejectedIcon,
  Tune as AdjustmentIcon,
  Info as InfoIcon,
  Login as ClockInIcon,
  Logout as ClockOutIcon,
  DoneAll as DoneAllIcon,
  AccessTime as ClockIcon,
  Sell as PayIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: string;
  createdAt: string;
}

const TYPE_STYLE: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  shift_update:      { icon: <ScheduleIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  shift_assigned:    { icon: <ScheduleIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  schedule:          { icon: <ScheduleIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  shift_trade:       { icon: <TradeIcon sx={{ fontSize: 16 }} />,    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
  trade_request:     { icon: <TradeIcon sx={{ fontSize: 16 }} />,    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
  time_off:          { icon: <EventIcon sx={{ fontSize: 16 }} />,    color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  time_off_approved: { icon: <ApprovedIcon sx={{ fontSize: 16 }} />, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  time_off_rejected: { icon: <ErrorIcon sx={{ fontSize: 16 }} />,    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  payroll:           { icon: <PayIcon sx={{ fontSize: 16 }} />,      color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
  payment:           { icon: <PayIcon sx={{ fontSize: 16 }} />,      color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
  approval:          { icon: <ApprovedIcon sx={{ fontSize: 16 }} />, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  rejection:         { icon: <ErrorIcon sx={{ fontSize: 16 }} />,    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  adjustment:        { icon: <AdjustmentIcon sx={{ fontSize: 16 }} />, color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
};

function getStyle(type: string) {
  return TYPE_STYLE[type] || { icon: <InfoIcon sx={{ fontSize: 16 }} />, color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4B5563)' };
}

export default function NotificationBell() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { isAuthenticated } = useAuth();

  const { data: notificationsData, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/notifications');
      return res.json();
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: isAuthenticated,
  });

  useRealtime({
    enabled: isAuthenticated,
    queryKeys: ['/api/notifications'],
    onEvent: (event) => {
      if (event === 'notification:created' || event === 'notification' ||
          event.startsWith('time-off:') || event.startsWith('trade:') ||
          event.startsWith('shift:')) {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/notifications'] }),
    onError: (error: Error) => console.error('Failed to mark notification read:', error.message),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', '/api/notifications/read-all');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/notifications'] }),
    onError: (error: Error) => console.error('Failed to mark all notifications read:', error.message),
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) markReadMutation.mutate(notification.id);
    setAnchorEl(null);
  };

  const recentNotifications = notifications.slice(0, 6);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{
          position: 'relative',
          bgcolor: alpha(theme.palette.action.hover, 0.08),
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' },
        }}
        aria-label={`${unreadCount} unread notifications`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 10, minWidth: 18, height: 18,
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            },
          }}
        >
          <NotificationsIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            elevation: 16,
            sx: {
              width: 400,
              maxHeight: 520,
              overflow: 'hidden',
              mt: 1.5,
              bgcolor: isDark ? '#1C1410' : '#FFF',
              border: `1px solid ${isDark ? alpha('#FBF8F4', 0.08) : '#E5E7EB'}`,
              borderRadius: 3.5,
              backdropFilter: 'blur(20px)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Stack
          direction="row" alignItems="center" justifyContent="space-between"
          sx={{
            px: 2.5, py: 2,
            borderBottom: `1px solid ${isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6'}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: isDark ? '#F5EDE4' : '#111827', letterSpacing: '-0.01em' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#fff', borderRadius: 10, px: 0.8,
                fontSize: '0.6rem', fontWeight: 800, lineHeight: '18px', minWidth: 18, textAlign: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
              }}>
                {unreadCount}
              </Box>
            )}
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 13 }} />}
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              sx={{
                textTransform: 'none', fontSize: '0.72rem', fontWeight: 600,
                borderRadius: 2, minWidth: 0, px: 1.5, py: 0.4,
                color: isDark ? alpha('#FBF8F4', 0.5) : '#9CA3AF',
                '&:hover': { bgcolor: isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6' },
              }}
            >
              Read all
            </Button>
          )}
        </Stack>

        {/* List */}
        <Box sx={{ maxHeight: 380, overflow: 'auto', py: 0.75 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress size={24} sx={{ color: isDark ? alpha('#FBF8F4', 0.3) : '#D1D5DB' }} />
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: isDark ? alpha('#FBF8F4', 0.04) : '#F3F4F6',
                border: '2px dashed',
                borderColor: isDark ? alpha('#FBF8F4', 0.08) : '#E5E7EB',
              }}>
                <EmptyIcon sx={{ fontSize: 24, color: isDark ? alpha('#FBF8F4', 0.2) : '#D1D5DB' }} />
              </Box>
              <Typography variant="body2" sx={{ color: isDark ? alpha('#FBF8F4', 0.4) : '#9CA3AF', fontWeight: 500 }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <Stack>
              {recentNotifications.map((n) => {
                const style = getStyle(n.type);
                return (
                  <Box
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      position: 'relative',
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      px: 2.5, py: 1.75, cursor: 'pointer',
                      bgcolor: n.isRead ? 'transparent' : (isDark ? alpha('#FBF8F4', 0.02) : '#FAFAFA'),
                      transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
                      '&:hover': {
                        bgcolor: alpha(style.color, isDark ? 0.08 : 0.04),
                      },
                      '&::before': !n.isRead ? {
                        content: '""',
                        position: 'absolute',
                        left: 0, top: 8, bottom: 8,
                        width: 3,
                        background: style.gradient,
                        borderRadius: '0 3px 3px 0',
                      } : undefined,
                    }}
                  >
                    <Avatar sx={{
                      width: 34, height: 34, flexShrink: 0, mt: 0.15,
                      background: n.isRead ? (isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6') : style.gradient,
                      color: n.isRead ? (isDark ? alpha('#FBF8F4', 0.35) : '#9CA3AF') : '#FFF',
                      boxShadow: n.isRead ? 'none' : `0 3px 8px ${alpha(style.color, 0.3)}`,
                    }}>
                      {style.icon}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: n.isRead ? 500 : 700,
                            fontSize: '0.8rem',
                            color: n.isRead ? (isDark ? alpha('#FBF8F4', 0.55) : '#6B7280') : (isDark ? '#F5EDE4' : '#111827'),
                            lineHeight: 1.3,
                          }}
                        >
                          {n.title}
                        </Typography>
                        {!n.isRead && (
                          <Box sx={{
                            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                            background: style.gradient,
                            boxShadow: `0 0 6px ${alpha(style.color, 0.5)}`,
                          }} />
                        )}
                      </Stack>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.72rem', lineHeight: 1.4, mt: 0.15,
                          color: isDark ? alpha('#FBF8F4', 0.3) : '#9CA3AF',
                        }}
                      >
                        {n.message}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.4 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: isDark ? alpha('#FBF8F4', 0.2) : '#D1D5DB', fontWeight: 500 }}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </Typography>
                        <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: isDark ? alpha('#FBF8F4', 0.12) : '#E5E7EB' }} />
                        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: style.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {(TYPE_STYLE[n.type] ? n.type.replace(/_/g, ' ') : 'notification')}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 2.5, py: 1.75,
          borderTop: `1px solid ${isDark ? alpha('#FBF8F4', 0.06) : '#F3F4F6'}`,
        }}>
          <Button
            component={Link}
            href="/notifications"
            fullWidth size="small"
            endIcon={<OpenIcon sx={{ fontSize: 13 }} />}
            onClick={() => setAnchorEl(null)}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
              py: 1, fontSize: '0.8rem',
              color: '#FFF',
              background: isDark ? 'linear-gradient(135deg, #3C2415, #5C3A20)' : 'linear-gradient(135deg, #3C2415, #2A1A0E)',
              boxShadow: `0 2px 8px ${alpha('#3C2415', 0.3)}`,
              '&:hover': {
                background: isDark ? 'linear-gradient(135deg, #5C3A20, #7A4F2A)' : 'linear-gradient(135deg, #2A1A0E, #3C2415)',
              },
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}
