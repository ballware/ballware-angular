import * as fs from 'fs';
import * as path from 'path';
import * as JSON5 from 'json5';

export class PathSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathSecurityError';
  }
}

interface CachedFile {
  mtimeMs: number;
  content: string;
}

export class FixtureLoader {
  private readonly roots: string[];
  private cache: Map<string, CachedFile> = new Map();

  constructor(roots: string[]) {
    this.roots = roots.map((root) => path.resolve(root));
  }

  private guard(relativePath: string, root: string, candidate: string): void {
    if (path.isAbsolute(relativePath)) {
      throw new PathSecurityError(`Absolute fixture path not allowed: ${relativePath}`);
    }

    const normalized = path.normalize(relativePath);

    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      throw new PathSecurityError(`Fixture path escapes root: ${relativePath}`);
    }

    if (candidate !== root && !candidate.startsWith(root + path.sep)) {
      throw new PathSecurityError(`Fixture path escapes root: ${relativePath}`);
    }
  }

  resolve(relativePath: string): string | undefined {
    for (const root of this.roots) {
      const candidate = path.resolve(path.join(root, path.normalize(relativePath)));

      this.guard(relativePath, root, candidate);

      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }

    return undefined;
  }

  exists(relativePath: string): boolean {
    return this.resolve(relativePath) !== undefined;
  }

  readFile(relativePath: string): string | undefined {
    const resolved = this.resolve(relativePath);

    if (!resolved) {
      return undefined;
    }

    const mtimeMs = fs.statSync(resolved).mtimeMs;
    const cached = this.cache.get(resolved);

    if (cached && cached.mtimeMs === mtimeMs) {
      return cached.content;
    }

    const content = fs.readFileSync(resolved, 'utf-8');

    this.cache.set(resolved, { mtimeMs, content });

    return content;
  }

  readJson(relativePath: string): unknown | undefined {
    const content = this.readFile(relativePath);

    if (content === undefined) {
      return undefined;
    }

    return JSON5.parse(content);
  }

  listNames(relativeDir: string, extensions: Array<string> = ['.json', '.json5']): Array<string> {
    const names = new Set<string>();

    for (const root of this.roots) {
      const candidate = path.resolve(path.join(root, path.normalize(relativeDir)));

      this.guard(relativeDir, root, candidate);

      if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
        continue;
      }

      for (const entry of fs.readdirSync(candidate)) {
        const entryPath = path.join(candidate, entry);

        if (!fs.statSync(entryPath).isFile()) {
          continue;
        }

        const extension = path.extname(entry);

        if (extensions.includes(extension)) {
          names.add(entry.slice(0, entry.length - extension.length));
        }
      }
    }

    return Array.from(names).sort();
  }

  write(relativePath: string, content: string): string {
    const root = this.roots[0];
    const candidate = path.resolve(path.join(root, path.normalize(relativePath)));

    this.guard(relativePath, root, candidate);

    fs.mkdirSync(path.dirname(candidate), { recursive: true });
    fs.writeFileSync(candidate, content, 'utf-8');

    this.cache.set(candidate, { mtimeMs: fs.statSync(candidate).mtimeMs, content });

    return candidate;
  }

  invalidate(): void {
    this.cache.clear();
  }
}

export const unwrapExport = (value: unknown): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] as Record<string, unknown> : undefined;
  }

  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return undefined;
};
