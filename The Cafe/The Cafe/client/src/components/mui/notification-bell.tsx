import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { useRealtime } from '@/hooks/use-realtime';

// MUI Components
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  alpha,
  useTheme,
  CircularProgress,
  Chip,
} from '@mui/material';

// MUI Icons
import {
  Notifications as NotificationsIcon,
  EventBusy as TimeOffIcon,
  SwapHoriz as TradeIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  AccessTime as PendingIcon,
  MarkEmailRead as MarkReadIcon,
  OpenInNew as OpenIcon,
  NotificationsNone as EmptyIcon,
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

// Get icon based on notification type
const getNotificationIcon = (type: string, data?: any) => {
  switch (type) {
    case 'time_off':
      return <TimeOffIcon sx={{ color: 'primary.main' }} />;
    case 'shift_trade':
      return <TradeIcon sx={{ color: 'secondary.main' }} />;
    case 'approval':
      return <ApprovedIcon sx={{ color: 'success.main' }} />;
    case 'rejection':
      return <RejectedIcon sx={{ color: 'error.main' }} />;
    default:
      return <PendingIcon sx={{ color: 'warning.main' }} />;
  }
};

export default function NotificationBell() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch notifications with real-time updates
  const { data: notificationsData, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/notifications');
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds for real-time feel
    refetchOnWindowFocus: true,
  });

  // Subscribe to real-time updates
  useRealtime('notification', () => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Mark notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', '/api/notifications/read-all');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    handleClose();
  };

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.action.hover, 0.08),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            color: 'primary.main',
          },
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
              fontSize: 10,
              minWidth: 18,
              height: 18,
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
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 8,
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: 'hidden',
            mt: 1.5,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} new`} 
              size="small" 
              color="primary" 
              sx={{ height: 22, fontSize: 11 }} 
            />
          )}
        </Box>

        {/* Notification List */}
        <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <EmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: notification.isRead 
                        ? 'transparent' 
                        : alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          fontWeight={notification.isRead ? 400 : 600}
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box component="span">
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItemButton>
                  {index < recentNotifications.length - 1 && (
                    <Divider sx={{ opacity: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer Actions */}
        <Box sx={{ 
          p: 1.5, 
          display: 'flex', 
          gap: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkReadIcon />}
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              sx={{ flex: 1 }}
            >
              Mark all read
            </Button>
          )}
          <Button
            component={Link}
            href="/notifications"
            size="small"
            variant="contained"
            endIcon={<OpenIcon sx={{ fontSize: 14 }} />}
            onClick={handleClose}
            sx={{ flex: 1 }}
          >
            View All
          </Button>
        </Box>
      </Menu>
    </>
  );
}
