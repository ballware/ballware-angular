import path from 'path';
import JSON5 from 'json5';
import { createContext } from './context';
import { handleRequest } from './fixture-middleware';
import { createRequest, MockResponse } from './test/mock-http';

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

const createContextInstance = () => createContext({
  roots: [FIXTURES],
  tenant: 'test',
  user: 'test-user',
  persistOverlay: false,
  allowOverlayWrite: true
});

const run = async (
  context: ReturnType<typeof createContextInstance>,
  method: string,
  url: string,
  body?: string
): Promise<MockResponse> => {
  const req = createRequest(method, url, body);
  const res = new MockResponse();

  await handleRequest(context, req, res);

  return res;
};

describe('fixture middleware', () => {
  let context: ReturnType<typeof createContextInstance>;

  beforeEach(() => {
    context = createContextInstance();
  });

  it('serves entity metadata wire format', async () => {
    const res = await run(context, 'GET', '/meta/entity/metadataforentity/person');

    expect(res.statusCode).toEqual(200);
    const metadata = res.json as Record<string, unknown>;

    expect(metadata['Application']).toEqual('ballware');
    expect(metadata['Entity']).toEqual('person');
    expect(typeof metadata['GridLayout']).toEqual('string');
  });

  it('serves 404 for unknown entity metadata', async () => {
    const res = await run(context, 'GET', '/meta/entity/metadataforentity/unknown');

    expect(res.statusCode).toEqual(404);
  });

  it('serves tenant metadata and allowed tenants', async () => {
    const tenant = await run(context, 'GET', '/tenant/tenant/metadatafortenant/test');

    expect(tenant.statusCode).toEqual(200);
    expect((tenant.json as Record<string, unknown>)['Id']).toEqual('test');

    const allowed = await run(context, 'GET', '/tenant/tenant/allowed');

    expect(allowed.statusCode).toEqual(200);
    expect((allowed.json as Array<Record<string, unknown>>).some((value) => value['Id'] === 'test')).toBe(true);
  });

  it('serves lookup items by identifier', async () => {
    const res = await run(context, 'GET', '/tenant/lookup/selectlistforlookupidentifier/nameLookup');

    expect(res.statusCode).toEqual(200);
    expect(res.json).toHaveLength(2);
  });

  it('serves generic entity data from store', async () => {
    const all = await run(context, 'GET', '/generic/ballware/person/all?identifier=primary');

    expect(all.statusCode).toEqual(200);
    expect(all.json).toHaveLength(2);

    const count = await run(context, 'GET', '/generic/ballware/person/count?identifier=primary');

    expect((count.json as Record<string, unknown>)['count']).toEqual(42);

    const byId = await run(context, 'GET', '/generic/ballware/person/byId?identifier=primary&id=p1');

    expect((byId.json as Record<string, unknown>)['FirstName']).toEqual('Alice');
  });

  it('mutates generic store through save and remove', async () => {
    const save = await run(
      context,
      'POST',
      '/generic/ballware/person/save?identifier=primary',
      JSON.stringify({ Id: 'p1', FirstName: 'Alicia', SirName: 'Adams' })
    );

    expect(save.statusCode).toEqual(200);

    const all = await run(context, 'GET', '/generic/ballware/person/all?identifier=primary');

    expect((all.json as Array<Record<string, unknown>>).find((item) => item['Id'] === 'p1')?.['FirstName']).toEqual('Alicia');

    const remove = await run(context, 'DELETE', '/generic/ballware/person/remove/p2');

    expect(remove.statusCode).toEqual(200);

    const afterRemove = await run(context, 'GET', '/generic/ballware/person/all?identifier=primary');

    expect(afterRemove.json).toHaveLength(1);
  });

  it('filters generic queries by additional head params', async () => {
    const direct = await run(context, 'GET', '/generic/ballware/person/query?identifier=primary&firstname=Alice');

    expect((direct.json as Array<Record<string, unknown>>).map((item) => item['Id'])).toEqual(['p1']);

    const suffixed = await run(context, 'GET', '/generic/ballware/person/query?identifier=primary&sirnamefilter=Brown');

    expect((suffixed.json as Array<Record<string, unknown>>).map((item) => item['Id'])).toEqual(['p2']);

    const unmatched = await run(context, 'GET', '/generic/ballware/person/query?identifier=primary&unknownfilter=x');

    expect((unmatched.json as Array<Record<string, unknown>>).map((item) => item['Id'])).toEqual(['p1', 'p2']);
  });

  it('applies designer overlay to entity exports and reverts on reset', async () => {
    const post = await run(
      context,
      'POST',
      '/designer/overlay/entity/person',
      JSON.stringify({ GridLayout: { 0: { columns: { 0: { caption: 'Changed name' } } } } })
    );

    expect(post.statusCode).toEqual(200);

    const metadata = await run(context, 'GET', '/meta/entity/metadataforentity/person');

    const gridLayout = JSON5.parse((metadata.json as Record<string, unknown>)['GridLayout'] as string) as Array<{ columns: Array<{ caption: string }> }>;

    expect(gridLayout[0].columns[0].caption).toEqual('Changed name');
    expect(gridLayout[0].columns[1].caption).toEqual('Sir name');

    const reset = await run(context, 'POST', '/designer/reset');

    expect(reset.statusCode).toEqual(200);

    const restored = await run(context, 'GET', '/meta/entity/metadataforentity/person');

    const restoredLayout = JSON5.parse((restored.json as Record<string, unknown>)['GridLayout'] as string) as Array<{ columns: Array<{ caption: string }> }>;

    expect(restoredLayout[0].columns[0].caption).toEqual('First name');
  });

  it('tracks revision through overlay writes and reset', async () => {
    const initial = await run(context, 'GET', '/designer/revision');
    const initialRevision = (initial.json as Record<string, unknown>)['revision'];

    const afterWrite = await run(
      context,
      'POST',
      '/designer/overlay/page/personPage',
      JSON.stringify({ Name: 'Overridden page' })
    );

    expect(afterWrite.statusCode).toEqual(200);
    expect((afterWrite.json as Record<string, unknown>)['revision']).not.toEqual(initialRevision);
  });

  it('bootstraps tenant and user fixtures', async () => {
    const res = await run(context, 'GET', '/designer/bootstrap');

    expect(res.statusCode).toEqual(200);

    const bootstrap = res.json as Record<string, unknown>;

    expect((bootstrap['tenant'] as Record<string, unknown>)['Id']).toEqual('test');
    expect((bootstrap['user'] as Record<string, unknown>)['Id']).toEqual('test-user');
    expect(bootstrap['revision']).toBeDefined();
  });

  it('bootstraps with explicit tenant and user params', async () => {
    const res = await run(context, 'GET', '/designer/bootstrap?tenant=test&user=test-user');

    expect(res.statusCode).toEqual(200);
  });

  it('resolves tenant fixture by internal Id and identity alias by internal Id', async () => {
    const tenant = await run(context, 'GET', '/tenant/tenant/metadatafortenant/11111111-2222-3333-4444-555555555555');

    expect(tenant.statusCode).toEqual(200);
    expect((tenant.json as Record<string, unknown>)['Id']).toEqual('11111111-2222-3333-4444-555555555555');

    const bootstrap = await run(context, 'GET',
      '/designer/bootstrap?tenant=11111111-2222-3333-4444-555555555555&user=test-user-alias');

    expect(bootstrap.statusCode).toEqual(200);

    const bootstrapJson = bootstrap.json as Record<string, unknown>;

    expect((bootstrapJson['tenant'] as Record<string, unknown>)['Id']).toEqual('11111111-2222-3333-4444-555555555555');
    expect((bootstrapJson['user'] as Record<string, unknown>)['Id']).toEqual('test-user-alias');

    const identity = await run(context, 'GET', '/identity/ballware-user-api/selectbyid/test-user-alias');

    expect(identity.statusCode).toEqual(200);
    expect((identity.json as Record<string, unknown>)['Name']).toEqual('Test User Alias');
  });

  it('rejects overlay write when disabled', async () => {
    const readOnlyContext = createContext({
      roots: [FIXTURES],
      tenant: 'test',
      user: 'test-user',
      persistOverlay: false,
      allowOverlayWrite: false
    });

    const res = await run(readOnlyContext, 'POST', '/designer/overlay/entity/person', JSON.stringify({ DisplayName: 'X' }));

    expect(res.statusCode).toEqual(403);
  });

  it('rejects path traversal attempts on meta endpoints', async () => {
    const res = await run(context, 'GET', '/meta/entity/metadataforentity/..%2F..%2Fsecret');

    expect(res.statusCode).toEqual(404);
  });
});
