import { Hono, MiddlewareHandler } from 'hono';
import bootstrap from './main.server';
import {
  initAuthConfig, verifyAuth, authHandler
} from '@hono/auth-js';
import Keycloak from '@auth/core/providers/keycloak'
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const app = new Hono();
const angularAppEngine = new AngularAppEngine();

export const requireAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('authUser')

    if (user) {
      await next()
      return
    }

    // SSR / Browser → Redirect to Keycloak login
    const url = new URL(c.req.url)
    const callbackUrl = url.pathname + url.search

    const signin = new URL('/auth/signin', url.origin)
    signin.searchParams.set('provider', 'keycloak')
    signin.searchParams.set('callbackUrl', callbackUrl)

    return c.redirect(signin.toString(), 302)
  }
}

app.use(initAuthConfig((c) => ({
  secret: process.env['AUTH_SECRET'],
  session: { strategy: 'jwt' },
  basePath: '/auth',
  providers: [
    Keycloak({
      issuer: process.env['BALLWARE_IDENTITYURL'],
      clientId: process.env['BALLWARE_CLIENTID'],
      clientSecret: 'change_me',
      authorization: {
        params: {
          scope: process.env['BALLWARE_IDENTITYSCOPES'],
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        const issuer = process.env['BALLWARE_IDENTITYURL']!;
        const userinfoEndpoint = `${issuer}/protocol/openid-connect/userinfo`;

        const res = await fetch(userinfoEndpoint, {
          headers: { Authorization: `Bearer ${account.access_token}` },
        });

        if (res.ok) {
          const userinfo = await res.json();

          token['userinfo'] = userinfo;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user ?? {}),
        ...((token as any).userinfo ?? {}),
      }
      return session
    },
  }}))
);

app.use('*', verifyAuth());
app.use('/auth/*', authHandler());

  /*
  OIDC_AUTH_SECRET: process.env['AUTH_SECRET'],
  OIDC_ISSUER: process.env['BALLWARE_IDENTITYURL'],
  OIDC_CLIENT_ID: process.env['BALLWARE_CLIENTID'],
  OIDC_CLIENT_SECRET: 'change_me',
  OIDC_REDIRECT_URI: '/signin-oidc',
  OIDC_SCOPES: process.env['BALLWARE_IDENTITYSCOPES']
  */

app.get('/me', verifyAuth(), async (c) => {
  const user = c.get('authUser');

  if (!user?.session?.user) return c.status(401);

  const userinfo = user.session.user as Record<string, unknown>;

  return c.json({
    user: userinfo,
    userName: userinfo[process.env['BALLWARE_USERNAMECLAIM'] || 'preferred_username'],
    tenant: userinfo[process.env['BALLWARE_TENANTCLAIM'] || 'tenant'],
  }, 200);
});

app.get('/*', requireAuth(), async (c) => {
  const user = c.get('authUser')

  if (!user) {
    const currentUrl = new URL(c.req.url)
    const callbackUrl = currentUrl.pathname + currentUrl.search

    const signin = new URL('/auth/signin', currentUrl.origin)
    signin.searchParams.set('provider', 'keycloak')
    signin.searchParams.set('callbackUrl', callbackUrl)

    return c.redirect(signin.toString(), 302)
  }

  const res = await angularAppEngine.handle(c.req.raw, { server: 'hono' });
  if (!res) {
    // gracefuly fail with a 404 (probably because static failed)
    return c.text('Not found ---', { status: 404 });
  }
  return res;
});

export const reqHandler = createRequestHandler(app.fetch);

export default bootstrap;
