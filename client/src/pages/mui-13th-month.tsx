import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { AccountBalance, Calculate, CheckCircle } from "@mui/icons-material";
import { useToast } from "@/hooks/use-toast";

interface ThirteenthMonthRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  totalBasicSalary: string;
  amount: string;
  status: "pending" | "released";
  isTaxable: boolean;
}

export default function Mui13thMonth() {
  const theme = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, type: 'all' | 'single', ids: string[] }>({
    open: false,
    type: 'all',
    ids: []
  });

  const { data: records = [], isLoading } = useQuery<ThirteenthMonthRecord[]>({
    queryKey: ["/api/13th-month", selectedYear],
  });

  const computeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/13th-month/compute", { year: selectedYear });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/13th-month", selectedYear] });
      toast({
        title: "Computation Complete",
        description: `Successfully computed 13th month pay for ${data.count} employees.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Computation Failed",
        description: String(error),
      });
    }
  });

  const releaseMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("PUT", "/api/13th-month/release", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/13th-month", selectedYear] });
      toast({
        title: "Release Successful",
        description: "The selected records have been marked as released and permanently locked.",
      });
      setConfirmDialog({ open: false, type: 'all', ids: [] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Release Failed",
        description: String(error),
      });
    }
  });

  const handleComputeAll = () => {
    computeMutation.mutate();
  };

  const handleRelease = (id: string) => {
    setConfirmDialog({ open: true, type: 'single', ids: [id] });
  };

  const handleReleaseAll = () => {
    const pendingIds = records.filter(r => r.status === 'pending').map(r => r.id);
    if (pendingIds.length === 0) return;
    setConfirmDialog({ open: true, type: 'all', ids: pendingIds });
  };

  const confirmRelease = () => {
    releaseMutation.mutate(confirmDialog.ids);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(amount));
  };

  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance color="primary" fontSize="large" />
            13th Month Pay
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage mandatory 13th month pay computations and releases for your branch.
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Card sx={{ mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Employees ({records.length})
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                startIcon={computeMutation.isPending ? <CircularProgress size={20} /> : <Calculate />}
                onClick={handleComputeAll}
                disabled={computeMutation.isPending}
              >
                Compute All
              </Button>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleReleaseAll}
                disabled={pendingCount === 0 || releaseMutation.isPending}
              >
                Release All Pending ({pendingCount})
              </Button>
            </Stack>
          </Stack>

          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : records.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={4} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No Records Found</Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                There are no 13th month pay records for {selectedYear}. Click "Compute All" to generate them based on the payroll data for this year.
              </Typography>
              <Button variant="contained" onClick={handleComputeAll} disabled={computeMutation.isPending}>
                Compute Now
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>YTD Basic Salary</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>13th Month Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{formatCurrency(record.totalBasicSalary)}</TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" color="primary.main">
                          {formatCurrency(record.amount)}
                        </Typography>
                        {record.isTaxable && (
                          <Chip size="small" color="warning" label="> ₱90k Taxable" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {record.status === 'released' ? (
                          <Chip icon={<CheckCircle />} label="Released" color="success" size="small" variant="filled" />
                        ) : (
                          <Chip label="Pending" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {record.status === 'pending' && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => handleRelease(record.id)}
                          >
                            Release
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: 'all', ids: [] })}>
        <DialogTitle>Confirm Release</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'all' 
              ? `Are you sure you want to release 13th month pay for all ${confirmDialog.ids.length} pending employees?`
              : "Are you sure you want to release the 13th month pay for this employee?"}
            <br /><br />
            <strong>This action cannot be undone.</strong> Once released, the records will be permanently locked and automatically attached to their December payslips.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: 'all', ids: [] })}>Cancel</Button>
          <Button onClick={confirmRelease} color="success" variant="contained" disabled={releaseMutation.isPending}>
            {releaseMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Confirm Release"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
