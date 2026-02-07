
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
} from "@mui/icons-material";

// Header Background Element (Soft Gradient)
const ProfileBackground = () => (
  <Box 
    sx={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', 
      height: { xs: 120, md: 160 },
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 0,
    }}
  />
);

// ... (TabPanel interface and function remain same) ...

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

  // Form States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Profile Updated", description: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      if (refreshUser && typeof refreshUser === 'function') refreshUser();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleUpdateGeneral = () => updateProfileMutation.mutate({ firstName, lastName, email });

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', position: 'relative' }}>
      <ProfileBackground />
      
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 8, px: { xs: 2, md: 3 }, position: 'relative', zIndex: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Account Settings
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
            Manage your profile, security, and preferences.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          
          {/* Left Column: User Profile Card */}
          <Grid item xs={12} md={4} lg={3.5}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, md: 3 }, 
                borderRadius: 4, 
                height: 'auto',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                bgcolor: 'white'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <ProfilePhotoUpload
                    employeeId={user.id}
                    employeeName={fullName}
                    currentPhotoId={user.photoPublicId}
                    currentPhotoUrl={user.photoUrl}
                    size="lg"
                    onUploadComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                        if (refreshUser) refreshUser();
                    }}
                  />
                </Box>
                
                <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
                  {fullName}
                </Typography>
                
                <Chip 
                  label={user.role || 'Employee'} 
                  size="small" 
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
                    bgcolor: user.role === 'admin' ? '#eef2ff' : '#eff6ff',
                    color: user.role === 'admin' ? '#4f46e5' : '#0ea5e9'
                  }} 
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                  {user.position || 'No Position Title'}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ px: 1, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <BadgeIcon sx={{ fontSize: 20, mr: 2, opacity: 0.7, color: '#64748b' }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: '#94a3b8', lineHeight: 1.2 }}>USER ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569', mt: 0.5 }} noWrap>
                            {user.username || `#${user.id}`}
                        </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <DateIcon sx={{ fontSize: 20, mr: 2, opacity: 0.7, color: '#64748b' }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: '#94a3b8', lineHeight: 1.2 }}>JOINED DATE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mt: 0.5 }}>
                            {joinedDate}
                        </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Settings Tabs */}
          <Grid item xs={12} md={8} lg={8.5}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 4, 
                minHeight: 500,
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.5)',
                bgcolor: 'white',
                minHeight: 'auto'
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile settings tabs"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 3,
                  bgcolor: 'white',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: 64,
                    mr: 2
                  }
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label="General" />
                <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
              </Tabs>

              {/* General Tab */}
              <CustomTabPanel value={tabValue} index={0}>
                <Box sx={{ p: 4 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Personal Information</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your basic profile details here.
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                    
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateGeneral}
                        disabled={updateProfileMutation.isPending || (email === user.email && firstName === user.firstName && lastName === user.lastName)}
                        sx={{ 
                          borderRadius: 2, 
                          px: 4, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          boxShadow: 'none',
                          ':hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }
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
                <Box sx={{ p: 4 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Password & Security</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your password to keep your account safe.
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                    Password must be at least 6 characters long and include a mix of letters and numbers.
                  </Alert>
                  
                  <Grid container spacing={3} sx={{ maxWidth: 600 }}>
                    <Grid item xs={12}>
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
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ mt: 2 }}>
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
                          ':hover': { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }
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
