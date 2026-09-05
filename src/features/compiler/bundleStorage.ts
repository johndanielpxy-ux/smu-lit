import type { CompiledLawfloBundle } from "./bundleCompiler";

const STORAGE_KEY = "lawflo.published-bundle.v1";

export interface BundleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStorage(): BundleStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function looksLikeBundle(value: unknown): value is CompiledLawfloBundle {
  if (!value || typeof value !== "object") return false;
  const bundle = value as Partial<CompiledLawfloBundle>;
  return Boolean(
    bundle.manifest?.bundleId &&
      bundle.manifest.useCaseId &&
      bundle.manifest.sourceVersion &&
      bundle.manifest.approvalFingerprint &&
      bundle.useCase?.id === bundle.manifest.useCaseId &&
      bundle.episode?.id &&
      bundle.rehearsal?.scenario?.id,
  );
}

export function savePublishedBundle(
  bundle: CompiledLawfloBundle,
  storage: BundleStorage | undefined = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    // The published journey remains usable in-memory when persistence is blocked.
  }
}

export function loadPublishedBundle(
  storage: BundleStorage | undefined = browserStorage(),
): CompiledLawfloBundle | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!looksLikeBundle(parsed)) throw new Error("Invalid published bundle");
    return parsed;
  } catch {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // A corrupt value is ignored if restricted storage cannot be repaired.
    }
    return undefined;
  }
}

export function clearPublishedBundle(
  storage: BundleStorage | undefined = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Reset still succeeds for in-memory state.
  }
}
