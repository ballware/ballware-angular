import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface IdentitySession {
  user: Record<string, unknown>;
  userName: string;
  tenant: string;
  expiration: number;
}

export interface IdentitySessionApi {
  current: () => Observable<IdentitySession>;
}

export const IDENTITY_SESSION_API = new InjectionToken<IdentitySessionApi>('Identity session api');
