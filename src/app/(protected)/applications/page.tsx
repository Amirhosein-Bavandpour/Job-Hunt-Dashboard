'use client';

import { useMemo, useState, Fragment } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel,
  Chip, IconButton, Pagination, Alert, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  useGetApplicationsQuery,
  useDeleteApplicationMutation,
} from '@/features/api/apiSlice';
import type { JobApplication, ApplicationStatus } from '@/types';
import { STATUS_LABEL, statusChipSx } from '@/lib/status';
import ApplicationForm from '@/components/applications/ApplicationForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import KanbanBoard from '@/components/applications/KanbanBoard';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

const STATUSES: ApplicationStatus[] = [
  'saved', 'applied', 'screening', 'interview', 'offer', 'rejected',
];
const PAGE_SIZE = 5;

type SortKey = 'company' | 'position' | 'status' | 'appliedAt';

export default function ApplicationsPage() {
  const { data: apps = [], isLoading, isError } = useGetApplicationsQuery();
  const [deleteApp] = useDeleteApplicationMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('appliedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [pendingDelete, setPendingDelete] = useState<JobApplication | null>(null);
  const kanbanMode = useDashboardUIStore((s) => s.kanbanMode);
  const setKanbanMode = useDashboardUIStore((s) => s.setKanbanMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...apps];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'appliedAt') {
        cmp = (a.appliedAt ?? '').localeCompare(b.appliedAt ?? '');
      } else {
        cmp = (a[sortKey] as string).localeCompare(b[sortKey] as string);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [apps, search, statusFilter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = (app: JobApplication) => {
    setPendingDelete(app);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await deleteApp(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (a: JobApplication) => { setEditing(a); setFormOpen(true); };

  if (isLoading) return <Typography>Loading applications…</Typography>;
  if (isError) return <Alert severity="error">Failed to load applications.</Alert>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="overline" color="primary">Track</Typography>
          <Typography variant="h4">Applications</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined" color="primary"
            startIcon={kanbanMode ? <ViewListIcon /> : <ViewModuleIcon />}
            onClick={() => setKanbanMode(!kanbanMode)}
          >
            {kanbanMode ? 'Table' : 'Kanban'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add Application
          </Button>
        </Stack>
      </Stack>

      {/* Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search company or position"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select size="small" label="Status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as 'all' | ApplicationStatus); setPage(1); }}
          // Match the search field's height: a notched (labelled) small
          // select renders taller than a labelless small input.
          sx={{ minWidth: 160, '& .MuiInputBase-root': { height: 40 } }}
        >
          <MenuItem value="all">All statuses</MenuItem>
          {STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>)}
        </TextField>
      </Stack>

      {kanbanMode ? (
        <KanbanBoard onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        <>
          {/* Table */}
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { color: 'text.secondary', fontWeight: 600, fontSize: 13, borderBottom: '1px solid rgba(34,211,238,0.25)' } }}>
                <TableCell>
                  <TableSortLabel active={sortKey === 'company'} direction={sortDir}
                    onClick={() => handleSort('company')}>Company</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortKey === 'position'} direction={sortDir}
                    onClick={() => handleSort('position')}>Position</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortKey === 'status'} direction={sortDir}
                    onClick={() => handleSort('status')}>Status</TableSortLabel>
                </TableCell>
                <TableCell>Location</TableCell>
                <TableCell>
                  <TableSortLabel active={sortKey === 'appliedAt'} direction={sortDir}
                    onClick={() => handleSort('appliedAt')}>Applied</TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((a) => (
                <Fragment key={a.id}>
                  <TableRow hover>
                    <TableCell>{a.company}</TableCell>
                    <TableCell>{a.position}</TableCell>
                    <TableCell><Chip label={STATUS_LABEL[a.status]} size="small" variant="outlined" sx={statusChipSx(a.status)} /></TableCell>
                    <TableCell>{a.location} · {a.workMode}</TableCell>
                    <TableCell>{a.appliedAt ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                          {expandedId === a.id ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => openEdit(a)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(a)}><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  {expandedId === a.id && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <Stack spacing={2} sx={{ py: 1 }}>
                          {a.notes && (
                            <Box>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>Notes</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.notes}</Typography>
                            </Box>
                          )}
                          {a.interviewNotes && (
                            <Box>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>Interview Prep</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.interviewNotes}</Typography>
                            </Box>
                          )}
                          {a.jobUrl && (
                            <Box>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>Job URL</Typography>
                              <Typography variant="body2"><a href={a.jobUrl} target="_blank" rel="noreferrer" style={{ color: '#22d3ee' }}>{a.jobUrl}</a></Typography>
                            </Box>
                          )}
                          {!a.notes && !a.interviewNotes && !a.jobUrl && (
                            <Typography variant="body2" color="text.secondary">No notes or details added.</Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {paged.length === 0 && (
                <TableRow><TableCell colSpan={6}>
                  <Alert severity="info">No applications match your filters.</Alert>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
            <Pagination
              count={pageCount} page={safePage}
              onChange={(_, p) => setPage(p)} color="primary" size="small"
            />
          </Stack>
        </>
      )}

      <ApplicationForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Application"
        message={pendingDelete ? `${pendingDelete.position} at ${pendingDelete.company} will be permanently removed.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Box>
  );
}
