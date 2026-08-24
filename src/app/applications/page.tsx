'use client';

import { Box, Typography, Alert } from '@mui/material';

export default function ApplicationsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Applications</Typography>
      <Alert severity="info">
        Phase 2 — list, add, edit, delete, search, filter, sort, pagination (RTK Query CRUD).
        Coming next.
      </Alert>
    </Box>
  );
}
