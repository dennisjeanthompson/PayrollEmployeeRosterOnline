const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'schedule-v2.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the old bulk loop pattern (lines 878-891 area)
const oldPattern = `    try {
      for (const d of datesToLog) {
        if (!d) continue;
        await createAdjustmentMutation.mutateAsync({
          employeeId: adjEmployeeId,
          date: safeFormat(d, "yyyy-MM-dd"),
          type: adjType,
          value: adjValue,
          remarks: adjRemarks,
        });
      }
    } catch (e) {
      // Error handled by mutation onError
    }`;

const newPattern = `    // Single-day: use the mutation which shows its own toast
    if (datesToLog.length === 1) {
      try {
        await createAdjustmentMutation.mutateAsync({
          employeeId: adjEmployeeId,
          date: safeFormat(datesToLog[0], "yyyy-MM-dd"),
          type: adjType,
          value: adjValue,
          remarks: adjRemarks,
        });
      } catch (e) {
        // Error handled by mutation onError
      }
      return;
    }

    // Bulk date range: bypass the mutation to avoid per-day toasts
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

// Normalize line endings for matching
const normalizeLE = (s) => s.replace(/\r\n/g, '\n');
const contentNorm = normalizeLE(content);
const oldNorm = normalizeLE(oldPattern);

if (!contentNorm.includes(oldNorm)) {
  console.error('ERROR: Could not find the old pattern in the file!');
  // Show nearby content for debugging
  const idx = contentNorm.indexOf('for (const d of datesToLog)');
  if (idx >= 0) {
    console.log('Found "for (const d of datesToLog)" at char offset', idx);
    console.log('Context:\n', contentNorm.substring(idx - 200, idx + 400));
  } else {
    console.log('Could not find "for (const d of datesToLog)" at all.');
  }
  process.exit(1);
}

// Detect original line endings
const usesCRLF = content.includes('\r\n');
let newContent;
if (usesCRLF) {
  newContent = contentNorm.replace(oldNorm, normalizeLE(newPattern)).replace(/\n/g, '\r\n');
} else {
  newContent = contentNorm.replace(oldNorm, normalizeLE(newPattern));
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: Replaced bulk exception log loop with consolidated toast pattern.');
console.log('Line endings:', usesCRLF ? 'CRLF' : 'LF');
