'use client';

import { Box, Card, CardContent, Grid, Typography, Stack, Chip, Divider, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import BusinessIcon from '@mui/icons-material/Business';
import { useGetCompaniesQuery } from '@/features/api/apiSlice';
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/status';
import type { ApplicationStatus, CompanySummary } from '@/types';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

function CompanyCard({ summary }: { summary: CompanySummary }) {
  const statusChips = summary.statuses.map((s: ApplicationStatus, i: number) => (
    <Chip
      key={i}
      size="small"
      label={STATUS_LABEL[s]}
      sx={{ borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s], background: 'transparent', height: 20, fontSize: 11 }}
      variant="outlined"
    />
  ));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ background: 'rgba(34,211,238,0.12)', color: 'primary.main', width: 44, height: 44 }}>
            <BusinessIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>{summary.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.applications} application{summary.applications > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {statusChips}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.85 }}>Positions</Typography>
          <Typography variant="body2">{summary.positions.join(', ')}</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 600, opacity: 0.85 }}>Locations &amp; work mode</Typography>
          <Typography variant="body2">
            {(() => {
              const locs = summary.locations.filter((l) => !summary.workModes.includes(l as any));
              const modes = summary.workModes;
              const parts = [...new Set([...locs, ...modes])];
              return parts.length ? parts.join(' · ') : '—';
            })()}
          </Typography>

          {summary.bestSalary > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 600, opacity: 0.85 }}>Best offer</Typography>
              <Typography variant="body2">${summary.bestSalary.toLocaleString()}</Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CompaniesPage() {
  const { data, isLoading, isError } = useGetCompaniesQuery();

  if (isLoading) return null;
  if (isError || !data) return <Typography color="error">Failed to load companies.</Typography>;

  return (
    <Box>
      <motion.div {...fadeUp}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Companies</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {data.length} companies you have applied to, ranked by best outcome.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {data.map((c: CompanySummary, i: number) => (
          <Grid item xs={12} sm={6} md={4} key={c.name}>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: Math.min(i * 0.05, 0.3) }}>
              <CompanyCard summary={c} />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
