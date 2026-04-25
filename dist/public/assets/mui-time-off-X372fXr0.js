import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aJ as Stack, aj as Typography, aE as EventIcon, aK as Button, bp as AddIcon, br as Grid, bt as Card, bu as CardContent, b0 as FormControl, b$ as InputLabel, b1 as Select, b2 as MenuItem, de as CardHeader, bm as Divider, aM as CircularProgress, bE as Alert, aR as InfoIcon, c1 as DataGrid, ag as alpha, am as Chip, bl as format, cV as parseISO, ay as Dialog, by as DialogTitle, bz as DialogContent, b7 as Paper, cB as LocalizationProvider, cC as AdapterDateFns, cF as DatePicker, dp as differenceInDays, bD as WarningIcon, bA as TextField, bB as DialogActions, bQ as y, bU as CancelIcon, bs as AccessTime, aU as CheckCircleIcon } from './vendor-v-EuVKxF.js';
import { g as getCurrentUser, i as isManager, e as capitalizeFirstLetter, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';

const timeOffTypes = [
  { value: "vacation", label: "Vacation Leave", minAdvance: 7 },
  { value: "sick", label: "Sick Leave", minAdvance: 0 },
  { value: "emergency", label: "Emergency Leave", minAdvance: 0 },
  { value: "personal", label: "Personal Day", minAdvance: 3 },
  { value: "other", label: "Other", minAdvance: 3 }
];
const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
};
const getStatusIcon = (status) => {
  switch (status) {
    case "approved":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 18 } });
    case "rejected":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { sx: { fontSize: 18 } });
    case "pending":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, { sx: { fontSize: 18 } });
    case "cancelled":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, { sx: { fontSize: 18 } });
    default:
      return null;
  }
};
function MuiTimeOff() {
  const theme = useTheme();
  const currentUser = getCurrentUser();
  const isManagerRole = isManager();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useRealtime({
    enabled: true,
    queryKeys: ["time-off-requests"],
    onEvent: (event) => {
      if (event.startsWith("time-off:") || event === "notification:created") {
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      }
    }
  });
  const [openDialog, setOpenDialog] = reactExports.useState(false);
  const [editingRequest, setEditingRequest] = reactExports.useState(null);
  const [statusFilter, setStatusFilter] = reactExports.useState("");
  const [typeFilter, setTypeFilter] = reactExports.useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = reactExports.useState(false);
  const [rejectingRequest, setRejectingRequest] = reactExports.useState(null);
  const [rejectionReason, setRejectionReason] = reactExports.useState("");
  const [formData, setFormData] = reactExports.useState({
    type: "vacation",
    startDate: /* @__PURE__ */ new Date(),
    endDate: /* @__PURE__ */ new Date(),
    reason: ""
  });
  const [calendarView, setCalendarView] = reactExports.useState("dayGridMonth");
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ["time-off-requests", currentUser?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/time-off-requests");
      return response.json();
    }
  });
  const { data: creditsData } = useQuery({
    queryKey: ["leave-credits", (/* @__PURE__ */ new Date()).getFullYear(), "my"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/leave-credits/my?year=${(/* @__PURE__ */ new Date()).getFullYear()}`);
      return response.json();
    },
    enabled: !isManagerRole
  });
  const myCredits = creditsData?.credits || [];
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        type: data.type,
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : "",
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : "",
        reason: data.reason,
        userId: currentUser?.id
      };
      const endpoint = editingRequest ? `/api/time-off-requests/${editingRequest.id}` : "/api/time-off-requests";
      const method = editingRequest ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, payload);
      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      if (editingRequest) {
        y.success("Time off request updated successfully");
      } else {
        const leaveType = formData.type;
        const { shortNotice, advanceDays } = response;
        if (["sick", "emergency"].includes(leaveType)) {
          y.success(`${capitalizeFirstLetter(leaveType)} leave request submitted`);
        } else if (shortNotice) {
          y.warning(
            `${capitalizeFirstLetter(leaveType)} request submitted with short notice (only ${advanceDays} day${advanceDays !== 1 ? "s" : ""} advance). Manager may request adjustment.`,
            { autoClose: 8e3 }
          );
        } else {
          y.success("Time off request submitted successfully");
        }
      }
      handleCloseDialog();
      refetch();
    },
    onError: (error) => {
      y.error(error.message || "Failed to submit request");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await apiRequest("DELETE", `/api/time-off-requests/${requestId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Success",
        description: "Time off request cancelled"
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel request",
        variant: "destructive"
      });
    }
  });
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, status, rejectionReason: rejectionReason2 }) => {
      const endpoint = status === "approved" ? `/api/time-off-requests/${requestId}/approve` : `/api/time-off-requests/${requestId}/reject`;
      const body = status === "rejected" ? { status, rejectionReason: rejectionReason2 } : { status };
      const response = await apiRequest("PUT", endpoint, body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Success",
        description: "Request status updated"
      });
      refetch();
    }
  });
  const handleOpenDialog = (request) => {
    {
      setEditingRequest(null);
      setFormData({
        type: "vacation",
        startDate: /* @__PURE__ */ new Date(),
        endDate: /* @__PURE__ */ new Date(),
        reason: ""
      });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
    setFormData({
      type: "vacation",
      startDate: /* @__PURE__ */ new Date(),
      endDate: /* @__PURE__ */ new Date(),
      reason: ""
    });
  };
  const handleSubmit = () => {
    if (!formData.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for your request",
        variant: "destructive"
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }
    if (formData.endDate < formData.startDate) {
      toast({
        title: "Validation Error",
        description: "End date cannot be before start date",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };
  const requests = requestsData?.requests || [];
  const filteredRequests = requests.filter((req) => {
    const statusMatch = !statusFilter || req.status === statusFilter;
    const typeMatch = !typeFilter || req.type === typeFilter;
    return statusMatch && typeMatch;
  });
  const getDaysDifference = (start, end) => {
    return differenceInDays(parseISO(end), parseISO(start)) + 1;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", bgcolor: "background.default", py: 4, px: { xs: 2, sm: 3, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Stack,
        {
          direction: "row",
          justifyContent: "space-between",
          alignItems: "center",
          sx: { mb: 4 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", component: "h1", sx: { fontWeight: "bold", mb: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { sx: { mr: 2, verticalAlign: "middle" } }),
                "Time Off Management"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "textSecondary", children: isManagerRole ? "Review and approve employee time off requests" : "Request and manage your time off" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                size: "large",
                onClick: () => handleOpenDialog(),
                sx: { height: "56px", px: 3 },
                children: "New Request"
              }
            )
          ]
        }
      ),
      !isManagerRole && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Total Requests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: requests.length })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: requests.filter((r) => r.status === "approved").length })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: requests.filter((r) => r.status === "pending").length })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6, md: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: requests.filter((r) => r.status === "rejected").length })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { sx: { minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Filter by Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: statusFilter,
              label: "Filter by Status",
              onChange: (e) => {
                setStatusFilter(e.target.value);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Statuses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "approved", children: "Approved" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "rejected", children: "Rejected" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "cancelled", children: "Cancelled" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { sx: { minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Filter by Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: typeFilter,
              label: "Filter by Type",
              onChange: (e) => {
                setTypeFilter(e.target.value);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Types" }),
                timeOffTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: type.value, children: type.label }, type.value))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardHeader,
          {
            title: `Time Off Requests (${filteredRequests.length})`,
            avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { sx: { color: "primary.main" } })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : filteredRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, {}), children: "No time off requests found" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { height: 600, width: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataGrid,
          {
            rows: filteredRequests.map((req) => ({ ...req, id: req.id })),
            columns: [
              { field: "userName", headerName: "Employee", flex: 1.5, minWidth: 150, renderCell: (params) => {
                const reqUser = params.row.user;
                const fullName = reqUser ? `${reqUser.firstName} ${reqUser.lastName}` : params.row.userName;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: "bold", children: fullName || currentUser?.firstName + " " + currentUser?.lastName || "Employee" });
              } },
              { field: "type", headerName: "Leave Type", width: 140, renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: capitalizeFirstLetter(params.value), size: "small", variant: "outlined", color: "primary" }) },
              { field: "dates", headerName: "Dates", flex: 1.5, minWidth: 200, renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                format(parseISO(params.row.startDate), "MMM d, yyyy"),
                " - ",
                format(parseISO(params.row.endDate), "MMM d, yyyy")
              ] }) },
              { field: "duration", headerName: "Duration", width: 100, align: "center", headerAlign: "center", renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                getDaysDifference(params.row.startDate, params.row.endDate),
                " days"
              ] }) },
              { field: "reason", headerName: "Reason", flex: 2, minWidth: 200 },
              { field: "status", headerName: "Status", width: 130, renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: params.value.toUpperCase(),
                  color: getStatusColor(params.value),
                  size: "small",
                  icon: getStatusIcon(params.value)
                }
              ) },
              { field: "actions", headerName: isManagerRole ? "Actions" : "", width: isManagerRole ? 180 : 0, renderCell: (params) => {
                if (!isManagerRole) return null;
                if (params.row.status !== "pending") return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { height: "100%" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "contained", color: "success", onClick: (e) => {
                    e.stopPropagation();
                    approveMutation.mutate({ requestId: params.row.id, status: "approved" });
                  }, children: "Approve" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "outlined", color: "error", onClick: (e) => {
                    e.stopPropagation();
                    setRejectingRequest(params.row);
                    setRejectionReason("");
                    setRejectDialogOpen(true);
                  }, children: "Reject" })
                ] });
              } }
            ],
            disableRowSelectionOnClick: true,
            initialState: {
              pagination: {
                paginationModel: { pageSize: 15 }
              },
              sorting: {
                sortModel: [{ field: "startDate", sort: "desc" }]
              }
            },
            pageSizeOptions: [15, 25, 50],
            sx: {
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${theme.palette.divider}`
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.text.primary,
                fontWeight: 600,
                borderBottom: `1px solid ${theme.palette.divider}`
              }
            }
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openDialog, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingRequest ? "Edit Time Off Request" : "New Time Off Request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { pt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
        !isManagerRole && myCredits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, bgcolor: "primary.50", border: 1, borderColor: "primary.100" }, elevation: 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", color: "primary.main", sx: { mb: 1, fontWeight: 600 }, children: [
            "Available Leave Balances (",
            (/* @__PURE__ */ new Date()).getFullYear(),
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, children: myCredits.map((credit) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: `${credit.leaveTypeConfig.label}: ${Number(credit.remainingCredits).toFixed(1)}d`,
              color: Number(credit.remainingCredits) > 0 ? "primary" : "default",
              variant: Number(credit.remainingCredits) > 0 ? "filled" : "outlined"
            },
            credit.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Type of Leave" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select,
            {
              value: formData.type,
              label: "Type of Leave",
              onChange: (e) => setFormData({ ...formData, type: e.target.value }),
              children: timeOffTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: type.value, children: type.label }, type.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "Start Date",
              value: formData.startDate,
              onChange: (val) => setFormData((prev) => ({
                ...prev,
                startDate: val,
                endDate: val && prev.endDate && prev.endDate < val ? val : prev.endDate
              })),
              slotProps: { textField: { fullWidth: true } },
              disablePast: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "End Date",
              value: formData.endDate,
              onChange: (val) => setFormData((prev) => ({ ...prev, endDate: val })),
              slotProps: { textField: { fullWidth: true } },
              minDate: formData.startDate || void 0,
              disablePast: true
            }
          )
        ] }),
        formData.startDate && formData.endDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2, bgcolor: "action.hover" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
            "Duration: ",
            differenceInDays(formData.endDate, formData.startDate) + 1,
            " day(s)"
          ] }) }),
          (() => {
            const today = /* @__PURE__ */ new Date();
            today.setHours(0, 0, 0, 0);
            const startDateObj = new Date(formData.startDate);
            startDateObj.setHours(0, 0, 0, 0);
            const advanceDays = Math.ceil((startDateObj.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
            const typeConfig = timeOffTypes.find((t) => t.value === formData.type);
            const minAdvance = typeConfig?.minAdvance ?? 0;
            const isSickOrEmergency = ["sick", "emergency"].includes(formData.type);
            const isShortNotice = advanceDays < minAdvance && !isSickOrEmergency;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Alert,
              {
                severity: isSickOrEmergency ? "info" : isShortNotice ? "warning" : "success",
                icon: isShortNotice ? /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}) : void 0,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                  "Advance Notice: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    advanceDays,
                    " day(s)"
                  ] }),
                  isSickOrEmergency && " — Same-day allowed for Sick/Emergency",
                  isShortNotice && ` — Below policy minimum (${minAdvance} days)`,
                  !isSickOrEmergency && !isShortNotice && " — Within policy"
                ] })
              }
            );
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Reason",
            value: formData.reason,
            onChange: (e) => setFormData({ ...formData, reason: e.target.value }),
            multiline: true,
            rows: 4,
            placeholder: "Please provide a reason for your request...",
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2, justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          editingRequest && !isManagerRole && editingRequest.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => {
                deleteMutation.mutate(editingRequest.id);
                handleCloseDialog();
              },
              color: "error",
              children: "Withdraw Request"
            }
          ),
          editingRequest && isManagerRole && editingRequest.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                color: "success",
                onClick: () => {
                  approveMutation.mutate({ requestId: editingRequest.id, status: "approved" });
                  handleCloseDialog();
                },
                children: "Approve"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                color: "error",
                onClick: () => {
                  setRejectingRequest(editingRequest);
                  setRejectionReason("");
                  handleCloseDialog();
                  setRejectDialogOpen(true);
                },
                children: "Reject"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCloseDialog, sx: { mr: 1 }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSubmit,
              variant: "contained",
              disabled: submitMutation.isPending,
              children: submitMutation.isPending ? "Submitting..." : editingRequest ? "Update" : "Submit"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: rejectDialogOpen,
        onClose: () => setRejectDialogOpen(false),
        maxWidth: "xs",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: 800, color: "error.main", pb: 1 }, children: "Reject Time-Off Request" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            rejectingRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
              "Rejecting ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: rejectingRequest.userName || "employee" }),
              "'s ",
              rejectingRequest.type,
              " request (",
              format(parseISO(rejectingRequest.startDate), "MMM d"),
              " – ",
              format(parseISO(rejectingRequest.endDate), "MMM d, yyyy"),
              "). Optionally state why."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                autoFocus: true,
                fullWidth: true,
                multiline: true,
                rows: 3,
                label: "Reason for rejection (optional)",
                placeholder: "e.g. Insufficient staffing on that date. Please try another date.",
                value: rejectionReason,
                onChange: (e) => setRejectionReason(e.target.value),
                inputProps: { maxLength: 300 },
                helperText: `${rejectionReason.length}/300`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2, gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setRejectDialogOpen(false), variant: "outlined", sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  if (rejectingRequest) {
                    approveMutation.mutate({ requestId: rejectingRequest.id, status: "rejected", rejectionReason: rejectionReason.trim() || void 0 });
                  }
                  setRejectDialogOpen(false);
                  setRejectingRequest(null);
                  setRejectionReason("");
                },
                variant: "contained",
                color: "error",
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
                children: "Confirm Rejection"
              }
            )
          ] })
        ]
      }
    )
  ] });
}

export { MuiTimeOff as default };
