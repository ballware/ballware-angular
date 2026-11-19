import * as JSON5 from 'json5';
import { FixtureMiddlewareContext } from './context';
import { MiddlewareRequest, MiddlewareResponse, parseAdditionalParams, parseUrl, readBody, safeIdentifier, sendJson } from './http';
import { OVERLAY_KINDS, OverlayKind } from './overlay';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

export const handleDesigner = async (
  context: FixtureMiddlewareContext,
  req: MiddlewareRequest,
  res: MiddlewareResponse
): Promise<void> => {
  const { segments, query } = parseUrl(req.url);
  const route = segments.slice(1);
  const method = (req.method ?? 'GET').toUpperCase();

  if (route.length === 1 && route[0] === 'bootstrap') {
    let tenantId = safeIdentifier(query.get('tenant') ?? undefined) ?? context.config.tenant;
    let userName = safeIdentifier(query.get('user') ?? undefined) ?? context.config.user;

    let tenant = context.getTenantExport(tenantId);

    if (!tenant) {
      const fallbackTenant = context.loader.listNames('tenant').find((name) => context.getTenantExport(name));

      if (fallbackTenant) {
        tenantId = fallbackTenant;
        tenant = context.getTenantExport(fallbackTenant);
      }
    }

    let user = context.getIdentity(userName);

    if (!user) {
      const identities = context.getIdentities();
      const fallbackUser = identities.find((identity) => identity !== undefined);

      if (fallbackUser) {
        userName = (fallbackUser['Id'] ?? '').toString();
        user = fallbackUser;
      }
    }

    if (!tenant) {
      sendJson(res, 404, { error: `Unknown tenant fixture: ${tenantId}` });
      return;
    }

    sendJson(res, 200, {
      tenant,
      user: user ?? { Id: userName, Name: userName },
      revision: context.getRevision()
    });
    return;
  }

  if (route.length === 1 && route[0] === 'roots') {
    sendJson(res, 200, { roots: context.config.roots });
    return;
  }

  if (route.length === 1 && route[0] === 'tenants') {
    sendJson(res, 200, context.getTenants());
    return;
  }

  if (route.length === 1 && route[0] === 'revision') {
    sendJson(res, 200, { revision: context.getRevision() });
    return;
  }

  if (route.length === 1 && route[0] === 'reset' && method === 'POST') {
    context.reset();

    sendJson(res, 200, { revision: context.getRevision() });
    return;
  }

  if (route[0] === 'overlay') {
    if (route.length === 1) {
      sendJson(res, 200, { overlays: context.overlayStore.listOverlays(), revision: context.getRevision() });
      return;
    }

    const kind = route[1] as OverlayKind;

    if (!OVERLAY_KINDS.includes(kind)) {
      sendJson(res, 404, { error: `Unknown overlay kind: ${route[1]}` });
      return;
    }

    if (route.length === 2) {
      sendJson(res, 200, {
        overlays: context.overlayStore.listOverlays().filter((overlay) => overlay.kind === kind),
        revision: context.getRevision()
      });
      return;
    }

    const id = safeIdentifier(route[2]);

    if (!id) {
      sendJson(res, 400, { error: 'Invalid overlay identifier' });
      return;
    }

    if (method === 'GET') {
      sendJson(res, 200, {
        kind,
        id,
        overlay: context.overlayStore.getOverlay(kind, id) ?? null,
        revision: context.getRevision()
      });
      return;
    }

    if (method === 'POST') {
      if (!context.config.allowOverlayWrite) {
        sendJson(res, 403, { error: 'Overlay write is disabled' });
        return;
      }

      const body = await readBody(req);

      let overlay: unknown;

      try {
        overlay = JSON5.parse(body || '{}');
      } catch {
        sendJson(res, 400, { error: 'Body is no valid JSON5 document' });
        return;
      }

      if (!isRecord(overlay)) {
        sendJson(res, 400, { error: 'Overlay body has to be an object' });
        return;
      }

      context.overlayStore.setOverlay(kind, id, overlay);
      context.markChanged();

      if (context.config.persistOverlay) {
        context.loader.write(`designer/overlay/${kind}/${id}.json5`, JSON5.stringify(overlay, null, 2));
      }

      sendJson(res, 200, { kind, id, revision: context.getRevision() });
      return;
    }

    sendJson(res, 405, { error: `Unsupported method ${method} on designer overlay` });
    return;
  }

  if (route.length === 2 && route[0] === 'e2e' && route[1] === 'selectors') {
    const tenantId = safeIdentifier(query.get('tenant') ?? undefined) ?? context.config.tenant;
    const pageId = safeIdentifier(query.get('page') ?? undefined);
    const page = pageId ? context.getPageExport(pageId) : undefined;

    sendJson(res, 200, {
      tenant: tenantId,
      page: pageId,
      pageExport: page ?? null,
      additionalParams: parseAdditionalParams(query)
    });
    return;
  }

  sendJson(res, 404, { error: `Unknown designer endpoint: ${segments.join('/')}` });
};
