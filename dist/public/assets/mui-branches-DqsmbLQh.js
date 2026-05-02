import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aj as Typography, aJ as Stack, af as IconButton, cN as RefreshIcon, aK as Button, bp as AddIcon, b7 as Paper, ag as alpha, al as Avatar, aD as TradeIcon, a2 as DashboardIcon, an as Tooltip, am as Chip, d6 as LockIcon, bE as Alert, d4 as AlertTitle, cO as LinearProgress, br as Grid, a8 as StoreIcon, aU as CheckCircleIcon, a5 as PeopleIcon, a9 as BusinessIcon, d7 as AccountTreeIcon, bm as Divider, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, bV as Visibility, av as Badge, bU as CancelIcon, d8 as ToggleOnIcon, d9 as ToggleOff, bW as EditIcon, b3 as LocationIcon, da as PhoneIcon, db as EmailIcon, dc as ExpandLessIcon, cl as ExpandMore, c0 as Collapse, ar as List, as as ListItem, dd as ListItemAvatar, aw as ListItemText, ay as Dialog, by as DialogTitle, bz as DialogContent, bA as TextField, bH as FormControlLabel, c3 as Switch, bB as DialogActions, bD as WarningIcon, bl as format, cV as parseISO } from './vendor-5dgU3tca.js';
import { u as useAuth, a as isAdmin, i as isManager, f as isEmployee, h as invalidateQueries, c as apiRequest } from './main-2BvCZ7pP.js';
import { u as useToast } from './use-toast-DLYGmyYZ.js';

const safeFormatDate = (dateValue, formatStr) => {
  if (!dateValue) return "N/A";
  try {
    if (dateValue instanceof Date) {
      return format(dateValue, formatStr);
    }
    if (typeof dateValue === "string") {
      return format(parseISO(dateValue), formatStr);
    }
    return "N/A";
  } catch {
    return "N/A";
  }
};
function MuiBranches({ isEmbedded = false }) {
  const theme = useTheme();
  const { user: currentUser, switchBranch } = useAuth();
  const isAdminRole = isAdmin();
  const isManagerRole = isManager();
  const isEmployeeRole = isEmployee();
  const canManage = isAdminRole || isManagerRole;
  const canSwitchBranch = isAdminRole;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const getStoredBranch = () => {
    try {
      const stored = localStorage.getItem("lastBranchId");
      if (stored && canSwitchBranch) return stored;
    } catch {
    }
    return currentUser?.branchId || "";
  };
  const [selectedBranchId, setSelectedBranchId] = reactExports.useState(getStoredBranch());
  const [viewMode, setViewMode] = reactExports.useState(
    canSwitchBranch ? "all" : "single"
  );
  const [createDialogOpen, setCreateDialogOpen] = reactExports.useState(false);
  const [editingBranch, setEditingBranch] = reactExports.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = reactExports.useState(false);
  const [deletingBranch, setDeletingBranch] = reactExports.useState(null);
  const [expandedBranch, setExpandedBranch] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true
  });
  const handleBranchSwitch = reactExports.useCallback(async (branchId) => {
    setSelectedBranchId(branchId);
    if (branchId && canSwitchBranch) {
      const ok = await switchBranch(branchId);
      if (ok) {
        invalidateQueries.branchSwitch();
        toast({ title: `Switched to branch â€” all pages updated` });
      } else {
        toast({ title: "Failed to switch branch", variant: "destructive" });
      }
    } else {
      toast({ title: "Viewing all branches" });
    }
  }, [switchBranch, canSwitchBranch, toast]);
  const { data: branchesResponse, isLoading, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/branches");
      return response.json();
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const { data: employeesResponse } = useQuery({
    queryKey: canManage ? ["employees-all-branches"] : ["employees"],
    queryFn: async () => {
      const endpoint = canManage ? "/api/employees/all-branches" : "/api/employees";
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    staleTime: 5 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  const branches = Array.isArray(branchesResponse?.branches) ? branchesResponse.branches : Array.isArray(branchesResponse) ? branchesResponse : [];
  const allEmployees = Array.isArray(employeesResponse?.employees) ? employeesResponse.employees : Array.isArray(employeesResponse) ? employeesResponse : [];
  const activeBranches = branches.filter((b) => b.isActive);
  reactExports.useEffect(() => {
    if (currentUser?.branchId && currentUser.branchId !== selectedBranchId) {
      setSelectedBranchId(currentUser.branchId);
    }
  }, [currentUser?.branchId, selectedBranchId]);
  const displayedBranches = reactExports.useMemo(() => {
    if (viewMode === "all" && canSwitchBranch) {
      return branches;
    }
    if (selectedBranchId) {
      return branches.filter((b) => b.id === selectedBranchId);
    }
    if (isManagerRole && !isAdminRole && currentUser?.branchId) {
      return branches.filter((b) => b.id === currentUser.branchId);
    }
    return branches;
  }, [branches, viewMode, selectedBranchId, canSwitchBranch, isManagerRole, isAdminRole, currentUser?.branchId]);
  const displayedTotalEmployees = displayedBranches.reduce((sum, b) => sum + (b.employeeCount || 0), 0);
  const displayedActiveBranches = displayedBranches.filter((b) => b.isActive);
  const totalEmployees = branches.reduce((sum, b) => sum + (b.employeeCount || 0), 0);
  const getBranchEmployees = (branchId) => allEmployees.filter((e) => e.branchId === branchId && e.isActive);
  const currentBranchName = reactExports.useMemo(() => {
    if (!currentUser?.branchId) return "Unknown";
    const branch = branches.find((b) => b.id === currentUser.branchId);
    return branch?.name || "Unknown";
  }, [currentUser?.branchId, branches]);
  reactExports.useMemo(() => {
    if (viewMode === "all") return "All Branches";
    const branch = branches.find((b) => b.id === selectedBranchId);
    return branch?.name || "Select Branch";
  }, [selectedBranchId, branches, viewMode]);
  const createBranch = useMutation({
    mutationFn: async (data) => {
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
    }
  });
  const updateBranch = useMutation({
    mutationFn: async ({ id, data }) => {
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
    }
  });
  const toggleBranch = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await apiRequest("PATCH", `/api/branches/${id}`, { isActive });
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: isActive ? "Branch activated" : "Branch deactivated" });
    },
    onError: () => {
      toast({ title: "Failed to update branch", variant: "destructive" });
    }
  });
  const deleteBranch = useMutation({
    mutationFn: async (id) => {
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
    }
  });
  const resetForm = () => {
    setFormData({ name: "", address: "", phone: "", email: "", isActive: true });
  };
  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || "",
      email: branch.email || "",
      isActive: branch.isActive
    });
  };
  const handleSubmit = () => {
    if (editingBranch) {
      updateBranch.mutate({ id: editingBranch.id, data: formData });
    } else {
      createBranch.mutate(formData);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: isEmbedded ? 0 : 3, pb: 4, minHeight: isEmbedded ? "auto" : "100vh", bgcolor: isEmbedded ? "transparent" : "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, gutterBottom: true, children: "Branch Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: canSwitchBranch ? "Manage and switch between cafe locations" : isManagerRole ? `Managing: ${currentBranchName}` : `Your branch: ${currentBranchName}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }),
        isAdminRole && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
            onClick: () => setCreateDialogOpen(true),
            children: "Add Branch"
          }
        )
      ] })
    ] }),
    canManage && branches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        sx: {
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, sx: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 600, children: "Branch View" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: canSwitchBranch ? "Switch between branches or view all at once" : "You are viewing your assigned branch" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "center", children: [
            canSwitchBranch && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: viewMode === "all" ? "contained" : "outlined",
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}),
                onClick: () => {
                  setViewMode(viewMode === "all" ? "single" : "all");
                  if (viewMode === "single") {
                    toast({ title: "Viewing all branches" });
                  }
                },
                sx: {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600
                },
                children: "All Branches"
              }
            ),
            isManagerRole && !isAdminRole && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Branch managers can only view their assigned branch. Contact an admin to change branches.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LockIcon, { sx: { fontSize: 14 } }),
                label: currentBranchName,
                size: "small",
                color: "default",
                variant: "outlined",
                sx: { borderRadius: 2 }
              }
            ) })
          ] })
        ] })
      }
    ),
    isEmployeeRole && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 3, borderRadius: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertTitle, { children: [
        "Your Branch: ",
        currentBranchName
      ] }),
      "You are viewing information for your assigned branch. Contact your manager for any branch-related questions."
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { mb: 3, borderRadius: 1 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 2,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: viewMode === "all" ? "Total Branches" : "Viewing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 700, children: [
                displayedBranches.length,
                viewMode === "single" && branches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "span", variant: "body2", color: "text.secondary", sx: { ml: 1 }, children: [
                  "of ",
                  branches.length
                ] })
              ] })
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 2,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.success.main, 0.2), color: "success.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: displayedActiveBranches.length })
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 2,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.info.main, 0.2), color: "info.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: viewMode === "all" ? "Total Staff" : "Branch Staff" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: displayedTotalEmployees })
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          sx: {
            p: 2,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.secondary.main, 0.2), color: "secondary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Avg Staff/Branch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: displayedBranches.length > 0 ? Math.round(displayedTotalEmployees / displayedBranches.length) : 0 })
            ] })
          ] })
        }
      ) })
    ] }),
    viewMode === "all" && canSwitchBranch && displayedBranches.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: alpha(theme.palette.info.main, 0.15), color: "info.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountTreeIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Company Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
            "Cross-branch summary across all ",
            branches.length,
            " locations"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 600 }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 600 }, children: "Staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 600 }, children: "Managers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 600 }, children: "Employees" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Since" }),
          canSwitchBranch && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 600 }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          branches.map((branch) => {
            const branchEmployees = getBranchEmployees(branch.id);
            const managers = branchEmployees.filter((e) => e.role === "manager" || e.role === "admin");
            const regularEmployees = branchEmployees.filter((e) => e.role === "employee");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                hover: true,
                sx: { cursor: canSwitchBranch ? "pointer" : "default" },
                onClick: () => {
                  if (canSwitchBranch) {
                    setViewMode("single");
                    handleBranchSwitch(branch.id);
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { sx: { fontSize: 18 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: branch.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: branch.address })
                    ] }),
                    branch.id === currentUser?.branchId && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "You", size: "small", color: "primary", sx: { height: 18, fontSize: 10 } })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: branch.isActive ? "Active" : "Inactive",
                      size: "small",
                      color: branch.isActive ? "success" : "default",
                      sx: { height: 22 }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 600, children: branch.employeeCount || 0 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: managers.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: regularEmployees.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: safeFormatDate(branch.createdAt, "MMM yyyy") }) }),
                  canSwitchBranch && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Switch to ${branch.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: (e) => {
                    e.stopPropagation();
                    setViewMode("single");
                    handleBranchSwitch(branch.id);
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small" }) }) }) })
                ]
              },
              branch.id
            );
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.primary.main, 0.03) }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { sx: { fontWeight: 700 }, children: [
              "Total (",
              branches.length,
              " branches)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${activeBranches.length} active`, size: "small", color: "success", sx: { height: 22 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 700, children: totalEmployees }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: allEmployees.filter((e) => (e.role === "manager" || e.role === "admin") && e.isActive).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: allEmployees.filter((e) => e.role === "employee" && e.isActive).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: canSwitchBranch ? 2 : 1 })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      displayedBranches.map((branch) => {
        const branchEmployees = getBranchEmployees(branch.id);
        const isExpanded = expandedBranch === branch.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, lg: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            sx: {
              p: 3,
              borderRadius: 3,
              border: `1px solid ${branch.isActive ? "rgba(255, 255, 255, 0.08)" : alpha(theme.palette.warning.main, 0.3)}`,
              opacity: branch.isActive ? 1 : 0.75,
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "flex-start", justifyContent: "space-between", sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      badgeContent: branch.employeeCount || 0,
                      color: "primary",
                      max: 99,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Avatar,
                        {
                          sx: {
                            width: 56,
                            height: 56,
                            bgcolor: branch.isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[500], 0.15),
                            color: branch.isActive ? "primary.main" : "grey.500"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { fontSize: "large" })
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: branch.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: branch.isActive ? "Active" : "Inactive",
                        size: "small",
                        color: branch.isActive ? "success" : "default",
                        icon: branch.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {})
                      }
                    )
                  ] })
                ] }),
                canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: branch.isActive ? "Deactivate" : "Activate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => toggleBranch.mutate({ id: branch.id, isActive: !branch.isActive }),
                      children: branch.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOnIcon, { color: "success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleOff, { color: "disabled" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleEdit(branch), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "flex-start", spacing: 1.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, { fontSize: "small", color: "action", sx: { mt: 0.25 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: branch.address })
                ] }),
                branch.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIcon, { fontSize: "small", color: "action" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: branch.phone })
                ] }),
                branch.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { fontSize: "small", color: "action" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: branch.email })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Stack,
                  {
                    direction: "row",
                    alignItems: "center",
                    spacing: 1,
                    sx: { cursor: "pointer" },
                    onClick: () => setExpandedBranch(isExpanded ? null : branch.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { fontSize: "small", color: "primary" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: branch.employeeCount || 0 }),
                        " employee",
                        (branch.employeeCount || 0) !== 1 ? "s" : ""
                      ] }),
                      isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandLessIcon, { fontSize: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, { fontSize: "small" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.disabled", children: [
                  "Since ",
                  safeFormatDate(branch.createdAt, "MMM yyyy")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: isExpanded, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: branchEmployees.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, disablePadding: true, children: branchEmployees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { disablePadding: true, sx: { py: 0.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemAvatar, { sx: { minWidth: 36 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { sx: { width: 28, height: 28, fontSize: 12, bgcolor: alpha(theme.palette.primary.main, 0.2), color: "primary.main" }, children: [
                  emp.firstName?.[0],
                  emp.lastName?.[0]
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: `${emp.firstName} ${emp.lastName}`,
                    secondary: emp.position || emp.role,
                    primaryTypographyProps: { variant: "body2", fontWeight: 500 },
                    secondaryTypographyProps: { variant: "caption" }
                  }
                )
              ] }, emp.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.disabled", sx: { pl: 1 }, children: "No active employees" }) }) })
            ]
          }
        ) }, branch.id);
      }),
      displayedBranches.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 8, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { sx: { fontSize: 64, color: "text.disabled", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: branches.length === 0 ? "No branches yet" : "No branches match your filter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.disabled", sx: { mb: 2 }, children: branches.length === 0 ? "Create your first branch to get started" : 'Try switching to "All Branches" view' }),
        canManage && branches.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), onClick: () => setCreateDialogOpen(true), children: "Add Branch" }),
        branches.length > 0 && canSwitchBranch && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}), onClick: () => setViewMode("all"), children: "View All Branches" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: createDialogOpen || !!editingBranch,
        onClose: () => {
          setCreateDialogOpen(false);
          setEditingBranch(null);
          resetForm();
        },
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StoreIcon, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: editingBranch ? "Edit Branch" : "Add New Branch" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Branch Name",
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                fullWidth: true,
                required: true,
                placeholder: "e.g., Downtown Branch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Address",
                value: formData.address,
                onChange: (e) => setFormData({ ...formData, address: e.target.value }),
                fullWidth: true,
                required: true,
                multiline: true,
                rows: 2,
                placeholder: "Full address..."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Phone",
                value: formData.phone,
                onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                fullWidth: true,
                placeholder: "(123) 456-7890"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Email",
                type: "email",
                value: formData.email,
                onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                fullWidth: true,
                placeholder: "branch@cafe.com"
              }
            ),
            editingBranch && /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: formData.isActive,
                    onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }),
                    color: "success"
                  }
                ),
                label: formData.isActive ? "Active" : "Inactive"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  setCreateDialogOpen(false);
                  setEditingBranch(null);
                  resetForm();
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: handleSubmit,
                disabled: !formData.name || !formData.address || createBranch.isPending || updateBranch.isPending,
                children: createBranch.isPending || updateBranch.isPending ? "Saving..." : editingBranch ? "Update" : "Create"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: deleteDialogOpen,
        onClose: () => {
          setDeleteDialogOpen(false);
          setDeletingBranch(null);
        },
        maxWidth: "xs",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "error" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delete Branch" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Are you sure?" }),
            "This will permanently delete ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deletingBranch?.name }),
            ".",
            (deletingBranch?.employeeCount || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mt: 1 }, children: [
              "This branch has ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deletingBranch?.employeeCount }),
              " employee(s) assigned. They will need to be reassigned."
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
              setDeleteDialogOpen(false);
              setDeletingBranch(null);
            }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "error",
                onClick: () => deletingBranch && deleteBranch.mutate(deletingBranch.id),
                disabled: deleteBranch.isPending,
                children: deleteBranch.isPending ? "Deleting..." : "Delete Branch"
              }
            )
          ] })
        ]
      }
    )
  ] }) });
}

export { MuiBranches as default };
