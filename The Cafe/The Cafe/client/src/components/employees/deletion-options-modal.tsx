import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

interface RelatedData {
  hasShifts: boolean;
  hasPayroll: boolean;
  totalRecords: number;
}

interface DeletionOptionsModalProps {
  open: boolean;
  employee: Employee | null;
  relatedData: RelatedData | null;
  isAdmin: boolean;
  onClose: () => void;
  onDeactivate: () => void;
  onForceDelete: (reason: string) => void;
  onExportData: () => void;
  isLoading?: boolean;
}

export function DeletionOptionsModal({
  open,
  employee,
  relatedData,
  isAdmin,
  onClose,
  onDeactivate,
  onForceDelete,
  onExportData,
  isLoading = false,
}: DeletionOptionsModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [understandCheck, setUnderstandCheck] = useState(false);
  const [showForceDelete, setShowForceDelete] = useState(false);
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setConfirmText('');
    setUnderstandCheck(false);
    setShowForceDelete(false);
    setReason('');
    onClose();
  };

  const handleForceDelete = () => {
    if (confirmText === 'DELETE' && understandCheck) {
      onForceDelete(reason || 'Force deletion by admin');
      handleClose();
    }
  };

  const canForceDelete = confirmText === 'DELETE' && understandCheck && isAdmin;

  if (!employee) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <WarningIcon color="warning" />
        <Typography variant="h6" component="span">
          Cannot Delete Employee
        </Typography>
        <IconButton 
          onClick={handleClose} 
          sx={{ ml: 'auto' }}
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            <strong>{employee.firstName} {employee.lastName}</strong> has existing records that would be affected.
          </Typography>
        </Box>

        {relatedData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                This employee has:
              </Typography>
              {relatedData.hasShifts && (
                <Chip size="small" label="Shifts" color="primary" variant="outlined" />
              )}
              {relatedData.hasPayroll && (
                <Chip size="small" label="Payroll Records" color="secondary" variant="outlined" />
              )}
            </Stack>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {!showForceDelete ? (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Choose an option:
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Recommended: Deactivate */}
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: 'success.main',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'success.light',
                    transform: 'scale(1.01)',
                  },
                }}
                onClick={() => {
                  onDeactivate();
                  handleClose();
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <PersonOffIcon color="success" sx={{ fontSize: 32 }} />
                  <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Deactivate Employee
                      <Chip label="Recommended" size="small" color="success" sx={{ ml: 1 }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employee will be marked as inactive. All data is preserved for records and reports.
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Export Data */}
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={onExportData}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <DownloadIcon color="info" sx={{ fontSize: 32 }} />
                  <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Export Employee Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Download all employee data as JSON for backup or compliance.
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Force Delete - Admin Only */}
              {isAdmin && (
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'error.light',
                    },
                  }}
                  onClick={() => setShowForceDelete(true)}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DeleteIcon color="error" sx={{ fontSize: 32 }} />
                    <Box flex={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                        Permanently Delete Everything
                        <Chip label="Admin Only" size="small" color="error" sx={{ ml: 1 }} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Irreversibly delete employee and ALL related data including shifts, payroll, etc.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </>
        ) : (
          <>
            {/* Force Delete Confirmation */}
            <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                This action is IRREVERSIBLE!
              </Typography>
              <Typography variant="body2">
                All shifts, payroll records, time-off requests, and other data for this employee will be permanently deleted.
              </Typography>
            </Alert>

            <TextField
              id="deletion-reason"
              name="deletion-reason"
              fullWidth
              label="Reason for deletion (optional)"
              placeholder="e.g., GDPR request, test data cleanup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              id="delete-confirm"
              name="delete-confirm"
              fullWidth
              label="Type DELETE to confirm"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              error={confirmText !== '' && confirmText !== 'DELETE'}
              helperText={confirmText !== '' && confirmText !== 'DELETE' ? 'Must type DELETE exactly' : ''}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  id="understand-check"
                  name="understand-check"
                  checked={understandCheck}
                  onChange={(e) => setUnderstandCheck(e.target.checked)}
                  color="error"
                />
              }
              label="I understand this will permanently delete all employee data and cannot be undone"
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {showForceDelete ? (
          <>
            <Button onClick={() => setShowForceDelete(false)} disabled={isLoading}>
              Back
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleForceDelete}
              disabled={!canForceDelete || isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              Permanently Delete
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
