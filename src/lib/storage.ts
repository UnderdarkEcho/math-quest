import type { UserProfile } from '../types';

const KEY = 'mathfund.profile';
const VERSION_KEY = 'mathfund.schemaVersion';
const SCHEMA_VERSION = 1;

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed.name || !parsed.themeId) return null;
    if (!Array.isArray(parsed.courses)) parsed.courses = [];
    if (!Array.isArray(parsed.badges)) parsed.badges = [];
    if (typeof parsed.totalXp !== 'number') parsed.totalXp = 0;
    if (!parsed.tableProgress || typeof parsed.tableProgress !== 'object') {
      parsed.tableProgress = { facts: {}, masteredTables: [] };
    } else {
      if (!parsed.tableProgress.facts) parsed.tableProgress.facts = {};
      if (!Array.isArray(parsed.tableProgress.masteredTables)) {
        parsed.tableProgress.masteredTables = [];
      }
    }
    if (!parsed.snapProgress || typeof parsed.snapProgress !== 'object') {
      parsed.snapProgress = { facts: {}, masteredLanes: [], bestRoundMs: {} };
    } else {
      if (!parsed.snapProgress.facts) parsed.snapProgress.facts = {};
      if (!Array.isArray(parsed.snapProgress.masteredLanes)) {
        parsed.snapProgress.masteredLanes = [];
      }
      if (!parsed.snapProgress.bestRoundMs || typeof parsed.snapProgress.bestRoundMs !== 'object') {
        parsed.snapProgress.bestRoundMs = {};
      }
    }
    if (typeof parsed.showTutorials !== 'boolean') parsed.showTutorials = true;
    if (parsed.ageBand !== 'early' && parsed.ageBand !== 'upper' && parsed.ageBand !== 'middle' && parsed.ageBand !== 'high') {
      parsed.ageBand = 'upper';
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
  localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERSION_KEY);
}
