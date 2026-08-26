import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobApplication, DashboardStats, AnalyticsData, CalendarEvent } from '@/types';

// MOCK backend for v1.
// We use fakeBaseQuery + a local in-memory store so RTK Query's caching,
// loading, error and invalidation behaviour is 100% real.
// Later: swap fakeBaseQuery for fetchBaseQuery({ baseUrl: '/api' }) and add
// Next.js Route Handlers. NO component changes needed -> that's the point.

// ---- in-memory mock DB (resets on reload; fine for portfolio demo) ----
const db: JobApplication[] = [
  {
    id: '1', company: 'Acme Corp', position: 'Frontend Developer',
    status: 'interview', salary: 45000, location: 'Tehran', workMode: 'hybrid',
    jobUrl: 'https://acme.example.com/job', appliedAt: '2026-08-10',
    interviewDate: '2026-08-28',
    createdAt: '2026-08-09',
  },
  {
    id: '2', company: 'Globex', position: 'React Intern',
    status: 'applied', salary: 30000, location: 'Remote', workMode: 'remote',
    appliedAt: '2026-08-18', createdAt: '2026-08-18',
  },
  {
    id: '3', company: 'Initech', position: 'Junior Frontend',
    status: 'offer', salary: 50000, location: 'Tehran', workMode: 'onsite',
    appliedAt: '2026-07-20', interviewDate: '2026-07-25', createdAt: '2026-07-19',
  },
  {
    id: '4', company: 'Umbrella', position: 'Frontend Developer',
    status: 'rejected', location: 'Remote', workMode: 'remote',
    appliedAt: '2026-06-15', interviewDate: '2026-06-22', createdAt: '2026-06-14',
  },
  {
    id: '5', company: 'Stark Industries', position: 'React Engineer',
    status: 'screening', salary: 60000, location: 'Remote', workMode: 'remote',
    appliedAt: '2026-08-22', interviewDate: '2026-09-02', createdAt: '2026-08-21',
  },
  {
    id: '6', company: 'Wayne Enterprises', position: 'Frontend Lead',
    status: 'saved', salary: 70000, location: 'Tehran', workMode: 'hybrid',
    createdAt: '2026-08-25',
  },
];

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Application', 'Stats'],
  endpoints: (builder) => ({
    getApplications: builder.query<JobApplication[], void>({
      queryFn: async () => {
        return { data: [...db] };
      },
      providesTags: ['Application'],
    }),
    getApplication: builder.query<JobApplication, string>({
      queryFn: async (id) => {
        const found = db.find((a) => a.id === id);
        return found ? { data: found } : { error: { status: 404, data: 'Not found' } };
      },
      providesTags: (_res, _err, id) => [{ type: 'Application', id }],
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        const thisMonth = db.filter(
          (a) => a.appliedAt && a.appliedAt.startsWith('2026-08')
        ).length;
        const stats: DashboardStats = {
          total: db.length,
          interviews: db.filter((a) => a.status === 'interview').length,
          offers: db.filter((a) => a.status === 'offer').length,
          rejected: db.filter((a) => a.status === 'rejected').length,
          thisMonth,
          upcoming: db.filter((a) => a.status === 'interview').length,
        };
        return { data: stats };
      },
      providesTags: ['Stats'],
    }),
    // ---- Phase 5: Analytics (derived from mock db) ----
    getAnalytics: builder.query<AnalyticsData, void>({
      queryFn: async () => {
        const statuses: JobApplication['status'][] = [
          'saved', 'applied', 'screening', 'interview', 'offer', 'rejected',
        ];
        const byStatus = statuses.map((status) => ({
          status,
          count: db.filter((a) => a.status === status).length,
        }));

        // Applications per month (by createdAt)
        const monthMap = new Map<string, number>();
        for (const a of db) {
          const m = (a.createdAt || a.appliedAt || '').slice(0, 7);
          if (!m) continue;
          monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
        }
        const byMonth = [...monthMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));

        // Status trend over time (stacked) by appliedAt month
        const trendMap = new Map<string, { applied: number; interview: number; offer: number; rejected: number }>();
        for (const a of db) {
          const m = (a.appliedAt || a.createdAt || '').slice(0, 7);
          if (!m) continue;
          if (!trendMap.has(m)) trendMap.set(m, { applied: 0, interview: 0, offer: 0, rejected: 0 });
          const t = trendMap.get(m)!;
          if (a.status === 'applied') t.applied++;
          else if (a.status === 'interview') t.interview++;
          else if (a.status === 'offer') t.offer++;
          else if (a.status === 'rejected') t.rejected++;
        }
        const trend = [...trendMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, v]) => ({ month, ...v }));

        const data: AnalyticsData = { byStatus, byMonth, trend };
        return { data };
      },
      providesTags: ['Stats'],
    }),
    // ---- Phase 5: Calendar events (interview dates) ----
    getCalendarEvents: builder.query<CalendarEvent[], void>({
      queryFn: async () => {
        const events: CalendarEvent[] = db
          .filter((a) => a.interviewDate)
          .map((a) => ({
            id: `evt-${a.id}`,
            applicationId: a.id,
            company: a.company,
            position: a.position,
            status: a.status,
            date: a.interviewDate as string,
          }));
        return { data: events };
      },
      providesTags: ['Application'],
    }),
    addApplication: builder.mutation<JobApplication, Partial<JobApplication>>({
      queryFn: async (input) => {
        const created: JobApplication = {
          id: String(Date.now()),
          company: input.company ?? 'Unknown',
          position: input.position ?? 'Unknown',
          status: input.status ?? 'saved',
          location: input.location ?? '',
          workMode: input.workMode ?? 'remote',
          createdAt: new Date().toISOString(),
          ...input,
        };
        db.unshift(created);
        return { data: created };
      },
      invalidatesTags: ['Application', 'Stats'],
    }),
    updateApplication: builder.mutation<JobApplication, Partial<JobApplication> & { id: string }>({
      queryFn: async ({ id, ...patch }) => {
        const idx = db.findIndex((a) => a.id === id);
        if (idx === -1) return { error: { status: 404, data: 'Not found' } };
        db[idx] = { ...db[idx], ...patch };
        return { data: db[idx] };
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Application', id: arg.id },
        'Application',
        'Stats',
      ],
    }),
    deleteApplication: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        const idx = db.findIndex((a) => a.id === id);
        if (idx !== -1) db.splice(idx, 1);
        return { data: { id } };
      },
      invalidatesTags: ['Application', 'Stats'],
    }),
    // ---- Mock auth (swap for fetchBaseQuery later) ----
    login: builder.mutation<{ token: string; user: { id: string; name: string; email: string } }, { email: string; password: string }>({
      queryFn: async ({ email }) => {
        // mock: accept any credentials, return a fake JWT-shaped token
        const token = `mock.${Buffer.from(email).toString('base64')}.jwt`;
        return { data: { token, user: { id: 'u1', name: 'Amirhosein', email } } };
      },
    }),
    register: builder.mutation<{ token: string; user: { id: string; name: string; email: string } }, { name: string; email: string; password: string }>({
      queryFn: async ({ name, email }) => {
        const token = `mock.${Buffer.from(email).toString('base64')}.jwt`;
        return { data: { token, user: { id: 'u1', name, email } } };
      },
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useGetDashboardStatsQuery,
  useGetAnalyticsQuery,
  useGetCalendarEventsQuery,
  useAddApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useLoginMutation,
  useRegisterMutation,
} = apiSlice;
