import * as path from 'path';
import { createContext, FixtureMiddlewareContext } from './context';
import { handleDesigner } from './designer';
import {
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse,
  parseAdditionalParams,
  parseUrl,
  readBody,
  safeIdentifier,
  sendJson
} from './http';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const toArray = (value: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value as Array<Record<string, unknown>>;
  }

  return [];
};

const listSelectRecords = (names: Array<string>): Array<Record<string, unknown>> => {
  return names.map((name) => ({ Id: name, Identifier: name, Name: name, DisplayName: name }));
};

const isHandledPrefix = (prefix: string): boolean => {
  return ['meta', 'generic', 'tenant', 'document', 'identity', 'ml', 'storage', 'designer'].includes(prefix);
};

const handleMeta = (context: FixtureMiddlewareContext, req: MiddlewareRequest, res: MiddlewareResponse): void => {
  const { segments, query } = parseUrl(req.url);
  const route = segments.slice(1);

  if (route[0] === 'entity') {
    if (route[1] === 'metadataforentity') {
      const entity = safeIdentifier(route[2]);
      const metadata = entity ? context.getEntityExport(entity) : undefined;

      if (!metadata) {
        sendJson(res, 404, { error: `Unknown entity metadata: ${route[2]}` });
        return;
      }

      sendJson(res, 200, metadata);
      return;
    }

    if (route[1] === 'selectlist' || route[1] === 'selectlistrights') {
      sendJson(res, 200, listSelectRecords(context.loader.listNames('entity')));
      return;
    }

    if (route[1] === 'selectbyid' || route[1] === 'rightselectbyid' || route[1] === 'selectbyidentifier') {
      const id = safeIdentifier(route[2]);
      const metadata = id ? context.getEntityExport(id) : undefined;

      if (!metadata) {
        sendJson(res, 404, { error: `Unknown entity: ${route[2]}` });
        return;
      }

      sendJson(res, 200, metadata);
      return;
    }
  }

  if (route[0] === 'page') {
    if (route[1] === 'pagedataforidentifier') {
      const page = safeIdentifier(route[2]);
      const pageData = page ? context.getPageExport(page) : undefined;

      if (!pageData) {
        sendJson(res, 404, { error: `Unknown page: ${route[2]}` });
        return;
      }

      sendJson(res, 200, pageData);
      return;
    }

    if (route[1] === 'selectlist') {
      sendJson(res, 200, listSelectRecords(context.loader.listNames('page')));
      return;
    }

    if (route[1] === 'selectbyid') {
      const id = safeIdentifier(route[2]);
      const pageData = id ? context.getPageExport(id) : undefined;

      if (!pageData) {
        sendJson(res, 404, { error: `Unknown page: ${route[2]}` });
        return;
      }

      sendJson(res, 200, pageData);
      return;
    }
  }

  if (route[0] === 'tenant') {
    if (route[1] === 'metadatafortenant') {
      const tenantId = safeIdentifier(route[2]);
      const tenant = tenantId ? context.getTenantExport(tenantId) : undefined;

      if (!tenant) {
        sendJson(res, 404, { error: `Unknown tenant: ${route[2]}` });
        return;
      }

      sendJson(res, 200, tenant);
      return;
    }

    if (route[1] === 'allowed') {
      sendJson(res, 200, context.getTenants());
      return;
    }

    if (route[1] === 'selectlist') {
      sendJson(res, 200, context.getTenants());
      return;
    }

    if (route[1] === 'selectbyid') {
      const id = safeIdentifier(route[2]);
      const tenant = id ? context.getTenantExport(id) : undefined;

      if (!tenant) {
        sendJson(res, 404, { error: `Unknown tenant: ${route[2]}` });
        return;
      }

      sendJson(res, 200, tenant);
      return;
    }
  }

  if (route[0] === 'lookup') {
    if (route[1] === 'selectlist') {
      sendJson(res, 200, listSelectRecords(context.loader.listNames('lookup')));
      return;
    }

    if (route[1] === 'selectbyid') {
      const id = safeIdentifier(route[2]);
      const lookup = id ? context.loader.readJson(path.posix.join('lookup', `${id}.json`)) : undefined;

      sendJson(res, lookup === undefined ? 404 : 200, lookup ?? { error: `Unknown lookup: ${route[2]}` });
      return;
    }
  }

  if (route[0] === 'pickvalue') {
    const entity = safeIdentifier(route[2]);
    const field = safeIdentifier(route[3]);

    if (route[1] === 'selectlistforentityandfield' && entity && field) {
      const pickvalues = toArray(context.loader.readJson(path.posix.join('pickvalue', `${entity}.${field}.json`)));

      sendJson(res, 200, pickvalues);
      return;
    }

    if (route[1] === 'selectbyvalueforentityandfield' && entity && field) {
      const value = route[4];
      const pickvalues = toArray(context.loader.readJson(path.posix.join('pickvalue', `${entity}.${field}.json`)));
      const pickvalue = pickvalues.find((item) => item['Value']?.toString() === value);

      sendJson(res, pickvalue ? 200 : 404, pickvalue ?? { error: 'Unknown pickvalue' });
      return;
    }
  }

  if (route[0] === 'processingstate') {
    if (route[1] === 'selectlist') {
      sendJson(res, 200, []);
      return;
    }

    if (route[1] === 'selectlistforentity') {
      const entity = safeIdentifier(route[2]);
      const states = entity ? toArray(context.loader.readJson(path.posix.join('processingstate', `${entity}.json`))) : [];

      sendJson(res, 200, states);
      return;
    }

    if (route[1] === 'selectbystateforentity') {
      const entity = safeIdentifier(route[2]);
      const state = route[3];
      const states = entity ? toArray(context.loader.readJson(path.posix.join('processingstate', `${entity}.json`))) : [];
      const found = states.find((item) => item['State']?.toString() === state);

      sendJson(res, found ? 200 : 404, found ?? { error: 'Unknown processingstate' });
      return;
    }

    if (route[1] === 'selectbyid') {
      sendJson(res, 404, { error: 'Unknown processingstate' });
      return;
    }
  }

  sendJson(res, 404, { error: `Unknown meta endpoint: ${segments.slice(1).join('/')}${query.toString() ? `?${query.toString()}` : ''}` });
};

const handleTenant = (context: FixtureMiddlewareContext, req: MiddlewareRequest, res: MiddlewareResponse): void => {
  const { segments } = parseUrl(req.url);
  const route = segments.slice(1);

  if (route[0] === 'tenant') {
    if (route[1] === 'metadatafortenant') {
      const tenantId = safeIdentifier(route[2]);
      const tenant = tenantId ? context.getTenantExport(tenantId) : undefined;

      if (!tenant) {
        sendJson(res, 404, { error: `Unknown tenant: ${route[2]}` });
        return;
      }

      sendJson(res, 200, tenant);
      return;
    }

    if (route[1] === 'allowed') {
      sendJson(res, 200, context.getTenants());
      return;
    }
  }

  if (route[0] === 'lookup') {
    const readLookupItems = (identifier: string|undefined): Array<Record<string, unknown>> => {
      return identifier ? toArray(context.loader.readJson(path.posix.join('lookup', `${identifier}.json`))) : [];
    };

    if (route[1] === 'selectlistforlookupidentifier' || route[1] === 'selectlistforlookup' || route[1] === 'selectlistforlookupwithparam') {
      sendJson(res, 200, readLookupItems(safeIdentifier(route[2])));
      return;
    }

    if (route[1] === 'selectbyidforlookupidentifier' || route[1] === 'selectbyidforlookup' || route[1] === 'selectbyidforlookupwithparam') {
      const lookupId = route[2];
      const id = route[1] === 'selectbyidforlookupwithparam' ? route[4] : route[3];
      const items = readLookupItems(safeIdentifier(lookupId));
      const item = items.find((candidate) => (candidate['Id'] ?? candidate['Value'])?.toString() === id);

      sendJson(res, item ? 200 : 404, item ?? { error: `Unknown lookup item: ${id}` });
      return;
    }

    if (route[1]?.startsWith('autocomplete')) {
      const searchValue = (route[1].endsWith('withparam') ? route[3] : '').toLowerCase();
      const items = readLookupItems(safeIdentifier(route[2]));
      const filtered = searchValue.length === 0
        ? items
        : items.filter((item) => Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchValue)));

      sendJson(res, 200, filtered);
      return;
    }
  }

  if (route[0] === 'processingstate') {
    sendJson(res, 200, []);
    return;
  }

  sendJson(res, 404, { error: `Unknown tenant endpoint: ${segments.slice(1).join('/')}` });
};

const handleGeneric = async (context: FixtureMiddlewareContext, req: MiddlewareRequest, res: MiddlewareResponse): Promise<void> => {
  const { segments, query } = parseUrl(req.url);
  const route = segments.slice(1);
  const method = (req.method ?? 'GET').toUpperCase();

  const application = safeIdentifier(route[0]);
  const entity = safeIdentifier(route[1]);
  const action = route[2];

  if (!application || !entity || !action) {
    sendJson(res, 404, { error: `Unknown generic endpoint: ${segments.join('/')}` });
    return;
  }

  const handler = await context.handlers.get(application, entity);
  const resolveKeyColumn = context.resolveKeyColumn;
  const params = parseAdditionalParams(query);

  if ((action === 'all' || action === 'query') && method === 'GET') {
    const identifier = query.get('identifier') ?? '';

    if (action === 'query' && handler?.query) {
      sendJson(res, 200, await handler.query(identifier, params) ?? []);
      return;
    }

    if (handler?.all) {
      sendJson(res, 200, await handler.all() ?? []);
      return;
    }

    const allItems = context.store.all(application, entity, resolveKeyColumn) as Array<Record<string, unknown>>;
    const filters = Object.entries(params)
      .map(([key, value]) => {
        const baseName = key.replace(/filter$/i, '').toLowerCase();
        const columns = allItems.length > 0 ? Object.keys(allItems[0]) : [];
        const column = columns.find((candidate) => candidate.toLowerCase() === key.toLowerCase())
          ?? columns.find((candidate) => candidate.toLowerCase() === baseName);

        return { column, value };
      })
      .filter((filter) => filter.column !== undefined);
    const filtered = filters.length
      ? allItems.filter((item) =>
          filters.every(({ column, value }) => {
            const itemValue = item[column as string];

            if (Array.isArray(value)) {
              return value.some((v) => String(itemValue ?? '') === String(v ?? ''));
            }

            return String(itemValue ?? '') === String(value ?? '');
          })
        )
      : allItems;

    sendJson(res, 200, filtered);
    return;
  }

  if (action === 'count' && method === 'GET') {
    const identifier = query.get('identifier') ?? '';

    if (handler?.count) {
      const count = await handler.count(identifier, params);

      sendJson(res, 200, { count: typeof count === 'number' ? count : toArray(count).length });
      return;
    }

    sendJson(res, 200, { count: context.store.count(application, entity, resolveKeyColumn) });
    return;
  }

  if (action === 'byId' && method === 'GET') {
    const id = query.get('id') ?? '';

    if (handler?.byId) {
      const item = await handler.byId(id);

      sendJson(res, item ? 200 : 404, item ?? { error: `Unknown item: ${id}` });
      return;
    }

    const item = context.store.byId(application, entity, id, resolveKeyColumn);

    sendJson(res, item ? 200 : 404, item ?? { error: `Unknown item: ${id}` });
    return;
  }

  if ((action === 'new' || action === 'newquery') && method === 'GET') {
    if (handler?.new) {
      sendJson(res, 200, await handler.new(params) ?? {});
      return;
    }

    sendJson(res, 200, context.store.newItem(application, entity, undefined, resolveKeyColumn));
    return;
  }

  if (action === 'save' && method === 'POST') {
    const body = await readBody(req);
    let item: unknown;

    try {
      item = JSON.parse(body || '{}');
    } catch {
      sendJson(res, 400, { error: 'Body is no valid JSON document' });
      return;
    }

    if (!isRecord(item)) {
      sendJson(res, 400, { error: 'Save body has to be an object' });
      return;
    }

    if (handler?.save) {
      await handler.save(item);
      sendJson(res, 200, {});
      return;
    }

    context.store.save(application, entity, item, resolveKeyColumn);
    sendJson(res, 200, {});
    return;
  }

  if (action === 'savebatch' && method === 'POST') {
    const body = await readBody(req);
    let items: unknown;

    try {
      items = JSON.parse(body || '[]');
    } catch {
      sendJson(res, 400, { error: 'Body is no valid JSON document' });
      return;
    }

    if (!Array.isArray(items)) {
      sendJson(res, 400, { error: 'Savebatch body has to be an array' });
      return;
    }

    if (handler?.saveBatch) {
      await handler.saveBatch(items as Array<Record<string, unknown>>);
      sendJson(res, 200, {});
      return;
    }

    context.store.saveBatch(application, entity, items as Array<Record<string, unknown>>, resolveKeyColumn);
    sendJson(res, 200, {});
    return;
  }

  if (action === 'remove' && (method === 'POST' || method === 'DELETE')) {
    const id = route[3];

    if (!id) {
      sendJson(res, 400, { error: 'Missing item id on remove' });
      return;
    }

    if (handler?.remove) {
      await handler.remove(id);
      sendJson(res, 200, {});
      return;
    }

    const removed = context.store.remove(application, entity, id, resolveKeyColumn);

    sendJson(res, removed ? 200 : 404, removed ? {} : { error: `Unknown item: ${id}` });
    return;
  }

  if (action === 'import') {
    sendJson(res, 404, { error: 'Import not simulated in fixture middleware' });
    return;
  }

  if (action === 'exporturl') {
    sendJson(res, 404, { error: 'Export not simulated in fixture middleware' });
    return;
  }

  sendJson(res, 404, { error: `Unknown generic endpoint: ${segments.join('/')}` });
};

const handleIdentity = (context: FixtureMiddlewareContext, req: MiddlewareRequest, res: MiddlewareResponse): void => {
  const { segments } = parseUrl(req.url);
  const route = segments.slice(1);

  if (route[0] === 'ballware-user-api') {
    if (route[1] === 'selectlist') {
      sendJson(res, 200, context.getIdentities());
      return;
    }

    if (route[1] === 'selectbyid') {
      const id = safeIdentifier(route[2]);
      const user = id ? context.getIdentity(id) : undefined;

      sendJson(res, user ? 200 : 404, user ?? { error: `Unknown user: ${route[2]}` });
      return;
    }

    if (route[1] === 'tenant') {
      sendJson(res, 200, {});
      return;
    }
  }

  sendJson(res, 404, { error: `Unknown identity endpoint: ${segments.slice(1).join('/')}` });
};

const handleStub = (req: MiddlewareRequest, res: MiddlewareResponse): void => {
  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'GET') {
    sendJson(res, 200, []);
    return;
  }

  if (method === 'POST' || method === 'DELETE' || method === 'PUT') {
    sendJson(res, 200, {});
    return;
  }

  sendJson(res, 404, { error: 'Unsupported stub endpoint' });
};

export const handleRequest = async (
  context: FixtureMiddlewareContext,
  req: MiddlewareRequest,
  res: MiddlewareResponse
): Promise<void> => {
  const { segments } = parseUrl(req.url);
  const prefix = segments[0];

  if (!isHandledPrefix(prefix)) {
    sendJson(res, 404, { error: `Unhandled fixture prefix: ${prefix}` });
    return;
  }

  if (prefix === 'designer') {
    await handleDesigner(context, req, res);
    return;
  }

  if (prefix === 'meta') {
    handleMeta(context, req, res);
    return;
  }

  if (prefix === 'tenant') {
    handleTenant(context, req, res);
    return;
  }

  if (prefix === 'generic') {
    await handleGeneric(context, req, res);
    return;
  }

  if (prefix === 'identity') {
    handleIdentity(context, req, res);
    return;
  }

  handleStub(req, res);
};

export const createFixtureMiddleware = (context?: FixtureMiddlewareContext) => {
  let middlewareContext = context;

  return (req: MiddlewareRequest, res: MiddlewareResponse, next: MiddlewareNext): void => {
    middlewareContext ??= createContext();

    const { segments } = parseUrl(req.url);

    if (!isHandledPrefix(segments[0])) {
      next();
      return;
    }

    handleRequest(middlewareContext, req, res).catch((error: unknown) => {
      sendJson(res, 500, { error: (error as Error)?.toString?.() ?? 'Fixture middleware error' });
    });
  };
};

export default createFixtureMiddleware();
