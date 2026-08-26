'use client';

import { Box, Typography, Alert } from '@mui/material';

export default function CalendarPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Calendar</Typography>
      <Alert severity="info">Phase 5 — upcoming interviews + reminders. Coming later.</Alert>
    </Box>
  );
}
