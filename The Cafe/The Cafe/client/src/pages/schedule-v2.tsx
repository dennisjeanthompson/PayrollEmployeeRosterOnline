/**
 * Schedule V2 â€” Clean, separated UI architecture
 * 
 * Key principles:
 * 1. Schedule grid shows ONLY confirmed shifts (no pending items cluttering)
 * 2. Requests/trades live in a separate panel (slide-out drawer)
 * 3. Simple toolbar with week navigation â€” no 12-button chaos
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
  InputAdornment, Menu
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
  NoteAdd as NoteAddIcon,
  ContentCopy as ContentCopyIcon,
  ChecklistRtl as ChecklistIcon,
  ClearAll as ClearAllIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getCurrentUser, isManager as checkIsManager } from '@/lib/auth';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, setHours, setMinutes, differenceInHours, isValid, areIntervalsOverlapping, eachDayOfInterval, isSameDay } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { getRoleColor, getUniqueRoleColors } from '@/lib/schedule-theme';
import { useRealtime } from '@/hooks/use-realtime';
import { toast } from 'react-toastify';

import WeeklyGrid from '@/components/schedule-v2/WeeklyGrid';
import DayView, { MyDayView } from '@/components/schedule-v2/DayView';
import RequestsPanel from '@/components/schedule-v2/RequestsPanel';
import ExceptionLogDrawer from '@/components/schedule-v2/ExceptionLogDrawer';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(isManager);

  // Edit Mode has been removed; managers are always in edit mode natively.

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedTimeOffId, setSelectedTimeOffId] = useState<string | null>(null);

  // Exception Log Dialog State
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [editAdjId, setEditAdjId] = useState<string | null>(null);
  const [adjEmployeeId, setAdjEmployeeId] = useState("");
  const [adjDate, setAdjDate] = useState<Date | null>(new Date());
  const [adjEndDate, setAdjEndDate] = useState<Date | null>(null);
  const [adjIsRange, setAdjIsRange] = useState(false);
  const [adjType, setAdjType] = useState("late");
  const [adjValue, setAdjValue] = useState("");
  const [adjRemarks, setAdjRemarks] = useState("");

  const adjustmentTypeOptions = [
    { value: "overtime", label: "Regular OT (125%)", color: "#10b981" },
    { value: "rest_day_ot", label: "Rest Day OT (169%)", color: "#3b82f6" },
    { value: "special_holiday_ot", label: "Special Holiday OT (169%)", color: "#f59e0b" },
    { value: "regular_holiday_ot", label: "Regular Holiday OT (260%)", color: "#ef4444" },
    { value: "night_diff", label: "Night Differential (+10%)", color: "#8b5cf6" },
    { value: "late", label: "Tardiness (minutes)", color: "#f97316" },
    { value: "undertime", label: "Undertime (minutes)", color: "#ec4899" },
    { value: "absent", label: "Absent (days)", color: "#dc2626" },
  ];

  // Form data
  const [newShift, setNewShift] = useState({ employeeId: '', startTime: null as Date | null, endTime: null as Date | null, notes: '' });
  const [editForm, setEditForm] = useState({ startTime: null as Date | null, endTime: null as Date | null, notes: '' });
  const [timeOffForm, setTimeOffForm] = useState({ type: 'vacation', startDate: new Date() as Date | null, endDate: new Date() as Date | null, reason: '' });
  const [tradeForm, setTradeForm] = useState({ shiftId: '', targetUserId: '', reason: '' });
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [manageLogGroup, setManageLogGroup] = useState<any[] | null>(null);

  // Exception Log Detail Drawer state
  const [exceptionLogDrawerOpen, setExceptionLogDrawerOpen] = useState(false);
  const [selectedExceptionLog, setSelectedExceptionLog] = useState<any>(null);

  const handleExceptionLogClick = useCallback((log: any) => {
    setSelectedExceptionLog(log);
    setExceptionLogDrawerOpen(true);
  }, []);

  // Bulk Edit / Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());

  // Toggle Selection handlers
  const toggleShiftSelection = useCallback((id: string) => {
    setSelectedShifts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleLogSelection = useCallback((id: string) => {
    setSelectedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Real-time updates â€” refresh calendar data on any schedule/request event
  useRealtime({
    enabled: true,
    queryKeys: ['shifts', 'time-off-requests', 'shift-trades', 'employees', 'notifications'],
    onEvent: (event: string, data: any) => {
      // Refresh all schedule-related data on any relevant event
      if (
        event.startsWith('time-off:') || event.startsWith('trade:') || event.startsWith('shift:') ||
        event === 'notification:created' || event === 'notification'
      ) {
        // Suppress unhandled promise rejections if the background queries fail (e.g. session expired, network drop)
        queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ['time-off-requests'] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ['shift-trades'] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] }).catch(console.error);
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

  // â”€â”€â”€ DATA QUERIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{ shifts: Shift[] }>({
    queryKey: ['shifts', 'branch'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shifts/branch');
      return res.json();
    },
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
  });

  const { data: tradesData } = useQuery<{ trades: ShiftTrade[] }>({
    queryKey: ['shift-trades'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shift-trades');
      return res.json();
    },
  });

  const { data: adjustmentLogsData } = useQuery<{ logs: any[] }>({
    queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"],
    queryFn: async () => {
      const endpoint = isManager ? "/api/adjustment-logs/branch" : "/api/adjustment-logs/mine";
      const res = await apiRequest("GET", endpoint);
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  // Normalize data
  const shifts = useMemo(() => Array.isArray(shiftsData) ? shiftsData : (shiftsData?.shifts || []), [shiftsData]);
  const employees = useMemo(() => {
    const raw = Array.isArray(employeesData) ? employeesData : (employeesData?.employees || []);
    return raw.filter((e: Employee) => e.isActive !== false && e.role !== 'admin');
  }, [employeesData]);
  const holidays = holidaysData?.holidays || [];
  const timeOffRequests = timeOffData?.requests || [];
  const shiftTrades = tradesData?.trades || [];
  const adjustmentLogs = adjustmentLogsData?.logs || [];

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

  // â”€â”€â”€ MUTATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<Response>[] = [];
      selectedShifts.forEach(id => {
        promises.push(apiRequest('DELETE', `/api/shifts/${id}`));
      });
      selectedLogs.forEach(id => {
        promises.push(apiRequest('DELETE', `/api/adjustment-logs/${id}`));
      });
      
      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} items`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success(`Deleted ${selectedShifts.size + selectedLogs.size} items successfully`);
      setSelectedShifts(new Set());
      setSelectedLogs(new Set());
      setIsSelectionMode(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const copyWeekMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.branchId) throw new Error("Branch ID missing");
      const lastWeekStart = subWeeks(weekStart, 1);
      const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
      
      const lastWeekShifts = shifts.filter(s => {
        const d = new Date(s.startTime);
        return d >= lastWeekStart && d <= lastWeekEnd && s.user?.isActive !== false;
      });

      const thisWeekStart = weekStart;
      const thisWeekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const currentWeekShifts = shifts.filter(s => {
        const d = new Date(s.startTime);
        return d >= thisWeekStart && d <= thisWeekEnd;
      });

      const shiftsToCopy = lastWeekShifts.filter(s => {
        const newStart = addWeeks(new Date(s.startTime), 1);
        const newEnd = addWeeks(new Date(s.endTime), 1);
        const isOverlapping = currentWeekShifts.some(cws => 
          cws.userId === s.userId && 
          areIntervalsOverlapping(
            { start: newStart, end: newEnd },
            { start: new Date(cws.startTime), end: new Date(cws.endTime) }
          )
        );
        return !isOverlapping;
      });

      if (shiftsToCopy.length === 0) {
        if (lastWeekShifts.length > 0) {
          throw new Error("All shifts from the previous week already exist or overlap with the current week.");
        }
        throw new Error("No shifts found in the previous week to copy.");
      }

      const newShiftsPromises = shiftsToCopy.map(s => {
        return apiRequest('POST', '/api/shifts', {
          userId: s.userId,
          branchId: s.branchId,
          position: s.position,
          startTime: addWeeks(new Date(s.startTime), 1).toISOString(),
          endTime: addWeeks(new Date(s.endTime), 1).toISOString(),
          notes: s.notes
        });
      });

      const chunkSize = 5;
      let failed = 0;
      for (let i = 0; i < newShiftsPromises.length; i += chunkSize) {
        const chunk = newShiftsPromises.slice(i, i + chunkSize);
        const results = await Promise.all(chunk);
        failed += results.filter(r => !r.ok).length;
      }

      const skippedCount = lastWeekShifts.length - shiftsToCopy.length;
      if (failed > 0) {
        throw new Error(`Copied ${shiftsToCopy.length - failed} shifts. Failed to copy ${failed} shifts. Skipped ${skippedCount} overlaps.`);
      }
      return { copiedCount: shiftsToCopy.length, skippedCount };
    },
    onSuccess: ({ copiedCount, skippedCount }) => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      let msg = `Successfully copied ${copiedCount} shifts.`;
      if (skippedCount > 0) msg += ` Skipped ${skippedCount} overlapping shifts.`;
      toast.success(msg);
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

  const deleteTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/time-off-requests/${id}`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to delete'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Time-off request deleted');
      setSelectedTimeOffId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveTimeOffMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason, useSil }: { id: string; status: string; rejectionReason?: string; useSil?: boolean }) => {
      // Server has separate /approve and /reject endpoints
      const endpoint = status === 'approved'
        ? `/api/time-off-requests/${id}/approve`
        : `/api/time-off-requests/${id}/reject`;
      const body = status === 'rejected' ? { status, rejectionReason } : { status, useSil };
      const res = await apiRequest('PUT', endpoint, body);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (variables.status === 'approved') {
        toast.success('Time-off approved â€” employee notified');
      } else {
        toast.info('Time-off rejected â€” employee notified');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const togglePaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const res = await apiRequest('PUT', `/api/time-off-requests/${id}/toggle-paid`, { isPaid });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to toggle paid status'); }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success(variables.isPaid ? 'Marked as Paid' : 'Marked as Unpaid');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addHolidayPayMutation = useMutation({
    mutationFn: async ({ userId, branchId, date }: { userId: string, branchId: string, date: Date }) => {
      const payload = {
        startDate: format(date, 'yyyy-MM-dd'),
        endDate: format(date, 'yyyy-MM-dd'),
        type: 'holiday_pay',
        value: '1',
        remarks: 'Holiday Pay',
      };
      // Send as POST to /api/adjustment-logs/request (Wait, managers usually create verified exceptions differently)
      // Actually, let's use the standard POST /api/adjustment-logs
      const res = await apiRequest('POST', '/api/adjustment-logs', { ...payload, employeeId: userId, branchId });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to apply holiday pay'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustment-logs', 'branch'] });
      toast.success('Holiday Pay added');
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
        toast.success('Trade accepted â€” awaiting manager approval');
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
        toast.success('Shift trade approved â€” both employees notified');
      } else {
        toast.info('Shift trade rejected â€” requester notified');
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/adjustment-logs", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to log exception");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success("Exception logged successfully");
      setIsAdjustmentDialogOpen(false);
      setAdjValue("");
      setAdjRemarks("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteAdjustmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/adjustment-logs/${id}`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to delete'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success("Exception log deleted");
      
      // Remove from active modal if open
      if (manageLogGroup) {
        setManageLogGroup(prev => {
          if (!prev) return null;
          const filtered = prev.filter(l => l.id !== deleteAdjustmentMutation.variables); // We'll handle this in UI instead to be safe
          return filtered;
        });
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateAdjustmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/adjustment-logs/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update exception");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success("Exception updated successfully");
      setIsAdjustmentDialogOpen(false);
      setAdjValue("");
      setAdjRemarks("");
      setEditAdjId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveAdjustmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/adjustment-logs/${id}/approve`);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to approve'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success("Exception log approved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectAdjustmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/adjustment-logs/${id}/reject`, { reason: 'Rejected by manager' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to reject'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      toast.success("Exception log rejected");
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

  // â”€â”€â”€ HANDLERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        // Keep day view in sync â€” move selected day to the same weekday in the new week
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

  const handleCreateAdjustment = async () => {
    if (!adjType || !adjValue) return;

    if (editAdjId) {
      await updateAdjustmentMutation.mutateAsync({
        id: editAdjId,
        data: {
          type: adjType,
          value: adjValue,
          remarks: adjRemarks,
        }
      });
      return;
    }

    if (!adjEmployeeId || (!adjDate && !adjIsRange)) return;

    let datesToLog: Date[] = [adjDate!];
    if (adjIsRange && adjEndDate && adjEndDate > adjDate!) {
      datesToLog = eachDayOfInterval({ start: adjDate!, end: adjEndDate });
    }

    for (const d of datesToLog) {
      if (!d) continue;
      await createAdjustmentMutation.mutateAsync({
        employeeId: adjEmployeeId,
        date: format(d, "yyyy-MM-dd"),
        type: adjType,
        value: adjValue,
        remarks: adjRemarks,
      });
    }
  };

  // â”€â”€â”€ LOADING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (shiftsLoading || employeesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%', bgcolor: 'transparent' }}>

      {/* â”€â”€â”€ NAVIGATION BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box sx={{
        px: { xs: 2, sm: 3 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
        borderBottom: '1px solid',
        borderColor: isDark ? '#3D3228' : '#E8E0D4',
        bgcolor: isDark ? alpha('#2A2018', 0.9) : alpha('#FFFFFF', 0.9),
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        {/* Left side: Navigation and Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, p: 0.5 }}>
            <IconButton size="small" onClick={() => handleWeekNav('prev')} sx={{ p: { xs: 0.5, sm: 1 } }}><PrevIcon /></IconButton>
            <Button size="small" onClick={() => handleWeekNav('today')} variant="text" sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1.5 }}>
              Today
            </Button>
            <IconButton size="small" onClick={() => handleWeekNav('next')} sx={{ p: { xs: 0.5, sm: 1 } }}><NextIcon /></IconButton>
          </Box>

          <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? '#F5EDE4' : '#3C2415', whiteSpace: 'nowrap', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
            {format(weekStart, 'MMM d')} – {format(weekEndDate, 'MMM d, yyyy')}
          </Typography>

          <Chip label={`${weeklyTotalHours}h total`} size="small" variant="filled" color="default" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, borderRadius: 2 }} />
        </Box>

        {/* Right side: View Toggles & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {isManager && (
            <Tooltip title={`${pendingCount} pending requests`}>
              <IconButton onClick={() => isMobile ? setDrawerOpen(true) : setIsSidebarOpen(!isSidebarOpen)} sx={{ position: 'relative', mr: 1, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <Badge badgeContent={pendingCount} color="warning" max={99}>
                  <InboxIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <ButtonGroup size="small" variant="outlined" sx={{ height: 32 }}>
            <Button
              variant={viewMode === 'week' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('week')}
              startIcon={isMobile ? undefined : <WeekIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, minWidth: isMobile ? 44 : 'auto', px: isMobile ? 1 : 2 }}
            >
              {isMobile ? <WeekIcon fontSize="small" /> : 'Week'}
            </Button>
            <Button
              variant={viewMode === 'day' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('day')}
              startIcon={isMobile ? undefined : <DayIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, minWidth: isMobile ? 44 : 'auto', px: isMobile ? 1 : 2 }}
            >
              {isMobile ? <DayIcon fontSize="small" /> : 'Day'}
            </Button>
          </ButtonGroup>

          {isManager && (
            <>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, mx: 0.5 }} />

              <Tooltip title="Toggle Bulk Edit Mode">
                <Button
                  size="small" variant={isSelectionMode ? "contained" : "outlined"} startIcon={<ChecklistIcon />}
                  onClick={() => {
                    if (isSelectionMode) {
                      setSelectedShifts(new Set());
                      setSelectedLogs(new Set());
                    }
                    setIsSelectionMode(!isSelectionMode);
                  }}
                  color="primary"
                  sx={{ 
                    textTransform: 'none', fontWeight: 800, 
                    display: { xs: 'none', sm: 'flex' }, height: 32,
                    borderWidth: isSelectionMode ? undefined : 2,
                    '&:hover': { borderWidth: isSelectionMode ? undefined : 2 },
                  }}
                >
                  {isSelectionMode ? 'Editing...' : 'Bulk Edit'}
                </Button>
              </Tooltip>

              <Button
                size="small"
                variant="outlined"
                endIcon={<MoreVertIcon />}
                onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                sx={{ 
                  textTransform: 'none', fontWeight: 700, height: 32,
                  display: { xs: 'none', sm: 'flex' },
                  color: 'text.primary',
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                  '&:hover': { borderColor: alpha(theme.palette.text.primary, 0.3), bgcolor: alpha(theme.palette.text.primary, 0.04) },
                }}
              >
                More
              </Button>
              <Menu
                anchorEl={actionsMenuAnchor}
                open={Boolean(actionsMenuAnchor)}
                onClose={() => setActionsMenuAnchor(null)}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }}
              >
                <MenuItem onClick={() => { setActionsMenuAnchor(null); setIsAdjustmentDialogOpen(true); }}>
                  <NoteAddIcon sx={{ mr: 1.5, fontSize: 18, color: '#F59E0B' }} />
                  <Typography variant="body2" fontWeight={600}>Log Exception</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setActionsMenuAnchor(null); setTimeOffModalOpen(true); }}>
                  <TimeOffIcon sx={{ mr: 1.5, fontSize: 18, color: '#92400E' }} />
                  <Typography variant="body2" fontWeight={600}>Time Off Request</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  setActionsMenuAnchor(null);
                  const myFutureShifts = shifts.filter(s => s.userId === currentUser?.id && new Date(s.startTime) > new Date());
                  if (myFutureShifts.length === 0) { toast.info('No future shifts to trade'); return; }
                  setTradeModalOpen(true);
                }}>
                  <SwapIcon sx={{ mr: 1.5, fontSize: 18, color: '#8B5CF6' }} />
                  <Typography variant="body2" fontWeight={600}>Trade Shift</Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem 
                  onClick={() => {
                    setActionsMenuAnchor(null);
                    if (confirm("Copy all shifts from the previous week into this week?")) {
                      copyWeekMutation.mutate();
                    }
                  }}
                  disabled={copyWeekMutation.isPending}
                >
                  <ContentCopyIcon sx={{ mr: 1.5, fontSize: 18, color: '#14B8A6' }} />
                  <Typography variant="body2" fontWeight={600}>Copy Previous Week</Typography>
                </MenuItem>
              </Menu>
            </>
          )}

          {isManager && (
            <Tooltip title="Create Shift">
              <Button
                size="small" variant="contained" startIcon={<AddIcon />}
                onClick={() => { setNewShift({ employeeId: '', startTime: null, endTime: null, notes: '' }); setCreateModalOpen(true); }}
                sx={{ 
                  textTransform: 'none', fontWeight: 800, height: 32, 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(92,64,51,0.15)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(92,64,51,0.2)' },
                }}
              >
                {isMobile ? '' : 'Shift'}
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* \u2500\u2500\u2500 ROLE COLORS & ICON LEGEND \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <Box sx={{ 
        px: { xs: 1.5, sm: 2 }, py: 0.5, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        flexWrap: 'wrap', gap: 0.5,
        borderBottom: '1px solid', borderColor: isDark ? '#3D3228' : '#E8E0D4',
        bgcolor: isDark ? alpha('#342A1E', 0.5) : alpha('#F5F0E8', 0.5),
      }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {isManager && getUniqueRoleColors(employees).map(rc => (
            <Chip
              key={rc.label} size="small" label={rc.label}
              sx={{ height: 20, fontSize: '0.58rem', fontWeight: 700, bgcolor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
            <Box component="span" sx={{ fontSize: '0.75rem' }}>{'\ud83c\udf34'}</Box> Time Off
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
            <Box component="span" sx={{ fontSize: '0.75rem' }}>{'\u23f0'}</Box> Exception
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
            <Box component="span" sx={{ fontSize: '0.75rem' }}>{'\ud83d\udd04'}</Box> Trade
          </Typography>
        </Box>
      </Box>

      {/* ——— MAIN CONTENT ─────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>

        {/* LEFT: Grid Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 2 }, minHeight: 400 }}>
          {viewMode === 'week' ? (
            isManager ? (
              <WeeklyGrid
                employees={employees}
                shifts={shifts}
                weekStart={weekStart}
                holidays={holidays}
                isManager={isManager}
                timeOffRequests={timeOffRequests}
                shiftTrades={shiftTrades}
                adjustmentLogs={adjustmentLogs}
                currentUserId={currentUser?.id || ''}
                isSelectionMode={isSelectionMode}
                selectedShifts={selectedShifts}
                selectedLogs={selectedLogs}
                onToggleShiftSelection={toggleShiftSelection}
                onToggleLogSelection={toggleLogSelection}
                onCreateShift={handleCreateShift}
                onEditShift={!isSelectionMode ? handleEditShift : () => {}}
                onOpenRequests={() => setDrawerOpen(true)}
                onDeleteTimeOff={(id) => setSelectedTimeOffId(id)}
                onManageLogGroup={setManageLogGroup}
                onExceptionLogClick={handleExceptionLogClick}
                onAddHolidayPay={(userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId!, date })}
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
                adjustmentLogs={adjustmentLogs}
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
                isManager={isManager}
                currentUserId={currentUser?.id || ''}
                timeOffRequests={timeOffRequests}
                shiftTrades={shiftTrades}
                adjustmentLogs={adjustmentLogs}
                isSelectionMode={isSelectionMode}
                selectedShifts={selectedShifts}
                selectedLogs={selectedLogs}
                onToggleShiftSelection={toggleShiftSelection}
                onToggleLogSelection={toggleLogSelection}
                onDateChange={setSelectedDay}
                onCreateShift={handleCreateShift}
                onEditShift={!isSelectionMode ? handleEditShift : () => {}}
                onDeleteTimeOff={(id) => setSelectedTimeOffId(id)}
                onManageLogGroup={setManageLogGroup}
                onExceptionLogClick={handleExceptionLogClick}
                onAddHolidayPay={(userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId!, date })}
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

        {/* RIGHT: PENDING ACTIVITY PANEL (DESKTOP) */}
        {!isMobile && (
          <Box sx={{ 
            width: isSidebarOpen ? 340 : 0, 
            opacity: isSidebarOpen ? 1 : 0,
            visibility: isSidebarOpen ? 'visible' : 'hidden',
            flexShrink: 0, 
            display: { xs: 'none', lg: 'block' },
            borderLeft: isSidebarOpen ? '1px solid' : 'none', 
            borderColor: isDark ? '#3D3228' : '#E8E0D4',
            bgcolor: isDark ? '#1C1410' : '#FBF8F4',
            overflowY: 'auto', 
            p: isSidebarOpen ? 2.5 : 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: isDark ? '#F5EDE4' : '#3C2415' }}>
                Requests & Trades
              </Typography>
              <IconButton onClick={() => setIsSidebarOpen(false)} size="small" sx={{ mr: -1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <RequestsPanel
              timeOffRequests={timeOffRequests}
              shiftTrades={shiftTrades}
              employees={employees}
              isManager={isManager}
              currentUserId={currentUser?.id || ''}
              adjustmentLogs={adjustmentLogs}
              onApproveTimeOff={(id, useSil) => approveTimeOffMutation.mutate({ id, status: 'approved', useSil })}
              onRejectTimeOff={(id, reason) => approveTimeOffMutation.mutate({ id, status: 'rejected', rejectionReason: reason })}
              onApproveTrade={(id) => approveTradeMutation.mutate({ id, status: 'approved' })}
              onRejectTrade={(id) => approveTradeMutation.mutate({ id, status: 'rejected' })}
              onAcceptTrade={(id) => respondTradeMutation.mutate({ id, status: 'accepted' })}
              onDeclineTrade={(id) => respondTradeMutation.mutate({ id, status: 'rejected' })}
              onCancelTrade={(id) => deleteTradeMutation.mutate(id)}
              onTakeOpenTrade={(id) => takeOpenTradeMutation.mutate(id)}
            />
          </Box>
        )}
      </Box>

      {/* ——— MOBILE FAB: Quick Actions ——————————————————————————————————————————— */}
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

      {/* ——— REQUESTS DRAWER (MOBILE) ────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { lg: 'none' } }}
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
          adjustmentLogs={adjustmentLogs}
          onApproveTimeOff={(id, useSil) => approveTimeOffMutation.mutate({ id, status: 'approved', useSil })}
          onRejectTimeOff={(id, reason) => approveTimeOffMutation.mutate({ id, status: 'rejected', rejectionReason: reason })}
          onApproveTrade={(id) => approveTradeMutation.mutate({ id, status: 'approved' })}
          onRejectTrade={(id) => approveTradeMutation.mutate({ id, status: 'rejected' })}
          onAcceptTrade={(id) => respondTradeMutation.mutate({ id, status: 'accepted' })}
          onDeclineTrade={(id) => respondTradeMutation.mutate({ id, status: 'rejected' })}
          onCancelTrade={(id) => deleteTradeMutation.mutate(id)}
          onTakeOpenTrade={(id) => takeOpenTradeMutation.mutate(id)}
        />
      </Drawer>

      {/* â”€â”€â”€ CREATE SHIFT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Create Shift</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select value={newShift.employeeId} label="Employee" onChange={e => setNewShift(p => ({ ...p, employeeId: e.target.value }))}>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} {emp.position && ` \u00B7 ${emp.position}`}
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
              const hasShiftOnDay = shifts.some(s => 
                s.userId === newShift.employeeId && 
                s.startTime &&
                isSameDay(new Date(s.startTime), newShift.startTime!)
              );
              if (hasShiftOnDay) {
                toast.error('This employee already has a shift scheduled on this day. Employees can only have 1 shift per day.');
                return;
              }

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

      {/* â”€â”€â”€ EDIT SHIFT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <Typography variant="caption" color="text.secondary">
                    {selectedShift.position || 'Staff'} · {editForm.startTime ? format(editForm.startTime, 'EEEE, MMM d, yyyy') : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={editForm.startTime ? format(editForm.startTime, 'HH:mm') : ''}
                  onChange={(e) => {
                    if (editForm.startTime && e.target.value) {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newDate = new Date(editForm.startTime);
                      newDate.setHours(h, m, 0, 0);
                      setEditForm(p => ({ ...p, startTime: newDate }));
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }}
                />
                <TextField
                  label="End Time"
                  type="time"
                  fullWidth
                  value={editForm.endTime ? format(editForm.endTime, 'HH:mm') : ''}
                  onChange={(e) => {
                    if (editForm.endTime && e.target.value) {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newDate = new Date(editForm.endTime);
                      newDate.setHours(h, m, 0, 0);
                      setEditForm(p => ({ ...p, endTime: newDate }));
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }}
                />
              </Box>
              {editForm.startTime && editForm.endTime && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                  Duration: {differenceInHours(editForm.endTime, editForm.startTime)}h
                </Typography>
              )}
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
                const hasShiftOnDay = shifts.some(s => 
                  s.userId === selectedShift.userId &&
                  s.id !== selectedShift.id &&
                  isSameDay(new Date(s.startTime), editForm.startTime!)
                );
                if (hasShiftOnDay) {
                  toast.error('This edit would conflict. Employees can only have 1 shift per day.');
                  return;
                }

                updateShiftMutation.mutate({ id: selectedShift.id, startTime: editForm.startTime.toISOString(), endTime: editForm.endTime.toISOString(), notes: editForm.notes });
              }
            }}
          >
            {updateShiftMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€â”€ DELETE CONFIRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {(() => {
        const selectedReq = timeOffRequests.find(r => r.id === selectedTimeOffId);
        if (!selectedReq) return null;
        return (
          <Dialog open={!!selectedTimeOffId} onClose={() => setSelectedTimeOffId(null)} maxWidth="xs" fullWidth>
            <DialogTitle>Manage Time-Off Request</DialogTitle>
            <DialogContent>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                {selectedReq.type.toUpperCase()} Leave ({selectedReq.status.toUpperCase()})
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {format(new Date(selectedReq.startDate), 'MMM d, yyyy')} - {format(new Date(selectedReq.endDate), 'MMM d, yyyy')}
                {selectedReq.reason && <><br />Reason: {selectedReq.reason}</>}
              </Typography>

              {selectedReq.status === 'approved' && isManager && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: isDark ? '#342A1E' : '#F5F5F5' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Payment Status</Typography>
                  <ButtonGroup fullWidth size="small">
                    <Button 
                      variant={selectedReq.isPaid ? 'contained' : 'outlined'} 
                      color="success"
                      disabled={togglePaidMutation.isPending}
                      onClick={() => togglePaidMutation.mutate({ id: selectedReq.id, isPaid: true })}
                    >
                      Paid Leave (₱)
                    </Button>
                    <Button 
                      variant={!selectedReq.isPaid ? 'contained' : 'outlined'} 
                      color="inherit"
                      disabled={togglePaidMutation.isPending}
                      onClick={() => togglePaidMutation.mutate({ id: selectedReq.id, isPaid: false })}
                    >
                      Unpaid
                    </Button>
                  </ButtonGroup>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="error" fontWeight={600} sx={{ mb: 1 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deleting this request will remove it permanently and restore any deducted leave credits.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTimeOffId(null)}>Close</Button>
              <Button variant="contained" color="error" disabled={deleteTimeOffMutation.isPending}
                onClick={() => selectedTimeOffId && deleteTimeOffMutation.mutate(selectedTimeOffId)}>
                {deleteTimeOffMutation.isPending ? 'Deleting...' : 'Delete Request'}
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* â”€â”€â”€ TIME-OFF MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€â”€ SHIFT TRADE MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName} {e.position && ` \u00B7 ${e.position}`}</MenuItem>
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

      {/* ─── EXCEPTION LOG MODAL ─────────────────────────────────────────────────── */}
      <Dialog
        open={isAdjustmentDialogOpen}
        onClose={() => setIsAdjustmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: isDark ? '#1C1410' : '#FFFFFF',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NoteAddIcon color="warning" />
            <Typography variant="h6" fontWeight={800}>
              {editAdjId ? "Edit Exception" : "Log Exception"}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {editAdjId ? "Update the specified payroll exception." : "Log overtime, tardiness, or adjustments directly to payroll."}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            
            {!editAdjId && (
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={adjEmployeeId}
                  label="Employee"
                  onChange={(e) => setAdjEmployeeId(e.target.value as string)}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} {emp.position && `· ${emp.position}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!editAdjId && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label={adjIsRange ? "Start Date" : "Date"}
                    value={adjDate}
                    onChange={(val: Date | null) => setAdjDate(val)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  {adjIsRange && (
                    <DatePicker
                      label="End Date"
                      value={adjEndDate}
                      onChange={(val: Date | null) => setAdjEndDate(val)}
                      minDate={adjDate || undefined}
                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                    />
                  )}
                </Stack>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => { setAdjIsRange(!adjIsRange); setAdjEndDate(null); }}
                  sx={{ textTransform: 'none', alignSelf: 'flex-start', mt: -1 }}
                >
                  {adjIsRange ? '← Log for single day' : '📅 Log for multiple days'}
                </Button>
              </LocalizationProvider>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={adjType}
                label="Type"
                onChange={(e) => setAdjType(e.target.value as string)}
              >
                {adjustmentTypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: opt.color }} />
                      <span>{opt.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={
                adjType === 'late' || adjType === 'undertime' ? "Minutes" : adjType === 'absent' ? "Days" : "Hours"
              }
              type="number" size="small" fullWidth value={adjValue}
              onChange={(e) => setAdjValue(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {adjType === 'late' || adjType === 'undertime' ? 'mins' : adjType === 'absent' ? 'days' : 'hrs'}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Remarks (DOLE compliance)" size="small" fullWidth multiline rows={2}
              value={adjRemarks} onChange={(e) => setAdjRemarks(e.target.value)}
              placeholder="e.g., Late due to heavy traffic, overtime approved by manager"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setIsAdjustmentDialogOpen(false); setEditAdjId(null); }} sx={{ borderRadius: 2, textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            color={editAdjId ? "primary" : "warning"}
            onClick={handleCreateAdjustment}
            disabled={(!editAdjId && (!adjEmployeeId || (!adjDate && !adjIsRange))) || !adjType || !adjValue || createAdjustmentMutation.isPending || updateAdjustmentMutation.isPending}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, px: 3 }}
          >
            {createAdjustmentMutation.isPending || updateAdjustmentMutation.isPending ? "Saving..." : editAdjId ? "Save Changes" : "Log Exception"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MANAGE LOG GROUP MODAL ─────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(manageLogGroup)}
        onClose={() => setManageLogGroup(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: isDark ? '#1C1410' : '#FFF', backgroundImage: 'none' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={800}>Manage Exceptions</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', pb: 2 }}>
            {manageLogGroup?.map((log, idx) => (
              <Box key={log.id} sx={{ 
                px: 3, py: 2, 
                borderBottom: idx < manageLogGroup.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {log.type.toUpperCase()}: {log.value}{log.type === 'late' || log.type === 'undertime' ? 'm' : log.type === 'absent' ? 'd' : 'h'}
                  </Typography>
                  {log.remarks && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                      "{log.remarks}"
                    </Typography>
                  )}
                  {log.isIncluded === false && (
                    <Chip label="Excluded" size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      setEditAdjId(log.id);
                      setAdjEmployeeId(log.employeeId);
                      setAdjDate(new Date(log.date));
                      setAdjIsRange(false);
                      setAdjType(log.type);
                      setAdjValue(log.value);
                      setAdjRemarks(log.remarks || '');
                      setManageLogGroup(null);
                      setIsAdjustmentDialogOpen(true);
                    }}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    disabled={deleteAdjustmentMutation.isPending}
                    onClick={() => {
                      if (confirm("Delete this exception log?")) {
                        deleteAdjustmentMutation.mutate(log.id);
                      }
                    }}
                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManageLogGroup(null)} sx={{ borderRadius: 2, textTransform: "none" }}>Done</Button>
        </DialogActions>
      </Dialog>
    
      {/* FLOATING ACTION BAR FOR SELECTION MODE */}
      {isSelectionMode && (selectedShifts.size > 0 || selectedLogs.size > 0) && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            px: 3,
            borderRadius: 8,
            bgcolor: isDark ? '#1C1410' : '#FFF',
            color: isDark ? '#FFF' : '#000',
            border: '1px solid',
            borderColor: isDark ? '#3D3228' : '#E8E0D4',
            zIndex: 1300,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            {selectedShifts.size + selectedLogs.size} item(s) selected
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider', mx: 1 }} />
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={() => {
              setSelectedShifts(new Set());
              setSelectedLogs(new Set());
              setIsSelectionMode(false);
            }}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={bulkDeleteMutation.isPending}
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${selectedShifts.size + selectedLogs.size} item(s)?`)) {
                bulkDeleteMutation.mutate();
              }
            }}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
          >
            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
          </Button>
        </Paper>
      )}
      {/* Exception Log Detail Drawer — Confirm/Dispute workflow */}
      <ExceptionLogDrawer
        open={exceptionLogDrawerOpen}
        onClose={() => { setExceptionLogDrawerOpen(false); setSelectedExceptionLog(null); }}
        log={selectedExceptionLog}
        isManager={isManager}
        onApprove={(id) => {
          approveAdjustmentMutation.mutate(id);
          setExceptionLogDrawerOpen(false);
        }}
        onReject={(id) => {
          rejectAdjustmentMutation.mutate(id);
          setExceptionLogDrawerOpen(false);
        }}
      />
    </Box>
  );
}
