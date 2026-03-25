import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isManager, getCurrentUser, isAdmin, isEmployee, useAuth } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import { apiRequest, invalidateQueries } from "@/lib/queryClient";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
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
  SwapHoriz as SwapHorizIcon,
  Dashboard as DashboardIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  AccountTree as AccountTreeIcon,
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

export default function MuiBranches({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const theme = useTheme();
  const { user: currentUser, switchBranch } = useAuth();
  const isAdminRole = isAdmin();
  const isManagerRole = isManager();
  const isEmployeeRole = isEmployee();
  const canManage = isAdminRole || isManagerRole;
  const canSwitchBranch = isAdminRole; // Only admins can switch branches
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Branch switching state - auto-detect from user's branch or last used
  const getStoredBranch = (): string => {
    try {
      const stored = localStorage.getItem('lastBranchId');
      if (stored && canSwitchBranch) return stored;
    } catch {}
    return currentUser?.branchId || '';
  };

  const [selectedBranchId, setSelectedBranchId] = useState<string>(getStoredBranch());
  const [viewMode, setViewMode] = useState<'single' | 'all'>(
    canSwitchBranch ? 'all' : 'single'
  );
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

  // Persist selected branch for auto-detection on next visit
  const handleBranchSwitch = useCallback(async (branchId: string) => {
    setSelectedBranchId(branchId);
    if (branchId && canSwitchBranch) {
      const ok = await switchBranch(branchId);
      if (ok) {
        invalidateQueries.branchSwitch();
        toast({ title: `Switched to branch â€” all pages updated` });
      } else {
        toast({ title: 'Failed to switch branch', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Viewing all branches' });
    }
  }, [switchBranch, canSwitchBranch, toast]);

  // Fetch branches with real-time updates
  const { data: branchesResponse, isLoading, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/branches");
      return response.json();
    },
    refetchOnWindowFocus: true,
  });

  // Fetch employees - use all-branches endpoint for admin/manager, standard for employee
  const { data: employeesResponse } = useQuery({
    queryKey: canManage ? ["employees-all-branches"] : ["employees"],
    queryFn: async () => {
      const endpoint = canManage ? "/api/employees/all-branches" : "/api/employees";
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
  });

  const branches: Branch[] = Array.isArray(branchesResponse?.branches) ? branchesResponse.branches : (Array.isArray(branchesResponse) ? branchesResponse : []);
  const allEmployees: Employee[] = Array.isArray(employeesResponse?.employees) ? employeesResponse.employees : (Array.isArray(employeesResponse) ? employeesResponse : []);
  const activeBranches = branches.filter((b: Branch) => b.isActive);

  // Sync local selection with global user branch if it changes externally (e.g., from top nav)
  useEffect(() => {
    if (currentUser?.branchId && currentUser.branchId !== selectedBranchId) {
      setSelectedBranchId(currentUser.branchId);
    }
  }, [currentUser?.branchId, selectedBranchId]);

  // Filter branches based on view mode and role
  const displayedBranches = useMemo(() => {
    if (viewMode === 'all' && canSwitchBranch) {
      return branches;
    }
    if (selectedBranchId) {
      return branches.filter((b: Branch) => b.id === selectedBranchId);
    }
    // Branch managers see only their own branch
    if (isManagerRole && !isAdminRole && currentUser?.branchId) {
      return branches.filter((b: Branch) => b.id === currentUser.branchId);
    }
    return branches;
  }, [branches, viewMode, selectedBranchId, canSwitchBranch, isManagerRole, isAdminRole, currentUser?.branchId]);

  // Calculate stats based on displayed branches
  const displayedTotalEmployees = displayedBranches.reduce((sum: number, b: Branch) => sum + (b.employeeCount || 0), 0);
  const displayedActiveBranches = displayedBranches.filter((b: Branch) => b.isActive);
  const totalEmployees = branches.reduce((sum: number, b: Branch) => sum + (b.employeeCount || 0), 0);

  // Get employees for a specific branch
  const getBranchEmployees = (branchId: string) => 
    allEmployees.filter((e: Employee) => e.branchId === branchId && e.isActive);

  // Get the user's current branch name
  const currentBranchName = useMemo(() => {
    if (!currentUser?.branchId) return 'Unknown';
    const branch = branches.find((b: Branch) => b.id === currentUser.branchId);
    return branch?.name || 'Unknown';
  }, [currentUser?.branchId, branches]);

  const selectedBranchName = useMemo(() => {
    if (viewMode === 'all') return 'All Branches';
    const branch = branches.find((b: Branch) => b.id === selectedBranchId);
    return branch?.name || 'Select Branch';
  }, [selectedBranchId, branches, viewMode]);

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
      <Box sx={{ p: isEmbedded ? 0 : 3, pb: 4, minHeight: isEmbedded ? "auto" : "100vh", bgcolor: isEmbedded ? "transparent" : "background.default" }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Branch Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {canSwitchBranch 
                ? "Manage and switch between cafe locations" 
                : isManagerRole 
                  ? `Managing: ${currentBranchName}`
                  : `Your branch: ${currentBranchName}`
              }
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
            {isAdminRole && (
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

        {/* Branch Switcher - Only for roles that can switch */}
        {canManage && branches.length > 1 && (
          <Paper
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' }}>
                  <SwapHorizIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Branch View
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {canSwitchBranch 
                      ? "Switch between branches or view all at once" 
                      : "You are viewing your assigned branch"}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* All Branches toggle (admin only) */}
                {canSwitchBranch && (
                  <Button
                    variant={viewMode === 'all' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<DashboardIcon />}
                    onClick={() => {
                      setViewMode(viewMode === 'all' ? 'single' : 'all');
                      if (viewMode === 'single') {
                        toast({ title: 'Viewing all branches' });
                      }
                    }}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    All Branches
                  </Button>
                )}

                {/* Removed redundant duplicate branch selector dropdown to avoid confusion with global top-nav selector */}

                {/* Show lock indicator for branch-specific managers */}
                {isManagerRole && !isAdminRole && (
                  <Tooltip title="Branch managers can only view their assigned branch. Contact an admin to change branches.">
                    <Chip
                      icon={<LockIcon sx={{ fontSize: 14 }} />}
                      label={currentBranchName}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Employee role info banner */}
        {isEmployeeRole && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle>Your Branch: {currentBranchName}</AlertTitle>
            You are viewing information for your assigned branch. Contact your manager for any branch-related questions.
          </Alert>
        )}

        {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {viewMode === 'all' ? 'Total Branches' : 'Viewing'}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {displayedBranches.length}
                    {viewMode === 'single' && branches.length > 1 && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        of {branches.length}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2.5,
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
                  <Typography variant="h5" fontWeight={700}>
                    {displayedActiveBranches.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: "info.main" }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {viewMode === 'all' ? 'Total Staff' : 'Branch Staff'}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {displayedTotalEmployees}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2.5,
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
                  <Typography variant="h5" fontWeight={700}>
                    {displayedBranches.length > 0 ? Math.round(displayedTotalEmployees / displayedBranches.length) : 0}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Company Overview (visible in "All Branches" mode) */}
        {viewMode === 'all' && canSwitchBranch && displayedBranches.length > 1 && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: 'info.main' }}>
                <AccountTreeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>Company Overview</Typography>
                <Typography variant="caption" color="text.secondary">
                  Cross-branch summary across all {branches.length} locations
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Staff</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Managers</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Employees</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Since</TableCell>
                    {canSwitchBranch && <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch: Branch) => {
                    const branchEmployees = getBranchEmployees(branch.id);
                    const managers = branchEmployees.filter((e: Employee) => e.role === 'manager' || e.role === 'admin');
                    const regularEmployees = branchEmployees.filter((e: Employee) => e.role === 'employee');
                    return (
                      <TableRow key={branch.id} hover sx={{ cursor: canSwitchBranch ? 'pointer' : 'default' }}
                        onClick={() => { if (canSwitchBranch) { setViewMode('single'); handleBranchSwitch(branch.id); } }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' }}>
                              <StoreIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{branch.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{branch.address}</Typography>
                            </Box>
                            {branch.id === currentUser?.branchId && (
                              <Chip label="You" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={branch.isActive ? "Active" : "Inactive"}
                            size="small"
                            color={branch.isActive ? "success" : "default"}
                            sx={{ height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight={600}>{branch.employeeCount || 0}</Typography>
                        </TableCell>
                        <TableCell align="center">{managers.length}</TableCell>
                        <TableCell align="center">{regularEmployees.length}</TableCell>
                        <TableCell>
                          <Typography variant="caption">{safeFormatDate(branch.createdAt, "MMM yyyy")}</Typography>
                        </TableCell>
                        {canSwitchBranch && (
                          <TableCell align="center">
                            <Tooltip title={`Switch to ${branch.name}`}>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setViewMode('single'); handleBranchSwitch(branch.id); }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {/* Totals row */}
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Total ({branches.length} branches)</TableCell>
                    <TableCell align="center">
                      <Chip label={`${activeBranches.length} active`} size="small" color="success" sx={{ height: 22 }} />
                    </TableCell>
                    <TableCell align="center"><Typography fontWeight={700}>{totalEmployees}</Typography></TableCell>
                    <TableCell align="center">
                      {allEmployees.filter((e: Employee) => (e.role === 'manager' || e.role === 'admin') && e.isActive).length}
                    </TableCell>
                    <TableCell align="center">
                      {allEmployees.filter((e: Employee) => e.role === 'employee' && e.isActive).length}
                    </TableCell>
                    <TableCell colSpan={canSwitchBranch ? 2 : 1} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Branches Grid */}
        <Grid container spacing={3}>
          {displayedBranches.map((branch: Branch) => {
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
                      {/* Removed soft-delete trash icon, as the toggle switch accomplishes deactivation more cleanly */}
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

          {displayedBranches.length === 0 && !isLoading && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 8, textAlign: "center" }}>
                <StoreIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {branches.length === 0 ? 'No branches yet' : 'No branches match your filter'}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                  {branches.length === 0 
                    ? 'Create your first branch to get started' 
                    : 'Try switching to "All Branches" view'}
                </Typography>
                {canManage && branches.length === 0 && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
                    Add Branch
                  </Button>
                )}
                {branches.length > 0 && canSwitchBranch && (
                  <Button variant="outlined" startIcon={<DashboardIcon />} onClick={() => setViewMode('all')}>
                    View All Branches
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
