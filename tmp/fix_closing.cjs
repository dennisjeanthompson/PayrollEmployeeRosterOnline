const fs = require('fs');
let s = fs.readFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', 'utf8');

// The first fix: Add closing motion.div
s = s.replace(/<\/Grid>\r?\n\s*<\/Paper>\r?\n\s*}\)/g, '</Grid>\n          </Paper>\n          </motion.div>\n        )}');

// Fix Tab 1 Grid cards (Lines 516-552).
const tab1regex = /{paidEntries\.map\(\(entry\) => \(\s*<Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry\.id}>\s*<Paper[\s\S]*?<\/Paper>\s*<\/Grid>\s*\)\)}/g;

const tab1replace = `{paidEntries.map((entry, idx) => (
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
                          WebkitBackdropFilter: 'blur(20px)',
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

s = s.replace(tab1regex, tab1replace);

fs.writeFileSync('c:\\Users\\admin\\.antigravity\\cuddly-sniffle\\The Cafe\\The Cafe\\client\\src\\pages\\mui-payroll.tsx', s);
