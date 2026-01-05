import {APP_BASE_HREF} from '@angular/common';
import {CommonEngine} from '@angular/ssr/node';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { authorizationCodeGrant, randomPKCECodeVerifier, calculatePKCECodeChallenge, randomState, buildAuthorizationUrl } from 'openid-client';
import { getOidcConfiguration } from './auth/oidc.client';
import { redirectUnauthenticated } from './middleware/require.auth';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import bootstrap from './main.server';
import { BROWSER_REQUEST } from './app/shared/interceptors/sessioncookie.interceptor';

const MemoryStore = createMemoryStore(session);

function getFullUrl(req: Request): URL {
  const base = process.env['BALLWARE_BASEURL'];
  if (!base) {
    throw new Error('BALLWARE_BASEURL not set');
  }
  return new URL(req.originalUrl, base);
}

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  const commonEngine = new CommonEngine();

  server.use(express.json());

  const sessionMiddleware: RequestHandler = session({
    name: 'ballware.sid',
    secret: process.env['SESSION_SECRET'] || 'change-me',
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 // 1 hour
    }),
    cookie: {
      httpOnly: true,
      secure: process.env['COOKIE_SECURE'] === 'true', // in Prod auf true mit HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1h
      path: '/'
    },
  });

  server.use(sessionMiddleware);

  server.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    console.log('Request cookies:', req.headers.cookie);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
  });

  server.get('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await getOidcConfiguration();
      const redirectUri = process.env['BALLWARE_BASEURL'] + '/signin-oidc';

      if (!redirectUri) {
        throw new Error('OIDC_REDIRECT_URI nicht gesetzt');
      }

      // PKCE + state
      const codeVerifier = randomPKCECodeVerifier();
      const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
      const state = randomState();

      req.session.codeVerifier = codeVerifier;
      req.session.state = state;

      const authorizationUrl = buildAuthorizationUrl(config, {
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state
      });

      res.redirect(authorizationUrl.toString());
    } catch (err) {
      next(err);
    }
  });

  server.get('/signin-oidc', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await getOidcConfiguration();

      // Muss exakt der Redirect-URL entsprechen, die beim Provider registriert ist
      const callbackUrl = getFullUrl(req);

      if (!req.session.codeVerifier || !req.session.state) {
        throw new Error('PKCE- oder State-Informationen fehlen in der Session');
      }

      const tokenResponse = await authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: req.session.codeVerifier,
        expectedState: req.session.state
      });

      const claims = tokenResponse.claims ? tokenResponse.claims() : undefined;

      const roles =
        (claims as any)?.roles ||
        (claims as any)?.realm_access?.roles ||
        [];

      req.session.user = {
        sub: claims?.sub as string,
        //name: claims?.name as string | undefined,
        //email: claims?.email as string | undefined,
        roles: Array.isArray(roles) ? roles : [],
        rawClaims: (claims || {}) as Record<string, unknown>
      };

      req.session.tokens = {
        id_token: tokenResponse.id_token,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: new Date(Date.now() + (tokenResponse.expires_in ?? 0)).getTime()
      };

      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  });

  server.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session) {
        res.json({
          user: req.session.user
        });
      }
    } catch (err) {
      next(err);
    }
  });

  server.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await getOidcConfiguration();
      const postLogoutRedirectUri = process.env['POST_LOGOUT_REDIRECT_URI'] || '/';
      const idToken = req.session?.tokens?.id_token;

      req.session.destroy(async (err) => {
        if (err) {
          next(err);
          return;
        }

        const end_session_endpoint = config.serverMetadata().end_session_endpoint;

        if (end_session_endpoint && idToken) {
          const endSessionUrl = new URL(end_session_endpoint);
          endSessionUrl.searchParams.set('id_token_hint', idToken);
          endSessionUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);

          res.redirect(endSessionUrl.toString());
          return;
        }

        res.status(204).send();
      });
    } catch (err) {
      next(err);
    }
  });

  server.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files from /browser
  server.use(express.static(browserDistFolder));

  // All regular routes use the Angular engine
  server.get('{*splat}', redirectUnauthenticated, (req, res, next) => {
    const {protocol, originalUrl, baseUrl, headers} = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: BROWSER_REQUEST, useValue: req }
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });
  return server;
}
function run(): void {
  const port = process.env['PORT'] || 4000;
  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
run();
