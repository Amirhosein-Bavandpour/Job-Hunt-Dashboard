'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Stack, Box, Typography, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/Notes';
import type { JobApplication } from '@/types';

interface Props {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
}

export default function ApplicationCard({ app, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { status: app.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      // No translateY hover here: dnd drives `transform` via the style prop
      // and the theme already gives cards a hover border/glow — a second
      // transform would fight the drag transform and cause a visual jump.
      sx={{
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        // Nested inside the 16px column holder with 12px padding: a smaller
        // radius keeps the corners concentric instead of blobby.
        // NOTE: literal px — an sx number would multiply shape.borderRadius.
        borderRadius: '12px',
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{app.position}</Typography>
            <Typography variant="body2" color="text.secondary">{app.company}</Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => onEdit(app)}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(app)}><DeleteIcon fontSize="small" /></IconButton>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {app.location} · {app.workMode}
        </Typography>
        {app.salary != null && (
          <Chip label={`$${app.salary.toLocaleString()}`} size="small" sx={{ mt: 1 }} />
        )}
        {app.interviewNotes && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
            <NotesIcon fontSize="small" />
            <Typography variant="caption">Interview prep added</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

