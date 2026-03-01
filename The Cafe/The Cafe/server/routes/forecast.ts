/**
 * Forecast & Analytics Routes
 * Provides predictive analytics for labor demand, payroll costs, and staffing
 */

import { Router, Request, Response } from "express";
import { dbStorage as storage } from "../db-storage";
import { 
  format, 
  subDays, 
  subWeeks, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfDay,
  endOfDay,
  addDays,
  getDay,
  differenceInHours,
  parseISO,
  isWithinInterval,
  isSameDay
} from "date-fns";

const router = Router();

// ============================================
// Philippine Holidays 2025/2026
// ============================================
const PH_HOLIDAYS: { date: string; name: string; type: "regular" | "special" }[] = [
  // 2025 Regular Holidays
  { date: "2025-01-01", name: "New Year's Day", type: "regular" },
  { date: "2025-04-09", name: "Araw ng Kagitingan", type: "regular" },
  { date: "2025-04-17", name: "Maundy Thursday", type: "regular" },
  { date: "2025-04-18", name: "Good Friday", type: "regular" },
  { date: "2025-05-01", name: "Labor Day", type: "regular" },
  { date: "2025-06-12", name: "Independence Day", type: "regular" },
  { date: "2025-08-25", name: "National Heroes Day", type: "regular" },
  { date: "2025-11-30", name: "Bonifacio Day", type: "regular" },
  { date: "2025-12-25", name: "Christmas Day", type: "regular" },
  { date: "2025-12-30", name: "Rizal Day", type: "regular" },
  // 2025 Special Non-Working Days
  { date: "2025-01-29", name: "Chinese New Year", type: "special" },
  { date: "2025-02-25", name: "EDSA Revolution Anniversary", type: "special" },
  { date: "2025-04-19", name: "Black Saturday", type: "special" },
  { date: "2025-08-21", name: "Ninoy Aquino Day", type: "special" },
  { date: "2025-11-01", name: "All Saints' Day", type: "special" },
  { date: "2025-11-02", name: "All Souls' Day", type: "special" },
  { date: "2025-12-08", name: "Immaculate Conception", type: "special" },
  { date: "2025-12-24", name: "Christmas Eve", type: "special" },
  { date: "2025-12-31", name: "New Year's Eve", type: "special" },
  // 2026 Regular Holidays
  { date: "2026-01-01", name: "New Year's Day", type: "regular" },
  { date: "2026-04-09", name: "Araw ng Kagitingan", type: "regular" },
  { date: "2026-04-02", name: "Maundy Thursday", type: "regular" },
  { date: "2026-04-03", name: "Good Friday", type: "regular" },
  { date: "2026-05-01", name: "Labor Day", type: "regular" },
  { date: "2026-06-12", name: "Independence Day", type: "regular" },
  { date: "2026-08-31", name: "National Heroes Day", type: "regular" },
  { date: "2026-11-30", name: "Bonifacio Day", type: "regular" },
  { date: "2026-12-25", name: "Christmas Day", type: "regular" },
  { date: "2026-12-30", name: "Rizal Day", type: "regular" },
];

// Helper: Check if date is a holiday
function getHoliday(date: Date): { name: string; type: "regular" | "special" } | null {
  const dateStr = format(date, "yyyy-MM-dd");
  const holiday = PH_HOLIDAYS.find(h => h.date === dateStr);
  return holiday ? { name: holiday.name, type: holiday.type } : null;
}

// Helper: Get upcoming holidays within N days
function getUpcomingHolidays(days: number): typeof PH_HOLIDAYS {
  const today = startOfDay(new Date());
  const endDate = addDays(today, days);
  return PH_HOLIDAYS.filter(h => {
    const holidayDate = parseISO(h.date);
    return isWithinInterval(holidayDate, { start: today, end: endDate });
  });
}

// ============================================
// Auth Middleware
// ============================================
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};

const requireManagerRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

// ============================================
// Analytics: Historical Trends
// ============================================
router.get("/api/analytics/trends", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { days = "56", view = "daily" } = req.query;
    const numDays = Math.min(parseInt(days as string) || 56, 90);
    
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, numDays - 1));
    
    // Get all shifts in range
    const allShifts = await storage.getShiftsByBranch(branchId);
    const shiftsInRange = allShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate >= startDate && shiftDate <= endDate;
    });

    // Aggregate by day
    const dailyData: Record<string, { hours: number; cost: number; shifts: number; date: string }> = {};
    
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const dateKey = format(d, "yyyy-MM-dd");
      dailyData[dateKey] = { hours: 0, cost: 0, shifts: 0, date: dateKey };
    }

    for (const shift of shiftsInRange) {
      const dateKey = format(new Date(shift.startTime), "yyyy-MM-dd");
      if (dailyData[dateKey]) {
        const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
        dailyData[dateKey].hours += hours;
        dailyData[dateKey].shifts += 1;
        // Estimate cost (will need hourly rate from user)
        const user = await storage.getUser(shift.userId);
        const hourlyRate = parseFloat(user?.hourlyRate || "100");
        dailyData[dateKey].cost += hours * hourlyRate;
      }
    }

    // Convert to array and add day-of-week
    const trends = Object.values(dailyData).map(d => ({
      ...d,
      dayOfWeek: format(parseISO(d.date), "EEE"),
      dayOfWeekNum: getDay(parseISO(d.date)),
      isHoliday: getHoliday(parseISO(d.date)),
    }));

    // Calculate weekly aggregates if requested
    let weeklyData: any[] = [];
    if (view === "weekly") {
      const weekMap: Record<string, { hours: number; cost: number; shifts: number; weekStart: string }> = {};
      for (const day of trends) {
        const weekStart = format(startOfWeek(parseISO(day.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weekMap[weekStart]) {
          weekMap[weekStart] = { hours: 0, cost: 0, shifts: 0, weekStart };
        }
        weekMap[weekStart].hours += day.hours;
        weekMap[weekStart].cost += day.cost;
        weekMap[weekStart].shifts += day.shifts;
      }
      weeklyData = Object.values(weekMap);
    }

    // Calculate day-of-week averages (for pattern detection)
    const dayOfWeekAverages: Record<number, { hours: number; cost: number; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      dayOfWeekAverages[i] = { hours: 0, cost: 0, count: 0 };
    }
    for (const day of trends) {
      const dow = day.dayOfWeekNum;
      dayOfWeekAverages[dow].hours += day.hours;
      dayOfWeekAverages[dow].cost += day.cost;
      dayOfWeekAverages[dow].count += 1;
    }
    const weeklyPatterns = Object.entries(dayOfWeekAverages).map(([dow, data]) => ({
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(dow)],
      dayOfWeekNum: parseInt(dow),
      avgHours: data.count > 0 ? data.hours / data.count : 0,
      avgCost: data.count > 0 ? data.cost / data.count : 0,
    }));

    // Comparison: This week vs last week
    const today = new Date();
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

    const thisWeekShifts = shiftsInRange.filter(s => {
      const d = new Date(s.startTime);
      return d >= thisWeekStart && d <= thisWeekEnd;
    });
    const lastWeekShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= lastWeekStart && d <= lastWeekEnd;
    });

    let thisWeekHours = 0, lastWeekHours = 0;
    for (const s of thisWeekShifts) {
      thisWeekHours += differenceInHours(new Date(s.endTime), new Date(s.startTime));
    }
    for (const s of lastWeekShifts) {
      lastWeekHours += differenceInHours(new Date(s.endTime), new Date(s.startTime));
    }

    const comparison = {
      thisWeek: { hours: thisWeekHours, shifts: thisWeekShifts.length },
      lastWeek: { hours: lastWeekHours, shifts: lastWeekShifts.length },
      hoursChange: lastWeekHours > 0 ? ((thisWeekHours - lastWeekHours) / lastWeekHours * 100) : 0,
      shiftsChange: lastWeekShifts.length > 0 ? ((thisWeekShifts.length - lastWeekShifts.length) / lastWeekShifts.length * 100) : 0,
    };

    res.json({
      trends: view === "weekly" ? weeklyData : trends,
      weeklyPatterns,
      comparison,
      meta: { startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd"), view }
    });
  } catch (error) {
    console.error("Error fetching analytics trends:", error);
    res.status(500).json({ message: "Failed to fetch analytics trends" });
  }
});

// ============================================
// Forecast: Labor Hours
// ============================================
router.get("/api/forecast/labor", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days as string) || 14, 30);
    
    // Get historical data (last 8 weeks for pattern detection)
    const today = startOfDay(new Date());
    const historyStart = subWeeks(today, 8);
    
    const allShifts = await storage.getShiftsByBranch(branchId);
    const historicalShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });

    // Calculate day-of-week averages
    const dowStats: Record<number, { hours: number[]; }> = {};
    for (let i = 0; i < 7; i++) dowStats[i] = { hours: [] };

    const dailyHours: Record<string, number> = {};
    for (const shift of historicalShifts) {
      const dateKey = format(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hours;
    }

    for (const [dateKey, hours] of Object.entries(dailyHours)) {
      const dow = getDay(parseISO(dateKey));
      dowStats[dow].hours.push(hours);
    }

    // Calculate averages and standard deviations for each day of week
    const dowAverages: Record<number, { avg: number; std: number }> = {};
    for (let i = 0; i < 7; i++) {
      const values = dowStats[i].hours;
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        dowAverages[i] = { avg, std: Math.sqrt(variance) };
      } else {
        dowAverages[i] = { avg: 8, std: 2 }; // Default 8 hours with ±2 std
      }
    }

    // Generate forecasts
    const forecasts: any[] = [];
    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const holiday = getHoliday(forecastDate);
      
      let predicted = dowAverages[dow].avg;
      
      // Adjust for holidays (typically lower traffic)
      if (holiday) {
        if (holiday.type === "regular") {
          predicted *= 0.4; // 60% reduction for regular holidays
        } else {
          predicted *= 0.7; // 30% reduction for special holidays
        }
      }

      // ±10% confidence band around predicted value
      const lower = predicted * 0.9;
      const upper = predicted * 1.1;

      forecasts.push({
        date: format(forecastDate, "yyyy-MM-dd"),
        dayOfWeek: format(forecastDate, "EEE"),
        predicted: Math.round(predicted * 10) / 10,
        lower: Math.round(lower * 10) / 10,
        upper: Math.round(upper * 10) / 10,
        isHoliday: holiday,
      });
    }

    // Check if enough historical data
    const hasEnoughData = Object.values(dowStats).every(s => s.hours.length >= 2);

    res.json({
      forecasts,
      confidence: hasEnoughData ? "high" : "low",
      message: hasEnoughData 
        ? "Predictions based on 8-week historical patterns"
        : "Limited data - predictions based on defaults. Add more shifts for better accuracy.",
    });
  } catch (error) {
    console.error("Error generating labor forecast:", error);
    res.status(500).json({ message: "Failed to generate labor forecast" });
  }
});

// ============================================
// Forecast: Payroll Costs
// ============================================
router.get("/api/forecast/payroll", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days as string) || 14, 30);
    
    const today = startOfDay(new Date());
    const historyStart = subWeeks(today, 8);
    
    const allShifts = await storage.getShiftsByBranch(branchId);
    const employees = await storage.getUsersByBranch(branchId);
    
    // Build employee hourly rate map
    const rateMap: Record<string, number> = {};
    for (const emp of employees) {
      rateMap[emp.id] = parseFloat(emp.hourlyRate || "100");
    }
    
    // Calculate average daily cost by day-of-week
    const dowCosts: Record<number, number[]> = {};
    for (let i = 0; i < 7; i++) dowCosts[i] = [];

    const historicalShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });

    const dailyCosts: Record<string, number> = {};
    for (const shift of historicalShifts) {
      const dateKey = format(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      const rate = rateMap[shift.userId] || 100;
      dailyCosts[dateKey] = (dailyCosts[dateKey] || 0) + (hours * rate);
    }

    for (const [dateKey, cost] of Object.entries(dailyCosts)) {
      const dow = getDay(parseISO(dateKey));
      dowCosts[dow].push(cost);
    }

    const dowAverages: Record<number, number> = {};
    for (let i = 0; i < 7; i++) {
      const values = dowCosts[i];
      dowAverages[i] = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 800; // Default daily cost
    }

    // Generate payroll forecasts
    const forecasts: any[] = [];
    let totalPredicted = 0;
    
    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const holiday = getHoliday(forecastDate);
      
      let predicted = dowAverages[dow];
      
      if (holiday) {
        if (holiday.type === "regular") {
          // Regular holiday: 200% premium but fewer hours
          predicted = predicted * 0.4 * 2;
        } else {
          // Special holiday: 130% premium, slightly fewer hours
          predicted = predicted * 0.7 * 1.3;
        }
      }

      totalPredicted += predicted;
      
      forecasts.push({
        date: format(forecastDate, "yyyy-MM-dd"),
        dayOfWeek: format(forecastDate, "EEE"),
        predicted: Math.round(predicted),
        lower: Math.round(predicted * 0.9),
        upper: Math.round(predicted * 1.1),
        isHoliday: holiday,
      });
    }

    res.json({
      forecasts,
      summary: {
        totalPredicted: Math.round(totalPredicted),
        avgDaily: Math.round(totalPredicted / forecastDays),
        period: `${forecastDays} days`,
      },
    });
  } catch (error) {
    console.error("Error generating payroll forecast:", error);
    res.status(500).json({ message: "Failed to generate payroll forecast" });
  }
});

// ============================================
// Forecast: Peak Periods Detection
// ============================================
router.get("/api/forecast/peaks", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { days = "30" } = req.query;
    const forecastDays = Math.min(parseInt(days as string) || 30, 60);
    
    const today = startOfDay(new Date());
    const historyStart = subWeeks(today, 8);
    
    const allShifts = await storage.getShiftsByBranch(branchId);
    
    // Calculate day-of-week patterns
    const dowHours: Record<number, number[]> = {};
    for (let i = 0; i < 7; i++) dowHours[i] = [];

    const historicalShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });

    const dailyHours: Record<string, number> = {};
    for (const shift of historicalShifts) {
      const dateKey = format(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hours;
    }

    for (const [dateKey, hours] of Object.entries(dailyHours)) {
      const dow = getDay(parseISO(dateKey));
      dowHours[dow].push(hours);
    }

    // Find overall average and identify peak days
    const allHours = Object.values(dailyHours);
    const overallAvg = allHours.length > 0 
      ? allHours.reduce((a, b) => a + b, 0) / allHours.length 
      : 8;

    const peakThreshold = overallAvg * 1.2; // 20% above average = peak

    // Find peak days of week
    const dowAverages = Object.entries(dowHours).map(([dow, hours]) => ({
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(dow)],
      dayOfWeekNum: parseInt(dow),
      avgHours: hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0,
      isPeak: false,
    }));

    for (const day of dowAverages) {
      day.isPeak = day.avgHours > peakThreshold;
    }

    // Predict peak dates in forecast period
    const upcomingPeaks: any[] = [];
    const upcomingHolidays = getUpcomingHolidays(forecastDays);

    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const dayData = dowAverages.find(d => d.dayOfWeekNum === dow);
      const holiday = getHoliday(forecastDate);

      if (dayData?.isPeak || holiday) {
        upcomingPeaks.push({
          date: format(forecastDate, "yyyy-MM-dd"),
          dayOfWeek: format(forecastDate, "EEE"),
          reason: holiday ? `Holiday: ${holiday.name}` : "High demand day",
          expectedHours: dayData?.avgHours || 0,
          type: holiday ? "holiday" : "peak",
        });
      }
    }

    res.json({
      peakDaysOfWeek: dowAverages.filter(d => d.isPeak),
      upcomingPeaks,
      upcomingHolidays,
      averageDailyHours: Math.round(overallAvg * 10) / 10,
    });
  } catch (error) {
    console.error("Error detecting peak periods:", error);
    res.status(500).json({ message: "Failed to detect peak periods" });
  }
});

// ============================================
// Forecast: Staffing Alerts
// ============================================
router.get("/api/forecast/staffing", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days as string) || 14, 30);
    
    const today = startOfDay(new Date());
    
    // Get scheduled shifts for forecast period
    const allShifts = await storage.getShiftsByBranch(branchId);
    const futureShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= today && d <= addDays(today, forecastDays);
    });

    // Get pending time-off requests for all employees in this branch
    const employees = await storage.getUsersByBranch(branchId);
    const activeEmployees = employees.filter(e => e.isActive && e.role !== "manager" && e.role !== "admin");
    
    // Get time-off requests for all employees (no N+1 - single loop is acceptable here)
    const allTimeOffPromises = activeEmployees.map(e => storage.getTimeOffRequestsByUser(e.id));
    const allTimeOffResults = await Promise.all(allTimeOffPromises);
    const timeOffRequests = allTimeOffResults.flat();
    const pendingTimeOff = timeOffRequests.filter(r => 
      r.status === "pending" || r.status === "approved"
    );

    // Calculate expected labor need based on historical patterns
    const historyStart = subWeeks(today, 8);
    const historicalShifts = allShifts.filter(s => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });

    const dailyShiftCounts: Record<string, number> = {};
    for (const shift of historicalShifts) {
      const dateKey = format(new Date(shift.startTime), "yyyy-MM-dd");
      dailyShiftCounts[dateKey] = (dailyShiftCounts[dateKey] || 0) + 1;
    }

    const avgShiftsPerDay = Object.values(dailyShiftCounts).length > 0
      ? Object.values(dailyShiftCounts).reduce((a, b) => a + b, 0) / Object.values(dailyShiftCounts).length
      : 3;

    // Generate staffing alerts
    const alerts: any[] = [];

    for (let i = 0; i < forecastDays; i++) {
      const checkDate = addDays(today, i);
      const dateStr = format(checkDate, "yyyy-MM-dd");
      
      // Count scheduled shifts for this day
      const scheduledShifts = futureShifts.filter(s => 
        isSameDay(new Date(s.startTime), checkDate)
      );

      // Count employees on leave this day
      const onLeave = pendingTimeOff.filter(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return checkDate >= start && checkDate <= end;
      });

      const availableEmployees = activeEmployees.length - onLeave.length;
      const holiday = getHoliday(checkDate);
      
      // Determine if understaffed
      const expectedNeed = holiday 
        ? Math.ceil(avgShiftsPerDay * 0.5) // Less staff needed on holidays
        : Math.ceil(avgShiftsPerDay);
      
      if (scheduledShifts.length < expectedNeed * 0.7) {
        alerts.push({
          date: dateStr,
          dayOfWeek: format(checkDate, "EEE"),
          type: "understaffed",
          severity: scheduledShifts.length === 0 ? "high" : "medium",
          scheduledShifts: scheduledShifts.length,
          expectedNeed,
          availableEmployees,
          onLeave: onLeave.length,
          message: scheduledShifts.length === 0 
            ? `No shifts scheduled for ${format(checkDate, "MMM d")}!`
            : `Only ${scheduledShifts.length} shifts scheduled (expected ${expectedNeed})`,
          holiday: holiday?.name || null,
        });
      }
    }

    res.json({
      alerts: alerts.sort((a, b) => a.severity === "high" ? -1 : 1),
      summary: {
        totalAlerts: alerts.length,
        highSeverity: alerts.filter(a => a.severity === "high").length,
        mediumSeverity: alerts.filter(a => a.severity === "medium").length,
        activeEmployees: activeEmployees.length,
        upcomingTimeOff: pendingTimeOff.length,
      },
    });
  } catch (error) {
    console.error("Error generating staffing alerts:", error);
    res.status(500).json({ message: "Failed to generate staffing alerts" });
  }
});

export { router as forecastRouter };
