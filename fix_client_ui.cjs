const fs = require('fs');
let text = fs.readFileSync('client/src/pages/mui-payroll-management.tsx', 'utf8');

// The block to replace
const oldUi = `              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: \`1px solid \${alpha(theme.palette.warning.main, 0.1)}\`,
                }}
              >
                <Typography variant="subtitle2" color="warning.main" fontWeight={600} sx={{ mb: 2 }}>
                  💰 Expected Pay Date
                </Typography>
                <DatePicker
                  value={payDate}
                  onChange={(newValue) => setPayDate(newValue)}
                  minDate={endDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          "& input": {
                            padding: "14px 16px",
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.warning.main, 0.02),
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(theme.palette.warning.main, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.warning.main,
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        "& .MuiPaper-root": {
                          borderRadius: 3,
                          boxShadow: \`0 8px 32px \${alpha(theme.palette.warning.main, 0.15)}\`,
                        },
                      },
                    },
                  }}
                />
              </Box>`;

const newUi = `              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: \`1px solid \${alpha(theme.palette.warning.main, 0.1)}\`,
                }}
              >
                <Typography variant="subtitle2" color="warning.main" fontWeight={600} sx={{ mb: 2 }}>
                  ⚙️ Run Type
                </Typography>
                <Select
                  fullWidth
                  value={runType}
                  onChange={(e) => setRunType(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    fontSize: "1.1rem",
                  }}
                >
                  <MenuItem value="regular">Regular (Full Deductions)</MenuItem>
                  <MenuItem value="bonus">Bonus (No Statutory)</MenuItem>
                  <MenuItem value="13th_month">13th Month (No Statutory)</MenuItem>
                  <MenuItem value="final_pay">Final Pay (Custom)</MenuItem>
                  <MenuItem value="correction">Correction</MenuItem>
                  <MenuItem value="off_cycle">Off-Cycle</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Run types automatically handle deduction profiles (e.g. skipping SSS for bonuses).
                </Typography>
              </Box>`;

text = text.replace(oldUi, newUi);

text = text.replace('{startDate && endDate && payDate && (', '{startDate && endDate && (');

const oldSummary = `                        Period: {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")} | Pays on {format(payDate, "MMM d")}`;
const newSummary = `                        Period: {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")} | Type: {runType}`;
text = text.replace(oldSummary, newSummary);

const oldDis = `disabled={!startDate || !endDate || !payDate || createPeriodMutation.isPending}`;
const newDis = `disabled={!startDate || !endDate || createPeriodMutation.isPending}`;
text = text.replace(oldDis, newDis);

// the mutation replace
const oldMutFn = `mutationFn: async (data: { startDate: string; endDate: string; payDate: string }) => {`;
const newMutFn = `mutationFn: async (data: { startDate: string; endDate: string; runType: string }) => {`;
text = text.replace(oldMutFn, newMutFn);

const oldCreatePayload = `if (!startDate || !endDate || !payDate) {
      toast({ title: "Error", description: "Select all dates", variant: "destructive" });
      return;
    }

    createPeriodMutation.mutate({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      payDate: format(payDate, "yyyy-MM-dd")
    });`;

const newCreatePayload = `if (!startDate || !endDate) {
      toast({ title: "Error", description: "Select all dates", variant: "destructive" });
      return;
    }

    createPeriodMutation.mutate({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      runType
    });`;
text = text.replace(oldCreatePayload, newCreatePayload);

fs.writeFileSync('client/src/pages/mui-payroll-management.tsx', text);
