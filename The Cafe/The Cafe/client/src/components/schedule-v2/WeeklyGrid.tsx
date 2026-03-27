import React from 'react';
import {
  Box, Typography, Avatar, Chip, Tooltip, IconButton,
  useTheme, useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon, Edit as EditIcon,
  SwapHoriz as SwapIcon,
  BeachAccess as TimeOffIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { format, addDays, isSameDay, isToday, differenceInHours, isWithinInterval, parseISO } from 'date-fns';
import { getRoleColor } from '@/lib/schedule-theme';
import type { Shift, Employee, Holiday, TimeOffRequest, ShiftTrade } from './types';

interface WeeklyGridProps {
  employees: Employee[];
  shifts: Shift[];
  weekStart: Date;
  holidays: Holiday[];
  isManager: boolean;
  timeOffRequests?: TimeOffRequest[];
  shiftTrades?: ShiftTrade[];
  currentUserId?: string;
  onCreateShift: (employeeId: string, date: Date) => void;
  onEditShift: (shift: Shift) => void;
  onOpenRequests?: () => void;
}

/** Generate array of 7 days: Mon–Sun */
function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** Get shifts for a specific employee on a specific date */
function getShiftsForCell(shifts: Shift[], employeeId: string, date: Date): Shift[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return shifts.filter(
    s => s.userId === employeeId && s.startTime.startsWith(dateStr)
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
    if (r.userId !== employeeId) return false;
    return dateStr >= r.startDate.slice(0, 10) && dateStr <= r.endDate.slice(0, 10);
  });
}

/** Get shift trades for shifts on a specific date for an employee */
function getTradesForCell(trades: ShiftTrade[], shifts: Shift[], employeeId: string, date: Date): ShiftTrade[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  const shiftIds = shifts
    .filter(s => s.userId === employeeId && s.startTime.startsWith(dateStr))
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

/** Compact time-off indicator for calendar cells */
function TimeOffIndicator({ request, compact = false }: { request: TimeOffRequest; compact?: boolean }) {
  const config = TIME_OFF_STATUS_CONFIG[request.status as keyof typeof TIME_OFF_STATUS_CONFIG] || TIME_OFF_STATUS_CONFIG.pending;
  const Icon = config.icon;
  const typeLabel = request.type.charAt(0).toUpperCase() + request.type.slice(1);

  if (compact) {
    return (
      <Tooltip title={`${typeLabel} Leave · ${config.label}`} arrow placement="top">
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.25,
          px: 0.5, py: 0.25, borderRadius: 1,
          bgcolor: config.bgColor,
          border: '1px dashed',
          borderColor: config.borderColor,
          fontSize: '0.58rem', fontWeight: 600,
          color: config.color,
          cursor: 'default',
          lineHeight: 1.3,
          maxWidth: '100%',
          overflow: 'hidden',
        }}>
          <Icon sx={{ fontSize: 10 }} />
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {typeLabel}
          </Box>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${typeLabel} Leave · ${config.label}${request.reason ? `\n"${request.reason}"` : ''}`} arrow placement="top">
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        px: 0.75, py: 0.4, borderRadius: 1.5,
        bgcolor: config.bgColor,
        border: `1px ${request.status === 'pending' ? 'dashed' : 'solid'}`,
        borderColor: config.borderColor,
        fontSize: '0.65rem', fontWeight: 600,
        color: config.color,
        cursor: 'default',
        lineHeight: 1.3,
        minHeight: 24,
        transition: 'all 0.15s ease',
      }}>
        <Icon sx={{ fontSize: 12 }} />
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {typeLabel}
        </Box>
        <Box component="span" sx={{ opacity: 0.7, fontSize: '0.55rem', ml: 'auto', flexShrink: 0 }}>
          {config.label}
        </Box>
      </Box>
    </Tooltip>
  );
}

/** Small trade badge overlay on shift pills */
function TradeBadge({ trade }: { trade: ShiftTrade }) {
  const isAccepted = trade.status === 'accepted';
  const targetName = trade.targetUser?.firstName || trade.toUser?.firstName || '';
  const label = isAccepted
    ? `Trade accepted${targetName ? ` by ${targetName}` : ''} · Awaiting approval`
    : `Trade requested${targetName ? ` → ${targetName}` : ' (open)'}`;

  return (
    <Tooltip title={label} arrow placement="top">
      <Box sx={{
        position: 'absolute', top: -4, right: -4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: '50%',
        bgcolor: isAccepted ? '#3B82F6' : '#8B5CF6',
        color: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        zIndex: 1,
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(isAccepted ? '#3B82F6' : '#8B5CF6', 0.4)}` },
          '50%': { boxShadow: `0 0 0 4px ${alpha(isAccepted ? '#3B82F6' : '#8B5CF6', 0)}` },
        },
      }}>
        <SwapIcon sx={{ fontSize: 11 }} />
      </Box>
    </Tooltip>
  );
}

// Shift pill — the colored chip inside each cell
function ShiftPill({ shift, onClick, trade }: { shift: Shift; onClick: () => void; trade?: ShiftTrade }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const rc = getRoleColor(shift.position, shift.user?.role);
  const startStr = format(new Date(shift.startTime), 'h:mm A');
  const endStr = format(new Date(shift.endTime), 'h:mm A');
  const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
  const hasTrade = !!trade;

  return (
    <Tooltip
      title={`${shift.position || 'Staff'} · ${format(new Date(shift.startTime), 'h:mm a')} – ${format(new Date(shift.endTime), 'h:mm a')} (${hours}h)${shift.notes ? `\n${shift.notes}` : ''}${hasTrade ? `\n⇄ Trade ${trade.status}` : ''}`}
      arrow
      placement="top"
    >
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1.5,
          bgcolor: hasTrade ? alpha(rc.bg, 0.25) : alpha(rc.bg, 0.15),
          border: '1px solid',
          borderColor: alpha(rc.border, 0.3),
          borderLeft: `4px solid ${rc.bg}`,
          color: isDark ? alpha(rc.bgLight, 0.9) : rc.bgDark,
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          lineHeight: 1.3,
          minHeight: 30,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(hasTrade && {
            outline: '2px dashed',
            outlineColor: trade.status === 'accepted' ? '#3B82F6' : '#8B5CF6',
            outlineOffset: 1,
          }),
          '&:hover': {
            transform: 'translateY(-1px)',
            bgcolor: alpha(rc.bg, 0.25),
            boxShadow: `0 4px 12px ${alpha(rc.bg, 0.15)}`,
            borderColor: alpha(rc.border, 0.5),
          },
        }}
      >
        {hasTrade && <TradeBadge trade={trade} />}
        <Box component="span" sx={{ fontWeight: 700 }}>{startStr}</Box>
        <Box component="span" sx={{ opacity: 0.7 }}>–</Box>
        <Box component="span" sx={{ fontWeight: 700 }}>{endStr}</Box>
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
  currentUserId,
  onCreateShift,
  onEditShift,
  onOpenRequests,
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
          const dayShifts = shifts.filter(s => s.startTime.startsWith(format(date, 'yyyy-MM-dd')));
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
                  if (dayTimeOff.length === 0) return null;
                  return dayTimeOff.map(req => (
                    <Box key={`to-${req.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem', minWidth: 60 }}>
                        {emp.firstName} {emp.lastName?.[0]}.
                      </Typography>
                      <TimeOffIndicator request={req} />
                    </Box>
                  ));
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
                            {shift.position || 'Staff'} · {format(new Date(shift.startTime), 'h:mm A')} – {format(new Date(shift.endTime), 'h:mm A')} ({hours}h)
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
    }}>
      {/* Table */}
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        {/* Header row: blank + days */}
        <Box component="thead">
          <Box component="tr">
            {/* Employee column header */}
            <Box
              component="th"
              sx={{
                width: 200, minWidth: 200, p: 1.5,
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
                    p: 1.5, textAlign: 'center',
                    borderBottom: '2px solid',
                    borderColor: isDark ? '#3D3228' : '#E8E0D4',
                    bgcolor: today
                      ? alpha(theme.palette.warning.light, isDark ? 0.08 : 0.15)
                      : (isDark ? '#342A1E' : '#F5F0E8'),
                    borderLeft: '1px solid',
                    borderLeftColor: isDark ? '#3D3228' : '#E8E0D4',
                  }}
                >
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
                  {holiday && (
                    <Chip
                      label={holiday.name}
                      size="small"
                      sx={{
                        mt: 0.5, height: 18, fontSize: '0.58rem', fontWeight: 600,
                        display: 'block', mx: 'auto',
                        bgcolor: holiday.workAllowed
                          ? (isDark ? '#064E3B' : '#DCFCE7')
                          : (isDark ? '#7F1D1D' : '#FEF2F2'),
                        color: holiday.workAllowed
                          ? (isDark ? '#6EE7B7' : '#166534')
                          : (isDark ? '#FCA5A5' : '#DC2626'),
                      }}
                    />
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
                    <Avatar src={emp?.photoUrl || undefined} sx={{ width: 32, height: 32, bgcolor: rc.bg, color: rc.text, fontSize: '0.72rem', fontWeight: 700 }}>
                      {!emp?.photoUrl && <>{emp?.firstName?.[0]}{emp?.lastName?.[0]}</>}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.82rem' }}>
                        {emp.firstName} {emp.lastName}
                        {isInactive && <Box component="span" sx={{ color: 'text.disabled' }}> (Inactive)</Box>}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          size="small"
                          label={emp.position || emp.role || 'Staff'}
                          sx={{
                            height: 18, fontSize: '0.6rem', fontWeight: 600,
                            bgcolor: isDark ? rc.bgDark : rc.bgLight,
                            color: isDark ? rc.text : rc.bg,
                          }}
                        />
                        <Chip
                          size="small"
                          label={`${weekHours}h`}
                          sx={{
                            height: 18, fontSize: '0.6rem', fontWeight: 700,
                            bgcolor: weekHours > 44
                              ? (isDark ? '#7F1D1D' : '#FEF2F2')
                              : (isDark ? '#064E3B' : '#F0FDF4'),
                            color: weekHours > 44
                              ? (isDark ? '#FCA5A5' : '#DC2626')
                              : (isDark ? '#6EE7B7' : '#166534'),
                          }}
                        />
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
                  const hasTimeOff = cellTimeOff.length > 0;
                  const hasApprovedTimeOff = cellTimeOff.some(r => r.status === 'approved');

                  return (
                    <Box
                      key={date.toISOString()}
                      component="td"
                      sx={{
                        p: 0.75,
                        borderBottom: '1px solid',
                        borderLeft: '1px solid',
                        borderColor: isDark ? '#3D3228' : '#E8E0D4',
                        verticalAlign: 'top',
                        minHeight: 60,
                        bgcolor: isBlocked
                          ? alpha(theme.palette.error.main, isDark ? 0.06 : 0.04)
                          : hasApprovedTimeOff
                            ? alpha('#F59E0B', isDark ? 0.06 : 0.06)
                            : today
                              ? alpha(theme.palette.warning.light, isDark ? 0.04 : 0.08)
                              : 'transparent',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 40 }}>
                        {/* Time-off indicators — compact to avoid cramping */}
                        {cellTimeOff.map(req => (
                          <TimeOffIndicator key={`to-${req.id}`} request={req} compact={cellShifts.length > 0} />
                        ))}

                        {/* Shift pills with trade badge overlay */}
                        {cellShifts.map(shift => {
                          const trade = getTradeForShift(activeTrades, shift.id);
                          return (
                            <ShiftPill key={shift.id} shift={shift} onClick={() => onEditShift(shift)} trade={trade} />
                          );
                        })}
                        {cellShifts.length === 0 && !isBlocked && !hasApprovedTimeOff && isManager && (
                          <Tooltip title="Add shift" placement="top">
                            <IconButton
                              size="small"
                              onClick={() => onCreateShift(emp.id, date)}
                              sx={{
                                width: '100%', height: 28,
                                borderRadius: 1.5, border: '1px dashed',
                                borderColor: 'transparent',
                                color: 'text.disabled',
                                '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isBlocked && cellShifts.length === 0 && !hasTimeOff && (
                          <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', py: 0.5, fontStyle: 'italic', fontSize: '0.6rem' }}>
                            Closed
                          </Typography>
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
