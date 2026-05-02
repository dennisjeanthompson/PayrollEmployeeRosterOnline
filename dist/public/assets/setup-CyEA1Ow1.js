import { r as reactExports, Q as jsxRuntimeExports, dW as Root, bJ as cva, aH as useMutation, dX as Coffee, dY as Building2, dZ as MapPin, d_ as Phone, d$ as UserCog, e0 as User, e1 as Mail, e2 as Lock } from './vendor-5dgU3tca.js';
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from './card-BSXr2Mt7.js';
import { B as Button } from './button-BjtCgUzM.js';
import { d as cn } from './main-2BvCZ7pP.js';
import { u as useToast } from './use-toast-DLYGmyYZ.js';

const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/30",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = Root.displayName;

function Setup() {
  const { toast } = useToast();
  const [step, setStep] = reactExports.useState(1);
  const [branchData, setBranchData] = reactExports.useState({
    name: "",
    address: "",
    phone: ""
  });
  const [managerData, setManagerData] = reactExports.useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    hourlyRate: "120.00"
  });
  const setupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
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
        description: "Your café management system is ready. Redirecting to login..."
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2e3);
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const handleBranchNext = () => {
    if (!branchData.name || !branchData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required branch fields",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };
  const handleManagerSubmit = (e) => {
    e.preventDefault();
    if (!managerData.username || !managerData.password || !managerData.firstName || !managerData.lastName || !managerData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required manager fields",
        variant: "destructive"
      });
      return;
    }
    if (managerData.password !== managerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    if (managerData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    const rate = parseFloat(managerData.hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid hourly rate",
        variant: "destructive"
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
        hourlyRate: managerData.hourlyRate
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-2xl shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary text-primary-foreground p-4 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-12 w-12" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-3xl font-bold", children: "Welcome to The Cafe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-lg", children: "Set up your café payroll & management system" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-2 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 w-16 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 w-16 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}` })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 text-xl font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-primary" }),
            "Step 1: Branch Information"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Tell us about your café location" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchName", children: "Branch Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "branchName",
                className: "pl-10",
                placeholder: "e.g., Don Macchiatos — Main Branch",
                value: branchData.name,
                onChange: (e) => setBranchData({ ...branchData, name: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchAddress", children: "Address *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "branchAddress",
                className: "pl-10",
                placeholder: "e.g., 123 Rizal Ave., Brgy. Centro, La Union",
                value: branchData.address,
                onChange: (e) => setBranchData({ ...branchData, address: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "branchPhone", children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "branchPhone",
                className: "pl-10",
                placeholder: "e.g., 0917-123-4567",
                value: branchData.phone,
                onChange: (e) => setBranchData({ ...branchData, phone: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleBranchNext, className: "w-full", size: "lg", children: "Next: Create Manager Account" })
      ] }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleManagerSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 text-xl font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-5 w-5 text-primary" }),
            "Step 2: Manager Account"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This will be the primary account for managing payroll & employees" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "firstName", children: "First Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "firstName",
                  className: "pl-10",
                  placeholder: "Juan",
                  value: managerData.firstName,
                  onChange: (e) => setManagerData({ ...managerData, firstName: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lastName", children: "Last Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "lastName",
                  className: "pl-10",
                  placeholder: "Dela Cruz",
                  value: managerData.lastName,
                  onChange: (e) => setManagerData({ ...managerData, lastName: e.target.value })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "email",
                type: "email",
                className: "pl-10",
                placeholder: "manager@yourcafe.ph",
                value: managerData.email,
                onChange: (e) => setManagerData({ ...managerData, email: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "username",
                className: "pl-10",
                placeholder: "manager",
                value: managerData.username,
                onChange: (e) => setManagerData({ ...managerData, username: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "password",
                  type: "password",
                  className: "pl-10",
                  placeholder: "••••••••",
                  value: managerData.password,
                  onChange: (e) => setManagerData({ ...managerData, password: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "confirmPassword",
                  type: "password",
                  className: "pl-10",
                  placeholder: "••••••••",
                  value: managerData.confirmPassword,
                  onChange: (e) => setManagerData({ ...managerData, confirmPassword: e.target.value })
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "hourlyRate", children: "Hourly Rate (₱) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "NCR 2026 minimum: ₱80.63/hr (₱645 daily ÷ 8 hrs). Used for payroll calculations." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground", children: "₱" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "hourlyRate",
                type: "number",
                step: "0.50",
                min: "0",
                className: "pl-8 pr-14",
                placeholder: "120.00",
                value: managerData.hourlyRate,
                onChange: (e) => setManagerData({ ...managerData, hourlyRate: e.target.value })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "/hour" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "≈ ₱",
            (parseFloat(managerData.hourlyRate || "0") * 8).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
            "/day",
            " · ",
            "₱",
            (parseFloat(managerData.hourlyRate || "0") * 8 * 26).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
            "/month (26 working days)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => setStep(1),
              className: "w-full",
              size: "lg",
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              className: "w-full",
              size: "lg",
              disabled: setupMutation.isPending,
              children: setupMutation.isPending ? "Setting up..." : "Complete Setup"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}

export { Setup as default };
