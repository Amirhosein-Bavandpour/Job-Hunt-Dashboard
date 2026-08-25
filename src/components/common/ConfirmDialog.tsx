'use client';

import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button,
} from '@mui/material';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Themed in-app confirmation dialog (replaces native browser confirm()).
// Uses the app's dark/cyan palette via theme overrides on MuiDialog.
export default function ConfirmDialog({
  open, title = 'Are you sure?', message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="primary" variant="outlined">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{
          backgroundColor: '#ef4444', color: '#fff',
          '&:hover': { backgroundColor: '#dc2626' },
        }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
