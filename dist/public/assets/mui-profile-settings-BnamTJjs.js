const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-v-EuVKxF.js","assets/vendor-Bi9pq-j3.css","assets/main-fla130dr.js","assets/main-B6bxn-dl.css"])))=>i.map(i=>d[i]);
import { r as reactExports, aG as useQueryClient, a as React, aH as useMutation, Q as jsxRuntimeExports, X as Box, a0 as useTheme, dh as Container, aj as Typography, br as Grid, b7 as Paper, ag as alpha, T as __vitePreload, am as Chip, bm as Divider, dv as BadgeIcon, dw as DateIcon, aK as Button, dx as LogoutIcon, c5 as Tabs, c6 as Tab, dy as PersonIcon, dz as SecurityIcon, bA as TextField, b_ as InputAdornment, dA as EmailIcon, c4 as SaveIcon, bE as Alert, af as IconButton, bX as VisibilityOff, bV as Visibility } from './vendor-v-EuVKxF.js';
import { u as useAuth, c as apiRequest } from './main-fla130dr.js';
import { P as ProfilePhotoUpload } from './ProfilePhotoUpload-BZ8BADFR.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';
import './button-CBOKXpNF.js';
import './cloudinary-CkNgNQjm.js';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      role: "tabpanel",
      hidden: value !== index,
      id: `profile-tabpanel-${index}`,
      "aria-labelledby": `profile-tab-${index}`,
      ...other,
      style: { height: "100%" },
      children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 0, height: "100%" }, children })
    }
  );
}
function MuiProfileSettings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [tabValue, setTabValue] = reactExports.useState(0);
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = reactExports.useState(user?.firstName ?? "");
  const [lastName, setLastName] = reactExports.useState(user?.lastName ?? "");
  const [email, setEmail] = reactExports.useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [tin, setTin] = reactExports.useState(user?.tin ?? "");
  const [sssNumber, setSssNumber] = reactExports.useState(user?.sssNumber ?? "");
  const [philhealthNumber, setPhilhealthNumber] = reactExports.useState(user?.philhealthNumber ?? "");
  const [pagibigNumber, setPagibigNumber] = reactExports.useState(user?.pagibigNumber ?? "");
  React.useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setTin(user.tin ?? "");
      setSssNumber(user.sssNumber ?? "");
      setPhilhealthNumber(user.philhealthNumber ?? "");
      setPagibigNumber(user.pagibigNumber ?? "");
    }
  }, [user]);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile");
      }
      return json;
    },
    onSuccess: (data) => {
      __vitePreload(async () => { const {startTransition} = await import('./vendor-v-EuVKxF.js').then(n => n.R);return { startTransition }},true              ?__vite__mapDeps([0,1]):void 0).then(({ startTransition }) => {
        startTransition(() => {
          toast({ title: "Profile Updated", description: data.message });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          if (data.user) {
            setTin(data.user.tin ?? "");
            setSssNumber(data.user.sssNumber ?? "");
            setPhilhealthNumber(data.user.philhealthNumber ?? "");
            setPagibigNumber(data.user.pagibigNumber ?? "");
          }
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          if (refreshUser && typeof refreshUser === "function") refreshUser();
        });
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const norm = (v) => v || "";
  const hasGeneralChanges = norm(email) !== norm(user?.email) || norm(firstName) !== norm(user?.firstName) || norm(lastName) !== norm(user?.lastName) || norm(tin) !== norm(user?.tin) || norm(sssNumber) !== norm(user?.sssNumber) || norm(philhealthNumber) !== norm(user?.philhealthNumber) || norm(pagibigNumber) !== norm(user?.pagibigNumber);
  const handleUpdateGeneral = () => {
    if (!email.trim()) {
      toast({ title: "Error", description: "Email address is required", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      tin: tin.trim(),
      sssNumber: sssNumber.trim(),
      philhealthNumber: philhealthNumber.trim(),
      pagibigNumber: pagibigNumber.trim()
    });
  };
  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (!currentPassword) {
      toast({ title: "Error", description: "Current password is required", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate({ password: currentPassword, newPassword });
  };
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { p: 3, children: "Loading..." });
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(void 0, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "N/A";
  const theme = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100%", position: "relative" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: false, sx: { pt: { xs: 2, md: 4 }, pb: 8, px: { xs: 2, md: 4, xl: 6 }, position: "relative", zIndex: 10 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 1, letterSpacing: "-0.02em", color: "text.primary" }, children: "Account Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 400, color: "text.secondary" }, children: "Manage your profile, security, and preferences." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: { xs: 12, md: 4, lg: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Paper,
          {
            elevation: 0,
            sx: {
              p: { xs: 3, md: 3 },
              borderRadius: 4,
              height: "auto",
              textAlign: "center",
              boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.1)}, 0 2px 4px -1px ${alpha(theme.palette.common.black, 0.06)}`,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3, display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ProfilePhotoUpload,
                {
                  employeeId: user.id,
                  employeeName: fullName,
                  currentPhotoId: user.photoPublicId ?? void 0,
                  currentPhotoUrl: user.photoUrl ?? void 0,
                  size: "lg",
                  onUploadComplete: () => {
                    __vitePreload(async () => { const {startTransition} = await import('./vendor-v-EuVKxF.js').then(n => n.R);return { startTransition }},true              ?__vite__mapDeps([0,1]):void 0).then(({ startTransition }) => {
                      startTransition(() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                        if (refreshUser) refreshUser();
                      });
                    });
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 800, sx: { color: "text.primary", mb: 0.5 }, children: fullName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: user.role || "Employee",
                  size: "small",
                  color: "primary",
                  sx: {
                    mt: 1,
                    mb: 3,
                    px: 1,
                    py: 0.5,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    borderRadius: 2
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3, fontStyle: "italic" }, children: user.position || "No Position Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 1, textAlign: "left" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2, color: "text.secondary" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeIcon, { sx: { fontSize: 20, mr: 2, opacity: 0.7 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minWidth: 0, flex: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", display: "block", sx: { fontWeight: 700, lineHeight: 1.2 }, children: "USER ID" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontFamily: "monospace", fontWeight: 600, color: "text.primary", mt: 0.5 }, noWrap: true, children: user.username || `#${user.id}` })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", color: "text.secondary" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DateIcon, { sx: { fontSize: 20, mr: 2, opacity: 0.7 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minWidth: 0, flex: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", display: "block", sx: { fontWeight: 700, lineHeight: 1.2 }, children: "JOINED DATE" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600, color: "text.primary", mt: 0.5 }, children: joinedDate })
                  ] })
                ] })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Paper,
          {
            elevation: 0,
            sx: {
              mt: 3,
              p: { xs: 2, md: 3 },
              borderRadius: 4,
              textAlign: "center",
              boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.1)}, 0 2px 4px -1px ${alpha(theme.palette.common.black, 0.06)}`,
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: alpha(theme.palette.error.main, 0.02)
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "outlined",
                color: "error",
                size: "large",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoutIcon, {}),
                onClick: async () => {
                  try {
                    const { logout } = await __vitePreload(async () => { const { logout } = await import('./main-fla130dr.js').then(n => n.l);return { logout }},true              ?__vite__mapDeps([2,0,1,3]):void 0);
                    await logout();
                    window.location.replace("/login");
                  } catch (err) {
                    window.location.replace("/login");
                  }
                },
                sx: {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 }
                },
                children: "Log Out"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, md: 8, lg: 8.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          elevation: 0,
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.1)}`,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            minHeight: "auto"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Tabs,
              {
                value: tabValue,
                onChange: handleTabChange,
                "aria-label": "profile settings tabs",
                variant: "scrollable",
                scrollButtons: "auto",
                sx: {
                  borderBottom: 1,
                  borderColor: "divider",
                  px: { xs: 1, sm: 3 },
                  bgcolor: "background.paper",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    minHeight: 64,
                    mr: { xs: 0, sm: 2 }
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}), iconPosition: "start", label: "General" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityIcon, {}), iconPosition: "start", label: "Security" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTabPanel, { value: tabValue, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, sm: 4 } }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, gutterBottom: true, sx: { color: "text.primary" }, children: "Personal Information" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Update your basic profile details here." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "First Name",
                    value: firstName,
                    onChange: (e) => setFirstName(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Last Name",
                    value: lastName,
                    onChange: (e) => setLastName(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Email Address",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    variant: "outlined",
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { color: "action" }) }),
                      sx: { borderRadius: 2 }
                    },
                    helperText: "Used for notifications and login"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: 12, sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { size: 12, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, sx: { color: "text.primary", mt: 1 }, children: "Government & Statutory IDs" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 2 }, children: "These IDs are required for official payslips and compliance." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "TIN (Tax Identification Number)",
                    value: tin,
                    onChange: (e) => setTin(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } },
                    placeholder: "XXX-XXX-XXX-000"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "SSS Number",
                    value: sssNumber,
                    onChange: (e) => setSssNumber(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } },
                    placeholder: "XX-XXXXXXX-X"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "PhilHealth Number",
                    value: philhealthNumber,
                    onChange: (e) => setPhilhealthNumber(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } },
                    placeholder: "XX-XXXXXXXXX-X"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Pag-IBIG/HDMF Number",
                    value: pagibigNumber,
                    onChange: (e) => setPagibigNumber(e.target.value),
                    variant: "outlined",
                    InputProps: { sx: { borderRadius: 2 } },
                    placeholder: "XXXX-XXXX-XXXX"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: 12, sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    size: "large",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
                    onClick: handleUpdateGeneral,
                    disabled: updateProfileMutation.isPending || !hasGeneralChanges,
                    sx: {
                      borderRadius: 2,
                      px: 4,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      ":hover": { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "text.disabled"
                      }
                    },
                    children: "Save Changes"
                  }
                ) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTabPanel, { value: tabValue, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, sm: 4 } }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, gutterBottom: true, sx: { color: "text.primary" }, children: "Password & Security" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Manage your password to keep your account safe." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 4, borderRadius: 2 }, children: "Password must be at least 6 characters long and include a mix of letters and numbers." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { maxWidth: 600 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    type: showPassword ? "text" : "password",
                    label: "Current Password",
                    value: currentPassword,
                    onChange: (e) => setCurrentPassword(e.target.value),
                    InputProps: {
                      sx: { borderRadius: 2 },
                      endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", sx: { color: "action.active" }, children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {}) }) })
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    type: showPassword ? "text" : "password",
                    label: "New Password",
                    value: newPassword,
                    onChange: (e) => setNewPassword(e.target.value),
                    InputProps: {
                      sx: { borderRadius: 2 },
                      endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", sx: { color: "action.active" }, children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {}) }) })
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: { xs: 12, sm: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    type: showPassword ? "text" : "password",
                    label: "Confirm New Password",
                    value: confirmPassword,
                    onChange: (e) => setConfirmPassword(e.target.value),
                    InputProps: {
                      sx: { borderRadius: 2 },
                      endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", sx: { color: "action.active" }, children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {}) }) })
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { size: 12, sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    size: "large",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
                    onClick: handleUpdatePassword,
                    disabled: updateProfileMutation.isPending || !currentPassword || !newPassword,
                    sx: {
                      borderRadius: 2,
                      px: 4,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      ":hover": { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "text.disabled"
                      }
                    },
                    children: "Update Password"
                  }
                ) })
              ] })
            ] }) })
          ]
        }
      ) })
    ] })
  ] }) });
}

export { MuiProfileSettings as default };
