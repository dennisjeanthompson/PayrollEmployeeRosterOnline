import React from 'react';
import {
  Box, Typography, Avatar, Chip, Tooltip, IconButton,
  useTheme, useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Add as AddIcon, Edit as EditIcon,
  SwapHoriz as SwapIcon,
  BeachAccess as TimeOffIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Check as CheckIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { format, addDays, isSameDay, isToday, differenceInHours, isWithinInterval, parseISO, isValid } from 'date-fns';
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
  try {
    const d = toDate(val);
    return format(d, fmt);
  } catch { return '--'; }
}

interface WeeklyGridProps {
  employees: Employee[];
  shifts: Shift[];
  weekStart: Date;
  holidays: Holiday[];
  isManager: boolean;
  timeOffRequests?: TimeOffRequest[];
  shiftTrades?: ShiftTrade[];
  adjustmentLogs?: any[];
  currentUserId?: string;
  isSelectionMode?: boolean;
  selectedShifts?: Set<string>;
  selectedLogs?: Set<string>;
  onToggleShiftSelection?: (id: string) => void;
  onToggleLogSelection?: (id: string) => void;
  onManageLogGroup?: (logs: any[]) => void;
  onCreateShift: (employeeId: string, date: Date) => void;
  onEditShift: (shift: Shift) => void;
  onOpenRequests?: () => void;
  onDeleteTimeOff?: (id: string) => void;
  onAddHolidayPay?: (userId: string, date: Date) => void;
  onExceptionLogClick?: (log: any) => void;
}

/** Generate array of 7 days: Mon–Sun */
function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** Get shifts for a specific employee on a specific date */
function getShiftsForCell(shifts: Shift[], employeeId: string, date: Date): Shift[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return shifts.filter(
    s => String(s.userId) === String(employeeId) && toDateStr(s.startTime) === dateStr
  );
}

/** Find holiday on a given date */
function getHoliday(holidays: Holiday[], date: Date): Holiday | undefined {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.find(h => format(new Date(h.date), 'yyyy-MM-dd') === dateStr);
}

/** Get time-off requests that overlap a specific date for an employee */
function getTimeOffForCell(requests: TimeOffRequest[], employeeId: string, date: Date): TimeOffRequest[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return requests.filter(r => {
    if (String(r.userId) !== String(employeeId)) return false;
    const start = toDateStr(r.startDate);
    const end = toDateStr(r.endDate);
    return dateStr >= start && dateStr <= end;
  });
}

/** Get shift trades for shifts on a specific date for an employee */
function getTradesForCell(trades: ShiftTrade[], shifts: Shift[], employeeId: string, date: Date): ShiftTrade[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  const shiftIds = shifts
    .filter(s => String(s.userId) === String(employeeId) && toDateStr(s.startTime) === dateStr)
    .map(s => s.id);
  return trades.filter(t =>
    shiftIds.includes(t.shiftId) &&
    (t.status === 'pending' || t.status === 'accepted')
  );
}

/** Check if a shift has a pending/accepted trade */
function getTradeForShift(trades: ShiftTrade[], shiftId: string): ShiftTrade | undefined {
  return trades.find(t => t.shiftId === shiftId && (t.status === 'pending' || t.status === 'accepted'));
}

const TIME_OFF_STATUS_CONFIG = {
  pending: { color: '#F59E0B', bgColor: '#FEF3C7', borderColor: '#FDE68A', icon: PendingIcon, label: 'Pending' },
  approved: { color: '#10B981', bgColor: '#DCFCE7', borderColor: '#A7F3D0', icon: ApprovedIcon, label: 'Approved' },
  rejected: { color: '#EF4444', bgColor: '#FEE2E2', borderColor: '#FECACA', icon: RejectedIcon, label: 'Rejected' },
} as const;

/** Full-width time-off event banner for calendar cells */
function TimeOffIndicator({ request, compact = false, onDelete }: { request: TimeOffRequest; compact?: boolean; onDelete?: (id: string) => void }) {
  const config = TIME_OFF_STATUS_CONFIG[request.status as keyof typeof TIME_OFF_STATUS_CONFIG] || TIME_OFF_STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const typeLabel = request.type.charAt(0).toUpperCase() + request.type.slice(1);
  
  const isApproved = request.status === 'approved';
  const isPaid = request.isPaid;
  const paidLabel = isApproved ? (isPaid ? 'PAID' : 'UNPAID') : config.label;

  const dynamicBg = isApproved ? (isPaid ? '#059669' : config.bgColor) : config.bgColor;
  const dynamicColor = isApproved ? (isPaid ? '#FFFFFF' : config.color) : config.color;
  
  return (
    <Tooltip title={`${typeLabel} Leave · ${paidLabel}${request.reason ? `\n"${request.reason}"` : ''}${onDelete ? '\n(Click to view/edit)' : ''}`} arrow placement="top">
      <Box 
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={onDelete ? { scale: 1.02, y: -2 } : { scale: 1.02 }}
        whileTap={onDelete ? { scale: 0.98 } : {}}
        onClick={onDelete ? (e: any) => { e.stopPropagation(); onDelete(request.id); } : undefined}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          width: '100%', minHeight: 28, px: 1, py: 0.4, borderRadius: 1.5,
          bgcolor: dynamicBg,
          color: dynamicColor,
          cursor: onDelete ? 'pointer' : 'default',
          border: request.status === 'pending' ? '1.5px dashed' : '1.5px solid',
          borderColor: isPaid ? '#047857' : config.borderColor,
          fontSize: '0.72rem', fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s',
          overflow: 'hidden',
          '&:hover': onDelete ? { filter: 'brightness(0.92)', boxShadow: '0 6px 14px rgba(0,0,0,0.12)' } : {}
        }}>
        <StatusIcon sx={{ fontSize: 14, flexShrink: 0 }} />
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {compact ? typeLabel : `${typeLabel} Leave`}
        </Box>
        <Box component="span" sx={{ 
          fontSize: '0.58rem', fontWeight: 800, opacity: 0.8, flexShrink: 0,
          bgcolor: isPaid ? alpha('#FFFFFF', 0.2) : alpha(config.color, 0.12), px: 0.5, py: 0.1, borderRadius: 1,
        }}>
          {isPaid ? '₱' : paidLabel}
        </Box>
      </Box>
    </Tooltip>
  );
}

/** Prominent trade badge pill on shift pills */
function TradeBadge({ trade }: { trade: ShiftTrade }) {
  const isAccepted = trade.status === 'accepted';
  const targetName = trade.targetUser?.firstName || trade.toUser?.firstName || '';
  const label = isAccepted
    ? `Trade accepted${targetName ? ` by ${targetName}` : ''} · Awaiting manager approval`
    : `Trade requested${targetName ? ` → ${targetName}` : ' (open)'}`;

  return (
    <Tooltip title={label} arrow placement="top">
      <Box sx={{
        position: 'absolute', top: -8, right: -4,
        display: 'flex', alignItems: 'center', gap: 0.3,
        px: 0.6, py: 0.15, borderRadius: 1,
        bgcolor: isAccepted ? '#3B82F6' : '#8B5CF6',
        color: '#FFFFFF',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 2,
        fontSize: '0.52rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}>
        <SwapIcon sx={{ fontSize: 10 }} />
        {isAccepted ? 'Traded' : 'Trading'}
      </Box>
    </Tooltip>
  );
}

// Shift pill — the colored chip inside each cell
function ShiftPill({ shift, onClick, trade, isSelectionMode, isSelected }: { shift: Shift; onClick?: () => void; trade?: ShiftTrade; isSelectionMode?: boolean; isSelected?: boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const rc = getRoleColor(shift.position, shift.user?.role);
  const startStr = safeFormat(shift.startTime, 'h:mm a').toLowerCase();
  const endStr = safeFormat(shift.endTime, 'h:mm a').toLowerCase();
  const hours = differenceInHours(toDate(shift.endTime), toDate(shift.startTime));
  const hasTrade = !!trade;

  return (
    <Tooltip
      title={`${shift.position || 'Staff'} · ${safeFormat(shift.startTime, 'h:mm a')} – ${safeFormat(shift.endTime, 'h:mm a')} (${hours}h)${shift.notes ? `\n${shift.notes}` : ''}${hasTrade ? `\n⇄ Trade ${trade.status}` : ''}`}
      arrow
      placement="top"
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 0.75,
          py: 0.6,
          borderRadius: 1.5,
          bgcolor: hasTrade ? alpha(rc.bg, 0.4) : alpha(rc.bg, 0.25),
          border: '1px solid',
          borderColor: alpha(rc.border, 0.5),
          borderLeft: `4px solid ${rc.bg}`,
          color: isDark ? alpha(rc.bgLight, 1) : rc.bgDark,
          cursor: 'pointer',
          fontSize: '0.68rem',
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          transition: 'box-shadow 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'visible',
          ...(hasTrade && {
            outline: '2px dashed',
            outlineColor: trade.status === 'accepted' ? '#3B82F6' : '#8B5CF6',
            outlineOffset: 1,
          }),
          '&:hover': onClick ? {
            filter: 'brightness(0.92)',
            boxShadow: isSelected ? undefined : `0 6px 16px ${alpha(rc.bg, 0.3)}`,
          } : {},
        }}
      >
        {isSelectionMode && (
          <Box sx={{
            position: 'absolute', top: -6, right: -6,
            bgcolor: isSelected ? 'primary.main' : 'background.paper',
            color: isSelected ? '#fff' : 'transparent',
            border: '2px solid',
            borderColor: isSelected ? 'primary.main' : 'text.disabled',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isSelected ? 2 : 1, zIndex: 12,
            transition: 'all 0.2s'
          }}>
            {isSelected && <CheckIcon sx={{ fontSize: 12, fontWeight: 900 }} />}
          </Box>
        )}
        {hasTrade && <TradeBadge trade={trade} />}
        {startStr}-{endStr}
      </Box>
    </Tooltip>
  );
}

/** Get adjustment logs for an employee on a specific date */
export function getAdjustmentsForCell(logs: any[], employeeId: string, date: Date): any[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return logs.filter(
    l => String(l.employeeId) === String(employeeId) && toDateStr(l.startDate || l.date) === dateStr && l.status !== 'rejected'
  );
}

const ADJ_TYPE_CONFIG: Record<string, { label: string, color: string, bgColor: string }> = {
  late: { label: 'Late', color: '#c2410c', bgColor: '#ffedd5' }, // orange
  overtime: { label: 'OT', color: '#15803d', bgColor: '#dcfce7' }, // green
  rest_day_ot: { label: 'RD OT', color: '#1d4ed8', bgColor: '#dbeafe' }, // blue
  special_holiday_ot: { label: 'SH OT', color: '#b45309', bgColor: '#fef3c7' }, // amber
  regular_holiday_ot: { label: 'RH OT', color: '#b91c1c', bgColor: '#fee2e2' }, // red
  night_diff: { label: 'ND', color: '#6d28d9', bgColor: '#ede9fe' }, // violet
  undertime: { label: 'UT', color: '#be185d', bgColor: '#fce7f3' }, // pink
  absent: { label: 'Absent', color: '#991b1b', bgColor: '#fee2e2' }, // red
  holiday_pay: { label: 'Holiday Pay', color: '#047857', bgColor: '#10b98122' } // emerald
};

/** Prominent pill for exception logs (OT/Late) */
export function AdjustmentBadge({ log, isSelectionMode, isSelected, onClick }: { log: any; isSelectionMode?: boolean; isSelected?: boolean; onClick?: (e: any) => void }) {
  const isTime = log.type === 'late' || log.type === 'undertime';
  const unit = log.type === 'holiday_pay' ? '' : isTime ? 'm' : log.type === 'absent' ? 'd' : 'h';
  const config = ADJ_TYPE_CONFIG[log.type] || { label: log.type, color: '#444', bgColor: '#eee' };
  const isExcluded = log.isIncluded === false;
  
  const iconMap: Record<string, string> = { late: '⏰', undertime: '📉', absent: '❌', holiday_pay: '💰' };
  const icon = iconMap[log.type] || '⚡';

  // Status indicator colors
  const statusDot: Record<string, { color: string; pulse: boolean }> = {
    pending: { color: '#f59e0b', pulse: true },
    employee_verified: { color: '#10b981', pulse: false },
    disputed: { color: '#ef4444', pulse: true },
    approved: { color: '#3b82f6', pulse: false },
    rejected: { color: '#6b7280', pulse: false },
  };
  const dot = statusDot[log.status] || statusDot.pending;

  const isGrouped = log.count && log.count > 1;
  const tooltipText = isGrouped 
    ? `${config.label} (${log.count} records): ${log.value}${unit}${isExcluded ? ' (Excluded)' : ''}\n${log.logs?.map((l: any) => `- ${l.value}${unit}${l.remarks ? ` "${l.remarks}"` : ''}`).join('\n')}`
    : `${config.label}: ${log.value}${unit}${isExcluded ? ' (Excluded from payroll)' : ''}${log.status === 'disputed' ? '\n⚠️ Disputed by employee' : log.status === 'employee_verified' ? '\n✅ Confirmed by employee' : ''}${log.remarks ? `\n"${log.remarks}"` : ''}`;

  return (
    <Tooltip title={tooltipText} arrow placement="top" sx={{ whiteSpace: 'pre-line' }}>
      <Box
        onClick={onClick}
        sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        position: 'relative',
        width: '100%', minHeight: 28, px: 1, py: 0.4, borderRadius: 1.5,
        bgcolor: isExcluded ? alpha(config.bgColor, 0.4) : config.bgColor,
        borderLeft: `3px solid ${isExcluded ? alpha(config.color, 0.3) : config.color}`,
        border: log.status === 'disputed' ? '2px solid' : '1px solid',
        borderColor: isSelected ? '#3B82F6' : log.status === 'disputed' ? alpha('#ef4444', 0.5) : alpha(config.color, isExcluded ? 0.1 : 0.25),
        fontSize: '0.72rem', fontWeight: 700,
        color: isExcluded ? alpha(config.color, 0.4) : config.color,
        cursor: onClick ? 'pointer' : 'default',
        opacity: isExcluded ? 0.55 : 1,
        boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 4px 12px rgba(59, 130, 246, 0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
        transform: isSelected ? 'scale(1.02)' : 'none',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        '&:hover': onClick ? { filter: 'brightness(0.92)', transform: isSelected ? 'scale(1.02)' : 'translateY(-1px)', boxShadow: isSelected ? undefined : '0 3px 8px rgba(0,0,0,0.1)' } : {}
      }}>
        {/* Status indicator dot */}
        <Box sx={{
          position: 'absolute', top: 3, right: 3,
          width: 6, height: 6, borderRadius: '50%',
          bgcolor: dot.color,
          boxShadow: `0 0 4px ${dot.color}`,
          animation: dot.pulse ? 'statusPulse 2s infinite' : 'none',
          '@keyframes statusPulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
          zIndex: 5,
        }} />
        {isSelectionMode && (
          <Box sx={{
            position: 'absolute', top: -6, right: -6,
            bgcolor: isSelected ? 'primary.main' : 'background.paper',
            color: isSelected ? '#fff' : 'transparent',
            border: '2px solid',
            borderColor: isSelected ? 'primary.main' : 'text.disabled',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isSelected ? 2 : 1, zIndex: 12,
            transition: 'all 0.2s'
          }}>
            {isSelected && <CheckIcon sx={{ fontSize: 12, fontWeight: 900 }} />}
          </Box>
        )}
        <Box component="span" sx={{ flexShrink: 0 }}>{icon}</Box>
        <Box component="span" sx={{ 
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          textDecoration: isExcluded ? 'line-through' : 'none',
        }}>
          {isGrouped ? `${log.count}x ${config.label}` : config.label}
        </Box>
        <Box component="span" sx={{ 
          fontSize: '0.62rem', fontWeight: 800, flexShrink: 0,
          bgcolor: alpha(config.color, isExcluded ? 0.08 : 0.15), px: 0.5, py: 0.1, borderRadius: 1,
          textDecoration: isExcluded ? 'line-through' : 'none',
        }}>
          {log.value}{unit}
        </Box>
      </Box>
    </Tooltip>
  );
}

export default function WeeklyGrid({
  employees,
  shifts,
  weekStart,
  holidays,
  isManager,
  timeOffRequests = [],
  shiftTrades = [],
  adjustmentLogs = [],
  currentUserId,
  onCreateShift,
  onEditShift,
  onOpenRequests,
  onDeleteTimeOff,
  onAddHolidayPay,
  isSelectionMode,
  selectedShifts,
  selectedLogs,
  onToggleShiftSelection,
  onToggleLogSelection,
  onManageLogGroup,
  onExceptionLogClick,
}: WeeklyGridProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const weekDays = getWeekDays(weekStart);

  // Filter to only relevant time-off (pending + approved visible on calendar, rejected transiently)
  const visibleTimeOff = timeOffRequests.filter(r => r.status === 'pending' || r.status === 'approved');
  const recentRejections = timeOffRequests.filter(r => {
    if (r.status !== 'rejected') return false;
    // Show rejected for 24h after rejection
    const rejectedAt = r.approvalDate
      ? new Date(r.approvalDate)
      : (r as any).updatedAt ? new Date((r as any).updatedAt) : new Date(r.requestedAt);
    return (Date.now() - rejectedAt.getTime()) < 24 * 60 * 60 * 1000;
  });
  const allVisibleTimeOff = [...visibleTimeOff, ...recentRejections];

  // Active trades (pending or accepted)
  const activeTrades = shiftTrades.filter(t => t.status === 'pending' || t.status === 'accepted');

  // On mobile, render a vertical card layout instead of a wide table
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weekDays.map(date => {
          const holiday = getHoliday(holidays, date);
          const dayShifts = shifts.filter(s => toDateStr(s.startTime) === format(date, 'yyyy-MM-dd'));
          const today = isToday(date);

          return (
            <Box
              key={date.toISOString()}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: today ? 'primary.main' : (isDark ? '#3D3228' : '#E8E0D4'),
                bgcolor: today
                  ? alpha(theme.palette.primary.main, 0.04)
                  : (isDark ? '#2A2018' : '#FFFFFF'),
                overflow: 'hidden',
              }}
            >
              {/* Day header */}
              <Box sx={{
                px: 2, py: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: today
                  ? alpha(theme.palette.primary.main, 0.08)
                  : (isDark ? '#342A1E' : '#F5F0E8'),
                borderBottom: '1px solid',
                borderColor: isDark ? '#3D3228' : '#E8E0D4',
              }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: today ? 'primary.main' : 'text.primary' }}>
                    {format(date, 'EEEE')}
                    {today && <Chip label="Today" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(date, 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {holiday && (
                    <Chip
                      label={holiday.name}
                      size="small"
                      color={holiday.workAllowed ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.62rem' }}
                    />
                  )}
                  <Chip label={`${dayShifts.length} shift${dayShifts.length !== 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                </Box>
              </Box>

              {/* Shift cards for this day + time-off indicators */}
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Time-off indicators for this day (mobile: show all employees) */}
                {employees.map(emp => {
                  const dayTimeOff = getTimeOffForCell(allVisibleTimeOff, emp.id, date);
                  const dayAdjustments = getAdjustmentsForCell(adjustmentLogs, emp.id, date);
                  if (dayTimeOff.length === 0 && dayAdjustments.length === 0) return null;
                  
                  return (
                    <Box key={`emp-status-${emp.id}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {dayTimeOff.map(req => (
                        <Box key={`to-${req.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem', minWidth: 60 }}>
                            {emp.firstName} {emp.lastName?.[0]}.
                          </Typography>
                          <TimeOffIndicator request={req} />
                        </Box>
                      ))}
                      {dayAdjustments.map(log => (
                        <Box key={`adj-${log.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem', minWidth: 60 }}>
                            {emp.firstName} {emp.lastName?.[0]}.
                          </Typography>
                          <AdjustmentBadge log={log} onClick={() => onExceptionLogClick?.(log)} />
                        </Box>
                      ))}
                    </Box>
                  );
                })}

                {dayShifts.length === 0 && employees.every(emp => getTimeOffForCell(allVisibleTimeOff, emp.id, date).length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, fontStyle: 'italic' }}>
                    No shifts scheduled
                  </Typography>
                ) : (
                  dayShifts.map(shift => {
                    const emp = employees.find(e => e.id === shift.userId);
                    const rc = getRoleColor(shift.position, emp?.role);
                    const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
                    const trade = getTradeForShift(activeTrades, shift.id);

                    return (
                      <Box
                        key={shift.id}
                        onClick={() => onEditShift(shift)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: 1.5, borderRadius: 2,
                          border: '1px solid',
                          borderColor: trade
                            ? (trade.status === 'accepted' ? '#93C5FD' : '#C4B5FD')
                            : (isDark ? '#3D3228' : '#E8E0D4'),
                          borderLeft: `4px solid ${rc.bg}`,
                          bgcolor: isDark ? '#342A1E' : '#FBF8F4',
                          cursor: 'pointer',
                          position: 'relative',
                          '&:hover': { bgcolor: isDark ? '#3D3228' : '#F7F3ED' },
                        }}
                      >
                        {trade && (
                          <Box sx={{
                            position: 'absolute', top: 6, right: 6,
                            display: 'flex', alignItems: 'center', gap: 0.25,
                            px: 0.5, py: 0.15, borderRadius: 1,
                            bgcolor: trade.status === 'accepted' ? '#DBEAFE' : '#F5F3FF',
                            border: '1px solid',
                            borderColor: trade.status === 'accepted' ? '#93C5FD' : '#C4B5FD',
                          }}>
                            <SwapIcon sx={{ fontSize: 10, color: trade.status === 'accepted' ? '#3B82F6' : '#8B5CF6' }} />
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: trade.status === 'accepted' ? '#3B82F6' : '#8B5CF6' }}>
                              {trade.status === 'accepted' ? 'Traded' : 'Trading'}
                            </Typography>
                          </Box>
                        )}
                        <Avatar src={emp?.photoUrl || undefined} sx={{ width: 36, height: 36, bgcolor: rc.bg, color: rc.text, fontSize: '0.75rem', fontWeight: 700 }}>
                          {!emp?.photoUrl && <>{emp?.firstName?.[0]}{emp?.lastName?.[0]}</>}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shift.position || 'Staff'} · {safeFormat(shift.startTime, 'h:mm a')} – {safeFormat(shift.endTime, 'h:mm a')} ({hours}h)
                          </Typography>
                        </Box>
                        {isManager && <EditIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                      </Box>
                    );
                  })
                )}
                {isManager && (
                  <Box
                    onClick={() => onCreateShift('', date)}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                      py: 1, borderRadius: 2, border: '1px dashed',
                      borderColor: isDark ? '#3D3228' : '#D4C4A8',
                      color: 'text.secondary',
                      cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 600,
                      '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 18 }} /> Add Shift
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Desktop: Employee × Day table grid
  return (
    <Box sx={{
      width: '100%',
      overflow: 'auto',
      bgcolor: isDark ? '#2A2018' : '#FFFFFF',
      borderRadius: 3,
      border: '1px solid',
      borderColor: isDark ? '#3D3228' : '#E8E0D4',
      boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(92,64,51,0.06)',
    }}>
      {/* Table */}
      <Box component="table" sx={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
        {/* Header row: blank + days */}
        <Box component="thead">
          <Box component="tr">
            {/* Employee column header */}
            <Box
              component="th"
              sx={{
                width: 'auto', minWidth: 160, maxWidth: 220, p: 1.5,
                textAlign: 'left',
                borderBottom: '2px solid',
                borderColor: isDark ? '#3D3228' : '#E8E0D4',
                bgcolor: isDark ? '#342A1E' : '#FFFFFF',
                position: 'sticky', left: 0, zIndex: 2,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#C4AA88' : '#5C4033' }}>
                Employee
              </Typography>
            </Box>
            {/* Day columns */}
            {weekDays.map(date => {
              const today = isToday(date);
              const holiday = getHoliday(holidays, date);
              return (
                <Box
                  key={date.toISOString()}
                  component="th"
                  sx={{
                    p: 0,
                    minWidth: 120,
                    textAlign: 'center',
                    borderBottom: '2px solid',
                    borderColor: isDark ? '#3D3228' : '#E8E0D4',
                    bgcolor: today
                      ? alpha(theme.palette.warning.light, isDark ? 0.08 : 0.15)
                      : (isDark ? '#342A1E' : '#F5F0E8'),
                    borderLeft: '1px solid',
                    borderLeftColor: isDark ? '#3D3228' : '#E8E0D4',
                  }}
                >
                  <Box sx={{ p: 1.5, pb: holiday ? 0.5 : 1.5 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        textTransform: 'uppercase', letterSpacing: '0.03em',
                        color: today ? 'primary.main' : (isDark ? '#C4AA88' : '#5C4033'),
                        display: 'block',
                      }}
                    >
                      {format(date, 'EEE')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: today ? 'primary.main' : 'text.secondary', fontWeight: today ? 700 : 500 }}>
                      {format(date, 'MMM d')}
                    </Typography>
                  </Box>
                  {holiday && (
                    <Tooltip title={holiday.name} arrow placement="bottom">
                      <Box sx={{ 
                        width: '100%', 
                        bgcolor: holiday.workAllowed ? (isDark ? '#064E3B' : '#DCFCE7') : (isDark ? '#7F1D1D' : '#FEF2F2'),
                        color: holiday.workAllowed ? (isDark ? '#6EE7B7' : '#166534') : (isDark ? '#FCA5A5' : '#DC2626'),
                        py: 0.4, px: 0.75,
                        fontSize: '0.6rem', fontWeight: 700,
                        borderTop: '1px solid',
                        borderColor: holiday.workAllowed ? (isDark ? '#047857' : '#BBF7D0') : (isDark ? '#991B1B' : '#FECACA'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.4,
                        textAlign: 'center',
                      }}>
                        {holiday.name}
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Body: one row per employee */}
        <Box component="tbody">
          {employees.length === 0 && (
            <Box component="tr">
              <Box component="td" colSpan={7} sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No employees found</Typography>
              </Box>
            </Box>
          )}
          {employees.map(emp => {
            const rc = getRoleColor(emp.position, emp.role);
            const isInactive = emp.isActive === false;
            const weekHours = weekDays.reduce((sum, date) => {
              const cellShifts = getShiftsForCell(shifts, emp.id, date);
              return sum + cellShifts.reduce((s, sh) => s + differenceInHours(new Date(sh.endTime), new Date(sh.startTime)), 0);
            }, 0);

            return (
              <Box
                key={emp.id}
                component="tr"
                sx={{
                  opacity: isInactive ? 0.5 : 1,
                  '&:hover td': { bgcolor: isDark ? '#342A1E' : '#FBF8F4' },
                }}
              >
                {/* Employee name cell */}
                <Box
                  component="td"
                  sx={{
                    p: 1.5, borderBottom: '1px solid',
                    borderColor: isDark ? '#3D3228' : '#E8E0D4',
                    position: 'sticky', left: 0, zIndex: 1,
                    bgcolor: isDark ? '#2A2018' : '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={emp?.photoUrl || undefined} sx={{ width: 28, height: 28, bgcolor: rc.bg, color: rc.text, fontSize: '0.65rem', fontWeight: 700 }}>
                      {!emp?.photoUrl && <>{emp?.firstName?.[0]}{emp?.lastName?.[0]}</>}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        {emp.firstName} {emp.lastName?.[0]}.
                        {isInactive && <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}> (Off)</Box>}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <Chip
                          size="small"
                          label={emp.position || emp.role || 'Staff'}
                          sx={{
                            height: 16, fontSize: '0.55rem', fontWeight: 600,
                            bgcolor: isDark ? rc.bgDark : rc.bgLight,
                            color: isDark ? rc.text : rc.bg,
                          }}
                        />
                        <Typography variant="caption" sx={{
                          fontSize: '0.55rem', fontWeight: 700,
                          color: weekHours > 44 ? '#DC2626' : '#166534',
                        }}>
                          {weekHours}h
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Shift cells for each day */}
                {weekDays.map(date => {
                  const cellShifts = getShiftsForCell(shifts, emp.id, date);
                  const today = isToday(date);
                  const holiday = getHoliday(holidays, date);
                  const isBlocked = holiday && !holiday.workAllowed;
                  const cellTimeOff = getTimeOffForCell(allVisibleTimeOff, emp.id, date);
                  const cellAdjustments = getAdjustmentsForCell(adjustmentLogs, emp.id, date);
                  const hasTimeOff = cellTimeOff.length > 0;
                  const hasApprovedTimeOff = cellTimeOff.some(r => r.status === 'approved');

                  return (
                    <Box
                      key={date.toISOString()}
                      component="td"
                      sx={{
                        p: 1,
                        borderBottom: '1px solid',
                        borderLeft: '1px solid',
                        borderColor: isDark ? '#3D3228' : '#E8E0D4',
                        verticalAlign: 'top',
                        bgcolor: isBlocked
                          ? alpha(theme.palette.error.main, isDark ? 0.06 : 0.04)
                          : hasApprovedTimeOff
                            ? alpha('#F59E0B', isDark ? 0.06 : 0.06)
                            : today
                              ? alpha(theme.palette.primary.main, isDark ? 0.06 : 0.06)
                              : 'transparent',
                        overflow: 'visible',
                        transition: 'background-color 0.2s',
                        '&:hover .add-shift-btn': {
                          opacity: 1,
                          transform: 'scale(1)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 44,
                        overflow: 'visible',
                      }}>
                        {/* Shift pills with trade badge overlay FIRST for perfect horizontal alignment */}
                        {cellShifts.map(shift => {
                          const trade = getTradeForShift(activeTrades, shift.id);
                          return (
                            <ShiftPill 
                              key={shift.id} 
                              shift={shift} 
                              trade={trade}
                              isSelectionMode={isSelectionMode}
                              isSelected={isSelectionMode && selectedShifts?.has(shift.id)}
                              onClick={() => {
                                if (isSelectionMode && onToggleShiftSelection) {
                                  onToggleShiftSelection(shift.id);
                                } else {
                                  onEditShift(shift);
                                }
                              }} 
                            />
                          );
                        })}

                        {/* Exceptions & Time-off rendered BELOW shifts */}
                        {(cellTimeOff.length > 0 || cellAdjustments.length > 0) && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {cellTimeOff.map(req => (
                              <TimeOffIndicator 
                                key={`to-${req.id}`} 
                                request={req} 
                                compact
                                onDelete={isManager ? onDeleteTimeOff : undefined}
                              />
                            ))}
                            {(() => {
                              // Smart aggregation: Group by type + isIncluded
                              const grouped = new Map<string, any>();
                              cellAdjustments.forEach(log => {
                                const key = `${log.type}-${log.isIncluded}`;
                                if (!grouped.has(key)) {
                                  grouped.set(key, { ...log, value: parseFloat(log.value) || 0, count: 1, logs: [log] });
                                } else {
                                  const existing = grouped.get(key);
                                  existing.value += (parseFloat(log.value) || 0);
                                  existing.count++;
                                  existing.logs.push(log);
                                }
                              });
                              
                              return Array.from(grouped.values()).map(aggrLog => (
                                <AdjustmentBadge 
                                  key={`adj-group-${aggrLog.id}`} 
                                  log={aggrLog} 
                                  isSelectionMode={isSelectionMode}
                                  isSelected={isSelectionMode && selectedLogs?.has(aggrLog.id)} // In selection mode, maybe it only selects the first ID, which is a known limitation of bulk edits with grouped views
                                  onClick={() => {
                                    if (isSelectionMode && onToggleLogSelection) {
                                      // Toggle all individual IDs in the group
                                      aggrLog.logs.forEach((l: any) => onToggleLogSelection(l.id));
                                    } else if (!isSelectionMode && onManageLogGroup) {
                                      onManageLogGroup(aggrLog.logs);
                                    } else if (!isSelectionMode && onExceptionLogClick) {
                                      onExceptionLogClick(aggrLog.logs?.[0] || aggrLog);
                                    }
                                  }}
                                />
                              ));
                            })()}
                          </Box>
                        )}
                        {cellShifts.length === 0 && !hasApprovedTimeOff && isManager && !isSelectionMode && (
                          <Box className="add-shift-btn" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0, transform: 'scale(0.95)', transition: 'all 0.2s ease', '&:hover': { opacity: 1, transform: 'scale(1)' } }}>
                            {!isBlocked && (
                              <Tooltip title="Add shift" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => onCreateShift(emp.id, date)}
                                  sx={{
                                    width: '100%', height: 28,
                                    borderRadius: 1.5, border: '1px dashed',
                                    borderColor: isDark ? alpha('#C4AA88', 0.2) : alpha('#5C4033', 0.1),
                                    color: isDark ? alpha('#C4AA88', 0.3) : alpha('#5C4033', 0.2),
                                    '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                  }}
                                >
                                  <AddIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {holiday && onAddHolidayPay && !cellAdjustments.some(a => a.type === 'holiday_pay') && (
                              <Tooltip title="Grant Holiday Pay (No work performed)" placement="top">
                                <Box
                                  onClick={() => onAddHolidayPay(emp.id, date)}
                                  sx={{ width: '100%', height: 28, borderRadius: 1.5, border: '1px dashed', borderColor: '#10B981', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, '&:hover': { bgcolor: alpha('#10B981', 0.1) } }}
                                >
                                  + Holiday Pay
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        {/* Empty cells left cleanly blank */}
                        {isBlocked && cellShifts.length === 0 && !hasTimeOff && (
                          <Box sx={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minHeight: 32,
                            color: isDark ? alpha('#FCA5A5', 0.4) : alpha('#DC2626', 0.3),
                            fontSize: '0.6rem', fontWeight: 700, fontStyle: 'italic',
                          }}>
                            Blocked
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
