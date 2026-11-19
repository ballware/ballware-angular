import * as path from 'path';
import { OverlayKind } from './overlay';

export interface MiddlewareRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  on?: (event: string, listener: (chunk: unknown) => void) => void;
}

export interface MiddlewareResponse {
  statusCode: number;
  setHeader?: (name: string, value: string) => void;
  end: (chunk?: unknown) => void;
}

export type MiddlewareNext = (err?: unknown) => void;

export const sendJson = (res: MiddlewareResponse, status: number, payload: unknown): void => {
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export const sendText = (res: MiddlewareResponse, status: number, payload: string): void => {
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'text/plain');
  res.end(payload);
};

export const readBody = (req: MiddlewareRequest): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!req.on) {
      resolve('');
      return;
    }

    let data = '';

    req.on('data', (chunk) => {
      data += (chunk as Buffer).toString();
    });

    req.on('end', () => {
      resolve(data);
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
};

export const parseUrl = (url: string|undefined): { pathname: string, segments: string[], query: URLSearchParams } => {
  const parsed = new URL(url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(parsed.pathname);

  return {
    pathname,
    segments: pathname.split('/').filter((segment) => segment.length > 0),
    query: parsed.searchParams
  };
};

export const parseAdditionalParams = (query: URLSearchParams): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  for (const [key, value] of query.entries()) {
    if (key === 'identifier' || key === 'id' || key === 'tenant') {
      continue;
    }

    if (key.endsWith('[]')) {
      const name = key.slice(0, -2);
      const existing = params[name];

      params[name] = Array.isArray(existing) ? [...existing as Array<unknown>, value] : [value];
    } else {
      params[key] = value;
    }
  }

  return params;
};

export const safeIdentifier = (value: string|undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value.includes('/') || value.includes('\\') || value.includes('..')) {
    return undefined;
  }

  return value;
};

export const fixturePath = (kind: OverlayKind | string, id: string, extension = 'json'): string => {
  return path.posix.join(kind, `${id}.${extension}`);
};
