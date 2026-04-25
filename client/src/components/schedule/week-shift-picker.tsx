import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// MUI Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Grid,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Event as EventIcon, Schedule as ScheduleIcon } from "@mui/icons-material";

interface Shift {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface WeekShiftPickerProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  initialWeekDate?: Date;
  branchId: string;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKDAY_INDICES = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun (0 = Sunday)

const SHIFT_PRESETS = {
  morning: { label: "Morning", start: "06:00", end: "14:00" },
  afternoon: { label: "Afternoon", start: "14:00", end: "22:00" },
  night: { label: "Night", start: "22:00", end: "06:00" },
  off: { label: "Day Off", start: "", end: "" },
};

export function WeekShiftPicker({
  open,
  onClose,
  employeeId,
  employeeName,
  initialWeekDate = new Date(),
  branchId,
}: WeekShiftPickerProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [weekStartDate, setWeekStartDate] = useState(() => startOfWeek(initialWeekDate, { weekStartsOn: 1 }));
  const [selectedPreset, setSelectedPreset] = useState<string>("morning");
  const [weekShifts, setWeekShifts] = useState<Record<string, Shift>>({});
  const [error, setError] = useState<string | null>(null);

  // Generate week dates (Monday to Sunday)
  const weekDates = useMemo(() => {
    return WEEKDAYS.map((_, i) => ({
      day: WEEKDAYS[i],
      date: addDays(weekStartDate, i),
    }));
  }, [weekStartDate]);

  // Create/Update shifts mutation
  const createShiftsMutation = useMutation({
    mutationFn: async (shiftsToCreate: Shift[]) => {
      const results = [];
      
      // Validate shifts before creation
      const shiftsByDate: { [key: string]: Shift[] } = {};
      for (const shift of shiftsToCreate) {
        if (!shift.startTime || !shift.endTime) continue; // Skip "Day Off"
        
        const dateKey = shift.date;
        if (!shiftsByDate[dateKey]) {
          shiftsByDate[dateKey] = [];
        }
        shiftsByDate[dateKey].push(shift);
      }

      // Check for multiple shifts on same day
      for (const [date, shiftsOnDate] of Object.entries(shiftsByDate)) {
        if (shiftsOnDate.length > 1) {
          throw new Error(`Cannot create multiple shifts on the same day (${date}). Only one shift per day is allowed.`);
        }
      }

      for (const shift of shiftsToCreate) {
        if (!shift.startTime || !shift.endTime) continue; // Skip "Day Off"

        const startDateTime = new Date(`${shift.date}T${shift.startTime}:00`);
        let endDateTime = new Date(`${shift.date}T${shift.endTime}:00`);

        // If end time is before start time (night shift), add a day
        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        // Validate shift time
        if (startDateTime >= endDateTime) {
          throw new Error(`Invalid shift times for ${shift.date}: start time must be before end time.`);
        }

        const response = await apiRequest("POST", "/api/shifts", {
          userId: employeeId,
          branchId: branchId,
          position: "Staff",
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          status: "scheduled",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create shift");
        }

        results.push(await response.json());
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      setError(null);
      handleClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftDate: string) => {
      const shift = weekShifts[shiftDate];
      if (!shift.id) return; // Skip if not yet created

      const response = await apiRequest("DELETE", `/api/shifts/${shift.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete shift");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
    },
    onError: (error: Error) => console.error('Failed to delete shift:', error.message),
  });

  const handleApplyPreset = (dayIndex: number) => {
    const dayDate = weekDates[dayIndex];
    const dateStr = format(dayDate.date, "yyyy-MM-dd");
    const preset = SHIFT_PRESETS[selectedPreset as keyof typeof SHIFT_PRESETS];

    setWeekShifts((prev) => ({
      ...prev,
      [dateStr]: {
        date: dateStr,
        startTime: preset.start,
        endTime: preset.end,
      },
    }));
  };

  const handleDeleteShift = (dayIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dayDate = weekDates[dayIndex];
    const dateStr = format(dayDate.date, "yyyy-MM-dd");
    const shift = weekShifts[dateStr];

    if (shift?.id) {
      deleteShiftMutation.mutate(dateStr);
    }

    setWeekShifts((prev) => {
      const newShifts = { ...prev };
      delete newShifts[dateStr];
      return newShifts;
    });
  };

  const handleSaveWeek = () => {
    const shiftsToCreate = Object.values(weekShifts).filter(
      (shift) => shift.startTime && shift.endTime
    );

    if (shiftsToCreate.length === 0) {
      setError("Please add at least one shift");
      return;
    }

    createShiftsMutation.mutate(shiftsToCreate);
  };

  const handleClose = () => {
    setWeekShifts({});
    setError(null);
    setSelectedPreset("morning");
    onClose();
  };

  const shiftCount = Object.values(weekShifts).filter(
    (s) => s.startTime && s.endTime
  ).length;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          bgcolor: isDark ? '#1C1410' : '#FFFFFF',
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <Box sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            p: 1,
            borderRadius: 2,
            display: 'flex'
          }}>
            <EventIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} component="span" sx={{ display: 'block' }}>
              Weekly Shift Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employeeName} · {format(weekStartDate, "MMM d")} - {format(addDays(weekStartDate, 6), "MMM d, yyyy")}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Shift Preset Selector */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Quick Preset Context
            </Typography>
            <ToggleButtonGroup
              value={selectedPreset}
              exclusive
              onChange={(e, newValue) => newValue && setSelectedPreset(newValue)}
              fullWidth
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '12px !important',
                  mx: 0.5,
                  mb: 1,
                  border: '1px solid',
                  borderColor: isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.primary.main, 0.2),
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 700,
                  }
                }
              }}
            >
              <ToggleButton value="morning">Morning (6AM-2PM)</ToggleButton>
              <ToggleButton value="afternoon">Afternoon (2PM-10PM)</ToggleButton>
              <ToggleButton value="night">Night (10PM-6AM)</ToggleButton>
              <ToggleButton value="off">Day Off</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Week Grid */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Select Days to Apply Preset
            </Typography>
            <Grid container spacing={1.5}>
              {weekDates.map((dayInfo, dayIndex) => {
                const dateStr = format(dayInfo.date, "yyyy-MM-dd");
                const shift = weekShifts[dateStr];
                const hasShift = shift && shift.startTime && shift.endTime;
                const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dayIndex}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        p: 2,
                        height: '100%',
                        border: '1px solid',
                        borderColor: hasShift
                          ? alpha(theme.palette.success.main, 0.4)
                          : isDark ? '#3D3228' : alpha(theme.palette.primary.main, 0.1),
                        bgcolor: hasShift
                          ? alpha(theme.palette.success.main, 0.05)
                          : isWeekend
                          ? isDark ? alpha(theme.palette.common.white, 0.02) : '#fafafa'
                          : isDark ? '#261C14' : '#FFFFFF',
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        "&:hover": {
                          borderColor: alpha(theme.palette.primary.main, 0.6),
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleApplyPreset(dayIndex)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <Box>
                          <Typography variant="subtitle2" fontWeight={800} color={hasShift ? 'success.main' : 'text.primary'}>
                            {dayInfo.day}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {format(dayInfo.date, "MMM d")}
                          </Typography>
                         </Box>
                         {hasShift && (
                            <IconButton
                               size="small"
                               onClick={(e) => handleDeleteShift(dayIndex, e)}
                               sx={{ 
                                  p: 0.5, 
                                  color: 'error.main', 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } 
                               }}
                             >
                               <DeleteIcon sx={{ fontSize: '1rem' }} />
                             </IconButton>
                         )}
                      </Box>

                      {hasShift ? (
                        <Box mt={2}>
                          <Chip
                            icon={<ScheduleIcon sx={{ fontSize: '1rem !important' }} />}
                            label={`${shift.startTime} - ${shift.endTime}`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700, border: 'none', bgcolor: alpha(theme.palette.success.main, 0.12) }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2, fontWeight: 600 }}>
                          No Shift
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ ml: 1 }}>
          Shifts Selected: <Typography component="span" fontWeight={800} color="primary.main">{shiftCount}</Typography>
        </Typography>
        <Box>
          <Button onClick={handleClose} disabled={createShiftsMutation.isPending} sx={{ borderRadius: 2, px: 3, textTransform: 'none', mr: 1 }} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveWeek}
            variant="contained"
            disabled={shiftCount === 0 || createShiftsMutation.isPending}
            sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
          >
            {createShiftsMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              `Save ${shiftCount} Shift${shiftCount !== 1 ? "s" : ""}`
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
