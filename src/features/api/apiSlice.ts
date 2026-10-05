import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type {
  JobApplication,
  AnalyticsData,
  CalendarEvent,
  CompanySummary,
} from '@/types';
import { computeStats, summarizeCompanies } from '@/lib/aggregate';
import {
  localId,
  mergeLocalApplications,
  recordLocalAdd,
  recordLocalDelete,
  recordLocalUpdate,
} from '@/lib/localApps';

// ---- real backend via Next.js Route Handlers (src/app/api/...) ----
// Base URL is relative so it works in dev (localhost:3000) and production
// (same origin, no CORS needed). The httpOnly JWT cookie is sent automatically
// by the browser on every request to the same origin.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    // Any future auth header (e.g. a non-cookie token) goes here.
    return headers;
  },
});

// /api/apps returns { applications, companies } — unwrap the array.
const unwrapApps = (
  res: { applications?: JobApplication[] } | JobApplication[]
): JobApplication[] => (Array.isArray(res) ? res : res.applications ?? []);

// Shape RTK Query accepts back from the base query: exactly one of data/error.
type LocalWriteResult =
  | { data: unknown; error?: undefined }
  | { data?: undefined; error: FetchBaseQueryError };

/**
 * Replay a rejected write into this browser's localStorage overlay and answer
 * success. Only writes to /api/apps are handled; anything else falls through to
 * the original error.
 */
function applyLocalWrite(method: string, request: FetchArgs): LocalWriteResult | null {
  const body = typeof request.body === 'string'
    ? (JSON.parse(request.body) as unknown)
    : request.body;

  if (method === 'POST') {
    const input = (body ?? {}) as Partial<JobApplication>;
    if (!input.company || !input.position) {
      // Same contract the server enforces before it would touch the store.
      return { error: { status: 400, data: { error: 'company and position are required' } } };
    }
    const app: JobApplication = {
      ...input, // optional extras: salary, notes, appliedAt, interviewDate, ...
      id: localId(),
      company: String(input.company),
      position: String(input.position),
      status: input.status ?? 'saved',
      location: input.location ?? '',
      workMode: input.workMode ?? 'remote',
      createdAt: new Date().toISOString(),
    };
    recordLocalAdd(app);
    return { data: { ok: true, app } };
  }

  if (method === 'PUT') {
    const { id, ...patch } = (body ?? {}) as { id?: string } & Partial<JobApplication>;
    if (!id) return null;
    recordLocalUpdate(id, patch);
    // Nobody reads this record (invalidation refetches the merged list), but
    // keep the { ok, app } shape the endpoint promises.
    return { data: { ok: true, app: { ...patch, id } as JobApplication } };
  }

  if (method === 'DELETE') {
    const id = (request.params as Record<string, unknown> | undefined)?.id;
    if (typeof id !== 'string' || !id) return null;
    recordLocalDelete(id);
    return { data: { ok: true } };
  }

  return null;
}

// The demo deploy has a read-only filesystem, so /api/apps mutations answer 503
// ("changes are not persisted on the live deploy"). Instead of dropping the
// edit, hand it to localStorage and let the queries below merge it back into
// every read — that is what makes adding an application actually work on the
// live demo. A writable backend never returns 503, so this path stays idle.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 503) return result;

  const request: FetchArgs = typeof args === 'string' ? { url: args } : args;
  const method = (request.method ?? 'GET').toUpperCase();
  if (!request.url.startsWith('/apps')) return result;
  if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE') return result;

  return applyLocalWrite(method, request) ?? result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Application', 'Stats'],
  endpoints: (builder) => ({
    getApplications: builder.query<JobApplication[], void>({
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Application'],
      transformResponse: (res: { applications?: JobApplication[] } | JobApplication[]) =>
        mergeLocalApplications(unwrapApps(res)),
    }),

    getApplication: builder.query<JobApplication, string>({
      query: (id) => ({ url: `/apps/${id}`, method: 'GET' }),
      providesTags: (_res, _err, id) => [{ type: 'Application', id }],
    }),

    getDashboardStats: builder.query<{ total: number; interviews: number; offers: number; rejected: number; thisMonth: number; upcoming: number }, void>({
      // Aggregates are derived from /api/apps + the local overlay rather than
      // read from /api/stats: the demo store can't count edits it never stored.
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Stats'],
      transformResponse: (
        res: { applications?: JobApplication[] } | JobApplication[]
      ): { total: number; interviews: number; offers: number; rejected: number; thisMonth: number; upcoming: number } => {
        const response = computeStats(mergeLocalApplications(unwrapApps(res)));
        return {
          total: response.total,
          interviews: response.statusCounts['interview'] ?? 0,
          offers: response.statusCounts['offer'] ?? 0,
          rejected: response.statusCounts['rejected'] ?? 0,
          thisMonth: response.thisMonth ?? 0,
          upcoming: response.statusCounts['interview'] ?? 0,
        };
      },
    }),

    getAnalytics: builder.query<AnalyticsData, void>({
      // Same source as getDashboardStats — see the note there.
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Stats'],
      transformResponse: (
        res: { applications?: JobApplication[] } | JobApplication[]
      ): AnalyticsData => {
        const response = computeStats(mergeLocalApplications(unwrapApps(res)));
        const statuses: JobApplication['status'][] = [
          'saved', 'applied', 'screening', 'interview', 'offer', 'rejected',
        ];
        const byStatus = statuses.map((status) => ({
          status,
          count: response.statusCounts[status] ?? 0,
        }));

        // Applications per month from trend dates (skip undated records —
        // an 'unknown' bucket is meaningless on a time axis).
        const monthMap = new Map<string, number>();
        for (const t of response.trend ?? []) {
          const m = t.date.slice(0, 7);
          if (!m || m === 'unknown') continue;
          monthMap.set(m, (monthMap.get(m) ?? 0) + t.count);
        }
        const byMonth = [...monthMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));

        // Real per-status-per-month trend from the server (stacked bar).
        const trend = (response.statusTrend ?? []).map((t) => ({
          month: t.month,
          applied: t.applied,
          interview: t.interview,
          offer: t.offer,
          rejected: t.rejected,
        }));

        return { byStatus, byMonth, trend };
      },
    }),

    getCalendarEvents: builder.query<CalendarEvent[], void>({
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Application'],
      transformResponse: (
        res: { applications?: JobApplication[] } | JobApplication[]
      ): CalendarEvent[] => {
        const apps = mergeLocalApplications(unwrapApps(res));
        return apps
          .filter((a) => a.interviewDate)
          .map((a) => ({
            id: `evt-${a.id}`,
            applicationId: a.id,
            company: a.company,
            position: a.position,
            status: a.status,
            date: a.interviewDate as string,
          }));
      },
    }),

    getCompanies: builder.query<CompanySummary[], void>({
      // Aggregated client-side from /api/apps + the local overlay — a company
      // the visitor just added exists nowhere else on a read-only demo deploy.
      query: () => ({ url: '/apps', method: 'GET' }),
      providesTags: ['Application'],
      transformResponse: (res: { applications?: JobApplication[] } | JobApplication[]) =>
        summarizeCompanies(mergeLocalApplications(unwrapApps(res))),
    }),

    addApplication: builder.mutation<JobApplication, Partial<JobApplication>>({
      query: (input) => ({
        url: '/apps',
        method: 'POST',
        body: input,
      }),
      // POST /api/apps returns { ok, app } — unwrap the record.
      transformResponse: (res: { ok: boolean; app: JobApplication } | JobApplication) =>
        'app' in res ? res.app : res,
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
      // PUT /api/apps returns { ok, app } — unwrap the record.
      transformResponse: (res: { ok: boolean; app: JobApplication } | JobApplication) =>
        'app' in res ? res.app : res,
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
