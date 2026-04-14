/**
 * Holiday Calendar Management Page
 * Admin/Manager page for managing Philippine holidays
 * Features: FullCalendar month view, CRUD controls, color-coded holiday types
 */

import { lazy, Suspense, useCallback, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  CircularProgress,
  LinearProgress,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth,
  Refresh as RefreshIcon,
  CheckCircle,
  Block,
  Close as CloseIcon,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from "@/lib/auth";

const HolidayCalendarView = lazy(() => import("@/components/holiday-calendar/HolidayCalendarView"));

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  year: number;
  isRecurring: boolean;
  workAllowed: boolean;
  notes: string | null;
  premiumOverride: string | null;
  payRule?: { worked: string; notWorked: string };
}

const holidayTypes = [
  { value: "regular", label: "Regular Holiday", color: "#ef4444", payWorked: "+100% premium" },
  { value: "special_non_working", label: "Special Non-Working", color: "#f97316", payWorked: "+30% premium" },
  { value: "special_working", label: "Special Working", color: "#eab308", payWorked: "Normal rate" },
  { value: "company", label: "Company Holiday", color: "#3b82f6", payWorked: "Per policy" },
];

const getTypeConfig = (type: string) => {
  return holidayTypes.find((t) => t.value === type) || holidayTypes[2];
};

export default function MuiHolidayCalendar() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [detailAnchor, setDetailAnchor] = useState<HTMLElement | null>(null);
  const [detailHoliday, setDetailHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    type: "regular",
    year: new Date().getFullYear(),
    isRecurring: false,
    workAllowed: true,
    notes: "",
  });

  // Fetch holidays
  const { data: holidaysData, isLoading, isFetching } = useQuery<{ holidays: Holiday[] }>({
    queryKey: ["/api/holidays", { year: selectedYear }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/holidays?year=${selectedYear}`);
      return res.json();
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/holidays", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Holiday created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/holidays/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDialogOpen(false);
      setEditingHoliday(null);
      resetForm();
      toast({ title: "Success", description: "Holiday updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/holidays/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDeleteDialogOpen(false);
      setDeletingHoliday(null);
      toast({ title: "Success", description: "Holiday deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Seed 2025 holidays
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/holidays/seed-2025");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: data.message || "2025 holidays seeded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Seed 2026 holidays
  const seed2026Mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/holidays/seed-2026");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: data.message || "2026 holidays seeded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      date: format(new Date(), "yyyy-MM-dd"),
      type: "regular",
      year: selectedYear,
      isRecurring: false,
      workAllowed: true,
      notes: "",
    });
  };

  const handleEdit = useCallback((holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: format(new Date(holiday.date), "yyyy-MM-dd"),
      type: holiday.type,
      year: holiday.year,
      isRecurring: holiday.isRecurring,
      workAllowed: holiday.workAllowed ?? true,
      notes: holiday.notes || "",
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((holiday: Holiday) => {
    setDeletingHoliday(holiday);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };

    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const holidayList = holidaysData?.holidays ?? [];

  // Calendar events
  const calendarEvents = useMemo(() => {
    if (!holidayList.length) return [];

    return holidayList.map((holiday) => {
      return {
        id: holiday.id,
        title: holiday.name,
        date: new Date(holiday.date).toISOString().split("T")[0],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        extendedProps: {
          holiday,
          payRule: holiday.payRule,
        },
      };
    });
  }, [holidayList]);

  // Group holidays by type for stats
  const holidayStats = useMemo(() => {
    if (!holidayList.length) return { regular: 0, special: 0, company: 0, total: 0 };

    const holidays = holidayList;
    return {
      regular: holidays.filter((h) => h.type === "regular").length,
      special: holidays.filter((h) => h.type.startsWith("special")).length,
      company: holidays.filter((h) => h.type === "company").length,
      total: holidays.length,
    };
  }, [holidayList]);

  const sortedHolidays = useMemo(
    () => [...holidayList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [holidayList]
  );

  const handleCalendarEventClick = useCallback((info: any) => {
    info.jsEvent.preventDefault();
    const holiday = info.event.extendedProps.holiday as Holiday;
    setDetailHoliday(holiday);
    setDetailAnchor(info.el);
  }, []);

  const renderCalendarEvent = useCallback((arg: any) => {
    const holiday = arg.event.extendedProps.holiday as Holiday;
    const typeConfig = getTypeConfig(holiday?.type);
    const color = holiday.workAllowed ? typeConfig.color : "#6b7280";

    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {holiday?.name}
            </Typography>
            <Typography variant="caption">Type: {typeConfig.label}</Typography>
            <br />
            <Typography variant="caption">
              Pay: {holiday?.payRule?.worked || typeConfig.payWorked}
            </Typography>
            <br />
            <Typography variant="caption">
              Work Allowed: {holiday?.workAllowed ? "Yes" : "No"}
            </Typography>
            {holiday?.notes && (
              <>
                <br />
                <Typography variant="caption">Note: {holiday.notes}</Typography>
              </>
            )}
          </Box>
        }
        arrow
      >
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.75rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
            bgcolor: alpha(color, 0.15),
            color: color,
            borderLeft: `4px solid ${color}`,
            borderTop: "1px solid",
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: alpha(color, 0.2),
            fontWeight: 600,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {arg.event.title}
        </Box>
      </Tooltip>
    );
  }, []);

  if (isLoading && holidayList.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <CalendarMonth sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Holiday Calendar Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure Philippine holidays for payroll calculations {isAdmin ? "(Admin Only)" : "(View Only)"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            select
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            {[2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          {isAdmin && (
            <>
              <Button
                variant="outlined"
                color="warning"
                startIcon={seedMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={() => {
                  if (confirm("Seed official 2025 Philippine holidays (Proclamation 727)?")) {
                    seedMutation.mutate();
                  }
                }}
                disabled={seedMutation.isPending}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600 }}
              >
                Seed 2025 Holidays
              </Button>

              <Button
                variant="outlined"
                color="success"
                startIcon={seed2026Mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={() => {
                  if (confirm("Seed official 2026 Philippine holidays?")) {
                    seed2026Mutation.mutate();
                  }
                }}
                disabled={seed2026Mutation.isPending}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600 }}
              >
                Seed 2026 Holidays
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingHoliday(null);
                  resetForm();
                  setIsDialogOpen(true);
                }}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Add Holiday
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {isFetching && !isLoading && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      )}

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        {[
          { label: "Regular", count: holidayStats.regular, color: "#ef4444" },
          { label: "Special", count: holidayStats.special, color: "#f97316" },
          { label: "Company", count: holidayStats.company, color: "#3b82f6" },
          { label: "Total", count: holidayStats.total, color: theme.palette.primary.main },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              minWidth: 120,
              bgcolor: alpha(stat.color, 0.1),
              border: "none",
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="h5" fontWeight={700} color={stat.color}>
                {stat.count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Tabs: Calendar | List */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Calendar View" />
        <Tab label="List View" />
      </Tabs>

      {/* Calendar View */}
      {tabValue === 0 && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 2, minHeight: 620 }}>
            <Suspense
              fallback={
                <Box sx={{ minHeight: 580, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress color="primary" />
                </Box>
              }
            >
              <HolidayCalendarView
                events={calendarEvents}
                onEventClick={handleCalendarEventClick}
                onEventContent={renderCalendarEvent}
              />
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {tabValue === 1 && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pay Rule</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHolidays.map((holiday) => {
                  const typeConfig = getTypeConfig(holiday.type);
                  return (
                    <TableRow key={holiday.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {format(new Date(holiday.date), "MMM d, yyyy")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{holiday.name}</Typography>
                        {holiday.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {holiday.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={typeConfig.label}
                          size="small"
                          sx={{
                            bgcolor: alpha(typeConfig.color, 0.15),
                            color: typeConfig.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {holiday.payRule?.worked || typeConfig.payWorked}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={holiday.workAllowed ? <CheckCircle /> : <Block />}
                          label={holiday.workAllowed ? "Work OK" : "Blocked"}
                          size="small"
                          color={holiday.workAllowed ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {isAdmin ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(holiday)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(holiday)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.disabled">View Only</Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Legend */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {holidayTypes.map((type) => (
          <Box key={type.value} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: type.color }} />
            <Typography variant="caption">{type.label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#6b7280" }} />
          <Typography variant="caption">Work Blocked</Typography>
        </Box>
      </Box>

      {/* Holiday Detail Popover (Calendar View) */}
      {detailAnchor && detailHoliday && (() => {
        const typeConfig = getTypeConfig(detailHoliday.type);
        const rect = detailAnchor.getBoundingClientRect();
        return (
          <>
            {/* Backdrop */}
            <Box
              onClick={() => { setDetailAnchor(null); setDetailHoliday(null); }}
              sx={{ position: 'fixed', inset: 0, zIndex: 1200 }}
            />
            {/* Popover card */}
            <Card
              elevation={8}
              sx={{
                position: 'fixed',
                left: Math.min(rect.left, window.innerWidth - 320),
                top: rect.bottom + 8,
                zIndex: 1300,
                width: 300,
                borderRadius: 3,
                border: `2px solid ${typeConfig.color}`,
                overflow: 'visible',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header with close */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {detailHoliday.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(detailHoliday.date), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => { setDetailAnchor(null); setDetailHoliday(null); }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Type chip */}
                <Chip
                  label={typeConfig.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(typeConfig.color, 0.15),
                    color: typeConfig.color,
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                />

                {/* Details */}
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Pay Rule:</strong> {detailHoliday.payRule?.worked || typeConfig.payWorked}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Work Allowed:</strong>{' '}
                    <Chip
                      size="small"
                      icon={detailHoliday.workAllowed ? <CheckCircle /> : <Block />}
                      label={detailHoliday.workAllowed ? 'Yes' : 'Blocked'}
                      color={detailHoliday.workAllowed ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  </Typography>
                  {detailHoliday.isRecurring && (
                    <Typography variant="body2" color="text.secondary">
                      ðŸ” Recurring annually
                    </Typography>
                  )}
                  {detailHoliday.notes && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      {detailHoliday.notes}
                    </Typography>
                  )}
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setDetailAnchor(null);
                      setDetailHoliday(null);
                      handleEdit(detailHoliday);
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setDetailAnchor(null);
                      setDetailHoliday(null);
                      handleDelete(detailHoliday);
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </>
        );
      })()}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            {editingHoliday ? "Edit" : "Add"} Holiday
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure holiday details for payroll calculations
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Holiday Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date ? new Date(formData.date) : null}
                onChange={(val) => {
                  if (val) {
                    const newDate = format(val, 'yyyy-MM-dd');
                    setFormData({
                      ...formData,
                      date: newDate,
                      year: val.getFullYear(),
                    });
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              select
              label="Holiday Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {holidayTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: type.color }} />
                    {type.label} ({type.payWorked})
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.workAllowed}
                  onChange={(e) => setFormData({ ...formData, workAllowed: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Allow Work on This Day</Typography>
                  <Typography variant="caption" color="text.secondary">
                    If disabled, shift creation will be blocked
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
              }
              label="Recurring (same date every year)"
            />

            <TextField
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., Date subject to NCMF announcement"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: editingHoliday ? 'space-between' : 'flex-end' }}>
          {editingHoliday && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setIsDialogOpen(false);
                handleDelete(editingHoliday);
              }}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Delete
            </Button>
          )}
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setIsDialogOpen(false)} sx={{ borderRadius: 2, textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.date || createMutation.isPending || updateMutation.isPending}
              startIcon={
                createMutation.isPending || updateMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Delete Holiday?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            This will permanently delete <strong>{deletingHoliday?.name}</strong>. This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setIsDeleteDialogOpen(false)} sx={{ borderRadius: 2, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deletingHoliday && deleteMutation.mutate(deletingHoliday.id)}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
