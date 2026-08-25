'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Stack,
} from '@mui/material';
import type { JobApplication, ApplicationStatus } from '@/types';
import {
  useAddApplicationMutation,
  useUpdateApplicationMutation,
} from '@/features/api/apiSlice';

const STATUSES: ApplicationStatus[] = [
  'saved', 'applied', 'screening', 'interview', 'offer', 'rejected',
];
const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  // when editing, pass the existing record; when adding, undefined
  editing?: JobApplication | null;
}

type FormState = {
  company: string;
  position: string;
  status: ApplicationStatus;
  salary: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  jobUrl: string;
  notes: string;
  appliedAt: string;
};

const empty: FormState = {
  company: '', position: '', status: 'saved', salary: '',
  location: '', workMode: 'remote', jobUrl: '', notes: '', appliedAt: '',
};

export default function ApplicationForm({ open, onClose, editing }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [addApp, { isLoading: adding }] = useAddApplicationMutation();
  const [updateApp, { isLoading: updating }] = useUpdateApplicationMutation();

  // hydrate form when opening in edit mode
  useEffect(() => {
    if (editing) {
      setForm({
        company: editing.company,
        position: editing.position,
        status: editing.status,
        salary: editing.salary?.toString() ?? '',
        location: editing.location,
        workMode: editing.workMode,
        jobUrl: editing.jobUrl ?? '',
        notes: editing.notes ?? '',
        appliedAt: editing.appliedAt ?? '',
      });
    } else {
      setForm(empty);
    }
  }, [editing, open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const payload: Partial<JobApplication> = {
      company: form.company,
      position: form.position,
      status: form.status,
      location: form.location,
      workMode: form.workMode,
      jobUrl: form.jobUrl || undefined,
      notes: form.notes || undefined,
      appliedAt: form.appliedAt || undefined,
      salary: form.salary ? Number(form.salary) : undefined,
    };

    if (editing) {
      await updateApp({ id: editing.id, ...payload });
    } else {
      await addApp(payload);
    }
    onClose();
  };

  const busy = adding || updating;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Edit Application' : 'Add Application'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Company" value={form.company}
            onChange={(e) => set('company', e.target.value)} fullWidth required />
          <TextField label="Position" value={form.position}
            onChange={(e) => set('position', e.target.value)} fullWidth required />
          <TextField select label="Status" value={form.status}
            onChange={(e) => set('status', e.target.value as ApplicationStatus)} fullWidth>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Location" value={form.location}
            onChange={(e) => set('location', e.target.value)} fullWidth />
          <TextField select label="Work Mode" value={form.workMode}
            onChange={(e) => set('workMode', e.target.value as FormState['workMode'])} fullWidth>
            {WORK_MODES.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
          <TextField label="Salary" type="number" value={form.salary}
            onChange={(e) => set('salary', e.target.value)} fullWidth />
          <TextField label="Applied Date" type="date" value={form.appliedAt}
            onChange={(e) => set('appliedAt', e.target.value)}
            InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Job URL" value={form.jobUrl}
            onChange={(e) => set('jobUrl', e.target.value)} fullWidth />
          <TextField label="Notes" value={form.notes}
            onChange={(e) => set('notes', e.target.value)} multiline rows={3} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={busy || !form.company || !form.position}>
          {editing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
