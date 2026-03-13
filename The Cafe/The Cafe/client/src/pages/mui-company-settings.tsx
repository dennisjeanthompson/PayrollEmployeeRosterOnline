import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  MenuItem,
  Avatar,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary, validateImageFile, FOLDERS, UPLOAD_PRESETS } from "@/lib/cloudinary";

interface CompanySettings {
  id: string;
  name: string;
  tradeName: string | null;
  address: string;
  city: string | null;
  province: string | null;
  zipCode: string | null;
  country: string | null;
  tin: string;
  sssEmployerNo: string | null;
  philhealthNo: string | null;
  pagibigNo: string | null;
  birRdo: string | null;
  secRegistration: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  industry: string | null;
  payrollFrequency: string | null;
  paymentMethod: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNo: string | null;
  isActive: boolean;
  updatedAt: string | null;
  createdAt: string | null;
}

const PROVINCES_PH = [
  "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique",
  "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet",
  "Biliran", "Bohol", "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte",
  "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite", "Cebu",
  "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur",
  "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar",
  "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela",
  "Kalinga", "La Union", "Laguna", "Lanao del Norte", "Lanao del Sur", "Leyte",
  "Maguindanao del Norte", "Maguindanao del Sur", "Marinduque", "Masbate",
  "Metro Manila", "Misamis Occidental", "Misamis Oriental", "Mountain Province",
  "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija",
  "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro", "Palawan",
  "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Samar",
  "Sarangani", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte",
  "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac",
  "Tawi-Tawi", "Zambales", "Zamboanga del Norte", "Zamboanga del Sur",
  "Zamboanga Sibugay",
];

const INDUSTRIES = [
  "Food & Beverage", "Retail", "Manufacturing", "Healthcare", "Education",
  "Construction", "Agriculture", "IT & BPO", "Financial Services",
  "Real Estate", "Transportation", "Hospitality", "Other",
];

const PAYROLL_FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly (Every 2 Weeks)" },
  { value: "semi-monthly", label: "Semi-monthly (15th & 30th)" },
  { value: "monthly", label: "Monthly" },
];

const PAYMENT_METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Check", label: "Check" },
  { value: "GCash", label: "GCash" },
  { value: "PayMaya", label: "Maya (PayMaya)" },
];

const BANKS_PH = [
  "BDO Unibank", "BPI (Bank of the Philippine Islands)", "Metrobank",
  "Land Bank of the Philippines", "PNB (Philippine National Bank)",
  "Security Bank", "China Banking Corporation", "UnionBank",
  "RCBC (Rizal Commercial Banking Corporation)", "EastWest Bank",
  "Philippine Savings Bank", "DBP (Development Bank of the Philippines)",
  "Asia United Bank", "Robinsons Bank", "UCPB", "Other",
];

const BANK_NAME_ALIASES: Record<string, string> = {
  BPI: "BPI (Bank of the Philippine Islands)",
  BDO: "BDO Unibank",
  PNB: "PNB (Philippine National Bank)",
  LBP: "Land Bank of the Philippines",
  LAND_BANK: "Land Bank of the Philippines",
  DBP: "DBP (Development Bank of the Philippines)",
  PSBANK: "Philippine Savings Bank",
};

const normalizeBankName = (bankName: string | null | undefined): string => {
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
};

export default function MuiCompanySettings() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Fetch company settings (full/unmasked for managers)
  const { data, isLoading, error } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-settings/full");
      const json = await res.json();
      return json.settings as CompanySettings | null;
    },
  });

  useEffect(() => {
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
      });
    } else if (!isLoading && !data) {
      setIsEditing(true); // Auto-open edit mode for first-time setup
    }
  }, [data, isLoading]);

  // Create
  const createMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await apiRequest("POST", "/api/company-settings", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      setIsEditing(false);
      toast({ title: "Company settings saved", description: "Your company profile has been created." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to save settings", variant: "destructive" });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await apiRequest("PUT", `/api/company-settings/${data!.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      setIsEditing(false);
      toast({ title: "Company settings updated", description: "Changes saved successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim() || !form.tin.trim()) {
      toast({ title: "Required fields", description: "Company name, address, and TIN are required.", variant: "destructive" });
      return;
    }
    const normalizedForm = {
      ...form,
      bankName: normalizeBankName(form.bankName),
    };

    if (data) {
      updateMutation.mutate(normalizedForm);
    } else {
      createMutation.mutate(normalizedForm);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast({
        title: "Invalid image",
        description: validation.error || "Please select a valid logo image.",
        variant: "destructive",
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
        cloudName: sigData.cloudName,
      });

      setForm((prev) => ({
        ...prev,
        logoUrl: result.secureUrl,
        logoPublicId: result.publicId,
      }));

      toast({ title: "Logo uploaded", description: "Click Save Changes to apply this logo." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload company logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load company settings. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 56, height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <BusinessIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Company Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data ? "Manage your company profile, compliance IDs, and payroll configuration" : "Set up your company profile for payslips and compliance"}
            </Typography>
          </Box>
        </Stack>
        {!isEditing && data && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Settings
          </Button>
        )}
      </Stack>

      {!data && !isEditing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No company settings found. Please configure your company profile to generate payslips.
        </Alert>
      )}

      {/* Company Identity */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Company Identity</Typography>
            {data && <Chip label="Required" size="small" color="primary" variant="outlined" />}
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="Registered Company Name *" value={form.name}
                onChange={handleChange("name")} disabled={!isEditing}
                helperText="As registered with SEC/DTI"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="Trade Name / DBA" value={form.tradeName}
                onChange={handleChange("tradeName")} disabled={!isEditing}
                helperText="Name shown on payslips (if different)"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth select label="Industry" value={form.industry}
                onChange={handleChange("industry")} disabled={!isEditing}
              >
                {INDUSTRIES.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="SEC/DTI Registration No." value={form.secRegistration}
                onChange={handleChange("secRegistration")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth label="Logo URL" value={form.logoUrl}
                onChange={handleChange("logoUrl")} disabled={!isEditing}
                helperText="Upload to Cloudinary or enter image URL"
                slotProps={{ input: { startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              />
              {isEditing && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                  </Button>
                  {form.logoUrl && (
                    <Button
                      size="small"
                      variant="text"
                      color="inherit"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: "", logoPublicId: "" }))}
                    >
                      Clear Logo
                    </Button>
                  )}
                </Stack>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
                disabled={!isEditing || isUploadingLogo}
              />
            </Grid>
            {form.logoUrl && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{
                  width: 120, height: 120, border: '1px solid', borderColor: 'divider',
                  borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', bgcolor: 'background.paper',
                }}>
                  <img
                    src={form.logoUrl} alt="Logo preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Address */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LocationIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Business Address</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth label="Street Address *" value={form.address}
                onChange={handleChange("address")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="City / Municipality" value={form.city}
                onChange={handleChange("city")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth select label="Province" value={form.province}
                onChange={handleChange("province")} disabled={!isEditing}
              >
                <MenuItem value="">— Select —</MenuItem>
                {PROVINCES_PH.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth label="ZIP Code" value={form.zipCode}
                onChange={handleChange("zipCode")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth label="Country" value={form.country}
                onChange={handleChange("country")} disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PhoneIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Contact Information</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="Phone" value={form.phone}
                onChange={handleChange("phone")} disabled={!isEditing}
                slotProps={{ input: { startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="Email" value={form.email}
                onChange={handleChange("email")} disabled={!isEditing}
                slotProps={{ input: { startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="Website" value={form.website}
                onChange={handleChange("website")} disabled={!isEditing}
                slotProps={{ input: { startAdornment: <WebIcon sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Government / Compliance IDs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <BadgeIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Government & Compliance IDs</Typography>
            <Chip label="Philippines" size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Required for BIR filings, SSS, PhilHealth, and Pag-IBIG remittances under Philippine labor law.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="TIN (Tax Identification Number) *" value={form.tin}
                onChange={handleChange("tin")} disabled={!isEditing}
                placeholder="XXX-XXX-XXX-XXX"
                helperText="BIR-issued TIN"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="BIR RDO Code" value={form.birRdo}
                onChange={handleChange("birRdo")} disabled={!isEditing}
                helperText="Revenue District Office code"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="SSS Employer Number" value={form.sssEmployerNo}
                onChange={handleChange("sssEmployerNo")} disabled={!isEditing}
                placeholder="XX-XXXXXXX-X"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="PhilHealth Employer Number" value={form.philhealthNo}
                onChange={handleChange("philhealthNo")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth label="Pag-IBIG Employer Number" value={form.pagibigNo}
                onChange={handleChange("pagibigNo")} disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payroll & Banking */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <BankIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Payroll & Banking</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth select label="Payroll Frequency" value={form.payrollFrequency}
                onChange={handleChange("payrollFrequency")} disabled={!isEditing}
              >
                {PAYROLL_FREQUENCIES.map(f => (
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth select label="Default Payment Method" value={form.paymentMethod}
                onChange={handleChange("paymentMethod")} disabled={!isEditing}
              >
                {PAYMENT_METHODS.map(m => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth select label="Bank" value={form.bankName}
                onChange={handleChange("bankName")} disabled={!isEditing}
              >
                <MenuItem value="">— Select —</MenuItem>
                {BANKS_PH.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="Bank Account Name" value={form.bankAccountName}
                onChange={handleChange("bankAccountName")} disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="Bank Account Number" value={form.bankAccountNo}
                onChange={handleChange("bankAccountNo")} disabled={!isEditing}
                helperText="Stored securely. Masked on payslips."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
          {data && (
            <Button
              variant="outlined" color="inherit"
              onClick={() => {
                setIsEditing(false);
                // Reset form
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
                  });
                }
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained" startIcon={isSaving ? <CircularProgress size={18} /> : <SaveIcon />}
            onClick={handleSave} disabled={isSaving}
            size="large"
          >
            {data ? "Save Changes" : "Create Company Profile"}
          </Button>
        </Stack>
      )}

      {/* Last Updated Info */}
      {data?.updatedAt && !isEditing && (
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
            <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(data.updatedAt).toLocaleDateString("en-PH", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
