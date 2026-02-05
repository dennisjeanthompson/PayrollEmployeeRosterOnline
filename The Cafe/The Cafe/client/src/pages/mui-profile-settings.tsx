
import React, { useState } from "react";
import { useAuth } from "@/lib/auth"; // Assuming useAuth exists or we use useContext
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProfilePhotoUpload } from "@/components/employees/ProfilePhotoUpload";
import { useToast } from "@/hooks/use-toast";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
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
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Save as SaveIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon
} from "@mui/icons-material";

// Custom TabPanel component
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
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MuiProfileSettings() {
  const { user, refreshUser } = useAuth(); // Assuming refreshUser exists to update local state
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // Form States
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
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
      toast({
        title: "Profile Updated",
        description: data.message,
      });
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Refresh user data if available in hook, or invalidate
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // If useAuth has a refresh method, call it
      if (refreshUser && typeof refreshUser === 'function') {
         refreshUser();
      }
    },
    onError: (error: any) => {
        toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
        });
    }
  });

  const handleUpdateGeneral = () => {
     updateProfileMutation.mutate({ email });
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!currentPassword) {
        toast({
            title: "Error",
            description: "Current password is required",
            variant: "destructive",
        });
        return;
    }
    updateProfileMutation.mutate({ password: currentPassword, newPassword });
  };

  if (!user) return <Box p={3}>Loading...</Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: User Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ProfilePhotoUpload
                    employeeId={user.id}
                    employeeName={`${user.firstName} ${user.lastName}`}
                    currentPhotoId={user.photoPublicId}
                    currentPhotoUrl={user.photoUrl}
                    size="lg"
                    onUploadComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                        if (refreshUser) refreshUser();
                    }}
                />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.position}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">Role</Typography>
                <Typography variant="body2" sx={{ mb: 1, textTransform: 'capitalize' }}>{user.role}</Typography>
                
                <Typography variant="caption" color="text.secondary">Joined</Typography>
                <Typography variant="body2">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Settings Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile settings tabs">
                <Tab icon={<PersonIcon />} iconPosition="start" label="General" />
                <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
                {/* <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documents" /> */} 
                {/* Re-enable Documents if we implement a view for self-docs specifically */}
              </Tabs>
            </Box>

            {/* General Tab */}
            <CustomTabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={user.firstName}
                    disabled
                    helperText="Contact admin to change"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={user.lastName}
                    disabled
                    helperText="Contact admin to change"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText="Used for notifications and login"
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateGeneral}
                    disabled={updateProfileMutation.isPending || email === user.email}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </CustomTabPanel>

            {/* Security Tab */}
            <CustomTabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Password must be at least 6 characters long.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    InputProps={{
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdatePassword}
                    disabled={updateProfileMutation.isPending || !currentPassword || !newPassword}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </CustomTabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
