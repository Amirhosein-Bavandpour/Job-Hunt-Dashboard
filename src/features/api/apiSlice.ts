import {
  createApi,
  fetchBaseQuery,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type {
  JobApplication,
  AnalyticsData,
  CalendarEvent,
  CompanySummary,
} from '@/types';

// ---- real backend via Next.js Route Handlers (src/app/api/...) ----
// Base URL is relative so it works in dev (localhost:3000) and production
// (same origin, no CORS needed). The httpOnly JWT cookie is sent automatically
// by the browser on every request to the same origin.
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    // Any future auth header (e.g. a non-cookie token) goes here.
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Application', 'Stats'],
  endpoints: (builder) => ({
    getApplications: builder.query<JobApplication[], void>({
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Application'],
    }),

    getApplication: builder.query<JobApplication, string>({
      query: (id) => ({ url: `/apps/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Application', id }],
    }),

    getDashboardStats: builder.query<{ total: number; interviews: number; offers: number; rejected: number; thisMonth: number; upcoming: number }, void>({
      query: () => ({ url: '/stats', method: 'GET' }),
      providesTags: ['Stats'],
      transformResponse: (response: {
        total: number;
        statusCounts: Record<string, number>;
        trend: { date: string; count: number }[];
        avgSalary: number;
      }): { total: number; interviews: number; offers: number; rejected: number; thisMonth: number; upcoming: number } => ({
        total: response.total,
        interviews: response.statusCounts['interview'] ?? 0,
        offers: response.statusCounts['offer'] ?? 0,
        rejected: response.statusCounts['rejected'] ?? 0,
        thisMonth: response.trend.filter((t) => t.date.startsWith('2026-09')).reduce((s, t) => s + t.count, 0),
        upcoming: response.statusCounts['interview'] ?? 0,
      }),
    }),

    getAnalytics: builder.query<AnalyticsData, void>({
      query: () => ({ url: '/stats', method: 'GET' }),
      providesTags: ['Stats'],
      transformResponse: (response: {
        total: number;
        statusCounts: Record<string, number>;
        trend: { date: string; count: number }[];
        avgSalary: number;
      }): AnalyticsData => {
        const statuses: JobApplication['status'][] = [
          'saved', 'applied', 'screening', 'interview', 'offer', 'rejected',
        ];
        const byStatus = statuses.map((status) => ({
          status,
          count: response.statusCounts[status] ?? 0,
        }));

        // Applications per month from trend dates
        const monthMap = new Map<string, number>();
        for (const t of response.trend) {
          const m = t.date.slice(0, 7);
          if (!m) continue;
          monthMap.set(m, (monthMap.get(m) ?? 0) + t.count);
        }
        const byMonth = [...monthMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));

        // Status trend: synthesise a per-month total (single series) for the stacked bar.
        const trend = response.trend.map((t) => ({
          month: t.date.slice(0, 7),
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          total: t.count,
        }));

        return { byStatus, byMonth, trend };
      },
    }),

    getCalendarEvents: builder.query<CalendarEvent[], void>({
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Application'],
      transformResponse: (apps: JobApplication[]): CalendarEvent[] =>
        apps
          .filter((a) => a.interviewDate)
          .map((a) => ({
            id: `evt-${a.id}`,
            applicationId: a.id,
            company: a.company,
            position: a.position,
            status: a.status,
            date: a.interviewDate as string,
          })),
    }),

    getCompanies: builder.query<CompanySummary[], void>({
      query: () => ({ url: '/companies', method: 'GET' }),
      providesTags: ['Application'],
    }),

    addApplication: builder.mutation<JobApplication, Partial<JobApplication>>({
      query: (input) => ({
        url: '/apps',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Application', 'Stats'],
    }),

    updateApplication: builder.mutation<
      JobApplication,
      Partial<JobApplication> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: '/apps',
        method: 'PUT',
        body: { id, ...patch },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Application', id: arg.id },
        'Application',
        'Stats',
      ],
    }),

    deleteApplication: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: '/apps',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: ['Application', 'Stats'],
    }),

    // ---- real auth via /api/auth/* ----
    // Response body: { ok, user }. We return { token, user } so the client
    // auth flow stays the same. The real JWT is in the httpOnly cookie (Set-Cookie
    // header), invisible to JS; the token we return here is a placeholder for UI.
    login: builder.mutation<
      { token: string; user: { id: string; name: string; email: string } },
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { ok: boolean; user: { id: string; name: string; email: string } }) => ({
        token: `real.${response.user.email}.jwt`,
        user: response.user,
      }),
    }),

    register: builder.mutation<
      { token: string; user: { id: string; name: string; email: string } },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response: { ok: boolean; user: { id: string; name: string; email: string } }) => ({
        token: `real.${response.user.email}.jwt`,
        user: response.user,
      }),
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useGetDashboardStatsQuery,
  useGetAnalyticsQuery,
  useGetCalendarEventsQuery,
  useGetCompaniesQuery,
  useAddApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useLoginMutation,
  useRegisterMutation,
} = apiSlice;
