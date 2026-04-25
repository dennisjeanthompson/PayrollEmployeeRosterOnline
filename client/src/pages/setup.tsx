import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Building2, UserCog, Phone, MapPin, Mail, User, Lock } from "lucide-react";

export default function Setup() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Branch data
  const [branchData, setBranchData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // Manager data
  const [managerData, setManagerData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    hourlyRate: "120.00",
  });

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Setup failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Setup Complete!",
        description: "Your café management system is ready. Redirecting to login...",
      });
      
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBranchNext = () => {
    if (!branchData.name || !branchData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required branch fields",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerData.username || !managerData.password || !managerData.firstName || 
        !managerData.lastName || !managerData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required manager fields",
        variant: "destructive",
      });
      return;
    }

    if (managerData.password !== managerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (managerData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    const rate = parseFloat(managerData.hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid hourly rate",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      branch: branchData,
      manager: {
        username: managerData.username,
        password: managerData.password,
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        hourlyRate: managerData.hourlyRate,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <Coffee className="h-12 w-12" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to The Cafe</CardTitle>
          <CardDescription className="text-lg">
            Set up your café payroll &amp; management system
          </CardDescription>
          <div className="flex justify-center gap-2 pt-4">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-xl font-semibold">
                  <Building2 className="h-5 w-5 text-primary" />
                  Step 1: Branch Information
                </div>
                <p className="text-sm text-muted-foreground mt-1">Tell us about your café location</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="branchName"
                    className="pl-10"
                    placeholder="e.g., Don Macchiatos — Main Branch"
                    value={branchData.name}
                    onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchAddress">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="branchAddress"
                    className="pl-10"
                    placeholder="e.g., 123 Rizal Ave., Brgy. Centro, La Union"
                    value={branchData.address}
                    onChange={(e) => setBranchData({ ...branchData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="branchPhone"
                    className="pl-10"
                    placeholder="e.g., 0917-123-4567"
                    value={branchData.phone}
                    onChange={(e) => setBranchData({ ...branchData, phone: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleBranchNext} className="w-full" size="lg">
                Next: Create Manager Account
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleManagerSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-xl font-semibold">
                  <UserCog className="h-5 w-5 text-primary" />
                  Step 2: Manager Account
                </div>
                <p className="text-sm text-muted-foreground mt-1">This will be the primary account for managing payroll &amp; employees</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      className="pl-10"
                      placeholder="Juan"
                      value={managerData.firstName}
                      onChange={(e) => setManagerData({ ...managerData, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      className="pl-10"
                      placeholder="Dela Cruz"
                      value={managerData.lastName}
                      onChange={(e) => setManagerData({ ...managerData, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="manager@yourcafe.ph"
                    value={managerData.email}
                    onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    className="pl-10"
                    placeholder="manager"
                    value={managerData.username}
                    onChange={(e) => setManagerData({ ...managerData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      value={managerData.password}
                      onChange={(e) => setManagerData({ ...managerData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      value={managerData.confirmPassword}
                      onChange={(e) => setManagerData({ ...managerData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (₱) *</Label>
                <p className="text-xs text-muted-foreground">
                  NCR 2026 minimum: ₱80.63/hr (₱645 daily ÷ 8 hrs). Used for payroll calculations.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₱</span>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.50"
                    min="0"
                    className="pl-8 pr-14"
                    placeholder="120.00"
                    value={managerData.hourlyRate}
                    onChange={(e) => setManagerData({ ...managerData, hourlyRate: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/hour</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ ₱{(parseFloat(managerData.hourlyRate || '0') * 8).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/day
                  {' · '}
                  ₱{(parseFloat(managerData.hourlyRate || '0') * 8 * 26).toLocaleString('en-PH', { minimumFractionDigits: 2 })}/month (26 working days)
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={setupMutation.isPending}
                >
                  {setupMutation.isPending ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

