
import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProfilePhotoUpload } from "@/components/employees/ProfilePhotoUpload";
import { useToast } from "@/hooks/use-toast";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Chip,
  Container,
  useTheme,
  alpha,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Save as SaveIcon,
  PersonOutline as PersonIcon,
  LockOutlined as SecurityIcon,
  BadgeOutlined as BadgeIcon,
  EmailOutlined as EmailIcon,
  CakeOutlined as DateIcon,
  LogoutOutlined as LogoutIcon,
} from "@mui/icons-material";

// No more static ProfileBackground to prevent overflow and clashes with the layout theme.

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ p: 0, height: '100%' }}>{children}</Box>}
    </div>
  );
}

export default function MuiProfileSettings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // Form States — always default to empty string to keep inputs controlled
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Government IDs
  const [tin, setTin] = useState(user?.tin ?? "");
  const [sssNumber, setSssNumber] = useState(user?.sssNumber ?? "");
  const [philhealthNumber, setPhilhealthNumber] = useState(user?.philhealthNumber ?? "");
  const [pagibigNumber, setPagibigNumber] = useState(user?.pagibigNumber ?? "");

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile");
      }
      return json;
    },
    onSuccess: (data) => {
      import("react").then(({ startTransition }) => {
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
          if (refreshUser && typeof refreshUser === 'function') refreshUser();
        });
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Normalize helper: treat null/undefined/"" as equivalent for comparison
  const norm = (v: string | null | undefined) => v || "";
  const hasGeneralChanges = norm(email) !== norm(user?.email) || 
    norm(firstName) !== norm(user?.firstName) || 
    norm(lastName) !== norm(user?.lastName) ||
    norm(tin) !== norm(user?.tin) ||
    norm(sssNumber) !== norm(user?.sssNumber) ||
    norm(philhealthNumber) !== norm(user?.philhealthNumber) ||
    norm(pagibigNumber) !== norm(user?.pagibigNumber);

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
      pagibigNumber: pagibigNumber.trim(),
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

  if (!user) return <Box p={3}>Loading...</Box>;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100%', position: 'relative' }}>
      <Container maxWidth={false} sx={{ pt: { xs: 2, md: 4 }, pb: 8, px: { xs: 2, md: 4, xl: 6 }, position: 'relative', zIndex: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: "text.primary" }}>
            Account Settings
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 400, color: "text.secondary" }}>
            Manage your profile, security, and preferences.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          
          {/* Left Column: User Profile Card */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, md: 3 }, 
                borderRadius: 4, 
                height: 'auto',
                textAlign: 'center',
                boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.1)}, 0 2px 4px -1px ${alpha(theme.palette.common.black, 0.06)}`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <ProfilePhotoUpload
                    employeeId={user.id}
                    employeeName={fullName}
                    currentPhotoId={user.photoPublicId ?? undefined}
                    currentPhotoUrl={user.photoUrl ?? undefined}
                    size="lg"
                    onUploadComplete={() => {
                      import("react").then(({ startTransition }) => {
                        startTransition(() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                          if (refreshUser) refreshUser();
                        });
                      });
                    }}
                  />
                </Box>
                
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                  {fullName}
                </Typography>
                
                <Chip 
                  label={user.role || 'Employee'} 
                  size="small" 
                  color="primary"
                  sx={{ 
                    mt: 1, 
                    mb: 3, 
                    px: 1,
                    py: 0.5,
                    textTransform: 'uppercase', 
                    fontWeight: 700, 
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    borderRadius: 2,
                  }} 
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                  {user.position || 'No Position Title'}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ px: 1, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <BadgeIcon sx={{ fontSize: 20, mr: 2, opacity: 0.7 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, lineHeight: 1.2 }}>USER ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary', mt: 0.5 }} noWrap>
                            {user.username || `#${user.id}`}
                        </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <DateIcon sx={{ fontSize: 20, mr: 2, opacity: 0.7 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, lineHeight: 1.2 }}>JOINED DATE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                            {joinedDate}
                        </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Logout Button Card */}
            <Paper 
              elevation={0}
              sx={{ 
                mt: 3,
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                textAlign: 'center',
                boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.1)}, 0 2px 4px -1px ${alpha(theme.palette.common.black, 0.06)}`,
                border: '1px solid',
                borderColor: 'error.light',
                bgcolor: alpha(theme.palette.error.main, 0.02)
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  try {
                    const { logout } = await import("@/lib/auth");
                    await logout();
                    // Replace so the user can't press back to a protected page
                    window.location.replace("/login");
                  } catch (err) {
                    console.error("Logout failed", err);
                    window.location.replace("/login");
                  }
                }}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 700,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Log Out
              </Button>
            </Paper>
          </Grid>

          {/* Right Column: Settings Tabs */}
          <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                boxShadow: `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.1)}`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                minHeight: 'auto'
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile settings tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: { xs: 1, sm: 3 },
                  bgcolor: 'background.paper',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: 64,
                    mr: { xs: 0, sm: 2 }
                  }
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label="General" />
                <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
              </Tabs>

              {/* General Tab */}
              <CustomTabPanel value={tabValue} index={0}>
                <Box sx={{ p: { xs: 2, sm: 4 } }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>Personal Information</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Update your basic profile details here.
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
                          sx: { borderRadius: 2 } 
                        }}
                        helperText="Used for notifications and login"
                      />
                    </Grid>
                    
                    <Grid size={12} sx={{ mt: 2 }}>
                      <Divider />
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mt: 1 }}>Government & Statutory IDs</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        These IDs are required for official payslips and compliance.
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="TIN (Tax Identification Number)"
                        value={tin}
                        onChange={(e) => setTin(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                        placeholder="XXX-XXX-XXX-000"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="SSS Number"
                        value={sssNumber}
                        onChange={(e) => setSssNumber(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                        placeholder="XX-XXXXXXX-X"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="PhilHealth Number"
                        value={philhealthNumber}
                        onChange={(e) => setPhilhealthNumber(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                        placeholder="XX-XXXXXXXXX-X"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Pag-IBIG/HDMF Number"
                        value={pagibigNumber}
                        onChange={(e) => setPagibigNumber(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                        placeholder="XXXX-XXXX-XXXX"
                      />
                    </Grid>
                    
                    <Grid size={12} sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateGeneral}
                        disabled={updateProfileMutation.isPending || !hasGeneralChanges}
                        sx={{ 
                          borderRadius: 2, 
                          px: 4, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          boxShadow: 'none',
                          ':hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'text.disabled',
                          },
                        }}
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CustomTabPanel>

              {/* Security Tab */}
              <CustomTabPanel value={tabValue} index={1}>
                <Box sx={{ p: { xs: 2, sm: 4 } }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>Password & Security</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Manage your password to keep your account safe.
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                    Password must be at least 6 characters long and include a mix of letters and numbers.
                  </Alert>
                  
                  <Grid container spacing={3} sx={{ maxWidth: 600 }}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "action.active" }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "action.active" }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "action.active" }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                      />
                    </Grid>
                    
                    <Grid size={12} sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdatePassword}
                        disabled={updateProfileMutation.isPending || !currentPassword || !newPassword}
                        sx={{ 
                          borderRadius: 2, 
                          px: 4, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          boxShadow: 'none',
                          ':hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'text.disabled',
                          },
                        }}
                      >
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CustomTabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
