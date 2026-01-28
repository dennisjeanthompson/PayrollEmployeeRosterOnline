import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { EmployeeProfilePopover } from '@/components/schedule/EmployeeProfilePopover';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Card,
  CardContent,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemAvatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  People as PeopleIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Print as PrintIcon,
  WbSunny as MorningIcon,
  LightMode as AfternoonIcon,
  NightsStay as NightIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  History as HistoryIcon,
  ContentCopy as ContentCopyIcon,
  ContentPaste as ContentPasteIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  SwapHoriz as SwapIcon,
  EventAvailable as EventAvailableIcon,
  MoreVert as MoreVertIcon,
  BeachAccess as TimeOffIcon,
  AccessTime as ClockIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { Badge } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getCurrentUser, isManager as checkIsManager } from '@/lib/auth';
import { format, addDays, startOfWeek, endOfWeek, parseISO, differenceInMilliseconds, differenceInHours, areIntervalsOverlapping, setHours, setMinutes } from 'date-fns';

// React-Toastify for modern notifications
import { toast } from 'react-toastify';

// React-Datepicker for beautiful date selection (free MIT license)
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Mobile-responsive calendar styles
import '../styles/calendar-responsive.css';

// Real-time WebSocket updates for instant sync (2025 best practice)
import { useRealtime } from '@/hooks/use-realtime';

// ---Types ---
interface Shift {
  id: string;
  userId: string;
  branchId: string;
  position: string;
  startTime: string;
  endTime: string;
  title?: string;
  notes?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
    username?: string;
    position?: string;
    branchId?: string;
  };
}

interface TimeOff {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

interface TimeOffRequest {
  id: string;
  userId: string;
  userName?: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  requestedAt: string;
  approvedBy?: string;
  approvalDate?: string;
}

interface ShiftTrade {
  id: string;
  requesterId: string;
  targetUserId: string;
  shiftId: string;
  status: string; // 'pending' | 'accepted' | 'approved' | 'rejected'
  reason: string;
  createdAt: string;
  requester?: {
    firstName: string;
    lastName: string;
  };
  targetUser?: {
    firstName: string;
    lastName: string;
  };
  shift?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}


interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position?: string;
  branchId?: string;
  role?: string;
  username?: string;
  isActive?: boolean;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  year: number;
  workAllowed: boolean;
  notes: string | null;
  payRule?: { worked: string; notWorked: string };
}

// Holiday color mapping
const HOLIDAY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  regular: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', label: 'Regular Holiday' },
  special_non_working: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', label: 'Special Non-Working' },
  special_working: { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', label: 'Special Working' },
  company: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', label: 'Company Holiday' },
};

// Shift Templates
const SHIFT_TEMPLATES = {
  morning: { start: 7, end: 15, label: 'Morning (7AM-3PM)' },
  afternoon: { start: 15, end: 23, label: 'Afternoon (3PM-11PM)' },
  night: { start: 23, end: 7, label: 'Night (11PM-7AM)' },
};

// Employee color palette - 2025 modern colors
const EMPLOYEE_COLORS = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#10B981', text: '#FFFFFF' }, // Emerald
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Violet
  { bg: '#F59E0B', text: '#000000' }, // Amber
  { bg: '#EF4444', text: '#FFFFFF' }, // Red
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
  { bg: '#84CC16', text: '#000000' }, // Lime
  { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
  { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
];

const getEmployeeColor = (employeeId: string, employees: Employee[]) => {
  const index = employees.findIndex(e => e.id === employeeId);
  return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length] || EMPLOYEE_COLORS[0];
};

// --- PHILIPPINE-COMPLIANT TIME-OFF NOTICE POLICY ---
// Based on common Philippine company policies for SMEs/cafes
// These are soft warnings, not blocks - allows flexibility
const TIME_OFF_NOTICE_POLICY: Record<string, { minDays: number; label: string; description: string }> = {
  vacation: { 
    minDays: 7, 
    label: 'Vacation Leave',
    description: 'Recommended 7+ days advance notice'
  },
  sick: { 
    minDays: 3, 
    label: 'Sick Leave (Planned)',
    description: 'If planned, 3+ days recommended'
  },
  emergency: { 
    minDays: 0, 
    label: 'Emergency Leave',
    description: 'No advance notice required'
  },
  personal: { 
    minDays: 5, 
    label: 'Personal Leave',
    description: 'Recommended 5+ days advance notice'
  },
  other: { 
    minDays: 3, 
    label: 'Other',
    description: 'At least 3 days recommended'
  },
};

// Calculate days between today and start date
const calculateAdvanceNoticeDays = (startDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  return Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Check if notice is short based on policy
const isShortNotice = (type: string, startDateStr: string): { isShort: boolean; advanceDays: number; minDays: number } => {
  const advanceDays = calculateAdvanceNoticeDays(startDateStr);
  const policy = TIME_OFF_NOTICE_POLICY[type] || TIME_OFF_NOTICE_POLICY.other;
  return {
    isShort: advanceDays < policy.minDays,
    advanceDays,
    minDays: policy.minDays,
  };
};

// --- Enhanced Scheduler Component ---
const EnhancedScheduler = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const queryClient = useQueryClient();
  const calendarRef = useRef<any>(null);
  const rosterRef = useRef<HTMLDivElement>(null);

  // UNIFIED SCHEDULE: Current user and role detection
  const currentUser = getCurrentUser();
  const isManagerRole = checkIsManager();

  // 2025 BEST PRACTICE: Real-time WebSocket updates with toast notifications
  useRealtime({
    enabled: true,
    queryKeys: ['shifts', 'time-off-requests', 'shift-trades'],
    onEvent: (event, data) => {
      // Toast notifications for new requests (managers care most)
      if (event === 'time-off:created' && isManagerRole) {
        toast.info('📬 New time-off request received!', { autoClose: 4000 });
        queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      }
      if (event === 'trade:created') {
        // Both managers and target employees should see
        toast.info('🔄 New shift trade request!', { autoClose: 4000 });
        queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      }
      if (event === 'time-off:status-changed') {
        toast.success('✅ Time-off request updated!', { autoClose: 3000 });
        queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      }
      if (event === 'trade:status-changed') {
        toast.success('✅ Shift trade updated!', { autoClose: 3000 });
        queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      }
      // Shift changes
      if (['shift:created', 'shift:updated', 'shift:deleted'].includes(event)) {
        queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      }
    },
  });

  // UI State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [rosterOpen, setRosterOpen] = useState(true); // Open by default on desktop (responsive logic handles visibility)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [visibleRangeEnd, setVisibleRangeEnd] = useState(() => endOfWeek(new Date(), { weekStartsOn: 1 }));

  // Feature 6: Published Toggle
  const [isPublished, setIsPublished] = useState(false);

  // Sync sidebar state with screen size - make collapsed by default on mobile
  useEffect(() => {
    setRosterOpen(isDesktop);
  }, [isDesktop]);

  // AUTO-SCROLL TO TODAY: Scroll calendar to current time on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.scrollToTime('08:00:00'); // Scroll to 8 AM for better visibility
        calendarApi.gotoDate(new Date()); // Navigate to today
      }
    }, 500); // Small delay to ensure calendar is fully rendered
    return () => clearTimeout(timer);
  }, []);

  // RIGHT-CLICK CONTEXT MENU STATE
  const [shiftContextMenu, setShiftContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    shift: Shift | null;
  } | null>(null);

  // Close context menu
  const handleCloseContextMenu = useCallback(() => {
    setShiftContextMenu(null);
  }, []);

  // Feature 3: Time-Off Blocks (mock data - would come from API in production)
  const [timeOffBlocks] = useState<TimeOff[]>([
    // Example time-off blocks - replace with API data
  ]);

  // Clipboard State
  const [clipboardShift, setClipboardShift] = useState<Shift | null>(null);
  const [clipboardWeek, setClipboardWeek] = useState<Shift[] | null>(null);
  const [clipboardWeekStart, setClipboardWeekStart] = useState<Date | null>(null);

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [newShiftData, setNewShiftData] = useState({
    employeeId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // NEW: Employee Profile Popover State
  const [profilePopoverAnchor, setProfilePopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);

  // MOBILE: Tap-to-select employee for schedule assignment (2025 mobile UX best practice)
  const [mobileSelectedEmployee, setMobileSelectedEmployee] = useState<Employee | null>(null);

  // NEW: Role Filter State
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // NEW: View Mode Toggle with localStorage persistence (2025 best practice)
  const [viewMode, setViewMode] = useState<'timeline' | 'week' | 'list'>(() => {
    // Load saved preference or default based on device
    const saved = localStorage.getItem('schedule-view-mode');
    if (saved && ['timeline', 'week', 'list'].includes(saved)) {
      return saved as 'timeline' | 'week' | 'list';
    }
    return isDesktop ? 'timeline' : 'list';
  });
  
  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('schedule-view-mode', viewMode);
  }, [viewMode]);

  // MOBILE DETECTION: Auto-switch views for optimal mobile UX (2025 best practice)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile && viewMode === 'timeline') {
        // Mobile: Timeline not suitable, switch to Month view
        setViewMode('week');
        const api = calendarRef.current?.getApi();
        api?.changeView('dayGridMonth');
      }
    };
    
    // Initial check
    handleResize();
    
    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  
  // Auto-select best view for screen size on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const api = calendarRef.current?.getApi();
    
    if (isMobile) {
      // Mobile: Default to Month view (best readability)
      if (viewMode !== 'list') {
        api?.changeView('dayGridMonth');
      } else {
        api?.changeView('listWeek');
      }
    }
  }, []);


  // NEW: Minimum Staffing Threshold (configurable)
  const [minStaffingThreshold] = useState(2); // Minimum employees per time slot

  // NEW: Tools Menu State
  const [toolsMenuAnchor, setToolsMenuAnchor] = useState<HTMLElement | null>(null);

  // UNIFIED SCHEDULE: Time-Off Modal State
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOffRequest | null>(null);
  const [timeOffFormData, setTimeOffFormData] = useState({
    type: 'vacation',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  });

  // UNIFIED SCHEDULE: Shift Trading Modal State
  const [shiftTradeModalOpen, setShiftTradeModalOpen] = useState(false);
  const [shiftTradeFormData, setShiftTradeFormData] = useState({
    shiftId: '',
    targetUserId: '',
    reason: '',
  });
  
  // "+X MORE" MODAL: Show all events for a day (2025 best practice)
  const [dayEventsModalOpen, setDayEventsModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    date: Date;
    events: any[];
  } | null>(null);

  // UNIFIED SCHEDULE: Approval Modal State (for managers)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalType, setApprovalType] = useState<'time-off' | 'shift-trade'>('time-off');
  const [selectedTrade, setSelectedTrade] = useState<ShiftTrade | null>(null);

  // UNIFIED SCHEDULE: Event Filters
  const [showShifts, setShowShifts] = useState(true);
  const [showTimeOff, setShowTimeOff] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // UNIFIED SCHEDULE: Shift Context Menu (for quick actions)
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuShift, setContextMenuShift] = useState<Shift | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number, left: number } | null>(null);

  // Fetch Shifts
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{ shifts: Shift[] }>({
    queryKey: ['shifts', 'branch'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shifts/branch');
      return res.json();
    },
  });

  // Fetch Employees with reasonable real-time updates
  const { data: employeesData, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/employees');
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds (was 5 seconds - too aggressive)
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    staleTime: 15000, // Consider fresh for 15 seconds to avoid duplicate fetches
  });

  // Fetch Holidays for schedule overlay
  const { data: holidaysData } = useQuery<{ holidays: Holiday[] }>({
    queryKey: ['/api/holidays', { year: new Date().getFullYear() }],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/holidays?year=${new Date().getFullYear()}`);
      return res.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });
  const holidays = holidaysData?.holidays || [];

  // UNIFIED SCHEDULE: Fetch Time-Off Requests
  const { data: timeOffData } = useQuery<{ requests: TimeOffRequest[] }>({
    queryKey: ['time-off-requests'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/time-off-requests');
      return res.json();
    },
    staleTime: 30000, // Cache for 30 seconds
  });
  const timeOffRequests = timeOffData?.requests || [];

  // UNIFIED SCHEDULE: Fetch Shift Trades
  const { data: tradesData } = useQuery<{ trades: ShiftTrade[] }>({
    queryKey: ['shift-trades'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shift-trades');
      return res.json();
    },
    staleTime: 30000, // Cache for 30 seconds
  });
  const shiftTrades = tradesData?.trades || [];

  // Robustly handle API response format (array or object)
  const shifts = Array.isArray(shiftsData) ? shiftsData : (shiftsData?.shifts || []);
  const rawEmployees = Array.isArray(employeesData) ? employeesData : (employeesData?.employees || []);
  // Show ALL employees (active and inactive) - inactive ones will be visually distinguished
  const employees = rawEmployees;

  // NEW: Filter employees by role
  const filteredEmployees = useMemo(() => {
    if (roleFilter === 'all') return employees;
    return employees.filter(emp => 
      (emp.position || emp.role || '').toLowerCase().includes(roleFilter.toLowerCase())
    );
  }, [employees, roleFilter]);

  // NEW: Get unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    employees.forEach(emp => {
      const role = emp.position || emp.role;
      if (role) roles.add(role);
    });
    return Array.from(roles);
  }, [employees]);

  // 2025 BEST PRACTICE: Count pending requests for notification badge
  const pendingRequestsCount = useMemo(() => {
    const pendingTimeOff = timeOffRequests.filter(r => r.status === 'pending').length;
    const pendingTrades = shiftTrades.filter(t => t.status === 'pending').length;
    return pendingTimeOff + pendingTrades;
  }, [timeOffRequests, shiftTrades]);

  // NEW: Transform employees to FullCalendar resources for timeline view
  const calendarResources = useMemo(() => {
    return filteredEmployees.map((emp, index) => {
      const colors = EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
      return {
        id: emp.id,
        title: `${emp.firstName} ${emp.lastName}`,
        extendedProps: {
          position: emp.position,
          role: emp.role,
          isActive: emp.isActive,
          color: colors,
          employee: emp,
        },
      };
    });
  }, [filteredEmployees]);

  // NEW: Calculate daily hours per column for summary footer
  const dailyHoursSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    shifts.forEach(shift => {
      const day = format(new Date(shift.startTime), 'yyyy-MM-dd');
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      summary[day] = (summary[day] || 0) + hours;
    });
    return summary;
  }, [shifts]);

  // NEW: Coverage gap detection - find understaffed time slots
  const coverageGaps = useMemo(() => {
    const gaps: Array<{ start: Date; end: Date; staffCount: number }> = [];
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    // Check each hour of the week
    for (let d = new Date(currentWeekStart); d <= weekEnd; d = addDays(d, 1)) {
      for (let hour = 6; hour < 22; hour++) { // Operating hours 6AM-10PM
        const slotStart = setHours(setMinutes(d, 0), hour);
        const slotEnd = setHours(setMinutes(d, 0), hour + 1);
        
        const staffCount = shifts.filter(shift => {
          const shiftStart = new Date(shift.startTime);
          const shiftEnd = new Date(shift.endTime);
          return areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            { start: shiftStart, end: shiftEnd }
          );
        }).length;
        
        if (staffCount < minStaffingThreshold) {
          gaps.push({ start: slotStart, end: slotEnd, staffCount });
        }
      }
    }
    return gaps;
  }, [shifts, currentWeekStart, minStaffingThreshold]);

  // FIXED: Responsive event content rendering
  const renderEventContent = useCallback((arg: any) => {
    const { event } = arg;
    const isMobile = !isDesktop;
  
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '2px 4px',
        fontSize: isMobile ? '0.65rem' : '0.75rem',
        overflow: 'hidden',
      }}>
        <div style={{
          fontWeight: '600',
          whiteSpace: 'normal', // ← CRITICAL: allow wrapping
          wordBreak: 'break-word', // ← break long words
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2, // max 2 lines
          WebkitBoxOrient: 'vertical',
        }}>
          {event.title}
        </div>
        <div style={{
          fontSize: '0.65rem',
          opacity: 0.8,
          marginTop: '2px',
        }}>
          {format(new Date(event.start!), 'h:mm a')}
          {event.end && ` - ${format(new Date(event.end), 'h:mm a')}`}
        </div>
      </div>
    );
  }, [isDesktop]);

  // Feature 2: Overlap Detection
  const checkOverlap = useCallback((employeeId: string, startTime: string, endTime: string, excludeShiftId?: string): boolean => {
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    
    return shifts.some(shift => {
      if (shift.userId !== employeeId) return false;
      if (excludeShiftId && shift.id === excludeShiftId) return false;
      
      const existingStart = new Date(shift.startTime);
      const existingEnd = new Date(shift.endTime);
      
      return areIntervalsOverlapping(
        { start: newStart, end: newEnd },
        { start: existingStart, end: existingEnd }
      );
    });
  }, [shifts]);

  // Check if a date falls on a work-restricted holiday
  const isDateBlocked = useCallback((date: Date): { blocked: boolean; holiday?: Holiday } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const holiday = holidays.find(h => {
      const holidayDate = format(new Date(h.date), 'yyyy-MM-dd');
      return holidayDate === dateStr && !h.workAllowed;
    });
    return { blocked: !!holiday, holiday };
  }, [holidays]);

  // Feature 5: Weekly Hours Summary
  const weeklyHoursSummary = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= currentWeekStart && shiftDate <= weekEnd;
    });

    const employeeHours: Record<string, { name: string; hours: number }> = {};
    let totalHours = 0;

    weekShifts.forEach(shift => {
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      totalHours += hours;

      const empId = shift.userId;
      if (!employeeHours[empId]) {
        const emp = employees.find(e => e.id === empId);
        employeeHours[empId] = {
          name: emp ? `${emp.firstName}` : 'Unknown',
          hours: 0,
        };
      }
      employeeHours[empId].hours += hours;
    });

    return {
      byEmployee: Object.values(employeeHours).sort((a, b) => b.hours - a.hours).slice(0, 5),
      total: totalHours,
    };
  }, [shifts, employees, currentWeekStart]);

  // Mutations
  const createShiftMutation = useMutation({
    mutationFn: async (payload: { userId: string; startTime: string; endTime: string; branchId: string; position: string; notes?: string }) => {
      const res = await apiRequest('POST', '/api/shifts', payload);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create shift');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('✅ Shift created!');
      setCreateModalOpen(false);
      resetNewShiftData();
      setOverlapWarning(null);
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (payload: { id: string; startTime?: string; endTime?: string; notes?: string }) => {
      const { id, ...data } = payload;
      const res = await apiRequest('PUT', `/api/shifts/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update shift');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      toast.success('✅ Shift updated!');
      setEditModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const res = await apiRequest('DELETE', `/api/shifts/${shiftId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete shift');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
      setSnackbar({ open: true, message: 'Shift deleted!', severity: 'success' });
      setDeleteConfirmOpen(false);
      setSelectedShift(null);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // UNIFIED SCHEDULE: Time-Off Request Mutations
  const createTimeOffMutation = useMutation({
    mutationFn: async (data: typeof timeOffFormData) => {
      // Check for short notice and warn (but don't block - Philippine-compliant)
      const noticeCheck = isShortNotice(data.type, data.startDate);
      if (noticeCheck.isShort && data.type !== 'emergency') {
        toast.warning(
          `⚠️ Short notice (${noticeCheck.advanceDays} days). Recommended: ${noticeCheck.minDays}+ days. Manager may deny.`,
          { autoClose: 5000 }
        );
      }
      
      // Emergency leave notification
      if (data.type === 'emergency') {
        toast.info('🚨 Emergency leave - no advance notice required');
      }

      // Ensure dates are in ISO format (YYYY-MM-DD) for backend validation
      const payload = {
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
      };
      console.log('📤 Sending time-off request:', payload);
      const res = await apiRequest('POST', '/api/time-off-requests', payload);
      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Time-off request error:', error);
        throw new Error(error.message || 'Failed to create time-off request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('✅ Time-off request submitted!');
      setTimeOffModalOpen(false);
      setTimeOffFormData({
        type: 'vacation',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
      });
    },
    onError: (error: Error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const updateTimeOffMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status?: string }) => {
      const endpoint = status 
        ? `/api/time-off-requests/${id}/approve` 
        : `/api/time-off-requests/${id}`;
      const res = await apiRequest('PUT', endpoint, status ? { status } : timeOffFormData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update time-off request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      setSnackbar({ open: true, message: 'Time-off request updated!', severity: 'success' });
      setTimeOffModalOpen(false);
      setApprovalModalOpen(false);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiRequest('DELETE', `/api/time-off-requests/${requestId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete time-off request');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      setSnackbar({ open: true, message: 'Time-off request deleted!', severity: 'success' });
      setTimeOffModalOpen(false);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // UNIFIED SCHEDULE: Shift Trade Mutations with Optimistic Updates
  const createShiftTradeMutation = useMutation({
    mutationFn: async (data: typeof shiftTradeFormData) =>{
      const res = await apiRequest('POST', '/api/shift-trades', data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create shift trade request');
      }
      return res.json();
    },
    onMutate: async (newTradeData) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['shift-trades'] });
      
      // Snapshot previous value for rollback
      const previousTrades = queryClient.getQueryData(['shift-trades']);
      
      // Optimistically update with temporary trade
      const selectedShift = shifts.find(s => s.id === newTradeData.shiftId);
      const targetEmployee = employees.find(e => e.id === newTradeData.targetUserId);
      
      const optimisticTrade = {
        id: `temp-${Date.now()}`, // Temporary ID
        requesterId: currentUser?.id || '',
        targetUserId: newTradeData.targetUserId || '',
        shiftId: newTradeData.shiftId,
        status: 'pending',
        reason: newTradeData.reason,
        createdAt: new Date().toISOString(),
        requester: currentUser ? {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        } : undefined,
        targetUser: targetEmployee ? {
          firstName: targetEmployee.firstName,
          lastName: targetEmployee.lastName,
        } : undefined,
        shift: selectedShift ? {
          date: selectedShift.startTime ? new Date(selectedShift.startTime).toISOString().split('T')[0] : '',
          startTime: selectedShift.startTime || '',
          endTime: selectedShift.endTime || '',
        } : undefined,
      };
      
      queryClient.setQueryData(['shift-trades'], (old: any) => ({
        ...old,
        trades: [...(old?.trades || []), optimisticTrade],
      }));
      
      // Show immediate feedback
      setSnackbar({ 
        open: true, 
        message: '📤 Sending trade request...', 
        severity: 'info' 
      });
      
      return { previousTrades };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setSnackbar({ 
        open: true, 
        message: '✅ Shift trade request submitted!', 
        severity: 'success' 
      });
      setShiftTradeModalOpen(false);
      setShiftTradeFormData({ shiftId: '', targetUserId: '', reason: '' });
    },
    onError: (error: Error, _, context) => {
      // Rollback optimistic update
      if (context?.previousTrades) {
        queryClient.setQueryData(['shift-trades'], context.previousTrades);
      }
      setSnackbar({ 
        open: true, 
        message: `❌ ${error.message}`, 
        severity: 'error' 
      });
    },
    onSettled: () => {
      // Always refetch after mutation settles to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
    },
  });

  const respondToTradeMutation = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const res = await apiRequest('PATCH', `/api/shift-trades/${id}`, {
        status: accept ? 'accepted' : 'rejected',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to respond to trade');
      }
      return res.json();
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      setSnackbar({ 
        open: true, 
        message: accept ? 'Trade accepted!' : 'Trade rejected!', 
        severity: 'success' 
      });
      setApprovalModalOpen(false);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  const approveTradeAsManagerMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const res = await apiRequest('PATCH', `/api/shift-trades/${id}/approve`, {
        status: approve ? 'approved' : 'rejected',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to approve trade');
      }
      return res.json();
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['shift-trades'] });
      setSnackbar({ 
        open: true, 
        message: approve ? 'Trade approved!' : 'Trade rejected!', 
        severity: 'success' 
      });
      setApprovalModalOpen(false);
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });


  // Helper Functions
  const resetNewShiftData = () => {
    setNewShiftData({ employeeId: '', startTime: '', endTime: '', notes: '' });
    setOverlapWarning(null);
  };

  const getEmployeeName = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  const getEmployeeRole = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp?.role || '';
  };

  // Feature 4: Apply Shift Template
  const applyShiftTemplate = useCallback((template: keyof typeof SHIFT_TEMPLATES) => {
    const { start, end } = SHIFT_TEMPLATES[template];
    const today = new Date();
    
    let startDate = setMinutes(setHours(today, start), 0);
    let endDate = setMinutes(setHours(today, end), 0);
    
    // Handle overnight shifts
    if (end < start) {
      endDate = addDays(endDate, 1);
    }

    setNewShiftData(prev => ({
      ...prev,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    }));
    setCreateModalOpen(true);
  }, []);

  // Feature 7: Print Handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Map shifts to FullCalendar events with employee color-coding
  const calendarEvents = useMemo(() => {
    const shiftEvents = shifts.map(shift => {
      const colors = getEmployeeColor(shift.userId, employees);
      const empName = shift.user 
        ? `${shift.user.firstName} ${shift.user.lastName}` 
        : getEmployeeName(shift.userId);
      const role = shift.user?.role || getEmployeeRole(shift.userId);
      
      return {
        id: shift.id,
        resourceId: shift.userId, // NEW: Link to resource for timeline view
        title: viewMode === 'timeline' 
          ? format(new Date(shift.startTime), 'h:mm a') + ' - ' + format(new Date(shift.endTime), 'h:mm a')
          : `${empName}${role ? ` • ${role}` : ''}`,
        start: shift.startTime,
        end: shift.endTime,
        backgroundColor: colors.bg,
        borderColor: colors.bg,
        textColor: colors.text,
        extendedProps: { shift, employeeId: shift.userId, type: 'shift' },
      };
    });

    // Feature 3: Add Time-Off blocks (LEGACY - kept for backwards compatibility)
    const timeOffEvents = timeOffBlocks.map(to => ({
      id: `timeoff-${to.id}`,
      resourceId: to.userId, // NEW: Link to resource
      title: `🚫 Time Off${to.reason ? `: ${to.reason}` : ''}`,
      start: to.startTime,
      end: to.endTime,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#FFFFFF',
      editable: false,
      extendedProps: { type: 'timeoff', timeOff: to },
    }));

    // UNIFIED SCHEDULE: Approved Time-Off (semi-transparent overlay)
    const approvedTimeOffEvents = timeOffRequests
      .filter(req => req.status === 'approved')
      .map(req => ({
        id: `timeoff-approved-${req.id}`,
        resourceId: req.userId,
        // MOBILE FIX: Shorter title
        title: isDesktop 
          ? `🏖️ ${req.userName || 'Time Off'} - ${req.type}` 
          : `🏖️ ${req.type}`,
        start: req.startDate,
        end: req.endDate,
        display: 'background' as const,
        backgroundColor: 'rgba(59, 130, 246, 0.15)', // Blue semi-transparent
        borderColor: '#3b82f6',
        classNames: ['time-off-approved'],
        editable: false,
        extendedProps: { type: 'time-off-approved', timeOff: req },
      }));

    // UNIFIED SCHEDULE: Pending Time-Off (dashed/striped)
    const pendingTimeOffEvents = timeOffRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        id: `timeoff-pending-${req.id}`,
        resourceId: req.userId,
        // MOBILE FIX: Shorter title
        title: isDesktop
          ? `⚠️ ${req.userName || 'Pending'} - ${req.type} (Pending)`
          : `⚠️ ${req.type}`,
        start: req.startDate,
        end: req.endDate,
        backgroundColor: '#F59E0B', // Orange
        borderColor: '#F59E0B',
        textColor: '#000000',
        classNames: ['time-off-pending'],
        editable: false,
        extendedProps: { type: 'time-off-pending', timeOff: req },
      }));

    // UNIFIED SCHEDULE: Shift Trades (special border + tooltip)
    const tradeEvents = shiftTrades
      .filter(trade => trade.status === 'pending' || trade.status === 'accepted')
      .map(trade => {
        const shift = shifts.find(s => s.id === trade.shiftId);
        if (!shift) return null;

        const colors = getEmployeeColor(shift.userId, employees);
        const tradeColor = trade.status === 'accepted' ? '#06B6D4' : '#F59E0B'; // Cyan vs Orange
        
        return {
          id: `trade-${trade.id}`,
          resourceId: shift.userId,
          // MOBILE FIX: Shorter title to prevent cramping
          title: isDesktop
            ? `🔄 Trade ${trade.status === 'accepted' ? 'Accepted' : 'Pending'}`
            : (trade.status === 'accepted' ? '🔄 Acc' : '🔄 Pend'),
          start: shift.startTime,
          end: shift.endTime,
          backgroundColor: colors.bg,
          borderColor: tradeColor,
          borderWidth: '3px',
          textColor: colors.text,
          classNames: ['shift-trade'],
          editable: false,
          extendedProps: {
            type: 'shift-trade',
            trade,
            shift,
            tooltip: `Trade: ${trade.requester?.firstName} → ${trade.targetUser?.firstName} (${trade.status})`
          },
        };
      })
      .filter(Boolean);

    // Holiday background events with color-coding by type
    const holidayEvents = holidays.map(holiday => {
      const colors = HOLIDAY_COLORS[holiday.type] || HOLIDAY_COLORS.company;
      const isBlocked = !holiday.workAllowed;
      
      return {
        id: `holiday-${holiday.id}`,
        title: `${isBlocked ? '🚫 ' : '📅 '}${holiday.name}`,
        start: new Date(holiday.date).toISOString().split('T')[0],
        allDay: true,
        display: 'background',
        backgroundColor: isBlocked ? 'rgba(107, 114, 128, 0.2)' : colors.bg,
        borderColor: isBlocked ? '#6b7280' : colors.border,
        classNames: isBlocked ? ['holiday-blocked'] : ['holiday-bg'],
        extendedProps: { 
          type: 'holiday', 
          holiday,
          isBlocked,
          payRule: holiday.payRule?.worked || colors.label,
        },
      };
    });

    // Coverage gap events removed - too noisy for production use
    // Could be re-enabled as an optional toggle in settings

    // Filter and combine based on visibility toggles
    const allEvents = [
      ...(showShifts ? shiftEvents : []),
      ...(showTimeOff ? [...approvedTimeOffEvents, ...pendingTimeOffEvents] : []),
      ...(showTrades ? tradeEvents : []),
      ...(showHolidays ? holidayEvents : []),
    ];

    return allEvents as EventInput[];
  }, [shifts, employees, timeOffBlocks, timeOffRequests, shiftTrades, holidays, viewMode, showShifts, showTimeOff, showTrades, showHolidays, isDesktop]);

  // FullCalendar Event Handlers
  const handleEventDrop = useCallback(async (info: any) => {
    if (isPublished) {
      setSnackbar({ open: true, message: 'Switch to Draft mode to edit the schedule', severity: 'warning' });
      info.revert();
      return;
    }

    const { event } = info;
    if (event.extendedProps.type === 'timeoff') {
      info.revert();
      return;
    }

    // Feature 2: Check overlap on drop
    const employeeId = event.extendedProps.employeeId;
    if (checkOverlap(employeeId, event.startStr, event.endStr, event.id)) {
      setSnackbar({ open: true, message: '⚠️ Overlap detected with existing shift!', severity: 'warning' });
      info.revert();
      return;
    }

    try {
      await updateShiftMutation.mutateAsync({
        id: event.id,
        startTime: event.startStr,
        endTime: event.endStr,
      });
    } catch (error) {
      // Revert the change on the calendar UI if the server update fails
      info.revert();
    }
  }, [updateShiftMutation, checkOverlap, isPublished]);

  const handleEventResize = useCallback(async (info: any) => {
    if (isPublished) {
      setSnackbar({ open: true, message: 'Switch to Draft mode to edit the schedule', severity: 'warning' });
      info.revert();
      return;
    }

    const { event } = info;
    if (event.extendedProps.type === 'timeoff') {
      info.revert();
      return;
    }

    // Feature 2: Check overlap on resize
    const employeeId = event.extendedProps.employeeId;
    if (checkOverlap(employeeId, event.startStr, event.endStr, event.id)) {
      setSnackbar({ open: true, message: '⚠️ Overlap detected with existing shift!', severity: 'warning' });
      info.revert();
      return;
    }

    try {
      await updateShiftMutation.mutateAsync({
        id: event.id,
        startTime: event.startStr,
        endTime: event.endStr,
      });
    } catch (error) {
       info.revert();
    }
  }, [updateShiftMutation, checkOverlap, isPublished]);

  // UNIFIED SCHEDULE: Enhanced Event Click Handler with Role-Based Logic
  const handleEventClick = useCallback((info: any) => {
    const { type, shift, timeOff, trade } = info.event.extendedProps;
    
    // Legacy time-off blocks (backward compatibility)
    if (type === 'timeoff') {
      setSnackbar({ open: true, message: 'Time-off blocks cannot be edited here', severity: 'info' });
      return;
    }

    // Holiday events - just show info
    if (type === 'holiday') {
      const holiday = info.event.extendedProps.holiday;
      setSnackbar({ 
        open: true, 
        message: `${holiday.name} - ${holiday.workAllowed ? 'Work allowed' : 'No work allowed'}`, 
        severity: 'info' 
      });
      return;
    }

    // APPROVED TIME-OFF: View only (semi-transparent background events)
    if (type === 'time-off-approved') {
      setSnackbar({ 
        open: true, 
        message: `Approved time-off: ${timeOff.type} (${timeOff.userName || 'Employee'})`, 
        severity: 'info' 
      });
      return;
    }

    // PENDING TIME-OFF: Different actions for employees vs managers
    if (type === 'time-off-pending') {
      const isOwnRequest = timeOff.userId === currentUser?.id;
      
      if (isManagerRole) {
        // Manager can approve/reject
        setSelectedTimeOff(timeOff);
        setApprovalType('time-off');
        setApprovalModalOpen(true);
      } else if (isOwnRequest) {
        // Employee can edit/delete own pending request
        setSelectedTimeOff(timeOff);
        setTimeOffFormData({
          type: timeOff.type,
          startDate: timeOff.startDate.split('T')[0],
          endDate: timeOff.endDate.split('T')[0],
          reason: timeOff.reason,
        });
        setTimeOffModalOpen(true);
      } else {
        setSnackbar({ open: true, message: 'Pending time-off request', severity: 'info' });
      }
      return;
    }

    // SHIFT TRADE: Different actions for involved parties vs managers
    if (type === 'shift-trade') {
      const isRequester = trade.requesterId === currentUser?.id;
      const isTarget = trade.targetUserId === currentUser?.id;
      
      if (isManagerRole && trade.status === 'accepted') {
        // Manager can approve accepted trades
        setSelectedTrade(trade);
        setApprovalType('shift-trade');
        setApprovalModalOpen(true);
      } else if (isTarget && trade.status === 'pending') {
        // Target user can accept/reject pending trade
        setSelectedTrade(trade);
        setApprovalType('shift-trade');
        setApprovalModalOpen(true);
      } else {
        setSnackbar({ 
          open: true, 
          message: `Shift trade: ${trade.status} (${trade.requester?.firstName} → ${trade.targetUser?.firstName})`, 
          severity: 'info' 
        });
      }
      return;
    }

    // REGULAR SHIFT: Different logic for employees vs managers
    if (type === 'shift') {
      if (isPublished) {
        setSnackbar({ open: true, message: 'Switch to Draft mode to edit the schedule', severity: 'warning' });
        return;
      }

      const isOwnShift = shift.userId === currentUser?.id;
      
      // Employees clicking own shift: Open trade modal
      if (!isManagerRole && isOwnShift) {
        setShiftTradeFormData({
          shiftId: shift.id,
          targetUserId: '',
          reason: '',
        });
        setShiftTradeModalOpen(true);
        return;
      }

      // Managers or other shifts: Edit modal
      if (isManagerRole) {
        setSelectedShift(shift);
        setEditModalOpen(true);
      }
      return;
    }

    // Fallback
    setSnackbar({ open: true, message: 'Event clicked', severity: 'info' });
  }, [isPublished, isManagerRole, currentUser]);

  // Feature 1: Drag-to-create (using select) - ENHANCED FOR EMPLOYEE ACTIONS
  // Employee Calendar Click Action State
  const [calendarActionMenu, setCalendarActionMenu] = useState<{
    mouseX: number;
    mouseY: number;
    date: Date;
    employeeId: string;
  } | null>(null);

  const handleDateSelect = useCallback((info: any) => {
    // Check if date falls on a work-restricted holiday
    const { blocked, holiday } = isDateBlocked(new Date(info.startStr));
    if (blocked && holiday) {
      toast.error(`🚫 ${holiday.name} - work not allowed on this holiday`);
      return;
    }

    // In resourceTimeline view, info.resource contains the employee row
    // MOBILE FIX: Use mobileSelectedEmployee if no resource (tap-to-select workflow)
    let employeeId = info.resource?.id || '';
    
    if (!employeeId && !isDesktop && mobileSelectedEmployee) {
      // Mobile: Use tap-selected employee
      employeeId = mobileSelectedEmployee.id;
    }
    
    const isOwnRow = employeeId === currentUser?.id;
    const selectedDate = new Date(info.startStr);

    // EMPLOYEE CLICK: Show contextual action menu
    if (!isManagerRole) {
      // Pre-fill time-off form with selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setTimeOffFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
      }));
      
      // Show the time-off modal directly for employees
      setTimeOffModalOpen(true);
      toast.info('📅 Select your time-off dates');
      return;
    }

    // MANAGER: Create shift (existing behavior)
    if (isPublished) {
      toast.warning('Switch to Draft mode to create shifts');
      return;
    }

    // MOBILE: If no employee selected, prompt user
    if (!employeeId && !isDesktop) {
      toast.info('👆 First tap an employee from the roster, then tap a date');
      return;
    }

    setNewShiftData(prev => ({
      ...prev,
      employeeId: employeeId,
      startTime: info.startStr,
      endTime: info.endStr,
    }));
    setCreateModalOpen(true);
    
    // Clear mobile selection after use
    if (!isDesktop && mobileSelectedEmployee) {
      setMobileSelectedEmployee(null);
    }
  }, [isPublished, isDateBlocked, isManagerRole, currentUser, isDesktop, mobileSelectedEmployee]);

  // Handle external event receive (when create: true)
  const handleEventReceive = useCallback((info: any) => {
    // Remove the temporary event immediately - we want to use our modal
    info.event.remove();

    if (isPublished) {
      setSnackbar({ open: true, message: 'Switch to Draft mode to create shifts', severity: 'warning' });
      return;
    }

    const { event } = info;
    const start = event.startStr;

    if (start) {
      const startDate = new Date(start);
      
      // Check if date falls on a work-restricted holiday
      const { blocked, holiday } = isDateBlocked(startDate);
      if (blocked && holiday) {
        setSnackbar({ 
          open: true, 
          message: `🚫 Cannot schedule shifts on ${holiday.name} - work not allowed on this holiday`, 
          severity: 'error' 
        });
        return;
      }
      
      // Get employee from the event props (passed from Draggable)
      // OR from the resource if available (timeline view)
      let employeeId = event.extendedProps.employeeId;
      
      // If no employee ID in props (fallback), check resource
      if (!employeeId && event.getResources().length > 0) {
        employeeId = event.getResources()[0].id;
      }

      if (!employeeId) {
         setSnackbar({ open: true, message: 'Could not determine employee for this shift', severity: 'error' });
         return;
      }

      // Default to 8-hour shift from start time
      const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000);
      
      setNewShiftData({
        employeeId: employeeId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        notes: '',
      });
      setCreateModalOpen(true);
    }
  }, [isPublished, isDateBlocked]);

  // Initialize external draggable for employee roster
  useEffect(() => {
    if (rosterRef.current && rosterOpen) {
      const draggable = new Draggable(rosterRef.current, {
        itemSelector: '.draggable-employee',
        eventData: (eventEl) => {
          const empData = eventEl.getAttribute('data-employee');
          const emp = empData ? JSON.parse(empData) : null;
          const displayName = emp ? `${emp.firstName} ${emp.lastName}` : 'New Shift';
          const position = emp?.position || emp?.role || '';
          return {
            title: position ? `${displayName} • ${position}` : displayName,
            duration: '08:00', // 8-hour default shift
            create: true, // Let FullCalendar create the event, then we handle in eventReceive
            backgroundColor: '#10B981',
            borderColor: 'rgba(16, 185, 129, 0.6)',
            textColor: '#ffffff',
            classNames: ['drag-preview-shift'],
            extendedProps: {
              employeeId: emp?.id,
              employee: emp,
            },
          };
        },
      });
      return () => draggable.destroy();
      }
    }, [rosterOpen, employees, isDesktop]);

  // Copy/Paste Shift Functions
  const handleCopyShift = useCallback((shift: Shift) => {
    setClipboardShift(shift);
    setSnackbar({ open: true, message: 'Shift copied! Click a time slot to paste.', severity: 'info' });
  }, []);

  const handlePasteShift = useCallback((start: Date) => {
    if (!clipboardShift) return;
    if (!isManagerRole) return; // SECURITY: Only managers can paste/create shifts

    const originalStart = new Date(clipboardShift.startTime);
    const originalEnd = new Date(clipboardShift.endTime);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    const newStart = start;
    const newEnd = new Date(newStart.getTime() + duration);

    createShiftMutation.mutate({
      userId: clipboardShift.userId,
      branchId: clipboardShift.branchId,
      position: clipboardShift.position || 'Staff',
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
      notes: clipboardShift.notes,
    });
  }, [clipboardShift, createShiftMutation, isManagerRole]);

  // Copy Week Functions
  const handleClearWeek = useCallback(async () => {
    if (!isManagerRole) return; // SECURITY: Only managers can clear week

    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= currentWeekStart && shiftDate <= weekEnd;
    });

    if (weekShifts.length === 0) {
      setSnackbar({ open: true, message: 'Week is already empty.', severity: 'info' });
      return;
    }

    if (!window.confirm(`Are you sure you want to clear ${weekShifts.length} shifts from this week? This cannot be undone.`)) {
      return;
    }

    setSnackbar({ open: true, message: `Clearing ${weekShifts.length} shifts...`, severity: 'info' });

    let deletedCount = 0;
    // Execute sequentially to avoid overwhelming server/rate limits
    for (const shift of weekShifts) {
      try {
         await deleteShiftMutation.mutateAsync(shift.id);
         deletedCount++;
      } catch (err) {
        console.error("Failed to delete shift during clear", shift.id, err);
      }
    }

    setSnackbar({ 
      open: true, 
      message: `Cleared ${deletedCount} shifts.`, 
      severity: 'success' 
    });
    // Invalidate once at the end (mutation does it, but purely for safety)
    queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });

  }, [shifts, currentWeekStart, deleteShiftMutation, queryClient]);

  const handleCopyPreviousWeek = useCallback(async () => {
    const prevWeekStart = addDays(currentWeekStart, -7);
    const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });
    
    try {
      const prevShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate >= prevWeekStart && shiftDate <= prevWeekEnd;
      });

      if (prevShifts.length === 0) {
        // Fallback: Fetch from API if local cache misses (robustness)
        const res = await apiRequest('GET', `/api/shifts/branch?start=${prevWeekStart.toISOString()}&end=${prevWeekEnd.toISOString()}`);
        if (res.ok) {
           const data = await res.json();
           const fetchedShifts = data.shifts || [];
           if (fetchedShifts.length > 0) {
              setClipboardWeek(fetchedShifts);
              setClipboardWeekStart(prevWeekStart);
              setSnackbar({ 
                open: true, 
                message: `Fetched & Copied ${fetchedShifts.length} shifts from previous week! Click Paste to apply.`, 
                severity: 'success' 
              });
              return;
           }
        }

        setSnackbar({ 
          open: true, 
          message: `No shifts found in previous week (${format(prevWeekStart, 'MMM d')}).`, 
          severity: 'warning' 
        });
        return;
      }

      setClipboardWeek(prevShifts);
      setClipboardWeekStart(prevWeekStart);
      setSnackbar({ 
        open: true, 
        message: `Copied ${prevShifts.length} shifts from previous week! Click Paste to apply.`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error("Failed to copy previous week", error);
      setSnackbar({ open: true, message: 'Failed to fetch previous week data.', severity: 'error' });
    }
  }, [shifts, currentWeekStart]);

  const handleCopyWeek = useCallback(() => {
    // Use the actual visible range from the calendar instead of week calculation
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= currentWeekStart && shiftDate <= visibleRangeEnd;
    });
    
    if (weekShifts.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'No shifts found in the visible date range to copy.', 
        severity: 'warning' 
      });
      return;
    }
    
    setClipboardWeek(weekShifts);
    setClipboardWeekStart(currentWeekStart);
    setSnackbar({ 
      open: true, 
      message: `Copied ${weekShifts.length} shifts from ${format(currentWeekStart, 'MMM d')} - ${format(visibleRangeEnd, 'MMM d')}! Navigate to target week and click Paste Week.`, 
      severity: 'info' 
    });
  }, [shifts, currentWeekStart, visibleRangeEnd]);

  const handlePasteWeek = useCallback(async () => {
    if (!clipboardWeek || !clipboardWeekStart) {
      setSnackbar({ open: true, message: 'No week copied!', severity: 'error' });
      return;
    }

    const daysDiff = differenceInMilliseconds(currentWeekStart, clipboardWeekStart);
    
    setSnackbar({ open: true, message: `Pasting ${clipboardWeek.length} shifts...`, severity: 'info' });

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const shift of clipboardWeek) {
      const newStart = new Date(new Date(shift.startTime).getTime() + daysDiff);
      const newEnd = new Date(new Date(shift.endTime).getTime() + daysDiff);
      
      // Check for overlap before creating
      const hasOverlap = checkOverlap(shift.userId, newStart.toISOString(), newEnd.toISOString());
      
      if (hasOverlap) {
        skippedCount++;
        continue; // Skip this shift due to overlap
      }

      try {
        await createShiftMutation.mutateAsync({
          userId: shift.userId,
          branchId: shift.branchId,
          position: shift.position || 'Staff',
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          notes: shift.notes,
        });
        successCount++;
      } catch (error) {
        // Handle server-side conflict detection (e.g., 409 status)
        errorCount++;
        console.warn('Failed to paste shift:', error);
      }
    }

    // Show summary message
    if (skippedCount > 0 || errorCount > 0) {
      const parts = [];
      if (successCount > 0) parts.push(`${successCount} created`);
      if (skippedCount > 0) parts.push(`${skippedCount} skipped (conflicts)`);
      if (errorCount > 0) parts.push(`${errorCount} failed`);
      setSnackbar({ 
        open: true, 
        message: `Week paste complete: ${parts.join(', ')}`, 
        severity: skippedCount > 0 || errorCount > 0 ? 'warning' : 'success' 
      });
    } else {
      setSnackbar({ open: true, message: `Week pasted successfully! ${successCount} shifts created.`, severity: 'success' });
    }
    
    // Refresh shifts data
    queryClient.invalidateQueries({ queryKey: ['shifts', 'branch'] });
  }, [clipboardWeek, clipboardWeekStart, currentWeekStart, createShiftMutation, checkOverlap, queryClient]);

  // Feature 2: Check overlap when creating/editing
  useEffect(() => {
    if (newShiftData.employeeId && newShiftData.startTime && newShiftData.endTime) {
      const hasOverlap = checkOverlap(newShiftData.employeeId, newShiftData.startTime, newShiftData.endTime);
      setOverlapWarning(hasOverlap ? 'This shift overlaps with an existing shift for this employee!' : null);
    } else {
      setOverlapWarning(null);
    }
  }, [newShiftData.employeeId, newShiftData.startTime, newShiftData.endTime, checkOverlap]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c' && selectedShift) {
        e.preventDefault();
        handleCopyShift(selectedShift);
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShift, handleCopyShift, handlePrint]);

  // Track calendar date changes - store both start and end of visible range
  const handleDatesSet = useCallback((info: any) => {
    // Use info.start and info.end directly as the visible range
    // info.start is the first visible date, info.end is the day after the last visible date
    const rangeStart = new Date(info.start);
    const rangeEnd = new Date(info.end);
    rangeEnd.setDate(rangeEnd.getDate() - 1); // Adjust since info.end is exclusive
    rangeEnd.setHours(23, 59, 59, 999);
    
    setCurrentWeekStart(rangeStart);
    setVisibleRangeEnd(rangeEnd);
  }, []);

  if (shiftsLoading || employeesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <>
      {/* Custom CSS for Unified Schedule Event Styling */}
      <style>{`
        /* Time-off pending - dashed border + striped pattern for visibility */
        .fc-event.time-off-pending {
          border-style: dashed !important;
          border-width: 2px !important;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(245, 158, 11, 0.15) 4px,
            rgba(245, 158, 11, 0.15) 8px
          ) !important;
          animation: pending-pulse 2s ease-in-out infinite;
        }

        /* Time-off approved - semi-transparent background */
        .fc-event.time-off-approved {
          opacity: 0.8;
          border-left: 3px solid #10B981 !important;
        }

        /* Shift trade - thick dashed border on left + striped for pending */
        .fc-event.shift-trade {
          border-left: 4px dashed !important;
          position: relative;
        }

        .fc-event.shift-trade::before {
          content: "🔄";
          position: absolute;
          top: 2px;
          right: 4px;
          font-size: 14px;
        }

        /* Pending pulse animation */
        @keyframes pending-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Holiday background enhancement */
        .fc-event.holiday-bg {
          border-radius: 4px !important;
        }

        .fc-event.holiday-blocked {
          background: repeating-linear-gradient(
            -45deg,
            rgba(107, 114, 128, 0.1),
            rgba(107, 114, 128, 0.1) 4px,
            rgba(107, 114, 128, 0.2) 4px,
            rgba(107, 114, 128, 0.2) 8px
          ) !important;
        }

        /* Print-friendly styles */
        @media print {
          .no-print {
            display: none !important;
          }
          .fc-toolbar {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
        }

        /* MOBILE FIX: Hide intrusive tooltip on mobile */
        @media (max-width: 768px) {
          div[id^="tooltip-"] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
          }
        }

        /* MOBILE FIX: Hide intrusive tooltip on mobile */
        @media (max-width: 768px) {
          div[id^="tooltip-"] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
          }
        }

        /* CRITICAL: +X more link styling for dark theme (proven by 7shifts, Deputy) */
        .fc-more-link-custom,
        .fc-daygrid-more-link {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%) !important;
          color: #93c5fd !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          text-align: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: block !important;
          margin: 2px 4px !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
        }
        
        .fc-more-link-custom:hover,
        .fc-daygrid-more-link:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%) !important;
          color: #ffffff !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Day cell minimum height for month view (ensure space for events) */
        .fc-daygrid-day-frame {
          min-height: 100px !important;
        }
        
        /* Event compact display in month view */
        .fc-daygrid-event {
          margin: 1px 2px !important;
          padding: 2px 4px !important;
          font-size: 0.7rem !important;
          border-radius: 4px !important;
        }
      `}</style>
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }} className="print-container">
      {/* Feature 6: DRAFT Watermark */}
      {/* Feature 6: DRAFT Watermark - Managers Only & Not in List View */}
      {!isPublished && isManagerRole && viewMode !== 'list' && (
        <Box
          className="no-print"
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: { xs: '3rem', md: '8rem' },
            fontWeight: 900,
            color: 'rgba(255, 0, 0, 0.08)',
            pointerEvents: 'none',
            zIndex: 1000,
            userSelect: 'none',
          }}
        >
          DRAFT
        </Box>
      )}

      {/* MOBILE: Floating Selection Indicator */}
      {!isDesktop && mobileSelectedEmployee && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1400, // Above everything including drawers
            p: 1.5,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'primary.main',
            color: 'white',
            maxWidth: '90%',
            width: 'auto',
            animation: 'slideUp 0.3s ease-out',
            '@keyframes slideUp': {
              from: { transform: 'translate(-50%, 100%)', opacity: 0 },
              to: { transform: 'translate(-50%, 0)', opacity: 1 }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'white', 
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700
              }}
            >
              {mobileSelectedEmployee.firstName[0]}{mobileSelectedEmployee.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                Assigning shifts for:
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {mobileSelectedEmployee.firstName} {mobileSelectedEmployee.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setMobileSelectedEmployee(null)}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {/* Employee Roster Sidebar - Responsive Drawer */}
      {!isDesktop ? (
        <SwipeableDrawer
          anchor="left"
          open={rosterOpen}
          onClose={() => setRosterOpen(false)}
          onOpen={() => setRosterOpen(true)}
          className="no-print"
          sx={{
             '& .MuiDrawer-paper': { width: 320, boxSizing: 'border-box' } 
          }}
        >
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Employee Roster
              </Typography>
              <IconButton size="small" onClick={() => setRosterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            {isPublished && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Schedule is published. Switch to Draft mode to make changes.
              </Alert>
            )}
            <Divider sx={{ mb: 2 }} />
            
            {/* Draggable Roster Content */}
            <Box ref={rosterRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
            {employees.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No employees found.
              </Typography>
            )}
            {employees.map((employee, index) => {
              const colors = EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
              const displayRole = employee.position || employee.role || 'employee';
              const isInactive = employee.isActive === false;
              const canDrag = isManagerRole && !isPublished && !isInactive;
              
              return (
                  <Tooltip 
                    key={employee.id} 
                    title={
                      isInactive 
                        ? "This employee is inactive" 
                        : (!isPublished 
                            ? (!isDesktop ? "Tap to select, then tap calendar" : "Drag to calendar to schedule")
                            : "Switch to Draft mode to enable dragging")
                    } 
                    arrow 
                    placement="right"
                  >
                    <Box
                      className={canDrag && isDesktop ? "draggable-employee" : ""}
                      onClick={() => {
                        // MOBILE: Tap to select/deselect
                        if (!isDesktop && canDrag) {
                          if (mobileSelectedEmployee?.id === employee.id) {
                            setMobileSelectedEmployee(null); // Deselect
                            toast.info('Selection cleared', { autoClose: 1000 });
                          } else {
                            setMobileSelectedEmployee(employee); // Select
                            toast.info('✅ Employee selected! Now tap a date on the calendar.', { autoClose: 3000 });
                            setRosterOpen(false); // Auto-close drawer on mobile for better UX
                          }
                        }
                      }}
                      data-employee={canDrag ? JSON.stringify(employee) : undefined}
                      data-name={`${employee.firstName} ${employee.lastName}`}
                      aria-label="Drag me to the calendar to create a shift"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isInactive 
                          ? 'action.disabledBackground' 
                          : (mobileSelectedEmployee?.id === employee.id ? alpha(colors.bg, 0.15) : 'background.paper'),
                        cursor: canDrag ? (isDesktop ? 'grab' : 'pointer') : 'not-allowed',
                        opacity: isInactive ? 0.5 : (!isPublished ? 1 : 0.6),
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '2px solid', // Thicker border for better visibility
                        borderColor: isInactive 
                          ? 'action.disabled' 
                          : (mobileSelectedEmployee?.id === employee.id ? colors.bg : 'divider'),
                        boxShadow: mobileSelectedEmployee?.id === employee.id 
                          ? `0 0 0 4px ${alpha(colors.bg, 0.2)}` // Glow effect for selected
                          : '0 1px 2px rgba(0,0,0,0.05)',
                        transform: mobileSelectedEmployee?.id === employee.id ? 'scale(1.02)' : 'none',
                        '&:hover': canDrag ? {
                          bgcolor: mobileSelectedEmployee?.id === employee.id ? alpha(colors.bg, 0.2) : 'action.hover',
                          transform: 'translateX(4px) scale(1.01)',
                          borderColor: mobileSelectedEmployee?.id === employee.id ? colors.bg : 'primary.main',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        } : {},
                        '&:active': {
                          cursor: canDrag ? (isDesktop ? 'grabbing' : 'pointer') : 'not-allowed',
                          transform: canDrag ? 'scale(0.98)' : 'none',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isInactive ? 'action.disabled' : colors.bg,
                          color: isInactive ? 'text.disabled' : colors.text,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {employee.firstName[0]}{employee.lastName[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={600} 
                          noWrap
                          sx={{ color: isInactive ? 'text.disabled' : 'text.primary' }}
                        >
                          {employee.firstName} {employee.lastName}
                          {isInactive && ' (Inactive)'}
                        </Typography>
                        <Typography variant="caption" color={isInactive ? 'text.disabled' : 'text.secondary'}>
                          {displayRole}
                        </Typography>
                      </Box>
                      
                      {/* Selection Checkmark */}
                      {mobileSelectedEmployee?.id === employee.id && (
                        <CheckIcon sx={{ color: colors.bg, fontSize: 20 }} />
                      )}
                      
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          display: mobileSelectedEmployee?.id === employee.id ? 'none' : 'block', // Hide dot if checkmark shown
                          bgcolor: isInactive ? 'action.disabled' : colors.bg,
                          boxShadow: isInactive ? 'none' : `0 0 0 2px ${colors.bg}33`,
                        }}
                      />
                    </Box>
                  </Tooltip>
              );
            })}
            </Box>
          </Box>
        </SwipeableDrawer>
      ) : (
        <Box
          className="no-print"
          sx={{
            width: rosterOpen ? 320 : 0,
            minWidth: rosterOpen ? 320 : 0,
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'all 225ms cubic-bezier(0.4, 0, 0.2, 1)',
            borderRight: rosterOpen ? 1 : 0,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Employee Roster
              </Typography>
              <IconButton size="small" onClick={() => setRosterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            {isPublished && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Schedule is published. Switch to Draft mode to make changes.
              </Alert>
            )}
            <Divider sx={{ mb: 2 }} />
            
            <Box ref={rosterRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* DUPLICATE CONTENT FOR DESKTOP - NEEDED FOR DRAGGABLE REF BINDING */}
            {employees.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No employees found.
              </Typography>
            )}
            {employees.map((employee, index) => {
              const colors = EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
              const displayRole = employee.position || employee.role || 'employee';
              const isInactive = employee.isActive === false;
              const canDrag = !isPublished && !isInactive;
              
              return (
                <Tooltip 
                  key={employee.id} 
                  title={
                    isInactive 
                      ? "This employee is inactive" 
                      : (!isPublished ? "Drag to calendar to schedule" : "Switch to Draft mode to enable dragging")
                  } 
                  arrow 
                  placement="right"
                >
                  <Box
                    className={canDrag ? "draggable-employee" : ""}
                    data-employee={canDrag ? JSON.stringify(employee) : undefined}
                    data-name={`${employee.firstName} ${employee.lastName}`}
                    aria-label="Drag me to the calendar to create a shift"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isInactive ? 'action.disabledBackground' : 'background.paper',
                      cursor: canDrag ? 'grab' : 'not-allowed',
                      opacity: isInactive ? 0.5 : (!isPublished ? 1 : 0.6),
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid',
                      borderColor: isInactive ? 'action.disabled' : 'divider',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      '&:hover': canDrag ? {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px) scale(1.01)',
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      } : {},
                      '&:active': {
                        cursor: canDrag ? 'grabbing' : 'not-allowed',
                        transform: canDrag ? 'scale(0.98)' : 'none',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: isInactive ? 'action.disabled' : colors.bg,
                        color: isInactive ? 'text.disabled' : colors.text,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        noWrap
                        sx={{ color: isInactive ? 'text.disabled' : 'text.primary' }}
                      >
                        {employee.firstName} {employee.lastName}
                        {isInactive && ' (Inactive)'}
                      </Typography>
                      <Typography variant="caption" color={isInactive ? 'text.disabled' : 'text.secondary'}>
                        {displayRole}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: isInactive ? 'action.disabled' : colors.bg,
                        boxShadow: isInactive ? 'none' : `0 0 0 2px ${colors.bg}33`,
                      }}
                    />
                  </Box>
                </Tooltip>
              );
            })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Calendar Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
          minWidth: 0, // Important for flex children to prevent overflow
          transition: 'all 225ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Toolbar - RESPONSIVE */}
      <Paper 
        sx={{ 
          p: { xs: 1, sm: 1.5 },
          mb: 2, 
          display: 'flex', 
          flexWrap: 'wrap',  // CRITICAL: Allow wrapping on small screens
          gap: { xs: 0.5, sm: 1 },
          alignItems: 'center',
          borderRadius: 2
        }} 
        elevation={1}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            mr: { xs: 'auto', sm: 2 },
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            width: { xs: '100%', sm: 'auto' },
            mb: { xs: 0.5, sm: 0 }
          }}
        >
          Schedule
        </Typography>

        {/* 2025 BEST PRACTICE: Pending requests notification badge */}
        {isManagerRole && pendingRequestsCount > 0 && (
          <Tooltip title={`${pendingRequestsCount} pending request${pendingRequestsCount > 1 ? 's' : ''} need review`}>
            <Badge 
              badgeContent={pendingRequestsCount} 
              color="warning"
              max={99}
              sx={{ 
                mr: 2,
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }
              }}
            >
              <NotificationsIcon color="action" />
            </Badge>
          </Tooltip>
        )}

        {/* Feature 6: Published Toggle */}
        {isManagerRole && (
          <FormControlLabel
            control={
              <Switch
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                color="success"
                size="small"
              />
            }
            label={isPublished ? '✅ Published' : '📝 Draft'}
            sx={{ 
              mr: { xs: 0.5, sm: 1 },
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
        )}

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
        
        {/* Roster Toggle */}
        <Tooltip title="Toggle Employee Roster">
          <Button
            variant={rosterOpen ? 'contained' : 'outlined'}
            startIcon={<PeopleIcon />}
            onClick={() => setRosterOpen(!rosterOpen)}
            size="small"
            sx={{ 
              minWidth: { xs: 80, sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Roster
          </Button>
        </Tooltip>

        {/* UNIFIED SCHEDULE: Request Time Off Button */}
        <Tooltip title="Request time off">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setTimeOffModalOpen(true)}
            size="small"
            sx={{ 
              minWidth: { xs: 'auto', sm: 150 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              '& .MuiButton-startIcon': { 
                mr: { xs: 0, sm: 1 },
                ml: { xs: 0, sm: -0.5 }
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Request Time Off</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Time Off</Box>
          </Button>
        </Tooltip>

          {/* UNIFIED SCHEDULE: Request Shift Trade Button */}
          <Tooltip title="Trade one of your shifts with another employee">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => {
                // Check if employee has future shifts
                const myFutureShifts = shifts.filter(s => 
                  s.userId === currentUser?.id && 
                  new Date(s.startTime) > new Date()
                );
                
                if (myFutureShifts.length === 0) {
                  setSnackbar({ 
                    open: true, 
                    message: 'You have no future shifts available to trade', 
                    severity: 'info' 
                  });
                  return;
                }
                
                setShiftTradeModalOpen(true);
              }}
              size="small"
              sx={{ borderStyle: 'dashed' }}
            >
              Request Shift Trade
            </Button>
          </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {/* View Mode Toggles - NOW VISIBLE ON MOBILE! */}
        <ButtonGroup 
          variant="outlined" 
          size="small"
          sx={{ 
            display: 'flex', // Always show on all screen sizes
            '& .MuiButton-root': {
              minHeight: { xs: 44, sm: 36 }, // Touch-friendly height on mobile
              minWidth: { xs: 60, sm: 70 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '8px 12px', sm: '6px 16px' }
            }
          }}
        >
          <Tooltip title="Day View">
            <Button 
              variant={calendarRef.current?.getApi().view.type.includes('Day') ? 'contained' : 'outlined'}
              onClick={() => {
                const api = calendarRef.current?.getApi();
                api?.changeView(viewMode === 'timeline' ? 'resourceTimelineDay' : 'timeGridDay');
              }}
            >
              Day
            </Button>
          </Tooltip>
          <Tooltip title="Week View">
            <Button 
              variant={calendarRef.current?.getApi().view.type.includes('Week') ? 'contained' : 'outlined'}
              onClick={() => {
                const api = calendarRef.current?.getApi();
                api?.changeView(viewMode === 'timeline' ? 'resourceTimelineWeek' : 'timeGridWeek');
              }}
            >
              Week
            </Button>
          </Tooltip>
          <Tooltip title="Month View">
            <Button 
              variant={calendarRef.current?.getApi().view.type.includes('Month') ? 'contained' : 'outlined'}
              onClick={() => {
                const api = calendarRef.current?.getApi();
                api?.changeView('dayGridMonth');
                setViewMode('week'); // Month doesn't work well with timeline
              }}
            >
              Month
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* View Mode Toggle - Timeline/Grid/List */}
        <Tooltip title={`Current: ${viewMode === 'timeline' ? 'Timeline' : (viewMode === 'list' ? 'List' : 'Grid')}`}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              let newMode: 'timeline' | 'week' | 'list' = 'week';
              
              if (viewMode === 'timeline') newMode = 'week';       // Timeline -> Grid
              else if (viewMode === 'week') newMode = 'list';      // Grid -> List
              else newMode = 'timeline';                           // List -> Timeline

              setViewMode(newMode);
              
              const api = calendarRef.current?.getApi();
              if (newMode === 'timeline') api?.changeView('resourceTimelineWeek');
              else if (newMode === 'list') api?.changeView('listWeek');
              else api?.changeView('timeGridWeek');
              
              toast.success(`Switched to ${newMode === 'timeline' ? 'Timeline' : (newMode === 'list' ? 'List' : 'Grid')} view`);
            }}
            sx={{
              minWidth: 100,
              fontWeight: 600,
              background: viewMode === 'timeline' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                          viewMode === 'list' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }
            }}
          >
            {viewMode === 'timeline' ? '📊 Timeline' : (viewMode === 'list' ? '📝 List' : '📅 Grid')}
          </Button>
        </Tooltip>

          <Divider orientation="vertical" flexItem />

          {/* UNIFIED SCHEDULE: Filter Menu */}
          <Tooltip title="Filter Events">
            <IconButton 
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              color={(!showShifts || !showTimeOff || !showTrades || !showHolidays) ? 'primary' : 'default'}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          {/* Role Filter - hidden on mobile */}
          <FormControl size="small" sx={{ minWidth: 100, display: { xs: 'none', md: 'flex' } }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {availableRoles.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Schedule Tools Menu - MANAGERS ONLY */}
          {isManagerRole && (
            <Box>
              <Button
                variant="outlined"
                startIcon={<BuildIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(e) => setToolsMenuAnchor(e.currentTarget)}
                size="small"
              >
                Tools
              </Button>
              <Menu
                anchorEl={toolsMenuAnchor}
                open={Boolean(toolsMenuAnchor)}
                onClose={() => setToolsMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleCopyWeek(); setToolsMenuAnchor(null); }}>
                  <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Copy Current Week</ListItemText>
                </MenuItem>
                
                <MenuItem 
                  onClick={() => { handlePasteWeek(); setToolsMenuAnchor(null); }}
                  disabled={!clipboardWeek}
                >
                  <ListItemIcon><ContentPasteIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Paste from Clipboard</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={() => { handleCopyPreviousWeek(); setToolsMenuAnchor(null); }}>
                  <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Copy Previous Week</ListItemText>
                </MenuItem>
                
                <Divider />

                <MenuItem onClick={() => { handleClearWeek(); setToolsMenuAnchor(null); }} sx={{ color: 'error.main' }}>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText>Clear Current Week</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {clipboardWeek && (
            <Chip
              label={`📋 ${clipboardWeek.length} copied`}
              size="small"
              onDelete={() => {
                setClipboardWeek(null);
                setClipboardWeekStart(null);
              }}
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}


          <Divider orientation="vertical" flexItem />

          {/* Feature 7: Print Button */}
          <Tooltip title="Print Schedule (Ctrl+P)">
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              size="small"
              onClick={handlePrint}
            >
              Print
            </Button>
          </Tooltip>
        </Paper>

        {/* Calendar - MOBILE-PERFECT: No horizontal scroll, vertical only */}
        <Paper 
          sx={{ 
            p: { xs: 0.5, sm: 2 }, 
            height: { xs: 'auto', sm: 'calc(100vh - 180px)' },
            minHeight: { xs: '70vh', sm: 'auto' },
            borderRadius: 2, 
            position: 'relative',
            overflow: { xs: 'hidden', sm: 'auto' }, // CRITICAL: No horizontal scroll on mobile
            width: '100%', // CRITICAL: Fit screen width
          }} 
          className="print-calendar"
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin, interactionPlugin, listPlugin]}
            // MOBILE: Auto-select best view
            initialView={(() => {
              const isMobile = window.innerWidth < 768;
              if (isMobile) {
                return viewMode === 'list' ? 'listWeek' : 'dayGridMonth';
              }
              return viewMode === 'timeline' ? 'resourceTimelineWeek' : 
                     (viewMode === 'list' ? 'listWeek' : 'timeGridWeek');
            })()}
            
            // MOBILE-FRIENDLY: Simplified header
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '', // Controlled by our custom buttons
            }}
            
            // MOBILE OPTIMIZATION: Height settings for vertical scroll only
            height="auto" // CRITICAL: Auto height prevents horizontal scroll
            contentHeight="auto" // Allow content to expand vertically
            aspectRatio={window.innerWidth < 768 ? 1.0 : 1.8} // Mobile: More vertical, Desktop: More horizontal
            handleWindowResize={true}
            windowResizeDelay={100}
            
            // MOBILE: Better event display
            expandRows={true} // Expand rows to fill height (better for mobile)
            
            // CRITICAL FIX: Per-view configuration for dayMaxEvents (7shifts/Deputy pattern)
            views={{
              dayGridMonth: {
                dayMaxEvents: 3, // Show max 3 events per day, then "+X more"
                // REMOVED dayMaxEventRows to avoid conflict with dayMaxEvents
              },
              dayGridWeek: {
                dayMaxEvents: true, // Auto-fit based on height
              },
              dayGridDay: {
                dayMaxEvents: false, // Show all events in day view
              },
              timeGridWeek: {
                dayMaxEvents: false, // Time grid handles overlap differently
              },
              listWeek: {
                dayMaxEvents: false, // List view shows everything
              },
            }}
            
            // Resource Timeline Settings
            resources={viewMode === 'timeline' ? calendarResources : undefined}
            resourceAreaHeaderContent="Employees"
            resourceAreaWidth="180px"
            resourceLabelContent={(arg) => {
              const emp = arg.resource.extendedProps.employee;
              const colors = arg.resource.extendedProps.color || EMPLOYEE_COLORS[0];
              return (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={(e) => {
                    if (emp) {
                      setSelectedProfileEmployee(emp);
                      setProfilePopoverAnchor(e.currentTarget as HTMLElement);
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: colors.bg,
                      color: colors.text,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>
                      {arg.resource.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.65rem' }}>
                      {arg.resource.extendedProps.position || arg.resource.extendedProps.role || 'Staff'}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="01:00:00"
            allDaySlot={false}
            editable={isManagerRole && !isPublished}
            droppable={isManagerRole && !isPublished}
            selectable={isManagerRole && !isPublished}
            selectMirror={true}
            events={calendarEvents}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventReceive={handleEventReceive}
            
            // HOVER DETAILS: Show summary tooltip on day cells
            dayCellDidMount={(args) => {
              // Calculate stats for this day
              const dateStr = format(args.date, 'yyyy-MM-dd');
              const dayEvents = calendarEvents.filter(e => e.start && e.start.toString().startsWith(dateStr));
              
              if (dayEvents.length > 0) {
                const shiftCount = dayEvents.filter(e => e.extendedProps?.type === 'shift').length;
                const timeOffCount = dayEvents.filter(e => e.extendedProps?.type === 'time-off').length;
                const tradeCount = dayEvents.filter(e => e.extendedProps?.type === 'shift-trade').length;
                
                let tooltipText = `${dayEvents.length} Events:\n`;
                if (shiftCount) tooltipText += `• ${shiftCount} Shifts\n`;
                if (timeOffCount) tooltipText += `• ${timeOffCount} Time Off\n`;
                if (tradeCount) tooltipText += `• ${tradeCount} Trades`;
                
                args.el.setAttribute('title', tooltipText);
              }
            }}

            // FIXED: Responsive Event Rendering
            eventContent={renderEventContent}

            moreLinkClick="popover"
            
            // Event overlap settings
            slotEventOverlap={false}
            
            eventDidMount={(info) => {
              // RIGHT-CLICK HANDLER: Add context menu on shift events
              if (info.event.extendedProps.type === 'shift') {
                info.el.addEventListener('contextmenu', (e) => {
                  e.preventDefault();
                  setShiftContextMenu({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    shift: info.event.extendedProps.shift,
                  });
                });
              }
              
              // 2025 BEST PRACTICE: Hover tooltips with rich details
              const tooltipContent = (() => {
                const { type, shift, timeOff, trade, holiday } = info.event.extendedProps;
                
                if (type === 'shift' && shift) {
                  const employee = employees.find(e => e.id === shift.userId);
                  return `
                    <div style="padding: 8px;">
                      <strong>${employee?.firstName} ${employee?.lastName}</strong><br/>
                      ${shift.position || 'Staff'}<br/>
                      <span style="color: #10B981;">${format(new Date(shift.startTime), 'h:mm a')} - ${format(new Date(shift.endTime), 'h:mm a')}</span><br/>
                      ${shift.notes ? `<i>${shift.notes}</i>` : ''}
                    </div>
                  `;
                }
                
                if (type === 'timeOff' && timeOff) {
                  return `
                    <div style="padding: 8px;">
                      <strong>Time Off Request</strong><br/>
                      Type: ${timeOff.type}<br/>
                      Status: <span style="color: ${timeOff.status === 'approved' ? '#10B981' : '#F59E0B'};">${timeOff.status}</span><br/>
                      ${timeOff.reason || ''}
                    </div>
                  `;
                }
                
                if (type === 'trade' && trade) {
                  return `
                    <div style="padding: 8px;">
                      <strong>Shift Trade</strong><br/>
                      Status: <span style="color: ${trade.status === 'approved' ? '#10B981' : '#F59E0B'};">${trade.status}</span><br/>
                      ${trade.reason || ''}
                    </div>
                  `;
                }
                
                if (type === 'holiday' && holiday) {
                  return `
                    <div style="padding: 8px;">
                      <strong>🎉 ${holiday.name}</strong><br/>
                      ${holiday.type === 'federal' ? 'Federal Holiday' : 'Company Holiday'}
                    </div>
                  `;
                }
                
                return '';
              })();
              
              if (tooltipContent) {
                // Use native browser tooltip for simplicity (works on mobile too)
                info.el.title = '';
                info.el.setAttribute('data-tooltip', 'true');
                
                // Create MUI-style tooltip on hover
                info.el.addEventListener('mouseenter', (e) => {
                  const tooltip = document.createElement('div');
                  tooltip.id = `tooltip-${info.event.id}`;
                  tooltip.innerHTML = tooltipContent;
                  tooltip.style.cssText = `
                    position: fixed;
                    z-index: 10000;
                    background: #1e1e1e;
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    max-width: 250px;
                    font-size: 0.875rem;
                    pointer-events: none;
                    border: 1px solid rgba(255,255,255,0.1);
                  `;
                  
                  document.body.appendChild(tooltip);
                  
                  const rect = info.el.getBoundingClientRect();
                  tooltip.style.left = `${rect.left + rect.width / 2}px`;
                  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
                  tooltip.style.transform = 'translateX(-50%)';
                });
                
                info.el.addEventListener('mouseleave', () => {
                  const tooltip = document.getElementById(`tooltip-${info.event.id}`);
                  if (tooltip) tooltip.remove();
                });
              }
            }}
            datesSet={handleDatesSet}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            nowIndicator={true}
            eventDisplay="block"

            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          />
        </Paper>

        {/* Feature 5: Weekly Hours Summary */}
        <Card
          className="no-print"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 280,
            boxShadow: 6,
            zIndex: 100,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScheduleIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>
                This Week: {weeklyHoursSummary.total}h total
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              {weeklyHoursSummary.byEmployee.map((emp, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {emp.name}
                  </Typography>
                  <Chip label={`${emp.hours}h`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Create Shift Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Shift</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Feature 2: Overlap Warning */}
            {overlapWarning && (
              <Alert severity="error" sx={{ '& .MuiAlert-icon': { color: '#EF4444' } }}>
                {overlapWarning}
              </Alert>
            )}

            <FormControl fullWidth error={!!overlapWarning}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={newShiftData.employeeId}
                label="Employee"
                onChange={(e) => setNewShiftData(prev => ({ ...prev, employeeId: e.target.value }))}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} {emp.role && `• ${emp.role}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={newShiftData.startTime ? format(new Date(newShiftData.startTime), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setNewShiftData(prev => ({ ...prev, startTime: new Date(e.target.value).toISOString() }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              error={!!overlapWarning}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={newShiftData.endTime ? format(new Date(newShiftData.endTime), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setNewShiftData(prev => ({ ...prev, endTime: new Date(e.target.value).toISOString() }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              error={!!overlapWarning}
            />
            <TextField
              label="Notes"
              multiline
              rows={2}
              value={newShiftData.notes}
              onChange={(e) => setNewShiftData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateModalOpen(false); resetNewShiftData(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const selectedEmployee = employees.find(e => e.id === newShiftData.employeeId);
              createShiftMutation.mutate({
                userId: newShiftData.employeeId,
                branchId: selectedEmployee?.branchId || '',
                position: selectedEmployee?.position || 'Staff',
                startTime: newShiftData.startTime,
                endTime: newShiftData.endTime,
                notes: newShiftData.notes,
              });
            }}
            disabled={!newShiftData.employeeId || !newShiftData.startTime || !newShiftData.endTime || createShiftMutation.isPending || !!overlapWarning}
            color={overlapWarning ? 'error' : 'primary'}
          >
            {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shift Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Shift</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: getEmployeeColor(selectedShift.userId, employees).bg }}>
                  {selectedShift.user?.firstName?.[0] || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {selectedShift.user ? `${selectedShift.user.firstName} ${selectedShift.user.lastName}` : getEmployeeName(selectedShift.userId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedShift.user?.role || getEmployeeRole(selectedShift.userId)}
                  </Typography>
                </Box>
              </Box>
              <TextField
                label="Start Time"
                type="datetime-local"
                defaultValue={format(new Date(selectedShift.startTime), "yyyy-MM-dd'T'HH:mm")}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                onChange={(e) => {
                  if (selectedShift) {
                    selectedShift.startTime = new Date(e.target.value).toISOString();
                  }
                }}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                defaultValue={format(new Date(selectedShift.endTime), "yyyy-MM-dd'T'HH:mm")}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                onChange={(e) => {
                  if (selectedShift) {
                    selectedShift.endTime = new Date(e.target.value).toISOString();
                  }
                }}
              />
              <TextField
                label="Notes"
                multiline
                rows={2}
                defaultValue={selectedShift.notes || ''}
                fullWidth
                onChange={(e) => {
                  if (selectedShift) {
                    selectedShift.notes = e.target.value;
                  }
                }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    handleCopyShift(selectedShift);
                    setEditModalOpen(false);
                  }}
                  fullWidth
                >
                  Copy Shift
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setEditModalOpen(false);
                    setDeleteConfirmOpen(true);
                  }}
                  fullWidth
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedShift) {
                updateShiftMutation.mutate({
                  id: selectedShift.id,
                  startTime: selectedShift.startTime,
                  endTime: selectedShift.endTime,
                  notes: selectedShift.notes,
                });
              }
            }}
            disabled={updateShiftMutation.isPending}
          >
            {updateShiftMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Shift?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this shift? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedShift && deleteShiftMutation.mutate(selectedShift.id)}
            disabled={deleteShiftMutation.isPending}
          >
            {deleteShiftMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* UNIFIED SCHEDULE: Time-Off Request Modal */}
      <Dialog open={timeOffModalOpen} onClose={() => setTimeOffModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTimeOff ? 'Edit Time-Off Request' : 'Request Time Off'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={timeOffFormData.type}
                label="Type"
                onChange={(e) => setTimeOffFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                {Object.entries(TIME_OFF_NOTICE_POLICY).map(([key, policy]) => (
                  <MenuItem key={key} value={key}>
                    {policy.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Advance Notice - Clean & Minimal */}
            {timeOffFormData.startDate && (() => {
              const noticeInfo = isShortNotice(timeOffFormData.type, timeOffFormData.startDate);
              const policy = TIME_OFF_NOTICE_POLICY[timeOffFormData.type] || TIME_OFF_NOTICE_POLICY.other;
              
              if (!noticeInfo.isShort && timeOffFormData.type !== 'emergency') return null;

              return (
                <Alert 
                  severity={timeOffFormData.type === 'emergency' ? 'info' : 'warning'}
                  sx={{ 
                    mt: -1, 
                    mb: 1,
                    py: 0,
                    alignItems: 'center',
                    bgcolor: 'transparent',
                    color: timeOffFormData.type === 'emergency' ? 'info.light' : 'warning.light',
                    '& .MuiAlert-icon': { py: 0 }
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {timeOffFormData.type === 'emergency' 
                      ? "Empty Leave: No advance notice required."
                      : `Short notice (${noticeInfo.advanceDays} days). Recommended: ${noticeInfo.minDays}+ days.`}
                  </Typography>
                </Alert>
              );
            })()}
            
            {/* Beautiful Date Range Picker - react-datepicker */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              '& .react-datepicker-wrapper': { flex: 1, minWidth: 150 },
              '& .react-datepicker__input-container input': {
                width: '100%',
                padding: '16.5px 14px',
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.23)',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'inherit',
                fontFamily: 'inherit',
                '&:focus': {
                  borderColor: '#10B981',
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                },
              },
              '& .react-datepicker': {
                backgroundColor: '#1e1e1e',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontFamily: 'inherit',
              },
              '& .react-datepicker__header': {
                backgroundColor: '#2d2d2d',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              },
              '& .react-datepicker__current-month, & .react-datepicker__day-name, & .react-datepicker-time__header': {
                color: '#fff',
              },
              '& .react-datepicker__day': {
                color: '#fff',
                '&:hover': { backgroundColor: '#10B981', color: '#fff' },
              },
              '& .react-datepicker__day--selected, & .react-datepicker__day--in-range': {
                backgroundColor: '#10B981 !important',
                color: '#fff',
              },
              '& .react-datepicker__day--keyboard-selected': {
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
              },
              '& .react-datepicker__day--in-selecting-range': {
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
              },
              '& .react-datepicker__day--disabled': {
                color: 'rgba(255,255,255,0.3)',
              },
              '& .react-datepicker__navigation-icon::before': {
                borderColor: '#fff',
              },
              '& .react-datepicker__triangle': {
                display: 'none',
              },
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Start Date
                </Typography>
                <DatePicker
                  selected={timeOffFormData.startDate ? new Date(timeOffFormData.startDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setTimeOffFormData(prev => ({ 
                        ...prev, 
                        startDate: format(date, 'yyyy-MM-dd'),
                        // Auto-update end date if it's before start date
                        endDate: new Date(prev.endDate) < date ? format(date, 'yyyy-MM-dd') : prev.endDate
                      }));
                    }
                  }}
                  selectsStart
                  startDate={timeOffFormData.startDate ? new Date(timeOffFormData.startDate) : undefined}
                  endDate={timeOffFormData.endDate ? new Date(timeOffFormData.endDate) : undefined}
                  minDate={new Date()}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select start date"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  End Date
                </Typography>
                <DatePicker
                  selected={timeOffFormData.endDate ? new Date(timeOffFormData.endDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setTimeOffFormData(prev => ({ ...prev, endDate: format(date, 'yyyy-MM-dd') }));
                    }
                  }}
                  selectsEnd
                  startDate={timeOffFormData.startDate ? new Date(timeOffFormData.startDate) : undefined}
                  endDate={timeOffFormData.endDate ? new Date(timeOffFormData.endDate) : undefined}
                  minDate={timeOffFormData.startDate ? new Date(timeOffFormData.startDate) : new Date()}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select end date"
                />
              </Box>
            </Box>
            
            {/* CONFLICT DETECTION: Show shifts during requested time-off */}
            {timeOffFormData.startDate && timeOffFormData.endDate && currentUser && (() => {
              const conflictingShifts = shifts.filter(s => {
                if (s.userId !== currentUser?.id) return false;
                
                const shiftDate = new Date(s.startTime);
                const requestStart = new Date(timeOffFormData.startDate);
                const requestEnd = new Date(timeOffFormData.endDate);
                
                // Set times to start/end of day for date comparison
                requestStart.setHours(0, 0, 0, 0);
                requestEnd.setHours(23, 59, 59, 999);
                
                return shiftDate >= requestStart && shiftDate <= requestEnd;
              });
              
              if (conflictingShifts.length === 0) return null;
              
              return (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mt: 2,
                    '& .MuiAlert-icon': { color: 'warning.main' }
                  }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        toast.info('💡 Auto-trade feature coming soon!');
                      }}
                    >
                      Auto-Trade
                    </Button>
                  }
                >
                  <AlertTitle sx={{ fontWeight: 700 }}>⚠️ Shift Conflicts Detected</AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    You have {conflictingShifts.length} scheduled shift{conflictingShifts.length > 1 ? 's' : ''} during this time-off period:
                  </Typography>
                  <Stack spacing={0.5} sx={{ ml: 2 }}>
                    {conflictingShifts.slice(0, 3).map(shift => (
                      <Typography key={shift.id} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        • {format(new Date(shift.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                        {shift.position && <Chip label={shift.position} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />}
                      </Typography>
                    ))}
                    {conflictingShifts.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        ...and {conflictingShifts.length - 3} more
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic' }}>
                    💡 Tip: You'll need to trade or cancel these shifts before taking time off.
                  </Typography>
                </Alert>
              );
            })()}
            
            <TextField
              label="Reason"
              multiline
              rows={3}
              value={timeOffFormData.reason}
              onChange={(e) => setTimeOffFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a brief reason for your request..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {selectedTimeOff && (
            <Button
              color="error"
              onClick={() => {
                if (selectedTimeOff) {
                  deleteTimeOffMutation.mutate(selectedTimeOff.id);
                }
              }}
              disabled={deleteTimeOffMutation.isPending}
            >
              Delete
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => {
            setTimeOffModalOpen(false);
            setSelectedTimeOff(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedTimeOff) {
                updateTimeOffMutation.mutate({ id: selectedTimeOff.id });
              } else {
                createTimeOffMutation.mutate(timeOffFormData);
              }
            }}
            disabled={createTimeOffMutation.isPending || updateTimeOffMutation.isPending || !timeOffFormData.reason}
          >
            {createTimeOffMutation.isPending || updateTimeOffMutation.isPending 
              ? 'Submitting...' 
              : selectedTimeOff ? 'Update' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* UNIFIED SCHEDULE: Shift Trade Request Modal */}
      <Dialog 
        open={shiftTradeModalOpen} 
        onClose={() => setShiftTradeModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={!isDesktop} // MOBILE FIX
      >
        <DialogTitle>Request Shift Trade</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Your Shift to Trade</InputLabel>
              <Select
                value={shiftTradeFormData.shiftId}
                label="Your Shift to Trade"
                onChange={(e) => setShiftTradeFormData(prev => ({ ...prev, shiftId: e.target.value }))}
              >
                {shifts
                  .filter(s => s.userId === currentUser?.id)
                  .filter(s => new Date(s.startTime) > new Date()) // Only future shifts
                  .map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {format(new Date(shift.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                      {shift.position && ` (${shift.position})`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            
            <FormControl fullWidth>
              <InputLabel>Trade With Employee</InputLabel>
              <Select
                value={shiftTradeFormData.targetUserId}
                label="Trade With Employee"
                onChange={(e) => setShiftTradeFormData(prev => ({ ...prev, targetUserId: e.target.value }))}
                disabled={!shiftTradeFormData.shiftId}
              >
                <MenuItem value="">
                  <em>Open to anyone</em>
                </MenuItem>
                {(() => {
                  const selectedShift = shifts.find(s => s.id === shiftTradeFormData.shiftId);
                  if (!selectedShift) return null;
                  
                  // Smart employee suggestions: Sort by compatibility
                  const sortedEmployees = employees
                    .filter(emp => emp.id !== currentUser?.id && emp.isActive)
                    .map(emp => {
                      let score = 0;
                      const indicators: string[] = [];
                      
                      // 1. Position match (highest priority)
                      if (emp.position === selectedShift.position) {
                        score += 100;
                        indicators.push('🎯 Perfect Match');
                      }
                      
                      // 2. Check for schedule conflicts
                      const hasConflict = shifts.some(s => 
                        s.userId === emp.id &&
                        s.id !== selectedShift.id &&
                        new Date(s.startTime) < new Date(selectedShift.endTime) &&
                        new Date(s.endTime) > new Date(selectedShift.startTime)
                      );
                      
                      if (hasConflict) {
                        score -= 50;
                        indicators.push('⚠️ Conflict');
                      } else {
                        score += 20;
                        indicators.push('✅ Available');
                      }
                      
                      // 3. Same branch (required)
                      if (emp.branchId === selectedShift.branchId) {
                        score += 10;
                      } else {
                        score -= 100; // Different branch is not ideal
                      }
                      
                      return { emp, score, indicators };
                    })
                    .sort((a, b) => b.score - a.score);
                  
                  return sortedEmployees.map(({ emp, indicators }) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography>{emp.firstName} {emp.lastName}</Typography>
                        {emp.position && (
                          <Chip 
                            label={emp.position} 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                            color={emp.position === selectedShift.position ? 'success' : 'default'}
                          />
                        )}
                        {indicators.includes('🎯 Perfect Match') && (
                          <Chip 
                            label="Perfect Match" 
                            size="small" 
                            color="success"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                          />
                        )}
                        {indicators.includes('⚠️ Conflict') && (
                          <Chip 
                            label="Conflict" 
                            size="small" 
                            color="warning"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ));
                })()}
              </Select>
            </FormControl>
            
            <TextField
              label="Reason for Trade *"
              multiline
              rows={3}
              value={shiftTradeFormData.reason}
              onChange={(e) => setShiftTradeFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Why do you need to trade this shift? (Required)"
              fullWidth
              required
              error={!shiftTradeFormData.reason && shiftTradeFormData.shiftId !== ''}
              helperText={!shiftTradeFormData.reason && shiftTradeFormData.shiftId !== '' ? 'Reason is required' : 'Provide a brief explanation for this trade request'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShiftTradeModalOpen(false);
            setShiftTradeFormData({ shiftId: '', targetUserId: '', reason: '' });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Validate before submitting
              if (shiftTradeFormData.shiftId && shiftTradeFormData.reason.trim()) {
                createShiftTradeMutation.mutate(shiftTradeFormData);
              }
            }}
            disabled={
              !shiftTradeFormData.shiftId || 
              !shiftTradeFormData.reason.trim() || 
              createShiftTradeMutation.isPending
            }
          >
            {createShiftTradeMutation.isPending ? 'Submitting...' : 'Request Trade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* UNIFIED SCHEDULE: Approval Modal (Time-Off & Trades) */}
      <Dialog 
        open={approvalModalOpen} 
        onClose={() => setApprovalModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={!isDesktop} // MOBILE FIX
      >
        <DialogTitle>
          {approvalType === 'time-off' ? 'Approve Time-Off Request' : 'Approve Shift Trade'}
        </DialogTitle>
        <DialogContent>
          {approvalType === 'time-off' && selectedTimeOff && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Employee:</strong> {selectedTimeOff.userName || 'Unknown'}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedTimeOff.type}
              </Typography>
              <Typography variant="body2">
                <strong>Dates:</strong> {format(new Date(selectedTimeOff.startDate), 'MMM d, yyyy')} - {format(new Date(selectedTimeOff.endDate), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {selectedTimeOff.reason || 'No reason provided'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedTimeOff.status}
              </Typography>
            </Stack>
          )}
          
          {approvalType === 'shift-trade' && selectedTrade && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>From:</strong> {selectedTrade.requester?.firstName} {selectedTrade.requester?.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>To:</strong> {selectedTrade.targetUser?.firstName} {selectedTrade.targetUser?.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Shift:</strong> {selectedTrade.shift?.date ? format(new Date(selectedTrade.shift.date), 'MMM d, yyyy') : 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {selectedTrade.reason || 'No reason provided'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedTrade.status}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalModalOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (approvalType === 'time-off' && selectedTimeOff) {
                updateTimeOffMutation.mutate({ id: selectedTimeOff.id, status: 'rejected' });
              } else if (approvalType === 'shift-trade' && selectedTrade) {
                if (isManagerRole) {
                  approveTradeAsManagerMutation.mutate({ id: selectedTrade.id, approve: false });
                } else {
                  respondToTradeMutation.mutate({ id: selectedTrade.id, accept: false });
                }
              }
            }}
            disabled={updateTimeOffMutation.isPending || respondToTradeMutation.isPending || approveTradeAsManagerMutation.isPending}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (approvalType === 'time-off' && selectedTimeOff) {
                updateTimeOffMutation.mutate({ id: selectedTimeOff.id, status: 'approved' });
              } else if (approvalType === 'shift-trade' && selectedTrade) {
                if (isManagerRole) {
                  approveTradeAsManagerMutation.mutate({ id: selectedTrade.id, approve: true });
                } else {
                  respondToTradeMutation.mutate({ id: selectedTrade.id, accept: true });
                }
              }
            }}
            disabled={updateTimeOffMutation.isPending || respondToTradeMutation.isPending || approveTradeAsManagerMutation.isPending}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Feature 7: Print Styles + Drag Preview Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .print-calendar {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            box-shadow: none !important;
          }
          .fc-header-toolbar {
            margin-bottom: 1em !important;
          }
          .fc-view-harness {
            height: auto !important;
          }
        }
        
        /* 2025 Premium Drag Preview Styling */
        .drag-preview-shift {
          border: 2px dashed rgba(255, 255, 255, 0.6) !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35) !important;
          backdrop-filter: blur(4px);
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
          }
          50% {
            box-shadow: 0 8px 32px rgba(16, 185, 129, 0.5);
          }
        }
        
        /* Dragging state enhancement */
        .fc-event-dragging {
          opacity: 0.9 !important;
          transform: scale(1.02);
        }
        
        /* Mirror element while dragging */
        .fc-event-mirror {
          border: 2px dashed rgba(255, 255, 255, 0.8) !important;
          border-radius: 8px !important;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4) !important;
        }
        
        /* NEW: Coverage gap styling - understaffed slots */
        .coverage-gap {
          background: repeating-linear-gradient(
            45deg,
            rgba(239, 68, 68, 0.1),
            rgba(239, 68, 68, 0.1) 10px,
            rgba(239, 68, 68, 0.2) 10px,
            rgba(239, 68, 68, 0.2) 20px
          ) !important;
          border-left: 3px solid #ef4444 !important;
        }
        
        /* Resource timeline custom styling */
        .fc-resource-timeline .fc-resource-group {
          background: rgba(0, 0, 0, 0.02);
        }
        
        .fc-timeline-slot-frame {
          border-right: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .fc-resource-timeline-divider {
          width: 3px;
        }
      `}</style>

      {/* NEW: Employee Profile Popover */}
      <EmployeeProfilePopover
        employee={selectedProfileEmployee}
        anchorEl={profilePopoverAnchor}
        onClose={() => {
          setProfilePopoverAnchor(null);
          setSelectedProfileEmployee(null);
        }}
        weeklyShifts={selectedProfileEmployee 
          ? shifts.filter(s => s.userId === selectedProfileEmployee.id)
          : []
        }
        employeeColor={selectedProfileEmployee 
          ? getEmployeeColor(selectedProfileEmployee.id, employees)
          : undefined
        }
        onViewProfile={(id) => {
          // Navigate to employee profile page
          window.location.href = `/employees/${id}`;
        }}
        onCreateShift={(id) => {
          setNewShiftData(prev => ({ ...prev, employeeId: id }));
          setCreateModalOpen(true);
          setProfilePopoverAnchor(null);
          setSelectedProfileEmployee(null);
        }}
      />

      {/* UNIFIED SCHEDULE: Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          style: { minWidth: 200 }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Filter Events
        </Typography>
        <MenuItem onClick={() => setShowShifts(!showShifts)}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" color={showShifts ? "primary" : "disabled"} />
          </ListItemIcon>
          <ListItemText primary="Shifts" />
          <Switch size="small" checked={showShifts} />
        </MenuItem>
        <MenuItem onClick={() => setShowTimeOff(!showTimeOff)}>
          <ListItemIcon>
            <EventAvailableIcon fontSize="small" color={showTimeOff ? "primary" : "disabled"} />
          </ListItemIcon>
          <ListItemText primary="Time Off Requests" />
          <Switch size="small" checked={showTimeOff} />
        </MenuItem>
        <MenuItem onClick={() => setShowTrades(!showTrades)}>
          <ListItemIcon>
            <SwapIcon fontSize="small" color={showTrades ? "primary" : "disabled"} />
          </ListItemIcon>
          <ListItemText primary="Shift Trades" />
          <Switch size="small" checked={showTrades} />
        </MenuItem>
        <MenuItem onClick={() => setShowHolidays(!showHolidays)}>
          <ListItemIcon>
            <MorningIcon fontSize="small" color={showHolidays ? "primary" : "disabled"} />
          </ListItemIcon>
          <ListItemText primary="Holidays" />
          <Switch size="small" checked={showHolidays} />
        </MenuItem>
      </Menu>

      {/* RIGHT-CLICK CONTEXT MENU for Quick Shift Actions */}
      <Menu
        open={shiftContextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          shiftContextMenu !== null
            ? { top: shiftContextMenu.mouseY, left: shiftContextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          style: { minWidth: 180 }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
          Quick Actions
        </Typography>
        {shiftContextMenu?.shift && (
          <>
            {/* Employee can request trade on own shifts */}
            {!isManagerRole && shiftContextMenu.shift.userId === currentUser?.id && (
              <MenuItem onClick={() => {
                setShiftTradeFormData({
                  shiftId: shiftContextMenu.shift!.id,
                  targetUserId: '',
                  reason: '',
                });
                setShiftTradeModalOpen(true);
                handleCloseContextMenu();
                toast.info('📝 Request a trade for this shift');
              }}>
                <ListItemIcon><SwapIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Request Trade" />
              </MenuItem>
            )}
            
            {/* Employee can request time off */}
            {!isManagerRole && shiftContextMenu.shift.userId === currentUser?.id && (
              <MenuItem onClick={() => {
                const shiftDate = new Date(shiftContextMenu.shift!.startTime);
                setTimeOffFormData({
                  type: 'personal',
                  startDate: format(shiftDate, 'yyyy-MM-dd'),
                  endDate: format(shiftDate, 'yyyy-MM-dd'),
                  reason: '',
                });
                setTimeOffModalOpen(true);
                handleCloseContextMenu();
                toast.info('📝 Request time off for this day');
              }}>
                <ListItemIcon><TimeOffIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Request Time Off" />
              </MenuItem>
            )}
            
            {/* Manager can edit shift */}
            {isManagerRole && (
              <MenuItem onClick={() => {
                setSelectedShift(shiftContextMenu.shift);
                setEditModalOpen(true);
                handleCloseContextMenu();
              }}>
                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Edit Shift" />
              </MenuItem>
            )}
            
            {/* Manager can delete shift */}
            {isManagerRole && (
              <MenuItem onClick={() => {
                setSelectedShift(shiftContextMenu.shift);
                setDeleteConfirmOpen(true);
                handleCloseContextMenu();
              }} sx={{ color: 'error.main' }}>
                <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Delete Shift" />
              </MenuItem>
            )}

            {/* Copy shift to clipboard */}
            <MenuItem onClick={() => {
              setClipboardShift(shiftContextMenu.shift);
              handleCloseContextMenu();
              toast.success('📋 Shift copied to clipboard');
            }}>
              <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Copy Shift" />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* DAY EVENTS MODAL: Clean list of interactions for busy days */}
      <Dialog 
        open={dayEventsModalOpen} 
        onClose={() => setDayEventsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={!isDesktop} // MOBILE FIX
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">
              {selectedDayEvents && format(selectedDayEvents.date, 'EEEE, MMM d, yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedDayEvents?.events.length || 0} Scheduled Events
            </Typography>
          </Box>
          <IconButton onClick={() => setDayEventsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List sx={{ pt: 0 }}>
            {selectedDayEvents?.events.map((event, index) => {
              const { type, shift, timeOff, trade, holiday } = event.extendedProps;
              
              if (type === 'shift' && shift) {
                const employee = employees.find(e => e.id === shift.userId);
                return (
                  <ListItem key={index} sx={{ 
                    mb: 1, 
                    bgcolor: alpha(event.backgroundColor || theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(event.backgroundColor || theme.palette.primary.main, 0.2)}`
                  }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: event.backgroundColor || theme.palette.primary.main,
                          color: 'white', 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.8rem' 
                        }}
                      >
                        {employee?.firstName?.[0] || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {employee?.firstName} {employee?.lastName} - {shift.position || 'Staff'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                          {shift.notes && ` • ${shift.notes}`}
                        </Typography>
                      }
                    />
                    <Chip size="small" label="Shift" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </ListItem>
                );
              }
              
              if (type === 'timeOff' && timeOff) {
                const employee = employees.find(e => e.id === timeOff.userId);
                return (
                  <ListItem key={index} sx={{ 
                    mb: 1, 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TimeOffIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {employee?.firstName} {employee?.lastName}
                        </Typography>
                      }
                      secondary={`Time Off: ${timeOff.type} • ${timeOff.status}`}
                    />
                    <Chip 
                      size="small" 
                      label={timeOff.status} 
                      color={timeOff.status === 'approved' ? 'success' : 'warning'} 
                      sx={{ height: 20, fontSize: '0.65rem' }} 
                    />
                  </ListItem>
                );
              }

              // Handle pending time-off requests
              if ((type === 'time-off-pending' || type === 'time-off-approved') && event.extendedProps.timeOff) {
                const req = event.extendedProps.timeOff;
                return (
                  <ListItem key={index} sx={{ 
                    mb: 1, 
                    bgcolor: alpha(type === 'time-off-approved' ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(type === 'time-off-approved' ? theme.palette.success.main : theme.palette.warning.main, 0.2)}`,
                    borderStyle: type === 'time-off-pending' ? 'dashed' : 'solid'
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TimeOffIcon color={type === 'time-off-approved' ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {req.userName || 'Employee'} - {req.type}
                        </Typography>
                      }
                      secondary={req.reason || 'Time off request'}
                    />
                    <Chip 
                      size="small" 
                      label={req.status} 
                      color={req.status === 'approved' ? 'success' : 'warning'}
                      variant={req.status === 'pending' ? 'outlined' : 'filled'}
                      sx={{ height: 20, fontSize: '0.65rem' }} 
                    />
                  </ListItem>
                );
              }

              // Handle shift trades
              if (type === 'shift-trade' && event.extendedProps.trade) {
                const tradeData = event.extendedProps.trade;
                return (
                  <ListItem key={index} sx={{ 
                    mb: 1, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    borderStyle: 'dashed'
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SwapIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          🔄 {tradeData.requester?.firstName} → {tradeData.targetUser?.firstName}
                        </Typography>
                      }
                      secondary={tradeData.reason || 'Shift trade request'}
                    />
                    <Chip 
                      size="small" 
                      label={tradeData.status} 
                      color={tradeData.status === 'approved' ? 'success' : (tradeData.status === 'accepted' ? 'info' : 'warning')}
                      variant={tradeData.status === 'pending' ? 'outlined' : 'filled'}
                      sx={{ height: 20, fontSize: '0.65rem' }} 
                    />
                  </ListItem>
                );
              }

              // Handle holidays
              if (type === 'holiday' && event.extendedProps.holiday) {
                const holidayData = event.extendedProps.holiday;
                return (
                  <ListItem key={index} sx={{ 
                    mb: 1, 
                    bgcolor: alpha(holidayData.workAllowed ? theme.palette.success.main : theme.palette.error.main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(holidayData.workAllowed ? theme.palette.success.main : theme.palette.error.main, 0.2)}`
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <MorningIcon color={holidayData.workAllowed ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          🎉 {holidayData.name}
                        </Typography>
                      }
                      secondary={holidayData.workAllowed ? 'Work allowed (special rates)' : 'No work allowed'}
                    />
                    <Chip 
                      size="small" 
                      label={holidayData.type?.replace('_', ' ') || 'Holiday'} 
                      color={holidayData.workAllowed ? 'success' : 'error'}
                      sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }} 
                    />
                  </ListItem>
                );
              }
              
              return null;
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDayEventsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
};

export default EnhancedScheduler;
