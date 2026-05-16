const fs = require('fs');
const path = require('path');

// ─── 1. ADD BACKEND PREVIEW ENDPOINT ───────────────────────────
const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let routes = fs.readFileSync(routesPath, 'utf8');

const backendInsertMarker = `  app.post("/api/shifts", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {`;

const newEndpoint = `  // ─── BULK ACTION PREVIEW ──────────────────────────────────────────────────────
  // Returns an impact summary before executing any bulk action (delete/create)
  app.post("/api/shifts/bulk-delete-preview", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { startDate, endDate, employeeId, target } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Fetch shifts in range
      const allShifts = await storage.getShiftsByBranch(branchId, start, end);
      let filteredShifts = employeeId && employeeId !== 'all'
        ? allShifts.filter(s => String(s.userId) === String(employeeId))
        : allShifts;

      // Fetch exception logs in range
      const allLogs = await storage.getAdjustmentLogsByBranch(branchId, start, end);
      let filteredLogs = employeeId && employeeId !== 'all'
        ? allLogs.filter(l => String(l.employeeId) === String(employeeId))
        : allLogs;

      // Determine counts based on target
      let shiftCount = 0;
      let exceptionCount = 0;
      if (target === 'shifts' || target === 'both') shiftCount = filteredShifts.length;
      if (target === 'exceptions' || target === 'both') exceptionCount = filteredLogs.length;

      // Check for shift trades that would be affected
      const shiftIds = filteredShifts.map(s => s.id);
      const allTrades = await storage.getShiftTradesByBranch(branchId);
      const affectedTrades = allTrades.filter(t =>
        (t.status === 'pending' || t.status === 'accepted') &&
        shiftIds.includes(t.shiftId)
      );

      // Check for time-off requests that overlap this date range
      const allTimeOff = await storage.getTimeOffRequestsByBranch(branchId);
      const orphanedLeaves = allTimeOff
        .filter(t => {
          if (t.status !== 'approved' && t.status !== 'pending') return false;
          const tStart = new Date(t.startDate);
          const tEnd = new Date(t.endDate);
          // Check overlap
          if (tStart > end || tEnd < start) return false;
          if (employeeId && employeeId !== 'all' && String(t.userId) !== String(employeeId)) return false;
          return true;
        })
        .map(t => {
          const user = t as any;
          return {
            employeeName: user.userName || 'Employee',
            type: t.type,
            start: t.startDate,
            end: t.endDate,
          };
        });

      // Enrich orphaned leaves with employee names
      const enrichedLeaves = await Promise.all(orphanedLeaves.map(async (leave) => {
        if (leave.employeeName === 'Employee') {
          const matchingTimeOff = allTimeOff.find(t =>
            t.startDate === leave.start && t.endDate === leave.end && t.type === leave.type
          );
          if (matchingTimeOff) {
            const user = await storage.getUser(matchingTimeOff.userId);
            if (user) leave.employeeName = \`\${user.firstName} \${user.lastName}\`;
          }
        }
        return leave;
      }));

      // Enrich affected shifts with employee names for the detail list
      const allUsers = await storage.getUsersByBranch(branchId);
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const shiftDetails = filteredShifts.slice(0, 20).map(s => {
        const user = userMap.get(s.userId);
        return {
          id: s.id,
          employeeName: user ? \`\${user.firstName} \${user.lastName}\` : 'Unknown',
          date: s.startTime,
          startTime: s.startTime,
          endTime: s.endTime,
        };
      });

      const logDetails = filteredLogs.slice(0, 20).map(l => {
        const user = userMap.get(l.employeeId);
        return {
          id: l.id,
          employeeName: user ? \`\${user.firstName} \${user.lastName}\` : 'Unknown',
          type: l.type,
          value: l.value,
          date: l.date,
        };
      });

      res.json({
        shiftCount,
        exceptionCount,
        tradesCount: (target === 'shifts' || target === 'both') ? affectedTrades.length : 0,
        orphanedLeaves: enrichedLeaves,
        shiftDetails,
        logDetails,
        totalAffected: shiftCount + exceptionCount,
      });
    } catch (error: any) {
      console.error('Bulk preview error:', error);
      res.status(500).json({ message: error.message || "Failed to generate preview" });
    }
  }));

`;

if (routes.includes('bulk-delete-preview')) {
  console.log('Backend: bulk-delete-preview endpoint already exists, skipping.');
} else {
  routes = routes.replace(backendInsertMarker, newEndpoint + backendInsertMarker);
  fs.writeFileSync(routesPath, routes, 'utf8');
  console.log('Backend: Added /api/shifts/bulk-delete-preview endpoint.');
}


// ─── 2. ADD PRE-CONFIRMATION SUMMARY TO EXCEPTION LOG DIALOG ────────
const schedulePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'schedule-v2.tsx');
let schedule = fs.readFileSync(schedulePath, 'utf8');

// 2a. Add a state variable for the bulk exception confirmation dialog
const stateMarker = `const [bulkDeleteState, setBulkDeleteState] = useState({`;
const newState = `const [bulkExceptionPreview, setBulkExceptionPreview] = useState<{
    isOpen: boolean;
    employeeName: string;
    type: string;
    value: string;
    remarks: string;
    dateCount: number;
    startDate: string;
    endDate: string;
    isProcessing: boolean;
  } | null>(null);
  const [bulkDeleteState, setBulkDeleteState] = useState({`;

if (schedule.includes('bulkExceptionPreview')) {
  console.log('Frontend: bulkExceptionPreview state already exists, skipping.');
} else {
  schedule = schedule.replace(stateMarker, newState);
  console.log('Frontend: Added bulkExceptionPreview state.');
}

// 2b. Update handleCreateAdjustment to show confirmation instead of immediately submitting
const oldBulkBlock = `    // Bulk date range: bypass the mutation to avoid per-day toasts
    try {
      let successCount = 0;
      let failCount = 0;

      for (const d of datesToLog) {
        if (!d) continue;
        try {
          const res = await apiRequest("POST", "/api/adjustment-logs", {
            employeeId: adjEmployeeId,
            date: safeFormat(d, "yyyy-MM-dd"),
            type: adjType,
            value: adjValue,
            remarks: adjRemarks,
          });
          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      // Invalidate queries once after all calls complete
      queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });

      // Show a single consolidated toast
      if (failCount === 0) {
        toast.success(\`\${successCount} exception log\${successCount > 1 ? 's' : ''} created successfully\`);
      } else {
        toast.warning(\`\${successCount} logged, \${failCount} failed out of \${datesToLog.length} days\`);
      }

      setIsAdjustmentDialogOpen(false);
      setAdjValue("");
      setAdjRemarks("");
    } catch (e) {
      toast.error("Failed to create exception logs");
    }`;

const newBulkBlock = `    // Bulk date range: show confirmation dialog first
    const emp = employees.find(e => e.id === adjEmployeeId);
    const empName = emp ? \`\${emp.firstName} \${emp.lastName}\` : 'Unknown';
    const typeLabel = adjustmentTypeOptions.find(o => o.value === adjType)?.label || adjType;

    setBulkExceptionPreview({
      isOpen: true,
      employeeName: empName,
      type: typeLabel,
      value: adjValue,
      remarks: adjRemarks,
      dateCount: datesToLog.length,
      startDate: safeFormat(datesToLog[0], 'MMM d, yyyy'),
      endDate: safeFormat(datesToLog[datesToLog.length - 1], 'MMM d, yyyy'),
      isProcessing: false,
    })`;

if (schedule.includes('show confirmation dialog first')) {
  console.log('Frontend: Bulk confirmation already integrated, skipping.');
} else {
  schedule = schedule.replace(oldBulkBlock, newBulkBlock);
  console.log('Frontend: Updated handleCreateAdjustment for confirmation flow.');
}

// 2c. Add the executeBulkExceptionCreate function and the confirmation dialog component
// Insert after the closing of the BULK DELETE DIALOG
const bulkDeleteDialogEnd = `      </Dialog>
    </Box>
  );`;

const confirmDialogAndFunction = `      </Dialog>

      {/* ─── BULK EXCEPTION CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={Boolean(bulkExceptionPreview?.isOpen)}
        onClose={() => setBulkExceptionPreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? '#1C1410' : '#FFF', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>📋</Box> Bulk Action Summary
        </DialogTitle>
        <DialogContent>
          {bulkExceptionPreview && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Review the following changes before proceeding. This will create multiple exception logs at once.
              </Alert>

              <Box sx={{ p: 2.5, bgcolor: isDark ? alpha('#F59E0B', 0.08) : alpha('#F59E0B', 0.05), border: '1px solid', borderColor: isDark ? alpha('#F59E0B', 0.2) : alpha('#F59E0B', 0.15), borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Employee</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.employeeName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Exception Type</Typography>
                    <Chip label={bulkExceptionPreview.type} size="small" color="warning" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Value</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.value}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>Date Range</Typography>
                    <Typography variant="body2" fontWeight={600}>{bulkExceptionPreview.startDate} – {bulkExceptionPreview.endDate}</Typography>
                  </Box>
                  {bulkExceptionPreview.remarks && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" fontWeight={700}>Remarks</Typography>
                      <Typography variant="body2" sx={{ maxWidth: '60%', textAlign: 'right' }}>{bulkExceptionPreview.remarks}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: 2, bgcolor: isDark ? '#2A2018' : '#F8F5F0', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={800} color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ fontSize: '1.4rem' }}>⚡</Box>
                  {bulkExceptionPreview.dateCount} exception log{bulkExceptionPreview.dateCount > 1 ? 's' : ''} will be created
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  One {bulkExceptionPreview.type.toLowerCase()} entry per day for {bulkExceptionPreview.employeeName} from {bulkExceptionPreview.startDate} to {bulkExceptionPreview.endDate}.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBulkExceptionPreview(null)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={bulkExceptionPreview?.isProcessing}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
            onClick={async () => {
              if (!bulkExceptionPreview) return;
              setBulkExceptionPreview(prev => prev ? { ...prev, isProcessing: true } : null);

              // Build the dates array again from the original form state
              let datesToLog: Date[] = [adjDate!];
              if (adjIsRange && adjEndDate && adjEndDate > adjDate!) {
                datesToLog = eachDayOfInterval({ start: adjDate!, end: adjEndDate });
              }

              let successCount = 0;
              let failCount = 0;

              for (const d of datesToLog) {
                if (!d) continue;
                try {
                  const res = await apiRequest("POST", "/api/adjustment-logs", {
                    employeeId: adjEmployeeId,
                    date: safeFormat(d, "yyyy-MM-dd"),
                    type: adjType,
                    value: adjValue,
                    remarks: adjRemarks,
                  });
                  if (res.ok) {
                    successCount++;
                  } else {
                    failCount++;
                  }
                } catch {
                  failCount++;
                }
              }

              queryClient.invalidateQueries({ queryKey: [isManager ? "adjustment-logs-branch" : "adjustment-logs-mine"] });

              if (failCount === 0) {
                toast.success(\`\${successCount} exception log\${successCount > 1 ? 's' : ''} created successfully\`);
              } else {
                toast.warning(\`\${successCount} logged, \${failCount} failed out of \${datesToLog.length} days\`);
              }

              setBulkExceptionPreview(null);
              setIsAdjustmentDialogOpen(false);
              setAdjValue("");
              setAdjRemarks("");
            }}
          >
            {bulkExceptionPreview?.isProcessing ? 'Creating...' : \`Confirm & Create \${bulkExceptionPreview?.dateCount || 0} Logs\`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );`;

if (schedule.includes('BULK EXCEPTION CONFIRMATION DIALOG')) {
  console.log('Frontend: Bulk exception confirmation dialog already exists, skipping.');
} else {
  schedule = schedule.replace(bulkDeleteDialogEnd, confirmDialogAndFunction);
  console.log('Frontend: Added bulk exception confirmation dialog.');
}

fs.writeFileSync(schedulePath, schedule, 'utf8');
console.log('\n✅ All changes applied successfully!');
