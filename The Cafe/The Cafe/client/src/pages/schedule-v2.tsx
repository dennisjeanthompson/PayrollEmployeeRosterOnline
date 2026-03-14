/**
 * Schedule V2 — Clean, separated UI architecture
 * 
 * Key principles:
 * 1. Schedule grid shows ONLY confirmed shifts (no pending items cluttering)
 * 2. Requests/trades live in a separate panel (slide-out drawer)
 * 3. Simple toolbar with week navigation — no 12-button chaos
 * 4. Weekly grid for managers, personal list for employees
 * 5. Mobile-first: auto-switches to card layout
 * 
 * Replaces the 5,000+ line monolith with ~500 lines of clean, composable code.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Chip, Badge, Drawer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack, Tooltip, Avatar,
  CircularProgress, useTheme, useMediaQuery, Divider, ButtonGroup,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Add as AddIcon,
  Inbox as InboxIcon,
  Today as TodayIcon,
  CalendarViewDay as WeekIcon,
  ViewAgenda as DayIcon,
  BeachAccess as TimeOffIcon,
  SwapHoriz as SwapIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getCurrentUser, isManager as checkIsManager } from '@/lib/auth';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, setHours, setMinutes, differenceInHours, isValid } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { getRoleColor, getUniqueRoleColors } from '@/lib/schedule-theme';
import { useRealtime } from '@/hooks/use-realtime';
import { toast } from 'react-toastify';

import WeeklyGrid from '@/components/schedule-v2/WeeklyGrid';
import DayView, { MyDayView } from '@/components/schedule-v2/DayView';
import RequestsPanel from '@/components/schedule-v2/RequestsPanel';
import type { Shift, Employee, TimeOffRequest, ShiftTrade, Holiday } from '@/components/schedule-v2/types';

type ViewMode = 'week' | 'day';

export default function ScheduleV2() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isManager = checkIsManager();

  // Navigation state
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'day' : 'week');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Published/Draft toggle (managers)
  const [isPublished, setIsPublished] = useState(true);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form data
  const [newShift, setNewShift] = useState({ employeeId: '', startTime: null as Date | null, endTime: null as Date | null, notes: '' });
  const [editForm, setEditForm] = useState({ startTime: null as Date | null, endTime: null as Date | null, notes: '' });
  const [timeOffForm, setTimeOffForm] = useState({ type: 'vacation', startDate: new Date() as Date | null, endDate: new Date() as Date | null, reason: '' });
  const [tradeForm, setTradeForm] = useState({ shiftId: '', targetUserId: '', reason: '' });

  // Real-time updates — refresh calendar data on any schedule/request event
  useRealtime({
    enabled: true,
    queryKeys: ['shifts', 'time-off-requests', 'shift-trades', 'employees', 'notifications'],
    onEvent: (event: string, data: any) => {
      // Refresh all schedule-related data on any relevant event
      if (
        event.startsWith('time-off:') || event.startsWith('trade:') || event.startsWith('shift:') ||
        event === 'notification:created' || event === 'notification'
      ) {
        queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
        queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
        queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
      // Show inline toast for real-time status changes pushed from server
      if ((event === 'notification' || event === 'notification:created') && data) {
        const notif = data?.notification || data;
        const type = notif?.type || '';
        if (type === 'time_off_approved') {
          toast.success(notif.message || 'Your time-off request was approved!');
        } else if (type === 'time_off_rejected') {
          toast.error(notif.message || 'Your time-off request was rejected.');
        } else if (type === 'shift_trade') {
          try {
            const parsed = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
            if (parsed?.status === 'approved') {
              toast.success(notif.message || 'Shift trade approved!');
            } else if (parsed?.status === 'rejected') {
              toast.error(notif.message || 'Shift trade was rejected.');
            }
          } catch { /* ignore parse errors */ }
        } else if (type === 'trade_request') {
          toast.info(notif.message || 'New shift trade request received');
        } else if (type === 'time_off') {
          toast.info(notif.message || 'New time-off request received');
        }
      }
    },
  });

  // ─── DATA QUERIES ───────────────────────────────────────────────
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{ shifts: Shift[] }>({
    queryKey: ['shifts', 'branch'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shifts/branch');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/employees');
      return res.json();
    },
    staleTime: 15000,
  });

  const { data: holidaysData } = useQuery<{ holidays: Holiday[] }>({
    queryKey: ['/api/holidays', { year: new Date().getFullYear() }],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/holidays?year=${new Date().getFullYear()}`);
      return res.json();
    },
    staleTime: 60000,
  });

  const { data: timeOffData } = useQuery<{ requests: TimeOffRequest[] }>({
    queryKey: ['time-off-requests'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/time-off-requests');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: tradesData } = useQuery<{ trades: ShiftTrade[] }>({
    queryKey: ['shift-trades'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shift-trades');
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Normalize data
  const shifts = useMemo(() => Array.isArray(shiftsData) ? shiftsData : (shiftsData?.shifts || []), [shiftsData]);
  const employees = useMemo(() => {
    const raw = Array.isArray(employeesData) ? employeesData : (employeesData?.employees || []);
    return raw.filter((e: Employee) => e.isActive !== false);
  }, [employeesData]);
  const holidays = holidaysData?.holidays || [];
  const timeOffRequests = timeOffData?.requests || [];
  const shiftTrades = tradesData?.trades || [];

  // Pending counts for badge
  const pendingCount = useMemo(() => {
    const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending').length;
    const pendingTrades = shiftTrades.filter(t => t.status === 'pending' || t.status === 'accepted').length;
    return pendingTimeOff + pendingTrades;
  }, [timeOffRequests, shiftTrades]);

  // Weekly hours summary
  const weeklyTotalHours = useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return shifts
      .filter(s => {
        const d = new Date(s.startTime);
        return d >= weekStart && d <= weekEnd && d.getDay() !== 0;
      })
      .reduce((sum, s) => sum + differenceInHours(new Date(s.endTime), new Date(s.startTime)), 0);
  }, [shifts, weekStart]);

  // ─── MUTATIONS ──────────────────────────────────────────────────
  const createShiftMutation = useMutation({
    mutationFn: async (payload: { userId: string; startTime: string; endTime: string; branchId: string; position: string; notes?: string }) => {
      const res = await apiRequest('POST', '/api/shifts', payload);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to create shift'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Shift created');
      setCreateModalOpen(false);
      setNewShift({ employeeId: '', startTime: null, endTime: null, notes: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (payload: { id: string; startTime?: string; endTime?: string; notes?: string }) => {
      const { id, ...data } = payload;
      const res = await apiRequest('PUT', `/api/shifts/${id}`, data);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update shift'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Shift updated');
      setEditModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/shifts/${id}`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to delete shift'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Shift deleted');
      setDeleteConfirmOpen(false);
      setSelectedShift(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTimeOffMutation = useMutation({
    mutationFn: async (data: typeof timeOffForm) => {
      const payload = {
        type: data.type,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : '',
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : '',
        reason: data.reason,
      };
      const res = await apiRequest('POST', '/api/time-off-requests', payload);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to submit'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Time-off request submitted');
      setTimeOffModalOpen(false);
      setTimeOffForm({ type: 'vacation', startDate: new Date(), endDate: new Date(), reason: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveTimeOffMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // Server has separate /approve and /reject endpoints
      const endpoint = status === 'approved'
        ? `/api/time-off-requests/${id}/approve`
        : `/api/time-off-requests/${id}/reject`;
      const res = await apiRequest('PUT', endpoint, { status });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (variables.status === 'approved') {
        toast.success('Time-off approved — employee notified');
      } else {
        toast.info('Time-off rejected — employee notified');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: typeof tradeForm) => {
      const res = await apiRequest('POST', '/api/shift-trades', data);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      toast.success('Trade request submitted');
      setTradeModalOpen(false);
      setTradeForm({ shiftId: '', targetUserId: '', reason: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const respondTradeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/shift-trades/${id}`, { status });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      if (variables.status === 'accepted') {
        toast.success('Trade accepted — awaiting manager approval');
      } else {
        toast.info('Trade declined');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveTradeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/shift-trades/${id}/approve`, { status });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (variables.status === 'approved') {
        toast.success('Shift trade approved — both employees notified');
      } else {
        toast.info('Shift trade rejected — requester notified');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTradeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/shift-trades/${id}`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      toast.success('Trade cancelled');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const takeOpenTradeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/shift-trades/${id}/take`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Shift taken! Pending manager approval.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ─── HANDLERS ───────────────────────────────────────────────────
  const handleCreateShift = useCallback((employeeId: string, date: Date) => {
    const start = setMinutes(setHours(date, 8), 0);
    const end = setMinutes(setHours(date, 16), 0);
    setNewShift({
      employeeId,
      startTime: start,
      endTime: end,
      notes: '',
    });
    setCreateModalOpen(true);
  }, []);

  const handleEditShift = useCallback((shift: Shift) => {
    if (!isManager) return;
    setSelectedShift(shift);
    setEditForm({
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      notes: shift.notes || '',
    });
    setEditModalOpen(true);
  }, [isManager]);

  const handleWeekNav = useCallback((direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      const newWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      setWeekStart(newWeekStart);
      setSelectedDay(new Date());
    } else if (direction === 'prev') {
      setWeekStart(prev => {
        const newStart = subWeeks(prev, 1);
        // Keep day view in sync — move selected day to the same weekday in the new week
        setSelectedDay(current => {
          const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1; // Mon=0
          return addDays(newStart, dayOfWeek);
        });
        return newStart;
      });
    } else {
      setWeekStart(prev => {
        const newStart = addWeeks(prev, 1);
        setSelectedDay(current => {
          const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1;
          return addDays(newStart, dayOfWeek);
        });
        return newStart;
      });
    }
  }, []);

  // ─── LOADING ────────────────────────────────────────────────────
  if (shiftsLoading || employeesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#1C1410' : '#FBF8F4' }}>
      {/* ─── TOOLBAR ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          px: { xs: 2, sm: 3 }, py: 1.5,
          display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap',
          borderBottom: '1px solid',
          borderColor: isDark ? '#3D3228' : '#E8E0D4',
          bgcolor: isDark ? '#2A2018' : '#FFFFFF',
        }}
      >
        {/* Title */}
        <Typography variant="h5" fontWeight={800} sx={{ mr: 'auto', color: isDark ? '#F5EDE4' : '#3C2415', fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
          Schedule
        </Typography>

        {/* Pending requests badge — opens drawer */}
        <Tooltip title={`${pendingCount} pending requests`}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ position: 'relative' }}>
            <Badge badgeContent={pendingCount} color="warning" max={99}>
              <InboxIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Published/Draft for managers */}
        {isManager && (
          <Chip
            icon={isPublished ? <CheckIcon /> : <EditIcon />}
            label={isPublished ? 'Published' : 'Draft'}
            onClick={() => setIsPublished(!isPublished)}
            sx={{
              fontWeight: 700, cursor: 'pointer',
              bgcolor: isPublished ? (isDark ? '#064E3B' : '#F0FDF4') : (isDark ? '#451A03' : '#FFFBEB'),
              color: isPublished ? (isDark ? '#6EE7B7' : '#166534') : (isDark ? '#FBBF24' : '#92400E'),
              border: '1px solid',
              borderColor: isPublished ? (isDark ? '#065F46' : '#BBF7D0') : (isDark ? '#78350F' : '#FDE68A'),
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        )}
      </Paper>

      {/* ─── NAVIGATION BAR ──────────────────────────────────────── */}
      <Box sx={{
        px: { xs: 2, sm: 3 }, py: 1,
        display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
        borderBottom: '1px solid',
        borderColor: isDark ? '#3D3228' : '#E8E0D4',
        bgcolor: isDark ? '#2A2018' : '#FFFFFF',
      }}>
        {/* Week navigation */}
        <IconButton size="small" onClick={() => handleWeekNav('prev')}><PrevIcon /></IconButton>
        <Button size="small" onClick={() => handleWeekNav('today')} variant="text" sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0 }}>
          Today
        </Button>
        <IconButton size="small" onClick={() => handleWeekNav('next')}><NextIcon /></IconButton>

        <Typography variant="body2" fontWeight={700} sx={{ mx: 1, color: isDark ? '#F5EDE4' : '#3C2415' }}>
          {format(weekStart, 'MMM d')} – {format(weekEndDate, 'MMM d, yyyy')}
        </Typography>

        <Chip label={`${weeklyTotalHours}h total`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }} />

        <Box sx={{ flex: 1 }} />

        {/* View toggle */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={viewMode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('week')}
            startIcon={<WeekIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isMobile ? '' : 'Week'}
          </Button>
          <Button
            variant={viewMode === 'day' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('day')}
            startIcon={<DayIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isMobile ? '' : 'Day'}
          </Button>
        </ButtonGroup>

        {/* Quick actions */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <Tooltip title="Request Time Off">
          <Button
            size="small" variant="outlined" startIcon={<TimeOffIcon />}
            onClick={() => setTimeOffModalOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
          >
            Time Off
          </Button>
        </Tooltip>

        <Tooltip title="Trade a Shift">
          <Button
            size="small" variant="outlined" startIcon={<SwapIcon />}
            onClick={() => {
              const myFutureShifts = shifts.filter(s => s.userId === currentUser?.id && new Date(s.startTime) > new Date());
              if (myFutureShifts.length === 0) { toast.info('No future shifts to trade'); return; }
              setTradeModalOpen(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
          >
            Trade
          </Button>
        </Tooltip>

        {isManager && (
          <Tooltip title="Create Shift">
            <Button
              size="small" variant="contained" startIcon={<AddIcon />}
              onClick={() => { setNewShift({ employeeId: '', startTime: null, endTime: null, notes: '' }); setCreateModalOpen(true); }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {isMobile ? '' : 'Shift'}
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* ─── ROLE COLOR LEGEND ───────────────────────────────────── */}
      {isManager && (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 0.75, display: 'flex', gap: 0.5, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: isDark ? '#3D3228' : '#E8E0D4' }}>
          {getUniqueRoleColors(employees).map(rc => (
            <Chip
              key={rc.label} size="small" label={rc.label}
              sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
            />
          ))}
        </Box>
      )}

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 3 } }}>
        {viewMode === 'week' ? (
          isManager ? (
            <WeeklyGrid
              employees={employees}
              shifts={shifts}
              weekStart={weekStart}
              holidays={holidays}
              isManager={isManager && !isPublished}
              timeOffRequests={timeOffRequests}
              shiftTrades={shiftTrades}
              currentUserId={currentUser?.id || ''}
              onCreateShift={handleCreateShift}
              onEditShift={handleEditShift}
              onOpenRequests={() => setDrawerOpen(true)}
            />
          ) : (
            /* Employee week view: show their shifts only, as vertical cards */
            <WeeklyGrid
              employees={employees.filter(e => e.id === currentUser?.id)}
              shifts={shifts.filter(s => s.userId === currentUser?.id)}
              weekStart={weekStart}
              holidays={holidays}
              isManager={false}
              timeOffRequests={timeOffRequests.filter(r => r.userId === currentUser?.id)}
              shiftTrades={shiftTrades.filter(t => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id)}
              currentUserId={currentUser?.id || ''}
              onCreateShift={() => {}}
              onEditShift={() => {}}
              onOpenRequests={() => setDrawerOpen(true)}
            />
          )
        ) : (
          isManager ? (
            <DayView
              employees={employees}
              shifts={shifts}
              date={selectedDay}
              holidays={holidays}
              isManager={isManager && !isPublished}
              currentUserId={currentUser?.id || ''}
              timeOffRequests={timeOffRequests}
              shiftTrades={shiftTrades}
              onDateChange={setSelectedDay}
              onCreateShift={handleCreateShift}
              onEditShift={handleEditShift}
            />
          ) : (
            <MyDayView
              shifts={shifts}
              date={selectedDay}
              currentUserId={currentUser?.id || ''}
              timeOffRequests={timeOffRequests.filter(r => r.userId === currentUser?.id)}
              shiftTrades={shiftTrades.filter(t => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id)}
              onDateChange={setSelectedDay}
            />
          )
        )}
      </Box>

      {/* ─── MOBILE FAB: Quick Actions ───────────────────────────── */}
      {isMobile && (
        <Box sx={{
          position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 1200,
        }}>
          <Tooltip title="Time Off" placement="left">
            <IconButton
              onClick={() => setTimeOffModalOpen(true)}
              sx={{ bgcolor: '#F59E0B', color: 'white', boxShadow: 3, '&:hover': { bgcolor: '#D97706' } }}
            >
              <TimeOffIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Trade Shift" placement="left">
            <IconButton
              onClick={() => {
                const myFuture = shifts.filter(s => s.userId === currentUser?.id && new Date(s.startTime) > new Date());
                if (myFuture.length === 0) { toast.info('No future shifts to trade'); return; }
                setTradeModalOpen(true);
              }}
              sx={{ bgcolor: '#8B5CF6', color: 'white', boxShadow: 3, '&:hover': { bgcolor: '#7C3AED' } }}
            >
              <SwapIcon />
            </IconButton>
          </Tooltip>
          {isManager && (
            <Tooltip title="Create Shift" placement="left">
              <IconButton
                onClick={() => { setNewShift({ employeeId: '', startTime: null, endTime: null, notes: '' }); setCreateModalOpen(true); }}
                sx={{ bgcolor: 'primary.main', color: 'white', boxShadow: 4, width: 56, height: 56, '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* ─── REQUESTS DRAWER ─────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            bgcolor: isDark ? '#1C1410' : '#FBF8F4',
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#F5EDE4' : '#3C2415' }}>
            Requests & Trades
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <RequestsPanel
          timeOffRequests={timeOffRequests}
          shiftTrades={shiftTrades}
          employees={employees}
          isManager={isManager}
          currentUserId={currentUser?.id || ''}
          onApproveTimeOff={(id) => approveTimeOffMutation.mutate({ id, status: 'approved' })}
          onRejectTimeOff={(id) => approveTimeOffMutation.mutate({ id, status: 'rejected' })}
          onApproveTrade={(id) => approveTradeMutation.mutate({ id, status: 'approved' })}
          onRejectTrade={(id) => approveTradeMutation.mutate({ id, status: 'rejected' })}
          onAcceptTrade={(id) => respondTradeMutation.mutate({ id, status: 'accepted' })}
          onDeclineTrade={(id) => respondTradeMutation.mutate({ id, status: 'rejected' })}
          onCancelTrade={(id) => deleteTradeMutation.mutate(id)}
          onTakeOpenTrade={(id) => takeOpenTradeMutation.mutate(id)}
        />
      </Drawer>

      {/* ─── CREATE SHIFT MODAL ──────────────────────────────────── */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Create Shift</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select value={newShift.employeeId} label="Employee" onChange={e => setNewShift(p => ({ ...p, employeeId: e.target.value }))}>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} {emp.position && `· ${emp.position}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={newShift.startTime}
                onChange={(val) => setNewShift(p => ({ ...p, startTime: val }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="End Time"
                value={newShift.endTime}
                onChange={(val) => setNewShift(p => ({ ...p, endTime: val }))}
                slotProps={{ textField: { fullWidth: true } }}
                minDateTime={newShift.startTime || undefined}
              />
            </LocalizationProvider>
            <TextField label="Notes" multiline rows={2} value={newShift.notes} onChange={e => setNewShift(p => ({ ...p, notes: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!newShift.employeeId || !newShift.startTime || !newShift.endTime || createShiftMutation.isPending}
            onClick={() => {
              if (!newShift.startTime || !newShift.endTime || !isValid(newShift.startTime) || !isValid(newShift.endTime)) { toast.error('Please select valid start and end times'); return; }
              if (newShift.startTime.getDay() === 0) { toast.warning('Sunday is a Rest Day'); return; }
              const emp = employees.find(e => e.id === newShift.employeeId);
              createShiftMutation.mutate({
                userId: newShift.employeeId,
                branchId: emp?.branchId || '',
                position: emp?.position || 'Staff',
                startTime: newShift.startTime.toISOString(),
                endTime: newShift.endTime.toISOString(),
                notes: newShift.notes,
              });
            }}
          >
            {createShiftMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── EDIT SHIFT MODAL ────────────────────────────────────── */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Edit Shift</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: isDark ? '#342A1E' : '#F5F0E8', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: getRoleColor(selectedShift.position).bg, color: 'white' }}>
                  {selectedShift.user?.firstName?.[0] || employees.find(e => e.id === selectedShift.userId)?.firstName?.[0] || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {selectedShift.user ? `${selectedShift.user.firstName} ${selectedShift.user.lastName}` : (() => { const e = employees.find(x => x.id === selectedShift.userId); return e ? `${e.firstName} ${e.lastName}` : 'Unknown'; })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{selectedShift.position || 'Staff'}</Typography>
                </Box>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={editForm.startTime}
                  onChange={(val) => setEditForm(p => ({ ...p, startTime: val }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DateTimePicker
                  label="End Time"
                  value={editForm.endTime}
                  onChange={(val) => setEditForm(p => ({ ...p, endTime: val }))}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDateTime={editForm.startTime || undefined}
                />
              </LocalizationProvider>
              <TextField
                label="Notes" multiline rows={2}
                value={editForm.notes}
                onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => { setEditModalOpen(false); setDeleteConfirmOpen(true); }} startIcon={<DeleteIcon />}>Delete</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={updateShiftMutation.isPending || !editForm.startTime || !editForm.endTime}
            onClick={() => {
              if (selectedShift && editForm.startTime && editForm.endTime && isValid(editForm.startTime) && isValid(editForm.endTime)) {
                updateShiftMutation.mutate({ id: selectedShift.id, startTime: editForm.startTime.toISOString(), endTime: editForm.endTime.toISOString(), notes: editForm.notes });
              }
            }}
          >
            {updateShiftMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── DELETE CONFIRM ──────────────────────────────────────── */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Shift?</DialogTitle>
        <DialogContent><Typography>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteShiftMutation.isPending}
            onClick={() => selectedShift && deleteShiftMutation.mutate(selectedShift.id)}>
            {deleteShiftMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── TIME-OFF MODAL ──────────────────────────────────────── */}
      <Dialog open={timeOffModalOpen} onClose={() => setTimeOffModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Request Time Off</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={timeOffForm.type} label="Type" onChange={e => setTimeOffForm(p => ({ ...p, type: e.target.value }))}>
                <MenuItem value="vacation">Vacation Leave</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="emergency">Emergency Leave</MenuItem>
                <MenuItem value="personal">Personal Leave</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={timeOffForm.startDate}
                onChange={(val) => setTimeOffForm(p => ({
                  ...p,
                  startDate: val,
                  endDate: (val && p.endDate && p.endDate < val) ? val : p.endDate,
                }))}
                slotProps={{ textField: { fullWidth: true } }}
                disablePast
              />
              <DatePicker
                label="End Date"
                value={timeOffForm.endDate}
                onChange={(val) => setTimeOffForm(p => ({ ...p, endDate: val }))}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={timeOffForm.startDate || undefined}
                disablePast
              />
            </LocalizationProvider>
            <TextField label="Reason" multiline rows={3} required value={timeOffForm.reason}
              onChange={e => setTimeOffForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Briefly explain your request..." fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeOffModalOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!timeOffForm.reason || !timeOffForm.startDate || !timeOffForm.endDate || createTimeOffMutation.isPending}
            onClick={() => createTimeOffMutation.mutate(timeOffForm)}>
            {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── SHIFT TRADE MODAL ───────────────────────────────────── */}
      <Dialog open={tradeModalOpen} onClose={() => setTradeModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Request Shift Trade</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Your Shift</InputLabel>
              <Select value={tradeForm.shiftId} label="Your Shift" onChange={e => setTradeForm(p => ({ ...p, shiftId: e.target.value }))}>
                {shifts
                  .filter(s => s.userId === currentUser?.id && new Date(s.startTime) > new Date())
                  .map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {format(new Date(s.startTime), 'MMM d, h:mm a')} – {format(new Date(s.endTime), 'h:mm a')} {s.position && `(${s.position})`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trade With</InputLabel>
              <Select value={tradeForm.targetUserId} label="Trade With" onChange={e => setTradeForm(p => ({ ...p, targetUserId: e.target.value }))}>
                <MenuItem value=""><em>Open to anyone</em></MenuItem>
                {employees.filter(e => e.id !== currentUser?.id).map(e => (
                  <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName} {e.position && `· ${e.position}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Reason" multiline rows={3} required value={tradeForm.reason}
              onChange={e => setTradeForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Why do you need to trade?" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTradeModalOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!tradeForm.shiftId || !tradeForm.reason.trim() || createTradeMutation.isPending}
            onClick={() => createTradeMutation.mutate(tradeForm)}>
            {createTradeMutation.isPending ? 'Submitting...' : 'Request Trade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
