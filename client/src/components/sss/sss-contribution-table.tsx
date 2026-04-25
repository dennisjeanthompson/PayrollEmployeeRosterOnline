/**
 * SSS Contribution Table Component
 * Displays the official 2025 SSS contribution schedule (Circular 2024-006)
 * Matches the format of professional PH payroll systems like Sprout HR
 */

import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { sss2025Brackets, SSSBracket } from "@shared/sss-2025-rates";

export default function SSSContributionTable() {
  const theme = useTheme();
  const [searchSalary, setSearchSalary] = useState("");
  
  // Find the bracket that matches the search salary
  const matchedBracket = useMemo(() => {
    const salary = parseFloat(searchSalary);
    if (isNaN(salary) || salary < 0) return null;
    
    return sss2025Brackets.find(b => {
      if (b.maxSalary === null) return salary >= b.minSalary;
      return salary >= b.minSalary && salary <= b.maxSalary;
    });
  }, [searchSalary]);

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatRange = (min: number, max: number | null) => {
    if (min === 0) return `Below ₱5,250`;
    if (max === null) return `₱${min.toLocaleString()} - Over`;
    return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)`,
            color: "white",
            p: 3,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                SCHEDULE OF SSS CONTRIBUTIONS
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Business Employers and Employees • Effective January 2025
              </Typography>
              <Chip 
                label="Circular No. 2024-006" 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  color: "white",
                  fontWeight: 600,
                }} 
              />
            </Box>
            
            {/* Salary Calculator */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                minWidth: 280,
              }}
            >
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", display: "block", mb: 1 }}>
                Find your contribution bracket:
              </Typography>
              <TextField
                size="small"
                placeholder="Enter monthly salary"
                value={searchSalary}
                onChange={(e) => setSearchSalary(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ color: "white" }}>₱</InputAdornment>,
                  sx: { 
                    bgcolor: "rgba(255,255,255,0.2)", 
                    borderRadius: 2,
                    color: "white",
                    "& input": { color: "white" },
                    "& input::placeholder": { color: "rgba(255,255,255,0.6)" },
                  },
                }}
                sx={{ width: "100%" }}
              />
              {matchedBracket && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Your contribution:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        EE: {formatCurrency(matchedBracket.totalEE)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        ER: {formatCurrency(matchedBracket.totalER)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Stack>
        </Box>

        {/* Info Banner */}
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.5 }}>
          <Typography variant="caption">
            <strong>Rate:</strong> 15% (10% ER + 5% EE) • <strong>MSC Range:</strong> ₱5,000 - ₱35,000 • 
            MPF applies for salaries above ₱20,249.99 • EC: ₱10 (MSC &lt; ₱15k) or ₱30 (MSC ≥ ₱15k)
          </Typography>
        </Alert>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* Range of Compensation */}
                <TableCell 
                  rowSpan={2} 
                  sx={{ 
                    bgcolor: "#1565c0", 
                    color: "white", 
                    fontWeight: 700,
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "center",
                    minWidth: 160,
                  }}
                >
                  RANGE OF<br/>COMPENSATION
                </TableCell>
                
                {/* Monthly Salary Credit */}
                <TableCell 
                  colSpan={3} 
                  sx={{ 
                    bgcolor: "#1976d2", 
                    color: "white", 
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  MONTHLY SALARY CREDIT
                </TableCell>
                
                {/* Employer */}
                <TableCell 
                  colSpan={4} 
                  sx={{ 
                    bgcolor: "#2196f3", 
                    color: "white", 
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  EMPLOYER
                </TableCell>
                
                {/* Employee */}
                <TableCell 
                  colSpan={3} 
                  sx={{ 
                    bgcolor: "#43a047", 
                    color: "white", 
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  EMPLOYEE
                </TableCell>
                
                {/* Total */}
                <TableCell 
                  rowSpan={2}
                  sx={{ 
                    bgcolor: "#ff9800", 
                    color: "white", 
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  TOTAL
                </TableCell>
              </TableRow>
              
              {/* Sub-headers */}
              <TableRow>
                {/* MSC Sub-headers */}
                <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  Regular SS
                </TableCell>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  MPF
                </TableCell>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Total
                </TableCell>
                
                {/* Employer Sub-headers */}
                <TableCell sx={{ bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  Regular SS
                </TableCell>
                <TableCell sx={{ bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  MPF
                </TableCell>
                <TableCell sx={{ bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  EC
                </TableCell>
                <TableCell sx={{ bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Total
                </TableCell>
                
                {/* Employee Sub-headers */}
                <TableCell sx={{ bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  Regular SS
                </TableCell>
                <TableCell sx={{ bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }}>
                  MPF
                </TableCell>
                <TableCell sx={{ bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {sss2025Brackets.map((bracket, index) => {
                const isMatched = matchedBracket && 
                  bracket.minSalary === matchedBracket.minSalary &&
                  bracket.maxSalary === matchedBracket.maxSalary;
                
                return (
                  <TableRow 
                    key={index}
                    sx={{
                      bgcolor: isMatched 
                        ? alpha(theme.palette.success.main, 0.2)
                        : index % 2 === 0 
                          ? alpha(theme.palette.action.hover, 0.3)
                          : "transparent",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                      ...(isMatched && {
                        outline: `2px solid ${theme.palette.success.main}`,
                        outlineOffset: -2,
                      }),
                    }}
                  >
                    {/* Range */}
                    <TableCell sx={{ fontWeight: 600, borderRight: "1px solid rgba(0,0,0,0.05)" }}>
                      {formatRange(bracket.minSalary, bracket.maxSalary)}
                    </TableCell>
                    
                    {/* MSC */}
                    <TableCell align="right" sx={{ fontSize: "0.85rem" }}>
                      {formatCurrency(bracket.regularSSMSC)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", color: bracket.mpfMSC > 0 ? "text.primary" : "text.disabled" }}>
                      {bracket.mpfMSC > 0 ? formatCurrency(bracket.mpfMSC) : "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 600, borderRight: "1px solid rgba(0,0,0,0.05)" }}>
                      {formatCurrency(bracket.totalMSC)}
                    </TableCell>
                    
                    {/* Employer */}
                    <TableCell align="right" sx={{ fontSize: "0.85rem" }}>
                      {formatCurrency(bracket.regularSSER)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", color: bracket.mpfER > 0 ? "text.primary" : "text.disabled" }}>
                      {bracket.mpfER > 0 ? formatCurrency(bracket.mpfER) : "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem" }}>
                      {formatCurrency(bracket.ecER)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "info.main", borderRight: "1px solid rgba(0,0,0,0.05)" }}>
                      {formatCurrency(bracket.totalER)}
                    </TableCell>
                    
                    {/* Employee */}
                    <TableCell align="right" sx={{ fontSize: "0.85rem" }}>
                      {formatCurrency(bracket.regularSSEE)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", color: bracket.mpfEE > 0 ? "text.primary" : "text.disabled" }}>
                      {bracket.mpfEE > 0 ? formatCurrency(bracket.mpfEE) : "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "success.main", borderRight: "1px solid rgba(0,0,0,0.05)" }}>
                      {formatCurrency(bracket.totalEE)}
                    </TableCell>
                    
                    {/* Total */}
                    <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 700, color: "warning.dark" }}>
                      {formatCurrency(bracket.totalContributions)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Footer */}
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
          <Typography variant="caption" color="text.secondary">
            Source: SSS Circular No. 2024-006 dated 19 December 2024 • 
            61 brackets • MSC: Monthly Salary Credit • MPF: Mandatory Provident Fund • 
            EC: Employees' Compensation
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
