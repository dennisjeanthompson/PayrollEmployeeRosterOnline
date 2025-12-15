import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Stack,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Add as AddIcon,
  AccessTime as ClockIcon,
  EventBusy as TimeOffIcon,
  WbSunny as MorningIcon,
  LightMode as AfternoonIcon,
  NightsStay as NightIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format, differenceInHours } from 'date-fns';

// Types
interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
}

interface AvailabilityPattern {
  prefersMorning: boolean;
  prefersAfternoon: boolean;
  prefersNight: boolean;
  notes?: string;
}

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position?: string;
  branchId?: string;
  role?: string;
  username?: string;
  isActive?: boolean;
  hourlyRate?: string;
}

interface EmployeeProfilePopoverProps {
  employee: Employee | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  weeklyShifts?: Shift[];
  timeOffRequests?: TimeOffRequest[];
  availabilityPattern?: AvailabilityPattern;
  onViewProfile?: (employeeId: string) => void;
  onCreateShift?: (employeeId: string) => void;
  employeeColor?: { bg: string; text: string };
}

// Role-based emoji mapping for cafe
const ROLE_EMOJIS: Record<string, string> = {
  barista: '☕',
  kitchen: '👨‍🍳',
  server: '🍵',
  cashier: '💰',
  manager: '👔',
  employee: '🧑‍💼',
  admin: '⚙️',
};

// Default weekly hours target
const WEEKLY_HOURS_TARGET = 40;

export function EmployeeProfilePopover({
  employee,
  anchorEl,
  onClose,
  weeklyShifts = [],
  timeOffRequests = [],
  availabilityPattern,
  onViewProfile,
  onCreateShift,
  employeeColor,
}: EmployeeProfilePopoverProps) {
  const theme = useTheme();
  const open = Boolean(anchorEl) && Boolean(employee);

  if (!employee) return null;

  // Calculate weekly hours from shifts
  const weeklyHours = weeklyShifts.reduce((total, shift) => {
    const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
    return total + hours;
  }, 0);

  const hoursProgress = Math.min((weeklyHours / WEEKLY_HOURS_TARGET) * 100, 100);
  const isOvertime = weeklyHours > WEEKLY_HOURS_TARGET;

  // Get upcoming approved time-off
  const upcomingTimeOff = timeOffRequests.filter(
    (to) => to.status === 'approved' && new Date(to.startDate) >= new Date()
  );

  // Display role with emoji
  const roleKey = (employee.position || employee.role || 'employee').toLowerCase();
  const roleEmoji = ROLE_EMOJIS[roleKey] || ROLE_EMOJIS.employee;
  const displayRole = employee.position || employee.role || 'Employee';

  // Glassmorphism effect for 2025 premium look
  const glassBg = alpha(theme.palette.background.paper, 0.95);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: glassBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        },
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: employeeColor
            ? `linear-gradient(135deg, ${employeeColor.bg} 0%, ${alpha(employeeColor.bg, 0.7)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          p: 2,
          color: employeeColor?.text || '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha('#fff', 0.2),
                color: 'inherit',
                fontSize: '1.25rem',
                fontWeight: 700,
                border: `2px solid ${alpha('#fff', 0.3)}`,
              }}
            >
              {employee.firstName[0]}
              {employee.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {employee.firstName} {employee.lastName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {roleEmoji} {displayRole}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'inherit', opacity: 0.8 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Status badge */}
        <Chip
          label={employee.isActive !== false ? '🟢 Active' : '⚪ Inactive'}
          size="small"
          sx={{
            mt: 1.5,
            bgcolor: alpha('#fff', 0.2),
            color: 'inherit',
            fontWeight: 600,
            '& .MuiChip-label': { px: 1.5 },
          }}
        />
      </Box>

      {/* Weekly Hours Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ClockIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>
            This Week
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Hours Scheduled
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color={isOvertime ? 'warning.main' : 'text.primary'}
            >
              {weeklyHours}h / {WEEKLY_HOURS_TARGET}h
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={hoursProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: isOvertime ? 'warning.main' : 'primary.main',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {weeklyShifts.length} shift{weeklyShifts.length !== 1 ? 's' : ''} scheduled
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Availability Patterns */}
      {availabilityPattern && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Preferred Shifts
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<MorningIcon />}
                label="Morning"
                size="small"
                variant={availabilityPattern.prefersMorning ? 'filled' : 'outlined'}
                color={availabilityPattern.prefersMorning ? 'success' : 'default'}
                sx={{ opacity: availabilityPattern.prefersMorning ? 1 : 0.5 }}
              />
              <Chip
                icon={<AfternoonIcon />}
                label="Afternoon"
                size="small"
                variant={availabilityPattern.prefersAfternoon ? 'filled' : 'outlined'}
                color={availabilityPattern.prefersAfternoon ? 'warning' : 'default'}
                sx={{ opacity: availabilityPattern.prefersAfternoon ? 1 : 0.5 }}
              />
              <Chip
                icon={<NightIcon />}
                label="Night"
                size="small"
                variant={availabilityPattern.prefersNight ? 'filled' : 'outlined'}
                color={availabilityPattern.prefersNight ? 'info' : 'default'}
                sx={{ opacity: availabilityPattern.prefersNight ? 1 : 0.5 }}
              />
            </Stack>
            {availabilityPattern.notes && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                📝 {availabilityPattern.notes}
              </Typography>
            )}
          </Box>
          <Divider />
        </>
      )}

      {/* Upcoming Time-Off */}
      {upcomingTimeOff.length > 0 && (
        <>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TimeOffIcon fontSize="small" color="error" />
              <Typography variant="subtitle2" fontWeight={600}>
                Upcoming Time-Off
              </Typography>
            </Box>
            <Stack spacing={1}>
              {upcomingTimeOff.slice(0, 2).map((to) => (
                <Box
                  key={to.id}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  <Typography variant="caption" fontWeight={600} color="error.main">
                    {format(new Date(to.startDate), 'MMM d')} -{' '}
                    {format(new Date(to.endDate), 'MMM d')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {to.type}: {to.reason}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* Action Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonIcon />}
          onClick={() => onViewProfile?.(employee.id)}
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          View Profile
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreateShift?.(employee.id)}
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          Create Shift
        </Button>
      </Box>
    </Popover>
  );
}

export default EmployeeProfilePopover;
