import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
import { getCurrentUser, setAuthState } from "@/lib/auth";
import { useLocation } from "wouter";
import MuiMobileHeader from "@/components/mui/mui-mobile-header";
import MuiMobileBottomNav from "@/components/mui/mui-mobile-bottom-nav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function MobileProfile() {
  const currentUser = getCurrentUser();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setAuthState({ user: null, isAuthenticated: false });
      setLocation("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-28">
      <MuiMobileHeader
        title="My Profile"
        subtitle="Manage your account"
        showBack={false}
        showMenu={false}
      />

      <motion.div 
        className="p-5 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center pt-4 pb-6">
            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-xl mb-4 relative overflow-hidden group">
                <span className="text-primary-foreground text-4xl font-bold">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </span>
                <div className="absolute inset-0 bg-black/10 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                    <User className="text-white w-8 h-8" />
                </div>
            </div>
            <h2 className="text-2xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h2>
            <p className="text-muted-foreground font-medium">{currentUser?.position}</p>
        </motion.div>

        {/* Info Cards */}
        <motion.div variants={itemVariants} className="space-y-4">
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="text-base font-medium truncate">{currentUser?.email || "No email set"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="text-base font-medium capitalize">{currentUser?.role || "Employee"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                             <Phone className="w-5 h-5" />
                        </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="text-base font-medium">{(currentUser as any)?.phone || "No phone set"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants}>
             <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-destructive/20"
                onClick={handleLogout}
            >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
            </Button>
        </motion.div>

      </motion.div>

      <MuiMobileBottomNav />
    </div>
  );
}
