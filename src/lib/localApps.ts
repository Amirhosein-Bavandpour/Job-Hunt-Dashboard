import type { JobApplication } from '@/types';

// Browser-local overlay for the demo deploy.
//
// The live (Netlify) demo has no writable backend — POST/PUT/DELETE /api/apps
// answer 503 "changes are not persisted" — so a visitor's edits used to vanish
// the moment the dialog closed. apiSlice's base query replays those writes here
// instead, and every read runs the result back through
// `mergeLocalApplications()`: adds, edits and deletes survive reloads, per
// browser, with no database behind them.
//
// On a writable backend (local dev, a real API) nothing is ever written here and
// the merge is a pass-through.

const STORAGE_KEY = 'jhd_local_apps_v1';

export interface LocalApps {
  /** Records the server never received (created while it was read-only). */
  added: JobApplication[];
  /** Field patches for records, local or server-owned. */
  updated: Record<string, Partial<JobApplication>>;
  /** Server records the visitor removed. */
  deleted: string[];
}

const empty = (): LocalApps => ({ added: [], updated: {}, deleted: [] });

// Last-known value, so edits still hold for the session when localStorage itself
// is unusable (private browsing, quota exceeded, SSR).
let memory: LocalApps | null = null;

export function readLocalApps(): LocalApps {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalApps>;
        // Reading into `memory` keeps this tab in sync with edits made in
        // another tab of the same origin.
        memory = {
          added: Array.isArray(parsed.added) ? parsed.added : [],
          updated:
            parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
          deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
        };
        return memory;
      }
    } catch {
      // Corrupt/unreadable storage — fall back to the in-memory copy.
    }
  }
  return memory ?? empty();
}

function writeLocalApps(next: LocalApps): void {
  memory = next;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked — `memory` keeps the edits alive for this session.
  }
}

/** Stable id that can only come from this module, never from the server. */
export const localId = (): string =>
  `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Server list + this browser's overlay. Patches are applied to server records
 * *and* to local ones, deletes hide records from either side, and local adds
 * are appended (deduped by id).
 */
export function mergeLocalApplications(serverApps: JobApplication[]): JobApplication[] {
  const local = readLocalApps();
  if (
    !local.added.length &&
    !local.deleted.length &&
    !Object.keys(local.updated).length
  ) {
    return serverApps;
  }

  const deleted = new Set(local.deleted);
  const seen = new Set<string>();
  const merged: JobApplication[] = [];
  for (const app of [...serverApps, ...local.added]) {
    if (deleted.has(app.id) || seen.has(app.id)) continue;
    seen.add(app.id);
    const patch = local.updated[app.id];
    merged.push(patch ? { ...app, ...patch, id: app.id } : app);
  }
  return merged;
}

export function recordLocalAdd(app: JobApplication): void {
  const local = readLocalApps();
  local.added.push(app);
  writeLocalApps(local);
}

export function recordLocalUpdate(id: string, patch: Partial<JobApplication>): void {
  // Mirror the server's PUT: fields sent as null/undefined keep their old value,
  // and the identity is never patchable.
  const clean = Object.fromEntries(
    Object.entries(patch).filter(
      ([key, value]) => key !== 'id' && value !== undefined && value !== null
    )
  ) as Partial<JobApplication>;
  if (!Object.keys(clean).length) return;

  const local = readLocalApps();
  local.updated[id] = { ...(local.updated[id] ?? {}), ...clean };
  writeLocalApps(local);
}

export function recordLocalDelete(id: string): void {
  const local = readLocalApps();
  local.added = local.added.filter((a) => a.id !== id);
  delete local.updated[id];
  if (!local.deleted.includes(id)) local.deleted.push(id);
  writeLocalApps(local);
}

/** True when this browser holds any edit the server never saw. */
export function hasLocalApps(): boolean {
  const local = readLocalApps();
  return (
    local.added.length > 0 ||
    local.deleted.length > 0 ||
    Object.keys(local.updated).length > 0
  );
}

/** Drop the overlay (the demo banner's "Reset" action). */
export function clearLocalApps(): void {
  writeLocalApps(empty());
}
