import path from 'path';
import { GenericStore } from './store';
import { FixtureLoader } from './loader';

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

describe('GenericStore', () => {
  const createStore = () => new GenericStore(new FixtureLoader([FIXTURES]));

  const keyColumn = (): string => 'Id';

  it('loads seeded items and counts them', () => {
    const store = createStore();

    expect(store.all('ballware', 'person', keyColumn)).toHaveLength(2);
    expect(store.count('ballware', 'person', keyColumn)).toEqual(2);
  });

  it('finds items by id', () => {
    const store = createStore();

    expect(store.byId('ballware', 'person', 'p1', keyColumn)?.['FirstName']).toEqual('Alice');
    expect(store.byId('ballware', 'person', 'unknown', keyColumn)).toBeUndefined();
  });

  it('creates new items with generated id', () => {
    const store = createStore();

    const item = store.newItem('ballware', 'person', { FirstName: 'Carol' }, keyColumn);

    expect(item['Id']).toBeDefined();
    expect(item['FirstName']).toEqual('Carol');
  });

  it('updates existing items on save', () => {
    const store = createStore();

    store.save('ballware', 'person', { Id: 'p1', FirstName: 'Alicia', SirName: 'Adams' }, keyColumn);

    expect(store.byId('ballware', 'person', 'p1', keyColumn)?.['FirstName']).toEqual('Alicia');
    expect(store.all('ballware', 'person', keyColumn)).toHaveLength(2);
  });

  it('adds new items on save without existing id', () => {
    const store = createStore();

    store.save('ballware', 'person', { FirstName: 'Dave' }, keyColumn);

    expect(store.all('ballware', 'person', keyColumn)).toHaveLength(3);
  });

  it('removes items', () => {
    const store = createStore();

    expect(store.remove('ballware', 'person', 'p2', keyColumn)).toBe(true);
    expect(store.remove('ballware', 'person', 'p2', keyColumn)).toBe(false);
    expect(store.all('ballware', 'person', keyColumn)).toHaveLength(1);
  });

  it('restores seed state on reset', () => {
    const store = createStore();

    store.remove('ballware', 'person', 'p1', keyColumn);
    store.save('ballware', 'person', { FirstName: 'Temp' }, keyColumn);

    store.reset();

    expect(store.all('ballware', 'person', keyColumn)).toHaveLength(2);
    expect(store.byId('ballware', 'person', 'p1', keyColumn)).toBeDefined();
  });
});
