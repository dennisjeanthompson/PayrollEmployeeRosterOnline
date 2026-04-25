import { a0 as useTheme, a1 as useMediaQuery, Q as jsxRuntimeExports, X as Box, bl as format, cc as isToday, ag as alpha, aj as Typography, am as Chip, cd as differenceInHours, aD as TradeIcon, al as Avatar, an as Tooltip, af as IconButton, ce as NoteAdd, bp as AddIcon, cf as addDays, bU as CancelIcon, aU as CheckCircleIcon, cg as PendingIcon, bk as motion, bw as CheckIcon, bC as isValid, ai as ChevronLeftIcon, ch as subDays, ah as ChevronRightIcon, ci as VacationIcon, bW as EditIcon, r as reactExports, a as React, cj as Accordion, ck as AccordionSummary, cl as ExpandMore, cm as AccordionDetails, cn as EventBusyIcon, aJ as Stack, bt as Card, bu as CardContent, aK as Button, co as Block, bm as Divider, aC as ScheduleIcon, bx as CloseIcon, bG as DeleteIcon, cp as AssignmentLateIcon, ay as Dialog, by as DialogTitle, bz as DialogContent, bA as TextField, bB as DialogActions, aI as Menu, b2 as MenuItem, aG as useQueryClient, ax as useQuery, aH as useMutation, aq as Drawer, c7 as PersonIcon, bs as AccessTime, aM as CircularProgress, bD as WarningIcon, cq as ChatIcon, cr as Send, cs as startOfWeek, ct as subWeeks, cu as endOfWeek, cv as addWeeks, cw as setMinutes, cx as setHours, cy as ButtonGroup, cz as WeekIcon, cA as DayIcon, bQ as y, b0 as FormControl, b$ as InputLabel, b1 as Select, cB as LocalizationProvider, cC as AdapterDateFns, cD as DateTimePicker, cE as isSameDay, cF as DatePicker, b_ as InputAdornment, cG as ContentCopyIcon, bE as Alert, b7 as Paper, cH as ClearAllIcon, cI as areIntervalsOverlapping, cJ as eachDayOfInterval, av as Badge, cK as InboxIcon, cL as MoreVert, cM as ChecklistIcon } from './vendor-v-EuVKxF.js';
import { c as apiRequest, i as isManager, g as getCurrentUser } from './main-fla130dr.js';
import { u as useRealtime } from './use-realtime-DiQyjgYE.js';

const PROFESSIONAL_SHIFT_COLOR = {
  bg: "#3B82F6",
  // Modern Professional Blue (Blue 500)
  bgLight: "#EFF6FF",
  // Pale blue background (Blue 50)
  bgDark: "#1E40AF",
  // Deep blue for dark mode (Blue 800)
  text: "#FFFFFF",
  // White text
  border: "#93C5FD",
  // Soft blue border (Blue 300)
  label: "Shift"
};
function getRoleColor(position, role) {
  return PROFESSIONAL_SHIFT_COLOR;
}
function getUniqueRoleColors(employees) {
  return [];
}

function toDate$2(val) {
  if (!val) return /* @__PURE__ */ new Date(0);
  const d = val instanceof Date ? val : new Date(val);
  return isValid(d) ? d : /* @__PURE__ */ new Date(0);
}
function toDateStr$1(val) {
  return format(toDate$2(val), "yyyy-MM-dd");
}
function safeFormat$3(val, fmt) {
  try {
    const d = toDate$2(val);
    return format(d, fmt);
  } catch {
    return "--";
  }
}
function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}
function getShiftsForCell(shifts, employeeId, date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return shifts.filter(
    (s) => String(s.userId) === String(employeeId) && toDateStr$1(s.startTime) === dateStr
  );
}
function getHoliday(holidays, date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return holidays.find((h) => format(new Date(h.date), "yyyy-MM-dd") === dateStr);
}
function getTimeOffForCell(requests, employeeId, date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return requests.filter((r) => {
    if (String(r.userId) !== String(employeeId)) return false;
    const start = toDateStr$1(r.startDate);
    const end = toDateStr$1(r.endDate);
    return dateStr >= start && dateStr <= end;
  });
}
function getTradeForShift(trades, shiftId) {
  return trades.find((t) => t.shiftId === shiftId && (t.status === "pending" || t.status === "accepted"));
}
const TIME_OFF_STATUS_CONFIG = {
  pending: { color: "#F59E0B", bgColor: "#FEF3C7", borderColor: "#FDE68A", icon: PendingIcon, label: "Pending" },
  approved: { color: "#10B981", bgColor: "#DCFCE7", borderColor: "#A7F3D0", icon: CheckCircleIcon, label: "Approved" },
  rejected: { color: "#EF4444", bgColor: "#FEE2E2", borderColor: "#FECACA", icon: CancelIcon, label: "Rejected" },
  cancelled: { color: "#6B7280", bgColor: "#F3F4F6", borderColor: "#D1D5DB", icon: CancelIcon, label: "Cancelled" }
};
function TimeOffIndicator({ request, compact = false, onDelete }) {
  const config = TIME_OFF_STATUS_CONFIG[request.status] || TIME_OFF_STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const typeLabel = request.type.charAt(0).toUpperCase() + request.type.slice(1);
  const isApproved = request.status === "approved";
  const isPaid = request.isPaid;
  const paidLabel = isApproved ? isPaid ? "PAID" : "UNPAID" : config.label;
  const dynamicBg = isApproved ? isPaid ? "#059669" : config.bgColor : config.bgColor;
  const dynamicColor = isApproved ? isPaid ? "#FFFFFF" : config.color : config.color;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `${typeLabel} Leave · ${paidLabel}${request.reason ? `
"${request.reason}"` : ""}${onDelete ? "\n(Click to manage)" : ""}`, arrow: true, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      component: motion.div,
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      whileHover: { boxShadow: onDelete ? "0 6px 14px rgba(0,0,0,0.12)" : "0 4px 10px rgba(0,0,0,0.08)" },
      whileTap: {},
      onClick: onDelete ? (e) => {
        e.stopPropagation();
        onDelete(request.id);
      } : void 0,
      sx: {
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        width: "100%",
        minHeight: 28,
        px: 1,
        py: 0.4,
        borderRadius: 1.5,
        bgcolor: dynamicBg,
        color: dynamicColor,
        cursor: onDelete ? "pointer" : "default",
        border: request.status === "pending" ? "1.5px dashed" : "1.5px solid",
        borderColor: isPaid ? "#047857" : config.borderColor,
        fontSize: "0.72rem",
        fontWeight: 700,
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s",
        overflow: "hidden",
        "&:hover": onDelete ? { filter: "brightness(0.92)", boxShadow: "0 6px 14px rgba(0,0,0,0.12)" } : {}
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { sx: { fontSize: 14, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }, children: compact ? typeLabel : `${typeLabel} Leave` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: {
          fontSize: "0.58rem",
          fontWeight: 800,
          opacity: 0.8,
          flexShrink: 0,
          bgcolor: isPaid ? alpha("#FFFFFF", 0.2) : alpha(config.color, 0.12),
          px: 0.5,
          py: 0.1,
          borderRadius: 1
        }, children: isPaid ? "₱" : paidLabel })
      ]
    }
  ) });
}
function TradeBadge({ trade }) {
  const isAccepted = trade.status === "accepted";
  const targetName = trade.targetUser?.firstName || trade.toUser?.firstName || "";
  const label = isAccepted ? `Trade accepted${targetName ? ` by ${targetName}` : ""} · Awaiting manager approval` : `Trade requested${targetName ? ` → ${targetName}` : " (open)"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: label, arrow: true, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
    position: "absolute",
    top: -8,
    right: -4,
    display: "flex",
    alignItems: "center",
    gap: 0.3,
    px: 0.6,
    py: 0.15,
    borderRadius: 1,
    bgcolor: isAccepted ? "#3B82F6" : "#8B5CF6",
    color: "#FFFFFF",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: 2,
    fontSize: "0.52rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 10 } }),
    isAccepted ? "Traded" : "Trading"
  ] }) });
}
function ShiftPill({ shift, onClick, trade, isSelectionMode, isSelected, onLogAdjustment }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const rc = getRoleColor(shift.position, shift.user?.role);
  const startStr = safeFormat$3(shift.startTime, "h:mm a").toLowerCase();
  const endStr = safeFormat$3(shift.endTime, "h:mm a").toLowerCase();
  const hours = differenceInHours(toDate$2(shift.endTime), toDate$2(shift.startTime));
  const hasTrade = !!trade;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      component: motion.div,
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      whileHover: { scale: 1.04, y: -2 },
      whileTap: { scale: 0.98 },
      onClick,
      sx: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: onLogAdjustment ? "space-between" : "center",
        gap: onLogAdjustment ? 0.75 : 0,
        px: 0.75,
        pr: onLogAdjustment ? 0.5 : 0.75,
        py: 0.6,
        borderRadius: 1.5,
        bgcolor: hasTrade ? alpha(rc.bg, 0.4) : alpha(rc.bg, 0.25),
        border: "1px solid",
        borderColor: alpha(rc.border, 0.5),
        borderLeft: `4px solid ${rc.bg}`,
        color: isDark ? alpha(rc.bgLight, 1) : rc.bgDark,
        cursor: "pointer",
        fontSize: "0.68rem",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        transition: "box-shadow 0.2s",
        whiteSpace: "nowrap",
        overflow: "visible",
        ...hasTrade && {
          outline: "2px dashed",
          outlineColor: trade.status === "accepted" ? "#3B82F6" : "#8B5CF6",
          outlineOffset: 1
        },
        "&:hover": onClick ? {
          filter: "brightness(0.92)",
          boxShadow: isSelected ? void 0 : `0 6px 16px ${alpha(rc.bg, 0.3)}`
        } : {}
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            title: `${shift.position || "Staff"} · ${safeFormat$3(shift.startTime, "h:mm a")} – ${safeFormat$3(shift.endTime, "h:mm a")} (${hours}h)${shift.notes ? `
${shift.notes}` : ""}${hasTrade ? `
⇄ Trade ${trade.status}` : ""}`,
            arrow: true,
            placement: "top",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", height: "100%", gap: 0.5 }, children: [
              isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                position: "absolute",
                top: -6,
                right: -6,
                bgcolor: isSelected ? "primary.main" : "background.paper",
                color: isSelected ? "#fff" : "transparent",
                border: "2px solid",
                borderColor: isSelected ? "primary.main" : "text.disabled",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSelected ? 2 : 1,
                zIndex: 12,
                transition: "all 0.2s"
              }, children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 12, fontWeight: 900 } }) }),
              hasTrade && /* @__PURE__ */ jsxRuntimeExports.jsx(TradeBadge, { trade }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "span", sx: { flex: 1, minWidth: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }, children: [
                startStr,
                "-",
                endStr
              ] })
            ] })
          }
        ),
        onLogAdjustment && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Log attendance", arrow: true, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          IconButton,
          {
            size: "small",
            onClick: (e) => {
              e.stopPropagation();
              onLogAdjustment();
            },
            sx: {
              width: 20,
              height: 20,
              flexShrink: 0,
              color: "#B45309",
              bgcolor: alpha("#F59E0B", 0.14),
              border: "1px solid",
              borderColor: alpha("#F59E0B", 0.22),
              "&:hover": { bgcolor: alpha("#F59E0B", 0.24) }
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { sx: { fontSize: 12 } })
          }
        ) })
      ]
    }
  );
}
function getAdjustmentsForCell(logs, employeeId, date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return logs.filter(
    (l) => String(l.employeeId) === String(employeeId) && toDateStr$1(l.startDate || l.date) === dateStr && l.status !== "rejected"
  );
}
const ADJ_TYPE_CONFIG = {
  late: { label: "Late", color: "#c2410c", bgColor: "#ffedd5" },
  // orange
  overtime: { label: "OT", color: "#15803d", bgColor: "#dcfce7" },
  // green
  rest_day_ot: { label: "RD OT", color: "#1d4ed8", bgColor: "#dbeafe" },
  // blue
  special_holiday_ot: { label: "SH OT", color: "#b45309", bgColor: "#fef3c7" },
  // amber
  regular_holiday_ot: { label: "RH OT", color: "#b91c1c", bgColor: "#fee2e2" },
  // red
  night_diff: { label: "ND", color: "#6d28d9", bgColor: "#ede9fe" },
  // violet
  undertime: { label: "UT", color: "#be185d", bgColor: "#fce7f3" },
  // pink
  absent: { label: "Absent", color: "#991b1b", bgColor: "#fee2e2" },
  // red
  holiday_pay: { label: "Holiday Pay", color: "#047857", bgColor: "#10b98122" }
  // emerald
};
function AdjustmentBadge({ log, isSelectionMode, isSelected, onClick }) {
  const isTime = log.type === "late" || log.type === "undertime";
  const unit = log.type === "holiday_pay" ? "" : isTime ? "m" : log.type === "absent" ? "d" : "h";
  const config = ADJ_TYPE_CONFIG[log.type] || { label: log.type, color: "#444", bgColor: "#eee" };
  const isExcluded = log.isIncluded === false;
  const iconMap = { late: "⏰", undertime: "📉", absent: "❌", holiday_pay: "💰" };
  const icon = iconMap[log.type] || "⚡";
  const statusDot = {
    pending: { color: "#f59e0b", pulse: true },
    employee_verified: { color: "#10b981", pulse: false },
    disputed: { color: "#ef4444", pulse: true },
    approved: { color: "#3b82f6", pulse: false },
    rejected: { color: "#6b7280", pulse: false }
  };
  const dot = statusDot[log.status] || statusDot.pending;
  const isGrouped = log.count && log.count > 1;
  const tooltipText = isGrouped ? `${config.label} (${log.count} records): ${log.value}${unit}${isExcluded ? " (Excluded)" : ""}
${log.logs?.map((l) => `- ${l.value}${unit}${l.remarks ? ` "${l.remarks}"` : ""}`).join("\n")}` : `${config.label}: ${log.value}${unit}${isExcluded ? " (Excluded from payroll)" : ""}${log.status === "disputed" ? "\n⚠️ Disputed by employee" : log.status === "employee_verified" ? "\n✅ Confirmed by employee" : ""}${log.remarks ? `
"${log.remarks}"` : ""}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: tooltipText, arrow: true, placement: "top", sx: { whiteSpace: "pre-line" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      onClick,
      sx: {
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        position: "relative",
        width: "100%",
        minHeight: 28,
        px: 1,
        py: 0.4,
        borderRadius: 1.5,
        bgcolor: isExcluded ? alpha(config.bgColor, 0.4) : config.bgColor,
        borderLeft: `3px solid ${isExcluded ? alpha(config.color, 0.3) : config.color}`,
        border: log.status === "disputed" ? "2px solid" : "1px solid",
        borderColor: isSelected ? "#3B82F6" : log.status === "disputed" ? alpha("#ef4444", 0.5) : alpha(config.color, isExcluded ? 0.1 : 0.25),
        fontSize: "0.72rem",
        fontWeight: 700,
        color: isExcluded ? alpha(config.color, 0.4) : config.color,
        cursor: onClick ? "pointer" : "default",
        opacity: isExcluded ? 0.55 : 1,
        boxShadow: isSelected ? "0 0 0 2px #3B82F6, 0 4px 12px rgba(59, 130, 246, 0.4)" : "0 1px 3px rgba(0,0,0,0.08)",
        transform: "none",
        transition: "box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
        overflow: "hidden",
        "&:hover": onClick ? { filter: "brightness(0.92)", boxShadow: isSelected ? void 0 : "0 3px 8px rgba(0,0,0,0.1)" } : {}
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
          position: "absolute",
          top: 3,
          right: 3,
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: dot.color,
          boxShadow: `0 0 4px ${dot.color}`,
          animation: dot.pulse ? "statusPulse 2s infinite" : "none",
          "@keyframes statusPulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
          zIndex: 5
        } }),
        isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
          position: "absolute",
          top: -6,
          right: -6,
          bgcolor: isSelected ? "primary.main" : "background.paper",
          color: isSelected ? "#fff" : "transparent",
          border: "2px solid",
          borderColor: isSelected ? "primary.main" : "text.disabled",
          borderRadius: "50%",
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected ? 2 : 1,
          zIndex: 12,
          transition: "all 0.2s"
        }, children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 12, fontWeight: 900 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { flexShrink: 0 }, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          textDecoration: isExcluded ? "line-through" : "none"
        }, children: isGrouped ? `${log.count}x ${config.label}` : config.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "span", sx: {
          fontSize: "0.62rem",
          fontWeight: 800,
          flexShrink: 0,
          bgcolor: alpha(config.color, isExcluded ? 0.08 : 0.15),
          px: 0.5,
          py: 0.1,
          borderRadius: 1,
          textDecoration: isExcluded ? "line-through" : "none"
        }, children: [
          log.value,
          unit
        ] })
      ]
    }
  ) });
}
function WeeklyGrid({
  employees,
  shifts,
  weekStart,
  holidays,
  isManager,
  timeOffRequests = [],
  shiftTrades = [],
  adjustmentLogs = [],
  currentUserId,
  onCreateShift,
  onEditShift,
  onOpenRequests,
  onDeleteTimeOff,
  onAddHolidayPay,
  isSelectionMode,
  selectedShifts,
  selectedLogs,
  onToggleShiftSelection,
  onToggleLogSelection,
  onManageLogGroup,
  onLogAdjustment,
  onExceptionLogClick
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const weekDays = getWeekDays(weekStart);
  const visibleTimeOff = timeOffRequests.filter((r) => r.status === "pending" || r.status === "approved");
  const recentRejections = timeOffRequests.filter((r) => {
    if (r.status !== "rejected") return false;
    const rejectedAt = r.approvalDate ? new Date(r.approvalDate) : r.updatedAt ? new Date(r.updatedAt) : new Date(r.requestedAt);
    return Date.now() - rejectedAt.getTime() < 24 * 60 * 60 * 1e3;
  });
  const allVisibleTimeOff = [...visibleTimeOff, ...recentRejections];
  const activeTrades = shiftTrades.filter((t) => t.status === "pending" || t.status === "accepted");
  if (isMobile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: weekDays.map((date) => {
      const holiday = getHoliday(holidays, date);
      const dayShifts = shifts.filter((s) => toDateStr$1(s.startTime) === format(date, "yyyy-MM-dd"));
      const today = isToday(date);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          sx: {
            borderRadius: 3,
            border: "1px solid",
            borderColor: today ? "primary.main" : isDark ? "#3D3228" : "#E8E0D4",
            bgcolor: today ? alpha(theme.palette.primary.main, 0.04) : isDark ? "#2A2018" : "#FFFFFF",
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: today ? alpha(theme.palette.primary.main, 0.08) : isDark ? "#342A1E" : "#F5F0E8",
              borderBottom: "1px solid",
              borderColor: isDark ? "#3D3228" : "#E8E0D4"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", fontWeight: 700, sx: { color: today ? "primary.main" : "text.primary" }, children: [
                  format(date, "EEEE"),
                  today && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Today", size: "small", color: "primary", sx: { ml: 1, height: 20, fontSize: "0.65rem" } })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: format(date, "MMM d, yyyy") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                holiday && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: holiday.name,
                    size: "small",
                    color: holiday.workAllowed ? "success" : "error",
                    variant: "outlined",
                    sx: { height: 22, fontSize: "0.62rem" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${dayShifts.length} shift${dayShifts.length !== 1 ? "s" : ""}`, size: "small", variant: "outlined", sx: { height: 22, fontSize: "0.65rem" } })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, display: "flex", flexDirection: "column", gap: 1 }, children: [
              employees.map((emp) => {
                const dayTimeOff = getTimeOffForCell(allVisibleTimeOff, emp.id, date);
                const dayAdjustments = getAdjustmentsForCell(adjustmentLogs, emp.id, date);
                if (dayTimeOff.length === 0 && dayAdjustments.length === 0) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 0.5 }, children: [
                  dayTimeOff.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", fontWeight: 600, sx: { fontSize: "0.65rem", minWidth: 60 }, children: [
                      emp.firstName,
                      " ",
                      emp.lastName?.[0],
                      "."
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TimeOffIndicator, { request: req })
                  ] }, `to-${req.id}`)),
                  dayAdjustments.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", fontWeight: 600, sx: { fontSize: "0.65rem", minWidth: 60 }, children: [
                      emp.firstName,
                      " ",
                      emp.lastName?.[0],
                      "."
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustmentBadge, { log, onClick: () => onExceptionLogClick?.(log) })
                  ] }, `adj-${log.id}`))
                ] }, `emp-status-${emp.id}`);
              }),
              dayShifts.length === 0 && employees.every((emp) => getTimeOffForCell(allVisibleTimeOff, emp.id, date).length === 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { textAlign: "center", py: 2, fontStyle: "italic" }, children: "No shifts scheduled" }) : dayShifts.map((shift) => {
                const emp = employees.find((e) => e.id === shift.userId);
                const rc = getRoleColor(shift.position, emp?.role);
                const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
                const trade = getTradeForShift(activeTrades, shift.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Box,
                  {
                    onClick: () => onEditShift(shift),
                    sx: {
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: trade ? trade.status === "accepted" ? "#93C5FD" : "#C4B5FD" : isDark ? "#3D3228" : "#E8E0D4",
                      borderLeft: `4px solid ${rc.bg}`,
                      bgcolor: isDark ? "#342A1E" : "#FBF8F4",
                      cursor: "pointer",
                      position: "relative",
                      "&:hover": { bgcolor: isDark ? "#3D3228" : "#F7F3ED" }
                    },
                    children: [
                      trade && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                        position: "absolute",
                        top: 6,
                        right: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.25,
                        px: 0.5,
                        py: 0.15,
                        borderRadius: 1,
                        bgcolor: trade.status === "accepted" ? "#DBEAFE" : "#F5F3FF",
                        border: "1px solid",
                        borderColor: trade.status === "accepted" ? "#93C5FD" : "#C4B5FD"
                      }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 10, color: trade.status === "accepted" ? "#3B82F6" : "#8B5CF6" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontSize: "0.55rem", fontWeight: 700, color: trade.status === "accepted" ? "#3B82F6" : "#8B5CF6" }, children: trade.status === "accepted" ? "Traded" : "Trading" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: emp?.photoUrl || void 0, sx: { width: 36, height: 36, bgcolor: rc.bg, color: rc.text, fontSize: "0.75rem", fontWeight: 700 }, children: !emp?.photoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        emp?.firstName?.[0],
                        emp?.lastName?.[0]
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, noWrap: true, children: emp ? `${emp.firstName} ${emp.lastName}` : "Unknown" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                          shift.position || "Staff",
                          " · ",
                          safeFormat$3(shift.startTime, "h:mm a"),
                          " – ",
                          safeFormat$3(shift.endTime, "h:mm a"),
                          " (",
                          hours,
                          "h)"
                        ] })
                      ] }),
                      isManager && onLogAdjustment && !isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Log attendance", arrow: true, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          "aria-label": "Log attendance",
                          onClick: (e) => {
                            e.stopPropagation();
                            onLogAdjustment(shift);
                          },
                          sx: {
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            color: "#B45309",
                            bgcolor: alpha("#F59E0B", 0.14),
                            border: "1px solid",
                            borderColor: alpha("#F59E0B", 0.22),
                            "&:hover": { bgcolor: alpha("#F59E0B", 0.24) }
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { sx: { fontSize: 12 } })
                        }
                      ) })
                    ]
                  },
                  shift.id
                );
              })
            ] })
          ]
        },
        date.toISOString()
      );
    }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
    width: "100%",
    overflow: "auto",
    bgcolor: isDark ? "#2A2018" : "#FFFFFF",
    borderRadius: 3,
    border: "1px solid",
    borderColor: isDark ? "#3D3228" : "#E8E0D4",
    boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(92,64,51,0.06)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "table", sx: { width: "100%", minWidth: 800, borderCollapse: "collapse" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "thead", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "tr", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          component: "th",
          sx: {
            width: "auto",
            minWidth: 160,
            maxWidth: 220,
            p: 1.5,
            textAlign: "left",
            borderBottom: "2px solid",
            borderColor: isDark ? "#3D3228" : "#E8E0D4",
            bgcolor: isDark ? "#342A1E" : "#FFFFFF",
            position: "sticky",
            left: 0,
            zIndex: 2
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 700, sx: { textTransform: "uppercase", letterSpacing: "0.05em", color: isDark ? "#C4AA88" : "#5C4033" }, children: "Employee" })
        }
      ),
      weekDays.map((date) => {
        const today = isToday(date);
        const holiday = getHoliday(holidays, date);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            component: "th",
            sx: {
              p: 0,
              minWidth: 120,
              textAlign: "center",
              borderBottom: "2px solid",
              borderColor: isDark ? "#3D3228" : "#E8E0D4",
              bgcolor: today ? alpha(theme.palette.warning.light, isDark ? 0.08 : 0.15) : isDark ? "#342A1E" : "#F5F0E8",
              borderLeft: "1px solid",
              borderLeftColor: isDark ? "#3D3228" : "#E8E0D4"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, pb: holiday ? 0.5 : 1.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Typography,
                  {
                    variant: "caption",
                    fontWeight: 700,
                    sx: {
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: today ? "primary.main" : isDark ? "#C4AA88" : "#5C4033",
                      display: "block"
                    },
                    children: format(date, "EEE")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: today ? "primary.main" : "text.secondary", fontWeight: today ? 700 : 500 }, children: format(date, "MMM d") })
              ] }),
              holiday && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: holiday.name, arrow: true, placement: "bottom", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                width: "100%",
                bgcolor: holiday.workAllowed ? isDark ? "#064E3B" : "#DCFCE7" : isDark ? "#7F1D1D" : "#FEF2F2",
                color: holiday.workAllowed ? isDark ? "#6EE7B7" : "#166534" : isDark ? "#FCA5A5" : "#DC2626",
                py: 0.4,
                px: 0.75,
                fontSize: "0.6rem",
                fontWeight: 700,
                borderTop: "1px solid",
                borderColor: holiday.workAllowed ? isDark ? "#047857" : "#BBF7D0" : isDark ? "#991B1B" : "#FECACA",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
                textAlign: "center"
              }, children: holiday.name }) })
            ]
          },
          date.toISOString()
        );
      })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "tbody", children: [
      employees.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "tr", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "td", colSpan: 7, sx: { p: 4, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No employees found" }) }) }),
      employees.map((emp) => {
        const rc = getRoleColor(emp.position, emp.role);
        const isInactive = emp.isActive === false;
        const weekHours = weekDays.reduce((sum, date) => {
          const cellShifts = getShiftsForCell(shifts, emp.id, date);
          return sum + cellShifts.reduce((s, sh) => s + differenceInHours(new Date(sh.endTime), new Date(sh.startTime)), 0);
        }, 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            component: "tr",
            sx: {
              opacity: isInactive ? 0.5 : 1,
              "&:hover td": { bgcolor: isDark ? "#342A1E" : "#FBF8F4" }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  component: "td",
                  sx: {
                    p: 1.5,
                    borderBottom: "1px solid",
                    borderColor: isDark ? "#3D3228" : "#E8E0D4",
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    bgcolor: isDark ? "#2A2018" : "#FFFFFF"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: emp?.photoUrl || void 0, sx: { width: 28, height: 28, bgcolor: rc.bg, color: rc.text, fontSize: "0.65rem", fontWeight: 700 }, children: !emp?.photoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      emp?.firstName?.[0],
                      emp?.lastName?.[0]
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minWidth: 0, flex: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, noWrap: true, sx: { fontSize: "0.75rem", lineHeight: 1.3 }, children: [
                        emp.firstName,
                        " ",
                        emp.lastName?.[0],
                        ".",
                        isInactive && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { color: "text.disabled", fontSize: "0.6rem" }, children: " (Off)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Chip,
                          {
                            size: "small",
                            label: emp.position || emp.role || "Staff",
                            sx: {
                              height: 16,
                              fontSize: "0.55rem",
                              fontWeight: 600,
                              bgcolor: isDark ? rc.bgDark : rc.bgLight,
                              color: isDark ? rc.text : rc.bg
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: {
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          color: weekHours > 44 ? "#DC2626" : "#166534"
                        }, children: [
                          weekHours,
                          "h"
                        ] })
                      ] })
                    ] })
                  ] })
                }
              ),
              weekDays.map((date) => {
                const cellShifts = getShiftsForCell(shifts, emp.id, date);
                const today = isToday(date);
                const holiday = getHoliday(holidays, date);
                const isBlocked = holiday && !holiday.workAllowed;
                const cellTimeOff = getTimeOffForCell(allVisibleTimeOff, emp.id, date);
                const cellAdjustments = getAdjustmentsForCell(adjustmentLogs, emp.id, date);
                const hasTimeOff = cellTimeOff.length > 0;
                const hasApprovedTimeOff = cellTimeOff.some((r) => r.status === "approved");
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Box,
                  {
                    component: "td",
                    sx: {
                      p: 1,
                      borderBottom: "1px solid",
                      borderLeft: "1px solid",
                      borderColor: isDark ? "#3D3228" : "#E8E0D4",
                      verticalAlign: "top",
                      bgcolor: isBlocked ? alpha(theme.palette.error.main, isDark ? 0.06 : 0.04) : hasApprovedTimeOff ? alpha("#F59E0B", isDark ? 0.06 : 0.06) : today ? alpha(theme.palette.primary.main, isDark ? 0.06 : 0.06) : "transparent",
                      overflow: "visible",
                      transition: "background-color 0.2s",
                      "&:hover .add-shift-btn": {
                        opacity: 1,
                        transform: "scale(1)"
                      }
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      minHeight: 44,
                      overflow: "visible"
                    }, children: [
                      cellShifts.map((shift) => {
                        const trade = getTradeForShift(activeTrades, shift.id);
                        return /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ShiftPill,
                          {
                            shift,
                            trade,
                            isSelectionMode,
                            isSelected: isSelectionMode && selectedShifts?.has(shift.id),
                            onLogAdjustment: isManager && !isSelectionMode && onLogAdjustment ? () => onLogAdjustment(shift) : void 0,
                            onClick: () => {
                              if (isSelectionMode && onToggleShiftSelection) {
                                onToggleShiftSelection(shift.id);
                              } else {
                                onEditShift(shift);
                              }
                            }
                          },
                          shift.id
                        );
                      }),
                      (cellTimeOff.length > 0 || cellAdjustments.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 0.5 }, children: [
                        cellTimeOff.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          TimeOffIndicator,
                          {
                            request: req,
                            compact: true,
                            onDelete: isManager ? onDeleteTimeOff : void 0
                          },
                          `to-${req.id}`
                        )),
                        (() => {
                          const grouped = /* @__PURE__ */ new Map();
                          cellAdjustments.forEach((log) => {
                            const key = `${log.type}-${log.isIncluded}`;
                            if (!grouped.has(key)) {
                              grouped.set(key, { ...log, value: parseFloat(log.value) || 0, count: 1, logs: [log] });
                            } else {
                              const existing = grouped.get(key);
                              existing.value += parseFloat(log.value) || 0;
                              existing.count++;
                              existing.logs.push(log);
                            }
                          });
                          return Array.from(grouped.values()).map((aggrLog) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AdjustmentBadge,
                            {
                              log: aggrLog,
                              isSelectionMode,
                              isSelected: isSelectionMode && selectedLogs?.has(aggrLog.id),
                              onClick: () => {
                                if (isSelectionMode && onToggleLogSelection) {
                                  aggrLog.logs.forEach((l) => onToggleLogSelection(l.id));
                                } else if (!isSelectionMode && onManageLogGroup) {
                                  onManageLogGroup(aggrLog.logs);
                                } else if (!isSelectionMode && onExceptionLogClick) {
                                  onExceptionLogClick(aggrLog.logs?.[0] || aggrLog);
                                }
                              }
                            },
                            `adj-group-${aggrLog.id}`
                          ));
                        })()
                      ] }),
                      cellShifts.length === 0 && !hasApprovedTimeOff && isManager && !isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "add-shift-btn", sx: { display: "flex", flexDirection: "column", gap: 0.5, opacity: 0, transform: "scale(0.95)", transition: "all 0.2s ease", "&:hover": { opacity: 1, transform: "scale(1)" } }, children: [
                        !isBlocked && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Add shift", placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          IconButton,
                          {
                            size: "small",
                            onClick: () => onCreateShift(emp.id, date),
                            sx: {
                              width: "100%",
                              height: 28,
                              borderRadius: 1.5,
                              border: "1px dashed",
                              borderColor: isDark ? alpha("#C4AA88", 0.2) : alpha("#5C4033", 0.1),
                              color: isDark ? alpha("#C4AA88", 0.3) : alpha("#5C4033", 0.2),
                              "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.04) }
                            },
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { sx: { fontSize: 14 } })
                          }
                        ) }),
                        holiday && onAddHolidayPay && !cellAdjustments.some((a) => a.type === "holiday_pay") && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Grant Holiday Pay (No work performed)", placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Box,
                          {
                            onClick: () => onAddHolidayPay(emp.id, date),
                            sx: { width: "100%", height: 28, borderRadius: 1.5, border: "1px dashed", borderColor: "#10B981", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.65rem", fontWeight: 800, "&:hover": { bgcolor: alpha("#10B981", 0.1) } },
                            children: "+ Holiday Pay"
                          }
                        ) })
                      ] }),
                      isBlocked && cellShifts.length === 0 && !hasTimeOff && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 32,
                        color: isDark ? alpha("#FCA5A5", 0.4) : alpha("#DC2626", 0.3),
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        fontStyle: "italic"
                      }, children: "Blocked" })
                    ] })
                  },
                  date.toISOString()
                );
              })
            ]
          },
          emp.id
        );
      })
    ] })
  ] }) });
}

function toDate$1(val) {
  if (!val) return /* @__PURE__ */ new Date(0);
  const d = val instanceof Date ? val : new Date(val);
  return isValid(d) ? d : /* @__PURE__ */ new Date(0);
}
function toDateStr(val) {
  return format(toDate$1(val), "yyyy-MM-dd");
}
function safeFormat$2(val, fmt) {
  try {
    return format(toDate$1(val), fmt);
  } catch {
    return "--";
  }
}
function MyDayView({
  shifts,
  date,
  currentUserId,
  onDateChange,
  timeOffRequests = [],
  shiftTrades = []
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dateStr = format(date, "yyyy-MM-dd");
  const myShifts = shifts.filter(
    (s) => s.userId === currentUserId && toDateStr(s.startTime) === dateStr
  );
  const myTimeOff = timeOffRequests.filter(
    (r) => r.userId === currentUserId && dateStr >= toDateStr(r.startDate) && dateStr <= toDateStr(r.endDate) && (r.status === "pending" || r.status === "approved" || r.status === "rejected" || r.status === "cancelled")
  );
  const myTrades = shiftTrades.filter((t) => {
    const shiftIds = myShifts.map((s) => s.id);
    return shiftIds.includes(t.shiftId) && (t.status === "pending" || t.status === "accepted");
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => onDateChange(subDays(date, 1)), size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, sx: { color: isToday(date) ? "primary.main" : "text.primary" }, children: isToday(date) ? "Today" : format(date, "EEEE") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: format(date, "MMMM d, yyyy") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => onDateChange(addDays(date, 1)), size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {}) })
    ] }),
    myTimeOff.map((req) => {
      const statusConfig = {
        pending: { bg: "#FEF3C7", border: "#FDE68A", color: "#92400E", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PendingIcon, { sx: { fontSize: 16, color: "#F59E0B" } }), label: "Pending Approval" },
        approved: { bg: "#DCFCE7", border: "#A7F3D0", color: "#166534", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16, color: "#10B981" } }), label: "Approved" },
        rejected: { bg: "#FEE2E2", border: "#FECACA", color: "#991B1B", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 16, color: "#EF4444" } }), label: "Rejected" },
        cancelled: { bg: "#F3F4F6", border: "#D1D5DB", color: "#6B7280", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 16, color: "#6B7280" } }), label: "Cancelled" }
      }[req.status] || { bg: "#F3F4F6", border: "#D1D5DB", color: "#6B7280", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 16 } }), label: req.status };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          sx: {
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            mb: 1.5,
            borderRadius: 2.5,
            bgcolor: isDark ? alpha(statusConfig.bg, 0.15) : statusConfig.bg,
            border: `1px ${req.status === "pending" ? "dashed" : "solid"}`,
            borderColor: statusConfig.border
          },
          children: [
            statusConfig.icon,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, sx: { color: statusConfig.color }, children: [
                req.type.charAt(0).toUpperCase() + req.type.slice(1),
                " Leave"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: statusConfig.color, opacity: 0.8 }, children: [
                statusConfig.label,
                req.reason && ` · "${req.reason}"`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: statusConfig.label,
                size: "small",
                sx: { height: 22, fontSize: "0.62rem", fontWeight: 700, bgcolor: "transparent", color: statusConfig.color, border: `1px solid ${statusConfig.border}` }
              }
            )
          ]
        },
        `timeoff-${req.id}`
      );
    }),
    myShifts.length === 0 && myTimeOff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { mb: 1 }, children: "☕" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, children: "Day Off" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No shifts scheduled" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: myShifts.map((shift) => {
      const rc = getRoleColor(shift.position, shift.user?.role);
      const hours = differenceInHours(toDate$1(shift.endTime), toDate$1(shift.startTime));
      const startHour = toDate$1(shift.startTime).getHours();
      const period = startHour < 12 ? "🌅 Morning" : startHour < 17 ? "☀️ Afternoon" : "🌙 Evening";
      const trade = myTrades.find((t) => t.shiftId === shift.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            border: trade ? "2px dashed" : "1px solid",
            borderColor: trade ? trade.status === "accepted" ? "#3B82F6" : "#8B5CF6" : isDark ? "#3D3228" : "#E8E0D4",
            bgcolor: isDark ? "#2A2018" : "#FFFFFF"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              px: 2,
              py: 1.5,
              bgcolor: isDark ? alpha(rc.bg, 0.15) : alpha(rc.bg, 0.1),
              color: isDark ? rc.bgLight : rc.bgDark,
              borderBottom: `1px solid ${alpha(rc.border, 0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 700, children: period }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
                trade && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 14, color: "inherit" } }),
                    label: trade.status === "accepted" ? "Traded" : "Trade Pending",
                    size: "small",
                    sx: {
                      height: 22,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      bgcolor: alpha(rc.bg, 0.2),
                      color: isDark ? rc.bgLight : rc.bgDark,
                      "& .MuiChip-icon": { color: "inherit" }
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: shift.position || "Staff", size: "small", sx: { height: 22, bgcolor: alpha(rc.bg, 0.2), color: isDark ? rc.bgLight : rc.bgDark, fontWeight: 700, border: `1px solid ${alpha(rc.border, 0.3)}` } })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", fontWeight: 800, sx: { mb: 0.5 }, children: [
                safeFormat$2(shift.startTime, "h:mm a"),
                " – ",
                safeFormat$2(shift.endTime, "h:mm a")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                hours,
                " hours"
              ] }),
              shift.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 1, fontStyle: "italic" }, children: [
                "Note: ",
                shift.notes
              ] })
            ] })
          ]
        },
        shift.id
      );
    }) })
  ] });
}
function DayView({
  employees,
  shifts,
  date,
  holidays,
  isManager,
  currentUserId,
  timeOffRequests = [],
  shiftTrades = [],
  adjustmentLogs = [],
  isSelectionMode,
  selectedShifts,
  selectedLogs,
  onToggleShiftSelection,
  onToggleLogSelection,
  onManageLogGroup,
  onDateChange,
  onCreateShift,
  onEditShift,
  onDeleteTimeOff,
  onAddHolidayPay,
  onLogAdjustment
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dateStr = format(date, "yyyy-MM-dd");
  const dayShifts = shifts.filter((s) => toDateStr(s.startTime) === dateStr);
  const holiday = holidays.find((h) => format(toDate$1(h.date), "yyyy-MM-dd") === dateStr);
  const dayTimeOff = timeOffRequests.filter(
    (r) => dateStr >= toDateStr(r.startDate) && dateStr <= toDateStr(r.endDate) && (r.status === "pending" || r.status === "approved" || r.status === "rejected" || r.status === "cancelled")
  );
  const activeTrades = shiftTrades.filter((t) => t.status === "pending" || t.status === "accepted");
  const sortedShifts = [...dayShifts].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => onDateChange(subDays(date, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", fontWeight: 700, sx: { color: isToday(date) ? "primary.main" : "text.primary" }, children: [
          format(date, "EEEE, MMMM d"),
          isToday(date) && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Today", size: "small", color: "primary", sx: { ml: 1, height: 20, fontSize: "0.65rem" } })
        ] }),
        holiday && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `${holiday.workAllowed ? "📅" : "🚫"} ${holiday.name}`,
            size: "small",
            color: holiday.workAllowed ? "success" : "error",
            variant: "outlined",
            sx: { mt: 0.5 }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => onDateChange(addDays(date, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      mb: 2,
      p: 1.5,
      borderRadius: 2,
      bgcolor: isDark ? "#342A1E" : "#F5F0E8",
      flexWrap: "wrap"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, children: [
        sortedShifts.length,
        " shift",
        sortedShifts.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "·" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        new Set(sortedShifts.map((s) => s.userId)).size,
        " employees working"
      ] }),
      dayTimeOff.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 14 } }),
            label: `${dayTimeOff.length} time-off`,
            size: "small",
            sx: { height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#FEF3C7", color: "#92400E", "& .MuiChip-icon": { color: "#F59E0B" } }
          }
        )
      ] }),
      activeTrades.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 14 } }),
            label: `${activeTrades.length} trade${activeTrades.length !== 1 ? "s" : ""}`,
            size: "small",
            sx: { height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F5F3FF", color: "#7C3AED", "& .MuiChip-icon": { color: "#8B5CF6" } }
          }
        )
      ] })
    ] }),
    dayTimeOff.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 1, mb: 2 }, children: dayTimeOff.map((req) => {
      const emp = employees.find((e) => e.id === req.userId);
      const statusConfig = {
        pending: { bg: "#FEF3C7", border: "#FDE68A", color: "#92400E", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PendingIcon, { sx: { fontSize: 18, color: "#F59E0B" } }), label: "Pending" },
        approved: { bg: "#DCFCE7", border: "#A7F3D0", color: "#166534", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 18, color: "#10B981" } }), label: req.isPaid ? "Approved (Paid)" : "Approved (Unpaid)" },
        rejected: { bg: "#FEE2E2", border: "#FECACA", color: "#991B1B", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 18, color: "#EF4444" } }), label: "Rejected" },
        cancelled: { bg: "#F3F4F6", border: "#D1D5DB", color: "#6B7280", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 18, color: "#6B7280" } }), label: "Cancelled" }
      }[req.status] || { bg: "#F3F4F6", border: "#D1D5DB", color: "#6B7280", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 18 } }), label: req.status };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          onClick: () => {
            if (isManager && onDeleteTimeOff) {
              onDeleteTimeOff(req.id);
            }
          },
          sx: {
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            border: `1px ${req.status === "pending" ? "dashed" : "solid"}`,
            borderColor: statusConfig.border,
            bgcolor: isDark ? alpha(statusConfig.bg, 0.08) : statusConfig.bg,
            ...isManager && onDeleteTimeOff && {
              cursor: "pointer",
              transition: "all 0.1s ease",
              "&:hover": { filter: "brightness(0.95)" }
            }
          },
          children: [
            statusConfig.icon,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, noWrap: true, children: emp ? `${emp.firstName} ${emp.lastName}` : req.userName || "Unknown" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                req.type.charAt(0).toUpperCase() + req.type.slice(1),
                " Leave · ",
                statusConfig.label,
                isManager && onDeleteTimeOff && " · (Click to manage)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: statusConfig.label,
                size: "small",
                sx: {
                  height: 20,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color
                }
              }
            )
          ]
        },
        `to-${req.id}`
      );
    }) }),
    sortedShifts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { mb: 1 }, children: "📭" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, children: "No shifts scheduled" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Click + to add a shift" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: sortedShifts.map((shift) => {
      const emp = employees.find((e) => e.id === shift.userId);
      const rc = getRoleColor(shift.position, emp?.role);
      const hours = differenceInHours(toDate$1(shift.endTime), toDate$1(shift.startTime));
      const trade = activeTrades.find((t) => t.shiftId === shift.id);
      const adjustments = getAdjustmentsForCell(adjustmentLogs, shift.userId, date);
      const isSelected = isSelectionMode && selectedShifts?.has(shift.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          onClick: () => {
            if (isSelectionMode && onToggleShiftSelection) {
              onToggleShiftSelection(shift.id);
            } else {
              onEditShift(shift);
            }
          },
          sx: {
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 2.5,
            border: trade ? "2px dashed" : "1px solid",
            borderColor: isSelected ? "#3B82F6" : trade ? trade.status === "accepted" ? "#93C5FD" : "#C4B5FD" : isDark ? "#3D3228" : "#E8E0D4",
            borderLeft: `5px solid ${rc.bg}`,
            bgcolor: isSelected ? alpha("#3B82F6", 0.1) : isDark ? "#2A2018" : "#FFFFFF",
            cursor: "pointer",
            transition: "background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
            boxShadow: isSelected ? "0 0 0 2px #3B82F6, 0 4px 12px rgba(59, 130, 246, 0.4)" : void 0,
            position: "relative",
            "&:hover": {
              bgcolor: isSelected ? alpha("#3B82F6", 0.15) : isDark ? "#342A1E" : "#FBF8F4",
              boxShadow: isSelected ? "0 0 0 2px #3B82F6, 0 4px 12px rgba(59, 130, 246, 0.4)" : "0 3px 10px rgba(0,0,0,0.08)"
            }
          },
          children: [
            isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -5, right: -5, bgcolor: "#3B82F6", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: 2, zIndex: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 13, fontWeight: 900 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { sx: { width: 44, height: 44, bgcolor: rc.bg, color: rc.text, fontWeight: 700, fontSize: "0.85rem" }, children: [
              emp?.firstName?.[0],
              emp?.lastName?.[0]
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", fontWeight: 700, noWrap: true, children: emp ? `${emp.firstName} ${emp.lastName}` : "Unknown" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: shift.position || "Staff", sx: {
                  height: 20,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  bgcolor: isDark ? rc.bgDark : rc.bgLight,
                  color: isDark ? rc.text : rc.bg
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                  safeFormat$2(shift.startTime, "h:mm a"),
                  " – ",
                  safeFormat$2(shift.endTime, "h:mm a"),
                  " · ",
                  hours,
                  "h"
                ] }),
                trade && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 12 } }),
                    label: trade.status === "accepted" ? "Traded" : "Trade Pending",
                    size: "small",
                    sx: {
                      height: 20,
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      bgcolor: trade.status === "accepted" ? "#DBEAFE" : "#F5F3FF",
                      color: trade.status === "accepted" ? "#1E40AF" : "#7C3AED",
                      "& .MuiChip-icon": { color: "inherit" }
                    }
                  }
                ),
                adjustments.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AdjustmentBadge,
                  {
                    log,
                    isSelected: isSelectionMode && selectedLogs?.has(log.id),
                    onClick: (e) => {
                      e.stopPropagation();
                      if (isSelectionMode && onToggleLogSelection) {
                        onToggleLogSelection(log.id);
                      } else if (!isSelectionMode && onManageLogGroup) {
                        onManageLogGroup([log]);
                      }
                    }
                  },
                  `adj-${log.id}`
                ))
              ] })
            ] }),
            isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { sx: { fontSize: 18, color: "text.disabled" } })
          ]
        },
        shift.id
      );
    }) }),
    isManager && !isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        onClick: () => onCreateShift("", date),
        sx: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mt: 2,
          py: 1.5,
          borderRadius: 2.5,
          border: "2px dashed",
          borderColor: isDark ? "#3D3228" : "#D4C4A8",
          color: "text.secondary",
          cursor: "pointer",
          fontWeight: 600,
          "&:hover": { borderColor: "primary.main", color: "primary.main" }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { sx: { fontSize: 20 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Add Shift" })
        ]
      }
    )
  ] });
}

function toDate(val) {
  if (!val) return /* @__PURE__ */ new Date(0);
  const d = val instanceof Date ? val : new Date(val);
  return isValid(d) ? d : /* @__PURE__ */ new Date(0);
}
function safeFormat$1(val, fmt) {
  try {
    return format(toDate(val), fmt);
  } catch {
    return "--";
  }
}
const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  approved: { bg: "#DCFCE7", color: "#166534" },
  rejected: { bg: "#FEE2E2", color: "#991B1B" },
  accepted: { bg: "#DBEAFE", color: "#1E40AF" },
  cancelled: { bg: "#F3F4F6", color: "#6B7280" }
};
function StatusChip({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Chip,
    {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      size: "small",
      sx: {
        height: 22,
        fontSize: "0.68rem",
        fontWeight: 700,
        bgcolor: colors.bg,
        color: colors.color
      }
    }
  );
}
function getEmployeeName(employees, userId) {
  const emp = employees.find((e) => String(e.id) === String(userId));
  return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
}
function RequestsPanel({
  timeOffRequests,
  shiftTrades,
  employees,
  shifts = [],
  isManager,
  currentUserId,
  adjustmentLogs = [],
  onApproveTimeOff,
  onRejectTimeOff,
  onApproveTrade,
  onRejectTrade,
  onAcceptTrade,
  onDeclineTrade,
  onCancelTrade,
  onTakeOpenTrade
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [rejectDialogOpen, setRejectDialogOpen] = reactExports.useState(false);
  const [rejectingId, setRejectingId] = reactExports.useState(null);
  const [rejectionReason, setRejectionReason] = reactExports.useState("");
  const [approveAnchorEl, setApproveAnchorEl] = reactExports.useState(null);
  const [approvingId, setApprovingId] = reactExports.useState(null);
  const handleOpenApproveMenu = (event, id) => {
    setApproveAnchorEl(event.currentTarget);
    setApprovingId(id);
  };
  const handleCloseApproveMenu = () => {
    setApproveAnchorEl(null);
    setApprovingId(null);
  };
  const complianceWarnings = React.useMemo(() => {
    if (!shifts || shifts.length === 0 || !employees) return [];
    const now = /* @__PURE__ */ new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const thisWeekStart = new Date(now.setDate(diff));
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);
    const currentWeekShifts = shifts.filter((s) => {
      const start = new Date(s.startTime);
      return start >= thisWeekStart && start <= thisWeekEnd;
    });
    const hoursMap = {};
    currentWeekShifts.forEach((shift) => {
      const e = new Date(shift.endTime).getTime();
      const s = new Date(shift.startTime).getTime();
      const diffHrs = (e - s) / 1e3 / 3600;
      hoursMap[shift.userId] = (hoursMap[shift.userId] || 0) + diffHrs;
    });
    const warnings = [];
    Object.keys(hoursMap).forEach((userId) => {
      if (hoursMap[userId] > 48) {
        const empName = getEmployeeName(employees, userId);
        warnings.push(`${empName} is scheduled for ${hoursMap[userId].toFixed(1)} hours this week (> 48h limit).`);
      }
    });
    timeOffRequests.filter((r) => r.status === "pending").forEach((req) => {
      const reqStart = new Date(req.startDate);
      reqStart.setHours(0, 0, 0, 0);
      const reqEnd = new Date(req.endDate);
      reqEnd.setHours(23, 59, 59, 999);
      const overlappingShifts = shifts.filter((s) => {
        if (s.userId !== req.userId) return false;
        const sTime = new Date(s.startTime);
        return sTime >= reqStart && sTime <= reqEnd;
      });
      if (overlappingShifts.length > 0) {
        const empName = getEmployeeName(employees, req.userId);
        warnings.push(`${empName} has a pending leave request but is scheduled for ${overlappingShifts.length} shift(s) during that time.`);
      }
    });
    return warnings;
  }, [shifts, timeOffRequests, employees]);
  const handleConfirmApprove = (useSil) => {
    if (approvingId) {
      onApproveTimeOff(approvingId, useSil);
    }
    handleCloseApproveMenu();
  };
  const handleOpenRejectDialog = (id) => {
    setRejectingId(id);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };
  const handleConfirmReject = () => {
    if (rejectingId) {
      onRejectTimeOff(rejectingId, rejectionReason.trim());
    }
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectionReason("");
  };
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectionReason("");
  };
  const pendingTimeOff = timeOffRequests.filter((r) => r.status === "pending");
  const pendingTrades = shiftTrades.filter((t) => t.status === "pending" || t.status === "accepted");
  [
    ...timeOffRequests.filter((r) => r.status !== "pending"),
    ...shiftTrades.filter((t) => t.status !== "pending" && t.status !== "accepted"),
    ...adjustmentLogs
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt || b.requestedAt || b.date || 0).getTime() - new Date(a.updatedAt || a.createdAt || a.requestedAt || a.date || 0).getTime()).slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          defaultExpanded: true,
          disableGutters: true,
          elevation: 0,
          sx: {
            bgcolor: "transparent",
            "&:before": { display: "none" }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AccordionSummary,
              {
                expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, {}),
                sx: { px: 0, minHeight: 48, "& .MuiAccordionSummary-content": { my: 0 } },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { fontSize: 20, color: "#F59E0B" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Time-Off Requests" }),
                  pendingTimeOff.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: pendingTimeOff.length, size: "small", color: "warning", sx: { height: 22, fontWeight: 700 } })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { sx: { px: 0, pt: 0, pb: 2 }, children: pendingTimeOff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 3,
              gap: 1,
              bgcolor: isDark ? alpha("#F59E0B", 0.03) : alpha("#F59E0B", 0.04),
              borderRadius: 2
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EventBusyIcon, { sx: { fontSize: 28, color: isDark ? alpha("#F59E0B", 0.25) : alpha("#92400E", 0.15) } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontSize: "0.8rem", fontWeight: 500 }, children: "No pending requests" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1.5, children: pendingTimeOff.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                variant: "outlined",
                sx: {
                  borderColor: isDark ? "#3D3228" : "#FDE68A",
                  borderLeft: "4px solid #F59E0B",
                  bgcolor: isDark ? "#342A1E" : "#FFFBEB"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, children: req.userName || getEmployeeName(employees, req.userId) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { status: req.status })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: req.type }),
                    " · ",
                    safeFormat$1(req.startDate, "MMM d"),
                    " – ",
                    safeFormat$1(req.endDate, "MMM d, yyyy")
                  ] }),
                  req.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { fontStyle: "italic", display: "block", mb: 0.5 }, children: [
                    '"',
                    req.reason,
                    '"'
                  ] }),
                  isManager && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "small",
                        variant: "contained",
                        color: "success",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                        onClick: (e) => handleOpenApproveMenu(e, req.id),
                        sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                        children: "Approve"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "small",
                        variant: "outlined",
                        color: "error",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Block, {}),
                        onClick: () => handleOpenRejectDialog(req.id),
                        sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                        children: "Reject"
                      }
                    )
                  ] })
                ] })
              },
              req.id
            )) }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { borderColor: isDark ? "#3D3228" : "#E8E0D4" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          defaultExpanded: true,
          disableGutters: true,
          elevation: 0,
          sx: {
            bgcolor: "transparent",
            "&:before": { display: "none" }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AccordionSummary,
              {
                expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, {}),
                sx: { px: 0, minHeight: 48, "& .MuiAccordionSummary-content": { my: 0 } },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 20, color: "#8B5CF6" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Shift Trades" }),
                  pendingTrades.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: pendingTrades.length, size: "small", color: "secondary", sx: { height: 22, fontWeight: 700 } })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionDetails, { sx: { px: 0, pt: 0, pb: 2 }, children: [
              "          ",
              pendingTrades.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 3,
                gap: 1,
                bgcolor: isDark ? alpha("#8B5CF6", 0.03) : alpha("#8B5CF6", 0.04),
                borderRadius: 2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { fontSize: 28, color: isDark ? alpha("#8B5CF6", 0.25) : alpha("#5B21B6", 0.15) } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontSize: "0.8rem", fontWeight: 500 }, children: "No pending shift trades" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1.5, children: pendingTrades.map((trade) => {
                const isRequester = trade.requesterId === currentUserId || trade.fromUserId === currentUserId;
                const isTarget = trade.targetUserId === currentUserId || trade.toUserId === currentUserId;
                const hasTarget = !!(trade.targetUserId || trade.toUserId);
                const isOpenTrade = !hasTarget;
                const isPending = trade.status === "pending";
                const isAccepted = trade.status === "accepted";
                const requesterName = trade.requester?.firstName || trade.fromUser?.firstName || "Unknown";
                const requesterLast = trade.requester?.lastName || trade.fromUser?.lastName || "";
                const targetName = trade.targetUser?.firstName || trade.toUser?.firstName || "";
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    variant: "outlined",
                    sx: {
                      borderColor: isDark ? "#3D3228" : isAccepted ? "#93C5FD" : "#C4B5FD",
                      borderLeft: `4px solid ${isAccepted ? "#3B82F6" : "#8B5CF6"}`,
                      bgcolor: isDark ? "#342A1E" : isAccepted ? "#EFF6FF" : "#F5F3FF"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, children: isOpenTrade ? `${requesterName} ${requesterLast}` : `${requesterName} → ${targetName}` }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 0.5 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: isOpenTrade ? "Open" : "Direct", size: "small", variant: "outlined", sx: { height: 20, fontSize: "0.6rem" } }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { status: trade.status })
                        ] })
                      ] }),
                      trade.shift && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 0.5 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleIcon, { sx: { fontSize: 12, verticalAlign: "middle", mr: 0.5 } }),
                        trade.shift.date && safeFormat$1(trade.shift.date, "MMM d"),
                        trade.shift.startTime && ` · ${safeFormat$1(trade.shift.startTime, "h:mm a")}`,
                        trade.shift.endTime && ` – ${safeFormat$1(trade.shift.endTime, "h:mm a")}`
                      ] }),
                      trade.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { fontStyle: "italic" }, children: [
                        '"',
                        trade.reason,
                        '"'
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }, children: [
                        isManager && hasTarget && (isPending || isAccepted) && !isRequester && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "small",
                              variant: "contained",
                              color: "success",
                              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                              onClick: () => onApproveTrade(trade.id),
                              sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                              children: "Approve"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "small",
                              variant: "outlined",
                              color: "error",
                              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
                              onClick: () => onRejectTrade(trade.id),
                              sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                              children: "Reject"
                            }
                          )
                        ] }),
                        isTarget && isPending && !isManager && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "small",
                              variant: "contained",
                              color: "primary",
                              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                              onClick: () => onAcceptTrade(trade.id),
                              sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                              children: "Accept"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              size: "small",
                              variant: "outlined",
                              color: "error",
                              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
                              onClick: () => onDeclineTrade(trade.id),
                              sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                              children: "Decline"
                            }
                          )
                        ] }),
                        isOpenTrade && isPending && !isRequester && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            size: "small",
                            variant: "contained",
                            color: "primary",
                            onClick: () => onTakeOpenTrade(trade.id),
                            sx: { flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 },
                            children: "Take This Shift"
                          }
                        ),
                        isRequester && (isPending || isAccepted) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            size: "small",
                            variant: "outlined",
                            color: "error",
                            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                            onClick: () => onCancelTrade(trade.id),
                            sx: { textTransform: "none", fontWeight: 600, borderRadius: 2 },
                            children: "Cancel"
                          }
                        )
                      ] })
                    ] })
                  },
                  trade.id
                );
              }) })
            ] })
          ]
        }
      ),
      isManager && complianceWarnings?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { borderColor: isDark ? "#3D3228" : "#E8E0D4" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Accordion,
          {
            defaultExpanded: true,
            disableGutters: true,
            elevation: 0,
            sx: {
              bgcolor: "transparent",
              "&:before": { display: "none" }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AccordionSummary,
                {
                  expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, {}),
                  sx: { px: 0, minHeight: 40, "& .MuiAccordionSummary-content": { my: 0 } },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", fontWeight: 600, color: "error", sx: { textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentLateIcon, { fontSize: "small" }),
                    " Compliance Warnings"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { sx: { px: 0, pt: 0, pb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1, children: complianceWarnings.map((warning, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha("#EF4444", 0.1),
                border: `1px solid ${alpha("#EF4444", 0.2)}`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error.dark", fontWeight: 600, children: warning }) }, i)) }) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: rejectDialogOpen,
        onClose: handleCloseRejectDialog,
        maxWidth: "xs",
        fullWidth: true,
        PaperProps: { sx: { borderRadius: 3 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: 800, color: "error.main", pb: 1 }, children: "Reject Time-Off Request" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Optionally provide a reason for the rejection. This will be sent to the employee." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                autoFocus: true,
                fullWidth: true,
                multiline: true,
                rows: 3,
                label: "Reason for rejection",
                placeholder: "e.g. Insufficient coverage on that date, please try another date.",
                value: rejectionReason,
                onChange: (e) => setRejectionReason(e.target.value),
                InputProps: { sx: { borderRadius: 2 } },
                inputProps: { maxLength: 300 },
                helperText: `${rejectionReason.length}/300`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2, gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCloseRejectDialog, variant: "outlined", sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleConfirmReject,
                variant: "contained",
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Block, {}),
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
                children: "Confirm Rejection"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl: approveAnchorEl,
        open: Boolean(approveAnchorEl),
        onClose: handleCloseApproveMenu,
        PaperProps: { sx: { mt: 1, borderRadius: 2, minWidth: 240 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => handleConfirmApprove(true), sx: { py: 1.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, color: "success.main", children: "Approve as Paid Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Deducts from Leave Balance (SIL/Vacation)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 0.5 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => handleConfirmApprove(false), sx: { py: 1.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, children: "Approve as Unpaid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Leave Without Pay (LWOP)" })
          ] })
        ]
      }
    )
  ] });
}

const TYPE_LABELS = {
  overtime: "Overtime",
  late: "Tardiness",
  undertime: "Undertime",
  absent: "Absent",
  rest_day_ot: "Rest Day OT",
  special_holiday_ot: "Special Holiday OT",
  regular_holiday_ot: "Regular Holiday OT",
  night_diff: "Night Differential"
};
const TYPE_COLORS = {
  overtime: "#10b981",
  late: "#f97316",
  undertime: "#ec4899",
  absent: "#dc2626",
  rest_day_ot: "#3b82f6",
  special_holiday_ot: "#f59e0b",
  regular_holiday_ot: "#ef4444",
  night_diff: "#8b5cf6"
};
const STATUS_CONFIG = {
  pending: { label: "Pending Review", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" },
  employee_verified: { label: "Confirmed by Employee", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
  disputed: { label: "Disputed", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" },
  approved: { label: "Approved for Payroll", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
  rejected: { label: "Rejected", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)" }
};
function ExceptionLogDrawer({ open, onClose, log, isManager, onApprove, onReject }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [disputeReason, setDisputeReason] = reactExports.useState("");
  const [showDisputeInput, setShowDisputeInput] = reactExports.useState(false);
  const [commentText, setCommentText] = reactExports.useState("");
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["adjustment-log-comments", log?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/adjustment-logs/${log.id}/comments`);
      return res.json();
    },
    enabled: !!log?.id && open
  });
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${log.id}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-mine"] });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
      onClose();
    }
  });
  const disputeMutation = useMutation({
    mutationFn: async (reason) => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${log.id}/dispute`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-mine"] });
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs-branch"] });
      setShowDisputeInput(false);
      setDisputeReason("");
      onClose();
    }
  });
  const postCommentMutation = useMutation({
    mutationFn: async (message) => {
      const res = await apiRequest("POST", `/api/adjustment-logs/${log.id}/comments`, { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustment-log-comments", log?.id] });
      setCommentText("");
    }
  });
  if (!log) return null;
  const typeLabel = TYPE_LABELS[log.type] || log.type;
  const typeColor = TYPE_COLORS[log.type] || "#6b7280";
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
  const isDeduction = ["late", "undertime", "absent"].includes(log.type);
  const valueUnit = log.type === "late" || log.type === "undertime" ? "mins" : log.type === "absent" ? "days" : "hrs";
  const canRespond = !isManager && (log.status === "pending" || log.status === "disputed");
  const comments = commentsData?.comments || [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Drawer,
    {
      anchor: "right",
      open,
      onClose,
      PaperProps: {
        sx: {
          width: { xs: "100%", sm: 440 },
          bgcolor: theme.palette.background.default
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(typeColor, 0.08)} 0%, ${alpha(typeColor, 0.02)} 100%)`,
          borderBottom: `1px solid ${alpha(typeColor, 0.15)}`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: typeLabel,
                size: "small",
                sx: {
                  bgcolor: alpha(typeColor, 0.12),
                  color: typeColor,
                  fontWeight: 700,
                  mb: 1
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, children: "Exception Log Detail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: log.startDate ? format(new Date(log.startDate), "EEEE, MMMM d, yyyy") : "Date not available" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
          mx: 2.5,
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: statusConfig.bgColor,
          border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: statusConfig.color,
            boxShadow: `0 0 8px ${alpha(statusConfig.color, 0.5)}`,
            animation: log.status === "pending" ? "pulse 2s infinite" : "none",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.4 }
            }
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, sx: { color: statusConfig.color }, children: statusConfig.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              p: 2,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${theme.palette.divider}`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", fontWeight: 600, sx: { textTransform: "uppercase", letterSpacing: 1 }, children: isDeduction ? "Deduction" : "Earning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", fontWeight: 800, sx: { color: isDeduction ? "error.main" : "success.main", mt: 0.5 }, children: [
                log.value,
                " ",
                valueUnit
              ] }),
              log.calculatedAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 600, sx: { color: isDeduction ? "error.main" : "success.main", mt: 0.5 }, children: [
                isDeduction ? "-" : "+",
                "₱",
                Math.abs(parseFloat(log.calculatedAmount)).toLocaleString(void 0, { minimumFractionDigits: 2 })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { sx: { fontSize: 14, color: "text.secondary" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Logged by" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: log.loggedByName || "Manager" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, { sx: { fontSize: 14, color: "text.secondary" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Created" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: log.createdAt ? format(new Date(log.createdAt), "MMM d, h:mm a") : "—" })
              ] })
            ] }),
            log.remarks && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", fontWeight: 600, children: "Manager Remarks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mt: 0.5 }, children: log.remarks })
            ] }),
            log.disputeReason && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, borderRadius: 2, bgcolor: alpha("#ef4444", 0.04), border: `1px solid ${alpha("#ef4444", 0.15)}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error", fontWeight: 600, children: "Dispute Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mt: 0.5 }, children: log.disputeReason })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2.5 } }),
          canRespond && !showDisputeInput && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, sx: { mb: 2.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "contained",
                color: "success",
                startIcon: verifyMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
                onClick: () => verifyMutation.mutate(),
                disabled: verifyMutation.isPending,
                sx: { borderRadius: 2.5, py: 1.5, textTransform: "none", fontWeight: 700 },
                children: "Confirm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "outlined",
                color: "warning",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}),
                onClick: () => setShowDisputeInput(true),
                sx: { borderRadius: 2.5, py: 1.5, textTransform: "none", fontWeight: 700, borderWidth: 2 },
                children: "Dispute"
              }
            )
          ] }),
          showDisputeInput && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                multiline: true,
                rows: 3,
                placeholder: "Explain why you're disputing this record...",
                value: disputeReason,
                onChange: (e) => setDisputeReason(e.target.value),
                sx: { mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "contained",
                  color: "warning",
                  startIcon: disputeMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}),
                  onClick: () => disputeReason.trim() && disputeMutation.mutate(disputeReason),
                  disabled: !disputeReason.trim() || disputeMutation.isPending,
                  sx: { borderRadius: 2, textTransform: "none", fontWeight: 600 },
                  children: "Submit Dispute"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  onClick: () => {
                    setShowDisputeInput(false);
                    setDisputeReason("");
                  },
                  sx: { borderRadius: 2, textTransform: "none" },
                  children: "Cancel"
                }
              )
            ] })
          ] }),
          isManager && (log.status === "pending" || log.status === "employee_verified" || log.status === "disputed") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, sx: { mb: 2.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "contained",
                color: "success",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
                onClick: () => onApprove?.(log.id),
                sx: { borderRadius: 2.5, py: 1.5, textTransform: "none", fontWeight: 700 },
                children: "Approve"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "outlined",
                color: "error",
                onClick: () => onReject?.(log.id),
                sx: { borderRadius: 2.5, py: 1.5, textTransform: "none", fontWeight: 700 },
                children: "Reject"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChatIcon, { sx: { fontSize: 18, color: "text.secondary" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", fontWeight: 700, children: [
                "Comments ",
                comments.length > 0 ? `(${comments.length})` : ""
              ] })
            ] }),
            commentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) }) : comments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 3, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No comments yet. Start a conversation about this log." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1.5, sx: { mb: 2, maxHeight: 300, overflowY: "auto", pr: 0.5 }, children: comments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(
                    comment.userRole === "manager" || comment.userRole === "admin" ? theme.palette.primary.main : theme.palette.success.main,
                    0.06
                  ),
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 22, height: 22, fontSize: "0.7rem", bgcolor: comment.userRole === "manager" || comment.userRole === "admin" ? "primary.main" : "success.main" }, children: comment.userName?.charAt(0) || "?" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", fontWeight: 700, children: comment.userName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          label: comment.userRole === "manager" || comment.userRole === "admin" ? "Manager" : "Employee",
                          size: "small",
                          sx: { height: 18, fontSize: "0.65rem", fontWeight: 600 }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: comment.createdAt ? format(new Date(comment.createdAt), "MMM d, h:mm a") : "" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { pl: 4 }, children: comment.message })
                ]
              },
              comment.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  size: "small",
                  placeholder: "Add a note...",
                  value: commentText,
                  onChange: (e) => setCommentText(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                      e.preventDefault();
                      postCommentMutation.mutate(commentText);
                    }
                  },
                  sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  color: "primary",
                  onClick: () => commentText.trim() && postCommentMutation.mutate(commentText),
                  disabled: !commentText.trim() || postCommentMutation.isPending,
                  sx: {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  },
                  children: postCommentMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { sx: { fontSize: 20 } })
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}

function safeFormat(val, fmt) {
  if (!val) return "";
  try {
    const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val;
    if (d instanceof Date && !isNaN(d.getTime())) {
      return format(d, fmt);
    }
  } catch (e) {
  }
  return "";
}
function ScheduleV2() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isManager$1 = isManager();
  const [weekStart, setWeekStart] = reactExports.useState(() => startOfWeek(/* @__PURE__ */ new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = reactExports.useState(/* @__PURE__ */ new Date());
  const [viewMode, setViewMode] = reactExports.useState(isMobile ? "day" : "week");
  const [drawerOpen, setDrawerOpen] = reactExports.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = reactExports.useState(isManager$1);
  const [createModalOpen, setCreateModalOpen] = reactExports.useState(false);
  const [editModalOpen, setEditModalOpen] = reactExports.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = reactExports.useState(false);
  const [timeOffModalOpen, setTimeOffModalOpen] = reactExports.useState(false);
  const [tradeModalOpen, setTradeModalOpen] = reactExports.useState(false);
  const [selectedShift, setSelectedShift] = reactExports.useState(null);
  const [selectedTimeOffId, setSelectedTimeOffId] = reactExports.useState(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = reactExports.useState(false);
  const [editAdjId, setEditAdjId] = reactExports.useState(null);
  const [adjEmployeeId, setAdjEmployeeId] = reactExports.useState("");
  const [adjDate, setAdjDate] = reactExports.useState(/* @__PURE__ */ new Date());
  const [adjEndDate, setAdjEndDate] = reactExports.useState(null);
  const [adjIsRange, setAdjIsRange] = reactExports.useState(false);
  const [adjType, setAdjType] = reactExports.useState("late");
  const [adjValue, setAdjValue] = reactExports.useState("");
  const [adjRemarks, setAdjRemarks] = reactExports.useState("");
  const adjustmentTypeOptions = [
    { value: "overtime", label: "Regular OT (125%)", color: "#10b981" },
    { value: "rest_day_ot", label: "Rest Day OT (169%)", color: "#3b82f6" },
    { value: "special_holiday_ot", label: "Special Holiday OT (169%)", color: "#f59e0b" },
    { value: "regular_holiday_ot", label: "Regular Holiday OT (260%)", color: "#ef4444" },
    { value: "night_diff", label: "Night Differential (+10%)", color: "#8b5cf6" },
    { value: "late", label: "Tardiness (minutes)", color: "#f97316" },
    { value: "undertime", label: "Undertime (minutes)", color: "#ec4899" },
    { value: "absent", label: "Absent (days)", color: "#dc2626" }
  ];
  const quickAdjustmentTypes = [
    { value: "late", label: "Late" },
    { value: "overtime", label: "OT" },
    { value: "undertime", label: "Undertime" },
    { value: "absent", label: "Absent" }
  ];
  const [newShift, setNewShift] = reactExports.useState({ employeeId: "", startTime: null, endTime: null, notes: "" });
  const [editForm, setEditForm] = reactExports.useState({ startTime: null, endTime: null, notes: "" });
  const [timeOffForm, setTimeOffForm] = reactExports.useState({ type: "vacation", startDate: /* @__PURE__ */ new Date(), endDate: /* @__PURE__ */ new Date(), reason: "" });
  const [tradeForm, setTradeForm] = reactExports.useState({ shiftId: "", targetUserId: "", reason: "" });
  const [actionsMenuAnchor, setActionsMenuAnchor] = reactExports.useState(null);
  const [copyWeekDialogOpen, setCopyWeekDialogOpen] = reactExports.useState(false);
  const [manageLogGroup, setManageLogGroup] = reactExports.useState(null);
  const [exceptionLogDrawerOpen, setExceptionLogDrawerOpen] = reactExports.useState(false);
  const [selectedExceptionLog, setSelectedExceptionLog] = reactExports.useState(null);
  reactExports.useCallback((log) => {
    setSelectedExceptionLog(log);
    setExceptionLogDrawerOpen(true);
  }, []);
  const openAdjustmentDialog = reactExports.useCallback((prefill = {}) => {
    setEditAdjId(null);
    setAdjEmployeeId(prefill.employeeId || "");
    setAdjDate(prefill.date ?? selectedDay);
    setAdjEndDate(prefill.endDate ?? null);
    setAdjIsRange(Boolean(prefill.isRange));
    setAdjType(prefill.type || "late");
    setAdjValue(prefill.value || "");
    setAdjRemarks(prefill.remarks || "");
    setIsAdjustmentDialogOpen(true);
  }, [selectedDay]);
  const handleLogAdjustmentFromShift = reactExports.useCallback((shift) => {
    openAdjustmentDialog({
      employeeId: String(shift.userId),
      date: new Date(shift.startTime)
    });
  }, [openAdjustmentDialog]);
  const [isSelectionMode, setIsSelectionMode] = reactExports.useState(false);
  const [selectedShifts, setSelectedShifts] = reactExports.useState(/* @__PURE__ */ new Set());
  const [selectedLogs, setSelectedLogs] = reactExports.useState(/* @__PURE__ */ new Set());
  const toggleShiftSelection = reactExports.useCallback((id) => {
    setSelectedShifts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleLogSelection = reactExports.useCallback((id) => {
    setSelectedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  useRealtime({
    enabled: true,
    queryKeys: ["shifts", "time-off-requests", "shift-trades", "employees", "notifications"],
    onEvent: (event, data) => {
      if (event.startsWith("time-off:") || event.startsWith("trade:") || event.startsWith("shift:") || event === "notification:created" || event === "notification") {
        queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ["time-off-requests"] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ["shift-trades"] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }).catch(console.error);
      }
      if ((event === "notification" || event === "notification:created") && data) {
        const notif = data?.notification || data;
        const type = notif?.type || "";
        if (type === "time_off_approved") {
          y.success(notif.message || "Your time-off request was approved!");
        } else if (type === "time_off_rejected") {
          y.error(notif.message || "Your time-off request was rejected.");
        } else if (type === "shift_trade") {
          try {
            const parsed = typeof notif.data === "string" ? JSON.parse(notif.data) : notif.data;
            if (parsed?.status === "approved") {
              y.success(notif.message || "Shift trade approved!");
            } else if (parsed?.status === "rejected") {
              y.error(notif.message || "Shift trade was rejected.");
            }
          } catch {
          }
        } else if (type === "trade_request") {
          y.info(notif.message || "New shift trade request received");
        } else if (type === "time_off") {
          y.info(notif.message || "New time-off request received");
        }
      }
    }
  });
  const shiftWindowStart = reactExports.useMemo(() => format(subWeeks(weekStart), "yyyy-MM-dd"), [weekStart]);
  const shiftWindowEnd = reactExports.useMemo(() => format(endOfWeek(addWeeks(weekStart, 2), { weekStartsOn: 1 }), "yyyy-MM-dd"), [weekStart]);
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts", "branch", shiftWindowStart, shiftWindowEnd],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/shifts/branch?startDate=${shiftWindowStart}&endDate=${shiftWindowEnd}`);
      return res.json();
    },
    // Keep stale schedule visible while the new week loads — fixes "disappearing schedule" bug.
    placeholderData: (previousData) => previousData
  });
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return res.json();
    },
    staleTime: 15e3
  });
  const { data: holidaysData } = useQuery({
    queryKey: ["/api/holidays", { year: (/* @__PURE__ */ new Date()).getFullYear() }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/holidays?year=${(/* @__PURE__ */ new Date()).getFullYear()}`);
      return res.json();
    },
    staleTime: 6e4
  });
  const { data: timeOffData } = useQuery({
    queryKey: ["time-off-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/time-off-requests");
      return res.json();
    }
  });
  const { data: tradesData } = useQuery({
    queryKey: ["shift-trades"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/shift-trades");
      return res.json();
    }
  });
  const { data: adjustmentLogsData } = useQuery({
    queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"],
    queryFn: async () => {
      const endpoint = isManager$1 ? "/api/adjustment-logs/branch" : "/api/adjustment-logs/mine";
      const res = await apiRequest("GET", endpoint);
      return res.json();
    },
    refetchOnWindowFocus: true
  });
  const shifts = reactExports.useMemo(() => Array.isArray(shiftsData) ? shiftsData : shiftsData?.shifts || [], [shiftsData]);
  const employees = reactExports.useMemo(() => {
    const raw = Array.isArray(employeesData) ? employeesData : employeesData?.employees || [];
    return raw.filter((e) => e.isActive !== false && e.role !== "admin");
  }, [employeesData]);
  const holidays = holidaysData?.holidays || [];
  const timeOffRequests = timeOffData?.requests || [];
  const shiftTrades = tradesData?.trades || [];
  const adjustmentLogs = adjustmentLogsData?.logs || [];
  const pendingCount = reactExports.useMemo(() => {
    const pendingTimeOff = timeOffRequests.filter((r) => r.status === "pending").length;
    const pendingTrades = shiftTrades.filter((t) => t.status === "pending" || t.status === "accepted").length;
    return pendingTimeOff + pendingTrades;
  }, [timeOffRequests, shiftTrades]);
  const weeklyTotalHours = reactExports.useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return shifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= weekStart && d <= weekEnd && d.getDay() !== 0;
    }).reduce((sum, s) => sum + differenceInHours(new Date(s.endTime), new Date(s.startTime)), 0);
  }, [shifts, weekStart]);
  const currentWeekShiftCount = reactExports.useMemo(() => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return shifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= weekStart && d <= weekEnd;
    }).length;
  }, [shifts, weekStart]);
  const buildCopyWeekData = reactExports.useCallback(() => {
    if (!currentUser?.branchId) return null;
    const lastWeekStart = subWeeks(weekStart);
    const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
    const thisWeekStart = weekStart;
    const thisWeekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const lastWeekShifts = shifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= lastWeekStart && d <= lastWeekEnd && s.user?.isActive !== false;
    });
    const currentWeekShifts = shifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= thisWeekStart && d <= thisWeekEnd;
    });
    const shiftsToCopy = lastWeekShifts.filter((s) => {
      const newStart = addWeeks(new Date(s.startTime), 1);
      const newEnd = addWeeks(new Date(s.endTime), 1);
      const isOverlapping = currentWeekShifts.some(
        (cws) => cws.userId === s.userId && areIntervalsOverlapping(
          { start: newStart, end: newEnd },
          { start: new Date(cws.startTime), end: new Date(cws.endTime) }
        )
      );
      return !isOverlapping;
    });
    return { lastWeekStart, lastWeekEnd, thisWeekStart, thisWeekEnd, lastWeekShifts, currentWeekShifts, shiftsToCopy };
  }, [currentUser?.branchId, shifts, weekStart]);
  const copyWeekPreview = reactExports.useMemo(() => buildCopyWeekData(), [buildCopyWeekData]);
  const createShiftMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiRequest("POST", "/api/shifts", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create shift");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      y.success("Shift created");
      setCreateModalOpen(false);
      setNewShift({ employeeId: "", startTime: null, endTime: null, notes: "" });
    },
    onError: (err) => y.error(err.message)
  });
  const updateShiftMutation = useMutation({
    mutationFn: async (payload) => {
      const { id, ...data } = payload;
      const res = await apiRequest("PUT", `/api/shifts/${id}`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update shift");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      y.success("Shift updated");
      setEditModalOpen(false);
    },
    onError: (err) => y.error(err.message)
  });
  const deleteShiftMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/shifts/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete shift");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      y.success("Shift deleted");
      setDeleteConfirmOpen(false);
      setSelectedShift(null);
    },
    onError: (err) => y.error(err.message)
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const promises = [];
      selectedShifts.forEach((id) => {
        promises.push(apiRequest("DELETE", `/api/shifts/${id}`));
      });
      selectedLogs.forEach((id) => {
        promises.push(apiRequest("DELETE", `/api/adjustment-logs/${id}`));
      });
      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} items`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success(`Deleted ${selectedShifts.size + selectedLogs.size} items successfully`);
      setSelectedShifts(/* @__PURE__ */ new Set());
      setSelectedLogs(/* @__PURE__ */ new Set());
      setIsSelectionMode(false);
    },
    onError: (err) => y.error(err.message)
  });
  const copyWeekMutation = useMutation({
    mutationFn: async () => {
      const copyPlan = buildCopyWeekData();
      if (!copyPlan) throw new Error("Branch ID missing");
      if (copyPlan.shiftsToCopy.length === 0) {
        if (copyPlan.lastWeekShifts.length > 0) {
          throw new Error("All shifts from the previous week already exist or overlap with the current week.");
        }
        throw new Error("No shifts found in the previous week to copy.");
      }
      const newShiftsPromises = copyPlan.shiftsToCopy.map((s) => {
        return apiRequest("POST", "/api/shifts", {
          userId: s.userId,
          branchId: s.branchId,
          position: s.position,
          startTime: addWeeks(new Date(s.startTime), 1).toISOString(),
          endTime: addWeeks(new Date(s.endTime), 1).toISOString(),
          notes: s.notes
        });
      });
      const chunkSize = 5;
      let failed = 0;
      for (let i = 0; i < newShiftsPromises.length; i += chunkSize) {
        const chunk = newShiftsPromises.slice(i, i + chunkSize);
        const results = await Promise.all(chunk);
        failed += results.filter((r) => !r.ok).length;
      }
      const skippedCount = copyPlan.lastWeekShifts.length - copyPlan.shiftsToCopy.length;
      if (failed > 0) {
        throw new Error(`Copied ${copyPlan.shiftsToCopy.length - failed} shifts. Failed to copy ${failed} shifts. Skipped ${skippedCount} overlaps.`);
      }
      return { copiedCount: copyPlan.shiftsToCopy.length, skippedCount };
    },
    onSuccess: async ({ copiedCount, skippedCount }) => {
      await queryClient.refetchQueries({ queryKey: ["shifts", "branch"] });
      let msg = `Successfully copied ${copiedCount} shifts.`;
      if (skippedCount > 0) msg += ` Skipped ${skippedCount} overlapping shifts.`;
      y.success(msg);
      setCopyWeekDialogOpen(false);
    },
    onError: (err) => y.error(err.message)
  });
  const createTimeOffMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        type: data.type,
        startDate: data.startDate ? safeFormat(data.startDate, "yyyy-MM-dd") : "",
        endDate: data.endDate ? safeFormat(data.endDate, "yyyy-MM-dd") : "",
        reason: data.reason
      };
      const res = await apiRequest("POST", "/api/time-off-requests", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      y.success("Time-off request submitted");
      setTimeOffModalOpen(false);
      setTimeOffForm({ type: "vacation", startDate: /* @__PURE__ */ new Date(), endDate: /* @__PURE__ */ new Date(), reason: "" });
    },
    onError: (err) => y.error(err.message)
  });
  const deleteTimeOffMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/time-off-requests/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to cancel");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      y.success("Time-off request cancelled");
      setSelectedTimeOffId(null);
    },
    onError: (err) => y.error(err.message)
  });
  const approveTimeOffMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason, useSil }) => {
      const endpoint = status === "approved" ? `/api/time-off-requests/${id}/approve` : `/api/time-off-requests/${id}/reject`;
      const body = status === "rejected" ? { status, rejectionReason } : { status, useSil };
      const res = await apiRequest("PUT", endpoint, body);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      if (variables.status === "approved") {
        y.success("Time-off approved â€” employee notified");
      } else {
        y.info("Time-off rejected â€” employee notified");
      }
    },
    onError: (err) => y.error(err.message)
  });
  const togglePaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }) => {
      const res = await apiRequest("PUT", `/api/time-off-requests/${id}/toggle-paid`, { isPaid });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to toggle paid status");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      y.success(variables.isPaid ? "Marked as Paid" : "Marked as Unpaid");
    },
    onError: (err) => y.error(err.message)
  });
  const addHolidayPayMutation = useMutation({
    mutationFn: async ({ userId, branchId, date }) => {
      const payload = {
        startDate: safeFormat(date, "yyyy-MM-dd"),
        endDate: safeFormat(date, "yyyy-MM-dd"),
        type: "holiday_pay",
        value: "1",
        remarks: "Holiday Pay"
      };
      const res = await apiRequest("POST", "/api/adjustment-logs", { ...payload, employeeId: userId, branchId });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to apply holiday pay");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustment-logs", "branch"] });
      y.success("Holiday Pay added");
    },
    onError: (err) => y.error(err.message)
  });
  const createTradeMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/shift-trades", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      y.success("Trade request submitted");
      setTradeModalOpen(false);
      setTradeForm({ shiftId: "", targetUserId: "", reason: "" });
    },
    onError: (err) => y.error(err.message)
  });
  const respondTradeMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiRequest("PATCH", `/api/shift-trades/${id}`, { status });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      if (variables.status === "accepted") {
        y.success("Trade accepted â€” awaiting manager approval");
      } else {
        y.info("Trade declined");
      }
    },
    onError: (err) => y.error(err.message)
  });
  const approveTradeMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiRequest("PATCH", `/api/shift-trades/${id}/approve`, { status });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      if (variables.status === "approved") {
        y.success("Shift trade approved â€” both employees notified");
      } else {
        y.info("Shift trade rejected â€” requester notified");
      }
    },
    onError: (err) => y.error(err.message)
  });
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/adjustment-logs", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to log exception");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success("Exception logged successfully");
      setIsAdjustmentDialogOpen(false);
      setAdjValue("");
      setAdjRemarks("");
    },
    onError: (err) => y.error(err.message)
  });
  const deleteAdjustmentMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/adjustment-logs/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success("Exception log deleted");
      if (manageLogGroup) {
        setManageLogGroup((prev) => {
          if (!prev) return null;
          const filtered = prev.filter((l) => l.id !== deleteAdjustmentMutation.variables);
          return filtered;
        });
      }
    },
    onError: (err) => y.error(err.message)
  });
  const updateAdjustmentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update exception");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success("Exception updated successfully");
      setIsAdjustmentDialogOpen(false);
      setAdjValue("");
      setAdjRemarks("");
      setEditAdjId(null);
    },
    onError: (err) => y.error(err.message)
  });
  const approveAdjustmentMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${id}/approve`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to approve");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success("Exception log approved");
    },
    onError: (err) => y.error(err.message)
  });
  const rejectAdjustmentMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("PUT", `/api/adjustment-logs/${id}/reject`, { reason: "Rejected by manager" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to reject");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [isManager$1 ? "adjustment-logs-branch" : "adjustment-logs-mine"] });
      y.success("Exception log rejected");
    },
    onError: (err) => y.error(err.message)
  });
  const deleteTradeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("DELETE", `/api/shift-trades/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      y.success("Trade cancelled");
    },
    onError: (err) => y.error(err.message)
  });
  const takeOpenTradeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiRequest("PUT", `/api/shift-trades/${id}/take`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-trades"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", "branch"] });
      y.success("Shift taken! Pending manager approval.");
    },
    onError: (err) => y.error(err.message)
  });
  const handleCreateShift = reactExports.useCallback((employeeId, date) => {
    const start = setMinutes(setHours(date, 8), 0);
    const end = setMinutes(setHours(date, 16), 0);
    setNewShift({
      employeeId,
      startTime: start,
      endTime: end,
      notes: ""
    });
    setCreateModalOpen(true);
  }, []);
  const handleEditShift = reactExports.useCallback((shift) => {
    if (!isManager$1) return;
    setSelectedShift(shift);
    setEditForm({
      startTime: new Date(shift.startTime),
      endTime: new Date(shift.endTime),
      notes: shift.notes || ""
    });
    setEditModalOpen(true);
  }, [isManager$1]);
  const handleWeekNav = reactExports.useCallback((direction) => {
    if (direction === "today") {
      const newWeekStart = startOfWeek(/* @__PURE__ */ new Date(), { weekStartsOn: 1 });
      setWeekStart(newWeekStart);
      setSelectedDay(/* @__PURE__ */ new Date());
    } else if (direction === "prev") {
      setWeekStart((prev) => {
        const newStart = subWeeks(prev);
        setSelectedDay((current) => {
          const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1;
          return addDays(newStart, dayOfWeek);
        });
        return newStart;
      });
    } else {
      setWeekStart((prev) => {
        const newStart = addWeeks(prev, 1);
        setSelectedDay((current) => {
          const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1;
          return addDays(newStart, dayOfWeek);
        });
        return newStart;
      });
    }
  }, []);
  const handleCreateAdjustment = async () => {
    if (!adjType || !adjValue) return;
    if (editAdjId) {
      await updateAdjustmentMutation.mutateAsync({
        id: editAdjId,
        data: {
          type: adjType,
          value: adjValue,
          remarks: adjRemarks
        }
      });
      return;
    }
    if (!adjEmployeeId || !adjDate && !adjIsRange) return;
    let datesToLog = [adjDate];
    if (adjIsRange && adjEndDate && adjEndDate > adjDate) {
      datesToLog = eachDayOfInterval({ start: adjDate, end: adjEndDate });
    }
    for (const d of datesToLog) {
      if (!d) continue;
      await createAdjustmentMutation.mutateAsync({
        employeeId: adjEmployeeId,
        date: safeFormat(d, "yyyy-MM-dd"),
        type: adjType,
        value: adjValue,
        remarks: adjRemarks
      });
    }
  };
  if (shiftsLoading || employeesLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 48 }) });
  }
  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: "100%", bgcolor: "transparent" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      px: { xs: 2, sm: 3 },
      py: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 1.5,
      borderBottom: "1px solid",
      borderColor: isDark ? "#3D3228" : "#E8E0D4",
      bgcolor: isDark ? alpha("#2A2018", 0.9) : alpha("#FFFFFF", 0.9),
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 20
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, p: 0.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleWeekNav("prev"), sx: { p: { xs: 0.5, sm: 1 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeftIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", onClick: () => handleWeekNav("today"), variant: "text", sx: { textTransform: "none", fontWeight: 700, minWidth: 0, px: 1.5 }, children: "Today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => handleWeekNav("next"), sx: { p: { xs: 0.5, sm: 1 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightIcon, {}) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 800, sx: { color: isDark ? "#F5EDE4" : "#3C2415", whiteSpace: "nowrap", fontSize: { xs: "0.85rem", sm: "1rem" } }, children: [
          safeFormat(weekStart, "MMM d"),
          " – ",
          safeFormat(weekEndDate, "MMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${weeklyTotalHours}h total`, size: "small", variant: "filled", color: "default", sx: { height: 24, fontSize: "0.7rem", fontWeight: 700, borderRadius: 2 } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }, children: [
        isManager$1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `${pendingCount} pending requests`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => isMobile ? setDrawerOpen(true) : setIsSidebarOpen(!isSidebarOpen), sx: { position: "relative", mr: 1, bgcolor: alpha(theme.palette.warning.main, 0.1) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: pendingCount, color: "warning", max: 99, children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxIcon, { sx: { color: "warning.main", fontSize: 20 } }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { size: "small", variant: "outlined", sx: { height: 32 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: viewMode === "week" ? "contained" : "outlined",
              onClick: () => setViewMode("week"),
              startIcon: isMobile ? void 0 : /* @__PURE__ */ jsxRuntimeExports.jsx(WeekIcon, {}),
              sx: { textTransform: "none", fontWeight: 700, minWidth: isMobile ? 44 : "auto", px: isMobile ? 1 : 2 },
              children: isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(WeekIcon, { fontSize: "small" }) : "Week"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: viewMode === "day" ? "contained" : "outlined",
              onClick: () => setViewMode("day"),
              startIcon: isMobile ? void 0 : /* @__PURE__ */ jsxRuntimeExports.jsx(DayIcon, {}),
              sx: { textTransform: "none", fontWeight: 700, minWidth: isMobile ? 44 : "auto", px: isMobile ? 1 : 2 },
              children: isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(DayIcon, { fontSize: "small" }) : "Day"
            }
          )
        ] }),
        isManager$1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { size: "small", variant: "outlined", sx: { height: 32, display: { xs: "none", sm: "flex" } }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Add a new shift", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: () => {
                  setNewShift({ employeeId: "", startTime: null, endTime: null, notes: "" });
                  setCreateModalOpen(true);
                },
                sx: {
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(92,64,51,0.15)",
                  "&:hover": { boxShadow: "0 4px 12px rgba(92,64,51,0.2)" }
                },
                children: "Add Shift"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Quick actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "outlined",
                onClick: (e) => setActionsMenuAnchor(e.currentTarget),
                sx: {
                  minWidth: 36,
                  px: 1,
                  color: isSelectionMode ? "primary.main" : "text.primary",
                  borderColor: isSelectionMode ? "primary.main" : alpha(theme.palette.text.primary, 0.2),
                  bgcolor: isSelectionMode ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  "&:hover": {
                    borderColor: isSelectionMode ? "primary.main" : alpha(theme.palette.text.primary, 0.3),
                    bgcolor: isSelectionMode ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04)
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVert, { fontSize: "small" })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Menu,
            {
              anchorEl: actionsMenuAnchor,
              open: Boolean(actionsMenuAnchor),
              onClose: () => setActionsMenuAnchor(null),
              slotProps: { paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } } },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => {
                  setActionsMenuAnchor(null);
                  setIsSelectionMode((prev) => !prev);
                  if (isSelectionMode) {
                    setSelectedShifts(/* @__PURE__ */ new Set());
                    setSelectedLogs(/* @__PURE__ */ new Set());
                  }
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistIcon, { sx: { mr: 1.5, fontSize: 18, color: "#2563EB" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: isSelectionMode ? "Done Editing" : "Bulk Edit" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => {
                  setActionsMenuAnchor(null);
                  openAdjustmentDialog({ date: selectedDay, type: "late" });
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { sx: { mr: 1.5, fontSize: 18, color: "#F59E0B" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Log Attendance" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => {
                  setActionsMenuAnchor(null);
                  setTimeOffModalOpen(true);
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, { sx: { mr: 1.5, fontSize: 18, color: "#92400E" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Time Off Request" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => {
                  setActionsMenuAnchor(null);
                  const myFutureShifts = shifts.filter((s) => s.userId === currentUser?.id && new Date(s.startTime) > /* @__PURE__ */ new Date());
                  if (myFutureShifts.length === 0) {
                    y.info("No future shifts to trade");
                    return;
                  }
                  setTradeModalOpen(true);
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, { sx: { mr: 1.5, fontSize: 18, color: "#8B5CF6" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Trade Shift" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 0.5 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => {
                  setActionsMenuAnchor(null);
                  setCopyWeekDialogOpen(true);
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopyIcon, { sx: { mr: 1.5, fontSize: 18, color: "#14B8A6" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 600, children: "Copy Last Week" })
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      px: { xs: 1.5, sm: 2 },
      py: 0.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 0.5,
      borderBottom: "1px solid",
      borderColor: isDark ? "#3D3228" : "#E8E0D4",
      bgcolor: isDark ? alpha("#342A1E", 0.5) : alpha("#F5F0E8", 0.5)
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }, children: isManager$1 && getUniqueRoleColors().map((rc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          size: "small",
          label: rc.label,
          sx: { height: 20, fontSize: "0.58rem", fontWeight: 700, bgcolor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }
        },
        rc.label
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { display: "flex", alignItems: "center", gap: 0.3, fontWeight: 600, color: "text.secondary", fontSize: "0.65rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { fontSize: "0.75rem" }, children: "🌴" }),
          " Time Off"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { display: "flex", alignItems: "center", gap: 0.3, fontWeight: 600, color: "text.secondary", fontSize: "0.65rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { fontSize: "0.75rem" }, children: "⏰" }),
          " Exception"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { display: "flex", alignItems: "center", gap: 0.3, fontWeight: 600, color: "text.secondary", fontSize: "0.65rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "span", sx: { fontSize: "0.75rem" }, children: "🔄" }),
          " Trade"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, overflow: "hidden", display: "flex", flexDirection: { xs: "column", lg: "row" } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, overflow: "auto", p: { xs: 1, sm: 2 }, minHeight: 400 }, children: viewMode === "week" ? isManager$1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
        currentWeekShiftCount === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Paper,
          {
            elevation: 0,
            sx: {
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, alignItems: { sm: "center" }, justifyContent: "space-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 800, sx: { color: "text.primary" }, children: "No shifts scheduled this week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5, maxWidth: 720 }, children: "Start from scratch or copy last week. New shifts will sync live to the schedule as soon as you save them." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                    onClick: () => handleCreateShift("", selectedDay),
                    sx: { borderRadius: 2, textTransform: "none", fontWeight: 800 },
                    children: "Add Shift"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outlined",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopyIcon, {}),
                    onClick: () => setCopyWeekDialogOpen(true),
                    sx: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
                    children: "Copy Last Week"
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          WeeklyGrid,
          {
            employees,
            shifts,
            weekStart,
            holidays,
            isManager: isManager$1,
            timeOffRequests,
            shiftTrades,
            adjustmentLogs,
            currentUserId: currentUser?.id || "",
            isSelectionMode,
            selectedShifts,
            selectedLogs,
            onToggleShiftSelection: toggleShiftSelection,
            onToggleLogSelection: toggleLogSelection,
            onCreateShift: handleCreateShift,
            onEditShift: !isSelectionMode ? handleEditShift : () => {
            },
            onOpenRequests: () => setDrawerOpen(true),
            onDeleteTimeOff: (id) => setSelectedTimeOffId(id),
            onManageLogGroup: setManageLogGroup,
            onAddHolidayPay: (userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId, date }),
            onLogAdjustment: handleLogAdjustmentFromShift
          }
        )
      ] }) : (
        /* Employee week view: show their shifts only, as vertical cards */
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          WeeklyGrid,
          {
            employees: employees.filter((e) => e.id === currentUser?.id),
            shifts: shifts.filter((s) => s.userId === currentUser?.id),
            weekStart,
            holidays,
            isManager: false,
            timeOffRequests: timeOffRequests.filter((r) => r.userId === currentUser?.id),
            shiftTrades: shiftTrades.filter((t) => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id),
            adjustmentLogs,
            currentUserId: currentUser?.id || "",
            onCreateShift: () => {
            },
            onEditShift: () => {
            },
            onOpenRequests: () => setDrawerOpen(true)
          }
        )
      ) : isManager$1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        DayView,
        {
          employees,
          shifts,
          date: selectedDay,
          holidays,
          isManager: isManager$1,
          currentUserId: currentUser?.id || "",
          timeOffRequests,
          shiftTrades,
          adjustmentLogs,
          isSelectionMode,
          selectedShifts,
          selectedLogs,
          onToggleShiftSelection: toggleShiftSelection,
          onToggleLogSelection: toggleLogSelection,
          onDateChange: setSelectedDay,
          onCreateShift: handleCreateShift,
          onEditShift: !isSelectionMode ? handleEditShift : () => {
          },
          onDeleteTimeOff: (id) => setSelectedTimeOffId(id),
          onManageLogGroup: setManageLogGroup,
          onAddHolidayPay: (userId, date) => addHolidayPayMutation.mutate({ userId, branchId: currentUser?.branchId, date }),
          onLogAdjustment: handleLogAdjustmentFromShift
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        MyDayView,
        {
          shifts,
          date: selectedDay,
          currentUserId: currentUser?.id || "",
          timeOffRequests: timeOffRequests.filter((r) => r.userId === currentUser?.id),
          shiftTrades: shiftTrades.filter((t) => t.requesterId === currentUser?.id || t.fromUserId === currentUser?.id),
          onDateChange: setSelectedDay
        }
      ) }),
      !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
        width: isSidebarOpen ? 340 : 0,
        opacity: isSidebarOpen ? 1 : 0,
        visibility: isSidebarOpen ? "visible" : "hidden",
        flexShrink: 0,
        display: { xs: "none", lg: "block" },
        borderLeft: isSidebarOpen ? "1px solid" : "none",
        borderColor: isDark ? "#3D3228" : "#E8E0D4",
        bgcolor: isDark ? "#1C1410" : "#FBF8F4",
        overflowY: "auto",
        p: isSidebarOpen ? 2.5 : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 800, sx: { color: isDark ? "#F5EDE4" : "#3C2415" }, children: "Requests & Trades" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setIsSidebarOpen(false), size: "small", sx: { mr: -1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, { fontSize: "small" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RequestsPanel,
          {
            timeOffRequests,
            shiftTrades,
            employees,
            shifts,
            isManager: isManager$1,
            currentUserId: currentUser?.id || "",
            adjustmentLogs,
            onApproveTimeOff: (id, useSil) => approveTimeOffMutation.mutate({ id, status: "approved", useSil }),
            onRejectTimeOff: (id, reason) => approveTimeOffMutation.mutate({ id, status: "rejected", rejectionReason: reason }),
            onApproveTrade: (id) => approveTradeMutation.mutate({ id, status: "approved" }),
            onRejectTrade: (id) => approveTradeMutation.mutate({ id, status: "rejected" }),
            onAcceptTrade: (id) => respondTradeMutation.mutate({ id, status: "accepted" }),
            onDeclineTrade: (id) => respondTradeMutation.mutate({ id, status: "rejected" }),
            onCancelTrade: (id) => deleteTradeMutation.mutate(id),
            onTakeOpenTrade: (id) => takeOpenTradeMutation.mutate(id)
          }
        )
      ] })
    ] }),
    isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      position: "fixed",
      bottom: 80,
      right: 16,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      zIndex: 1200
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Time Off", placement: "left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        IconButton,
        {
          onClick: () => setTimeOffModalOpen(true),
          sx: { bgcolor: "#F59E0B", color: "white", boxShadow: 3, "&:hover": { bgcolor: "#D97706" } },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(VacationIcon, {})
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Trade Shift", placement: "left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        IconButton,
        {
          onClick: () => {
            const myFuture = shifts.filter((s) => s.userId === currentUser?.id && new Date(s.startTime) > /* @__PURE__ */ new Date());
            if (myFuture.length === 0) {
              y.info("No future shifts to trade");
              return;
            }
            setTradeModalOpen(true);
          },
          sx: { bgcolor: "#8B5CF6", color: "white", boxShadow: 3, "&:hover": { bgcolor: "#7C3AED" } },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(TradeIcon, {})
        }
      ) }),
      isManager$1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Create Shift", placement: "left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        IconButton,
        {
          onClick: () => {
            setNewShift({ employeeId: "", startTime: null, endTime: null, notes: "" });
            setCreateModalOpen(true);
          },
          sx: { bgcolor: "primary.main", color: "white", boxShadow: 4, width: 56, height: 56, "&:hover": { bgcolor: "primary.dark" } },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {})
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Drawer,
      {
        anchor: "right",
        open: drawerOpen,
        onClose: () => setDrawerOpen(false),
        sx: { display: { lg: "none" } },
        PaperProps: {
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: isDark ? "#1C1410" : "#FBF8F4",
            p: 3
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 800, sx: { color: isDark ? "#F5EDE4" : "#3C2415" }, children: "Requests & Trades" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setDrawerOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RequestsPanel,
            {
              timeOffRequests,
              shiftTrades,
              employees,
              isManager: isManager$1,
              currentUserId: currentUser?.id || "",
              adjustmentLogs,
              onApproveTimeOff: (id, useSil) => approveTimeOffMutation.mutate({ id, status: "approved", useSil }),
              onRejectTimeOff: (id, reason) => approveTimeOffMutation.mutate({ id, status: "rejected", rejectionReason: reason }),
              onApproveTrade: (id) => approveTradeMutation.mutate({ id, status: "approved" }),
              onRejectTrade: (id) => approveTradeMutation.mutate({ id, status: "rejected" }),
              onAcceptTrade: (id) => respondTradeMutation.mutate({ id, status: "accepted" }),
              onDeclineTrade: (id) => respondTradeMutation.mutate({ id, status: "rejected" }),
              onCancelTrade: (id) => deleteTradeMutation.mutate(id),
              onTakeOpenTrade: (id) => takeOpenTradeMutation.mutate(id)
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: createModalOpen, onClose: () => setCreateModalOpen(false), maxWidth: "sm", fullWidth: true, fullScreen: isMobile, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create Shift" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: newShift.employeeId, label: "Employee", onChange: (e) => setNewShift((p) => ({ ...p, employeeId: e.target.value })), children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: emp.id, children: [
            emp.firstName,
            " ",
            emp.lastName,
            " ",
            emp.position && ` · ${emp.position}`
          ] }, emp.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DateTimePicker,
            {
              label: "Start Time",
              value: newShift.startTime,
              onChange: (val) => setNewShift((p) => ({ ...p, startTime: val })),
              slotProps: { textField: { fullWidth: true } }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DateTimePicker,
            {
              label: "End Time",
              value: newShift.endTime,
              onChange: (val) => setNewShift((p) => ({ ...p, endTime: val })),
              slotProps: { textField: { fullWidth: true } },
              minDateTime: newShift.startTime || void 0
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Notes", multiline: true, rows: 2, value: newShift.notes, onChange: (e) => setNewShift((p) => ({ ...p, notes: e.target.value })), fullWidth: true })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreateModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            disabled: !newShift.employeeId || !newShift.startTime || !newShift.endTime || createShiftMutation.isPending,
            onClick: () => {
              if (!newShift.startTime || !newShift.endTime || !isValid(newShift.startTime) || !isValid(newShift.endTime)) {
                y.error("Please select valid start and end times");
                return;
              }
              const hasShiftOnDay = shifts.some(
                (s) => s.userId === newShift.employeeId && s.startTime && isSameDay(new Date(s.startTime), newShift.startTime)
              );
              if (hasShiftOnDay) {
                y.error("This employee already has a shift scheduled on this day. Employees can only have 1 shift per day.");
                return;
              }
              const emp = employees.find((e) => e.id === newShift.employeeId);
              createShiftMutation.mutate({
                userId: newShift.employeeId,
                branchId: emp?.branchId || "",
                position: emp?.position || "Staff",
                startTime: newShift.startTime.toISOString(),
                endTime: newShift.endTime.toISOString(),
                notes: newShift.notes
              });
            },
            children: createShiftMutation.isPending ? "Creating..." : "Create"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: editModalOpen, onClose: () => setEditModalOpen(false), maxWidth: "sm", fullWidth: true, fullScreen: isMobile, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Shift" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedShift && /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: isDark ? "#342A1E" : "#F5F0E8", borderRadius: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: getRoleColor(selectedShift.position).bg, color: "white" }, children: selectedShift.user?.firstName?.[0] || employees.find((e) => e.id === selectedShift.userId)?.firstName?.[0] || "?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: 600, children: selectedShift.user ? `${selectedShift.user.firstName} ${selectedShift.user.lastName}` : (() => {
              const e = employees.find((x) => x.id === selectedShift.userId);
              return e ? `${e.firstName} ${e.lastName}` : "Unknown";
            })() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              selectedShift.position || "Staff",
              " · ",
              editForm.startTime ? safeFormat(editForm.startTime, "EEEE, MMM d, yyyy") : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Start Time",
              type: "time",
              fullWidth: true,
              value: editForm.startTime ? safeFormat(editForm.startTime, "HH:mm") : "",
              onChange: (e) => {
                if (editForm.startTime && e.target.value) {
                  const [h, m] = e.target.value.split(":").map(Number);
                  const newDate = new Date(editForm.startTime);
                  newDate.setHours(h, m, 0, 0);
                  setEditForm((p) => ({ ...p, startTime: newDate }));
                }
              },
              InputLabelProps: { shrink: true },
              inputProps: { step: 900 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "End Time",
              type: "time",
              fullWidth: true,
              value: editForm.endTime ? safeFormat(editForm.endTime, "HH:mm") : "",
              onChange: (e) => {
                if (editForm.endTime && e.target.value) {
                  const [h, m] = e.target.value.split(":").map(Number);
                  const newDate = new Date(editForm.endTime);
                  newDate.setHours(h, m, 0, 0);
                  setEditForm((p) => ({ ...p, endTime: newDate }));
                }
              },
              InputLabelProps: { shrink: true },
              inputProps: { step: 900 }
            }
          )
        ] }),
        editForm.startTime && editForm.endTime && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: -1 }, children: [
          "Duration: ",
          differenceInHours(editForm.endTime, editForm.startTime),
          "h"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Notes",
            multiline: true,
            rows: 2,
            value: editForm.notes,
            onChange: (e) => setEditForm((p) => ({ ...p, notes: e.target.value })),
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { color: "error", onClick: () => {
          setEditModalOpen(false);
          setDeleteConfirmOpen(true);
        }, startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}), children: "Delete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            color: "warning",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, {}),
            onClick: () => {
              if (!selectedShift) return;
              setEditModalOpen(false);
              openAdjustmentDialog({
                employeeId: selectedShift.userId,
                date: new Date(selectedShift.startTime),
                type: "late",
                remarks: selectedShift.notes || ""
              });
            },
            sx: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
            children: "Log Attendance"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            disabled: updateShiftMutation.isPending || !editForm.startTime || !editForm.endTime,
            onClick: () => {
              if (selectedShift && editForm.startTime && editForm.endTime && isValid(editForm.startTime) && isValid(editForm.endTime)) {
                const hasShiftOnDay = shifts.some(
                  (s) => s.userId === selectedShift.userId && s.id !== selectedShift.id && isSameDay(new Date(s.startTime), editForm.startTime)
                );
                if (hasShiftOnDay) {
                  y.error("This edit would conflict. Employees can only have 1 shift per day.");
                  return;
                }
                updateShiftMutation.mutate({ id: selectedShift.id, startTime: editForm.startTime.toISOString(), endTime: editForm.endTime.toISOString(), notes: editForm.notes });
              }
            },
            children: updateShiftMutation.isPending ? "Saving..." : "Save"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: deleteConfirmOpen, onClose: () => setDeleteConfirmOpen(false), maxWidth: "xs", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Shift?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "This action cannot be undone." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDeleteConfirmOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            color: "error",
            disabled: deleteShiftMutation.isPending,
            onClick: () => selectedShift && deleteShiftMutation.mutate(selectedShift.id),
            children: deleteShiftMutation.isPending ? "Deleting..." : "Delete"
          }
        )
      ] })
    ] }),
    (() => {
      const selectedReq = timeOffRequests.find((r) => r.id === selectedTimeOffId);
      if (!selectedReq) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!selectedTimeOffId, onClose: () => setSelectedTimeOffId(null), maxWidth: "xs", fullWidth: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manage Time-Off Request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", fontWeight: 700, sx: { mb: 1 }, children: [
            selectedReq.type.toUpperCase(),
            " Leave (",
            selectedReq.status.toUpperCase(),
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mb: 3 }, children: [
            safeFormat(new Date(selectedReq.startDate), "MMM d, yyyy"),
            " - ",
            safeFormat(new Date(selectedReq.endDate), "MMM d, yyyy"),
            selectedReq.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Reason: ",
              selectedReq.reason
            ] })
          ] }),
          selectedReq.status === "approved" && isManager$1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, p: 2, borderRadius: 2, bgcolor: isDark ? "#342A1E" : "#F5F5F5" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", fontWeight: 700, sx: { mb: 1 }, children: "Payment Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { fullWidth: true, size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: selectedReq.isPaid ? "contained" : "outlined",
                  color: "success",
                  disabled: togglePaidMutation.isPending,
                  onClick: () => togglePaidMutation.mutate({ id: selectedReq.id, isPaid: true }),
                  children: "Paid Leave (₱)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: !selectedReq.isPaid ? "contained" : "outlined",
                  color: "inherit",
                  disabled: togglePaidMutation.isPending,
                  onClick: () => togglePaidMutation.mutate({ id: selectedReq.id, isPaid: false }),
                  children: "Unpaid"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "warning.main", fontWeight: 600, sx: { mb: 1 }, children: "Cancel Request" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Cancelling keeps the request in the system for audit history. If it was already approved and paid, leave credits are restored." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setSelectedTimeOffId(null), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              color: "warning",
              disabled: deleteTimeOffMutation.isPending || selectedReq.status === "cancelled",
              onClick: () => selectedTimeOffId && deleteTimeOffMutation.mutate(selectedTimeOffId),
              children: selectedReq.status === "cancelled" ? "Already Cancelled" : deleteTimeOffMutation.isPending ? "Cancelling..." : "Cancel Request"
            }
          )
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: timeOffModalOpen, onClose: () => setTimeOffModalOpen(false), maxWidth: "sm", fullWidth: true, fullScreen: isMobile, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request Time Off" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timeOffForm.type, label: "Type", onChange: (e) => setTimeOffForm((p) => ({ ...p, type: e.target.value })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "vacation", children: "Vacation Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "sick", children: "Sick Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "emergency", children: "Emergency Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "personal", children: "Personal Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "other", children: "Other" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "Start Date",
              value: timeOffForm.startDate,
              onChange: (val) => setTimeOffForm((p) => ({
                ...p,
                startDate: val,
                endDate: val && p.endDate && p.endDate < val ? val : p.endDate
              })),
              slotProps: { textField: { fullWidth: true } },
              disablePast: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DatePicker,
            {
              label: "End Date",
              value: timeOffForm.endDate,
              onChange: (val) => setTimeOffForm((p) => ({ ...p, endDate: val })),
              slotProps: { textField: { fullWidth: true } },
              minDate: timeOffForm.startDate || void 0,
              disablePast: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Reason",
            multiline: true,
            rows: 3,
            required: true,
            value: timeOffForm.reason,
            onChange: (e) => setTimeOffForm((p) => ({ ...p, reason: e.target.value })),
            placeholder: "Briefly explain your request...",
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setTimeOffModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            disabled: !timeOffForm.reason || !timeOffForm.startDate || !timeOffForm.endDate || createTimeOffMutation.isPending,
            onClick: () => createTimeOffMutation.mutate(timeOffForm),
            children: createTimeOffMutation.isPending ? "Submitting..." : "Submit"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: tradeModalOpen, onClose: () => setTradeModalOpen(false), maxWidth: "sm", fullWidth: true, fullScreen: isMobile, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Request Shift Trade" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Your Shift" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: tradeForm.shiftId, label: "Your Shift", onChange: (e) => setTradeForm((p) => ({ ...p, shiftId: e.target.value })), children: shifts.filter((s) => s.userId === currentUser?.id && new Date(s.startTime) > /* @__PURE__ */ new Date()).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: s.id, children: [
            safeFormat(new Date(s.startTime), "MMM d, h:mm a"),
            " – ",
            safeFormat(new Date(s.endTime), "h:mm a"),
            " ",
            s.position && `(${s.position})`
          ] }, s.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Trade With" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tradeForm.targetUserId, label: "Trade With", onChange: (e) => setTradeForm((p) => ({ ...p, targetUserId: e.target.value })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Open to anyone" }) }),
            employees.filter((e) => e.id !== currentUser?.id).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: e.id, children: [
              e.firstName,
              " ",
              e.lastName,
              " ",
              e.position && ` · ${e.position}`
            ] }, e.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Reason",
            multiline: true,
            rows: 3,
            required: true,
            value: tradeForm.reason,
            onChange: (e) => setTradeForm((p) => ({ ...p, reason: e.target.value })),
            placeholder: "Why do you need to trade?",
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setTradeModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            disabled: !tradeForm.shiftId || !tradeForm.reason.trim() || createTradeMutation.isPending,
            onClick: () => createTradeMutation.mutate(tradeForm),
            children: createTradeMutation.isPending ? "Submitting..." : "Request Trade"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: isAdjustmentDialogOpen,
        onClose: () => setIsAdjustmentDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 4,
            background: isDark ? "#1C1410" : "#FFFFFF"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { component: "div", sx: { pb: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NoteAdd, { color: "warning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "h6", fontWeight: 800, children: editAdjId ? "Edit Attendance Log" : "Log Attendance" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: editAdjId ? "Update the selected attendance entry." : "Record tardiness, overtime, undertime, or absence from the schedule or logbook." }),
            !editAdjId && /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", sx: { mt: 1.5 }, children: quickAdjustmentTypes.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: option.label,
                clickable: true,
                onClick: () => setAdjType(option.value),
                color: adjType === option.value ? "warning" : "default",
                variant: adjType === option.value ? "filled" : "outlined",
                sx: { fontWeight: 700 }
              },
              option.value
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, sx: { mt: 1 }, children: [
            !editAdjId && (adjEmployeeId || adjDate || adjIsRange) && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", children: [
              adjEmployeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  size: "small",
                  label: `Employee: ${employees.find((emp) => emp.id === adjEmployeeId)?.firstName || "Selected"}`,
                  variant: "outlined"
                }
              ),
              adjDate && isValid(adjDate) && !adjIsRange && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  size: "small",
                  label: `Date: ${safeFormat(adjDate, "MMM d, yyyy")}`,
                  variant: "outlined"
                }
              ),
              adjIsRange && adjDate && isValid(adjDate) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  size: "small",
                  label: `Range starts: ${safeFormat(adjDate, "MMM d, yyyy")}`,
                  variant: "outlined"
                }
              )
            ] }) }),
            !editAdjId && /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: adjEmployeeId,
                  label: "Employee",
                  onChange: (e) => setAdjEmployeeId(e.target.value),
                  children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: emp.id, children: [
                    emp.firstName,
                    " ",
                    emp.lastName,
                    " ",
                    emp.position && `· ${emp.position}`
                  ] }, emp.id))
                }
              )
            ] }),
            !editAdjId && /* @__PURE__ */ jsxRuntimeExports.jsxs(LocalizationProvider, { dateAdapter: AdapterDateFns, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DatePicker,
                  {
                    label: adjIsRange ? "Start Date" : "Date",
                    value: adjDate,
                    onChange: (val) => setAdjDate(val),
                    slotProps: { textField: { size: "small", fullWidth: true } }
                  }
                ),
                adjIsRange && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DatePicker,
                  {
                    label: "End Date",
                    value: adjEndDate,
                    onChange: (val) => setAdjEndDate(val),
                    minDate: adjDate || void 0,
                    slotProps: { textField: { size: "small", fullWidth: true } }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "text",
                  onClick: () => {
                    setAdjIsRange(!adjIsRange);
                    setAdjEndDate(null);
                  },
                  sx: { textTransform: "none", alignSelf: "flex-start", mt: -1 },
                  children: adjIsRange ? "← Switch to single-day log" : "📅 Bulk log date range"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: adjType,
                  label: "Type",
                  onChange: (e) => setAdjType(e.target.value),
                  children: adjustmentTypeOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: opt.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 8, height: 8, borderRadius: "50%", bgcolor: opt.color } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opt.label })
                  ] }) }, opt.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: adjType === "late" || adjType === "undertime" ? "Minutes" : adjType === "absent" ? "Days" : "Hours",
                type: "number",
                size: "small",
                fullWidth: true,
                value: adjValue,
                onChange: (e) => setAdjValue(e.target.value),
                InputProps: {
                  endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: adjType === "late" || adjType === "undertime" ? "mins" : adjType === "absent" ? "days" : "hrs" })
                },
                helperText: adjType === "late" || adjType === "undertime" ? "Use minutes for tardiness or undertime from the logbook." : adjType === "absent" ? "Use days for a full-day absence entry." : "Use hours for overtime, rest day OT, holiday OT, or night differential."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Remarks (DOLE compliance)",
                size: "small",
                fullWidth: true,
                multiline: true,
                rows: 2,
                value: adjRemarks,
                onChange: (e) => setAdjRemarks(e.target.value),
                placeholder: "e.g., Late due to heavy traffic, overtime approved by manager"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
              setIsAdjustmentDialogOpen(false);
              setEditAdjId(null);
            }, sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: editAdjId ? "primary" : "warning",
                onClick: handleCreateAdjustment,
                disabled: !editAdjId && (!adjEmployeeId || !adjDate && !adjIsRange) || !adjType || !adjValue || createAdjustmentMutation.isPending || updateAdjustmentMutation.isPending,
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 800, px: 3 },
                children: createAdjustmentMutation.isPending || updateAdjustmentMutation.isPending ? "Saving..." : editAdjId ? "Save Changes" : "Log Exception"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: Boolean(manageLogGroup),
        onClose: () => setManageLogGroup(null),
        maxWidth: "xs",
        fullWidth: true,
        PaperProps: {
          sx: { borderRadius: 3, bgcolor: isDark ? "#1C1410" : "#FFF", backgroundImage: "none" }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { component: "div", sx: { pb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "h6", fontWeight: 800, children: "Manage Exceptions" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { p: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", pb: 2 }, children: manageLogGroup?.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            px: 3,
            py: 2,
            borderBottom: idx < manageLogGroup.length - 1 ? "1px solid" : "none",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, children: [
                log.type.toUpperCase(),
                ": ",
                log.value,
                log.type === "late" || log.type === "undertime" ? "m" : log.type === "absent" ? "d" : "h"
              ] }),
              log.remarks && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.5, fontStyle: "italic" }, children: [
                '"',
                log.remarks,
                '"'
              ] }),
              log.isIncluded === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Excluded", size: "small", color: "error", variant: "outlined", sx: { height: 16, fontSize: "0.6rem", mt: 0.5 } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "primary",
                  onClick: () => {
                    setEditAdjId(log.id);
                    setAdjEmployeeId(log.employeeId);
                    setAdjDate(new Date(log.startDate || log.date));
                    setAdjIsRange(false);
                    setAdjType(log.type);
                    setAdjValue(log.value);
                    setAdjRemarks(log.remarks || "");
                    setManageLogGroup(null);
                    setIsAdjustmentDialogOpen(true);
                  },
                  sx: { bgcolor: alpha(theme.palette.primary.main, 0.1), "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) } },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "error",
                  disabled: deleteAdjustmentMutation.isPending,
                  onClick: () => {
                    if (confirm("Delete this exception log?")) {
                      deleteAdjustmentMutation.mutate(log.id);
                    }
                  },
                  sx: { bgcolor: alpha(theme.palette.error.main, 0.1), "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) } },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" })
                }
              )
            ] })
          ] }, log.id)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { sx: { px: 3, pb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setManageLogGroup(null), sx: { borderRadius: 2, textTransform: "none" }, children: "Done" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: copyWeekDialogOpen,
        onClose: () => !copyWeekMutation.isPending && setCopyWeekDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: { borderRadius: 4, background: isDark ? "#1C1410" : "#FFFFFF" }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { component: "div", sx: { pb: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopyIcon, { color: "primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "h6", fontWeight: 800, children: "Copy Last Week" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Reuse the previous week as a template. The schedule updates live as the new shifts are created." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.25, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.75, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 700, sx: { mb: 0.5 }, children: "Import summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: copyWeekPreview?.lastWeekShifts.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                copyWeekPreview.shiftsToCopy.length,
                " shifts will be copied from ",
                safeFormat(copyWeekPreview.lastWeekStart, "MMM d"),
                " to ",
                safeFormat(copyWeekPreview.lastWeekEnd, "MMM d"),
                copyWeekPreview.lastWeekShifts.length !== copyWeekPreview.shiftsToCopy.length ? `, with ${copyWeekPreview.lastWeekShifts.length - copyWeekPreview.shiftsToCopy.length} overlap(s) skipped.` : "."
              ] }) : "No shifts were found in the previous week yet." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", flexWrap: "wrap", spacing: 1, useFlexGap: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Source: ${safeFormat(copyWeekPreview?.lastWeekStart || weekStart, "MMM d")} – ${safeFormat(copyWeekPreview?.lastWeekEnd || weekEndDate, "MMM d")}`, variant: "outlined" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Target: ${safeFormat(weekStart, "MMM d")} – ${safeFormat(weekEndDate, "MMM d")}`, variant: "outlined" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: copyWeekPreview?.currentWeekShifts.length ? `${copyWeekPreview.currentWeekShifts.length} shifts already exist` : "This week is empty", variant: "outlined" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", variant: "outlined", sx: { borderRadius: 2 }, children: "This is the fastest way to build a repeating schedule. Use it when the pattern is mostly the same from week to week." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCopyWeekDialogOpen(false), sx: { borderRadius: 2, textTransform: "none" }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopyIcon, {}),
                disabled: copyWeekMutation.isPending || !copyWeekPreview?.lastWeekShifts.length,
                onClick: () => copyWeekMutation.mutate(),
                sx: { borderRadius: 2, textTransform: "none", fontWeight: 800, px: 3 },
                children: copyWeekMutation.isPending ? "Copying..." : "Copy Week"
              }
            )
          ] })
        ]
      }
    ),
    isSelectionMode && (selectedShifts.size > 0 || selectedLogs.size > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 8,
        sx: {
          position: "fixed",
          bottom: { xs: 16, sm: 32 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1.5,
          px: 3,
          borderRadius: 8,
          bgcolor: isDark ? "#1C1410" : "#FFF",
          color: isDark ? "#FFF" : "#000",
          border: "1px solid",
          borderColor: isDark ? "#3D3228" : "#E8E0D4",
          zIndex: 1300
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, children: [
            selectedShifts.size + selectedLogs.size,
            " item(s) selected"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true, sx: { borderColor: "divider", mx: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearAllIcon, {}),
              onClick: () => {
                setSelectedShifts(/* @__PURE__ */ new Set());
                setSelectedLogs(/* @__PURE__ */ new Set());
                setIsSelectionMode(false);
              },
              sx: { textTransform: "none", color: "text.secondary", fontWeight: 600 },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              variant: "contained",
              color: "error",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
              disabled: bulkDeleteMutation.isPending,
              onClick: () => {
                if (confirm(`Are you sure you want to delete ${selectedShifts.size + selectedLogs.size} item(s)?`)) {
                  bulkDeleteMutation.mutate();
                }
              },
              sx: { textTransform: "none", fontWeight: 800, borderRadius: 2 },
              children: bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ExceptionLogDrawer,
      {
        open: exceptionLogDrawerOpen,
        onClose: () => {
          setExceptionLogDrawerOpen(false);
          setSelectedExceptionLog(null);
        },
        log: selectedExceptionLog,
        isManager: isManager$1,
        onApprove: (id) => {
          approveAdjustmentMutation.mutate(id);
          setExceptionLogDrawerOpen(false);
        },
        onReject: (id) => {
          rejectAdjustmentMutation.mutate(id);
          setExceptionLogDrawerOpen(false);
        }
      }
    )
  ] });
}

export { ScheduleV2 as default };
