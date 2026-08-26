'use client';

import { useMemo } from 'react';
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { Box, Stack } from '@mui/material';
import { useGetApplicationsQuery, useUpdateApplicationMutation } from '@/features/api/apiSlice';
import type { JobApplication, ApplicationStatus } from '@/types';
import KanbanColumn from './KanbanColumn';

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: 'saved', label: 'Saved' },
  { status: 'applied', label: 'Applied' },
  { status: 'screening', label: 'Screening' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
];

interface Props {
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
}

export default function KanbanBoard({ onEdit, onDelete }: Props) {
  const { data: apps = [] } = useGetApplicationsQuery();
  const [updateApp] = useUpdateApplicationMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, JobApplication[]> = {
      saved: [], applied: [], screening: [], interview: [], offer: [], rejected: [],
    };
    apps.forEach((a) => map[a.status].push(a));
    return map;
  }, [apps]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as ApplicationStatus;
    const activeId = active.id as string;
    const current = apps.find((a) => a.id === activeId);
    if (!current || current.status === newStatus) return;

    // Optimistic update: RTK Query invalidates + refetches after mutation.
    updateApp({ id: activeId, status: newStatus });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ overflowX: 'auto', pb: 2, flexWrap: 'nowrap' }}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            apps={grouped[col.status]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Stack>
    </DndContext>
  );
}
