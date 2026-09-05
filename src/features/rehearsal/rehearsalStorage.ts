import type { JourneyScope } from "../journey/journeyReducer";
import type { RehearsalState } from "./rehearsalReducer";

export interface RehearsalStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; }
interface Envelope { schemaVersion: 1; scope: JourneyScope; state: RehearsalState; }
const tasks = ["intake", "run_ai_review", "verify_findings", "compare_clauses", "apply_playbook", "choose_route", "inspect_audit", "complete"];
const storageKey = (bundleId: string) => `lawflo.rehearsal.${bundleId}.v1`;
function browserStorage(): RehearsalStorage | undefined { try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; } }
function sameScope(a: JourneyScope, b: JourneyScope): boolean { return a.bundleId === b.bundleId && a.sourceVersion === b.sourceVersion && a.contractVersion === b.contractVersion && a.approvalFingerprint === b.approvalFingerprint; }
function isState(value: unknown): value is RehearsalState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<RehearsalState>;
  return (state.mode === "guided" || state.mode === "solo") && typeof state.task === "string" && tasks.includes(state.task) && !!state.findingResolutions && typeof state.findingResolutions === "object" && Array.isArray(state.openedClauseIds) && Array.isArray(state.openedRuleIds) && Array.isArray(state.trace) && Number.isInteger(state.sequence) && Number.isInteger(state.attempts) && !!state.hintCounts && typeof state.hintCounts === "object";
}
export function saveRehearsal(scope: JourneyScope, state: RehearsalState, storage: RehearsalStorage | undefined = browserStorage()): void { if (!storage) return; try { storage.setItem(storageKey(scope.bundleId), JSON.stringify({ schemaVersion: 1, scope, state } satisfies Envelope)); } catch { /* Optional resume. */ } }
export function loadRehearsal(scope: JourneyScope, storage: RehearsalStorage | undefined = browserStorage()): RehearsalState | null { if (!storage) return null; try { const raw = storage.getItem(storageKey(scope.bundleId)); if (!raw) return null; const parsed = JSON.parse(raw) as Partial<Envelope>; if (parsed.schemaVersion !== 1 || !parsed.scope || !sameScope(parsed.scope, scope) || !isState(parsed.state)) return null; return structuredClone(parsed.state); } catch { return null; } }
export function clearRehearsal(bundleId: string, storage: RehearsalStorage | undefined = browserStorage()): void { if (!storage) return; try { storage.removeItem(storageKey(bundleId)); } catch { /* Optional reset. */ } }
