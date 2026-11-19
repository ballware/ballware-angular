import fs from 'fs';
import os from 'os';
import path from 'path';
import { FixtureLoader, PathSecurityError } from './loader';

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

describe('FixtureLoader', () => {
  it('resolves files inside the fixture roots', () => {
    const loader = new FixtureLoader([FIXTURES]);

    const resolved = loader.resolve('entity/person.json');

    expect(resolved).toBeDefined();
    expect(fs.existsSync(resolved!)).toBe(true);
  });

  it('reads json5 content of exports', () => {
    const loader = new FixtureLoader([FIXTURES]);

    const parsed = loader.readJson('entity/person.json');

    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as Array<Record<string, unknown>>)[0]['Entity']).toEqual('person');
  });

  it('rejects absolute paths', () => {
    const loader = new FixtureLoader([FIXTURES]);

    expect(() => loader.resolve('/etc/passwd')).toThrow(PathSecurityError);
  });

  it('rejects traversal outside the fixture roots', () => {
    const loader = new FixtureLoader([FIXTURES]);

    expect(() => loader.resolve('../secret.json')).toThrow(PathSecurityError);
    expect(() => loader.resolve('entity/../../secret.json')).toThrow(PathSecurityError);
  });

  it('prefers earlier roots and falls through to later ones', () => {
    const overlayRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fixture-overlay-'));

    fs.mkdirSync(path.join(overlayRoot, 'entity'), { recursive: true });
    fs.writeFileSync(path.join(overlayRoot, 'entity', 'person.json'), '[{"Entity":"override"}]', 'utf-8');

    const loader = new FixtureLoader([overlayRoot, FIXTURES]);

    const parsed = loader.readJson('entity/person.json') as Array<Record<string, unknown>>;

    expect(parsed[0]['Entity']).toEqual('override');

    fs.rmSync(overlayRoot, { recursive: true, force: true });
  });

  it('re-reads changed files after mtime change', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fixture-cache-'));

    fs.mkdirSync(path.join(root, 'data'), { recursive: true });

    const target = path.join(root, 'data', 'items.json');

    fs.writeFileSync(target, '[{"Id":"1"}]', 'utf-8');

    const loader = new FixtureLoader([root]);

    expect(loader.readJson('data/items.json')).toEqual([{ Id: '1' }]);

    const firstStat = fs.statSync(target);
    fs.writeFileSync(target, '[{"Id":"1"},{"Id":"2"}]', 'utf-8');
    fs.utimesSync(target, firstStat.atime, new Date(firstStat.mtimeMs + 1000));

    expect(loader.readJson('data/items.json')).toEqual([{ Id: '1' }, { Id: '2' }]);

    fs.rmSync(root, { recursive: true, force: true });
  });

  it('lists fixture names without extension', () => {
    const loader = new FixtureLoader([FIXTURES]);

    expect(loader.listNames('entity')).toEqual(['person']);
    expect(loader.listNames('unknown')).toEqual([]);
  });

  it('writes files inside the first root only', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fixture-write-'));

    const loader = new FixtureLoader([root]);

    const written = loader.write('designer/overlay/entity/person.json5', '{ DisplayName: "Overridden" }');

    expect(written.startsWith(root)).toBe(true);
    expect(fs.readFileSync(written, 'utf-8')).toContain('Overridden');

    expect(() => loader.write('../escape.json5', '{}')).toThrow(PathSecurityError);

    fs.rmSync(root, { recursive: true, force: true });
  });
});
