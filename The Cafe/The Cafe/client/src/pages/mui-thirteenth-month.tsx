import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { apiUrl } from "@/lib/api";
import { format, subYears, addYears } from "date-fns";
import { isManager, isAdmin } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";

// MUI X Data Grid
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";

// Icons
import {
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  AccountBalanceWallet as LedgerIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

// Components
import { StatCard, EmptyState } from "@/components/mui/cards";

interface ThirteenthMonthSummary {
  userId: string;
  employeeName: string;
  position: string;
  year: number;
  totalBasicPaid: number;
  projectedThirteenthMonth: number;
  periodsCount: number;
  earliestPeriod: string | null;
  latestPeriod: string | null;
}

export default function MuiThirteenthMonth() {
  const theme = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);

  // Auth check
  const hasAccess = isManager() || isAdmin();
  if (!hasAccess) {
    setLocation("/");
    return null;
  }

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["thirteenth-month-summary", selectedYear],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/thirteenth-month/summary?year=${selectedYear}`);
      return res.json() as Promise<{ summary: ThirteenthMonthSummary[]; year: number }>;
    },
  });

  const summaryData = data?.summary || [];

  // Derived stats
  const totalProjected = summaryData.reduce((sum, row) => sum + row.projectedThirteenthMonth, 0);
  const eligibleCount = summaryData.length;

  const handleExport = () => {
    const now = new Date();
    const ts = format(now, "yyyyMMdd_HHmm");
    const a = document.createElement("a");
    a.href = apiUrl(`/api/thirteenth-month/export?year=${selectedYear}`);
    a.download = `13th_month_${selectedYear}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Success", description: "Ledger exported successfully" });
  };

  const columns: GridColDef[] = [
    {
      field: "employeeName",
      headerName: "Employee Name",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body1" fontWeight={600} noWrap>
            {params.row.employeeName || 'Unknown Employee'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.position || 'No Position'}
          </Typography>
        </Box>
      ),
    },
    {
      field: "periodsCount",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <Tooltip title="Number of payroll cutoffs this employee was included in this year." placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>Periods</Typography>
            <InfoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          </Box>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.row.periodsCount}</Typography>
      ),
    },
    {
      field: "totalBasicPaid",
      flex: 1,
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      renderHeader: () => (
        <Tooltip title="Sum of all basic pay earned this year. Excludes overtime, holiday pay, and night diff per DOLE rules." placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
            <InfoIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" fontWeight={600}>Total Basic Earned</Typography>
          </Box>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={500}>
          ₱{params.row.totalBasicPaid.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      field: "projectedThirteenthMonth",
      flex: 1,
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      renderHeader: () => (
        <Tooltip title="Formula: Total Basic Earned ÷ 12. This is exactly what you currently owe the employee." placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
            <InfoIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={600} color="primary.main">Projected 13th Month</Typography>
          </Box>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          ₱{params.row.projectedThirteenthMonth.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              13th Month Ledger
            </Typography>
            <Typography color="text.secondary">
              Track year-to-date running totals for mandatory 13th-month pay (PD 851)
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Year Selector */}
            <Paper 
              elevation={0} 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1, 
                p: 0.5, 
                borderRadius: 2,
                bgcolor: "action.hover"
              }}
            >
              <IconButton 
                size="small" 
                onClick={() => setSelectedYear(y => y - 1)}
                sx={{ color: "primary.main" }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2 }}>
                <CalendarIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2" fontWeight={600}>
                  {selectedYear}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setSelectedYear(y => y + 1)}
                sx={{ color: "primary.main" }}
                disabled={selectedYear >= new Date().getFullYear()}
              >
                <ChevronRightIcon />
              </IconButton>
            </Paper>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting || summaryData.length === 0}
              sx={{ boxShadow: 2 }}
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </Stack>
        </Box>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Per BIR regulations, 13th-month pay is computed as 1/12 of the total basic salary earned during the year. 
          Overtime, holiday pay, and night differential are legally excluded from this computation base.
        </Alert>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              title={`Total Projected Liability (${selectedYear})`}
              value={`₱${totalProjected.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Sum of all accumulated 13th month balances"
              icon={<LedgerIcon />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              title="Eligible Employees"
              value={eligibleCount}
              subtitle="Employees with basic pay records this year"
              icon={<LedgerIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Data Grid */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {summaryData.length > 0 ? (
            <DataGrid
              rows={summaryData.map(d => ({ ...d, id: d.userId }))}
              columns={columns}
              loading={isLoading}
              disableRowSelectionOnClick
              rowHeight={72}
              autoHeight
              density="comfortable"
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 15 } },
                sorting: { sortModel: [{ field: "employeeName", sort: "asc" }] },
              }}
              pageSizeOptions={[15, 30, 50]}
              sx={{
                border: "none",
                "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
                "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover", borderRadius: 0 },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
                "& .MuiDataGrid-row:hover": { bgcolor: "action.hover" },
              }}
            />
          ) : (
            <EmptyState
              icon={<LedgerIcon />}
              title="No ledger records found"
              description={`No payroll periods have been processed yet for ${selectedYear}. Basic pay will accumulate here automatically when payroll is run.`}
            />
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
