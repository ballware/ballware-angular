import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { Observable, catchError } from 'rxjs';

declare let window :any;

@Injectable({
  providedIn: 'root'
})
export class BearerTokenInterceptor implements HttpInterceptor {

  constructor(private authStorage: OAuthStorage, private errorHandler: OAuthResourceServerErrorHandler) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const url = req.url.toLowerCase();

    if (url.startsWith(window.ENV.BALLWARE_METAURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_IDENTITYURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_DOCUMENTURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_STORAGEURL.toLowerCase())
      || url.startsWith(window.ENV.BALLWARE_MLURL.toLowerCase())) {
        const token = this.authStorage.getItem('access_token');
        const header = 'Bearer ' + token;
        const headers = req.headers
                            .set('Authorization', header);

        req = req.clone({ headers });
    }

    return next.handle(req).pipe(catchError(err => this.errorHandler.handleError(err)));
  }
}
