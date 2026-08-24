'use client';

import { Box, Grid, Card, CardContent, Typography, Stack, Chip, Divider } from '@mui/material';
import { useGetDashboardStatsQuery, useGetApplicationsQuery } from '@/features/api/apiSlice';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  // SERVER STATE via RTK Query -> caching/loading/error handled for us.
  const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();
  const { data: apps } = useGetApplicationsQuery();

  // EPHEMERAL UI state via Zustand (just demonstrating the separation).
  const kanbanMode = useDashboardUIStore((s) => s.kanbanMode);

  if (isLoading) return <Typography>Loading dashboard…</Typography>;
  if (isError) return <Typography color="error">Failed to load stats.</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}><StatCard label="Total" value={stats?.total ?? 0} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Interviews" value={stats?.interviews ?? 0} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Offers" value={stats?.offers ?? 0} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Rejected" value={stats?.rejected ?? 0} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="This Month" value={stats?.thisMonth ?? 0} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Upcoming" value={stats?.upcoming ?? 0} /></Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Recent Applications</Typography>
        <Chip size="small" label={kanbanMode ? 'kanban' : 'table'} />
      </Stack>

      <Stack spacing={1}>
        {(apps ?? []).slice(0, 5).map((a) => (
          <Card key={a.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">{a.position}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.company} · {a.location} · {a.workMode}
                  </Typography>
                </Box>
                <Chip label={a.status} color="primary" size="small" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
