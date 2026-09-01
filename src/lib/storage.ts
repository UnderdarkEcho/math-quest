import { getCourse } from '../data/catalog';
import type {
  BackupFile,
  CourseProgress,
  Grade,
  Operation,
  ProfileRoster,
  SnapProgress,
  StorageStatus,
  TableProgress,
  ThemeId,
  UserProfile,
} from '../types';

export const MAX_PROFILES = 12;

const LS_V1 = 'mathquest.profile';
const LS_ROSTER = 'mathquest.roster';
const LS_VERSION = 'mathquest.schemaVersion';
const IDB_NAME = 'mathquest';
const IDB_STORE = 'roster';
const IDB_KEY = 'main';
const IDB_PROBE_KEY = 'probe';
const SCHEMA_VERSION = 2 as const;

const THEME_IDS: ThemeId[] = ['default', 'minecraft', 'dnd', 'greek', 'small-business'];

let memoryRoster: ProfileRoster | null = null;
let probedStatus: StorageStatus | null = null;
let writing = false;
let queuedRoster: ProfileRoster | null = null;
const queuedResolvers: Array<(r: PersistResult) => void> = [];
let writeGen = 0;

type PersistResult = { ok: boolean; status: StorageStatus };

function snapshotRoster(roster: ProfileRoster): ProfileRoster {
  return {
    schemaVersion: SCHEMA_VERSION,
    activeId: roster.activeId,
    profiles: roster.profiles.slice(0, MAX_PROFILES),
  };
}

function rosterMatches(written: ProfileRoster, back: ProfileRoster | null): boolean {
  if (!back) return false;
  if (back.activeId !== written.activeId) return false;
  if (back.profiles.length !== written.profiles.length) return false;
  if (written.profiles.map((p) => p.id).join('\0') !== back.profiles.map((p) => p.id).join('\0')) {
    return false;
  }
  if (!written.activeId) return true;
  const wActive = written.profiles.find((p) => p.id === written.activeId);
  const bActive = back.profiles.find((p) => p.id === back.activeId);
  if (!wActive || !bActive) return false;
  return wActive.updatedAt === bActive.updatedAt && wActive.totalXp === bActive.totalXp;
}

function statusAfterWrite(idbOk: boolean, lsOk: boolean): PersistResult {
  if (!idbOk && !lsOk) return { ok: false, status: 'unavailable' };
  if (probedStatus === 'ephemeral') return { ok: true, status: 'ephemeral' };
  if (probedStatus === 'unavailable') return { ok: true, status: 'unavailable' };
  return { ok: true, status: 'ok' };
}

export function emptyRoster(): ProfileRoster {
  return { schemaVersion: SCHEMA_VERSION, activeId: null, profiles: [] };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function newId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function sanitizeTheme(v: unknown): ThemeId {
  return THEME_IDS.includes(v as ThemeId) ? (v as ThemeId) : 'default';
}

function sanitizeTableProgress(v: unknown): TableProgress {
  if (!isRecord(v)) return { facts: {}, masteredTables: [] };
  const facts = isRecord(v.facts) ? (v.facts as TableProgress['facts']) : {};
  const masteredTables = Array.isArray(v.masteredTables)
    ? v.masteredTables.filter((n): n is number => typeof n === 'number')
    : [];
  return { facts, masteredTables };
}

function sanitizeSnapProgress(v: unknown): SnapProgress {
  if (!isRecord(v)) return { facts: {}, masteredLanes: [], bestRoundMs: {} };
  const facts = isRecord(v.facts) ? (v.facts as SnapProgress['facts']) : {};
  const masteredLanes = Array.isArray(v.masteredLanes)
    ? v.masteredLanes.filter((s): s is string => typeof s === 'string')
    : [];
  const bestRoundMs = isRecord(v.bestRoundMs)
    ? (v.bestRoundMs as SnapProgress['bestRoundMs'])
    : {};
  return { facts, masteredLanes, bestRoundMs };
}

function sanitizeCourses(v: unknown): CourseProgress[] {
  if (!Array.isArray(v)) return [];
  const out: CourseProgress[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    const courseId = asString(item.courseId);
    const meta = getCourse(courseId);
    if (!meta || typeof item.grade !== 'number' || typeof item.operation !== 'string') continue;
    out.push({
      courseId,
      grade: item.grade as Grade,
      operation: item.operation as Operation,
      status: item.status === 'completed' ? 'completed' : 'in_progress',
      completedLessons: Array.isArray(item.completedLessons)
        ? item.completedLessons.filter((n): n is number => typeof n === 'number')
        : [],
      currentLesson: asNumber(item.currentLesson, 0),
      startedAt: asString(item.startedAt, nowIso()),
      completedAt: typeof item.completedAt === 'string' ? item.completedAt : undefined,
    });
  }
  return out;
}

export function normalizeProfile(raw: unknown): UserProfile | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name).trim();
  if (!name) return null;
  const createdAt = asString(raw.createdAt, nowIso());
  return {
    id: asString(raw.id) || newId(),
    name: name.slice(0, 24),
    themeId: sanitizeTheme(raw.themeId),
    createdAt,
    updatedAt: asString(raw.updatedAt, createdAt),
    totalXp: asNumber(raw.totalXp, 0),
    badges: Array.isArray(raw.badges) ? raw.badges.filter((b): b is string => typeof b === 'string') : [],
    courses: sanitizeCourses(raw.courses),
    tableProgress: sanitizeTableProgress(raw.tableProgress),
    snapProgress: sanitizeSnapProgress(raw.snapProgress),
    showTutorials: typeof raw.showTutorials === 'boolean' ? raw.showTutorials : true,
  };
}

export function normalizeRoster(raw: unknown): ProfileRoster | null {
  if (!isRecord(raw)) return null;
  if (!Array.isArray(raw.profiles)) return null;
  const profiles = raw.profiles
    .map((p) => normalizeProfile(p))
    .filter((p): p is UserProfile => p !== null)
    .slice(0, MAX_PROFILES);
  let activeId = typeof raw.activeId === 'string' ? raw.activeId : null;
  if (activeId && !profiles.some((p) => p.id === activeId)) activeId = profiles[0]?.id ?? null;
  if (!activeId && profiles.length > 0) activeId = profiles[0].id;
  return { schemaVersion: SCHEMA_VERSION, activeId, profiles };
}

function wrapV1Profile(raw: unknown): ProfileRoster | null {
  const profile = normalizeProfile(raw);
  if (!profile) return null;
  return { schemaVersion: SCHEMA_VERSION, activeId: profile.id, profiles: [profile] };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('no indexedDB'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('idb open failed'));
  });
}

function idbGet(key: string = IDB_KEY): Promise<unknown> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(key);
        req.onsuccess = () => {
          db.close();
          resolve(req.result);
        };
        req.onerror = () => {
          db.close();
          reject(req.error ?? new Error('idb get failed'));
        };
      }),
  );
}

function idbPut(value: unknown, key: string = IDB_KEY): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(value, key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error('idb put failed'));
        };
      }),
  );
}

function idbDelete(key: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error('idb clear failed'));
        };
      }),
  );
}

function probeLocalStorage(): boolean {
  try {
    const k = 'mathquest.probe';
    localStorage.setItem(k, '1');
    const ok = localStorage.getItem(k) === '1';
    localStorage.removeItem(k);
    return ok;
  } catch {
    return false;
  }
}

async function probeIdb(): Promise<boolean> {
  try {
    await idbPut({ ok: true }, IDB_PROBE_KEY);
    const back = await idbGet(IDB_PROBE_KEY);
    await idbDelete(IDB_PROBE_KEY);
    return isRecord(back) && back.ok === true;
  } catch {
    return false;
  }
}

function likelyPrivateBrowsing(): boolean {
  try {
    // Safari Private often reports 0 quota on an empty localStorage write of a larger value.
    const k = 'mathquest.probe2';
    const payload = 'x'.repeat(1024);
    localStorage.setItem(k, payload);
    const ok = localStorage.getItem(k) === payload;
    localStorage.removeItem(k);
    if (!ok) return true;
  } catch {
    return true;
  }
  return false;
}

export async function probeStorage(): Promise<StorageStatus> {
  const ls = probeLocalStorage();
  const idb = await probeIdb();
  let status: StorageStatus = 'ok';
  if (!ls && !idb) status = 'unavailable';
  else if (likelyPrivateBrowsing()) status = 'ephemeral';
  probedStatus = status;
  return status;
}

function readLsRoster(): ProfileRoster | null {
  try {
    const raw = localStorage.getItem(LS_ROSTER);
    if (!raw) return null;
    return normalizeRoster(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function readLsV1(): ProfileRoster | null {
  try {
    const raw = localStorage.getItem(LS_V1);
    if (!raw) return null;
    return wrapV1Profile(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function writeLsRoster(roster: ProfileRoster): boolean {
  try {
    localStorage.setItem(LS_ROSTER, JSON.stringify(roster));
    localStorage.setItem(LS_VERSION, String(SCHEMA_VERSION));
    const raw = localStorage.getItem(LS_ROSTER);
    if (!raw) return false;
    return rosterMatches(roster, normalizeRoster(JSON.parse(raw) as unknown));
  } catch {
    return false;
  }
}

export async function loadRoster(): Promise<ProfileRoster> {
  try {
    const fromIdb = normalizeRoster(await idbGet());
    if (fromIdb) {
      memoryRoster = fromIdb;
      return fromIdb;
    }
  } catch {
    // fall through
  }

  const fromLs = readLsRoster();
  if (fromLs) {
    memoryRoster = fromLs;
    try {
      await idbPut(fromLs);
    } catch {
      // LS is enough to boot
    }
    return fromLs;
  }

  const fromV1 = readLsV1();
  if (fromV1) {
    memoryRoster = fromV1;
    try {
      await idbPut(fromV1);
    } catch {
      // keep going
    }
    writeLsRoster(fromV1);
    return fromV1;
  }

  if (memoryRoster) return memoryRoster;

  const empty = emptyRoster();
  memoryRoster = empty;
  return empty;
}

async function writeNow(roster: ProfileRoster): Promise<PersistResult> {
  const next = snapshotRoster(roster);
  memoryRoster = next;
  const gen = writeGen;

  let idbOk = false;
  try {
    await idbPut(next);
    if (gen !== writeGen) return statusAfterWrite(false, false);
    const back = normalizeRoster(await idbGet());
    idbOk = rosterMatches(next, back);
  } catch {
    idbOk = false;
  }

  if (gen !== writeGen) return statusAfterWrite(idbOk, false);

  const lsOk = writeLsRoster(next);
  return statusAfterWrite(idbOk, lsOk);
}

async function drainWrites(): Promise<void> {
  if (writing) return;
  writing = true;
  try {
    while (queuedRoster) {
      const payload = queuedRoster;
      queuedRoster = null;
      const waiting = queuedResolvers.splice(0);
      const result = await writeNow(payload);
      for (const resolve of waiting) resolve(result);
    }
  } finally {
    writing = false;
    if (queuedRoster) void drainWrites();
  }
}

export function saveRoster(roster: ProfileRoster): Promise<PersistResult> {
  const next = snapshotRoster(roster);
  memoryRoster = next;
  queuedRoster = next;
  return new Promise((resolve) => {
    queuedResolvers.push(resolve);
    void drainWrites();
  });
}

export async function clearAll(): Promise<void> {
  writeGen += 1;
  queuedRoster = null;
  memoryRoster = emptyRoster();
  const leftover = queuedResolvers.splice(0);
  const cleared: PersistResult = { ok: true, status: probedStatus ?? 'ok' };
  for (const resolve of leftover) resolve(cleared);
  while (writing) {
    await new Promise((r) => setTimeout(r, 0));
  }
  try {
    await idbDelete(IDB_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(LS_ROSTER);
    localStorage.removeItem(LS_V1);
    localStorage.removeItem(LS_VERSION);
  } catch {
    // ignore
  }
}

export function exportBackup(roster: ProfileRoster): BackupFile {
  return {
    app: 'math-quest',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    roster: {
      schemaVersion: SCHEMA_VERSION,
      activeId: roster.activeId,
      profiles: roster.profiles,
    },
  };
}

export function parseBackup(raw: string): ProfileRoster {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isRecord(data)) throw new Error('This is not a Math Quest backup.');

  if (data.app === 'math-quest' && data.schemaVersion === 2) {
    const roster = normalizeRoster(data.roster);
    if (!roster || roster.profiles.length === 0) {
      throw new Error('This backup has no children in it.');
    }
    return roster;
  }

  if (data.app === 'math-quest' && data.schemaVersion === 1) {
    const wrapped = wrapV1Profile(data.profile ?? data);
    if (!wrapped) throw new Error('This backup has no children in it.');
    return wrapped;
  }

  if (isRecord(data.roster)) {
    const roster = normalizeRoster(data.roster);
    if (roster && roster.profiles.length > 0) return roster;
  }

  if (isRecord(data.profile)) {
    const wrapped = wrapV1Profile(data.profile);
    if (wrapped) return wrapped;
  }

  const lone = wrapV1Profile(data);
  if (lone) return lone;

  throw new Error('This is not a Math Quest backup.');
}

export function mergeRosters(local: ProfileRoster, incoming: ProfileRoster): ProfileRoster {
  const merged = new Map<string, UserProfile>();
  const nameKey = (p: UserProfile) => `${p.name}\0${p.createdAt}`;
  const byNameCreated = new Map<string, string>();

  for (const p of local.profiles) {
    merged.set(p.id, p);
    byNameCreated.set(nameKey(p), p.id);
  }

  for (const p of incoming.profiles) {
    const existingById = merged.get(p.id);
    if (existingById) {
      const keep =
        Date.parse(p.updatedAt) > Date.parse(existingById.updatedAt) ? p : existingById;
      merged.set(p.id, keep);
      continue;
    }
    const alias = byNameCreated.get(nameKey(p));
    if (alias) {
      const existing = merged.get(alias);
      if (existing && Date.parse(p.updatedAt) > Date.parse(existing.updatedAt)) {
        merged.set(alias, { ...p, id: alias });
      }
      continue;
    }
    if (merged.size >= MAX_PROFILES) continue;
    merged.set(p.id, p);
    byNameCreated.set(nameKey(p), p.id);
  }

  const profiles = [...merged.values()];
  let activeId = local.activeId;
  if (activeId && !profiles.some((p) => p.id === activeId)) activeId = profiles[0]?.id ?? null;
  return { schemaVersion: SCHEMA_VERSION, activeId, profiles };
}

export function upsertProfile(roster: ProfileRoster, profile: UserProfile): ProfileRoster {
  const stamped = { ...profile, updatedAt: nowIso() };
  const idx = roster.profiles.findIndex((p) => p.id === stamped.id);
  const profiles =
    idx >= 0
      ? roster.profiles.map((p, i) => (i === idx ? stamped : p))
      : [...roster.profiles, stamped].slice(0, MAX_PROFILES);
  return { schemaVersion: SCHEMA_VERSION, activeId: stamped.id, profiles };
}

