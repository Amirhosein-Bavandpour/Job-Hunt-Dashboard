'use client';

import { useDroppable } from '@dnd-kit/core';
import { Box, Typography, Chip, Paper, Stack } from '@mui/material';
import type { JobApplication, ApplicationStatus } from '@/types';
import ApplicationCard from './ApplicationCard';

interface Props {
  status: ApplicationStatus;
  label: string;
  apps: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
}

export default function KanbanColumn({ status, label, apps, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    // Fixed width + no shrink: 6 columns scroll horizontally instead of
    // squeezing (squeezed columns clip content and break card layout).
    // 264px fits 4 columns at 1440px content width; the rest scroll.
    <Box sx={{ width: 264, flexShrink: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, px: 0.5 }}>
        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
          {label}
        </Typography>
        <Chip label={apps.length} size="small" />
      </Stack>
      <Paper
        ref={setNodeRef}
        sx={{
          minHeight: 220,
          p: 1.5,
          // Same glass family as the cards inside it (theme MuiCard):
          // identical radius + material so holder and card read as one unit.
          background: isOver ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
          border: '1px solid',
          borderColor: isOver ? 'rgba(34,211,238,0.40)' : 'rgba(255,255,255,0.10)',
          // NOTE: literal px, not a number — sx numbers multiply
          // shape.borderRadius (16), so 3 would render as 48px.
          borderRadius: '16px',
          transition: 'background .2s, border-color .2s',
        }}
      >
        <Stack spacing={1.5}>
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </Stack>
        {apps.length === 0 && (
          <Box
            sx={{
              mt: apps.length ? 1.5 : 0,
              border: '1px dashed rgba(255,255,255,0.15)',
              // Inner element: smaller radius than the 16px holder.
              borderRadius: '10px',
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', opacity: 0.6 }}>
              Drop here
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
