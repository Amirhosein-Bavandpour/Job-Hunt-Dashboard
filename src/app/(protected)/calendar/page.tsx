'use client';

import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, IconButton, Stack, Chip, Tooltip as MuiTooltip } from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import { useGetCalendarEventsQuery } from '@/features/api/apiSlice';
import { STATUS_COLORS } from '@/lib/status';
import type { ApplicationStatus, CalendarEvent } from '@/types';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function startOfMonthGrid(year: number, month: number): Date {
  const first = new Date(year, month, 1);
  // Start grid on the Sunday of the week containing the 1st.
  const day = first.getDay();
  const grid = new Date(year, month, 1 - day);
  grid.setHours(0, 0, 0, 0);
  return grid;
}

export default function CalendarPage() {
  const { data: events, isLoading, isError } = useGetCalendarEventsQuery();
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const gridStart = useMemo(() => startOfMonthGrid(view.year, view.month), [view]);
  // 6 weeks * 7 days = 42 cells covers any month.
  const cells = useMemo(() => {
    const out: Date[] = [];
    const base = new Date(gridStart);
    for (let i = 0; i < 42; i++) {
      out.push(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
    }
    return out;
  }, [gridStart]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events ?? []) {
      const key = e.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const goPrev = () => setView((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const goNext = () => setView((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  if (isLoading) return null;
  if (isError) return <Typography color="error">Failed to load calendar.</Typography>;

  return (
    <Box>
      <motion.div {...fadeUp}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Calendar</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={goPrev} aria-label="previous month"><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" sx={{ minWidth: 160, textAlign: 'center' }}>
              {MONTHS[view.month]} {view.year}
            </Typography>
            <IconButton onClick={goNext} aria-label="next month"><ChevronRightIcon /></IconButton>
          </Stack>
        </Stack>
      </motion.div>

      <motion.div {...fadeUp}>
        <Card>
          <CardContent>
            <Grid container sx={{ mb: 1 }}>
              {WEEKDAYS.map((d) => (
                <Grid item xs={12 / 7} key={d}>
                  <Typography variant="caption" color="primary" sx={{ textAlign: 'center', display: 'block', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {d}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Grid container>
              {cells.map((date, i) => {
                const key = date.toISOString().slice(0, 10);
                const inMonth = date.getMonth() === view.month;
                const isToday = key === today.toISOString().slice(0, 10);
                const dayEvents = eventsByDate.get(key) ?? [];
                return (
                  <Grid item xs={12 / 7} key={i}>
                    <Box
                      sx={{
                        minHeight: 92,
                        p: 1,
                        border: '1px solid',
                        borderColor: isToday ? 'primary.main' : 'rgba(255,255,255,0.06)',
                        borderRadius: 2,
                        background: inMonth ? 'transparent' : 'rgba(255,255,255,0.02)',
                        opacity: inMonth ? 1 : 0.55,
                        transition: 'border-color .2s',
                        '&:hover': { borderColor: 'rgba(34,211,238,0.5)' },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isToday ? 800 : 500,
                          color: isToday ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {dayEvents.slice(0, 2).map((e) => (
                          <MuiTooltip key={e.id} title={`${e.position} @ ${e.company}`}>
                            <Chip
                              size="small"
                              icon={<EventIcon sx={{ fontSize: 14 }} />}
                              label={e.company}
                              sx={{
                                height: 20,
                                fontSize: 11,
                                opacity: inMonth ? 1 : 0.7,
                                borderColor: STATUS_COLORS[e.status],
                                color: STATUS_COLORS[e.status],
                                background: 'transparent',
                                '& .MuiChip-icon': { color: STATUS_COLORS[e.status] },
                                '& .MuiChip-label': { px: 0.5 },
                              }}
                              variant="outlined"
                            />
                          </MuiTooltip>
                        ))}
                        {dayEvents.length > 2 && (
                          <Typography variant="caption" color="text.secondary">+{dayEvents.length - 2} more</Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
