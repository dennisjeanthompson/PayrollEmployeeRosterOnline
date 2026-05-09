import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, startOfWeek, addDays, differenceInMinutes } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useRealtime } from "@/hooks/use-realtime";

// MUI Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Typography,
  useTheme,
  alpha,
  Divider,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { WeekShiftPicker } from "../schedule/week-shift-picker";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  branchId: string;
}

interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  position: string;
}

interface EmployeeShiftModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  branchId: string;
}

export function EmployeeShiftModal({
  open,
  onClose,
  employee,
  branchId,
}: EmployeeShiftModalProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Shift State
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [editStartTime, setEditStartTime] = useState<Date | null>(null);
  const [editEndTime, setEditEndTime] = useState<Date | null>(null);

  // Real-time synchronization
  useRealtime({
    enabled: open,
    queryKeys: ["employee-shifts"],
    onEvent: (event) => {
      if (event.startsWith("shift:")) {
        queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      }
    },
  });

  // Fetch shifts for the week
  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ["employee-shifts", employee?.id ?? 'none', weekStart.toISOString()],
    queryFn: async () => {
      if (!employee) return { shifts: [] };
      const endDate = addDays(weekStart, 6);
      const response = await apiRequest("GET", `/api/shifts?userId=${employee.id}&startDate=${weekStart.toISOString()}&endDate=${endDate.toISOString()}`);
      return response.json();
    },
    enabled: open && !!employee,
  });

  const shifts: Shift[] = shiftsData?.shifts || [];

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const response = await apiRequest("DELETE", `/api/shifts/${shiftId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete shift");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await apiRequest("PUT", `/api/shifts/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update shift");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setEditTarget(null);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  if (!employee) return null;

  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      deleteShiftMutation.mutate(shiftId);
    }
  };

  const handleNavigateWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
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
              <ScheduleIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} component="span" sx={{ display: 'block' }}>
                Shift Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employee.firstName} {employee.lastName} · {employee.position}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Week Navigation */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              p: 0.5
            }}>
              <IconButton size="small" onClick={() => handleNavigateWeek("prev")}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2" fontWeight={700}>
                {weekLabel}
              </Typography>
              <IconButton size="small" onClick={() => handleNavigateWeek("next")}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Shifts List */}
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : shifts.length === 0 ? (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : '#FAFAFA',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider'
              }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  No Shifts Scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  This employee has an open schedule for this week.
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => setWeekPickerOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Quick Add Shifts
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {shifts.map((shift) => {
                  const startTime = parseISO(shift.startTime);
                  const endTime = parseISO(shift.endTime);
                  const durationMins = differenceInMinutes(endTime, startTime);
                  const durationHours = (durationMins / 60).toFixed(1);
                  const isCompleted = shift.status === "completed";

                  return (
                    <Box 
                      key={shift.id} 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isCompleted 
                          ? alpha(theme.palette.success.main, 0.2) 
                          : isDark ? '#3D3228' : '#EAEAEA',
                        bgcolor: isCompleted 
                          ? alpha(theme.palette.success.main, 0.04) 
                          : isDark ? '#261C14' : '#FFFFFF',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: isCompleted ? alpha(theme.palette.success.main, 0.4) : theme.palette.divider
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color={isCompleted ? 'success.main' : 'text.primary'}>
                            {format(startTime, "EEEE, MMMM d")}
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
                            <Typography variant="body2" fontWeight={600}>
                              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                            </Typography>
                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              {durationHours} hrs
                            </Typography>
                          </Stack>
                        </Box>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isCompleted ? (
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="Completed" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600, border: 'none', bgcolor: alpha(theme.palette.success.main, 0.1) }} 
                            />
                          ) : (
                            <Chip 
                              label="Scheduled" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600, border: 'none', bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                            />
                          )}
                          
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditTarget(shift);
                                setEditStartTime(parseISO(shift.startTime));
                                setEditEndTime(parseISO(shift.endTime));
                              }}
                              disabled={deleteShiftMutation.isPending || updateShiftMutation.isPending}
                              sx={{
                                color: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteShift(shift.id)}
                              disabled={deleteShiftMutation.isPending || updateShiftMutation.isPending}
                              sx={{ 
                                color: 'error.main', 
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } 
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 2, borderTop: shifts.length > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Button onClick={onClose} sx={{ borderRadius: 2, px: 3, textTransform: 'none' }} color="inherit">
            Done
          </Button>
          {shifts.length > 0 && (
             <Button
               onClick={() => setWeekPickerOpen(true)}
               variant="contained"
               startIcon={<AddIcon />}
               sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
             >
               Add Shifts
             </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Week Shift Picker Modal - This can be left as is, because it's a separate component */}
      <WeekShiftPicker
        open={weekPickerOpen}
        onClose={() => setWeekPickerOpen(false)}
        employeeId={employee.id}
        employeeName={`${employee.firstName} ${employee.lastName}`}
        initialWeekDate={weekStart}
        branchId={branchId}
      />

      {/* Edit Shift Modal */}
      <Dialog 
        open={Boolean(editTarget)} 
        onClose={() => setEditTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: isDark ? '#1C1410' : '#FFFFFF', backgroundImage: 'none' }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={800} component="span">Edit Shift</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Start Time"
                value={editStartTime}
                onChange={(newValue) => setEditStartTime(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <TimePicker
                label="End Time"
                value={editEndTime}
                onChange={(newValue) => setEditEndTime(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!editStartTime || !editEndTime || updateShiftMutation.isPending}
            onClick={() => {
              if (editTarget && editStartTime && editEndTime) {
                updateShiftMutation.mutate({
                  id: editTarget.id,
                  data: {
                    startTime: editStartTime.toISOString(),
                    endTime: editEndTime.toISOString(),
                  }
                });
              }
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {updateShiftMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
