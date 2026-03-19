import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInDays } from "date-fns";
import { getCurrentUser, isManager } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";
import { toast as notify } from 'react-toastify';

// MUI Components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";


// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { addDays } from 'date-fns';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";

interface TimeOffRequest {
  id: string;
  userId: string;
  userName?: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  requestedAt: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

const timeOffTypes = [
  { value: "vacation", label: "Vacation Leave", minAdvance: 7 },
  { value: "sick", label: "Sick Leave", minAdvance: 0 },
  { value: "emergency", label: "Emergency Leave", minAdvance: 0 },
  { value: "personal", label: "Personal Day", minAdvance: 3 },
  { value: "other", label: "Other", minAdvance: 3 },
];

const getStatusColor = (status: string): "error" | "warning" | "success" | "default" | "primary" | "secondary" | "info" => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon sx={{ fontSize: 18 }} />;
    case "rejected":
      return <CancelIcon sx={{ fontSize: 18 }} />;
    case "pending":
      return <AccessTimeIcon sx={{ fontSize: 18 }} />;
    default:
      return null;
  }
};

export default function MuiTimeOff() {
  const currentUser = getCurrentUser();
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time updates for time-off requests
  useRealtime({
    enabled: true,
    queryKeys: ['time-off-requests'],
    onEvent: (event: string) => {
      if (event.startsWith('time-off:') || event === 'notification:created') {
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      }
    },
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TimeOffRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  // Manager reject-reason dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<TimeOffRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    type: "vacation",
    startDate: new Date() as Date | null,
    endDate: new Date() as Date | null,
    reason: "",
  });

  const [calendarView, setCalendarView] = useState("dayGridMonth");

  // Fetch time off requests
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ["time-off-requests", currentUser?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/time-off-requests");
      return response.json();
    },
  });

  // Fetch leave credits for current user
  const { data: creditsData } = useQuery({
    queryKey: ["leave-credits", new Date().getFullYear(), "my"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/leave-credits/my?year=${new Date().getFullYear()}`);
      return response.json();
    },
    enabled: !isManagerRole,
  });
  const myCredits = creditsData?.credits || [];

  // Submit time off request
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        type: data.type,
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : "",
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : "",
        reason: data.reason,
        userId: currentUser?.id,
      };
      const endpoint = editingRequest
        ? `/api/time-off-requests/${editingRequest.id}`
        : "/api/time-off-requests";
      const method = editingRequest ? "PUT" : "POST";

      const response = await apiRequest(method, endpoint, payload);
      return response.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      
      // Use react-toastify for conditional feedback based on leave type and advance notice
      if (editingRequest) {
        notify.success("Time off request updated successfully");
      } else {
        const leaveType = formData.type;
        const { shortNotice, advanceDays } = response;
        
        // Sick/Emergency: Always success toast, no warning
        if (['sick', 'emergency'].includes(leaveType)) {
          notify.success(`${capitalizeFirstLetter(leaveType)} leave request submitted`);
        } else if (shortNotice) {
          // Vacation/Personal/Other with short notice: Warning toast
          notify.warning(
            `${capitalizeFirstLetter(leaveType)} request submitted with short notice (only ${advanceDays} day${advanceDays !== 1 ? 's' : ''} advance). Manager may request adjustment.`,
            { autoClose: 8000 }
          );
        } else {
          // Normal submission
          notify.success("Time off request submitted successfully");
        }
      }
      
      handleCloseDialog();
      refetch();
    },
    onError: (error: any) => {
      notify.error(error.message || "Failed to submit request");
    },
  });

  // Delete time off request
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("DELETE", `/api/time-off-requests/${requestId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Success",
        description: "Time off request deleted",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  // Approve (manager only)
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, status, rejectionReason }: { requestId: string; status: string; rejectionReason?: string }) => {
      const endpoint = status === 'approved'
        ? `/api/time-off-requests/${requestId}/approve`
        : `/api/time-off-requests/${requestId}/reject`;
      const body = status === 'rejected' ? { status, rejectionReason } : { status };
      const response = await apiRequest("PUT", endpoint, body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Success",
        description: "Request status updated",
      });
      refetch();
    },
  });

  const handleOpenDialog = (request?: TimeOffRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        type: request.type,
        startDate: parseISO(request.startDate.split("T")[0]),
        endDate: parseISO(request.endDate.split("T")[0]),
        reason: request.reason,
      });
    } else {
      setEditingRequest(null);
      setFormData({
        type: "vacation",
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
    setFormData({
      type: "vacation",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    });

  };

  const handleDateClick = (arg: any) => {
    // If user is Employee, clicking a date opens new request
    if (!isManagerRole) {
      const clickedDate = new Date(arg.dateStr);
      setFormData({
        ...formData,
        startDate: clickedDate,
        endDate: clickedDate,
      });
      setOpenDialog(true);
    }
  };

  const handleEventClick = (info: any) => {
    const requestId = info.event.id;
    const request = requests.find(r => r.id === requestId);
    if (request) {
      handleOpenDialog(request);
    }
  };

  const handleSubmit = () => {
    if (!formData.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for your request",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (formData.endDate < formData.startDate) {
      toast({
        title: "Validation Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };



  const requests: TimeOffRequest[] = requestsData?.requests || [];

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const statusMatch = !statusFilter || req.status === statusFilter;
    const typeMatch = !typeFilter || req.type === typeFilter;
    return statusMatch && typeMatch;
  });



  const getDaysDifference = (start: string, end: string) => {
    return differenceInDays(parseISO(end), parseISO(start)) + 1;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              <EventIcon sx={{ mr: 2, verticalAlign: "middle" }} />
              Time Off Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {isManagerRole
                ? "Review and approve employee time off requests"
                : "Request and manage your time off"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => handleOpenDialog()}
            sx={{ height: "56px", px: 3 }}
          >
            New Request
          </Button>
        </Stack>

        {/* Summary Cards (for employees) */}
        {!isManagerRole && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h5">{requests.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h5">
                    {requests.filter((r) => r.status === "approved").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h5">
                    {requests.filter((r) => r.status === "pending").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h5">
                    {requests.filter((r) => r.status === "rejected").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              label="Filter by Type"
              onChange={(e) => {
                setTypeFilter(e.target.value);
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {timeOffTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Requests Table */}
        <Card>
          <CardHeader
            title={`Time Off Requests (${filteredRequests.length})`}
            avatar={<EventIcon sx={{ color: "primary.main" }} />}
          />
          <Divider />

          {isLoading ? (
            <CardContent sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </CardContent>
          ) : filteredRequests.length === 0 ? (
            <CardContent sx={{ py: 8 }}>
              <Alert severity="info" icon={<InfoIcon />}>
                No time off requests found
              </Alert>
            </CardContent>
          ) : (
            <>
            <>
              <Box sx={{ p: 2, height: '700px', '& .fc-event': { cursor: 'pointer' } }}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView={isManagerRole ? "dayGridMonth" : "dayGridMonth"}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listMonth'
                  }}
                  events={filteredRequests.map(req => {
                    // FullCalendar end date is exclusive for all-day events
                    const endDate = addDays(parseISO(req.endDate), 1).toISOString().split('T')[0];
                    
                    // Calculate advance days for this request (from requestedAt to startDate)
                    const reqStartDate = parseISO(req.startDate);
                    const reqRequestedAt = parseISO(req.requestedAt);
                    const advanceDays = Math.ceil((reqStartDate.getTime() - reqRequestedAt.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Check if this is a short notice request based on type
                    const typeConfig = timeOffTypes.find(t => t.value === req.type);
                    const minAdvance = typeConfig?.minAdvance ?? 0;
                    const isShortNotice = advanceDays < minAdvance && !['sick', 'emergency'].includes(req.type) && req.status === 'pending';
                    
                    let color = 'gray';
                    if (req.status === 'approved') color = '#10B981'; // Success Green
                    if (req.status === 'pending') color = '#F59E0B'; // Warning Orange
                    if (req.status === 'rejected') color = '#EF4444'; // Error Red

                    // Add short notice indicator for managers
                    const shortNoticeLabel = isManagerRole && isShortNotice ? ` ⚠️` : '';

                    return {
                       id: req.id,
                       title: isManagerRole && req.userName 
                         ? `${req.userName} - ${capitalizeFirstLetter(req.type)}${shortNoticeLabel}` 
                         : capitalizeFirstLetter(req.type),
                       start: req.startDate,
                       end: endDate,
                       backgroundColor: color,
                       borderColor: color,
                       allDay: true,
                       extendedProps: { ...req, advanceDays, isShortNotice }
                    };
                  })}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="100%"
                />
              </Box>
            </>
            </>
          )}
        </Card>
      </Container>

      {/* Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRequest ? "Edit Time Off Request" : "New Time Off Request"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {!isManagerRole && myCredits.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: "primary.50", border: 1, borderColor: "primary.100" }} elevation={0}>
                <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
                  Available Leave Balances ({new Date().getFullYear()})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {myCredits.map((credit: any) => (
                    <Chip 
                      key={credit.id}
                      size="small"
                      label={`${credit.leaveTypeConfig.label}: ${Number(credit.remainingCredits).toFixed(1)}d`}
                      color={Number(credit.remainingCredits) > 0 ? "primary" : "default"}
                      variant={Number(credit.remainingCredits) > 0 ? "filled" : "outlined"}
                    />
                  ))}
                </Stack>
              </Paper>
            )}

            <FormControl fullWidth>
              <InputLabel>Type of Leave</InputLabel>
              <Select
                value={formData.type}
                label="Type of Leave"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {timeOffTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(val) => setFormData(prev => ({
                  ...prev,
                  startDate: val,
                  endDate: (val && prev.endDate && prev.endDate < val) ? val : prev.endDate,
                }))}
                slotProps={{ textField: { fullWidth: true } }}
                disablePast
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(val) => setFormData(prev => ({ ...prev, endDate: val }))}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={formData.startDate || undefined}
                disablePast
              />
            </LocalizationProvider>

            {formData.startDate && formData.endDate && (
              <>
                <Paper sx={{ p: 2, bgcolor: "action.hover" }}>
                  <Typography variant="body2" color="textSecondary">
                    Duration: {differenceInDays(formData.endDate, formData.startDate) + 1} day(s)
                  </Typography>
                </Paper>
                
                {/* Live advance notice indicator */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const startDateObj = new Date(formData.startDate);
                  startDateObj.setHours(0, 0, 0, 0);
                  const advanceDays = Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const typeConfig = timeOffTypes.find(t => t.value === formData.type);
                  const minAdvance = typeConfig?.minAdvance ?? 0;
                  const isSickOrEmergency = ['sick', 'emergency'].includes(formData.type);
                  const isShortNotice = advanceDays < minAdvance && !isSickOrEmergency;
                  
                  return (
                    <Alert 
                      severity={isSickOrEmergency ? "info" : (isShortNotice ? "warning" : "success")}
                      icon={isShortNotice ? <WarningIcon /> : undefined}
                    >
                      <Typography variant="body2">
                        Advance Notice: <strong>{advanceDays} day(s)</strong>
                        {isSickOrEmergency && " — Same-day allowed for Sick/Emergency"}
                        {isShortNotice && ` — Below policy minimum (${minAdvance} days)`}
                        {!isSickOrEmergency && !isShortNotice && " — Within policy"}
                      </Typography>
                    </Alert>
                  );
                })()}
              </>
            )}

            <TextField
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              multiline
              rows={4}
              placeholder="Please provide a reason for your request..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
             {editingRequest && !isManagerRole && editingRequest.status === 'pending' && (
                <Button 
                  onClick={() => {
                    deleteMutation.mutate(editingRequest.id);
                    handleCloseDialog();
                  }}
                  color="error"
                >
                  Delete
                </Button>
             )}
             {editingRequest && isManagerRole && editingRequest.status === 'pending' && (
               <>
                 <Button
                   color="success"
                   onClick={() => {
                     approveMutation.mutate({ requestId: editingRequest.id, status: 'approved' });
                     handleCloseDialog();
                   }}
                 >
                   Approve
                 </Button>
                 <Button
                   color="error"
                   onClick={() => {
                     setRejectingRequest(editingRequest);
                     setRejectionReason('');
                     handleCloseDialog();
                     setRejectDialogOpen(true);
                   }}
                 >
                   Reject
                 </Button>
               </>
             )}
          </Box>
          <Box>
            <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : (editingRequest ? "Update" : "Submit")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {/* Rejection Reason Dialog (Manager) */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main', pb: 1 }}>
          Reject Time-Off Request
        </DialogTitle>
        <DialogContent>
          {rejectingRequest && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Rejecting <strong>{rejectingRequest.userName || 'employee'}</strong>'s {rejectingRequest.type} request
              ({format(parseISO(rejectingRequest.startDate), 'MMM d')} – {format(parseISO(rejectingRequest.endDate), 'MMM d, yyyy')}).
              Optionally state why.
            </Typography>
          )}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection (optional)"
            placeholder="e.g. Insufficient staffing on that date. Please try another date."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            inputProps={{ maxLength: 300 }}
            helperText={`${rejectionReason.length}/300`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (rejectingRequest) {
                approveMutation.mutate({ requestId: rejectingRequest.id, status: 'rejected', rejectionReason: rejectionReason.trim() || undefined });
              }
              setRejectDialogOpen(false);
              setRejectingRequest(null);
              setRejectionReason('');
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
