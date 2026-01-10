import { Hono } from 'hono';
import bootstrap from './main.server';
import {
  getAuth,
  initOidcAuthMiddleware,
  oidcAuthMiddleware,
  processOAuthCallback,
} from '@hono/oidc-auth';
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const app = new Hono();

const angularAppEngine = new AngularAppEngine();

app.use(initOidcAuthMiddleware({
  OIDC_AUTH_SECRET: process.env['AUTH_SECRET'],
  OIDC_ISSUER: process.env['BALLWARE_IDENTITYURL'],
  OIDC_CLIENT_ID: process.env['BALLWARE_CLIENTID'],
  OIDC_CLIENT_SECRET: 'change_me',
  OIDC_REDIRECT_URI: '/signin-oidc',
  OIDC_SCOPES: process.env['BALLWARE_IDENTITYSCOPES']
}));

app.get('/signin-oidc', processOAuthCallback);

app.get('/me', oidcAuthMiddleware(), async (c) => {
  const auth = await getAuth(c);

  console.log('/me', c, 'auth:', auth);
  // TODO: return user info

  return c.json({}, 200);
});

app.get('/*', oidcAuthMiddleware(), async (c) => {
  const res = await angularAppEngine.handle(c.req.raw, { server: 'hono' });
  if (!res) {
    // gracefuly fail with a 404 (probably because static failed)
    return c.text('Not found ---', { status: 404 });
  }
  return res;
});

export const reqHandler = createRequestHandler(app.fetch);

export default bootstrap;
