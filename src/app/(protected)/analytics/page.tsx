'use client';

import { Box, Card, CardContent, Grid, Typography, Stack, Chip, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { useGetAnalyticsQuery } from '@/features/api/apiSlice';
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/status';
import type { ApplicationStatus } from '@/types';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

// Recharts tooltip styled to match the glass theme.
function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: 'rgba(2,6,23,0.92)',
        border: '1px solid rgba(34,211,238,0.40)',
        borderRadius: 2,
        px: 1.5,
        py: 1,
        color: '#f1f5f9',
        fontSize: 13,
      }}
    >
      {label && <Typography variant="caption" sx={{ color: '#a5f3fc' }}>{label}</Typography>}
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 99, background: p.color || p.fill }} />
          <span>{p.name}: {p.value}</span>
        </Box>
      ))}
    </Box>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useGetAnalyticsQuery();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#475569';

  if (isLoading) return null;
  if (isError || !data) return <Typography color="error">Failed to load analytics.</Typography>;

  const statusData = data.byStatus.filter((s) => s.count > 0);

  return (
    <Box>
      <motion.div {...fadeUp}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Aggregated from your {data.byStatus.reduce((n, s) => n + s.count, 0)} applications.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {/* Status breakdown — donut */}
        <Grid item xs={12} md={5}>
          <motion.div {...fadeUp}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Status breakdown</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        label={({ payload }: any) => payload ? `${STATUS_LABEL[payload.status as ApplicationStatus]} (${payload.count})` : ''}
                        labelLine={false}
                      >
                        {statusData.map((s) => (
                          <Cell key={s.status} fill={STATUS_COLORS[s.status]} stroke={isDark ? '#020617' : '#fff'} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<GlassTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {statusData.map((s) => (
                    <Grid item xs={6} sm={4} key={s.status}>
                      <Chip
                        size="small"
                        label={`${STATUS_LABEL[s.status]}: ${s.count}`}
                        sx={{ borderColor: STATUS_COLORS[s.status], color: STATUS_COLORS[s.status], background: 'transparent', width: '100%', justifyContent: 'center' }}
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Applications over time — stacked area */}
        <Grid item xs={12} md={7}>
          <motion.div {...fadeUp}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Applications per month</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.byMonth} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                      <defs>
                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} />
                      <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} tickMargin={8} />
                      <YAxis stroke={axisColor} tick={{ fontSize: 12 }} allowDecimals={false} width={32} tickMargin={4} />
                      <Tooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="count" name="Applications" stroke="#22d3ee" fill="url(#gTotal)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Status trend over time — stacked bar */}
        <Grid item xs={12}>
          <motion.div {...fadeUp}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Status trend over time</Typography>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trend} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} />
                      <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} tickMargin={8} />
                      <YAxis stroke={axisColor} tick={{ fontSize: 12 }} allowDecimals={false} width={32} tickMargin={4} />
                      <Tooltip content={<GlassTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="applied" name="Applied" stackId="s" fill={STATUS_COLORS.applied} radius={[0,0,0,0]} />
                      <Bar dataKey="interview" name="Interview" stackId="s" fill={STATUS_COLORS.interview} />
                      <Bar dataKey="offer" name="Offer" stackId="s" fill={STATUS_COLORS.offer} />
                      <Bar dataKey="rejected" name="Rejected" stackId="s" fill={STATUS_COLORS.rejected} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
