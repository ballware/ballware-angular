import * as path from 'path';

export interface FixtureMiddlewareConfig {
  /**
   * Absolute fixture root directories in priority order (first match wins)
   */
  roots: string[];
  /**
   * Default tenant used for bootstrap when not given as query param
   */
  tenant: string;
  /**
   * Default user used for bootstrap when not given as query param
   */
  user: string;
  /**
   * Persist designer overlays to disk below first fixture root
   */
  persistOverlay: boolean;
  /**
   * Allow POST on designer overlay endpoints
   */
  allowOverlayWrite: boolean;
}

const toBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value === 'true' || value === '1';
};

export const loadConfig = (env: Record<string, string | undefined> = process.env): FixtureMiddlewareConfig => {
  const rootsRaw = env['BALLWARE_FIXTURE_ROOTS'] ?? 'fixtures/e2e';
  const roots = rootsRaw
    .split(',')
    .map((root) => root.trim())
    .filter((root) => root.length > 0)
    .map((root) => path.resolve(root));

  return {
    roots: roots.length > 0 ? roots : [path.resolve('fixtures/e2e')],
    tenant: env['BALLWARE_FIXTURE_TENANT'] ?? 'e2e',
    user: env['BALLWARE_FIXTURE_USER'] ?? 'e2e-user',
    persistOverlay: toBool(env['BALLWARE_FIXTURE_PERSIST'], false),
    allowOverlayWrite: toBool(env['BALLWARE_FIXTURE_ALLOW_OVERLAY_WRITE'], true)
  };
};
