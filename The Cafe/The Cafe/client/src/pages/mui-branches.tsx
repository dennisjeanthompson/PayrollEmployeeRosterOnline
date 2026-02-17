import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, getCurrentUser, isAdmin } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  alpha,
  useTheme,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import {
  Store as StoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  AccessTime as ClockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Safe date formatting helper
const safeFormatDate = (dateValue: string | Date | null | undefined, formatStr: string): string => {
  if (!dateValue) return 'N/A';
  try {
    // If it's already a Date object, format it directly
    if (dateValue instanceof Date) {
      return format(dateValue, formatStr);
    }
    // If it's a string, parse it first
    if (typeof dateValue === 'string') {
      return format(parseISO(dateValue), formatStr);
    }
    return 'N/A';
  } catch {
    return 'N/A';
  }
};

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  employeeCount?: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  position: string;
  email: string;
  isActive: boolean;
  branchId: string;
}

export default function MuiBranches() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const isAdminRole = isAdmin();
  const isManagerRole = isManager();
  const canManage = isAdminRole || isManagerRole;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });

  // Fetch branches with real-time updates
  const { data: branchesResponse, isLoading, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/branches");
      return response.json();
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  // Fetch employees to show per-branch staff
  const { data: employeesResponse } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/employees");
      return response.json();
    },
    refetchInterval: 10000,
  });

  const branches: Branch[] = branchesResponse?.branches || [];
  const allEmployees: Employee[] = employeesResponse || [];
  const activeBranches = branches.filter((b) => b.isActive);
  const totalEmployees = branches.reduce((sum, b) => sum + (b.employeeCount || 0), 0);

  // Get employees for a specific branch
  const getBranchEmployees = (branchId: string) => 
    allEmployees.filter((e: Employee) => e.branchId === branchId && e.isActive);

  // Create branch mutation
  const createBranch = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/branches", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch created successfully" });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create branch", variant: "destructive" });
    },
  });

  // Update branch mutation
  const updateBranch = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const response = await apiRequest("PATCH", `/api/branches/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch updated" });
      setEditingBranch(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update branch", variant: "destructive" });
    },
  });

  // Toggle branch active/inactive
  const toggleBranch = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/branches/${id}`, { isActive });
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: isActive ? "Branch activated" : "Branch deactivated" });
    },
    onError: () => {
      toast({ title: "Failed to update branch", variant: "destructive" });
    },
  });

  // Delete branch mutation (soft delete)
  const deleteBranch = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch deactivated" });
      setDeleteDialogOpen(false);
      setDeletingBranch(null);
    },
    onError: () => {
      toast({ title: "Failed to delete branch", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", address: "", phone: "", email: "", isActive: true });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || "",
      email: branch.email || "",
      isActive: branch.isActive,
    });
  };

  const handleDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingBranch) {
      updateBranch.mutate({ id: editingBranch.id, data: formData });
    } else {
      createBranch.mutate(formData);
    }
  };

  return (
    <>
      <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Branch Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your cafe locations and branches
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
            {canManage && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add Branch
              </Button>
            )}
          </Stack>
        </Box>

        {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Branches
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {branches.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: "success.main" }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {activeBranches.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: "info.main" }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Staff
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalEmployees}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: "secondary.main" }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Staff/Branch
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {branches.length > 0 ? Math.round(totalEmployees / branches.length) : 0}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Branches Grid */}
        <Grid container spacing={3}>
          {branches.map((branch) => {
            const branchEmployees = getBranchEmployees(branch.id);
            const isExpanded = expandedBranch === branch.id;

            return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={branch.id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${branch.isActive ? 'rgba(255, 255, 255, 0.08)' : alpha(theme.palette.warning.main, 0.3)}`,
                  opacity: branch.isActive ? 1 : 0.75,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Badge
                      badgeContent={branch.employeeCount || 0}
                      color="primary"
                      max={99}
                    >
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: branch.isActive
                            ? alpha(theme.palette.primary.main, 0.15)
                            : alpha(theme.palette.grey[500], 0.15),
                          color: branch.isActive ? "primary.main" : "grey.500",
                        }}
                      >
                        <StoreIcon fontSize="large" />
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {branch.name}
                      </Typography>
                      <Chip
                        label={branch.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={branch.isActive ? "success" : "default"}
                        icon={branch.isActive ? <ActiveIcon /> : <InactiveIcon />}
                      />
                    </Box>
                  </Stack>

                  {canManage && (
                    <Stack direction="row">
                      <Tooltip title={branch.isActive ? "Deactivate" : "Activate"}>
                        <IconButton
                          size="small"
                          onClick={() => toggleBranch.mutate({ id: branch.id, isActive: !branch.isActive })}
                        >
                          {branch.isActive ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(branch)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(branch)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <LocationIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                    <Typography variant="body2" color="text.secondary">
                      {branch.address}
                    </Typography>
                  </Stack>

                  {branch.phone && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {branch.phone}
                      </Typography>
                    </Stack>
                  )}

                  {branch.email && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {branch.email}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ cursor: "pointer" }}
                    onClick={() => setExpandedBranch(isExpanded ? null : branch.id)}
                  >
                    <PeopleIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>{branch.employeeCount || 0}</strong> employee{(branch.employeeCount || 0) !== 1 ? "s" : ""}
                    </Typography>
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </Stack>
                  <Typography variant="caption" color="text.disabled">
                    Since {safeFormatDate(branch.createdAt, "MMM yyyy")}
                  </Typography>
                </Stack>

                {/* Expandable Employee List */}
                <Collapse in={isExpanded}>
                  <Box sx={{ mt: 2 }}>
                    {branchEmployees.length > 0 ? (
                      <List dense disablePadding>
                        {branchEmployees.map((emp) => (
                          <ListItem key={emp.id} disablePadding sx={{ py: 0.5 }}>
                            <ListItemAvatar sx={{ minWidth: 36 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }}>
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${emp.firstName} ${emp.lastName}`}
                              secondary={emp.position || emp.role}
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
                        No active employees
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </Grid>
            );
          })}

          {branches.length === 0 && !isLoading && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 8, textAlign: "center" }}>
                <StoreIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No branches yet
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                  Create your first branch to get started
                </Typography>
                {canManage && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
                    Add Branch
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || !!editingBranch}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditingBranch(null);
            resetForm();
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <StoreIcon color="primary" />
              <span>{editingBranch ? "Edit Branch" : "Add New Branch"}</span>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Branch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Downtown Branch"
              />

              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                fullWidth
                required
                multiline
                rows={2}
                placeholder="Full address..."
              />

              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                placeholder="(123) 456-7890"
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                placeholder="branch@cafe.com"
              />

              {editingBranch && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="success"
                    />
                  }
                  label={formData.isActive ? "Active" : "Inactive"}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setCreateDialogOpen(false);
                setEditingBranch(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.address || createBranch.isPending || updateBranch.isPending}
            >
              {createBranch.isPending || updateBranch.isPending
                ? "Saving..."
                : editingBranch
                ? "Update"
                : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => { setDeleteDialogOpen(false); setDeletingBranch(null); }}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarningIcon color="error" />
              <span>Delete Branch</span>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mt: 1 }}>
              <AlertTitle>Are you sure?</AlertTitle>
              This will permanently delete <strong>{deletingBranch?.name}</strong>.
              {(deletingBranch?.employeeCount || 0) > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This branch has <strong>{deletingBranch?.employeeCount}</strong> employee(s) assigned.
                  They will need to be reassigned.
                </Typography>
              )}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => { setDeleteDialogOpen(false); setDeletingBranch(null); }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deletingBranch && deleteBranch.mutate(deletingBranch.id)}
              disabled={deleteBranch.isPending}
            >
              {deleteBranch.isPending ? "Deleting..." : "Delete Branch"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
