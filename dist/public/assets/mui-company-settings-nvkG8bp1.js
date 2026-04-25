import { a0 as useTheme, aG as useQueryClient, r as reactExports, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, X as Box, aM as CircularProgress, bE as Alert, aJ as Stack, al as Avatar, ag as alpha, a9 as BusinessIcon, aj as Typography, aK as Button, bW as EditIcon, bt as Card, bu as CardContent, am as Chip, br as Grid, bA as TextField, b2 as MenuItem, dI as ImageIcon, b3 as LocationIcon, da as PhoneIcon, db as EmailIcon, dJ as WebIcon, dK as BadgeIcon, dL as BankIcon, bm as Divider, bH as FormControlLabel, c3 as Switch, c4 as SaveIcon, aU as CheckCircleIcon } from './vendor-v-EuVKxF.js';
import { c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import { a as validateImageFile, F as FOLDERS, u as uploadToCloudinary, U as UPLOAD_PRESETS } from './cloudinary-CkNgNQjm.js';

const PROVINCES_PH = [
  "Abra",
  "Agusan del Norte",
  "Agusan del Sur",
  "Aklan",
  "Albay",
  "Antique",
  "Apayao",
  "Aurora",
  "Basilan",
  "Bataan",
  "Batanes",
  "Batangas",
  "Benguet",
  "Biliran",
  "Bohol",
  "Bukidnon",
  "Bulacan",
  "Cagayan",
  "Camarines Norte",
  "Camarines Sur",
  "Camiguin",
  "Capiz",
  "Catanduanes",
  "Cavite",
  "Cebu",
  "Cotabato",
  "Davao de Oro",
  "Davao del Norte",
  "Davao del Sur",
  "Davao Occidental",
  "Davao Oriental",
  "Dinagat Islands",
  "Eastern Samar",
  "Guimaras",
  "Ifugao",
  "Ilocos Norte",
  "Ilocos Sur",
  "Iloilo",
  "Isabela",
  "Kalinga",
  "La Union",
  "Laguna",
  "Lanao del Norte",
  "Lanao del Sur",
  "Leyte",
  "Maguindanao del Norte",
  "Maguindanao del Sur",
  "Marinduque",
  "Masbate",
  "Metro Manila",
  "Misamis Occidental",
  "Misamis Oriental",
  "Mountain Province",
  "Negros Occidental",
  "Negros Oriental",
  "Northern Samar",
  "Nueva Ecija",
  "Nueva Vizcaya",
  "Occidental Mindoro",
  "Oriental Mindoro",
  "Palawan",
  "Pampanga",
  "Pangasinan",
  "Quezon",
  "Quirino",
  "Rizal",
  "Romblon",
  "Samar",
  "Sarangani",
  "Siquijor",
  "Sorsogon",
  "South Cotabato",
  "Southern Leyte",
  "Sultan Kudarat",
  "Sulu",
  "Surigao del Norte",
  "Surigao del Sur",
  "Tarlac",
  "Tawi-Tawi",
  "Zambales",
  "Zamboanga del Norte",
  "Zamboanga del Sur",
  "Zamboanga Sibugay"
];
const INDUSTRIES = [
  "Food & Beverage",
  "Retail",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Construction",
  "Agriculture",
  "IT & BPO",
  "Financial Services",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Other"
];
const PAYROLL_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly (Every 2 Weeks)" },
  { value: "semi-monthly", label: "Semi-monthly (15th & 30th)" },
  { value: "monthly", label: "Monthly" }
];
const PAYMENT_METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Check", label: "Check" },
  { value: "GCash", label: "GCash" },
  { value: "PayMaya", label: "Maya (PayMaya)" }
];
const BANKS_PH = [
  "BDO Unibank",
  "BPI (Bank of the Philippine Islands)",
  "Metrobank",
  "Land Bank of the Philippines",
  "PNB (Philippine National Bank)",
  "Security Bank",
  "China Banking Corporation",
  "UnionBank",
  "RCBC (Rizal Commercial Banking Corporation)",
  "EastWest Bank",
  "Philippine Savings Bank",
  "DBP (Development Bank of the Philippines)",
  "Asia United Bank",
  "Robinsons Bank",
  "UCPB",
  "Other"
];
const BANK_NAME_ALIASES = {
  BPI: "BPI (Bank of the Philippine Islands)",
  BDO: "BDO Unibank",
  PNB: "PNB (Philippine National Bank)",
  LBP: "Land Bank of the Philippines",
  LAND_BANK: "Land Bank of the Philippines",
  DBP: "DBP (Development Bank of the Philippines)",
  PSBANK: "Philippine Savings Bank"
};
const normalizeBankName = (bankName) => {
  if (!bankName) return "";
  if (BANKS_PH.includes(bankName)) return bankName;
  const compact = bankName.trim();
  const aliasFromRaw = BANK_NAME_ALIASES[compact];
  if (aliasFromRaw) return aliasFromRaw;
  const upperUnderscored = compact.toUpperCase().replace(/[\s-]+/g, "_");
  const aliasFromUpper = BANK_NAME_ALIASES[upperUnderscored];
  if (aliasFromUpper) return aliasFromUpper;
  return "Other";
};
const emptyForm = {
  name: "",
  tradeName: "",
  address: "",
  city: "",
  province: "",
  zipCode: "",
  country: "Philippines",
  tin: "",
  sssEmployerNo: "",
  philhealthNo: "",
  pagibigNo: "",
  birRdo: "",
  secRegistration: "",
  phone: "",
  email: "",
  website: "",
  logoUrl: "",
  logoPublicId: "",
  industry: "Food & Beverage",
  payrollFrequency: "semi-monthly",
  paymentMethod: "Bank Transfer",
  bankName: "",
  bankAccountName: "",
  bankAccountNo: "",
  includeHolidayPay: false
};
function MuiCompanySettings() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(emptyForm);
  const [isUploadingLogo, setIsUploadingLogo] = reactExports.useState(false);
  const logoInputRef = reactExports.useRef(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-settings/full");
      const json = await res.json();
      return json.settings;
    },
    staleTime: 10 * 60 * 1e3,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  reactExports.useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        tradeName: data.tradeName || "",
        address: data.address || "",
        city: data.city || "",
        province: data.province || "",
        zipCode: data.zipCode || "",
        country: data.country || "Philippines",
        tin: data.tin || "",
        sssEmployerNo: data.sssEmployerNo || "",
        philhealthNo: data.philhealthNo || "",
        pagibigNo: data.pagibigNo || "",
        birRdo: data.birRdo || "",
        secRegistration: data.secRegistration || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        logoUrl: data.logoUrl || "",
        logoPublicId: data.logoPublicId || "",
        industry: data.industry || "Food & Beverage",
        payrollFrequency: data.payrollFrequency || "semi-monthly",
        paymentMethod: data.paymentMethod || "Bank Transfer",
        bankName: normalizeBankName(data.bankName),
        bankAccountName: data.bankAccountName || "",
        bankAccountNo: data.bankAccountNo || "",
        includeHolidayPay: data.includeHolidayPay || false
      });
    } else if (!isLoading && !data) {
      setIsEditing(true);
    }
  }, [data, isLoading]);
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiRequest("POST", "/api/company-settings", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      setIsEditing(false);
      toast({ title: "Company settings saved", description: "Your company profile has been created." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "Failed to save settings", variant: "destructive" });
    }
  });
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiRequest("PUT", `/api/company-settings/${data.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      setIsEditing(false);
      toast({ title: "Company settings updated", description: "Changes saved successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "Failed to update settings", variant: "destructive" });
    }
  });
  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim() || !form.tin.trim()) {
      toast({ title: "Required fields", description: "Company name, address, and TIN are required.", variant: "destructive" });
      return;
    }
    const normalizedForm = {
      ...form,
      bankName: normalizeBankName(form.bankName)
    };
    if (data) {
      updateMutation.mutate(normalizedForm);
    } else {
      createMutation.mutate(normalizedForm);
    }
  };
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast({
        title: "Invalid image",
        description: validation.error || "Please select a valid logo image.",
        variant: "destructive"
      });
      return;
    }
    setIsUploadingLogo(true);
    try {
      const publicId = `company_logo_${Date.now()}`;
      const folder = FOLDERS.COMPANY_LOGOS;
      const sigRes = await apiRequest(
        "GET",
        `/api/employees/upload-signature?public_id=${encodeURIComponent(publicId)}&folder=${encodeURIComponent(folder)}`
      );
      const sigData = await sigRes.json();
      const result = await uploadToCloudinary({
        file,
        folder,
        publicId,
        uploadPreset: UPLOAD_PRESETS.COMPANY_LOGOS,
        signature: sigData.signature,
        timestamp: sigData.timestamp,
        apiKey: sigData.apiKey,
        cloudName: sigData.cloudName
      });
      setForm((prev) => ({
        ...prev,
        logoUrl: result.secureUrl,
        logoPublicId: result.publicId
      }));
      toast({ title: "Logo uploaded", description: "Click Save Changes to apply this logo." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload company logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { p: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", children: "Failed to load company settings. Please try again." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Avatar,
          {
            sx: {
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { sx: { fontSize: 32 } })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Company Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: data ? "Manage your company profile, compliance IDs, and payroll configuration" : "Set up your company profile for payslips and compliance" })
        ] })
      ] }),
      !isEditing && data && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
          onClick: () => setIsEditing(true),
          children: "Edit Settings"
        }
      )
    ] }),
    !data && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "No company settings found. Please configure your company profile to generate payslips." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Company Identity" }),
        data && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Required", size: "small", color: "primary", variant: "outlined" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Registered Company Name *",
            value: form.name,
            onChange: handleChange("name"),
            disabled: !isEditing,
            helperText: "As registered with SEC/DTI"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Trade Name / DBA",
            value: form.tradeName,
            onChange: handleChange("tradeName"),
            disabled: !isEditing,
            helperText: "Name shown on payslips (if different)"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            select: true,
            label: "Industry",
            value: form.industry,
            onChange: handleChange("industry"),
            disabled: !isEditing,
            children: INDUSTRIES.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: i, children: i }, i))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "SEC/DTI Registration No.",
            value: form.secRegistration,
            onChange: handleChange("secRegistration"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12, md: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Logo URL",
              value: form.logoUrl,
              onChange: handleChange("logoUrl"),
              disabled: !isEditing,
              helperText: "Upload to Cloudinary or enter image URL",
              slotProps: { input: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ImageIcon, { sx: { mr: 1, color: "text.secondary" } }) } }
            }
          ),
          isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "outlined",
                onClick: () => logoInputRef.current?.click(),
                disabled: isUploadingLogo,
                children: isUploadingLogo ? "Uploading..." : "Upload Logo"
              }
            ),
            form.logoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "text",
                color: "inherit",
                onClick: () => setForm((prev) => ({ ...prev, logoUrl: "", logoPublicId: "" })),
                children: "Clear Logo"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: logoInputRef,
              type: "file",
              accept: "image/png,image/jpeg,image/webp,image/gif",
              onChange: handleLogoUpload,
              style: { display: "none" },
              disabled: !isEditing || isUploadingLogo
            }
          )
        ] }),
        form.logoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
          width: 120,
          height: 120,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          bgcolor: "background.paper"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: form.logoUrl,
            alt: "Logo preview",
            style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
            onError: (e) => {
              e.target.style.display = "none";
            }
          }
        ) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Business Address" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Street Address *",
            value: form.address,
            onChange: handleChange("address"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "City / Municipality",
            value: form.city,
            onChange: handleChange("city"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            fullWidth: true,
            select: true,
            label: "Province",
            value: form.province,
            onChange: handleChange("province"),
            disabled: !isEditing,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "— Select —" }),
              PROVINCES_PH.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: p, children: p }, p))
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "ZIP Code",
            value: form.zipCode,
            onChange: handleChange("zipCode"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Country",
            value: form.country,
            onChange: handleChange("country"),
            disabled: !isEditing
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Contact Information" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Phone",
            value: form.phone,
            onChange: handleChange("phone"),
            disabled: !isEditing,
            slotProps: { input: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIcon, { sx: { mr: 1, color: "text.secondary" } }) } }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Email",
            value: form.email,
            onChange: handleChange("email"),
            disabled: !isEditing,
            slotProps: { input: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { mr: 1, color: "text.secondary" } }) } }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Website",
            value: form.website,
            onChange: handleChange("website"),
            disabled: !isEditing,
            slotProps: { input: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(WebIcon, { sx: { mr: 1, color: "text.secondary" } }) } }
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Government & Compliance IDs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Philippines", size: "small" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Required for BIR filings, SSS, PhilHealth, and Pag-IBIG remittances under Philippine labor law." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "TIN (Tax Identification Number) *",
            value: form.tin,
            onChange: handleChange("tin"),
            disabled: !isEditing,
            placeholder: "XXX-XXX-XXX-XXX",
            helperText: "BIR-issued TIN"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "BIR RDO Code",
            value: form.birRdo,
            onChange: handleChange("birRdo"),
            disabled: !isEditing,
            helperText: "Revenue District Office code"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "SSS Employer Number",
            value: form.sssEmployerNo,
            onChange: handleChange("sssEmployerNo"),
            disabled: !isEditing,
            placeholder: "XX-XXXXXXX-X"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "PhilHealth Employer Number",
            value: form.philhealthNo,
            onChange: handleChange("philhealthNo"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Pag-IBIG Employer Number",
            value: form.pagibigNo,
            onChange: handleChange("pagibigNo"),
            disabled: !isEditing
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BankIcon, { color: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Payroll & Banking" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            select: true,
            label: "Payroll Frequency",
            value: form.payrollFrequency,
            onChange: handleChange("payrollFrequency"),
            disabled: !isEditing,
            children: PAYROLL_FREQUENCIES.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: f.value, children: f.label }, f.value))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            select: true,
            label: "Default Payment Method",
            value: form.paymentMethod,
            onChange: handleChange("paymentMethod"),
            disabled: !isEditing,
            children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: m.value, children: m.label }, m.value))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TextField,
          {
            fullWidth: true,
            select: true,
            label: "Bank",
            value: form.bankName,
            onChange: handleChange("bankName"),
            disabled: !isEditing,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "— Select —" }),
              BANKS_PH.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: b, children: b }, b))
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Bank Account Name",
            value: form.bankAccountName,
            onChange: handleChange("bankAccountName"),
            disabled: !isEditing
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Bank Account Number",
            value: form.bankAccountNo,
            onChange: handleChange("bankAccountNo"),
            disabled: !isEditing,
            helperText: "Stored securely. Masked on payslips."
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Compliance Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: form.includeHolidayPay,
                  onChange: (e) => setForm((prev) => ({ ...prev, includeHolidayPay: e.target.checked })),
                  disabled: !isEditing,
                  color: "primary"
                }
              ),
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Include Holiday Pay in Payroll computations" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "When enabled, recognized holidays will automatically trigger 100% unworked pay or 260% worked overtime premiums per DOLE rules. (Retail/Service establishments with <10 workers may be exempt)." })
              ] })
            }
          )
        ] })
      ] })
    ] }) }),
    isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "flex-end", sx: { mb: 4 }, children: [
      data && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          color: "inherit",
          onClick: () => {
            setIsEditing(false);
            if (data) {
              setForm({
                name: data.name || "",
                tradeName: data.tradeName || "",
                address: data.address || "",
                city: data.city || "",
                province: data.province || "",
                zipCode: data.zipCode || "",
                country: data.country || "Philippines",
                tin: data.tin || "",
                sssEmployerNo: data.sssEmployerNo || "",
                philhealthNo: data.philhealthNo || "",
                pagibigNo: data.pagibigNo || "",
                birRdo: data.birRdo || "",
                secRegistration: data.secRegistration || "",
                phone: data.phone || "",
                email: data.email || "",
                website: data.website || "",
                logoUrl: data.logoUrl || "",
                logoPublicId: data.logoPublicId || "",
                industry: data.industry || "Food & Beverage",
                payrollFrequency: data.payrollFrequency || "semi-monthly",
                paymentMethod: data.paymentMethod || "Bank Transfer",
                bankName: normalizeBankName(data.bankName),
                bankAccountName: data.bankAccountName || "",
                bankAccountNo: data.bankAccountNo || "",
                includeHolidayPay: data.includeHolidayPay || false
              });
            }
          },
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
          onClick: handleSave,
          disabled: isSaving,
          size: "large",
          children: data ? "Save Changes" : "Create Company Profile"
        }
      )
    ] }),
    data?.updatedAt && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "right", mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "flex-end", spacing: 0.5, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16, color: "success.main" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
        "Last updated: ",
        new Date(data.updatedAt).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      ] })
    ] }) })
  ] });
}

export { MuiCompanySettings as default };
