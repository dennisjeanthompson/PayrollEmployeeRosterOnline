import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { getCurrentUser, isManager, isAdmin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI X Data Grid
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";

// Icons
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as HealthIcon,
  BeachAccess as VacationIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

// Components
import { StatCard, EmptyState } from "@/components/mui/cards";

interface LeaveCredit {
  id: string;
  userId: string;
  branchId: string;
  employeeName?: string;
  position?: string;
  year: number;
  leaveType: string;
  totalCredits: string;
  usedCredits: string;
  remainingCredits: string;
  notes: string | null;
  updatedAt: string;
  leaveTypeConfig: {
    label: string;
    color: string;
    defaultDays: number;
  };
}

export default function MuiLeaveCredits() {
  const theme = useTheme();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const isMgrOptions = isManager() || isAdmin();

  // State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<LeaveCredit | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    leaveType: "sil",
    totalCredits: "5",
    usedCredits: "0",
    notes: "",
  });

  // Queries
  const { data: creditsData, isLoading: creditsLoading } = useQuery({
    queryKey: ["leave-credits", selectedYear, isMgrOptions ? "branch" : "my"],
    queryFn: async () => {
      const endpoint = isMgrOptions ? "/api/leave-credits/branch" : "/api/leave-credits/my";
      const res = await apiRequest("GET", `${endpoint}?year=${selectedYear}`);
      return res.json() as Promise<{ credits: LeaveCredit[]; year: number }>;
    },
  });

  const { data: employeesData } = useQuery<{ employees: any[] }>({
    queryKey: ["/api/employees"],
    enabled: isMgrOptions,
  });

  const credits = creditsData?.credits || [];
  const employees = employeesData?.employees || [];

  // Mutations
  const grantMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/leave-credits/grant", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-credits"] });
      toast({ title: "Success", description: "Leave credits granted" });
      handleCloseDialog();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/leave-credits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-credits"] });
      toast({ title: "Success", description: "Leave credits updated" });
      handleCloseDialog();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleOpenGrantDialog = () => {
    setEditingCredit(null);
    setFormData({ userId: "", leaveType: "sil", totalCredits: "5", usedCredits: "0", notes: "" });
    setGrantDialogOpen(true);
  };

  const handleOpenEditDialog = (credit: LeaveCredit) => {
    setEditingCredit(credit);
    setFormData({
      userId: credit.userId,
      leaveType: credit.leaveType,
      totalCredits: credit.totalCredits,
      usedCredits: credit.usedCredits || "0",
      notes: credit.notes || "",
    });
    setGrantDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setGrantDialogOpen(false);
    setEditingCredit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCredit) {
      updateMutation.mutate({
        id: editingCredit.id,
        data: {
          totalCredits: formData.totalCredits,
          usedCredits: formData.usedCredits,
          notes: formData.notes,
        },
      });
    } else {
      grantMutation.mutate({
        userId: formData.userId,
        leaveType: formData.leaveType,
        totalCredits: formData.totalCredits,
        year: selectedYear,
        notes: formData.notes,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isMgrOptions ? (
             <Box>
                <Typography variant="body2" fontWeight={600}>
                  {params.row.employeeName}
                </Typography>
             </Box>
          ) : (
            <Typography variant="body2" fontWeight={600}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.row.leaveTypeConfig.label} 
          size="small" 
          sx={{ 
            bgcolor: `${params.row.leaveTypeConfig.color}20`, 
            color: params.row.leaveTypeConfig.color,
            fontWeight: 600 
          }} 
        />
      ),
    },
    {
      field: "totalCredits",
      headerName: "Total Granted",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={500}>{Number(params.row.totalCredits).toFixed(1)}</Typography>
      ),
    },
    {
      field: "usedCredits",
      headerName: "Used",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="error.main">{Number(params.row.usedCredits).toFixed(1)}</Typography>
      ),
    },
    {
      field: "remainingCredits",
      headerName: "Remaining Balance",
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={`${Number(params.row.remainingCredits).toFixed(1)} Days`} 
          color={Number(params.row.remainingCredits) > 0 ? "success" : "default"}
          variant={Number(params.row.remainingCredits) > 0 ? "filled" : "outlined"}
          size="small"
        />
      ),
    },
    ...(isMgrOptions ? [{
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Edit Balance">
          <IconButton size="small" onClick={() => handleOpenEditDialog(params.row as LeaveCredit)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    } as GridColDef] : []),
  ];

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Leave Credits & Balances
            </Typography>
            <Typography color="text.secondary">
              Track statutory and discretionary leave entitlements for {selectedYear}.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Year Selector */}
            <Paper 
              elevation={0} 
              sx={{ display: "flex", alignItems: "center", gap: 1, p: 0.5, borderRadius: 2, bgcolor: "action.hover" }}
            >
              <IconButton size="small" onClick={() => setSelectedYear(y => y - 1)} sx={{ color: "primary.main" }}>
                <ChevronLeftIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2 }}>
                <CalendarIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2" fontWeight={600}>{selectedYear}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedYear(y => y + 1)} sx={{ color: "primary.main" }}>
                <ChevronRightIcon />
              </IconButton>
            </Paper>

            {isMgrOptions && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenGrantDialog}
                sx={{ boxShadow: 2 }}
              >
                Grant Leave
              </Button>
            )}
          </Stack>
        </Box>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Service Incentive Leave (SIL) of 5 days is mandated by Philippine Labor Code (Art. 95) for employees with at least 1 year of service.
        </Alert>

        {/* Data Grid */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {credits.length > 0 ? (
            <DataGrid
              rows={credits}
              columns={columns}
              loading={creditsLoading}
              disableRowSelectionOnClick
              rowHeight={60}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              initialState={{
                pagination: { paginationModel: { pageSize: 15 } },
                sorting: { sortModel: [{ field: "employeeName", sort: "asc" }] },
              }}
              pageSizeOptions={[15, 30, 50]}
              sx={{
                border: "none",
                "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
                "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover", borderRadius: 0 },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
              }}
            />
          ) : (
            <EmptyState
              icon={<VacationIcon />}
              title="No leave credits found"
              description={`No leave balances have been granted for ${selectedYear}.`}
            />
          )}
        </Paper>
      </Stack>

      {/* Grant/Edit Dialog */}
      <Dialog open={grantDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingCredit ? "Edit Leave Balance" : "Grant Leave Credits"}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <FormControl fullWidth disabled={!!editingCredit}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.userId}
                  label="Employee"
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  {employees.map((emp: any) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!!editingCredit}>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leaveType}
                  label="Leave Type"
                  onChange={(e) => {
                    const type = e.target.value;
                    let defaultDays = "0";
                    if (type === "sil") defaultDays = "5";
                    if (type === "solo_parent") defaultDays = "7";
                    if (type === "vawc") defaultDays = "10";
                    setFormData({ ...formData, leaveType: type, totalCredits: defaultDays });
                  }}
                  required
                >
                  <MenuItem value="sil">Service Incentive Leave (SIL) - 5 days</MenuItem>
                  <MenuItem value="solo_parent">Solo Parent Leave - 7 days</MenuItem>
                  <MenuItem value="vawc">VAWC Leave - 10 days</MenuItem>
                  <MenuItem value="vacation">Vacation Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ flex: editingCredit ? 1 : 2 }}>
                  <TextField
                    fullWidth
                    label="Total Credits (Days)"
                    type="number"
                    inputProps={{ step: "0.5", min: "0" }}
                    value={formData.totalCredits}
                    onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                    required
                  />
                </Box>
                {editingCredit && (
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Used Credits (Days)"
                      type="number"
                      inputProps={{ step: "0.5", min: "0" }}
                      value={formData.usedCredits}
                      onChange={(e) => setFormData({ ...formData, usedCredits: e.target.value })}
                      required
                    />
                  </Box>
                )}
              </Stack>

              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Pro-rated for mid-year hire"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={grantMutation.isPending || updateMutation.isPending}
            >
              {editingCredit ? "Update Balance" : "Grant Credits"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
