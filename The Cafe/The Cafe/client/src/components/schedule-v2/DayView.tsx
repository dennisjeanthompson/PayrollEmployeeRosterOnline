import React from 'react';
import {
  Box, Typography, Avatar, Chip, useTheme, IconButton, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Add as AddIcon,
  Edit as EditIcon,
  SwapHoriz as SwapIcon,
  BeachAccess as TimeOffIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ApprovedIcon,
} from '@mui/icons-material';
import { format, addDays, subDays, isToday, differenceInHours, isValid } from 'date-fns';
import { getRoleColor } from '@/lib/schedule-theme';
import type { Shift, Employee, Holiday, TimeOffRequest, ShiftTrade } from './types';

// Safe date helpers to prevent RangeError crashes
function toDate(val: any): Date {
  if (!val) return new Date(0);
  const d = val instanceof Date ? val : new Date(val);
  return isValid(d) ? d : new Date(0);
}
function toDateStr(val: any): string {
  return format(toDate(val), 'yyyy-MM-dd');
}
function safeFormat(val: any, fmt: string): string {
  try { return format(toDate(val), fmt); } catch { return '--'; }
}

interface DayViewProps {
  employees: Employee[];
  shifts: Shift[];
  date: Date;
  holidays: Holiday[];
  isManager: boolean;
  currentUserId: string;
  timeOffRequests?: TimeOffRequest[];
  shiftTrades?: ShiftTrade[];
  onDateChange: (date: Date) => void;
  onCreateShift: (employeeId: string, date: Date) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteTimeOff?: (id: string) => void;
}

/** Employee's personal day view — shows only their shifts + their requests */
export function MyDayView({
  shifts,
  date,
  currentUserId,
  onDateChange,
  timeOffRequests = [],
  shiftTrades = [],
}: Pick<DayViewProps, 'shifts' | 'date' | 'currentUserId' | 'onDateChange' | 'timeOffRequests' | 'shiftTrades'>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dateStr = format(date, 'yyyy-MM-dd');
  const myShifts = shifts.filter(
    s => s.userId === currentUserId && toDateStr(s.startTime) === dateStr
  );

  // Time-off for this user on this date
  const myTimeOff = timeOffRequests.filter(r =>
    r.userId === currentUserId && dateStr >= toDateStr(r.startDate) && dateStr <= toDateStr(r.endDate)
    && (r.status === 'pending' || r.status === 'approved' || r.status === 'rejected')
  );

  // Trades for my shifts on this day
  const myTrades = shiftTrades.filter(t => {
    const shiftIds = myShifts.map(s => s.id);
    return shiftIds.includes(t.shiftId) && (t.status === 'pending' || t.status === 'accepted');
  });

  return (
    <Box>
      {/* Day navigator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => onDateChange(subDays(date, 1))} size="small">
          <PrevIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: isToday(date) ? 'primary.main' : 'text.primary' }}>
            {isToday(date) ? 'Today' : format(date, 'EEEE')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(date, 'MMMM d, yyyy')}
          </Typography>
        </Box>
        <IconButton onClick={() => onDateChange(addDays(date, 1))} size="small">
          <NextIcon />
        </IconButton>
      </Box>

      {/* My time-off requests for this day */}
      {myTimeOff.map(req => {
        const statusConfig = {
          pending: { bg: '#FEF3C7', border: '#FDE68A', color: '#92400E', icon: <PendingIcon sx={{ fontSize: 16, color: '#F59E0B' }} />, label: 'Pending Approval' },
          approved: { bg: '#DCFCE7', border: '#A7F3D0', color: '#166534', icon: <ApprovedIcon sx={{ fontSize: 16, color: '#10B981' }} />, label: 'Approved' },
          rejected: { bg: '#FEE2E2', border: '#FECACA', color: '#991B1B', icon: <TimeOffIcon sx={{ fontSize: 16, color: '#EF4444' }} />, label: 'Rejected' },
        }[req.status] || { bg: '#F3F4F6', border: '#D1D5DB', color: '#6B7280', icon: <TimeOffIcon sx={{ fontSize: 16 }} />, label: req.status };

        return (
          <Box
            key={`timeoff-${req.id}`}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 1.5, mb: 1.5, borderRadius: 2.5,
              bgcolor: isDark ? alpha(statusConfig.bg, 0.15) : statusConfig.bg,
              border: `1px ${req.status === 'pending' ? 'dashed' : 'solid'}`,
              borderColor: statusConfig.border,
            }}
          >
            {statusConfig.icon}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: statusConfig.color }}>
                {req.type.charAt(0).toUpperCase() + req.type.slice(1)} Leave
              </Typography>
              <Typography variant="caption" sx={{ color: statusConfig.color, opacity: 0.8 }}>
                {statusConfig.label}
                {req.reason && ` · "${req.reason}"`}
              </Typography>
            </Box>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'transparent', color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}
            />
          </Box>
        );
      })}

      {/* My shifts */}
      {myShifts.length === 0 && myTimeOff.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>☕</Typography>
          <Typography variant="h6" fontWeight={700}>Day Off</Typography>
          <Typography variant="body2" color="text.secondary">No shifts scheduled</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {myShifts.map(shift => {
            const rc = getRoleColor(shift.position, shift.user?.role);
            const hours = differenceInHours(toDate(shift.endTime), toDate(shift.startTime));
            const startHour = toDate(shift.startTime).getHours();
            const period = startHour < 12 ? '🌅 Morning' : startHour < 17 ? '☀️ Afternoon' : '🌙 Evening';
            const trade = myTrades.find(t => t.shiftId === shift.id);

            return (
              <Box
                key={shift.id}
                sx={{
                  borderRadius: 3, overflow: 'hidden',
                  border: trade ? '2px dashed' : '1px solid',
                  borderColor: trade
                    ? (trade.status === 'accepted' ? '#3B82F6' : '#8B5CF6')
                    : (isDark ? '#3D3228' : '#E8E0D4'),
                  bgcolor: isDark ? '#2A2018' : '#FFFFFF',
                }}
              >
                <Box sx={{
                  px: 2, py: 1.5,
                  bgcolor: isDark ? alpha(rc.bg, 0.15) : alpha(rc.bg, 0.1),
                  color: isDark ? rc.bgLight : rc.bgDark,
                  borderBottom: `1px solid ${alpha(rc.border, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Typography variant="subtitle2" fontWeight={700}>{period}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trade && (
                      <Chip
                        icon={<SwapIcon sx={{ fontSize: 14, color: 'inherit' }} />}
                        label={trade.status === 'accepted' ? 'Traded' : 'Trade Pending'}
                        size="small"
                        sx={{
                          height: 22, fontSize: '0.6rem', fontWeight: 700,
                          bgcolor: alpha(rc.bg, 0.2), color: isDark ? rc.bgLight : rc.bgDark,
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    )}
                    <Chip label={shift.position || 'Staff'} size="small" sx={{ height: 22, bgcolor: alpha(rc.bg, 0.2), color: isDark ? rc.bgLight : rc.bgDark, fontWeight: 700, border: `1px solid ${alpha(rc.border, 0.3)}` }} />
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    {safeFormat(shift.startTime, 'h:mm a')} – {safeFormat(shift.endTime, 'h:mm a')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hours} hours
                  </Typography>
                  {shift.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                      Note: {shift.notes}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/** Manager's day view — shows all employees' shifts for a day */
export default function DayView({
  employees,
  shifts,
  date,
  holidays,
  isManager,
  currentUserId,
  timeOffRequests = [],
  shiftTrades = [],
  onDateChange,
  onCreateShift,
  onEditShift,
  onDeleteTimeOff,
}: DayViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayShifts = shifts.filter(s => toDateStr(s.startTime) === dateStr);
  const holiday = holidays.find(h => format(toDate(h.date), 'yyyy-MM-dd') === dateStr);

  // Time-off for today
  const dayTimeOff = timeOffRequests.filter(r =>
    dateStr >= toDateStr(r.startDate) && dateStr <= toDateStr(r.endDate) &&
    (r.status === 'pending' || r.status === 'approved')
  );

  // Active trades
  const activeTrades = shiftTrades.filter(t => t.status === 'pending' || t.status === 'accepted');

  // Sort shifts by start time
  const sortedShifts = [...dayShifts].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <Box>
      {/* Day navigator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => onDateChange(subDays(date, 1))}>
          <PrevIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: isToday(date) ? 'primary.main' : 'text.primary' }}>
            {format(date, 'EEEE, MMMM d')}
            {isToday(date) && <Chip label="Today" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />}
          </Typography>
          {holiday && (
            <Chip
              label={`${holiday.workAllowed ? '📅' : '🚫'} ${holiday.name}`}
              size="small"
              color={holiday.workAllowed ? 'success' : 'error'}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
        <IconButton onClick={() => onDateChange(addDays(date, 1))}>
          <NextIcon />
        </IconButton>
      </Box>

      {/* Staff count summary */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2,
        p: 1.5, borderRadius: 2,
        bgcolor: isDark ? '#342A1E' : '#F5F0E8',
        flexWrap: 'wrap',
      }}>
        <Typography variant="body2" fontWeight={600}>
          {sortedShifts.length} shift{sortedShifts.length !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">·</Typography>
        <Typography variant="body2" color="text.secondary">
          {new Set(sortedShifts.map(s => s.userId)).size} employees working
        </Typography>
        {dayTimeOff.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary">·</Typography>
            <Chip
              icon={<TimeOffIcon sx={{ fontSize: 14 }} />}
              label={`${dayTimeOff.length} time-off`}
              size="small"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#FEF3C7', color: '#92400E', '& .MuiChip-icon': { color: '#F59E0B' } }}
            />
          </>
        )}
        {activeTrades.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary">·</Typography>
            <Chip
              icon={<SwapIcon sx={{ fontSize: 14 }} />}
              label={`${activeTrades.length} trade${activeTrades.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F5F3FF', color: '#7C3AED', '& .MuiChip-icon': { color: '#8B5CF6' } }}
            />
          </>
        )}
      </Box>

      {/* Time-off requests for this day */}
      {dayTimeOff.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {dayTimeOff.map(req => {
            const emp = employees.find(e => e.id === req.userId);
            const isPending = req.status === 'pending';
            return (
              <Box
                key={`to-${req.id}`}
                onClick={() => {
                  if (isManager && onDeleteTimeOff && window.confirm('Are you sure you want to delete this time-off request?')) {
                    onDeleteTimeOff(req.id);
                  }
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.5, borderRadius: 2,
                  border: `1px ${isPending ? 'dashed' : 'solid'}`,
                  borderColor: isPending ? '#FDE68A' : '#A7F3D0',
                  bgcolor: isPending ? (isDark ? alpha('#F59E0B', 0.08) : '#FFFBEB') : (isDark ? alpha('#10B981', 0.08) : '#F0FDF4'),
                  ...(isManager && onDeleteTimeOff && {
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    '&:hover': { filter: 'brightness(0.95)', transform: 'translateY(-1px)' }
                  }),
                }}
              >
                {isPending ? <PendingIcon sx={{ fontSize: 18, color: '#F59E0B' }} /> : <ApprovedIcon sx={{ fontSize: 18, color: '#10B981' }} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {emp ? `${emp.firstName} ${emp.lastName}` : (req.userName || 'Unknown')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {req.type.charAt(0).toUpperCase() + req.type.slice(1)} Leave · {isPending ? 'Pending' : 'Approved'}
                    {isManager && onDeleteTimeOff && ' · (Click to delete)'}
                  </Typography>
                </Box>
                <Chip
                  label={isPending ? 'Pending' : 'Approved'}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.6rem', fontWeight: 700,
                    bgcolor: isPending ? '#FEF3C7' : '#DCFCE7',
                    color: isPending ? '#92400E' : '#166534',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Shift list */}
      {sortedShifts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>📭</Typography>
          <Typography variant="h6" fontWeight={700}>No shifts scheduled</Typography>
          <Typography variant="body2" color="text.secondary">
            {date.getDay() === 0 ? 'Sunday is a rest day' : 'Click + to add a shift'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sortedShifts.map(shift => {
            const emp = employees.find(e => e.id === shift.userId);
            const rc = getRoleColor(shift.position, emp?.role);
            const hours = differenceInHours(toDate(shift.endTime), toDate(shift.startTime));
            const trade = activeTrades.find(t => t.shiftId === shift.id);

            return (
              <Box
                key={shift.id}
                onClick={() => onEditShift(shift)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  p: 2, borderRadius: 2.5,
                  border: trade ? '2px dashed' : '1px solid',
                  borderColor: trade
                    ? (trade.status === 'accepted' ? '#93C5FD' : '#C4B5FD')
                    : (isDark ? '#3D3228' : '#E8E0D4'),
                  borderLeft: `5px solid ${rc.bg}`,
                  bgcolor: isDark ? '#2A2018' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isDark ? '#342A1E' : '#FBF8F4',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Avatar sx={{ width: 44, height: 44, bgcolor: rc.bg, color: rc.text, fontWeight: 700, fontSize: '0.85rem' }}>
                  {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={700} noWrap>
                    {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={shift.position || 'Staff'} sx={{
                      height: 20, fontSize: '0.62rem', fontWeight: 600,
                      bgcolor: isDark ? rc.bgDark : rc.bgLight, color: isDark ? rc.text : rc.bg,
                    }} />
                    <Typography variant="caption" color="text.secondary">
                      {safeFormat(shift.startTime, 'h:mm a')} – {safeFormat(shift.endTime, 'h:mm a')} · {hours}h
                    </Typography>
                    {trade && (
                      <Chip
                        icon={<SwapIcon sx={{ fontSize: 12 }} />}
                        label={trade.status === 'accepted' ? 'Traded' : 'Trade Pending'}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.58rem', fontWeight: 700,
                          bgcolor: trade.status === 'accepted' ? '#DBEAFE' : '#F5F3FF',
                          color: trade.status === 'accepted' ? '#1E40AF' : '#7C3AED',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    )}
                  </Box>
                </Box>
                {isManager && <EditIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Add shift button for managers */}
      {isManager && (
        <Box
          onClick={() => onCreateShift('', date)}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            mt: 2, py: 1.5, borderRadius: 2.5,
            border: '2px dashed',
            borderColor: isDark ? '#3D3228' : '#D4C4A8',
            color: 'text.secondary', cursor: 'pointer',
            fontWeight: 600,
            '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>Add Shift</Typography>
        </Box>
      )}
    </Box>
  );
}
