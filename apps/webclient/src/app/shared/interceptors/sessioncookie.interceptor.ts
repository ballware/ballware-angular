import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Request } from 'express';

export const BROWSER_REQUEST = new InjectionToken<Request>('BROWSER_REQUEST');

export function SessionCookieInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  const platformId = inject(PLATFORM_ID);
  const browserRequest = inject(BROWSER_REQUEST);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  if (!browserRequest) {
    return next(req);
  }

  const cookie = browserRequest.headers?.cookie;
  if (!cookie) {
    return next(req);
  }

  const reqWithCookie = req.clone({
    setHeaders: {
      cookie,
    },
  });

  return next(reqWithCookie);
}

