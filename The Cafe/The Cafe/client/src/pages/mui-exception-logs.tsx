import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// MUI Components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";

// MUI Data Grid
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const exceptionTypes = [
  { value: "overtime", label: "Regular Overtime" },
  { value: "late", label: "Tardiness (Late)" },
  { value: "undertime", label: "Undertime" },
  { value: "absent", label: "Absent" },
  { value: "rest_day_ot", label: "Rest Day OT" },
  { value: "special_holiday_ot", label: "Special Holiday OT" },
  { value: "regular_holiday_ot", label: "Regular Holiday OT" },
  { value: "night_diff", label: "Night Differential" },
];

const getStatusColor = (status: string): "error" | "warning" | "success" | "default" | "info" => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    case "employee_verified":
      return "info";
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
    case "employee_verified":
      return <CheckCircleIcon sx={{ fontSize: 18 }} />;
    default:
      return null;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'employee_verified': return "Verified";
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return 'Pending';
  }
};

export default function MuiExceptionLogs() {
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: "overtime",
    date: new Date() as Date | null,
    value: "",
    remarks: "",
  });

  // Fetch adjustment logs for the current employee
  const { data: requestData, isLoading } = useQuery({
    queryKey: ["employee-adjustment-logs", currentUser?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/adjustment-logs/mine");
      const data = await response.json();
      return data.logs || [];
    },
  });

  // Submit new exception log
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        type: data.type,
        date: data.date ? format(data.date, "yyyy-MM-dd") : "",
        value: Number(data.value),
        remarks: data.remarks,
      };

      const response = await apiRequest("POST", "/api/adjustment-logs/request", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-adjustment-logs"] });
      toast({
        title: "Success",
        description: "Exception request submitted successfully.",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit exception request",
        variant: "destructive",
      });
    },
  });

  // Verify an existing manager-logged exception
  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/adjustment-logs/${id}/verify`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-adjustment-logs"] });
      toast({
        title: "Verified",
        description: "Exception log has been verified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify exception",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      type: "overtime",
      date: new Date(),
      value: "",
      remarks: "",
    });
  };

  const validateForm = () => {
    if (!formData.date) return "Date is required.";
    if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) return "Please enter a valid numeric value.";
    if (!formData.remarks.trim()) return "Remarks are required.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const columns: GridColDef[] = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 130,
      renderCell: (params) => format(new Date(params.row.date), "MMM d, yyyy") 
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 180,
      renderCell: (params) => {
        const typeInfo = exceptionTypes.find(t => t.value === params.value);
        return typeInfo ? typeInfo.label : params.value;
      }
    },
    { 
      field: 'value', 
      headerName: 'Value', 
      width: 100,
      renderCell: (params) => {
        const isMins = ['late', 'undertime'].includes(params.row.type);
        const isDays = params.row.type === 'absent';
        return `${params.value} ${isMins ? 'mins' : isDays ? 'days' : 'hrs'}`;
      }
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value) || undefined}
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
          variant={['pending', 'employee_verified'].includes(params.value) ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const isPending = params.row.status === 'pending';
        const isManagerLogged = params.row.loggedBy !== currentUser?.id;
        
        if (isPending && isManagerLogged) {
          return (
             <Button
                variant="contained"
                size="small"
                color="info"
                onClick={() => verifyMutation.mutate(params.row.id)}
                disabled={verifyMutation.isPending}
             >
                Verify
             </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">My Exception Logs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Request Exception
        </Button>
      </Box>

      <Card elevation={1}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={requestData || []}
              columns={columns}
              loading={isLoading}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'date', sort: 'desc' }] }
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Exception Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request Payroll Exception</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Exception Type</InputLabel>
              <Select
                value={formData.type}
                label="Exception Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {exceptionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Exception"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              required
              label={['late', 'undertime'].includes(formData.type) ? "Minutes" : formData.type === 'absent' ? "Days" : "Hours"}
              type="number"
              inputProps={{ min: 0.1, step: 0.1 }}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              helperText={`Enter the exact number of ${['late', 'undertime'].includes(formData.type) ? "minutes" : formData.type === 'absent' ? "days" : "hours"}.`}
            />

            <TextField
              fullWidth
              required
              label="Remarks / Reason"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Provide a clear reason (DOLE compliance requires context)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? <CircularProgress size={24} /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
