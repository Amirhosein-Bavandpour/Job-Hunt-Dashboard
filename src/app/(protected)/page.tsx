'use client';

import { Box, Grid, Card, CardContent, Typography, Stack, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useGetDashboardStatsQuery, useGetApplicationsQuery } from '@/features/api/apiSlice';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';
import { STATUS_LABEL, statusChipSx } from '@/lib/status';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="primary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  // SERVER STATE via RTK Query -> caching/loading/error handled for us.
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetDashboardStatsQuery();
  const { data: apps, isLoading: appsLoading, isError: appsError } = useGetApplicationsQuery();
  // EPHEMERAL UI state via Zustand (just demonstrating the separation).
  // NOTE: must be called BEFORE any early return (React hook rules).
  const kanbanMode = useDashboardUIStore((s) => s.kanbanMode);

  if (statsLoading || appsLoading) return <Typography>Loading dashboard…</Typography>;
  if (statsError || appsError) return <Typography color="error">Failed to load stats.</Typography>;

  return (
    <Box>
      <motion.div {...fadeUp}>
        <Typography variant="overline" color="primary">
          Overview
        </Typography>
        <Typography variant="h4" gutterBottom>
          Job Hunt Dashboard
        </Typography>
      </motion.div>

      <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Total" value={stats?.total ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Interviews" value={stats?.interviews ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Offers" value={stats?.offers ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Rejected" value={stats?.rejected ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="This Month" value={stats?.thisMonth ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Upcoming" value={stats?.upcoming ?? 0} /></motion.div></Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Recent Applications</Typography>
        <Typography variant="caption" color="text.secondary">
          {kanbanMode ? 'Kanban view' : 'Table view'}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {(apps ?? []).slice(0, 5).map((a, i) => (
          <motion.div key={a.id} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.05 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{a.position}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.company} · {a.location} · {a.workMode}
                    </Typography>
                  </Box>
                  <Chip label={STATUS_LABEL[a.status]} size="small" variant="outlined" sx={statusChipSx(a.status)} />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}
