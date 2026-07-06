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
 *
 * ── UX DECISION: "Recent Activities" feed ──────────────────────────────────
 * The Recent Activities / Activity Log does NOT belong on this page.
 * It should live on the Manager/Admin Requests page instead. Rationale:
 *
 *   1. FOCUS: The schedule page is already dense with the weekly grid,
 *      exception log pills, shift trades, and time-off overlays. Adding
 *      an activity feed here would clutter the core scheduling workflow.
 *
 *   2. NATURAL HOME: The Requests/Approvals page is where managers review
 *      trades, time-off, and exception logs — exactly the entities that
 *      generate "recent activity." The feed belongs alongside that context.
 *
 *   3. AUDIENCE: Employees don't need to see administrative activity
 *      (who approved what, who edited which rate). Showing it here adds
 *      noise for non-manager roles. A manager-only Requests page keeps
 *      this information properly scoped.
 *
 *   4. PERFORMANCE: The schedule grid already queries shifts, users, trades,
 *      and time-off. Adding an activity log query would slow initial render.
 */
import React, { useState, useMemo, useCallback, useEffect, startTransition } from 'react';

function safeFormat(val: any, fmt: string): string {
  if (!val) return '';
  try {
    const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val;
    if (d instanceof Date && !isNaN(d.getTime())) {
      return format(d, fmt);
    }
  } catch (e) {}
  return '';
}
import {
  Box, Paper, Typography, Button, IconButton, Chip, Badge, Drawer, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack, Tooltip, Avatar,
  CircularProgress, useTheme, useMediaQuery, Divider, ButtonGroup,
  InputAdornment, Menu, FormControlLabel, Switch, Skeleton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PrevIcon from '@mui/icons-material/ChevronLeft';
import NextIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import TodayIcon from '@mui/icons-material/Today';
import WeekIcon from '@mui/icons-material/CalendarViewDay';
import DayIcon from '@mui/icons-material/ViewAgenda';
import TimeOffIcon from '@mui/icons-material/BeachAccess';
import SwapIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChecklistIcon from '@mui/icons-material/ChecklistRtl';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getCurrentUser, isManager as checkIsManager } from '@/lib/auth';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, setHours, setMinutes, differenceInHours, isValid, areIntervalsOverlapping, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, DatePicker, TimePicker } from '@mui/x-date-pickers';
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
  const [takeTradeModalOpen, setTakeTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [takeTradeAction, setTakeTradeAction] = useState<'take' | 'accept' | 'decline' | null>(null);
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
  const [bulkExceptionPreview, setBulkExceptionPreview] = useState<{
    isOpen: boolean;
    employeeName: string;
    type: string;
    value: string;
    remarks: string;
    dateCount: number;
    startDate: string;
    endDate: string;
    isProcessing: boolean;
  } | null>(null);
  const [bulkDeleteState, setBulkDeleteState] = useState({
    isOpen: false,
    target: 'shifts' as 'shifts' | 'exceptions' | 'both',
    employeeId: 'all',
    startDate: new Date(),
    endDate: new Date(),
    confirmation: '',
    deletionReason: '',
    isDeleting: false,
    isLoadingPreview: false,
    preview: null as any | null,
  });
  const [bulkCreatePreview, setBulkCreatePreview] = useState<{
    isOpen: boolean;
    data: any;
    payload: any;
  } | null>(null);
  const adjustmentTypeOptions = [
    { value: "overtime", label: "Overtime (minutes)", color: "#10b981" },
    { value: "late", label: "Tardiness (minutes)", color: "#f97316" },
    { value: "undertime", label: "Undertime (minutes)", color: "#ec4899" },
    { value: "absent", label: "Absent (days)", color: "#dc2626" },
  ];

  const quickAdjustmentTypes = [
    { value: "late", label: "Late" },
    { value: "overtime", label: "OT" },
    { value: "undertime", label: "Undertime" },
    { value: "absent", label: "Absent" },
  ];

  // Form data
  const [newShift, setNewShift] = useState({ 
    employeeId: '', 
    startTime: null as Date | null, 
    endTime: null as Date | null, 
    notes: '', 
    breakDurationMinutes: 30,
    isBulk: false,
    bulkStartDate: null as Date | null,
    bulkEndDate: null as Date | null,
    bulkDays: [1,2,3,4,5] as number[], // Mon-Fri
    bulkStartTime: null as Date | null,
    bulkEndTime: null as Date | null,
    shiftType: 'regular' as 'morning' | 'afternoon' | 'night' | 'regular',
  });
  const [overtimeThreshold, setOvertimeThreshold] = useState(() => Number(localStorage.getItem('pero_overtime_threshold') || 48));
  useEffect(() => { localStorage.setItem('pero_overtime_threshold', String(overtimeThreshold)); }, [overtimeThreshold]);
  const [editForm, setEditForm] = useState({ startTime: null as Date | null, endTime: null as Date | null, notes: '', breakDurationMinutes: 30 });
  const [timeOffForm, setTimeOffForm] = useState({ type: 'vacation', startDate: new Date() as Date | null, endDate: new Date() as Date | null, reason: '' });
  const [tradeForm, setTradeForm] = useState({ shiftId: '', targetUserId: '', reason: '' });
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [copyWeekDialogOpen, setCopyWeekDialogOpen] = useState(false);
  const [manageLogGroup, setManageLogGroup] = useState<any[] | null>(null);

  // Exception Log Detail Drawer state
  const [exceptionLogDrawerOpen, setExceptionLogDrawerOpen] = useState(false);
  const [selectedExceptionLog, setSelectedExceptionLog] = useState<any>(null);

  const handleExceptionLogClick = useCallback((log: any) => {
    setSelectedExceptionLog(log);
    setExceptionLogDrawerOpen(true);
  }, []);

  type AdjustmentPrefill = {
    employeeId?: string;
    date?: Date | null;
    endDate?: Date | null;
    isRange?: boolean;
    type?: string;
    value?: string;
    remarks?: string;
  };

  const openAdjustmentDialog = useCallback((prefill: AdjustmentPrefill = {}) => {
    setEditAdjId(null);
    setAdjEmployeeId(prefill.employeeId || "");
    setAdjDate(prefill.date ?? selectedDay);
    setAdjEndDate(prefill.endDate ?? null);
    setAdjIsRange(Boolean(prefill.isRange));
    setAdjType(prefill.type || "late");
    setAdjValue(prefill.value || "");
    setAdjRemarks(prefill.remarks || "");
    setIsAdjustmentDialogOpen(true);
  }, [selectedDay]);

  const handleLogAdjustmentFromShift = useCallback((shift: Shift) => {
    openAdjustmentDialog({
      employeeId: String(shift.userId),
      date: new Date(shift.startTime),
    });
  }, [openAdjustmentDialog]);

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
    queryKeys: ['shifts', 'time-off-requests', 'shift-trades', 'employees', 'notifications', "adjustment-logs-branch", "adjustment-logs-mine", "/api/holidays"],
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

  // Performance: Only fetch a focused sliding window of shifts
  // (1 week before → 2 weeks after the current view) to prevent
  // loading ALL historical shifts which kills low-end devices.
  const shiftWindowStart = useMemo(() => format(subWeeks(weekStart, 1), 'yyyy-MM-dd'), [weekStart]);
  const shiftWindowEnd = useMemo(() => format(endOfWeek(addWeeks(weekStart, 2), { weekStartsOn: 1 }), 'yyyy-MM-dd'), [weekStart]);

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{ shifts: Shift[] }>({
    queryKey: ['shifts', 'branch', shiftWindowStart, shiftWindowEnd],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/shifts/branch?startDate=${shiftWindowStart}&endDate=${shiftWindowEnd}`);
      return res.json();
    },
    // Keep stale schedule visible while the new week loads — fixes "disappearing schedule" bug.
    placeholderData: (previousData) => previousData,
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
    const pendingTrades = shiftTrades.filter(t => {
      if (t.status !== 'pending' && t.status !== 'accepted') return false;
      // Auto-expire past shifts
      if (t.shift?.startTime && new Date(t.shift.startTime) < new Date()) return false;
      return true;
    }).length;
    return pendingTimeOff + pendingTrades;
  }, [timeOffRequests, shiftTrades]);

  // Weekly hours summary
  const weeklyTotalHours = useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const total = shifts.reduce((sum, s) => {
      const d = new Date(s.startTime);
      if (d >= weekStart && d <= weekEnd) {
        const hrs = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
        const breakHrs = (s.breakDurationMinutes || 0) / 60;
        return sum + Math.max(0, hrs - breakHrs);
      }
      return sum;
    }, 0);
    return Math.round(total * 10) / 10;
  }, [shifts, weekStart]);

  const currentWeekShiftCount = useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return shifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }, [shifts, weekStart]);

  const currentWeekMetrics = useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const currentWeekShifts = shifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= weekStart && d <= weekEnd;
    });
    const currentWeekLogs = adjustmentLogs.filter(l => {
      if (l.status === 'rejected') return false;
      const d = new Date(l.startDate || l.date);
      return d >= weekStart && d <= weekEnd;
    });

    const employeesWithShifts = new Set(currentWeekShifts.map(s => s.userId));
    const coveredEmployees = employeesWithShifts.size;
    const unscheduledCount = employees.length - coveredEmployees;

    const lateCount = currentWeekLogs.filter(l => l.type === 'late').length;
    const absentCount = currentWeekLogs.filter(l => l.type === 'absent').length;

    const empHours: Record<string, number> = {};
    let totalCost = 0;
    
    currentWeekShifts.forEach(s => {
      const rawHrs = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
      const breakHrs = (s.breakDurationMinutes || 0) / 60;
      const hrs = Math.max(0, rawHrs - breakHrs);
      
      empHours[s.userId] = (empHours[s.userId] || 0) + hrs;
      const emp = employees.find(e => e.id === s.userId);
      const rate = emp?.hourlyRate ? parseFloat(emp.hourlyRate) : 200;
      totalCost += hrs * rate;
    });

    const overtimeCount = Object.values(empHours).filter(hrs => hrs >= overtimeThreshold).length;

    return { coveredEmployees, unscheduledCount, lateCount, absentCount, overtimeCount, estimatedLaborCost: totalCost };
  }, [shifts, adjustmentLogs, weekStart, employees, overtimeThreshold]);

  const buildCopyWeekData = useCallback(() => {
    if (!currentUser?.branchId) return null;

    const lastWeekStart = subWeeks(weekStart, 1);
    const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
    const thisWeekStart = weekStart;
    const thisWeekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const lastWeekShifts = shifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= lastWeekStart && d <= lastWeekEnd && s.user?.isActive !== false;
    });

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

    return { lastWeekStart, lastWeekEnd, thisWeekStart, thisWeekEnd, lastWeekShifts, currentWeekShifts, shiftsToCopy };
  }, [currentUser?.branchId, shifts, weekStart]);

  const copyWeekPreview = useMemo(() => buildCopyWeekData(), [buildCopyWeekData]);

  // â”€â”€â”€ MUTATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createShiftMutation = useMutation({
    mutationFn: async (payload: { userId: string; startTime: string; endTime: string; branchId: string; position: string; notes?: string; breakDurationMinutes?: number }) => {
      const res = await apiRequest('POST', '/api/shifts', payload);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to create shift'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Shift created');
      setCreateModalOpen(false);
      setNewShift(prev => ({ ...prev, employeeId: '', startTime: null, endTime: null, notes: '', breakDurationMinutes: 30 }));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest('POST', '/api/shifts/bulk', payload);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to bulk create'); }
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (data.preview) {
        setBulkCreatePreview({ isOpen: true, data, payload: variables });
      } else {
        queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
        toast.success(`Created ${data.createdShifts} shifts. Skipped ${data.skipped}.`);
        setCreateModalOpen(false);
        setBulkCreatePreview(null);
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (payload: { id: string; startTime?: string; endTime?: string; notes?: string; breakDurationMinutes?: number; userId?: string }) => {
      const { id, ...data } = payload;
      const res = await apiRequest('PUT', `/api/shifts/${id}`, data);
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update shift'); }
      return res.json();
    },
    onMutate: async (newShift) => {
      await queryClient.cancelQueries({ queryKey: ['shifts', 'branch'] });
      const previous = queryClient.getQueryData<{ shifts: Shift[] }>(['shifts', 'branch', shiftWindowStart, shiftWindowEnd]);
      if (previous) {
        queryClient.setQueryData(['shifts', 'branch', shiftWindowStart, shiftWindowEnd], {
          ...previous,
          shifts: previous.shifts.map(s => s.id === newShift.id ? { ...s, ...newShift } : s)
        });
      }
      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
    },
    onSuccess: () => {
      toast.success('Shift updated');
      setEditModalOpen(false);
    },
    onError: (err: Error, newShift, context: any) => {
      if (context?.previous) queryClient.setQueryData(['shifts', 'branch', shiftWindowStart, shiftWindowEnd], context.previous);
      toast.error(err.message);
    },
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
      const copyPlan = buildCopyWeekData();
      if (!copyPlan) throw new Error("Branch ID missing");

      if (copyPlan.shiftsToCopy.length === 0) {
        if (copyPlan.lastWeekShifts.length > 0) {
          throw new Error("All shifts from the previous week already exist or overlap with the current week.");
        }
        throw new Error("No shifts found in the previous week to copy.");
      }

      const newShiftsPromises = copyPlan.shiftsToCopy.map(s => {
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

      const skippedCount = copyPlan.lastWeekShifts.length - copyPlan.shiftsToCopy.length;
      if (failed > 0) {
        throw new Error(`Copied ${copyPlan.shiftsToCopy.length - failed} shifts. Failed to copy ${failed} shifts. Skipped ${skippedCount} overlaps.`);
      }
      return { copiedCount: copyPlan.shiftsToCopy.length, skippedCount };
    },
    onSuccess: async ({ copiedCount, skippedCount }) => {
      // FIX: Use await refetchQueries instead of invalidateQueries
      // so the grid updates immediately without needing a manual refresh.
      await queryClient.refetchQueries({ queryKey: ['shifts', 'branch'] });
      let msg = `Successfully copied ${copiedCount} shifts.`;
      if (skippedCount > 0) msg += ` Skipped ${skippedCount} overlapping shifts.`;
      toast.success(msg);
      setCopyWeekDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTimeOffMutation = useMutation({
    mutationFn: async (data: typeof timeOffForm) => {
      const payload = {
        type: data.type,
        startDate: data.startDate ? safeFormat(data.startDate, 'yyyy-MM-dd') : '',
        endDate: data.endDate ? safeFormat(data.endDate, 'yyyy-MM-dd') : '',
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
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to cancel'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('Time-off request cancelled');
      setSelectedTimeOffId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveTimeOffMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason, leavePaymentStatus }: { id: string; status: string; rejectionReason?: string; leavePaymentStatus?: string }) => {
      const endpoint = status === 'approved'
        ? `/api/time-off-requests/${id}/approve`
        : `/api/time-off-requests/${id}/reject`;
      const body = status === 'rejected'
        ? { status, rejectionReason, leavePaymentStatus: leavePaymentStatus || 'unpaid' }
        : { status, leavePaymentStatus: leavePaymentStatus || 'paid' };
      const res = await apiRequest('PUT', endpoint, body);
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
        startDate: safeFormat(date, 'yyyy-MM-dd'),
        endDate: safeFormat(date, 'yyyy-MM-dd'),
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

  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/adjustment-logs", data);
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

  // ——— HANDLERS ——————————————————————————————————————————————————————————————————————
  const handleCreateShift = useCallback((employeeId: string, date: Date) => {
    const start = setMinutes(setHours(date, 8), 0);
    const end = setMinutes(setHours(date, 16), 0);
    setNewShift({
      employeeId,
      startTime: start,
      endTime: end,
      notes: '',
      breakDurationMinutes: 30,
      isBulk: false,
      bulkStartDate: startOfDay(date),
      bulkEndDate: startOfDay(addWeeks(date, 1)),
      bulkDays: [1,2,3,4,5],
      bulkStartTime: start,
      bulkEndTime: end,
      shiftType: 'regular' as const,
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
      breakDurationMinutes: (shift as any).breakDurationMinutes ?? 30,
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

  const handleCreateAdjustment = async () => {
    if (!adjType || !adjValue) return;

    if (editAdjId) {
      try {
        await updateAdjustmentMutation.mutateAsync({
          id: editAdjId,
          data: {
            type: adjType,
            value: adjValue,
            remarks: adjRemarks,
          }
        });
      } catch (e) {
        // Error handled by mutation onError
      }
      return;
    }

    if (!adjEmployeeId || (!adjDate && !adjIsRange)) return;

    let datesToLog: Date[] = [adjDate!];
    if (adjIsRange && adjEndDate && adjEndDate > adjDate!) {
      datesToLog = eachDayOfInterval({ start: adjDate!, end: adjEndDate });
    }

    // Single-day: use the mutation which shows its own toast
    if (datesToLog.length === 1) {
      try {
        await createAdjustmentMutation.mutateAsync({
          employeeId: adjEmployeeId,
          date: safeFormat(datesToLog[0], "yyyy-MM-dd"),
          type: adjType,
          value: adjValue,
          remarks: adjRemarks,
        });
      } catch (e) {
        // Error handled by mutation onError
      }
      return;
    }

    // Bulk date range: show confirmation dialog first
    const emp = employees.find(e => e.id === adjEmployeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
    const typeLabel = adjustmentTypeOptions.find(o => o.value === adjType)?.label || adjType;

    setBulkExceptionPreview({
      isOpen: true,
      employeeName: empName,
      type: typeLabel,
      value: adjValue,
      remarks: adjRemarks,
      dateCount: datesToLog.length,
      startDate: safeFormat(datesToLog[0], 'MMM d, yyyy'),
      endDate: safeFormat(datesToLog[datesToLog.length - 1], 'MMM d, yyyy'),
      isProcessing: false,
    })
  };

  // ——— LOADING ——————————————————————————————————————————————————————————————————————
  useEffect(() => {
    if (bulkDeleteState.isOpen) {
      const fetchPreview = async () => {
        setBulkDeleteState(prev => ({ ...prev, isLoadingPreview: true }));
        try {
          const res = await apiRequest('POST', '/api/shifts/bulk-delete-preview', {
            startDate: bulkDeleteState.startDate,
            endDate: bulkDeleteState.endDate,
            employeeId: bulkDeleteState.employeeId,
            target: bulkDeleteState.target
          });
          const data = await res.json();
          setBulkDeleteState(prev => ({ ...prev, isLoadingPreview: false, preview: data }));
        } catch (e) {
          console.error('Failed to fetch bulk delete preview', e);
          setBulkDeleteState(prev => ({ ...prev, isLoadingPreview: false }));
        }
      };
      
      const timer = setTimeout(fetchPreview, 300); // debounce
      return () => clearTimeout(timer);
    }
  }, [bulkDeleteState.isOpen, bulkDeleteState.startDate, bulkDeleteState.endDate, bulkDeleteState.employeeId, bulkDeleteState.target]);


  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%', bgcolor: 'transparent' }}>

      {/* ——— NAVIGATION BAR ——————————————————————————————————————————— */}
      <Box sx={{
        px: { xs: 2, sm: 3 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
        borderBottom: '1px solid',
        borderColor: isDark ? '#3D3228' : '#E8E0D4',
        bgcolor: isDark ? alpha('#2A2018', 0.9) : alpha('#FFFFFF', 0.9),
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
        '@media print': { display: 'none' },
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
            {safeFormat(weekStart, 'MMM d')} – {safeFormat(weekEndDate, 'MMM d, yyyy')}
          </Typography>

          <Chip label={shiftsLoading ? <Skeleton width={40} height={16} sx={{ display: 'inline-block' }} /> : `${weeklyTotalHours}h total`} size="small" variant="filled" color="default" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, borderRadius: 2 }} />
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
              <ButtonGroup size="small" variant="outlined" sx={{ height: 32, display: { xs: 'none', sm: 'flex' } }}>
                <Tooltip title="Add a new shift">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setNewShift(prev => ({ ...prev, employeeId: '', startTime: null, endTime: null, notes: '' })); setCreateModalOpen(true); }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(92,64,51,0.15)',
                      '&:hover': { boxShadow: '0 4px 12px rgba(92,64,51,0.2)' },
                    }}
                  >
                    Add Shift
                  </Button>
                </Tooltip>
                <Tooltip title="Quick actions">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                    sx={{
                      minWidth: 36,
                      px: 1,
                      color: isSelectionMode ? 'primary.main' : 'text.primary',
                      borderColor: isSelectionMode ? 'primary.main' : alpha(theme.palette.text.primary, 0.2),
                      bgcolor: isSelectionMode ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': {
                        borderColor: isSelectionMode ? 'primary.main' : alpha(theme.palette.text.primary, 0.3),
                        bgcolor: isSelectionMode ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04),
                      },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </ButtonGroup>

              <Menu
                anchorEl={actionsMenuAnchor}
                open={Boolean(actionsMenuAnchor)}
                onClose={() => setActionsMenuAnchor(null)}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }}
              >
                <MenuItem onClick={() => { setActionsMenuAnchor(null); setIsSelectionMode(prev => !prev); if (isSelectionMode) { setSelectedShifts(new Set()); setSelectedLogs(new Set()); } }}>
                  <ChecklistIcon sx={{ mr: 1.5, fontSize: 18, color: '#2563EB' }} />
                  <Typography variant="body2" fontWeight={600}>{isSelectionMode ? 'Done Editing' : 'Bulk Edit'}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setActionsMenuAnchor(null); setBulkDeleteState(prev => ({ ...prev, isOpen: true })); }}>
                  <DeleteIcon sx={{ mr: 1.5, fontSize: 18, color: '#DC2626' }} />
                  <Typography variant="body2" fontWeight={600} color="error.main">Bulk Delete (Range)</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setActionsMenuAnchor(null); openAdjustmentDialog({ date: selectedDay, type: 'late' }); }}>
                  <NoteAddIcon sx={{ mr: 1.5, fontSize: 18, color: '#F59E0B' }} />
                  <Typography variant="body2" fontWeight={600}>Log Attendance</Typography>
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
                <MenuItem onClick={() => { setActionsMenuAnchor(null); setCopyWeekDialogOpen(true); }}>
                  <ContentCopyIcon sx={{ mr: 1.5, fontSize: 18, color: '#14B8A6' }} />
                  <Typography variant="body2" fontWeight={600}>Copy Last Week</Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={async () => {
                  setActionsMenuAnchor(null);
                  try {
                    const { default: html2canvas } = await import('html2canvas');
                    const element = document.getElementById('schedule-grid-container');
                    if (!element) return;
                    const canvas = await html2canvas(element, { backgroundColor: isDark ? '#2A2018' : '#ffffff' });
                    const link = document.createElement('a');
                    link.download = `schedule-${format(weekStart, 'yyyy-MM-dd')}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  } catch (e) {
                    toast.error('Failed to export schedule image');
                  }
                }}>
                  <DownloadIcon sx={{ mr: 1.5, fontSize: 18, color: '#0EA5E9' }} />
                  <Typography variant="body2" fontWeight={600}>Export as PNG</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  setActionsMenuAnchor(null);
                  window.print();
                }}>
                  <PrintIcon sx={{ mr: 1.5, fontSize: 18, color: '#64748B' }} />
                  <Typography variant="body2" fontWeight={600}>Print Schedule</Typography>
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Employee action buttons — Time Off & Shift Trade */}
          {!isManager && (
            <ButtonGroup size="small" variant="outlined" sx={{ height: 32 }}>
              <Tooltip title="Request Time Off">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<TimeOffIcon />}
                  onClick={() => setTimeOffModalOpen(true)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    color: isDark ? '#F5EDE4' : '#92400E',
                    borderColor: alpha(isDark ? '#F5EDE4' : '#92400E', 0.3),
                    '&:hover': { bgcolor: alpha('#92400E', 0.08), borderColor: '#92400E' },
                  }}
                >
                  {isMobile ? '' : 'Time Off'}
                </Button>
              </Tooltip>
              <Tooltip title="Trade a Shift">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SwapIcon />}
                  onClick={() => {
                    const myFutureShifts = shifts.filter(s => s.userId === currentUser?.id && new Date(s.startTime) > new Date());
                    if (myFutureShifts.length === 0) { toast.info('No future shifts to trade'); return; }
                    setTradeModalOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    color: isDark ? '#F5EDE4' : '#7C3AED',
                    borderColor: alpha(isDark ? '#F5EDE4' : '#7C3AED', 0.3),
                    '&:hover': { bgcolor: alpha('#7C3AED', 0.08), borderColor: '#7C3AED' },
                  }}
                >
                  {isMobile ? '' : 'Trade'}
                </Button>
              </Tooltip>
            </ButtonGroup>
          )}
        </Box>
      </Box>

      {/* ——— WEEKLY SUMMARY STATS ———————————————————————————————————————— */}
      {isManager && (
        <Box sx={{
          px: { xs: 2, sm: 3 }, py: 1,
          display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: isDark ? '#3D3228' : '#E8E0D4',
          bgcolor: isDark ? '#2A2018' : '#FDFBF7',
          '@media print': { display: 'none' },
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            {weeklyTotalHours}h scheduled
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: currentWeekMetrics.unscheduledCount > 0 ? 'warning.main' : 'success.main' }}>
            {currentWeekMetrics.coveredEmployees}/{employees.length} covered
            {currentWeekMetrics.unscheduledCount > 0 && ` (${currentWeekMetrics.unscheduledCount} unscheduled)`}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: currentWeekMetrics.overtimeCount > 0 ? 'error.main' : 'text.secondary' }}>
              {currentWeekMetrics.overtimeCount} overtime{currentWeekMetrics.overtimeCount > 0 && ' ⚠️'}
            </Typography>
            <Tooltip title="Configure Overtime Threshold (hours/week)">
              <TextField
                size="small"
                variant="standard"
                type="number"
                value={overtimeThreshold}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setOvertimeThreshold(val);
                }}
                inputProps={{ style: { fontSize: '0.75rem', padding: '0 4px', width: '32px', textAlign: 'center', fontWeight: 700 } }}
                sx={{ ml: 0.5, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' } }}
              />
            </Tooltip>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: currentWeekMetrics.lateCount > 3 ? 'error.main' : currentWeekMetrics.lateCount > 0 ? 'warning.main' : 'text.secondary' }}>
            {currentWeekMetrics.lateCount} late
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: currentWeekMetrics.absentCount > 0 ? 'error.main' : 'text.secondary' }}>
            {currentWeekMetrics.absentCount} absent
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ≈ ₱{currentWeekMetrics.estimatedLaborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      )}

      {/* ——— ROLE COLORS & ICON LEGEND —————————————————————————————— */}
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
            <Box component="span" sx={{ fontSize: '0.75rem' }}>🌴</Box> Time Off
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
            <Box component="span" sx={{ fontSize: '0.75rem' }}>⏰</Box> Exception
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
            <Box component="span" sx={{ fontSize: '0.75rem' }}>🔄</Box> Trade
          </Typography>
        </Box>
      </Box>

      {/* ——— MAIN CONTENT ——————————————————————————————————————— */}
      <Box id="schedule-grid-container" sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, bgcolor: 'background.default' }}>

        {/* LEFT: Grid Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 2 }, minHeight: 400 }}>
          {viewMode === 'week' ? (
            isManager ? (
              <Stack spacing={2}>
                {currentWeekShiftCount === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary' }}>
                          No shifts scheduled this week
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
                          Start from scratch or copy last week. New shifts will sync live to the schedule as soon as you save them.
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleCreateShift('', selectedDay)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                        >
                          Add Shift
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => setCopyWeekDialogOpen(true)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          Copy Last Week
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
                <WeeklyGrid
                  isLoading={shiftsLoading || employeesLoading}
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
                  onAddHolidayPay={(userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId!, date })}
                  onLogAdjustment={handleLogAdjustmentFromShift}
                  onMoveShift={(payload) => updateShiftMutation.mutate(payload)}
                  overtimeThreshold={overtimeThreshold}
                />
              </Stack>
            ) : (
              /* Employee week view: show their shifts only, as vertical cards */
              <WeeklyGrid
                isLoading={shiftsLoading || employeesLoading}
                employees={employees.filter(e => 
                  e.id === currentUser?.id || 
                  shiftTrades.some(t => t.shiftId && shifts.find(s => s.id === t.shiftId)?.userId === e.id && (t.targetUserId === currentUser?.id || t.toUserId === currentUser?.id || (!t.targetUserId && !t.toUserId && t.status === 'pending')))
                )}
                shifts={shifts.filter(s => 
                  s.userId === currentUser?.id || 
                  shiftTrades.some(t => t.shiftId === s.id && (t.targetUserId === currentUser?.id || t.toUserId === currentUser?.id || (!t.targetUserId && !t.toUserId && t.status === 'pending')))
                )}
                weekStart={weekStart}
                holidays={holidays}
                isManager={false}
                timeOffRequests={timeOffRequests.filter(r => r.userId === currentUser?.id)}
                shiftTrades={shiftTrades.filter(t => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id || t.targetUserId === currentUser?.id || t.toUserId === currentUser?.id || (!t.targetUserId && !t.toUserId))}
                adjustmentLogs={adjustmentLogs}
                currentUserId={currentUser?.id || ''}
                onCreateShift={() => {}}
                onEditShift={() => {}}
                onOpenRequests={() => setDrawerOpen(true)}
                onMoveShift={() => {}}
                overtimeThreshold={overtimeThreshold}
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
                onAddHolidayPay={(userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId!, date })}
                onLogAdjustment={handleLogAdjustmentFromShift}
              />
            ) : (
              <MyDayView
                shifts={shifts}
                date={selectedDay}
                currentUserId={currentUser?.id || ''}
                timeOffRequests={timeOffRequests.filter(r => r.userId === currentUser?.id)}
                shiftTrades={shiftTrades.filter(t => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id || t.targetUserId === currentUser?.id || t.toUserId === currentUser?.id || (!t.targetUserId && !t.toUserId))}
                onDateChange={setSelectedDay}
              />
            )
          )}
        </Box>

        {/* RIGHT: PENDING ACTIVITY PANEL (DESKTOP) */}
        {!isMobile && (
          <Box sx={{ 
            width: isSidebarOpen ? 340 : 0, 
            minWidth: isSidebarOpen ? 340 : 0,
            maxWidth: isSidebarOpen ? 340 : 0,
            opacity: isSidebarOpen ? 1 : 0,
            visibility: isSidebarOpen ? 'visible' : 'hidden',
            flexShrink: 0, 
            display: { xs: 'none', lg: 'block' },
            borderLeft: isSidebarOpen ? '1px solid' : 'none', 
            borderColor: isDark ? '#3D3228' : '#E8E0D4',
            bgcolor: isDark ? '#1C1410' : '#FBF8F4',
            overflowY: 'auto', 
            overflowX: 'hidden',
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
              shifts={shifts}
              isManager={isManager}
              currentUserId={currentUser?.id || ''}
              adjustmentLogs={adjustmentLogs}
              onApproveTimeOff={(id, leavePaymentStatus) => approveTimeOffMutation.mutate({ id, status: 'approved', leavePaymentStatus })}
              onRejectTimeOff={(id, reason, leavePaymentStatus) => approveTimeOffMutation.mutate({ id, status: 'rejected', rejectionReason: reason, leavePaymentStatus })}
              onApproveTrade={(id) => approveTradeMutation.mutate({ id, status: 'approved' })}
              onRejectTrade={(id) => approveTradeMutation.mutate({ id, status: 'rejected' })}
              onCancelTrade={(id) => approveTradeMutation.mutate({ id, status: 'cancelled' })}
              onAcceptTrade={(id) => {
                const t = shiftTrades.find(t => t.id === id);
                setSelectedTrade(t);
                setTakeTradeAction('accept');
                setTakeTradeModalOpen(true);
              }}
              onDeclineTrade={(id) => {
                const t = shiftTrades.find(t => t.id === id);
                setSelectedTrade(t);
                setTakeTradeAction('decline');
                setTakeTradeModalOpen(true);
              }}
              onTakeOpenTrade={(id) => {
                const t = shiftTrades.find(t => t.id === id);
                setSelectedTrade(t);
                setTakeTradeAction('take');
                setTakeTradeModalOpen(true);
              }}
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
                onClick={() => { setNewShift(prev => ({ ...prev, employeeId: '', startTime: null, endTime: null, notes: '' })); setCreateModalOpen(true); }}
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
          <IconButton onClick={() => startTransition(() => setDrawerOpen(false))}><CloseIcon /></IconButton>
        </Box>
        <RequestsPanel
          timeOffRequests={timeOffRequests}
          shiftTrades={shiftTrades}
          employees={employees}
          isManager={isManager}
          currentUserId={currentUser?.id || ''}
          adjustmentLogs={adjustmentLogs}
          onApproveTimeOff={(id, leavePaymentStatus) => approveTimeOffMutation.mutate({ id, status: 'approved', leavePaymentStatus })}
          onRejectTimeOff={(id, reason, leavePaymentStatus) => approveTimeOffMutation.mutate({ id, status: 'rejected', rejectionReason: reason, leavePaymentStatus })}
          onApproveTrade={(id) => approveTradeMutation.mutate({ id, status: 'approved' })}
          onRejectTrade={(id) => approveTradeMutation.mutate({ id, status: 'rejected' })}
          onAcceptTrade={(id) => {
            const t = shiftTrades.find(t => t.id === id);
            setSelectedTrade(t);
            setTakeTradeAction('accept');
            setTakeTradeModalOpen(true);
          }}
          onDeclineTrade={(id) => {
            const t = shiftTrades.find(t => t.id === id);
            setSelectedTrade(t);
            setTakeTradeAction('decline');
            setTakeTradeModalOpen(true);
          }}
          onCancelTrade={(id) => deleteTradeMutation.mutate(id)}
          onTakeOpenTrade={(id) => {
            const t = shiftTrades.find(t => t.id === id);
            setSelectedTrade(t);
            setTakeTradeAction('take');
            setTakeTradeModalOpen(true);
          }}
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

            <FormControlLabel
              control={<Switch checked={newShift.isBulk} onChange={(e) => setNewShift(p => ({ ...p, isBulk: e.target.checked }))} />}
              label="Schedule multiple days (Recurring)"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {!newShift.isBulk ? (
                <>
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
                </>
              ) : (
                <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2">Date Range</Typography>
                  <Stack direction="row" spacing={2}>
                    <DatePicker label="Start Date" value={newShift.bulkStartDate} onChange={(val) => setNewShift(p => ({ ...p, bulkStartDate: val }))} slotProps={{ textField: { fullWidth: true } }} />
                    <DatePicker label="End Date" value={newShift.bulkEndDate} onChange={(val) => setNewShift(p => ({ ...p, bulkEndDate: val }))} slotProps={{ textField: { fullWidth: true } }} minDate={newShift.bulkStartDate || undefined} />
                  </Stack>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Weekly Schedule</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <Chip
                        key={day}
                        label={day}
                        clickable
                        color={newShift?.bulkDays?.includes(idx) ? 'primary' : 'default'}
                        onClick={() => {
                          const hasDay = newShift?.bulkDays?.includes(idx);
                          setNewShift(p => ({ ...p, bulkDays: hasDay ? (p.bulkDays || []).filter(d => d !== idx) : [...(p.bulkDays || []), idx] }));
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Work Hours</Typography>
                  <Stack direction="row" spacing={2}>
                    <TimePicker label="Start Time" value={newShift.bulkStartTime} onChange={(val) => setNewShift(p => ({ ...p, bulkStartTime: val }))} slotProps={{ textField: { fullWidth: true } }} />
                    <TimePicker label="End Time" value={newShift.bulkEndTime} onChange={(val) => setNewShift(p => ({ ...p, bulkEndTime: val }))} slotProps={{ textField: { fullWidth: true } }} />
                  </Stack>
                </Stack>
              )}
            </LocalizationProvider>

            <TextField label="Notes" multiline rows={2} value={newShift.notes} onChange={e => setNewShift(p => ({ ...p, notes: e.target.value }))} fullWidth />
            <TextField
              label="Break Duration (minutes)"
              type="number"
              fullWidth
              value={newShift.breakDurationMinutes}
              onChange={e => setNewShift(p => ({ ...p, breakDurationMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
              InputProps={{ inputProps: { min: 0, max: 120, step: 5 }, endAdornment: <InputAdornment position="end">min</InputAdornment> }}
              helperText={newShift.breakDurationMinutes > 0 ? `${newShift.breakDurationMinutes} min unpaid break deducted from hours` : 'No break'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!newShift.employeeId || createShiftMutation.isPending || bulkCreateMutation.isPending}
            onClick={() => {
              if (newShift.isBulk) {
                if (!newShift.bulkStartDate || !newShift.bulkEndDate || !newShift.bulkStartTime || !newShift.bulkEndTime || !newShift.bulkDays.length) {
                  toast.error('Please fill in all bulk scheduling details');
                  return;
                }
                bulkCreateMutation.mutate({
                  employeeId: newShift.employeeId,
                  bulkStartDate: newShift.bulkStartDate.toISOString(),
                  bulkEndDate: newShift.bulkEndDate.toISOString(),
                  bulkStartTime: newShift.bulkStartTime.toISOString(),
                  bulkEndTime: newShift.bulkEndTime.toISOString(),
                  bulkDays: newShift.bulkDays,
                  notes: newShift.notes,
                  breakDurationMinutes: newShift.breakDurationMinutes,
                  confirm: false
                });
              } else {
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
                  breakDurationMinutes: newShift.breakDurationMinutes,
                });
              }
            }}
          >
            {createShiftMutation.isPending || bulkCreateMutation.isPending ? 'Processing...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€â”€ EDIT SHIFT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Edit Shift</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Overlap warning banner */}
              {selectedShift && shifts.some(s => 
                s.userId === selectedShift.userId && 
                s.id !== selectedShift.id && 
                isSameDay(new Date(s.startTime), editForm.startTime || new Date(selectedShift.startTime))
              ) && (
                <Box sx={{ p: 1.5, mb: 0.5, borderRadius: 2, bgcolor: alpha('#F59E0B', 0.1), border: '1px solid', borderColor: alpha('#F59E0B', 0.3), display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="warning.dark">
                    ⚠️ This employee has another shift on this day.
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: isDark ? '#342A1E' : '#F5F0E8', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: getRoleColor(selectedShift.position, undefined, selectedShift.startTime).bg, color: 'white' }}>
                  {selectedShift.user?.firstName?.[0] || employees.find(e => e.id === selectedShift.userId)?.firstName?.[0] || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {selectedShift.user ? `${selectedShift.user.firstName} ${selectedShift.user.lastName}` : (() => { const e = employees.find(x => x.id === selectedShift.userId); return e ? `${e.firstName} ${e.lastName}` : 'Unknown'; })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedShift.position || 'Staff'} · {editForm.startTime ? safeFormat(editForm.startTime, 'EEEE, MMM d, yyyy') : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={editForm.startTime ? safeFormat(editForm.startTime, 'HH:mm') : ''}
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
                  value={editForm.endTime ? safeFormat(editForm.endTime, 'HH:mm') : ''}
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
                  Duration: {differenceInHours(editForm.endTime, editForm.startTime)}h{editForm.breakDurationMinutes > 0 ? ` · Paid: ${(differenceInHours(editForm.endTime, editForm.startTime) - editForm.breakDurationMinutes / 60).toFixed(1)}h (${editForm.breakDurationMinutes} min unpaid break)` : ''}
                </Typography>
              )}
              <TextField
                label="Notes" multiline rows={2}
                value={editForm.notes}
                onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Break Duration (minutes)"
                type="number"
                fullWidth
                value={editForm.breakDurationMinutes}
                onChange={e => setEditForm(p => ({ ...p, breakDurationMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
                InputProps={{ inputProps: { min: 0, max: 120, step: 5 }, endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                helperText={editForm.breakDurationMinutes > 0 ? `${editForm.breakDurationMinutes} min unpaid break` : 'No break scheduled'}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => { setEditModalOpen(false); setDeleteConfirmOpen(true); }} startIcon={<DeleteIcon />}>Delete</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<NoteAddIcon />}
            onClick={() => {
              if (!selectedShift) return;
              setEditModalOpen(false);
              openAdjustmentDialog({
                employeeId: selectedShift.userId,
                date: new Date(selectedShift.startTime),
                type: 'late',
                remarks: selectedShift.notes || '',
              });
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Log Attendance
          </Button>
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

                updateShiftMutation.mutate({ id: selectedShift.id, startTime: editForm.startTime.toISOString(), endTime: editForm.endTime.toISOString(), notes: editForm.notes, breakDurationMinutes: editForm.breakDurationMinutes });
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
                {safeFormat(new Date(selectedReq.startDate), 'MMM d, yyyy')} - {safeFormat(new Date(selectedReq.endDate), 'MMM d, yyyy')}
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
              <Typography variant="body2" color="warning.main" fontWeight={600} sx={{ mb: 1 }}>
                Cancel Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelling keeps the request in the system for audit history. If it was already approved and paid, leave credits are restored.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTimeOffId(null)}>Close</Button>
              <Button variant="contained" color="warning" disabled={deleteTimeOffMutation.isPending || selectedReq.status === 'cancelled'}
                onClick={() => selectedTimeOffId && deleteTimeOffMutation.mutate(selectedTimeOffId)}>
                {selectedReq.status === 'cancelled' ? 'Already Cancelled' : (deleteTimeOffMutation.isPending ? 'Cancelling...' : 'Cancel Request')}
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
                      {safeFormat(new Date(s.startTime), 'MMM d, h:mm a')} – {safeFormat(new Date(s.endTime), 'h:mm a')} {s.position && `(${s.position})`}
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
        <DialogTitle component="div" sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NoteAddIcon color="warning" />
            <Typography component="span" variant="h6" fontWeight={800}>
              {editAdjId ? "Edit Attendance Log" : "Log Attendance"}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {editAdjId ? "Update the selected attendance entry." : "Record tardiness, overtime, undertime, or absence from the schedule or logbook."}
          </Typography>
          {!editAdjId && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
              {quickAdjustmentTypes.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  onClick={() => { setAdjType(option.value); if (option.value === 'absent') setAdjValue('1'); }}
                  color={adjType === option.value ? 'warning' : 'default'}
                  variant={adjType === option.value ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {!editAdjId && (adjEmployeeId || adjDate || adjIsRange) && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}` }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {adjEmployeeId && (
                    <Chip
                      size="small"
                      label={`Employee: ${employees.find((emp) => emp.id === adjEmployeeId)?.firstName || 'Selected'}`}
                      variant="outlined"
                    />
                  )}
                  {adjDate && isValid(adjDate) && !adjIsRange && (
                    <Chip
                      size="small"
                      label={`Date: ${safeFormat(adjDate, 'MMM d, yyyy')}`}
                      variant="outlined"
                    />
                  )}
                  {adjIsRange && adjDate && isValid(adjDate) && (
                    <Chip
                      size="small"
                      label={`Range starts: ${safeFormat(adjDate, 'MMM d, yyyy')}`}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            )}
            
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
                <FormControlLabel
                  control={<Switch size="small" checked={adjIsRange} onChange={(e) => { setAdjIsRange(e.target.checked); setAdjEndDate(null); }} />}
                  label={<Typography variant="body2" fontWeight={600}>Bulk log date range</Typography>}
                  sx={{ mt: -1, alignSelf: 'flex-start' }}
                />
              </LocalizationProvider>
            )}

            <FormControl fullWidth size="small" sx={{ display: editAdjId ? 'flex' : 'none' }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={adjType}
                label="Type"
                onChange={(e) => { setAdjType(e.target.value as string); if (e.target.value === 'absent') setAdjValue('1'); }}
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

            {adjType !== 'absent' ? (
              <TextField
                label={
                  adjType === 'late' || adjType === 'undertime' || adjType === 'overtime' ? "Minutes" : "Hours"
                }
                type="number" size="small" fullWidth value={adjValue}
                onChange={(e) => setAdjValue(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {adjType === 'late' || adjType === 'undertime' || adjType === 'overtime' ? 'mins' : 'hrs'}
                    </InputAdornment>
                  ),
                }}
                helperText={adjType === 'late' || adjType === 'undertime' || adjType === 'overtime'
                  ? `Use minutes for ${adjType === 'overtime' ? 'overtime' : 'tardiness or undertime'} from the logbook.`
                  : 'Use hours for legacy logs.'}
              />
            ) : (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                <Typography variant="body2" color="error.dark" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>⚠️</span> Absences are logged as full days.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  This will override any scheduled shift for this date.
                </Typography>
              </Box>
            )}

            <TextField
              label="Remarks (DOLE compliance)" size="small" fullWidth multiline rows={2}
              value={adjRemarks} onChange={(e) => setAdjRemarks(e.target.value)}
              placeholder={adjType === 'absent' ? "e.g., Sick leave, No-call no-show" : "e.g., Late due to heavy traffic, overtime approved by manager"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setIsAdjustmentDialogOpen(false); setEditAdjId(null); }} sx={{ borderRadius: 2, textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            color={editAdjId ? "primary" : "warning"}
            onClick={handleCreateAdjustment}
            disabled={(!editAdjId && (!adjEmployeeId || (!adjDate && !adjIsRange))) || !adjType || (adjType !== 'absent' && !adjValue) || createAdjustmentMutation.isPending || updateAdjustmentMutation.isPending}
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
        <DialogTitle component="div" sx={{ pb: 1 }}>
          <Typography component="span" variant="h6" fontWeight={800}>Manage Exceptions</Typography>
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
                      setAdjDate(new Date(log.startDate || log.date));
                      setAdjIsRange(false);
                      setAdjType(log.type);
                      setAdjValue(log.value);
                      setAdjRemarks(log.remarks || '');
                      setManageLogGroup(null);
                      setIsAdjustmentDialogOpen(true);
                    }}
                    className="action-btn-edit"
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
                    className="action-btn-delete"
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

        {/* ─── DUPLICATE WEEK MODAL ─────────────────────────────────────────────── */}
        <Dialog
          open={copyWeekDialogOpen}
          onClose={() => !copyWeekMutation.isPending && setCopyWeekDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, background: isDark ? '#1C1410' : '#FFFFFF' }
          }}
        >
          <DialogTitle component="div" sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ContentCopyIcon color="primary" />
              <Typography component="span" variant="h6" fontWeight={800}>
                Copy Last Week
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Reuse the previous week as a template. The schedule updates live as the new shifts are created.
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.25} sx={{ mt: 1 }}>
              <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}` }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Import summary
                </Typography>
                  <Typography variant="body2" color="text.secondary">
                  {copyWeekPreview?.lastWeekShifts.length ? (
                    <>
                      {copyWeekPreview.shiftsToCopy.length} shifts will be copied from {safeFormat(copyWeekPreview.lastWeekStart, 'MMM d')} to {safeFormat(copyWeekPreview.lastWeekEnd, 'MMM d')}
                      {copyWeekPreview.lastWeekShifts.length !== copyWeekPreview.shiftsToCopy.length ? `, with ${copyWeekPreview.lastWeekShifts.length - copyWeekPreview.shiftsToCopy.length} overlap(s) skipped.` : '.'}
                    </>
                  ) : (
                    'No shifts were found in the previous week yet.'
                  )}
                </Typography>
              </Box>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                <Chip size="small" label={`Source: ${safeFormat(copyWeekPreview?.lastWeekStart || weekStart, 'MMM d')} – ${safeFormat(copyWeekPreview?.lastWeekEnd || weekEndDate, 'MMM d')}`} variant="outlined" />
                <Chip size="small" label={`Target: ${safeFormat(weekStart, 'MMM d')} – ${safeFormat(weekEndDate, 'MMM d')}`} variant="outlined" />
                <Chip size="small" label={copyWeekPreview?.currentWeekShifts.length ? `${copyWeekPreview.currentWeekShifts.length} shifts already exist` : 'This week is empty'} variant="outlined" />
              </Stack>

              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                This is the fastest way to build a repeating schedule. Use it when the pattern is mostly the same from week to week.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCopyWeekDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              disabled={copyWeekMutation.isPending || !copyWeekPreview?.lastWeekShifts.length}
              onClick={() => copyWeekMutation.mutate()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
            >
              {copyWeekMutation.isPending ? 'Copying...' : 'Copy Week'}
            </Button>
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
        onClose={() => startTransition(() => { setExceptionLogDrawerOpen(false); setSelectedExceptionLog(null); })}
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
      {/* ─── BULK DELETE DIALOG ────────────────────────────────────────────────────────────── */}
      <Dialog open={bulkDeleteState.isOpen} onClose={() => setBulkDeleteState({ ...bulkDeleteState, isOpen: false, preview: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Bulk Delete Options</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Delete multiple shifts or exception logs at once by selecting a date range.
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Delete Target</InputLabel>
              <Select value={bulkDeleteState.target} label="Delete Target" onChange={e => setBulkDeleteState({ ...bulkDeleteState, target: e.target.value as any })}>
                <MenuItem value="shifts">Shifts Only</MenuItem>
                <MenuItem value="exceptions">Exception Logs Only</MenuItem>
                <MenuItem value="both">Both Shifts & Exceptions</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select value={bulkDeleteState.employeeId} label="Employee" onChange={e => setBulkDeleteState({ ...bulkDeleteState, employeeId: e.target.value })}>
                <MenuItem value="all">All Employees</MenuItem>
                {employees.map(emp => <MenuItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</MenuItem>)}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" spacing={1}>
                <DatePicker label="Start Date" value={bulkDeleteState.startDate} onChange={v => setBulkDeleteState({ ...bulkDeleteState, startDate: v || new Date() })} slotProps={{ textField: { size: "small", fullWidth: true } }} />
                <DatePicker label="End Date" value={bulkDeleteState.endDate} onChange={v => setBulkDeleteState({ ...bulkDeleteState, endDate: v || new Date() })} minDate={bulkDeleteState.startDate} slotProps={{ textField: { size: "small", fullWidth: true } }} />
              </Stack>
            </LocalizationProvider>
            
            <TextField 
              size="small" 
              fullWidth
              label="Reason for Deletion (Required)"
              value={bulkDeleteState.deletionReason}
              onChange={e => setBulkDeleteState({ ...bulkDeleteState, deletionReason: e.target.value })}
              required
            />
            
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="subtitle2" sx={{ mb: 1 }}>Pre-flight Impact Summary</Typography>
               {bulkDeleteState.isLoadingPreview ? (
                 <CircularProgress size={20} />
               ) : bulkDeleteState.preview ? (
                 <Stack spacing={1}>
                   <Typography variant="body2">• {bulkDeleteState.preview.shiftCount} shifts will be deleted.</Typography>
                   <Typography variant="body2">• {bulkDeleteState.preview.exceptionCount} exception logs will be deleted.</Typography>
                   {bulkDeleteState.preview.tradesCount > 0 && <Typography variant="body2" color="error.main">• {bulkDeleteState.preview.tradesCount} shift trades will be canceled.</Typography>}
                   
                   {bulkDeleteState.preview.orphanedLeaves?.length > 0 && (
                     <Box sx={{ mt: 1 }}>
                       <Typography variant="body2" color="warning.main" fontWeight={600}>The following leave requests will be orphaned:</Typography>
                       <ul style={{ margin: 0, paddingLeft: '20px' }}>
                         {bulkDeleteState.preview.orphanedLeaves.map((l: any, i: number) => (
                           <li key={i}>
                             <Typography variant="body2" color="text.secondary">
                               {l.employeeName}'s {l.type} leave ({safeFormat(new Date(l.start), 'MMM d')})
                             </Typography>
                           </li>
                         ))}
                       </ul>
                     </Box>
                   )}
                 </Stack>
               ) : (
                 <Typography variant="body2" color="text.secondary">Select options to see impact.</Typography>
               )}
            </Box>
            
            <Alert severity="warning" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
              This action is permanent and cannot be undone. To proceed, type <b>DELETE</b> below.
            </Alert>
            <TextField 
              size="small" 
              placeholder="Type DELETE to confirm" 
              value={bulkDeleteState.confirmation}
              onChange={e => setBulkDeleteState({ ...bulkDeleteState, confirmation: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteState({ ...bulkDeleteState, isOpen: false })}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            disabled={bulkDeleteState.confirmation !== 'DELETE' || bulkDeleteState.isDeleting || !bulkDeleteState.deletionReason}
            onClick={async () => {
              setBulkDeleteState(prev => ({ ...prev, isDeleting: true }));
                                          
              try {
                const qStart = safeFormat(bulkDeleteState.startDate, "yyyy-MM-dd");
                const qEnd = safeFormat(bulkDeleteState.endDate, "yyyy-MM-dd");
                
                const res = await apiRequest('POST', '/api/shifts/bulk-delete', {
                  startDate: qStart,
                  endDate: qEnd,
                  employeeId: bulkDeleteState.employeeId,
                  target: bulkDeleteState.target,
                  deletionReason: bulkDeleteState.deletionReason,
                });
                if (!res.ok) throw new Error("Bulk delete failed");
                const data = await res.json();
                
                queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
                queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
                queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats/manager'] });
                
                const msg = [data.deletedShifts > 0 && `${data.deletedShifts} shifts`, data.deletedExceptions > 0 && `${data.deletedExceptions} exceptions`].filter(Boolean).join(' and ');
                toast.success(`Successfully deleted ${msg || '0 items'}.`);
                
                setBulkDeleteState(prev => ({ ...prev, isOpen: false, confirmation: '', isDeleting: false, deletionReason: '', preview: null }));
              } catch (e: any) {
                toast.error('Bulk delete failed.');
                setBulkDeleteState(prev => ({ ...prev, isDeleting: false }));
              }
            }}
          >
            {bulkDeleteState.isDeleting ? 'Deleting...' : 'Delete Items'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── BULK EXCEPTION CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={Boolean(bulkExceptionPreview?.isOpen)}
        onClose={() => setBulkExceptionPreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? '#1C1410' : '#FFF', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>📋</Box> Bulk Action Summary
        </DialogTitle>
        <DialogContent>
          {bulkExceptionPreview && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Review the following changes before proceeding. This will create multiple exception logs at once.
              </Alert>

              <Box sx={{ p: 2.5, bgcolor: isDark ? alpha('#F59E0B', 0.08) : alpha('#F59E0B', 0.05), border: '1px solid', borderColor: isDark ? alpha('#F59E0B', 0.2) : alpha('#F59E0B', 0.15), borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Employee</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.employeeName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Exception Type</Typography>
                    <Chip label={bulkExceptionPreview.type} size="small" color="warning" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Value</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.value}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Date Range</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.startDate} – {bulkExceptionPreview.endDate}</Typography>
                  </Box>
                  {bulkExceptionPreview.remarks && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" fontWeight={700}>Remarks</Typography>
                      <Typography variant="body2" sx={{ maxWidth: '60%', textAlign: 'right' }}>{bulkExceptionPreview.remarks}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: 2, bgcolor: isDark ? '#2A2018' : '#F8F5F0', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={800} color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ fontSize: '1.4rem' }}>⚡</Box>
                  {bulkExceptionPreview.dateCount} exception log{bulkExceptionPreview.dateCount > 1 ? 's' : ''} will be created
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  One {bulkExceptionPreview.type.toLowerCase()} entry per day for {bulkExceptionPreview.employeeName} from {bulkExceptionPreview.startDate} to {bulkExceptionPreview.endDate}.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBulkExceptionPreview(null)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={bulkExceptionPreview?.isProcessing}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
            onClick={async () => {
              if (!bulkExceptionPreview) return;
              setBulkExceptionPreview(prev => prev ? { ...prev, isProcessing: true } : null);

              let datesToLog: Date[] = [adjDate!];
              if (adjIsRange && adjEndDate && adjEndDate > adjDate!) {
                datesToLog = eachDayOfInterval({ start: adjDate!, end: adjEndDate });
              }

              let successCount = 0;
              let failCount = 0;

              for (const d of datesToLog) {
                if (!d) continue;
                try {
                  const res = await apiRequest("POST", "/api/adjustment-logs", {
                    employeeId: adjEmployeeId,
                    date: safeFormat(d, "yyyy-MM-dd"),
                    type: adjType,
                    value: adjValue,
                    remarks: adjRemarks,
                  });
                  if (res.ok) {
                    successCount++;
                  } else {
                    failCount++;
                  }
                } catch {
                  failCount++;
                }
              }

              queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });

              if (failCount === 0) {
                toast.success(`${successCount} exception log${successCount > 1 ? 's' : ''} created successfully`);
              } else {
                toast.warning(`${successCount} logged, ${failCount} failed out of ${datesToLog.length} days`);
              }

              setBulkExceptionPreview(null);
              setIsAdjustmentDialogOpen(false);
              setAdjValue("");
              setAdjRemarks("");
            }}
          >
            {bulkExceptionPreview?.isProcessing ? 'Creating...' : `Confirm & Create ${bulkExceptionPreview?.dateCount || 0} Logs`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── BULK CREATE CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={Boolean(bulkCreatePreview?.isOpen)}
        onClose={() => setBulkCreatePreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? '#1C1410' : '#FFF', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>📅</Box> Bulk Creation Summary
        </DialogTitle>
        <DialogContent>
          {bulkCreatePreview && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Review the scheduled shifts before proceeding. Overlapping shifts or time-off are automatically skipped.
              </Alert>

              <Box sx={{ p: 2, bgcolor: isDark ? '#2A2018' : '#F8F5F0', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {bulkCreatePreview.data.createCount} shift{bulkCreatePreview.data.createCount !== 1 ? 's' : ''} will be created
                </Typography>
                {bulkCreatePreview.data.skipCount > 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>
                    {bulkCreatePreview.data.skipCount} shift{bulkCreatePreview.data.skipCount !== 1 ? 's' : ''} will be skipped due to conflicts.
                  </Typography>
                )}
                
                {bulkCreatePreview.data.skippedDetails?.length > 0 && (
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    {bulkCreatePreview.data.skippedDetails.map((skip: any, i: number) => (
                      <li key={i}>
                        <Typography variant="caption" color="text.secondary">
                          {safeFormat(new Date(skip.date), 'MMM d, yyyy')}: {skip.reason}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBulkCreatePreview(null)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={bulkCreateMutation.isPending || !bulkCreatePreview?.data.createCount}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
            onClick={() => {
              if (!bulkCreatePreview) return;
              bulkCreateMutation.mutate({
                ...bulkCreatePreview.payload,
                confirm: true
              });
            }}
          >
            {bulkCreateMutation.isPending ? 'Creating...' : `Confirm & Create`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
