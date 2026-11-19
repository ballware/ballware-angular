import { MiddlewareRequest } from '../http';

export class MockResponse {
  statusCode = 200;
  headers: Record<string, string> = {};
  body = '';
  ended = false;

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  end(chunk?: unknown): void {
    this.body = chunk == null ? '' : chunk.toString();
    this.ended = true;
  }

  get json(): Record<string, unknown> | Array<Record<string, unknown>> {
    return JSON.parse(this.body) as Record<string, unknown> | Array<Record<string, unknown>>;
  }
}

export const createRequest = (
  method: string,
  url: string,
  body?: string
): MiddlewareRequest => {
  const listeners: Record<string, Array<(chunk: unknown) => void>> = {};

  return {
    method,
    url,
    headers: {},
    on: (event: string, listener: (chunk: unknown) => void): void => {
      (listeners[event] ??= []).push(listener);

      if (event === 'data' && body !== undefined) {
        listener(Buffer.from(body));
      }

      if (event === 'end') {
        listener('');
      }
    }
  };
};
