import * as path from 'path';
import * as JSON5 from 'json5';
import { FixtureLoader, unwrapExport } from './loader';

export type OverlayKind = 'entity' | 'page' | 'tenant';

export const OVERLAY_KINDS: Array<OverlayKind> = ['entity', 'page', 'tenant'];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const isNumericKey = (key: string): boolean => {
  return /^\d+$/.test(key);
};

export const deepMerge = (base: unknown, overlay: unknown): unknown => {
  if (overlay === undefined) {
    return base;
  }

  if (Array.isArray(overlay)) {
    if (!Array.isArray(base)) {
      return overlay;
    }

    const merged = base.map((value, index) => deepMerge(value, overlay[index]));

    for (let index = base.length; index < overlay.length; index++) {
      merged.push(overlay[index]);
    }

    return merged;
  }

  if (Array.isArray(base) && isRecord(overlay)) {
    const merged: Array<unknown> = [...base];

    for (const [key, value] of Object.entries(overlay)) {
      if (isNumericKey(key)) {
        merged[Number(key)] = deepMerge(merged[Number(key)], value);
      } else {
        (merged as unknown as Record<string, unknown>)[key] = value;
      }
    }

    return merged;
  }

  if (isRecord(overlay) && isRecord(base)) {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(overlay)) {
      merged[key] = key in base ? deepMerge(base[key], value) : value;
    }

    return merged;
  }

  return overlay;
};

const JSON5_STRING_FIELDS = new Set([
  'GridLayout',
  'EditLayout',
  'Lookups',
  'Picklists',
  'Templates',
  'CustomScripts',
  'CustomFunctions',
  'Navigation',
  'Rights'
]);

const mergeStringField = (baseValue: string, overlayValue: unknown): string => {
  if (typeof overlayValue === 'string') {
    return overlayValue;
  }

  const trimmed = baseValue.trim();

  const baseParsed = trimmed.length === 0
    ? (Array.isArray(overlayValue) ? [] : {})
    : JSON5.parse(baseValue);

  return JSON5.stringify(deepMerge(baseParsed, overlayValue));
};

export const applyOverlayToExport = (
  base: Record<string, unknown>,
  overlay: Record<string, unknown>
): Record<string, unknown> => {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, overlayValue] of Object.entries(overlay)) {
    const baseValue = merged[key];

    if (typeof baseValue === 'string' && JSON5_STRING_FIELDS.has(key)) {
      merged[key] = mergeStringField(baseValue, overlayValue);
      continue;
    }

    merged[key] = deepMerge(baseValue, overlayValue);
  }

  return merged;
};

export class OverlayStore {
  private overlays: Map<OverlayKind, Map<string, Record<string, unknown>>> = new Map();
  private revision = 0;

  constructor(private readonly loader: FixtureLoader) {
    this.loadPersisted();
  }

  private loadPersisted(): void {
    this.overlays = new Map(OVERLAY_KINDS.map((kind) => [kind, new Map()]));

    for (const kind of OVERLAY_KINDS) {
      for (const name of this.loader.listNames(path.posix.join('designer/overlay', kind), ['.json5', '.json'])) {
        const parsed = this.loader.readJson(path.posix.join('designer/overlay', kind, `${name}.json5`))
          ?? this.loader.readJson(path.posix.join('designer/overlay', kind, `${name}.json`));

        if (isRecord(parsed)) {
          this.overlays.get(kind)?.set(name, parsed);
        }
      }
    }
  }

  getOverlay(kind: OverlayKind, id: string): Record<string, unknown> | undefined {
    return this.overlays.get(kind)?.get(id);
  }

  setOverlay(kind: OverlayKind, id: string, overlay: Record<string, unknown>): void {
    if (id.includes('/') || id.includes('\\') || id.includes('..')) {
      throw new Error(`Invalid overlay identifier: ${id}`);
    }

    if (!this.overlays.has(kind)) {
      throw new Error(`Unknown overlay kind: ${kind}`);
    }

    this.overlays.get(kind)?.set(id, overlay);
    this.revision++;
  }

  removeOverlay(kind: OverlayKind, id: string): boolean {
    const removed = this.overlays.get(kind)?.delete(id) ?? false;

    if (removed) {
      this.revision++;
    }

    return removed;
  }

  listOverlays(): Array<{ kind: OverlayKind, id: string }> {
    const result: Array<{ kind: OverlayKind, id: string }> = [];

    for (const kind of OVERLAY_KINDS) {
      for (const id of this.overlays.get(kind)?.keys() ?? []) {
        result.push({ kind, id });
      }
    }

    return result;
  }

  applyToExport(
    kind: OverlayKind,
    id: string,
    baseExport: Record<string, unknown> | undefined
  ): Record<string, unknown> | undefined {
    const overlay = this.getOverlay(kind, id);

    if (!baseExport) {
      return undefined;
    }

    return overlay ? applyOverlayToExport(baseExport, overlay) : baseExport;
  }

  /**
   * Discard in-memory changes and reload disk persisted overlays
   */
  reset(): void {
    this.loadPersisted();
    this.revision++;
  }

  getRevision(): number {
    return this.revision;
  }
}

export const unwrapAndApplyOverlay = (
  store: OverlayStore,
  kind: OverlayKind,
  id: string,
  parsedExport: unknown
): Record<string, unknown> | undefined => {
  const base = unwrapExport(parsedExport);

  return store.applyToExport(kind, id, base);
};
