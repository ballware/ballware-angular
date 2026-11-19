import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'node:url';
import { FixtureLoader } from './loader';
import { OverlayStore } from './overlay';
import { GenericStore } from './store';
import { loadConfig, FixtureMiddlewareConfig } from './config';

export interface SimulationHandler {
  all?: () => unknown | Promise<unknown>;
  query?: (identifier: string, params: Record<string, unknown>) => unknown | Promise<unknown>;
  count?: (identifier: string, params: Record<string, unknown>) => unknown | Promise<unknown>;
  byId?: (id: string) => unknown | Promise<unknown>;
  new?: (params: Record<string, unknown>) => unknown | Promise<unknown>;
  save?: (item: Record<string, unknown>) => unknown | Promise<unknown>;
  saveBatch?: (items: Array<Record<string, unknown>>) => unknown | Promise<unknown>;
  remove?: (id: string) => unknown | Promise<unknown>;
}

const loadModule = async (resolvedPath: string): Promise<Record<string, unknown>> => {
  try {
    return await import(pathToFileURL(resolvedPath).href);
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(resolvedPath) as Record<string, unknown>;
  }
};

export class HandlerRegistry {
  private handlers: Map<string, SimulationHandler> = new Map();
  private loadedFiles: Map<string, number> = new Map();

  constructor(private readonly loader: FixtureLoader) {
  }

  register(application: string, entity: string, handler: SimulationHandler): void {
    this.handlers.set(`${application}/${entity}`, handler);
  }

  async get(application: string, entity: string): Promise<SimulationHandler | undefined> {
    const key = `${application}/${entity}`;

    const resolved = this.loader.resolve(path.posix.join('simulation', application, `${entity}.mjs`))
      ?? this.loader.resolve(path.posix.join('simulation', application, `${entity}.js`));

    if (!resolved) {
      return this.handlers.get(key);
    }

    const mtimeMs = fs.statSync(resolved).mtimeMs;
    const cachedMtime = this.loadedFiles.get(key);

    if (cachedMtime !== mtimeMs) {
      const module = await loadModule(resolved);
      const exported = module['default'] ?? module;

      if (exported && typeof exported === 'object') {
        this.handlers.set(key, exported as SimulationHandler);
        this.loadedFiles.set(key, mtimeMs);
      }
    }

    return this.handlers.get(key);
  }

  reset(): void {
    this.handlers = new Map();
    this.loadedFiles = new Map();
  }
}

export class FixtureMiddlewareContext {
  readonly loader: FixtureLoader;
  readonly overlayStore: OverlayStore;
  readonly store: GenericStore;
  readonly handlers: HandlerRegistry;

  private exports: Map<string, Record<string, unknown> | undefined> = new Map();
  private resetCount = 0;

  constructor(public readonly config: FixtureMiddlewareConfig) {
    this.loader = new FixtureLoader(config.roots);
    this.overlayStore = new OverlayStore(this.loader);
    this.store = new GenericStore(this.loader);
    this.handlers = new HandlerRegistry(this.loader);
  }

  private loadExport(directory: string, id: string): Record<string, unknown> | undefined {
    const parsed = this.loader.readJson(path.posix.join(directory, `${id}.json`))
      ?? this.loader.readJson(path.posix.join(directory, `${id}.json5`));

    if (parsed === undefined) {
      return undefined;
    }

    const value = Array.isArray(parsed) ? (parsed.length > 0 ? parsed[0] as Record<string, unknown> : undefined) : parsed as Record<string, unknown>;

    return value;
  }

  private resolveIdentifier(directory: string, identifier: string): string {
    if (this.loader.exists(path.posix.join(directory, `${identifier}.json`))
      || this.loader.exists(path.posix.join(directory, `${identifier}.json5`))) {
      return identifier;
    }

    for (const name of this.loader.listNames(directory)) {
      const value = this.loadExport(directory, name);

      if (value && value['Id']?.toString() === identifier) {
        return name;
      }
    }

    return identifier;
  }

  private withOverlay(directory: string, kind: 'entity' | 'page' | 'tenant', id: string): Record<string, unknown> | undefined {
    const cacheKey = `${kind}/${id}`;
    const persisted = this.overlayStore.getOverlay(kind, id);

    if (this.exports.has(cacheKey) && !persisted) {
      return this.exports.get(cacheKey);
    }

    const base = this.loadExport(directory, id);
    const overlayed = this.overlayStore.applyToExport(kind, id, base);

    if (!persisted) {
      this.exports.set(cacheKey, overlayed);
    }

    return overlayed;
  }

  getEntityExport(entity: string): Record<string, unknown> | undefined {
    return this.withOverlay('entity', 'entity', entity);
  }

  getPageExport(page: string): Record<string, unknown> | undefined {
    return this.withOverlay('page', 'page', page);
  }

  getTenantExport(tenant: string): Record<string, unknown> | undefined {
    return this.withOverlay('tenant', 'tenant', this.resolveIdentifier('tenant', tenant));
  }

  getIdentities(): Array<Record<string, unknown>> {
    return this.loader.listNames('identity')
      .map((name) => this.loadExport('identity', name))
      .filter((value): value is Record<string, unknown> => value !== undefined);
  }

  getIdentity(name: string): Record<string, unknown> | undefined {
    return this.loadExport('identity', this.resolveIdentifier('identity', name));
  }

  getTenants(): Array<{ Id: string, Name: string }> {
    return this.loader.listNames('tenant')
      .map((name) => {
        const tenant = this.loadExport('tenant', name);

        return tenant ? { Id: (tenant['Id'] ?? name).toString(), Name: (tenant['Name'] ?? name).toString() } : undefined;
      })
      .filter((value): value is { Id: string, Name: string } => value !== undefined);
  }

  resolveKeyColumn = (application: string, entity: string): string | undefined => {
    const exportData = this.getEntityExport(entity);

    const keyColumn = exportData?.['KeyColumn'];

    return typeof keyColumn === 'string' && keyColumn.length > 0 ? keyColumn : undefined;
  };

  getRevision(): string {
    return `${this.overlayStore.getRevision()}.${this.resetCount}`;
  }

  markChanged(): void {
    this.exports = new Map();
  }

  reset(): void {
    this.exports = new Map();
    this.overlayStore.reset();
    this.store.reset();
    this.handlers.reset();
    this.loader.invalidate();
    this.resetCount++;
  }
}

export const createContext = (config?: FixtureMiddlewareConfig): FixtureMiddlewareContext => {
  return new FixtureMiddlewareContext(config ?? loadConfig());
};
