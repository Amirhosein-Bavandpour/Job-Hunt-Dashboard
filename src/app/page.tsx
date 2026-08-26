'use client';

import { Box, Grid, Card, CardContent, Typography, Stack, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useGetDashboardStatsQuery, useGetApplicationsQuery } from '@/features/api/apiSlice';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';

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
  const stats = useGetDashboardStatsQuery();
  const apps = useGetApplicationsQuery();
  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErr, requestId: statsRid } = stats;
  const { data: appsData, isLoading: appsLoading, isError: appsError, error: appsErr, requestId: appsRid } = apps;

  // TEMP DIAGNOSTICS (remove after fix)
  console.log('[DIAG] stats FULL', {
    status: stats.status, isLoading: stats.isLoading, isFetching: stats.isFetching,
    isSuccess: stats.isSuccess, isError: stats.isError, rid: stats.requestId,
    data: statsData?.total, started: stats.startedTimeStamp, fulfilled: stats.fulfilledTimeStamp,
  });
  console.log('[DIAG] apps FULL', {
    status: apps.status, isLoading: apps.isLoading, isFetching: apps.isFetching,
    isSuccess: apps.isSuccess, isError: apps.isError, rid: apps.requestId,
    count: appsData?.length, started: apps.startedTimeStamp, fulfilled: apps.fulfilledTimeStamp,
  });
  if (statsError || appsError) {
    return (
      <Box>
        <Typography color="error">Stats error: {JSON.stringify(statsErr)}</Typography>
        <Typography color="error">Apps error: {JSON.stringify(appsErr)}</Typography>
      </Box>
    );
  }
  if (statsLoading || appsLoading) return <Typography>Loading dashboard…</Typography>;

  // EPHEMERAL UI state via Zustand (just demonstrating the separation).
  const kanbanMode = useDashboardUIStore((s) => s.kanbanMode);

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
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Total" value={statsData?.total ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Interviews" value={statsData?.interviews ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Offers" value={statsData?.offers ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Rejected" value={statsData?.rejected ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="This Month" value={statsData?.thisMonth ?? 0} /></motion.div></Grid>
        <Grid item xs={6} md={2}><motion.div {...fadeUp}><StatCard label="Upcoming" value={statsData?.upcoming ?? 0} /></motion.div></Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Recent Applications</Typography>
        <Chip size="small" label={kanbanMode ? 'kanban' : 'table'} />
      </Stack>

      <Stack spacing={1}>
        {(appsData ?? []).slice(0, 5).map((a, i) => (
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
                  <Chip label={a.status} size="small" />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
}
