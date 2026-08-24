import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobApplication, DashboardStats } from '@/types';

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
    appliedAt: '2026-07-20', createdAt: '2026-07-19',
  },
  {
    id: '4', company: 'Umbrella', position: 'Frontend Developer',
    status: 'rejected', location: 'Remote', workMode: 'remote',
    appliedAt: '2026-06-15', createdAt: '2026-06-14',
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Application', 'Stats'],
  endpoints: (builder) => ({
    getApplications: builder.query<JobApplication[], void>({
      queryFn: async () => {
        await delay(300);
        return { data: [...db] };
      },
      providesTags: ['Application'],
    }),
    getApplication: builder.query<JobApplication, string>({
      queryFn: async (id) => {
        await delay(200);
        const found = db.find((a) => a.id === id);
        return found ? { data: found } : { error: { status: 404, data: 'Not found' } };
      },
      providesTags: (_res, _err, id) => [{ type: 'Application', id }],
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        await delay(200);
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
    addApplication: builder.mutation<JobApplication, Partial<JobApplication>>({
      queryFn: async (input) => {
        await delay(250);
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
        await delay(250);
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
        await delay(200);
        const idx = db.findIndex((a) => a.id === id);
        if (idx !== -1) db.splice(idx, 1);
        return { data: { id } };
      },
      invalidatesTags: ['Application', 'Stats'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useGetDashboardStatsQuery,
  useAddApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} = apiSlice;
