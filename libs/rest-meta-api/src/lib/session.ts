import { IdentitySession, IdentitySessionApi } from '@ballware/meta-api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const fetchCurrentSession = (http: HttpClient) => (): Observable<IdentitySession> => {
  const url = `/me`;

  return http
    .get<IdentitySession>(url);
};

export function createSessionApi(
  httpClient: HttpClient
): IdentitySessionApi {
  return {
    current: fetchCurrentSession(httpClient)
  } as IdentitySessionApi;
}
