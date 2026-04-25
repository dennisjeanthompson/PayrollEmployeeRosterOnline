import { a0 as useTheme, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aJ as Stack, aj as Typography, b7 as Paper, af as IconButton, ai as ChevronLeftIcon, a3 as CalendarIcon, ah as ChevronRightIcon, aK as Button, bp as AddIcon, c1 as DataGrid, c2 as GridToolbar, ci as VacationIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, b0 as FormControl, b$ as InputLabel, b1 as Select, b2 as MenuItem, bA as TextField, bB as DialogActions, am as Chip, an as Tooltip, bW as EditIcon } from './vendor-v-EuVKxF.js';
import { g as getCurrentUser, i as isManager, a as isAdmin, q as queryClient, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { E as EmptyState } from './cards-Du3qVCqM.js';

function MuiLeaveCredits({ hideHeader }) {
  useTheme();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const isMgrOptions = isManager() || isAdmin();
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [grantDialogOpen, setGrantDialogOpen] = reactExports.useState(false);
  const [editingCredit, setEditingCredit] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    userId: "",
    leaveType: "vacation",
    totalCredits: "",
    usedCredits: "0",
    notes: ""
  });
  const { data: creditsData, isLoading: creditsLoading } = useQuery({
    queryKey: ["leave-credits", selectedYear, isMgrOptions ? "branch" : "my"],
    queryFn: async () => {
      const endpoint = isMgrOptions ? "/api/leave-credits/branch" : "/api/leave-credits/my";
      const res = await apiRequest("GET", `${endpoint}?year=${selectedYear}`);
      return res.json();
    }
  });
  const { data: employeesData } = useQuery({
    queryKey: ["/api/employees"],
    enabled: isMgrOptions
  });
  const credits = creditsData?.credits || [];
  const employees = employeesData?.employees || [];
  const grantMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/leave-credits/grant", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-credits"] });
      toast({ title: "Success", description: "Leave credits granted" });
      handleCloseDialog();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/leave-credits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-credits"] });
      toast({ title: "Success", description: "Leave credits updated" });
      handleCloseDialog();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  const handleOpenGrantDialog = () => {
    setEditingCredit(null);
    setFormData({ userId: "", leaveType: "vacation", totalCredits: "", usedCredits: "0", notes: "" });
    setGrantDialogOpen(true);
  };
  const handleOpenEditDialog = (credit) => {
    setEditingCredit(credit);
    setFormData({
      userId: credit.userId,
      leaveType: credit.leaveType,
      totalCredits: credit.totalCredits,
      usedCredits: credit.usedCredits || "0",
      notes: credit.notes || ""
    });
    setGrantDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setGrantDialogOpen(false);
    setEditingCredit(null);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCredit) {
      updateMutation.mutate({
        id: editingCredit.id,
        data: {
          totalCredits: formData.totalCredits,
          usedCredits: formData.usedCredits,
          notes: formData.notes
        }
      });
    } else {
      grantMutation.mutate({
        userId: formData.userId,
        leaveType: formData.leaveType,
        totalCredits: formData.totalCredits,
        year: selectedYear,
        notes: formData.notes
      });
    }
  };
  const columns = [
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: isMgrOptions ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: params.row.employeeName }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
        currentUser?.firstName,
        " ",
        currentUser?.lastName
      ] }) })
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          label: params.row.leaveTypeConfig.label,
          size: "small",
          sx: {
            bgcolor: `${params.row.leaveTypeConfig.color}20`,
            color: params.row.leaveTypeConfig.color,
            fontWeight: 600
          }
        }
      )
    },
    {
      field: "totalCredits",
      headerName: "Total Granted",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: Number(params.row.totalCredits).toFixed(1) })
    },
    {
      field: "usedCredits",
      headerName: "Used",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "error.main", children: Number(params.row.usedCredits).toFixed(1) })
    },
    {
      field: "remainingCredits",
      headerName: "Remaining Balance",
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          label: `${Number(params.row.remainingCredits).toFixed(1)} Days`,
          color: Number(params.row.remainingCredits) > 0 ? "success" : "default",
          variant: Number(params.row.remainingCredits) > 0 ? "filled" : "outlined",
          size: "small"
        }
      )
    },
    ...isMgrOptions ? [{
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit Balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenEditDialog(params.row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }) })
    }] : []
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, minHeight: "100vh", bgcolor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 0.5 }, children: "Leave Credits & Balances" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { color: "text.secondary", children: [
            "Track statutory and discretionary leave entitlements for ",
            selectedYear,
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: 0,
              sx: { display: "flex", alignItems: "center", gap: 1, p: 0.5, borderRadius: 2, bgcolor: "action.hover" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => setSelectedYear((y) => y - 1), sx: { color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 18, color: "primary.main" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: selectedYear })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => setSelectedYear((y) => y + 1), sx: { color: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {}) })
              ]
            }
          ),
          isMgrOptions && /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: handleOpenGrantDialog,
              sx: { boxShadow: 2 },
              children: "Grant Leave"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { elevation: 0, sx: { height: 600, width: "100%", borderRadius: 3, overflow: "hidden" }, children: credits.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataGrid,
        {
          rows: credits,
          columns,
          loading: creditsLoading,
          disableRowSelectionOnClick: true,
          rowHeight: 60,
          slots: { toolbar: GridToolbar },
          slotProps: { toolbar: { showQuickFilter: true } },
          initialState: {
            pagination: { paginationModel: { pageSize: 15 } },
            sorting: { sortModel: [{ field: "employeeName", sort: "asc" }] }
          },
          pageSizeOptions: [15, 30, 50],
          sx: {
            border: "none",
            "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover", borderRadius: 0 },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 }
          }
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, {}),
          title: "No leave credits found",
          description: `No leave balances have been granted for ${selectedYear}.`
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: grantDialogOpen, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCredit ? "Edit Leave Balance" : "Grant Leave Credits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { dividers: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, disabled: !!editingCredit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select,
            {
              value: formData.userId,
              label: "Employee",
              onChange: (e) => setFormData({ ...formData, userId: e.target.value }),
              required: true,
              children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: emp.id, children: [
                emp.firstName,
                " ",
                emp.lastName
              ] }, emp.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, disabled: !!editingCredit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Leave Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.leaveType,
              label: "Leave Type",
              onChange: (e) => {
                const type = e.target.value;
                let defaultDays = "0";
                if (type === "solo_parent") defaultDays = "7";
                if (type === "vawc") defaultDays = "10";
                setFormData({ ...formData, leaveType: type, totalCredits: defaultDays });
              },
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "vacation", children: "Vacation Leave" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "sick", children: "Sick Leave" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "solo_parent", children: "Solo Parent Leave - 7 days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "vawc", children: "VAWC Leave - 10 days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "other", children: "Other" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, sx: { width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: editingCredit ? 1 : 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Total Credits (Days)",
              type: "number",
              inputProps: { step: "0.5", min: "0" },
              value: formData.totalCredits,
              onChange: (e) => setFormData({ ...formData, totalCredits: e.target.value }),
              required: true
            }
          ) }),
          editingCredit && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Used Credits (Days)",
              type: "number",
              inputProps: { step: "0.5", min: "0" },
              value: formData.usedCredits,
              onChange: (e) => setFormData({ ...formData, usedCredits: e.target.value }),
              required: true
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Notes (Optional)",
            multiline: true,
            rows: 2,
            value: formData.notes,
            onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
            placeholder: "e.g. Pro-rated for mid-year hire"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCloseDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            variant: "contained",
            disabled: grantMutation.isPending || updateMutation.isPending,
            children: editingCredit ? "Update Balance" : "Grant Credits"
          }
        )
      ] })
    ] }) })
  ] });
}

export { MuiLeaveCredits as default };
