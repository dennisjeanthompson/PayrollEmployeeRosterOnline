import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, getCurrentUser } from "@/lib/auth";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useRealtime } from "@/hooks/use-realtime";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  alpha,
  useTheme,
  Skeleton,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Slide,
  Zoom,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as MutedIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapIcon,
  EventAvailable as EventIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DoneAll as DoneAllIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Visibility as ViewIcon,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function MuiNotifications() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [, setLocation] = useLocation();

  // Subscribe to real-time notification updates via WebSocket
  useRealtime({
    enabled: true,
    queryKeys: ['/api/notifications'],
  });

  // Fetch notifications with real-time updates
  const { data: notificationsResponse, isLoading, refetch } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/notifications");
      return response.json();
    },
    refetchOnWindowFocus: true
  });

  const notifications: Notification[] = notificationsResponse?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Notification marked as read" });
    },
  });

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  // Delete notification mutation
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Notification deleted" });
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    },
  });

  const handleOpenDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    // Mark as read when opening detail
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDeleteClick = (notification: Notification, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification.mutate(notificationToDelete.id);
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      shift_update: "Shift Update",
      shift_assigned: "Shift Assigned",
      shift_trade: "Shift Trade",
      trade_request: "Trade Request",
      time_off: "Time Off",
      time_off_approved: "Approved",
      time_off_rejected: "Rejected",
      payroll: "Payroll",
      payment: "Payment",
      approval: "Approval",
      rejection: "Rejected",
      schedule: "Schedule",
      clock_in: "Clock In",
      clock_out: "Clock Out",
      adjustment: "Adjustment",
      warning: "Warning",
      success: "Success",
      error: "Error",
      info: "Information",
    };
    return typeLabels[type] || "General";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "shift_update":
      case "shift_assigned":
      case "schedule":
        return <ScheduleIcon />;
      case "shift_trade":
      case "trade_request":
        return <SwapIcon />;
      case "time_off":
        return <EventIcon />;
      case "time_off_approved":
      case "approval":
        return <SuccessIcon />;
      case "time_off_rejected":
      case "rejection":
        return <ErrorIcon />;
      case "payroll":
      case "payment":
        return <MoneyIcon />;
      case "clock_in":
        return <ScheduleIcon />;
      case "clock_out":
        return <ScheduleIcon />;
      case "adjustment":
        return <MoneyIcon />;
      case "warning":
        return <WarningIcon />;
      case "success":
        return <SuccessIcon />;
      case "error":
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "shift_update":
      case "shift_assigned":
      case "schedule":
        return theme.palette.primary.main;
      case "shift_trade":
      case "trade_request":
        return theme.palette.secondary.main;
      case "time_off":
        return theme.palette.primary.main;
      case "time_off_approved":
      case "approval":
      case "success":
        return theme.palette.success.main;
      case "time_off_rejected":
      case "rejection":
      case "error":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "payroll":
      case "payment":
      case "adjustment":
        return theme.palette.info.main;
      case "clock_in":
        return theme.palette.success.main;
      case "clock_out":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const NotificationItem = ({ notification, showActions = true }: { notification: Notification; showActions?: boolean }) => {
    const iconColor = getNotificationColor(notification.type);
    const isTrade = notification.type.includes('trade');
    const isTimeOff = notification.type.includes('time_off');
    const isPayroll = notification.type === 'payroll' || notification.type === 'payment';

    // Smart navigation based on notification type
    const handleNavigate = () => {
      if (!notification.isRead) {
        markAsRead.mutate(notification.id);
      }
      if (isTrade || notification.type === 'schedule' || notification.type.includes('shift')) {
        setLocation('/schedule');
      } else if (isTimeOff) {
        setLocation('/schedule');
      } else if (isPayroll) {
        setLocation('/pay-summary');
      }
    };

    return (
      <Paper
        elevation={0}
        onClick={() => handleOpenDetail(notification)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          mb: 1.5,
          borderRadius: 3,
          bgcolor: notification.isRead 
            ? 'transparent' 
            : alpha(iconColor, 0.04),
          border: `1px solid ${notification.isRead ? alpha(theme.palette.divider, 0.08) : alpha(iconColor, 0.15)}`,
          transition: "all 0.2s ease",
          cursor: "pointer",
          "&:hover": {
            bgcolor: alpha(iconColor, 0.08),
            borderColor: alpha(iconColor, 0.3),
            transform: "translateY(-1px)",
            boxShadow: `0 4px 16px ${alpha(iconColor, 0.1)}`,
          },
        }}
      >
        {/* Icon */}
        <Avatar 
          sx={{ 
            bgcolor: alpha(iconColor, 0.12), 
            color: iconColor,
            width: 44,
            height: 44,
            flexShrink: 0,
          }}
        >
          {getNotificationIcon(notification.type)}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
            <Typography 
              variant="body1" 
              fontWeight={notification.isRead ? 500 : 700}
              noWrap
              sx={{ 
                color: notification.isRead ? 'text.primary' : iconColor,
                lineHeight: 1.3,
              }}
            >
              {notification.title}
            </Typography>
            {!notification.isRead && (
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: iconColor, flexShrink: 0,
                }}
              />
            )}
          </Stack>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap
            sx={{ mb: 0.5, lineHeight: 1.4 }}
          >
            {notification.message}
          </Typography>
          <Typography variant="caption" color="text.disabled" fontWeight={500}>
            {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
          </Typography>
        </Box>

        {/* Actions */}
        {showActions && (
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {!notification.isRead && (
              <Tooltip title="Mark as read" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead.mutate(notification.id);
                  }}
                  sx={{ 
                    color: iconColor,
                    "&:hover": { bgcolor: alpha(iconColor, 0.1) }
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {(isTrade || isTimeOff || isPayroll) && (
              <Tooltip title={isTrade ? "Go to Schedule" : isPayroll ? "Go to Pay Summary" : "Go to Schedule"} arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                  sx={{ 
                    color: "text.secondary",
                    "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main" }
                  }}
                >
                  <OpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteClick(notification, e)}
                sx={{ 
                  color: "text.disabled",
                  "&:hover": { 
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: "error.main" 
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Paper>
    );
  };

  return (
    <>
      <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" fontWeight={700}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Stay updated with your schedule and team activities
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                Mark All Read
              </Button>
            )}
          </Stack>
        </Box>

        {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Unread
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {unreadCount}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: "success.main" }}>
                  <MarkReadIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Read
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {readNotifications.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: "info.main" }}>
                  <NotificationsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {notifications.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: "secondary.main" }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This Week
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {notifications.filter((n) => {
                      const date = parseISO(n.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return date > weekAgo;
                    }).length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Notifications List */}
        <Paper sx={{ borderRadius: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>All</span>
                  <Chip label={notifications.length} size="small" />
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Unread</span>
                  {unreadCount > 0 && <Chip label={unreadCount} size="small" color="primary" />}
                </Stack>
              }
            />
            <Tab label="Read" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 2 }}>
              {notifications.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    You'll be notified about schedule changes and updates
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 2 }}>
              {unreadNotifications.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <CheckIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    All caught up!
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    You have no unread notifications
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 2 }}>
              {readNotifications.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <MarkReadIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No read notifications
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {readNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Notification Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            overflow: 'hidden',
          }
        }}
      >
        {selectedNotification && (
          <>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(getNotificationColor(selectedNotification.type), 0.15)} 0%, ${alpha(getNotificationColor(selectedNotification.type), 0.05)} 100%)`,
                borderBottom: `1px solid ${alpha(getNotificationColor(selectedNotification.type), 0.2)}`,
                p: 3,
              }}
            >
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(getNotificationColor(selectedNotification.type), 0.2),
                      color: getNotificationColor(selectedNotification.type),
                      width: 56,
                      height: 56,
                    }}
                  >
                    {getNotificationIcon(selectedNotification.type)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                      {selectedNotification.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={getNotificationTypeLabel(selectedNotification.type)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getNotificationColor(selectedNotification.type), 0.15),
                          color: getNotificationColor(selectedNotification.type),
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<TimeIcon sx={{ fontSize: 14 }} />}
                        label={format(parseISO(selectedNotification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Stack>
                  </Box>
                </Stack>
                <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>
            
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: '1rem' }}>
                {selectedNotification.message}
              </Typography>

              {/* Additional Data Section â€” Only show human-readable fields */}
              {selectedNotification.data && (() => {
                // Safely parse data if it's a string
                let parsedData = selectedNotification.data;
                if (typeof parsedData === 'string') {
                  try {
                    parsedData = JSON.parse(parsedData);
                  } catch (e) {
                    parsedData = null;
                  }
                }

                // Filter out raw IDs and technical fields â€” only show human-readable info  
                const hiddenKeys = new Set([
                  'tradeId', 'shiftId', 'requestId', 'userId', 'fromUserId', 
                  'toUserId', 'branchId', 'approvedBy', 'id', 'periodId',
                  'shortNotice', 'minimumAdvanceDays', 'employeeId', 'managerId',
                  'notificationId', 'createdAt', 'updatedAt'
                ]);

                // Helper: detect and format ISO date strings
                const formatValue = (key: string, val: any): string => {
                  const strVal = String(val);
                  // Detect ISO date strings like "2026-03-10T00:00:00.000Z"
                  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
                    try {
                      return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    } catch { return strVal; }
                  }
                  // Format advanceDays as "X days"
                  if (key === 'advanceDays' && typeof val === 'number') {
                    return `${val} day${val !== 1 ? 's' : ''}`;
                  }
                  return strVal;
                };
                
                // Map technical keys to friendly labels
                const labelMap: Record<string, string> = {
                  shiftDate: "Shift Date",
                  requesterName: "Requested By",
                  takerName: "Accepted By",
                  employeeName: "Employee",
                  tradeType: "Trade Type",
                  status: "Status",
                  startDate: "Start Date",
                  endDate: "End Date",
                  type: "Type",
                  advanceDays: "Advance Notice",
                  reason: "Reason",
                  netPay: "Net Pay",
                  position: "Position",
                };

                // Status display with color coding
                const getStatusDisplay = (val: string) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    approved: { label: 'Approved', color: theme.palette.success.main },
                    rejected: { label: 'Rejected', color: theme.palette.error.main },
                    pending: { label: 'Pending', color: theme.palette.warning.main },
                    pending_approval: { label: 'Awaiting Approval', color: theme.palette.warning.main },
                    taken: { label: 'Accepted', color: theme.palette.info.main },
                    open: { label: 'Open', color: theme.palette.info.main },
                    direct: { label: 'Direct Trade', color: theme.palette.secondary.main },
                    cancelled: { label: 'Cancelled', color: theme.palette.text.disabled },
                  };
                  return statusMap[val] || { label: String(val), color: theme.palette.text.primary };
                };

                if (!parsedData) return null;
                const entries = Object.entries(parsedData).filter(
                  ([key]) => !hiddenKeys.has(key)
                );
                if (entries.length === 0) return null;
                
                return (
                  <Box sx={{ mt: 3 }}>
                    <Stack spacing={1.5}>
                      {entries.map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) return null;
                        
                        const displayLabel = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                        const isStatus = key === 'status' || key === 'tradeType';

                        return (
                          <Stack key={key} direction="row" justifyContent="space-between" alignItems="center"
                            sx={{
                              py: 1,
                              px: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                              {displayLabel}
                            </Typography>
                            {isStatus ? (
                              <Chip 
                                label={getStatusDisplay(String(value)).label}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  bgcolor: alpha(getStatusDisplay(String(value)).color, 0.12),
                                  color: getStatusDisplay(String(value)).color,
                                }}
                              />
                            ) : (
                              <Typography variant="body2" fontWeight={600} sx={{ textTransform: key === 'type' ? 'capitalize' : 'none' }}>
                                {formatValue(key, value)}
                              </Typography>
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })()}

              {/* Status Section */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {selectedNotification.isRead ? (
                    <>
                      <MarkReadIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        Read
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ActiveIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" color="primary.main" fontWeight={500}>
                        Unread
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
              {/* Smart navigation button based on notification type */}
              {(() => {
                let data = selectedNotification.data;
                if (typeof data === 'string') {
                  try { data = JSON.parse(data); } catch (e) { data = null; }
                }

                const isTrade = selectedNotification.type.includes('trade');
                const isTimeOff = selectedNotification.type.includes('time_off');
                const isPayroll = selectedNotification.type === 'payroll' || selectedNotification.type === 'payment';
                const hasAction = isTrade || isTimeOff || isPayroll;

                if (!hasAction) return null;

                return (
                  <Button
                    variant="contained"
                    startIcon={isTrade || isTimeOff ? <ScheduleIcon /> : <MoneyIcon />}
                    onClick={() => {
                      setDetailDialogOpen(false);
                      if (!selectedNotification.isRead) markAsRead.mutate(selectedNotification.id);
                      setLocation(isPayroll ? '/pay-summary' : '/schedule');
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {isTrade ? 'Go to Schedule' : isTimeOff ? 'Go to Schedule' : 'View Pay Summary'}
                  </Button>
                );
              })()}
              
              <Box sx={{ flex: 1 }} />

              {!selectedNotification.isRead && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    markAsRead.mutate(selectedNotification.id);
                    setDetailDialogOpen(false);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Mark Read
                </Button>
              )}
              <Button 
                variant="text"
                color="inherit"
                onClick={() => setDetailDialogOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setNotificationToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Delete Notification?
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {notificationToDelete && (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Are you sure you want to delete this notification? This action cannot be undone.
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.03),
                  borderColor: alpha(theme.palette.error.main, 0.2),
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {notificationToDelete.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {notificationToDelete.message}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setNotificationToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteNotification.isPending}
            startIcon={<DeleteIcon />}
          >
            {deleteNotification.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
