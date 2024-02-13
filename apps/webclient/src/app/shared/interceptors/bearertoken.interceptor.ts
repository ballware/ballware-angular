import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BearerTokenInterceptor implements HttpInterceptor {

  constructor(private authStorage: OAuthStorage, private errorHandler: OAuthResourceServerErrorHandler) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const url = req.url.toLowerCase();

    if (url.startsWith(environment.envVar.BALLWARE_METAURL.toLowerCase())
      || url.startsWith(environment.envVar.BALLWARE_IDENTITYURL.toLowerCase())) {
        const token = this.authStorage.getItem('access_token');
        const header = 'Bearer ' + token;
        const headers = req.headers
                            .set('Authorization', header);

        req = req.clone({ headers });
    }

    return next.handle(req).pipe(catchError(err => this.errorHandler.handleError(err)));
  }
}
