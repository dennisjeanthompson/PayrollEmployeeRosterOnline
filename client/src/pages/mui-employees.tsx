import PesoIcon from "@/components/PesoIcon";
import { useState, useEffect, useMemo, useCallback, useDeferredValue, startTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from "date-fns";
import { useRealtime } from "@/hooks/use-realtime";
import { apiRequest } from "@/lib/queryClient";
import { isManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { StatCard, InfoCard, EmptyState } from "@/components/mui/cards";

// MUI Components
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  alpha,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Fab,
  Zoom,
  Collapse,
  CircularProgress,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI Icons
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Receipt as ReceiptIcon,
  People as UsersIcon,
  AccessTime as ClockIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  Security as SecurityIcon,
  LocalHospital as LocalHospitalIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

// MUI X Data Grid
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";

// Custom Components
import { DeletionOptionsModal } from "@/components/employees/deletion-options-modal";
import ProfilePhotoUpload from "@/components/employees/ProfilePhotoUpload";
import DocumentUpload, { DocumentType } from "@/components/employees/DocumentUpload";
import { isAdmin } from "@/lib/auth";

// Types
interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "manager" | "admin";
  position: string;
  hourlyRate: string;
  branchId: string;
  isActive: boolean;
  photoUrl?: string;
  photoPublicId?: string;
  createdAt: string;
  hoursThisMonth?: number;
  shiftsThisMonth?: number;
  sssLoanDeduction?: string;
  pagibigLoanDeduction?: string;
  cashAdvanceDeduction?: string;
  otherDeductions?: string;
  tin?: string;
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  isMwe?: boolean;
}

interface Branch {
  id: string;
  name: string;
}

const getRoleColor = (role: string): "primary" | "secondary" | "default" => {
  switch (role) {
    case "manager":
      return "primary";
    case "admin":
      return "secondary";
    default:
      return "default";
  }
};

interface EmployeeFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "manager";
  position: string;
  hourlyRate: string;
  branchId: string;
  isActive: boolean;
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  isMwe: boolean;
}

const initialFormData: EmployeeFormData = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "employee",
  position: "",
  hourlyRate: "",
  branchId: "",
  isActive: true,
  tin: "",
  sssNumber: "",
  philhealthNumber: "",
  pagibigNumber: "",
  isMwe: false,
};

// â”€â”€â”€ Sub-component: Read-only display of approved loans from the formal workflow â”€â”€â”€
function ActiveLoansDisplay({ employeeId }: { employeeId?: string }) {
  const { data: loans = [] } = useQuery<any[]>({
    queryKey: ['/api/loans/user', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const res = await fetch(`/api/loans/user/${employeeId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!employeeId,
  });

  const activeLoans = loans.filter((l: any) => l.status === 'approved');
  const pendingLoans = loans.filter((l: any) => l.status === 'pending');

  if (activeLoans.length === 0 && pendingLoans.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 1 }}>
        No active or pending loan deductions for this employee.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {activeLoans.map((loan: any) => (
        <Box key={loan.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'success.light', borderRadius: 1, bgcolor: 'success.50' }}>
          <Box>
            <Typography variant="body2" fontWeight={600}>{loan.loanType} Loan</Typography>
            <Typography variant="caption" color="text.secondary">Ref: {loan.referenceNumber}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={700} color="primary.main">₱{Number(loan.monthlyAmortization).toFixed(2)}/mo</Typography>
            <Chip label="ACTIVE" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
          </Box>
        </Box>
      ))}
      {pendingLoans.map((loan: any) => (
        <Box key={loan.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px dashed', borderColor: 'warning.light', borderRadius: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight={600}>{loan.loanType} Loan</Typography>
            <Typography variant="caption" color="text.secondary">Ref: {loan.referenceNumber}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">₱{Number(loan.monthlyAmortization).toFixed(2)}/mo</Typography>
            <Chip label="PENDING APPROVAL" size="small" color="warning" sx={{ height: 18, fontSize: '0.6rem' }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export default function MuiEmployees() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const managerRole = isManager();

  // State

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Month selector state - allows viewing stats for any month
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deductionsDialogOpen, setDeductionsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [deductionsFormData, setDeductionsFormData] = useState({
    sssLoanDeduction: "0",
    pagibigLoanDeduction: "0",
    cashAdvanceDeduction: "0",
    otherDeductions: "0",
  });

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; employee: Employee } | null>(null);

  // Deletion modal state
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [employeeRelatedData, setEmployeeRelatedData] = useState<{ hasShifts: boolean; hasPayroll: boolean; totalRecords: number } | null>(null);
  const userIsAdmin = isAdmin();

  // Redirect non-managers
  useEffect(() => {
    if (!managerRole) {
      startTransition(() => setLocation("/"));
    }
  }, [managerRole, setLocation]);

  // Queries with real-time updates - now accepts month parameter
  const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
  
  const { data: employeesResponse, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ["/api/hours/all-employees", monthStart, monthEnd],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/hours/all-employees?startDate=${monthStart}&endDate=${monthEnd}`);
      return response.json();
    },
    enabled: managerRole,
    refetchOnWindowFocus: true,
  });

  const { data: branchesResponse } = useQuery<{ branches: Branch[] }>({
    queryKey: ["/api/branches"],
    enabled: managerRole,
    refetchOnWindowFocus: true,
  });

  // Enable real-time updates
  useRealtime({
    queryKeys: ["/api/hours/all-employees", "/api/employees"],
  });

  const { data: employeeStats } = useQuery({
    queryKey: ["employee-stats", monthStart, monthEnd],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/employees/stats?startDate=${monthStart}&endDate=${monthEnd}`);
      return response.json();
    },
    enabled: managerRole,
    refetchOnWindowFocus: true,
  });

  // Fetch documents for current employee
  const { data: documentsResponse, refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/employees", currentEmployee?.id, "documents"],
    queryFn: async () => {
      if (!currentEmployee?.id) return [];
      const response = await apiRequest("GET", `/api/employees/${currentEmployee.id}/documents`);
      return response.json();
    },
    enabled: !!currentEmployee?.id && (viewDialogOpen || formDialogOpen),
  });

  const employeesData = employeesResponse?.employees || [];
  const branchesData = branchesResponse?.branches || [];
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const branchNameById = useMemo(
    () => new Map(branchesData.map((branch) => [branch.id, branch.name])),
    [branchesData]
  );

  const getBranchName = useCallback(
    (branchId: string) => branchNameById.get(branchId) || "Unknown",
    [branchNameById]
  );

  const invalidateEmployeeQueries = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0] as string | undefined;
        return (
          key === "/api/hours/all-employees" ||
          key === "/api/employees" ||
          key === "employees" ||
          key === "employee-stats"
        );
      },
    });
  }, [queryClient]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();

    return employeesData.filter((employee) => {
      const matchesSearch =
        normalizedSearchTerm === "" ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(normalizedSearchTerm) ||
        employee.email.toLowerCase().includes(normalizedSearchTerm) ||
        employee.position.toLowerCase().includes(normalizedSearchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.isActive) ||
        (statusFilter === "inactive" && !employee.isActive);

      const matchesRole = roleFilter === "all" || employee.role === roleFilter;
      const matchesBranch = branchFilter === "all" || employee.branchId === branchFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesBranch;
    });
  }, [employeesData, deferredSearchTerm, statusFilter, roleFilter, branchFilter]);

  // Mutations
  const createEmployee = useMutation({
    mutationFn: async (employeeData: EmployeeFormData) => {
      const response = await apiRequest("POST", "/api/employees", employeeData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create employee");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all employee-related queries for real-time sync inside transition
      startTransition(() => {
        invalidateEmployeeQueries();
        handleCloseFormDialog();
      });
      toast({ title: "Success", description: "Employee created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee");
      }
      return response.json();
    },
    onSuccess: () => {
      startTransition(() => {
        // Invalidate all employee-related queries for real-time sync
        invalidateEmployeeQueries();
        handleCloseFormDialog();
      });
      toast({ title: "Success", description: "Employee updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      const url = force ? `/api/employees/${id}?force=true` : `/api/employees/${id}`;
      const response = await apiRequest("DELETE", url);
      if (!response.ok) {
        const error = await response.json();
        // Check if it's a "has related data" response
        if (error.hasRelatedData) {
          return { hasRelatedData: true, relatedData: error.relatedData };
        }
        throw new Error(error.message || "Failed to delete employee");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.hasRelatedData) {
        // Show deletion options modal instead
        setEmployeeRelatedData({
          hasShifts: data.relatedData.hasShifts,
          hasPayroll: data.relatedData.hasPayroll,
          totalRecords: data.relatedData.totalRecords,
        });
        setDeletionModalOpen(true);
        return;
      }
      // Refresh all employee-related caches.
      startTransition(() => {
        invalidateEmployeeQueries();
        setDeletionModalOpen(false);
        setCurrentEmployee(null);
        setEmployeeRelatedData(null);
      });
      toast({ title: "Success", description: data?.forceDeleted ? "Employee and all data permanently deleted" : "Employee deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Export employee data
  const exportEmployeeData = async (id: string) => {
    try {
      const response = await apiRequest("GET", `/api/employees/${id}/export`);
      if (!response.ok) throw new Error("Failed to export data");
      const data = await response.json();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee_${data.employee.firstName}_${data.employee.lastName}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Employee data exported successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateDeductions = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof deductionsFormData }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}/deductions`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update deductions");
      }
      return response.json();
    },
    onSuccess: () => {
      startTransition(() => {
        invalidateEmployeeQueries();
        setDeductionsDialogOpen(false);
      });
      toast({ title: "Success", description: "Deductions updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Toggle employee status (activate/deactivate)
  const toggleEmployeeStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {

      const response = await apiRequest("PATCH", `/api/employees/${id}/status`, { isActive });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee status");
      }
      return response.json();
    },
    onSuccess: (data, { isActive }) => {
      startTransition(() => {
        invalidateEmployeeQueries();
        // Close the deletion modal if open
        setDeletionModalOpen(false);
        setEmployeeRelatedData(null);
        // Update current employee if viewing
        if (currentEmployee) {
          setCurrentEmployee({ ...currentEmployee, isActive });
        }
      });
      const action = isActive ? "activated" : "deactivated";
      toast({ title: "Success", description: `Employee ${action} successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Bulk activate/deactivate employees
  const bulkToggleStatus = useMutation({
    mutationFn: async ({ ids, isActive }: { ids: string[]; isActive: boolean }) => {

      const promises = ids.map(id =>
        apiRequest("PATCH", `/api/employees/${id}/status`, { isActive })
      );
      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (!result.ok) {
          const error = await result.json();
          throw new Error(error.message || "Failed to update employee status");
        }
      }
      
      return results;
    },
    onSuccess: (data, { isActive, ids }) => {
      startTransition(() => {
        invalidateEmployeeQueries();
        setSelectedEmployees([]);
      });
      const action = isActive ? "activated" : "deactivated";
      toast({ title: "Success", description: `${ids.length} employees ${action} successfully` });
    },
  });

  // Handlers
  const handleOpenAddDialog = useCallback(() => {
    setIsEditing(false);
    setFormData(initialFormData);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((employee: Employee) => {
    setIsEditing(true);
    setCurrentEmployee(employee);
    setFormData({
      username: employee.username,
      password: "password123",
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role as "employee" | "manager",
      position: employee.position,
      hourlyRate: employee.hourlyRate,
      branchId: employee.branchId,
      isActive: employee.isActive,
      tin: employee.tin || "",
      sssNumber: employee.sssNumber || "",
      philhealthNumber: employee.philhealthNumber || "",
      pagibigNumber: employee.pagibigNumber || "",
      isMwe: employee.isMwe || false,
    });
    setFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setIsEditing(false);
    setCurrentEmployee(null);
    setFormData(initialFormData);
  }, []);

  const handleOpenViewDialog = useCallback((employee: Employee) => {
    setCurrentEmployee(employee);
    setViewDialogOpen(true);
  }, []);

  const handleOpenDeductionsDialog = useCallback((employee: Employee) => {
    setCurrentEmployee(employee);
    setDeductionsFormData({
      sssLoanDeduction: employee.sssLoanDeduction || "0",
      pagibigLoanDeduction: employee.pagibigLoanDeduction || "0",
      cashAdvanceDeduction: employee.cashAdvanceDeduction || "0",
      otherDeductions: employee.otherDeductions || "0",
    });
    setDeductionsDialogOpen(true);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (isEditing && currentEmployee) {
        const updateData = { ...formData };
        if (!updateData.password || updateData.password === "password123" || updateData.password === "********") {
          delete (updateData as any).password;
        }
        updateEmployee.mutate({ id: currentEmployee.id, data: updateData });
      } else {
        createEmployee.mutate(formData);
      }
    });
  };

  const handleDeductionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEmployee) {
      updateDeductions.mutate({ id: currentEmployee.id, data: deductionsFormData });
    }
  };

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // DataGrid columns - optimized for better visibility
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: "employee",
      headerName: "Employee",
      flex: 2,
      minWidth: 280,
      valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
      renderCell: (params: GridRenderCellParams<Employee>) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1, overflow: "hidden" }}>
          <Avatar
            src={params.row.photoUrl}
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              bgcolor: params.row.role === "manager" ? "primary.main" : params.row.role === "admin" ? "secondary.main" : "success.main",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {!params.row.photoUrl && params.row.firstName?.charAt(0)}
            {!params.row.photoUrl && params.row.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {params.row.firstName} {params.row.lastName}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Employee>) => (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.5, py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {params.row.position}
            {params.row.isMwe && (
              <Chip
                size="small"
                label="MWE"
                color="secondary"
                sx={{ height: 16, fontSize: "0.6rem", ml: 1, fontWeight: "bold" }}
                title="Minimum Wage Earner (Tax Exempt)"
              />
            )}
          </Typography>
          <Chip
            size="small"
            label={params.row.role}
            color={getRoleColor(params.row.role)}
            sx={{ height: 18, fontSize: "0.65rem", width: "fit-content" }}
          />
        </Box>
      ),
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) => getBranchName(row.branchId),
      renderCell: (params: GridRenderCellParams<Employee>) => (
        <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {getBranchName(params.row.branchId)}
        </Typography>
      ),
    },
    {
      field: "hourlyRate",
      headerName: "Rate",
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams<Employee>) => {
        const rate = parseFloat(params.row.hourlyRate || "0");
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: rate === 0 ? 'text.disabled' : 'text.primary'
            }}
          >
            ₱{rate.toLocaleString('en-PH')}/hr
          </Typography>
        );
      },
    },
    {
      field: "hoursThisMonth",
      headerName: "Hours",
      width: 80,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams<Employee>) => {
        const hours = params.row.hoursThisMonth || 0;
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "monospace",
              color: hours === 0 ? 'text.disabled' : 'text.primary'
            }}
          >
            {hours.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}h
          </Typography>
        );
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params: GridRenderCellParams<Employee>) => (
        <Chip
          size="small"
          icon={params.row.isActive ? <CheckCircleIcon /> : <CancelIcon />}
          label={params.row.isActive ? "Active" : "Inactive"}
          color={params.row.isActive ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Employee>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleOpenViewDialog(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenEditDialog(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deductions">
            <IconButton size="small" onClick={() => handleOpenDeductionsDialog(params.row)}>
              <ReceiptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? "Deactivate" : "Activate"}>
            <IconButton 
              size="small" 
              color={params.row.isActive ? "warning" : "success"} 
              onClick={() => toggleEmployeeStatus.mutate({ id: params.row.id, isActive: !params.row.isActive })}
            >
              {params.row.isActive ? <VisibilityOffIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [handleOpenViewDialog, handleOpenEditDialog, handleOpenDeductionsDialog, getBranchName]);

  if (!managerRole) return null;

  return (
    <>
      <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Employee Management
              </Typography>
              <Typography color="text.secondary">
                Manage your team members and their information
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Month Selector */}
              <Paper 
                elevation={0} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  p: 0.5, 
                  borderRadius: 2,
                  bgcolor: 'action.hover'
                }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                  sx={{ color: 'primary.main' }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                  <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120, textAlign: 'center' }}>
                    {format(selectedMonth, 'MMMM yyyy')}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                  sx={{ color: 'primary.main' }}
                >
                  <ChevronRightIcon />
                </IconButton>
                <Tooltip title="Go to current month">
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setSelectedMonth(new Date())}
                    sx={{ ml: 1, minWidth: 60 }}
                  >
                    Today
                  </Button>
                </Tooltip>
              </Paper>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ boxShadow: 2 }}
              >
                Add Employee
              </Button>
            </Stack>
          </Box>



          {/* Filters */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Branch</InputLabel>
                  <Select value={branchFilter} label="Branch" onChange={(e) => setBranchFilter(e.target.value)}>
                    <MenuItem value="all">All Branches</MenuItem>
                    {branchesData.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>

            {/* Bulk Actions */}
            <Collapse in={selectedEmployees.length > 0}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Chip label={`${selectedEmployees.length} selected`} color="primary" variant="outlined" />
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => bulkToggleStatus.mutate({ ids: selectedEmployees, isActive: true })}
                  disabled={bulkToggleStatus.isPending}
                >
                  {bulkToggleStatus.isPending ? "..." : "Activate"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => bulkToggleStatus.mutate({ ids: selectedEmployees, isActive: false })}
                  disabled={bulkToggleStatus.isPending}
                >
                  {bulkToggleStatus.isPending ? "..." : "Deactivate"}
                </Button>
              </Box>
            </Collapse>
          </Paper>

          {/* Employee List */}
          <Paper elevation={0} sx={{ height: 600, width: '100%', borderRadius: 3, overflow: "hidden" }}>
            <DataGrid
              rows={filteredEmployees}
              columns={columns}
              loading={employeesLoading}
              checkboxSelection
              disableRowSelectionOnClick
              rowHeight={65}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedEmployees(Array.from(newSelection.ids || []).map(String));
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 },
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: "employee", sort: "asc" }] },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              sx={{
                border: "none",
                "& .MuiDataGrid-cell": { 
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "action.hover",
                  borderRadius: 0,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                },
              }}
            />
          </Paper>

          {filteredEmployees.length === 0 && !employeesLoading && (
            <EmptyState
              icon={<UsersIcon />}
              title="No employees found"
              description="Try adjusting your filters or add a new employee"
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                  Add Employee
                </Button>
              }
            />
          )}
        </Stack>

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        >
          <MenuItem
            onClick={() => {
              handleOpenViewDialog(contextMenu!.employee);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOpenEditDialog(contextMenu!.employee);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOpenDeductionsDialog(contextMenu!.employee);
              handleCloseContextMenu();
            }}
          >
            <ListItemIcon>
              <ReceiptIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Deductions</ListItemText>
          </MenuItem>
          <Divider />
          {contextMenu?.employee && (
            <MenuItem
              onClick={() => {
                toggleEmployeeStatus.mutate({ id: contextMenu.employee.id, isActive: !contextMenu.employee.isActive });
                handleCloseContextMenu();
              }}
              sx={{ color: contextMenu.employee.isActive ? "warning.main" : "success.main" }}
            >
              <ListItemIcon>
                {contextMenu.employee.isActive ? <VisibilityOffIcon fontSize="small" color="warning" /> : <ViewIcon fontSize="small" color="success" />}
              </ListItemIcon>
              <ListItemText>{contextMenu.employee.isActive ? "Deactivate" : "Activate"}</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Add/Edit Dialog */}
        <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} maxWidth="sm" fullWidth disableRestoreFocus>
          <form onSubmit={handleFormSubmit}>
            <DialogTitle>
              {isEditing ? `Edit Employee: ${currentEmployee?.firstName} ${currentEmployee?.lastName}` : "Add New Employee"}
            </DialogTitle>
            <DialogContent dividers>
              {isEditing && currentEmployee && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <ProfilePhotoUpload
                    currentPhotoId={currentEmployee.photoPublicId}
                    currentPhotoUrl={currentEmployee.photoUrl}
                    employeeId={currentEmployee.id}
                    employeeName={`${currentEmployee.firstName} ${currentEmployee.lastName}`}
                    onUploadComplete={() => {
                      startTransition(() => {
                        invalidateEmployeeQueries();
                      });
                    }}
                  />
                </Box>
              )}
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      autoFocus
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      disabled={isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      disabled={isEditing}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isEditing}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label={isEditing ? "New Password" : "Password"}
                      placeholder={isEditing ? "Leave blank to keep existing" : "password123"}
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEditing}
                      disabled={isEditing}
                      helperText={isEditing 
                        ? "Leave blank to keep current password" 
                        : "Required. Default password applies if not specified."}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <ViewIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Hourly Rate (₱)"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      inputProps={{ step: "any", min: "0" }}
                      required
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={formData.role}
                        label="Role"
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "employee" | "manager" })}
                      >
                        <MenuItem value="employee">Employee</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Branch</InputLabel>
                      <Select
                        value={formData.branchId}
                        label="Branch"
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        required
                      >
                        {branchesData.map((branch) => (
                          <MenuItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    }
                    label="Active Employee"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isMwe}
                        onChange={(e) => setFormData({ ...formData, isMwe: e.target.checked })}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        MWE Exemption
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tax exempt for Minimum Wage Earners
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Government & Statutory IDs
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="TIN"
                      value={formData.tin}
                      onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                      placeholder="XXX-XXX-XXX-000"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="SSS Number"
                      value={formData.sssNumber}
                      onChange={(e) => setFormData({ ...formData, sssNumber: e.target.value })}
                      placeholder="XX-XXXXXXX-X"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="PhilHealth"
                      value={formData.philhealthNumber}
                      onChange={(e) => setFormData({ ...formData, philhealthNumber: e.target.value })}
                      placeholder="XX-XXXXXXXXX-X"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Pag-IBIG/HDMF"
                      value={formData.pagibigNumber}
                      onChange={(e) => setFormData({ ...formData, pagibigNumber: e.target.value })}
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleCloseFormDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createEmployee.isPending || updateEmployee.isPending}
                startIcon={createEmployee.isPending || updateEmployee.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                {isEditing ? "Update" : "Add"} Employee
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="span">Employee Profile</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {currentEmployee && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
                <Box sx={{ p: 3, bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar
                      src={currentEmployee.photoUrl}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: currentEmployee.role === "manager" ? "primary.main" : "success.main",
                        fontSize: "1.5rem",
                        border: 4,
                        borderColor: "background.paper",
                        boxShadow: 2
                      }}
                    >
                      {!currentEmployee.photoUrl && currentEmployee.firstName?.charAt(0)}
                      {!currentEmployee.photoUrl && currentEmployee.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {currentEmployee.firstName} {currentEmployee.lastName}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>{currentEmployee.position}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={currentEmployee.role} color={getRoleColor(currentEmployee.role)} />
                        <Chip
                          size="small"
                          label={currentEmployee.isActive ? "Active" : "Inactive"}
                          color={currentEmployee.isActive ? "success" : "error"}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, display: 'flex' }}>
                  {/* Sidebar/Tabs */}
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={0} // Default to info for now, could add state
                    sx={{ borderRight: 1, borderColor: "divider", minWidth: 160 }}
                  >
                    <Tab icon={<PersonIcon />} label="Personal Info" iconPosition="start" sx={{ justifyContent: "flex-start", minHeight: 48 }} />
                    <Tab icon={<WorkIcon />} label="Documents" iconPosition="start" sx={{ justifyContent: "flex-start", minHeight: 48 }} onClick={() => {
                        // For simplicity in this demo, just scroll or show sections.
                        // Or better, keep simple list view below.
                    }} />
                  </Tabs>

                  {/* Content Area */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    <Stack spacing={4}>
                      {/* Personal Info Section */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Contract Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Email</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.email}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Username</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.username}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Branch</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{getBranchName(currentEmployee.branchId)}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Hourly Rate</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                ₱{parseFloat(currentEmployee.hourlyRate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/hr
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                             <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Joined</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {format(new Date(currentEmployee.createdAt), "MMMM d, yyyy")}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider />

                      {/* Government IDs Section */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Government & Statutory IDs
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">TIN (Tax Identification Number)</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.tin || <span style={{ color: '#999' }}>Not provided</span>}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">SSS Number</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.sssNumber || <span style={{ color: '#999' }}>Not provided</span>}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">PhilHealth Number</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.philhealthNumber || <span style={{ color: '#999' }}>Not provided</span>}</Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">Pag-IBIG / HDMF Number</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentEmployee.pagibigNumber || <span style={{ color: '#999' }}>Not provided</span>}</Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Divider />

                      {/* Documents Section */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Documents
                        </Typography>
                        <DocumentUpload 
                          employeeId={currentEmployee.id}
                          documents={documentsResponse || []}
                          onUploadComplete={() => refetchDocuments()}
                          onDocumentRemove={() => refetchDocuments()}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleOpenEditDialog(currentEmployee!);
              }}
            >
              Edit Employee
            </Button>
          </DialogActions>
        </Dialog>

        {/* Deletion Options Modal (for employees with data) */}
        <DeletionOptionsModal
          open={deletionModalOpen}
          employee={currentEmployee}
          relatedData={employeeRelatedData}
          isAdmin={userIsAdmin}
          onClose={() => {
            setDeletionModalOpen(false);
            setCurrentEmployee(null);
            setEmployeeRelatedData(null);
          }}
          onDeactivate={() => {
            if (currentEmployee) {
              toggleEmployeeStatus.mutate({ id: currentEmployee.id, isActive: false });
            }
          }}
          onForceDelete={(reason) => {
            if (currentEmployee) {
              deleteEmployee.mutate({ id: currentEmployee.id, force: true });
            }
          }}
          onExportData={() => {
            if (currentEmployee) {
              exportEmployeeData(currentEmployee.id);
            }
          }}
          isLoading={deleteEmployee.isPending || toggleEmployeeStatus.isPending}
        />

        {/* Deductions Dialog - Redesigned with Mandatories Preview + Extras */}
        <Dialog open={deductionsDialogOpen} onClose={() => setDeductionsDialogOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleDeductionsSubmit}>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                <Box>
                  <Typography variant="h6" component="span" sx={{ display: 'block' }}>
                    Employee Deductions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentEmployee?.firstName} {currentEmployee?.lastName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Section 1: Mandatory Deductions (Read-Only Preview) */}
              <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600} color="success.main">
                    Mandatory Deductions (Auto-Applied)
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2, py: 0.5 }} icon={false}>
                  <Typography variant="caption">
                    These are automatically calculated based on 2025 Philippine government rates.
                    Values shown are estimates based on hourly rate × 176 hrs/month.
                  </Typography>
                </Alert>

                {/* Calculate estimated monthly salary for preview */}
                {(() => {
                  const hourlyRate = parseFloat(currentEmployee?.hourlyRate || '0');
                  const estimatedMonthly = hourlyRate * 176; // DOLE standard ~22 days × 8 hours
                  
                  // SSS: 5% of MSC (floor ₱5k, ceiling ₱35k)
                  const msc = Math.min(Math.max(estimatedMonthly, 5000), 35000);
                  const sss = msc * 0.05;
                  
                  // PhilHealth: 2.5% (floor ₱10k, ceiling ₱100k)
                  const philBase = Math.min(Math.max(estimatedMonthly, 10000), 100000);
                  const philHealth = philBase * 0.025;
                  
                  // Pag-IBIG: 2% max ₱200 (2026 rate)
                  const pagibig = Math.min(estimatedMonthly * 0.02, 200);
                  
                  // BIR: 0% if annual <₱250k
                  const annualEstimate = estimatedMonthly * 12;
                  const tax = annualEstimate <= 250000 ? 0 : (annualEstimate - 250000) * 0.15 / 12;

                  return (
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SecurityIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                          <Typography variant="body2">SSS (5%)</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₱{sss.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalHospitalIcon sx={{ fontSize: 18, color: '#10b981' }} />
                          <Typography variant="body2">PhilHealth (2.5%)</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₱{philHealth.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HomeIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                          <Typography variant="body2">Pag-IBIG (2%)</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₱{pagibig.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                          <Typography variant="body2">Withholding Tax</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₱{tax.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Est. Monthly Salary:</Typography>
                        <Typography variant="body2" color="text.secondary">₱{estimatedMonthly.toLocaleString()}</Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Box>

              {/* Section 2: Additional Deductions (Editable) */}
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EditIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                    Additional Deductions (Editable)
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mb: 2, py: 0.5 }} icon={false}>
                  <Typography variant="caption">
                    These are manually managed per-period deductions (e.g. cash advances, penalties).
                    Government loan deductions are managed via the Requests Hub above.
                  </Typography>
                </Alert>

                <Stack spacing={2.5}>
                  {/* ── Government Loan Deductions — Linked to Approved Loans ── */}
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                          Government Loan Deductions
                        </Typography>
                      </Box>
                      <Chip label="From Approved Loans" size="small" variant="outlined" color="info" sx={{ height: 22, fontSize: '0.65rem' }} />
                    </Box>
                    <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }} icon={false}>
                      <Typography variant="caption">
                        Loan deductions are automatically sourced from approved loan records.
                        To add or change a loan, use <strong>Employee Requests → Loans</strong> tab.
                      </Typography>
                    </Alert>
                    <ActiveLoansDisplay employeeId={currentEmployee?.id} />
                  </Box>

                  <TextField
                    fullWidth
                    label="Cash Advance Deduction"
                    type="number"
                    size="small"
                    value={deductionsFormData.cashAdvanceDeduction}
                    onChange={(e) => setDeductionsFormData({ ...deductionsFormData, cashAdvanceDeduction: e.target.value })}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₱</Typography>,
                    }}
                    helperText="Per pay period"
                  />

                  <TextField
                    fullWidth
                    label="Other Recurring Deductions"
                    type="number"
                    size="small"
                    value={deductionsFormData.otherDeductions}
                    onChange={(e) => setDeductionsFormData({ ...deductionsFormData, otherDeductions: e.target.value })}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₱</Typography>,
                    }}
                    helperText="Per pay period (e.g., uniform, penalties)"
                  />
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <Button onClick={() => setDeductionsDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateDeductions.isPending}
                startIcon={updateDeductions.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
}
