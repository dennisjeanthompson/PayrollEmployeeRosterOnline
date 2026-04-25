const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HolidayCalendarView-Dnv8cyIT.js","assets/vendor-v-EuVKxF.js","assets/vendor-Bi9pq-j3.css","assets/vendor-calendar-BweojRQ-.js"])))=>i.map(i=>d[i]);
import { a0 as useTheme, aG as useQueryClient, r as reactExports, bl as format, ax as useQuery, aH as useMutation, Q as jsxRuntimeExports, an as Tooltip, X as Box, ag as alpha, aj as Typography, aM as CircularProgress, a3 as CalendarIcon, aJ as Stack, bA as TextField, b2 as MenuItem, aK as Button, cN as RefreshIcon, bp as AddIcon, cO as LinearProgress, bt as Card, bu as CardContent, c5 as Tabs, c6 as Tab, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody, am as Chip, aU as CheckCircleIcon, co as Block, af as IconButton, bW as EditIcon, bG as DeleteIcon, bx as CloseIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, cB as LocalizationProvider, cC as AdapterDateFns, cF as DatePicker, bH as FormControlLabel, c3 as Switch, bB as DialogActions, bE as Alert, T as __vitePreload } from './vendor-v-EuVKxF.js';
import { u as useAuth, c as apiRequest } from './main-fla130dr.js';
import { u as useToast } from './use-toast-BDUJuTfF.js';

const HolidayCalendarView = reactExports.lazy(() => __vitePreload(() => import('./HolidayCalendarView-Dnv8cyIT.js'),true              ?__vite__mapDeps([0,1,2,3]):void 0));
const holidayTypes = [
  { value: "regular", label: "Regular Holiday", color: "#ef4444", payWorked: "+100% premium" },
  { value: "special_non_working", label: "Special Non-Working", color: "#f97316", payWorked: "+30% premium" },
  { value: "special_working", label: "Special Working", color: "#eab308", payWorked: "Normal rate" },
  { value: "company", label: "Company Holiday", color: "#3b82f6", payWorked: "Per policy" }
];
const getTypeConfig = (type) => {
  return holidayTypes.find((t) => t.value === type) || holidayTypes[2];
};
function MuiHolidayCalendar() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const [editingHoliday, setEditingHoliday] = reactExports.useState(null);
  const [deletingHoliday, setDeletingHoliday] = reactExports.useState(null);
  const [detailAnchor, setDetailAnchor] = reactExports.useState(null);
  const [detailHoliday, setDetailHoliday] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    date: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
    type: "regular",
    year: (/* @__PURE__ */ new Date()).getFullYear(),
    isRecurring: false,
    workAllowed: true,
    notes: ""
  });
  const { data: holidaysData, isLoading, isFetching } = useQuery({
    queryKey: ["/api/holidays", { year: selectedYear }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/holidays?year=${selectedYear}`);
      return res.json();
    },
    staleTime: 60 * 60 * 1e3,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData
  });
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/holidays", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Holiday created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PUT", `/api/holidays/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDialogOpen(false);
      setEditingHoliday(null);
      resetForm();
      toast({ title: "Success", description: "Holiday updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("DELETE", `/api/holidays/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsDeleteDialogOpen(false);
      setDeletingHoliday(null);
      toast({ title: "Success", description: "Holiday deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/holidays/seed-2025");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: data.message || "2025 holidays seeded successfully!"
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const seed2026Mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/holidays/seed-2026");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: data.message || "2026 holidays seeded successfully!"
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  const resetForm = () => {
    setFormData({
      name: "",
      date: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
      type: "regular",
      year: selectedYear,
      isRecurring: false,
      workAllowed: true,
      notes: ""
    });
  };
  const handleEdit = reactExports.useCallback((holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: format(new Date(holiday.date), "yyyy-MM-dd"),
      type: holiday.type,
      year: holiday.year,
      isRecurring: holiday.isRecurring,
      workAllowed: holiday.workAllowed ?? true,
      notes: holiday.notes || ""
    });
    setIsDialogOpen(true);
  }, []);
  const handleDelete = reactExports.useCallback((holiday) => {
    setDeletingHoliday(holiday);
    setIsDeleteDialogOpen(true);
  }, []);
  const handleSubmit = () => {
    const submitData = {
      ...formData,
      date: new Date(formData.date).toISOString()
    };
    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };
  const holidayList = holidaysData?.holidays ?? [];
  const calendarEvents = reactExports.useMemo(() => {
    if (!holidayList.length) return [];
    return holidayList.map((holiday) => {
      return {
        id: holiday.id,
        title: holiday.name,
        date: format(new Date(holiday.date), "yyyy-MM-dd"),
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: {
          holiday,
          payRule: holiday.payRule
        }
      };
    });
  }, [holidayList]);
  const holidayStats = reactExports.useMemo(() => {
    if (!holidayList.length) return { regular: 0, special: 0, company: 0, total: 0 };
    const holidays = holidayList;
    return {
      regular: holidays.filter((h) => h.type === "regular").length,
      special: holidays.filter((h) => h.type.startsWith("special")).length,
      company: holidays.filter((h) => h.type === "company").length,
      total: holidays.length
    };
  }, [holidayList]);
  const sortedHolidays = reactExports.useMemo(
    () => [...holidayList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [holidayList]
  );
  const handleCalendarEventClick = reactExports.useCallback((info) => {
    info.jsEvent.preventDefault();
    const holiday = info.event.extendedProps.holiday;
    setDetailHoliday(holiday);
    setDetailAnchor(info.el);
  }, []);
  const renderCalendarEvent = reactExports.useCallback((arg) => {
    const holiday = arg.event.extendedProps.holiday;
    const typeConfig = getTypeConfig(holiday?.type);
    const color = holiday.workAllowed ? typeConfig.color : "#6b7280";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tooltip,
      {
        title: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: holiday?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
            "Type: ",
            typeConfig.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
            "Pay: ",
            holiday?.payRule?.worked || typeConfig.payWorked
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
            "Work Allowed: ",
            holiday?.workAllowed ? "Yes" : "No"
          ] }),
          holiday?.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
              "Note: ",
              holiday.notes
            ] })
          ] })
        ] }),
        arrow: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
              bgcolor: alpha(color, 0.15),
              color,
              borderLeft: `4px solid ${color}`,
              borderTop: "1px solid",
              borderRight: "1px solid",
              borderBottom: "1px solid",
              borderColor: alpha(color, 0.2),
              fontWeight: 600,
              width: "100%",
              boxSizing: "border-box"
            },
            children: arg.event.title
          }
        )
      }
    );
  }, []);
  if (isLoading && holidayList.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: { xs: 2, md: 4 } }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, { sx: { color: "white" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "Holiday Calendar Management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Configure Philippine holidays for payroll calculations ",
                isAdmin ? "(Admin Only)" : "(View Only)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, flexWrap: "wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                select: true,
                size: "small",
                value: selectedYear,
                onChange: (e) => setSelectedYear(parseInt(e.target.value)),
                sx: { minWidth: 100 },
                children: [2024, 2025, 2026].map((year) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: year, children: year }, year))
              }
            ),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  color: "warning",
                  startIcon: seedMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                  onClick: () => {
                    if (confirm("Seed official 2025 Philippine holidays (Proclamation 727)?")) {
                      seedMutation.mutate();
                    }
                  },
                  disabled: seedMutation.isPending,
                  sx: { borderRadius: 3, textTransform: "none", fontWeight: 600 },
                  children: "Seed 2025 Holidays"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  color: "success",
                  startIcon: seed2026Mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                  onClick: () => {
                    if (confirm("Seed official 2026 Philippine holidays?")) {
                      seed2026Mutation.mutate();
                    }
                  },
                  disabled: seed2026Mutation.isPending,
                  sx: { borderRadius: 3, textTransform: "none", fontWeight: 600 },
                  children: "Seed 2026 Holidays"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  onClick: () => {
                    setEditingHoliday(null);
                    resetForm();
                    setIsDialogOpen(true);
                  },
                  sx: {
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  children: "Add Holiday"
                }
              )
            ] })
          ] })
        ]
      }
    ),
    isFetching && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { mb: 2, borderRadius: 1 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 2, sx: { mb: 3 }, flexWrap: "wrap", children: [
      { label: "Regular", count: holidayStats.regular, color: "#ef4444" },
      { label: "Special", count: holidayStats.special, color: "#f97316" },
      { label: "Company", count: holidayStats.company, color: "#3b82f6" },
      { label: "Total", count: holidayStats.total, color: theme.palette.primary.main }
    ].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        sx: {
          minWidth: 120,
          bgcolor: alpha(stat.color, 0.1),
          border: "none"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, color: stat.color, children: stat.count }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: stat.label })
        ] })
      },
      stat.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), sx: { mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Calendar View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "List View" })
    ] }),
    tabValue === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 2, minHeight: 620 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: 580, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary" }) }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          HolidayCalendarView,
          {
            events: calendarEvents,
            onEventClick: handleCalendarEventClick,
            onEventContent: renderCalendarEvent
          }
        )
      }
    ) }) }),
    tabValue === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Pay Rule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 600 }, children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedHolidays.map((holiday) => {
        const typeConfig = getTypeConfig(holiday.type);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: format(new Date(holiday.date), "MMM d, yyyy") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: holiday.name }),
            holiday.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: holiday.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: typeConfig.label,
              size: "small",
              sx: {
                bgcolor: alpha(typeConfig.color, 0.15),
                color: typeConfig.color,
                fontWeight: 600
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: holiday.payRule?.worked || typeConfig.payWorked }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: holiday.workAllowed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Block, {}),
              label: holiday.workAllowed ? "Work OK" : "Blocked",
              size: "small",
              color: holiday.workAllowed ? "success" : "error",
              variant: "outlined"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.5, justifyContent: "flex-end", children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleEdit(holiday), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", onClick: () => handleDelete(holiday), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" }) }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.disabled", children: "View Only" }) }) })
        ] }, holiday.id);
      }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }, children: [
      holidayTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 16, height: 16, borderRadius: "50%", bgcolor: type.color } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: type.label })
      ] }, type.value)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 16, height: 16, borderRadius: "50%", bgcolor: "#6b7280" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: "Work Blocked" })
      ] })
    ] }),
    detailAnchor && detailHoliday && (() => {
      const typeConfig = getTypeConfig(detailHoliday.type);
      const rect = detailAnchor.getBoundingClientRect();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            onClick: () => {
              setDetailAnchor(null);
              setDetailHoliday(null);
            },
            sx: { position: "fixed", inset: 0, zIndex: 1200 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            elevation: 8,
            sx: {
              position: "fixed",
              left: Math.min(rect.left, window.innerWidth - 320),
              top: rect.bottom + 8,
              zIndex: 1300,
              width: 300,
              borderRadius: 3,
              border: `2px solid ${typeConfig.color}`,
              overflow: "visible"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: detailHoliday.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: format(new Date(detailHoliday.date), "MMMM d, yyyy") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => {
                  setDetailAnchor(null);
                  setDetailHoliday(null);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, { fontSize: "small" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: typeConfig.label,
                  size: "small",
                  sx: {
                    bgcolor: alpha(typeConfig.color, 0.15),
                    color: typeConfig.color,
                    fontWeight: 600,
                    mb: 1.5
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 0.5, sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pay Rule:" }),
                  " ",
                  detailHoliday.payRule?.worked || typeConfig.payWorked
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Work Allowed:" }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      size: "small",
                      icon: detailHoliday.workAllowed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Block, {}),
                      label: detailHoliday.workAllowed ? "Yes" : "Blocked",
                      color: detailHoliday.workAllowed ? "success" : "error",
                      variant: "outlined",
                      sx: { height: 24 }
                    }
                  )
                ] }),
                detailHoliday.isRecurring && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "ðŸ” Recurring annually" }),
                detailHoliday.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", fontStyle: "italic", children: detailHoliday.notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    size: "small",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
                    onClick: () => {
                      setDetailAnchor(null);
                      setDetailHoliday(null);
                      handleEdit(detailHoliday);
                    },
                    sx: { borderRadius: 2, textTransform: "none", fontWeight: 600, flex: 1 },
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outlined",
                    size: "small",
                    color: "error",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                    onClick: () => {
                      setDetailAnchor(null);
                      setDetailHoliday(null);
                      handleDelete(detailHoliday);
                    },
                    sx: { borderRadius: 2, textTransform: "none", fontWeight: 600, flex: 1 },
                    children: "Delete"
                  }
                )
              ] })
            ] })
          }
        )
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isDialogOpen,
        onClose: () => setIsDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", fontWeight: 600, children: [
              editingHoliday ? "Edit" : "Add",
              " Holiday"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure holiday details for payroll calculations" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Holiday Name",
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                fullWidth: true,
                required: true,
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DatePicker,
              {
                label: "Date",
                value: formData.date ? new Date(formData.date) : null,
                onChange: (val) => {
                  if (val) {
                    const newDate = format(val, "yyyy-MM-dd");
                    setFormData({
                      ...formData,
                      date: newDate,
                      year: val.getFullYear()
                    });
                  }
                },
                slotProps: {
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
                  }
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                select: true,
                label: "Holiday Type",
                value: formData.type,
                onChange: (e) => setFormData({ ...formData, type: e.target.value }),
                fullWidth: true,
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                children: holidayTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: type.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 12, height: 12, borderRadius: "50%", bgcolor: type.color } }),
                  type.label,
                  " (",
                  type.payWorked,
                  ")"
                ] }) }, type.value))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: formData.workAllowed,
                    onChange: (e) => setFormData({ ...formData, workAllowed: e.target.checked })
                  }
                ),
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Allow Work on This Day" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "If disabled, shift creation will be blocked" })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: formData.isRecurring,
                    onChange: (e) => setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                ),
                label: "Recurring (same date every year)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Notes (Optional)",
                value: formData.notes,
                onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
                fullWidth: true,
                multiline: true,
                rows: 2,
                placeholder: "e.g., Date subject to NCMF announcement",
                sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 0, justifyContent: editingHoliday ? "space-between" : "flex-end" }, children: [
            editingHoliday && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                onClick: () => {
                  setIsDialogOpen(false);
                  handleDelete(editingHoliday);
                },
                sx: { borderRadius: 2, textTransform: "none" },
                children: "Delete"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setIsDialogOpen(false), sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  onClick: handleSubmit,
                  disabled: !formData.name || !formData.date || createMutation.isPending || updateMutation.isPending,
                  startIcon: createMutation.isPending || updateMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : null,
                  sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                  children: createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isDeleteDialogOpen,
        onClose: () => setIsDeleteDialogOpen(false),
        maxWidth: "xs",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, children: "Delete Holiday?" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mt: 1 }, children: [
            "This will permanently delete ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deletingHoliday?.name }),
            ". This action cannot be undone."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setIsDeleteDialogOpen(false), sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "error",
                onClick: () => deletingHoliday && deleteMutation.mutate(deletingHoliday.id),
                disabled: deleteMutation.isPending,
                startIcon: deleteMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                children: deleteMutation.isPending ? "Deleting..." : "Delete"
              }
            )
          ] })
        ]
      }
    )
  ] });
}

export { MuiHolidayCalendar as default };
