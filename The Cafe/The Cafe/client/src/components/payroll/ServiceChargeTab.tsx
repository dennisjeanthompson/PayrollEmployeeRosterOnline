import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Stack,
  Tooltip,
  Alert,
  InputAdornment,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Icons
import {
  Add as AddIcon,
  LocalAtm as AtmIcon,
  Delete as DeleteIcon,
  AutoAwesome as DistributeIcon,
} from "@mui/icons-material";
import { EmptyState } from "./cards";

interface ServiceChargePool {
  id: string;
  branchId: string;
  periodStartDate: string;
  periodEndDate: string;
  totalCollected: string;
  eligibleEmployeeCount: number;
  perEmployeeAmount: string;
  status: string;
  distributedAt: string | null;
  createdAt: string;
}

export function ServiceChargeTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<ServiceChargePool | null>(null);

  // Form State
  const [totalCollected, setTotalCollected] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Fetch pools
  const { data: poolsData, isLoading } = useQuery({
    queryKey: ["service-charge-pools"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/service-charge/pools");
      return res.json() as Promise<{ pools: ServiceChargePool[] }>;
    },
  });
  const pools = poolsData?.pools || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/service-charge/pools", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-charge-pools"] });
      toast({ title: "Pool Created", description: data.message });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/service-charge/pools/${id}/distribute`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-charge-pools"] });
      toast({ title: "Distributed", description: data.message });
      setDistributeDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/service-charge/pools/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-charge-pools"] });
      toast({ title: "Success", description: "Pool deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTotalCollected("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !totalCollected) return;
    createMutation.mutate({
      totalCollected,
      periodStartDate: format(startDate, "yyyy-MM-dd"),
      periodEndDate: format(endDate, "yyyy-MM-dd"),
    });
  };

  const columns: GridColDef[] = [
    {
      field: "period",
      headerName: "Collection Period",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600}>
          {format(new Date(params.row.periodStartDate), "MMM d")} - {format(new Date(params.row.periodEndDate), "MMM d, yyyy")}
        </Typography>
      ),
    },
    {
      field: "totalCollected",
      headerName: "Total (₱)",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          ₱{Number(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "perEmployeeAmount",
      headerName: "Per Employee",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          ₱{Number(params.value).toLocaleString()} <Typography component="span" variant="caption" color="text.secondary">({params.row.eligibleEmployeeCount} pax)</Typography>
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value === 'distributed' ? 'Distributed' : 'Draft'} 
          color={params.value === 'distributed' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          {params.row.status === 'draft' && (
            <>
              <Tooltip title="Distribute to Employees">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => {
                    setSelectedPool(params.row as ServiceChargePool);
                    setDistributeDialogOpen(true);
                  }}
                >
                  <DistributeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Draft">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => deleteMutation.mutate(params.row.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Service Charge Pools</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and distribute Service Charge (RA 11360) to rank-and-file employees.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => { resetForm(); setCreateDialogOpen(true); }}
        >
          New Pool
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        By law (RA 11360), 100% of collected service charges must be distributed equally among all covered rank-and-file employees. Managers are excluded from this distribution.
      </Alert>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider" }}>
        {pools.length > 0 ? (
          <DataGrid
            rows={pools}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            rowHeight={60}
            autoHeight
            initialState={{
              pagination: { paginationModel: { pageSize: 15 } },
              sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
            }}
            pageSizeOptions={[15, 30]}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover", borderRadius: 0 },
            }}
          />
        ) : (
          <EmptyState
            icon={<AtmIcon />}
            title="No Service Charge Pools"
            description="Create a pool to start distributing service charges."
          />
        )}
      </Paper>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle>Create Service Charge Pool</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Total Collected Amount"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={totalCollected}
                onChange={(e) => setTotalCollected(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Collection Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { required: true } }}
                />
                <DatePicker
                  label="Collection End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate || undefined}
                  slotProps={{ textField: { required: true } }}
                />
              </LocalizationProvider>
              <Typography variant="body2" color="text.secondary">
                The system will automatically identify all eligible rank-and-file employees in the branch to compute their equal share.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Pool"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Distribute Dialog */}
      <Dialog open={distributeDialogOpen} onClose={() => setDistributeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>Distribute Service Charge</DialogTitle>
        <DialogContent dividers>
          {selectedPool && (
            <Stack spacing={2}>
              <Typography variant="body1">
                You are about to distribute <strong>₱{Number(selectedPool.totalCollected).toLocaleString()}</strong> among <strong>{selectedPool.eligibleEmployeeCount} eligible employees</strong>.
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                <Stack spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">Each employee will receive</Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    ₱{Number(selectedPool.perEmployeeAmount).toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
              <Typography variant="body2" color="text.secondary">
                This process will append this amount strictly to each employee's latest unfinalized payroll entry that falls within the collection period of {format(new Date(selectedPool.periodStartDate), "MMM d")} - {format(new Date(selectedPool.periodEndDate), "MMM d")}.
              </Typography>
              <Alert severity="warning">
                This action cannot be undone. Ensure the payroll periods covering these dates are generated (at least in Draft state) before distributing.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDistributeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => selectedPool && distributeMutation.mutate(selectedPool.id)}
            disabled={distributeMutation.isPending}
            startIcon={<DistributeIcon />}
          >
            {distributeMutation.isPending ? "Distributing..." : "Confirm & Distribute"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
