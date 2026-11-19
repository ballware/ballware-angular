import * as path from 'path';
import { FixtureLoader } from './loader';

export type StoreItem = Record<string, unknown>;

export class GenericStore {
  private items: Map<string, Array<StoreItem>> = new Map();
  private loaded: Set<string> = new Set();

  constructor(private readonly loader: FixtureLoader) {
  }

  private key(application: string, entity: string): string {
    return `${application}/${entity}`;
  }

  private loadBase(application: string, entity: string): Array<StoreItem> {
    const cacheKey = this.key(application, entity);

    if (this.loaded.has(cacheKey)) {
      return this.items.get(cacheKey) ?? [];
    }

    const parsed = this.loader.readJson(path.posix.join('data', application, `${entity}.json`));
    const items = Array.isArray(parsed) ? parsed as Array<StoreItem> : [];

    this.items.set(cacheKey, items);
    this.loaded.add(cacheKey);

    return items;
  }

  private keyColumn(application: string, entity: string, resolveKeyColumn?: (application: string, entity: string) => string|undefined): string {
    return resolveKeyColumn?.(application, entity) ?? 'Id';
  }

  all(
    application: string,
    entity: string,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): Array<StoreItem> {
    return [...this.loadBase(application, entity)];
  }

  count(
    application: string,
    entity: string,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): number {
    return this.all(application, entity, resolveKeyColumn).length;
  }

  byId(
    application: string,
    entity: string,
    id: string,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): StoreItem | undefined {
    const column = this.keyColumn(application, entity, resolveKeyColumn);

    return this.loadBase(application, entity).find((item) => (item[column] ?? item['Id'])?.toString() === id);
  }

  newItem(
    application: string,
    entity: string,
    defaults?: StoreItem,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): StoreItem {
    const column = this.keyColumn(application, entity, resolveKeyColumn);

    return {
      [column]: crypto.randomUUID(),
      ...defaults
    };
  }

  save(
    application: string,
    entity: string,
    item: StoreItem,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): StoreItem {
    const column = this.keyColumn(application, entity, resolveKeyColumn);
    const items = this.loadBase(application, entity);

    if (item[column] === undefined || item[column] === null || item[column] === '') {
      item[column] = crypto.randomUUID();
    }

    const id = item[column]?.toString();
    const existingIndex = items.findIndex((existing) => existing[column]?.toString() === id);

    if (existingIndex > -1) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    return item;
  }

  saveBatch(
    application: string,
    entity: string,
    items: Array<StoreItem>,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): Array<StoreItem> {
    return items.map((item) => this.save(application, entity, item, resolveKeyColumn));
  }

  remove(
    application: string,
    entity: string,
    id: string,
    resolveKeyColumn?: (application: string, entity: string) => string|undefined
  ): boolean {
    const column = this.keyColumn(application, entity, resolveKeyColumn);
    const items = this.loadBase(application, entity);
    const index = items.findIndex((item) => (item[column] ?? item['Id'])?.toString() === id);

    if (index < 0) {
      return false;
    }

    items.splice(index, 1);

    return true;
  }

  reset(): void {
    this.items = new Map();
    this.loaded = new Set();
  }
}
