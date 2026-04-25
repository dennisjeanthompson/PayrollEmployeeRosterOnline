const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', 'utf8');

// The syntax error is right here:
//             </Grid>
//           </Paper>
//         )}
//
// Let's replace:
//           </Paper>\n        )}
// with:
//           </Paper>\n          </motion.div>\n        )}

content = content.replace(
  '            </Grid>\r\n          </Paper>\r\n        )}',
  '            </Grid>\n          </Paper>\n          </motion.div>\n        )}'
);

content = content.replace(
  '            </Grid>\n          </Paper>\n        )}',
  '            </Grid>\n          </Paper>\n          </motion.div>\n        )}'
);

// We also need to fix Tab 1 Grid cards (Lines 516-552).
const blockToReplace = `{paidEntries.map((entry) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleViewPayslip(entry)}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <ReceiptIcon color="primary" />
                        </Avatar>
                      </Stack>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Pay Period
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {entry.periodStartDate && entry.periodEndDate
                          ? \`\${format(new Date(entry.periodStartDate), "MMM d")} – \${format(new Date(entry.periodEndDate), "MMM d, yyyy")}\`
                          : format(parseISO(entry.createdAt), "MMMM d, yyyy")}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {formatCurrency(entry.netPay)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}`;

const replacementBlock = `{paidEntries.map((entry, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          cursor: "pointer",
                          bgcolor: alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(20px)',
                          border: \`1px solid \${alpha(theme.palette.primary.main, 0.15)}\`,
                          boxShadow: \`0 8px 24px \${alpha(theme.palette.primary.main, 0.08)}\`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "border-color 0.3s, box-shadow 0.3s",
                          "&:hover": {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            boxShadow: \`0 12px 32px \${alpha(theme.palette.primary.main, 0.15)}\`,
                          },
                        }}
                        onClick={() => handleViewPayslip(entry)}
                      >
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: \`radial-gradient(circle at top right, \${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)\` }} />
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44 }}>
                            <ReceiptIcon />
                          </Avatar>
                          <Chip 
                            label="Paid" 
                            size="small" 
                            color="success" 
                            sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }} 
                          />
                        </Stack>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.5, display: 'block', position: 'relative', zIndex: 1 }}>
                          Pay Period
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary', position: 'relative', zIndex: 1 }}>
                          {entry.periodStartDate && entry.periodEndDate
                            ? \`\${format(new Date(entry.periodStartDate), "MMM d")} – \${format(new Date(entry.periodEndDate), "MMM d, yyyy")}\`
                            : format(parseISO(entry.createdAt), "MMMM d, yyyy")}
                        </Typography>
                        <Divider sx={{ my: 2, opacity: 0.6 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Net Pay
                          </Typography>
                          <Typography variant="h5" fontWeight={900} color="success.main" lineHeight={1}>
                            {formatCurrency(entry.netPay)}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}`;

// Try to replace CRLF
content = content.replace(blockToReplace.replace(/\n/g, '\r\n'), replacementBlock);
// Fallback LF
content = content.replace(blockToReplace, replacementBlock);


// Fix the interior formatting for current period card we just replaced that looks bad.
const currentPeriodBadFormat = \`            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Current Pay Period
              </Typography>
              <Chip
                label={currentEntry.status.toUpperCase()}
                color={currentEntry.status === "pending" ? "warning" : "default"}
                size="small"
              />
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hours Worked
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {parseFloat(String(currentEntry.totalHours)).toFixed(1)}h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Regular: {parseFloat(String(currentEntry.regularHours)).toFixed(1)}h | OT:{" "}
                    {parseFloat(String(currentEntry.overtimeHours)).toFixed(1)}h
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Gross Pay
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(currentEntry.grossPay)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Before deductions
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Net Pay
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {formatCurrency(currentEntry.netPay)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    After {formatCurrency(currentEntry.deductions)} deductions
                  </Typography>
                </Box>
              </Grid>\`;

const currentPeriodGoodFormat = \`              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                  Current Pay Period
                </Typography>
                <Chip
                  label={currentEntry.status.toUpperCase()}
                  color={currentEntry.status === "pending" ? "warning" : "default"}
                  size="small"
                  sx={{ fontWeight: 800, px: 1 }}
                />
              </Stack>

              <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                      Hours Worked
                    </Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ color: 'text.primary', display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                      {parseFloat(String(currentEntry.totalHours)).toFixed(1)}<Typography variant="h6" color="text.secondary" sx={{ mb: 0.8, fontWeight: 700 }}>h</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Regular: {parseFloat(String(currentEntry.regularHours)).toFixed(1)}h | OT:{" "}
                      {parseFloat(String(currentEntry.overtimeHours)).toFixed(1)}h
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                      Gross Pay
                    </Typography>
                    <Typography variant="h3" fontWeight={900}>
                      {formatCurrency(currentEntry.grossPay)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Before deductions
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                      Estimated Net Pay
                    </Typography>
                    <Typography variant="h3" fontWeight={900} color="success.main">
                      {formatCurrency(currentEntry.netPay)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      After {formatCurrency(currentEntry.deductions)} deductions
                    </Typography>
                  </Box>
                </Grid>\`;

content = content.replace(currentPeriodBadFormat.replace(/\n/g, '\r\n'), currentPeriodGoodFormat);
content = content.replace(currentPeriodBadFormat, currentPeriodGoodFormat);

fs.writeFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', content, 'utf8');
