import { a0 as useTheme, r as reactExports, Q as jsxRuntimeExports, X as Box, a6 as AssignmentIcon, aj as Typography, c5 as Tabs, c6 as Tab, a3 as CalendarIcon, dP as AccountBalanceWalletIcon, ax as useQuery, aH as useMutation, aK as Button, dR as AddCircleOutlineIcon, aM as CircularProgress, ag as alpha, bt as Card, bu as CardContent, am as Chip, bl as format, ay as Dialog, by as DialogTitle, bz as DialogContent, bA as TextField, b2 as MenuItem, cB as LocalizationProvider, cC as AdapterDateFns, cF as DatePicker, bB as DialogActions, dS as UploadFileIcon } from './vendor-v-EuVKxF.js';
import { u as useAuth, q as queryClient, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      role: "tabpanel",
      hidden: value !== index,
      id: `request-tabpanel-${index}`,
      "aria-labelledby": `request-tab-${index}`,
      ...other,
      children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { pt: 3 }, children })
    }
  );
}
function MobileRequests() {
  const { user } = useAuth();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = reactExports.useState(0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, pb: 10 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentIcon, { sx: { fontSize: 28, color: theme.palette.primary.main, mr: 1.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: "bold", sx: { lineHeight: 1.2 }, children: "Employee Requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Manage your leaves and loans" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { borderBottom: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tabIndex, onChange: (e, newValue) => setTabIndex(newValue), "aria-label": "request tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { fontSize: "small" }), iconPosition: "start", label: "Time Off", sx: { textTransform: "none", fontWeight: "bold" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalanceWalletIcon, { fontSize: "small" }), iconPosition: "start", label: "Loans", sx: { textTransform: "none", fontWeight: "bold" } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTabPanel, { value: tabIndex, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TimeOffTab, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTabPanel, { value: tabIndex, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoansTab, { user, theme }) })
  ] });
}
function TimeOffTab() {
  const { toast } = useToast();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    type: "vacation",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["/api/time-off-requests"]
  });
  const requests = Array.isArray(requestsData) ? requestsData : requestsData?.requests || [];
  const { data: balancesData } = useQuery({
    queryKey: ["/api/leave-credits/my"]
  });
  Array.isArray(balancesData) ? balancesData : balancesData?.credits || [];
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/time-off-requests", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests/my"] });
      toast({ title: "Success", description: "Time off request submitted." });
      setOpenDialog(false);
      setFormData({ type: "vacation", startDate: "", endDate: "", reason: "" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "Failed to submit request", variant: "destructive" });
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({ title: "Invalid Dates", description: "End date must be after start date.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: "Leave Requests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          size: "small",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddCircleOutlineIcon, {}),
          onClick: () => setOpenDialog(true),
          sx: { borderRadius: 6, textTransform: "none" },
          children: "Request"
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No leave requests found." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: requests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", sx: { textTransform: "capitalize" }, children: [
          req.type,
          " Leave"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: req.status.toUpperCase(),
            size: "small",
            color: req.status === "approved" ? "success" : req.status === "rejected" ? "error" : "warning",
            sx: { height: 20, fontSize: "0.65rem", fontWeight: "bold" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        format(new Date(req.startDate), "MMM d, yyyy"),
        " - ",
        format(new Date(req.endDate), "MMM d, yyyy")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mt: 1, fontStyle: "italic" }, children: [
        '"',
        req.reason,
        '"'
      ] })
    ] }) }, req.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: "bold" }, children: "Request Time Off" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dividers: true, sx: { display: "flex", flexDirection: "column", gap: 2.5, px: 2, pt: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            select: true,
            label: "Leave Type",
            fullWidth: true,
            required: true,
            value: formData.type,
            onChange: (e) => setFormData({ ...formData, type: e.target.value }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "vacation", children: "Vacation Leave" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "sick", children: "Sick Leave" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "emergency", children: "Emergency Leave" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "personal", children: "Personal Leave" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "other", children: "Other" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "Start Date",
              value: formData.startDate ? new Date(formData.startDate) : null,
              onChange: (newValue) => setFormData({ ...formData, startDate: newValue ? format(newValue, "yyyy-MM-dd") : "" }),
              slotProps: { textField: { fullWidth: true, required: true } }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "End Date",
              value: formData.endDate ? new Date(formData.endDate) : null,
              onChange: (newValue) => setFormData({ ...formData, endDate: newValue ? format(newValue, "yyyy-MM-dd") : "" }),
              slotProps: { textField: { fullWidth: true, required: true } }
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Reason (Required)",
            fullWidth: true,
            required: true,
            multiline: true,
            rows: 3,
            value: formData.reason,
            onChange: (e) => setFormData({ ...formData, reason: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "contained", disabled: submitMutation.isPending, children: submitMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "Submit" })
      ] })
    ] }) })
  ] });
}
function LoansTab({ user, theme }) {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = reactExports.useState(false);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    loanType: "SSS",
    referenceNumber: "",
    accountNumber: "",
    totalAmount: "",
    monthlyAmortization: "",
    deductionStartDate: "",
    proofFileUrl: ""
  });
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const { data: loansRaw, isLoading } = useQuery({ queryKey: ["/api/loans/my"] });
  const loans = Array.isArray(loansRaw) ? loansRaw : loansRaw?.loans || [];
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/loans", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans/my"] });
      toast({ title: "Success", description: "Loan request submitted successfully." });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: "Submission Failed", description: error.message || "Error parsing loan details.", variant: "destructive" });
    }
  });
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ loanType: "SSS", referenceNumber: "", accountNumber: "", totalAmount: "", monthlyAmortization: "", deductionStartDate: "", proofFileUrl: "" });
    setSelectedFile(null);
  };
  const uploadToCloudinary = async (file) => {
    const pubId = `loan_${user?.id}_${Date.now()}`;
    const sigRes = await fetch(`/api/employees/upload-signature?folder=loans&public_id=${pubId}`);
    if (!sigRes.ok) throw new Error("Failed to get upload signature");
    const { signature, timestamp, apiKey, cloudName } = await sigRes.json();
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("api_key", apiKey);
    formDataObj.append("timestamp", timestamp.toString());
    formDataObj.append("signature", signature);
    formDataObj.append("folder", "loans");
    formDataObj.append("public_id", pubId);
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formDataObj
    });
    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "Proof Required", description: "Please upload a proof document.", variant: "destructive" });
      return;
    }
    try {
      setIsUploading(true);
      const fileUrl = await uploadToCloudinary(selectedFile);
      const payload = {
        userId: user.id,
        branchId: user.branchId,
        loanType: formData.loanType,
        referenceNumber: formData.referenceNumber,
        accountNumber: formData.accountNumber,
        totalAmount: formData.totalAmount,
        monthlyAmortization: formData.monthlyAmortization,
        deductionStartDate: new Date(formData.deductionStartDate).toISOString(),
        proofFileUrl: fileUrl
      };
      submitMutation.mutate(payload);
    } catch (err) {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: "Active Loans & Payroll Deductions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          size: "small",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddCircleOutlineIcon, {}),
          onClick: () => setOpenDialog(true),
          sx: { borderRadius: 6, textTransform: "none" },
          children: "New Loan"
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : loans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", p: 4, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No active loan requests found." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: loans.map((loan) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { fontWeight: "bold", children: [
          loan.loanType,
          " Loan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: loan.status.toUpperCase(),
            size: "small",
            color: loan.status === "approved" ? "success" : loan.status === "rejected" ? "error" : "warning",
            sx: { height: 20, fontSize: "0.65rem", fontWeight: "bold" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Ref Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: loan.referenceNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Deduction Starts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: format(new Date(loan.deductionStartDate), "MMM d, yyyy") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Acct Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: loan.accountNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Monthly Amort." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 500, color: "primary.main", children: [
            "₱",
            Number(loan.monthlyAmortization).toFixed(2)
          ] })
        ] })
      ] }),
      loan.hrApprovalNote && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1, p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error", fontWeight: "bold", children: "HR Note:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "error", children: loan.hrApprovalNote })
      ] }),
      loan.proofFileUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          size: "small",
          sx: { mt: 2, width: "100%", textTransform: "none", borderRadius: 2 },
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentIcon, {}),
          onClick: () => {
            const renderUrl = loan.proofFileUrl.replace(/\.pdf$/i, ".jpg");
            window.open(renderUrl, "_blank");
          },
          children: "View Proof Document"
        }
      )
    ] }) }, loan.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openDialog, onClose: handleCloseDialog, fullWidth: true, maxWidth: "xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: "bold" }, children: "Register Payroll Deduction" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dividers: true, sx: { display: "flex", flexDirection: "column", gap: 2.5, px: 2, pt: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            select: true,
            label: "Loan Type",
            fullWidth: true,
            required: true,
            value: formData.loanType,
            onChange: (e) => setFormData({ ...formData, loanType: e.target.value }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SSS", children: "SSS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "Pag-IBIG", children: "Pag-IBIG" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Reference Number",
            fullWidth: true,
            required: true,
            value: formData.referenceNumber,
            onChange: (e) => setFormData({ ...formData, referenceNumber: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Biller Account Number",
            fullWidth: true,
            required: true,
            value: formData.accountNumber,
            onChange: (e) => setFormData({ ...formData, accountNumber: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Total Loan Amount (₱)",
            type: "number",
            fullWidth: true,
            required: true,
            inputProps: { min: "1", step: "0.01" },
            value: formData.totalAmount,
            onChange: (e) => setFormData({ ...formData, totalAmount: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Monthly Amortization (₱)",
            type: "number",
            fullWidth: true,
            required: true,
            inputProps: { min: "1", step: "0.01" },
            value: formData.monthlyAmortization,
            onChange: (e) => setFormData({ ...formData, monthlyAmortization: e.target.value })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DatePicker,
          {
            label: "Deduction Start Cut-off",
            value: formData.deductionStartDate ? new Date(formData.deductionStartDate) : null,
            onChange: (newValue) => setFormData({ ...formData, deductionStartDate: newValue ? format(newValue, "yyyy-MM-dd") : "" }),
            slotProps: { textField: { fullWidth: true, required: true } }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { border: `1px dashed ${theme.palette.primary.main}`, borderRadius: 2, p: 2, textAlign: "center", bgcolor: alpha(theme.palette.primary.main, 0.02) }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              accept: "image/*,application/pdf",
              style: { display: "none" },
              id: "proof-upload",
              type: "file",
              onChange: (e) => e.target.files && setSelectedFile(e.target.files[0])
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "proof-upload", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", component: "span", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(UploadFileIcon, {}), sx: { textTransform: "none" }, children: selectedFile ? "Change Proof Document" : "Upload Proof Document" }) }),
          selectedFile && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", display: "block", sx: { mt: 1, color: "success.main", fontWeight: "bold" }, children: selectedFile.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCloseDialog, disabled: isUploading || submitMutation.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "contained", disabled: isUploading || submitMutation.isPending, children: isUploading || submitMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "Submit Requisition" })
      ] })
    ] }) })
  ] });
}

export { MobileRequests as default };
