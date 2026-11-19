import path from 'path';
import { HandlerRegistry } from './context';
import { FixtureLoader } from './loader';

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

describe('HandlerRegistry', () => {
  it('loads simulation handler for application and entity', async () => {
    const registry = new HandlerRegistry(new FixtureLoader([FIXTURES]));

    const handler = await registry.get('ballware', 'person');

    expect(handler).toBeDefined();
    expect(handler?.count).toBeDefined();
    expect(await handler?.count?.('primary', {})).toEqual(42);
  });

  it('returns undefined for missing handler', async () => {
    const registry = new HandlerRegistry(new FixtureLoader([FIXTURES]));

    expect(await registry.get('ballware', 'unknownentity')).toBeUndefined();
  });

  it('prefers registered handlers over file handlers on reset', async () => {
    const registry = new HandlerRegistry(new FixtureLoader([FIXTURES]));

    registry.register('ballware', 'other', { count: () => 7 });

    expect((await registry.get('ballware', 'other'))?.count?.('x', {})).toEqual(7);

    registry.reset();

    expect(await registry.get('ballware', 'other')).toBeUndefined();
  });
});
