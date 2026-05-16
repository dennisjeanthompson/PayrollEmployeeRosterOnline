const fs = require('fs');
const path = require('path');

const schedulePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'schedule-v2.tsx');
let schedule = fs.readFileSync(schedulePath, 'utf8');

// Normalize to LF for matching
const usesCRLF = schedule.includes('\r\n');
if (usesCRLF) schedule = schedule.replace(/\r\n/g, '\n');

// ─── 1. Replace the bulk block in handleCreateAdjustment ─────
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
  console.log('Step 1: Already done, skipping.');
} else if (!schedule.includes(oldBulkBlock)) {
  console.error('Step 1 FAILED: Could not find old bulk block.');
  // Show context
  const idx = schedule.indexOf('Bulk date range:');
  if (idx >= 0) console.log('Context near "Bulk date range:":\n', schedule.substring(idx, idx + 200));
  process.exit(1);
} else {
  schedule = schedule.replace(oldBulkBlock, newBulkBlock);
  console.log('Step 1: Replaced bulk block with confirmation flow.');
}

// ─── 2. Add the confirmation dialog before the closing </Box> ─────
const closingMarker = `      </Dialog>\n    </Box>\n  );`;

const confirmDialog = `      </Dialog>

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
  console.log('Step 2: Already done, skipping.');
} else if (!schedule.includes(closingMarker)) {
  console.error('Step 2 FAILED: Could not find closing marker.');
  // Try alternate endings
  const lastDialog = schedule.lastIndexOf('</Dialog>');
  const lastBox = schedule.lastIndexOf('</Box>');
  console.log('Last </Dialog> at char:', lastDialog);
  console.log('Last </Box> at char:', lastBox);
  console.log('File length:', schedule.length);
  console.log('Last 200 chars:', JSON.stringify(schedule.substring(schedule.length - 200)));
  process.exit(1);
} else {
  schedule = schedule.replace(closingMarker, confirmDialog);
  console.log('Step 2: Added bulk exception confirmation dialog.');
}

// Restore CRLF if needed
if (usesCRLF) schedule = schedule.replace(/\n/g, '\r\n');

fs.writeFileSync(schedulePath, schedule, 'utf8');
console.log('\n✅ All frontend changes applied successfully!');
