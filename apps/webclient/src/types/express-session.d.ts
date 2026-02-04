import 'express-session';

declare module 'express-session' {
  interface SessionData {
    codeVerifier?: string;
    state?: string;
    user?: {
      sub: string;
      name?: string;
      email?: string;
      roles?: string[];
      rawClaims?: Record<string, unknown>;
    };
    tokens?: {
      id_token?: string;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    };
  }
}
