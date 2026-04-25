import { r as reactExports, Q as jsxRuntimeExports, ay as Dialog, by as DialogTitle, bD as WarningIcon, aj as Typography, af as IconButton, bx as CloseIcon, bz as DialogContent, X as Box, bE as Alert, aJ as Stack, am as Chip, bm as Divider, bF as PersonOffIcon, ae as DownloadIcon, bG as DeleteIcon, aT as ErrorIcon, bA as TextField, bH as FormControlLabel, bI as Checkbox, bB as DialogActions, aK as Button, aM as CircularProgress, bJ as cva, bK as LoaderCircle, bL as FileUp, bM as Eye, bN as Download, bO as Trash2, bP as FileText, bQ as y, bR as Image, a0 as useTheme, aG as useQueryClient, $ as useLocation, bl as format, bS as startOfMonth, bT as endOfMonth, ax as useQuery, aH as useMutation, al as Avatar, aU as CheckCircleIcon, bU as CancelIcon, an as Tooltip, bV as Visibility, bW as EditIcon, bq as TaxIcon, bX as VisibilityOff, b7 as Paper, ai as ChevronLeftIcon, bY as subMonths, a3 as CalendarIcon, ah as ChevronRightIcon, bZ as addMonths, bp as AddIcon, br as Grid, b_ as InputAdornment, az as Search, b0 as FormControl, b$ as InputLabel, b1 as Select, b2 as MenuItem, c0 as Collapse, c1 as DataGrid, c2 as GridToolbar, a5 as PeopleIcon, aI as Menu, au as ListItemIcon, aw as ListItemText, c3 as Switch, c4 as SaveIcon, c5 as Tabs, c6 as Tab, c7 as PersonIcon, c8 as WorkIcon, ag as alpha, c9 as SecurityIcon, ca as HealthIcon, cb as HomeIcon } from './vendor-v-EuVKxF.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';
import { d as cn, c as apiRequest, i as isManager, a as isAdmin } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { E as EmptyState } from './cards-Du3qVCqM.js';
import { P as ProfilePhotoUpload } from './ProfilePhotoUpload-BZ8BADFR.js';
import { B as Button$1 } from './button-CBOKXpNF.js';
import { C as Card, a as CardContent } from './card-mE7iOYpd.js';
import { D as Dialog$1, a as DialogContent$1, b as DialogHeader, c as DialogTitle$1 } from './dialog-C9UQy7j1.js';
import { v as validateDocumentFile, u as uploadToCloudinary, U as UPLOAD_PRESETS, F as FOLDERS } from './cloudinary-CkNgNQjm.js';

function DeletionOptionsModal({
  open,
  employee,
  relatedData,
  isAdmin,
  onClose,
  onDeactivate,
  onForceDelete,
  onExportData,
  isLoading = false
}) {
  const [confirmText, setConfirmText] = reactExports.useState("");
  const [understandCheck, setUnderstandCheck] = reactExports.useState(false);
  const [showForceDelete, setShowForceDelete] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  const handleClose = () => {
    setConfirmText("");
    setUnderstandCheck(false);
    setShowForceDelete(false);
    setReason("");
    onClose();
  };
  const handleForceDelete = () => {
    if (confirmText === "DELETE" && understandCheck) {
      onForceDelete(reason || "Force deletion by admin");
      handleClose();
    }
  };
  const canForceDelete = confirmText === "DELETE" && understandCheck && isAdmin;
  if (!employee) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose: handleClose,
      maxWidth: "sm",
      fullWidth: true,
      PaperProps: {
        sx: { borderRadius: 3 }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { display: "flex", alignItems: "center", gap: 1, pb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "span", children: "Cannot Delete Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              onClick: handleClose,
              sx: { ml: "auto" },
              disabled: isLoading,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {})
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", color: "text.secondary", gutterBottom: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              employee.firstName,
              " ",
              employee.lastName
            ] }),
            " has existing records that would be affected."
          ] }) }),
          relatedData && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "This employee has:" }),
            relatedData.hasShifts && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Shifts", color: "primary", variant: "outlined" }),
            relatedData.hasPayroll && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Payroll Records", color: "secondary", variant: "outlined" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
          !showForceDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", gutterBottom: true, sx: { fontWeight: 600 }, children: "Choose an option:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, sx: { mt: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    p: 2,
                    border: "2px solid",
                    borderColor: "success.main",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "success.light",
                      transform: "scale(1.01)"
                    }
                  },
                  onClick: () => {
                    onDeactivate();
                    handleClose();
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PersonOffIcon, { color: "success", sx: { fontSize: 32 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: [
                        "Deactivate Employee",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Recommended", size: "small", color: "success", sx: { ml: 1 } })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Employee will be marked as inactive. All data is preserved for records and reports." })
                    ] })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover"
                    }
                  },
                  onClick: onExportData,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, { color: "info", sx: { fontSize: 32 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Export Employee Data" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Download all employee data as JSON for backup or compliance." })
                    ] })
                  ] })
                }
              ),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    p: 2,
                    border: "1px solid",
                    borderColor: "error.main",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "error.light"
                    }
                  },
                  onClick: () => setShowForceDelete(true),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { color: "error", sx: { fontSize: 32 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, color: "error.main" }, children: [
                        "Permanently Delete Everything",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Admin Only", size: "small", color: "error", sx: { ml: 1 } })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Irreversibly delete employee and ALL related data including shifts, payroll, etc." })
                    ] })
                  ] })
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", sx: { mb: 2 }, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, {}), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: "This action is IRREVERSIBLE!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "All shifts, payroll records, time-off requests, and other data for this employee will be permanently deleted." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                id: "deletion-reason",
                name: "deletion-reason",
                fullWidth: true,
                label: "Reason for deletion (optional)",
                placeholder: "e.g., GDPR request, test data cleanup",
                value: reason,
                onChange: (e) => setReason(e.target.value),
                sx: { mb: 2 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                id: "delete-confirm",
                name: "delete-confirm",
                fullWidth: true,
                label: "Type DELETE to confirm",
                placeholder: "DELETE",
                value: confirmText,
                onChange: (e) => setConfirmText(e.target.value.toUpperCase()),
                error: confirmText !== "" && confirmText !== "DELETE",
                helperText: confirmText !== "" && confirmText !== "DELETE" ? "Must type DELETE exactly" : "",
                sx: { mb: 2 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    id: "understand-check",
                    name: "understand-check",
                    checked: understandCheck,
                    onChange: (e) => setUnderstandCheck(e.target.checked),
                    color: "error"
                  }
                ),
                label: "I understand this will permanently delete all employee data and cannot be undone"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { sx: { px: 3, pb: 2 }, children: showForceDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowForceDelete(false), disabled: isLoading, children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              color: "error",
              onClick: handleForceDelete,
              disabled: !canForceDelete || isLoading,
              startIcon: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
              children: "Permanently Delete"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleClose, disabled: isLoading, children: "Cancel" }) })
      ]
    }
  );
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        outline: "text-foreground border-border",
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

const documentTypeLabels = {
  sss_id: "SSS ID",
  philhealth_id: "PhilHealth ID",
  pagibig_id: "Pag-IBIG ID",
  tin_id: "TIN ID",
  birth_certificate: "Birth Certificate",
  proof_of_address: "Proof of Address",
  nbi_clearance: "NBI Clearance",
  resume: "Resume/CV",
  diploma: "Diploma/Certificate",
  other: "Other Document"
};
const DocumentUpload = ({
  employeeId,
  documents = [],
  onUploadComplete,
  onDocumentRemove,
  allowedTypes,
  maxFiles = 10,
  disabled = false
}) => {
  const [uploading, setUploading] = reactExports.useState(false);
  const [selectedType, setSelectedType] = reactExports.useState("other");
  const [previewDoc, setPreviewDoc] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const availableTypes = allowedTypes || Object.keys(documentTypeLabels);
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateDocumentFile(file, 10);
    if (!validation.valid) {
      y.error(validation.error);
      return;
    }
    if (documents.length >= maxFiles) {
      y.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }
    setUploading(true);
    try {
      const result = await uploadToCloudinary({
        file,
        folder: `${FOLDERS.ID_DOCUMENTS}/${employeeId}`,
        publicId: `${selectedType}_${Date.now()}`,
        uploadPreset: UPLOAD_PRESETS.DOCUMENTS
      });
      const response = await apiRequest("POST", `/api/employees/${employeeId}/documents`, {
        type: selectedType,
        name: file.name,
        publicId: result.publicId,
        url: result.secureUrl
      });
      const savedDoc = await response.json();
      onUploadComplete?.({
        id: savedDoc.id,
        type: selectedType,
        name: file.name,
        publicId: result.publicId,
        url: result.secureUrl,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      y.success(`✅ ${documentTypeLabels[selectedType]} uploaded!`);
    } catch (error) {
      y.error("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleRemove = async (doc) => {
    if (!confirm(`Remove ${doc.name}?`)) return;
    try {
      await apiRequest("DELETE", `/api/employees/${employeeId}/documents/${doc.id}`);
      onDocumentRemove?.(doc.id);
      y.success("Document removed");
    } catch (error) {
      y.error("Failed to remove document");
    }
  };
  const getFileIcon = (url) => {
    if (url.includes(".pdf")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 text-red-500" });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 text-blue-500" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: selectedType,
            onChange: (e) => setSelectedType(e.target.value),
            className: "px-3 py-2 border rounded-md text-sm",
            disabled: uploading,
            children: availableTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: type, children: documentTypeLabels[type] }, type))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            onClick: () => fileInputRef.current?.click(),
            disabled: uploading || documents.length >= maxFiles,
            className: "gap-2",
            children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
              "Uploading..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "w-4 h-4" }),
              "Upload Document"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*,application/pdf",
            onChange: handleUpload,
            className: "hidden",
            disabled: disabled || uploading
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
        "PDF, JPG, PNG. Max 10MB per file. ",
        documents.length,
        "/",
        maxFiles,
        " documents."
      ] })
    ] }) }),
    documents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: documents.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center", children: doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: doc.url,
          alt: doc.name,
          className: "w-full h-full object-cover rounded"
        }
      ) : getFileIcon(doc.url) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", title: doc.name, children: doc.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs mt-1", children: documentTypeLabels[doc.type] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8",
            onClick: () => setPreviewDoc(doc),
            title: "View",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8",
            onClick: () => window.open(doc.url, "_blank"),
            title: "Download",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" })
          }
        ),
        !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8 text-red-500 hover:text-red-600",
            onClick: () => handleRemove(doc),
            title: "Remove",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }) }) }, doc.id)) }),
    documents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No documents uploaded yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog$1, { open: !!previewDoc, onOpenChange: () => setPreviewDoc(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent$1, { className: "max-w-4xl max-h-[90vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle$1, { children: previewDoc?.name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto max-h-[70vh]", children: previewDoc?.url.includes(".pdf") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "iframe",
        {
          src: previewDoc.url,
          className: "w-full h-[600px]",
          title: previewDoc.name
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: previewDoc?.url,
          alt: previewDoc?.name,
          className: "w-full h-auto"
        }
      ) })
    ] }) })
  ] });
};

const getRoleColor = (role) => {
  switch (role) {
    case "manager":
      return "primary";
    case "admin":
      return "secondary";
    default:
      return "default";
  }
};
const initialFormData = {
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
  isMwe: false
};
function ActiveLoansDisplay({ employeeId }) {
  const { data: loans = [] } = useQuery({
    queryKey: ["/api/loans/user", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const res = await fetch(`/api/loans/user/${employeeId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!employeeId
  });
  const activeLoans = loans.filter((l) => l.status === "approved");
  const pendingLoans = loans.filter((l) => l.status === "pending");
  if (activeLoans.length === 0 && pendingLoans.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: "italic", textAlign: "center", py: 1 }, children: "No active or pending loan deductions for this employee." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 1, children: [
    activeLoans.map((loan) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, border: "1px solid", borderColor: "success.light", borderRadius: 1, bgcolor: "success.50" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
          loan.loanType,
          " Loan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          "Ref: ",
          loan.referenceNumber
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, color: "primary.main", children: [
          "₱",
          Number(loan.monthlyAmortization).toFixed(2),
          "/mo"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "ACTIVE", size: "small", color: "success", sx: { height: 18, fontSize: "0.6rem" } })
      ] })
    ] }, loan.id)),
    pendingLoans.map((loan) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, border: "1px dashed", borderColor: "warning.light", borderRadius: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
          loan.loanType,
          " Loan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          "Ref: ",
          loan.referenceNumber
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
          "₱",
          Number(loan.monthlyAmortization).toFixed(2),
          "/mo"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "PENDING APPROVAL", size: "small", color: "warning", sx: { height: 18, fontSize: "0.6rem" } })
      ] })
    ] }, loan.id))
  ] });
}
function MuiEmployees() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const managerRole = isManager();
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [roleFilter, setRoleFilter] = reactExports.useState("all");
  const [branchFilter, setBranchFilter] = reactExports.useState("all");
  const [selectedEmployees, setSelectedEmployees] = reactExports.useState([]);
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(10);
  const [selectedMonth, setSelectedMonth] = reactExports.useState(/* @__PURE__ */ new Date());
  const [formDialogOpen, setFormDialogOpen] = reactExports.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = reactExports.useState(false);
  const [deductionsDialogOpen, setDeductionsDialogOpen] = reactExports.useState(false);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [currentEmployee, setCurrentEmployee] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState(initialFormData);
  const [deductionsFormData, setDeductionsFormData] = reactExports.useState({
    sssLoanDeduction: "0",
    pagibigLoanDeduction: "0",
    cashAdvanceDeduction: "0",
    otherDeductions: "0"
  });
  const [contextMenu, setContextMenu] = reactExports.useState(null);
  const [deletionModalOpen, setDeletionModalOpen] = reactExports.useState(false);
  const [employeeRelatedData, setEmployeeRelatedData] = reactExports.useState(null);
  const userIsAdmin = isAdmin();
  reactExports.useEffect(() => {
    if (!managerRole) {
      reactExports.startTransition(() => setLocation("/"));
    }
  }, [managerRole, setLocation]);
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const { data: employeesResponse, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/hours/all-employees", monthStart, monthEnd],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/hours/all-employees?startDate=${monthStart}&endDate=${monthEnd}`);
      return response.json();
    },
    enabled: managerRole,
    refetchOnWindowFocus: true
  });
  const { data: branchesResponse } = useQuery({
    queryKey: ["/api/branches"],
    enabled: managerRole,
    refetchOnWindowFocus: true
  });
  useRealtime({
    queryKeys: ["/api/hours/all-employees", "/api/employees"]
  });
  const { data: employeeStats } = useQuery({
    queryKey: ["employee-stats", monthStart, monthEnd],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/employees/stats?startDate=${monthStart}&endDate=${monthEnd}`);
      return response.json();
    },
    enabled: managerRole,
    refetchOnWindowFocus: true
  });
  const { data: documentsResponse, refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/employees", currentEmployee?.id, "documents"],
    queryFn: async () => {
      if (!currentEmployee?.id) return [];
      const response = await apiRequest("GET", `/api/employees/${currentEmployee.id}/documents`);
      return response.json();
    },
    enabled: !!currentEmployee?.id && (viewDialogOpen || formDialogOpen)
  });
  const employeesData = employeesResponse?.employees || [];
  const branchesData = branchesResponse?.branches || [];
  const deferredSearchTerm = reactExports.useDeferredValue(searchTerm);
  const branchNameById = reactExports.useMemo(
    () => new Map(branchesData.map((branch) => [branch.id, branch.name])),
    [branchesData]
  );
  const getBranchName = reactExports.useCallback(
    (branchId) => branchNameById.get(branchId) || "Unknown",
    [branchNameById]
  );
  const invalidateEmployeeQueries = reactExports.useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === "/api/hours/all-employees" || key === "/api/employees" || key === "employees" || key === "employee-stats";
      }
    });
  }, [queryClient]);
  const filteredEmployees = reactExports.useMemo(() => {
    const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
    return employeesData.filter((employee) => {
      const matchesSearch = normalizedSearchTerm === "" || `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(normalizedSearchTerm) || employee.email.toLowerCase().includes(normalizedSearchTerm) || employee.position.toLowerCase().includes(normalizedSearchTerm);
      const matchesStatus = statusFilter === "all" || statusFilter === "active" && employee.isActive || statusFilter === "inactive" && !employee.isActive;
      const matchesRole = roleFilter === "all" || employee.role === roleFilter;
      const matchesBranch = branchFilter === "all" || employee.branchId === branchFilter;
      return matchesSearch && matchesStatus && matchesRole && matchesBranch;
    });
  }, [employeesData, deferredSearchTerm, statusFilter, roleFilter, branchFilter]);
  const createEmployee = useMutation({
    mutationFn: async (employeeData) => {
      const response = await apiRequest("POST", "/api/employees", employeeData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create employee");
      }
      return response.json();
    },
    onSuccess: () => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        handleCloseFormDialog();
      });
      toast({ title: "Success", description: "Employee created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const updateEmployee = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee");
      }
      return response.json();
    },
    onSuccess: () => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        handleCloseFormDialog();
      });
      toast({ title: "Success", description: "Employee updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const deleteEmployee = useMutation({
    mutationFn: async ({ id, force }) => {
      const url = force ? `/api/employees/${id}?force=true` : `/api/employees/${id}`;
      const response = await apiRequest("DELETE", url);
      if (!response.ok) {
        const error = await response.json();
        if (error.hasRelatedData) {
          return { hasRelatedData: true, relatedData: error.relatedData };
        }
        throw new Error(error.message || "Failed to delete employee");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.hasRelatedData) {
        setEmployeeRelatedData({
          hasShifts: data.relatedData.hasShifts,
          hasPayroll: data.relatedData.hasPayroll,
          totalRecords: data.relatedData.totalRecords
        });
        setDeletionModalOpen(true);
        return;
      }
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        setDeletionModalOpen(false);
        setCurrentEmployee(null);
        setEmployeeRelatedData(null);
      });
      toast({ title: "Success", description: data?.forceDeleted ? "Employee and all data permanently deleted" : "Employee deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const exportEmployeeData = async (id) => {
    try {
      const response = await apiRequest("GET", `/api/employees/${id}/export`);
      if (!response.ok) throw new Error("Failed to export data");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employee_${data.employee.firstName}_${data.employee.lastName}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Employee data exported successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  const updateDeductions = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}/deductions`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update deductions");
      }
      return response.json();
    },
    onSuccess: () => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        setDeductionsDialogOpen(false);
      });
      toast({ title: "Success", description: "Deductions updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const toggleEmployeeStatus = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await apiRequest("PATCH", `/api/employees/${id}/status`, { isActive });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee status");
      }
      return response.json();
    },
    onSuccess: (data, { isActive }) => {
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        setDeletionModalOpen(false);
        setEmployeeRelatedData(null);
        if (currentEmployee) {
          setCurrentEmployee({ ...currentEmployee, isActive });
        }
      });
      const action = isActive ? "activated" : "deactivated";
      toast({ title: "Success", description: `Employee ${action} successfully` });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const bulkToggleStatus = useMutation({
    mutationFn: async ({ ids, isActive }) => {
      const promises = ids.map(
        (id) => apiRequest("PATCH", `/api/employees/${id}/status`, { isActive })
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
      reactExports.startTransition(() => {
        invalidateEmployeeQueries();
        setSelectedEmployees([]);
      });
      const action = isActive ? "activated" : "deactivated";
      toast({ title: "Success", description: `${ids.length} employees ${action} successfully` });
    }
  });
  const handleOpenAddDialog = reactExports.useCallback(() => {
    setIsEditing(false);
    setFormData(initialFormData);
    setFormDialogOpen(true);
  }, []);
  const handleOpenEditDialog = reactExports.useCallback((employee) => {
    setIsEditing(true);
    setCurrentEmployee(employee);
    setFormData({
      username: employee.username,
      password: "password123",
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      position: employee.position,
      hourlyRate: employee.hourlyRate,
      branchId: employee.branchId,
      isActive: employee.isActive,
      tin: employee.tin || "",
      sssNumber: employee.sssNumber || "",
      philhealthNumber: employee.philhealthNumber || "",
      pagibigNumber: employee.pagibigNumber || "",
      isMwe: employee.isMwe || false
    });
    setFormDialogOpen(true);
  }, []);
  const handleCloseFormDialog = reactExports.useCallback(() => {
    setFormDialogOpen(false);
    setIsEditing(false);
    setCurrentEmployee(null);
    setFormData(initialFormData);
  }, []);
  const handleOpenViewDialog = reactExports.useCallback((employee) => {
    setCurrentEmployee(employee);
    setViewDialogOpen(true);
  }, []);
  const handleOpenDeductionsDialog = reactExports.useCallback((employee) => {
    setCurrentEmployee(employee);
    setDeductionsFormData({
      sssLoanDeduction: employee.sssLoanDeduction || "0",
      pagibigLoanDeduction: employee.pagibigLoanDeduction || "0",
      cashAdvanceDeduction: employee.cashAdvanceDeduction || "0",
      otherDeductions: employee.otherDeductions || "0"
    });
    setDeductionsDialogOpen(true);
  }, []);
  const handleFormSubmit = (e) => {
    e.preventDefault();
    reactExports.startTransition(() => {
      if (isEditing && currentEmployee) {
        const updateData = { ...formData };
        if (!updateData.password || updateData.password === "password123" || updateData.password === "********") {
          delete updateData.password;
        }
        updateEmployee.mutate({ id: currentEmployee.id, data: updateData });
      } else {
        createEmployee.mutate(formData);
      }
    });
  };
  const handleDeductionsSubmit = (e) => {
    e.preventDefault();
    if (currentEmployee) {
      updateDeductions.mutate({ id: currentEmployee.id, data: deductionsFormData });
    }
  };
  const handleCloseContextMenu = reactExports.useCallback(() => {
    setContextMenu(null);
  }, []);
  const columns = reactExports.useMemo(() => [
    {
      field: "employee",
      headerName: "Employee",
      flex: 2,
      minWidth: 280,
      valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, py: 1, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Avatar,
          {
            src: params.row.photoUrl,
            sx: {
              width: 36,
              height: 36,
              flexShrink: 0,
              bgcolor: params.row.role === "manager" ? "primary.main" : params.row.role === "admin" ? "secondary.main" : "success.main",
              fontSize: "0.8rem",
              fontWeight: 600
            },
            children: [
              !params.row.photoUrl && params.row.firstName?.charAt(0),
              !params.row.photoUrl && params.row.lastName?.charAt(0)
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: [
            params.row.firstName,
            " ",
            params.row.lastName
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }, children: params.row.email })
        ] })
      ] })
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.5, py: 0.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 500, lineHeight: 1.2 }, children: [
          params.row.position,
          params.row.isMwe && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: "MWE",
              color: "secondary",
              sx: { height: 16, fontSize: "0.6rem", ml: 1, fontWeight: "bold" },
              title: "Minimum Wage Earner (Tax Exempt)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            size: "small",
            label: params.row.role,
            color: getRoleColor(params.row.role),
            sx: { height: 18, fontSize: "0.65rem", width: "fit-content" }
          }
        )
      ] })
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) => getBranchName(row.branchId),
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: getBranchName(params.row.branchId) })
    },
    {
      field: "hourlyRate",
      headerName: "Rate",
      width: 100,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const rate = parseFloat(params.row.hourlyRate || "0");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Typography,
          {
            variant: "body2",
            sx: {
              fontWeight: 600,
              color: rate === 0 ? "text.disabled" : "text.primary"
            },
            children: [
              "₱",
              rate.toLocaleString("en-PH"),
              "/hr"
            ]
          }
        );
      }
    },
    {
      field: "hoursThisMonth",
      headerName: "Hours",
      width: 80,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const hours = params.row.hoursThisMonth || 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Typography,
          {
            variant: "body2",
            sx: {
              fontFamily: "monospace",
              color: hours === 0 ? "text.disabled" : "text.primary"
            },
            children: [
              hours.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 1 }),
              "h"
            ]
          }
        );
      }
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          size: "small",
          icon: params.row.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}),
          label: params.row.isActive ? "Active" : "Inactive",
          color: params.row.isActive ? "success" : "error",
          variant: "outlined"
        }
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 0.5, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenViewDialog(params.row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenEditDialog(params.row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Deductions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleOpenDeductionsDialog(params.row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { fontSize: "small" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: params.row.isActive ? "Deactivate" : "Activate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          IconButton,
          {
            size: "small",
            color: params.row.isActive ? "warning" : "success",
            onClick: () => toggleEmployeeStatus.mutate({ id: params.row.id, isActive: !params.row.isActive }),
            children: params.row.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, { fontSize: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small" })
          }
        ) })
      ] })
    }
  ], [handleOpenViewDialog, handleOpenEditDialog, handleOpenDeductionsDialog, getBranchName]);
  if (!managerRole) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, minHeight: "100vh", bgcolor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 0.5 }, children: "Employee Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "Manage your team members and their information" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: 0,
              sx: {
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 0.5,
                borderRadius: 2,
                bgcolor: "action.hover"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    size: "small",
                    onClick: () => setSelectedMonth(subMonths(selectedMonth, 1)),
                    sx: { color: "primary.main" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {})
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { fontSize: 18, color: "primary.main" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, sx: { minWidth: 120, textAlign: "center" }, children: format(selectedMonth, "MMMM yyyy") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    size: "small",
                    onClick: () => setSelectedMonth(addMonths(selectedMonth, 1)),
                    sx: { color: "primary.main" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {})
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Go to current month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "small",
                    variant: "outlined",
                    onClick: () => setSelectedMonth(/* @__PURE__ */ new Date()),
                    sx: { ml: 1, minWidth: 60 },
                    children: "Today"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: handleOpenAddDialog,
              sx: { boxShadow: 2 },
              children: "Add Employee"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { p: 2.5, borderRadius: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              size: "small",
              placeholder: "Search employees...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              slotProps: {
                input: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { color: "action" }) })
                }
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6, md: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, label: "Status", onChange: (e) => setStatusFilter(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "inactive", children: "Inactive" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6, md: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: roleFilter, label: "Role", onChange: (e) => setRoleFilter(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Roles" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "employee", children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "manager", children: "Manager" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6, md: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Branch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: branchFilter, label: "Branch", onChange: (e) => setBranchFilter(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Branches" }),
              branchesData.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: branch.id, children: branch.name }, branch.id))
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: selectedEmployees.length > 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${selectedEmployees.length} selected`, color: "primary", variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              variant: "outlined",
              color: "success",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
              onClick: () => bulkToggleStatus.mutate({ ids: selectedEmployees, isActive: true }),
              disabled: bulkToggleStatus.isPending,
              children: bulkToggleStatus.isPending ? "..." : "Activate"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              variant: "outlined",
              color: "error",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}),
              onClick: () => bulkToggleStatus.mutate({ ids: selectedEmployees, isActive: false }),
              disabled: bulkToggleStatus.isPending,
              children: bulkToggleStatus.isPending ? "..." : "Deactivate"
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { elevation: 0, sx: { height: 600, width: "100%", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataGrid,
        {
          rows: filteredEmployees,
          columns,
          loading: employeesLoading,
          checkboxSelection: true,
          disableRowSelectionOnClick: true,
          rowHeight: 65,
          onRowSelectionModelChange: (newSelection) => {
            setSelectedEmployees(Array.from(newSelection.ids || []).map(String));
          },
          slots: { toolbar: GridToolbar },
          slotProps: {
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 }
            }
          },
          initialState: {
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "employee", sort: "asc" }] }
          },
          pageSizeOptions: [5, 10, 25, 50],
          sx: {
            border: "none",
            "& .MuiDataGrid-cell": {
              py: 1,
              display: "flex",
              alignItems: "center"
            },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "action.hover",
              borderRadius: 0
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600
            }
          }
        }
      ) }),
      filteredEmployees.length === 0 && !employeesLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}),
          title: "No employees found",
          description: "Try adjusting your filters or add a new employee",
          action: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), onClick: handleOpenAddDialog, children: "Add Employee" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        open: contextMenu !== null,
        onClose: handleCloseContextMenu,
        anchorReference: "anchorPosition",
        anchorPosition: contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : void 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                handleOpenViewDialog(contextMenu.employee);
                handleCloseContextMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: "View Details" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                handleOpenEditDialog(contextMenu.employee);
                handleCloseContextMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: "Edit" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                handleOpenDeductionsDialog(contextMenu.employee);
                handleCloseContextMenu();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { fontSize: "small" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: "Manage Deductions" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          contextMenu?.employee && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => {
                toggleEmployeeStatus.mutate({ id: contextMenu.employee.id, isActive: !contextMenu.employee.isActive });
                handleCloseContextMenu();
              },
              sx: { color: contextMenu.employee.isActive ? "warning.main" : "success.main" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: contextMenu.employee.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, { fontSize: "small", color: "warning" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { fontSize: "small", color: "success" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: contextMenu.employee.isActive ? "Deactivate" : "Activate" })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formDialogOpen, onClose: handleCloseFormDialog, maxWidth: "sm", fullWidth: true, disableRestoreFocus: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleFormSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEditing ? `Edit Employee: ${currentEmployee?.firstName} ${currentEmployee?.lastName}` : "Add New Employee" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dividers: true, children: [
        isEditing && currentEmployee && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3, display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProfilePhotoUpload,
          {
            currentPhotoId: currentEmployee.photoPublicId,
            currentPhotoUrl: currentEmployee.photoUrl,
            employeeId: currentEmployee.id,
            employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
            onUploadComplete: () => {
              reactExports.startTransition(() => {
                invalidateEmployeeQueries();
              });
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "First Name",
                autoFocus: true,
                value: formData.firstName,
                onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
                required: true,
                disabled: isEditing
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Last Name",
                value: formData.lastName,
                onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
                required: true,
                disabled: isEditing
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Email",
              type: "email",
              value: formData.email,
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              required: true,
              disabled: isEditing
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Username",
                value: formData.username,
                onChange: (e) => setFormData({ ...formData, username: e.target.value }),
                required: true,
                disabled: isEditing
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: isEditing ? "New Password" : "Password",
                placeholder: isEditing ? "Leave blank to keep existing" : "password123",
                type: showPassword ? "text" : "password",
                value: formData.password,
                onChange: (e) => setFormData({ ...formData, password: e.target.value }),
                required: !isEditing,
                disabled: isEditing,
                helperText: isEditing ? "Leave blank to keep current password" : "Required. Default password applies if not specified.",
                InputProps: {
                  endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      "aria-label": "toggle password visibility",
                      onClick: () => setShowPassword(!showPassword),
                      edge: "end",
                      size: "small",
                      children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                    }
                  ) })
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Position",
                value: formData.position,
                onChange: (e) => setFormData({ ...formData, position: e.target.value }),
                required: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Hourly Rate (₱)",
                type: "number",
                value: formData.hourlyRate,
                onChange: (e) => setFormData({ ...formData, hourlyRate: e.target.value }),
                inputProps: { step: "any", min: "0" },
                required: true
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.role,
                  label: "Role",
                  onChange: (e) => setFormData({ ...formData, role: e.target.value }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "employee", children: "Employee" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "manager", children: "Manager" })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Branch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: formData.branchId,
                  label: "Branch",
                  onChange: (e) => setFormData({ ...formData, branchId: e.target.value }),
                  required: true,
                  children: branchesData.map((branch) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: branch.id, children: branch.name }, branch.id))
                }
              )
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: formData.isActive,
                    onChange: (e) => setFormData({ ...formData, isActive: e.target.checked })
                  }
                ),
                label: "Active Employee"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: formData.isMwe,
                    onChange: (e) => setFormData({ ...formData, isMwe: e.target.checked }),
                    color: "secondary"
                  }
                ),
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  "MWE Exemption",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: "Tax exempt for Minimum Wage Earners" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { textTransform: "uppercase", letterSpacing: 0.5 }, children: "Government & Statutory IDs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "TIN",
                value: formData.tin,
                onChange: (e) => setFormData({ ...formData, tin: e.target.value }),
                placeholder: "XXX-XXX-XXX-000"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "SSS Number",
                value: formData.sssNumber,
                onChange: (e) => setFormData({ ...formData, sssNumber: e.target.value }),
                placeholder: "XX-XXXXXXX-X"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "PhilHealth",
                value: formData.philhealthNumber,
                onChange: (e) => setFormData({ ...formData, philhealthNumber: e.target.value }),
                placeholder: "XX-XXXXXXXXX-X"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Pag-IBIG/HDMF",
                value: formData.pagibigNumber,
                onChange: (e) => setFormData({ ...formData, pagibigNumber: e.target.value }),
                placeholder: "XXXX-XXXX-XXXX"
              }
            ) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCloseFormDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "submit",
            variant: "contained",
            disabled: createEmployee.isPending || updateEmployee.isPending,
            startIcon: createEmployee.isPending || updateEmployee.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
            children: [
              isEditing ? "Update" : "Add",
              " Employee"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: viewDialogOpen, onClose: () => setViewDialogOpen(false), maxWidth: "md", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "span", children: "Employee Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setViewDialogOpen(false), size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { dividers: true, sx: { p: 0 }, children: currentEmployee && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", height: "600px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3, bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Avatar,
            {
              src: currentEmployee.photoUrl,
              sx: {
                width: 80,
                height: 80,
                bgcolor: currentEmployee.role === "manager" ? "primary.main" : "success.main",
                fontSize: "1.5rem",
                border: 4,
                borderColor: "background.paper",
                boxShadow: 2
              },
              children: [
                !currentEmployee.photoUrl && currentEmployee.firstName?.charAt(0),
                !currentEmployee.photoUrl && currentEmployee.lastName?.charAt(0)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 700 }, children: [
              currentEmployee.firstName,
              " ",
              currentEmployee.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", gutterBottom: true, children: currentEmployee.position }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: currentEmployee.role, color: getRoleColor(currentEmployee.role) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  size: "small",
                  label: currentEmployee.isActive ? "Active" : "Inactive",
                  color: currentEmployee.isActive ? "success" : "error",
                  variant: "outlined"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, display: "flex" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Tabs,
            {
              orientation: "vertical",
              variant: "scrollable",
              value: 0,
              sx: { borderRight: 1, borderColor: "divider", minWidth: 160 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}), label: "Personal Info", iconPosition: "start", sx: { justifyContent: "flex-start", minHeight: 48 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkIcon, {}), label: "Documents", iconPosition: "start", sx: { justifyContent: "flex-start", minHeight: 48 }, onClick: () => {
                } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, overflow: "auto", p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 4, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Contract Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.email })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Username" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.username })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Branch" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: getBranchName(currentEmployee.branchId) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Hourly Rate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 600, color: "primary.main" }, children: [
                    "₱",
                    parseFloat(currentEmployee.hourlyRate).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
                    "/hr"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Joined" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: format(new Date(currentEmployee.createdAt), "MMMM d, yyyy") })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Government & Statutory IDs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "TIN (Tax Identification Number)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.tin || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#999" }, children: "Not provided" }) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "SSS Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.sssNumber || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#999" }, children: "Not provided" }) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "PhilHealth Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.philhealthNumber || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#999" }, children: "Not provided" }) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Pag-IBIG / HDMF Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: currentEmployee.pagibigNumber || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#999" }, children: "Not provided" }) })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Documents" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DocumentUpload,
                {
                  employeeId: currentEmployee.id,
                  documents: documentsResponse || [],
                  onUploadComplete: () => refetchDocuments(),
                  onDocumentRemove: () => refetchDocuments()
                }
              )
            ] })
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2, borderTop: 1, borderColor: "divider" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewDialogOpen(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
            onClick: () => {
              setViewDialogOpen(false);
              handleOpenEditDialog(currentEmployee);
            },
            children: "Edit Employee"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeletionOptionsModal,
      {
        open: deletionModalOpen,
        employee: currentEmployee,
        relatedData: employeeRelatedData,
        isAdmin: userIsAdmin,
        onClose: () => {
          setDeletionModalOpen(false);
          setCurrentEmployee(null);
          setEmployeeRelatedData(null);
        },
        onDeactivate: () => {
          if (currentEmployee) {
            toggleEmployeeStatus.mutate({ id: currentEmployee.id, isActive: false });
          }
        },
        onForceDelete: (reason) => {
          if (currentEmployee) {
            deleteEmployee.mutate({ id: currentEmployee.id, force: true });
          }
        },
        onExportData: () => {
          if (currentEmployee) {
            exportEmployeeData(currentEmployee.id);
          }
        },
        isLoading: deleteEmployee.isPending || toggleEmployeeStatus.isPending
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deductionsDialogOpen, onClose: () => setDeductionsDialogOpen(false), maxWidth: "sm", fullWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleDeductionsSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { pb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "span", sx: { display: "block" }, children: "Employee Deductions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            currentEmployee?.firstName,
            " ",
            currentEmployee?.lastName
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dividers: true, sx: { p: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2.5, bgcolor: alpha(theme.palette.info.main, 0.04) }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { color: "success.main", fontSize: 20 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 600, color: "success.main", children: "Mandatory Deductions (Auto-Applied)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2, py: 0.5 }, icon: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: "These are automatically calculated based on 2025 Philippine government rates. Values shown are estimates based on hourly rate × 176 hrs/month." }) }),
          (() => {
            const hourlyRate = parseFloat(currentEmployee?.hourlyRate || "0");
            const estimatedMonthly = hourlyRate * 176;
            const msc = Math.min(Math.max(estimatedMonthly, 5e3), 35e3);
            const sss = msc * 0.05;
            const philBase = Math.min(Math.max(estimatedMonthly, 1e4), 1e5);
            const philHealth = philBase * 0.025;
            const pagibig = Math.min(estimatedMonthly * 0.02, 200);
            const annualEstimate = estimatedMonthly * 12;
            const tax = annualEstimate <= 25e4 ? 0 : (annualEstimate - 25e4) * 0.15 / 12;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 1.5, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityIcon, { sx: { fontSize: 18, color: "#3b82f6" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "SSS (5%)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                  "₱",
                  sss.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HealthIcon, { sx: { fontSize: 18, color: "#10b981" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "PhilHealth (2.5%)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                  "₱",
                  philHealth.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HomeIcon, { sx: { fontSize: 18, color: "#8b5cf6" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Pag-IBIG (2%)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                  "₱",
                  pagibig.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TaxIcon, { sx: { fontSize: 18, color: "#f59e0b" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Withholding Tax" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
                  "₱",
                  tax.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Est. Monthly Salary:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                  "₱",
                  estimatedMonthly.toLocaleString()
                ] })
              ] })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { sx: { color: "primary.main", fontSize: 20 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 600, color: "primary.main", children: "Additional Deductions (Editable)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2, py: 0.5 }, icon: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: "These are manually managed per-period deductions (e.g. cash advances, penalties). Government loan deductions are managed via the Requests Hub above." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.04) }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityIcon, { sx: { fontSize: 18, color: "warning.main" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 600, color: "warning.main", children: "Government Loan Deductions" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "From Approved Loans", size: "small", variant: "outlined", color: "info", sx: { height: 22, fontSize: "0.65rem" } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 1.5, py: 0.5 }, icon: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
                "Loan deductions are automatically sourced from approved loan records. To add or change a loan, use ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Employee Requests → Loans" }),
                " tab."
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveLoansDisplay, { employeeId: currentEmployee?.id })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Cash Advance Deduction",
                type: "number",
                size: "small",
                value: deductionsFormData.cashAdvanceDeduction,
                onChange: (e) => setDeductionsFormData({ ...deductionsFormData, cashAdvanceDeduction: e.target.value }),
                inputProps: { min: 0, step: 0.01 },
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { mr: 1, color: "text.secondary" }, children: "₱" })
                },
                helperText: "Per pay period"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Other Recurring Deductions",
                type: "number",
                size: "small",
                value: deductionsFormData.otherDeductions,
                onChange: (e) => setDeductionsFormData({ ...deductionsFormData, otherDeductions: e.target.value }),
                inputProps: { min: 0, step: 0.01 },
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { mr: 1, color: "text.secondary" }, children: "₱" })
                },
                helperText: "Per pay period (e.g., uniform, penalties)"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.5) }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDeductionsDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            variant: "contained",
            disabled: updateDeductions.isPending,
            startIcon: updateDeductions.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
            children: "Save Changes"
          }
        )
      ] })
    ] }) })
  ] }) });
}

export { MuiEmployees as default };
