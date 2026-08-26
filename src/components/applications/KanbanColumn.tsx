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
    <Box sx={{ minWidth: 250, flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, px: 0.5 }}>
        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
          {label}
        </Typography>
        <Chip label={apps.length} size="small" />
      </Stack>
      <Paper
        ref={setNodeRef}
        sx={{
          minHeight: 200,
          p: 1.5,
          background: isOver ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: isOver ? 'rgba(34,211,238,0.40)' : 'rgba(255,255,255,0.08)',
          borderRadius: 3,
          transition: 'background .2s, border-color .2s',
        }}
      >
        {apps.map((app) => (
          <ApplicationCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {apps.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
            Drop here
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
