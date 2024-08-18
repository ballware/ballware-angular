import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { catchError } from 'rxjs';

declare let window :any;

export function BearerTokenInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {

    const authStorage = inject(OAuthStorage);
    const errorHandler = inject(OAuthResourceServerErrorHandler);

    const url = req.url.toLowerCase();

    if (url.startsWith(window.ENV.BALLWARE_METAURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_IDENTITYURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_DOCUMENTURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_STORAGEURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_MLURL.toLowerCase())) {
        const token = authStorage.getItem('access_token');
        const header = 'Bearer ' + token;
        const headers = req.headers
                            .set('Authorization', header);

        req = req.clone({ headers });
    }

    return next(req).pipe(catchError(err => errorHandler.handleError(err)));
}

