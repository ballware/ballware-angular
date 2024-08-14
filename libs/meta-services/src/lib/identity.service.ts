import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface IdentityService {
    
    profileUrl$: Observable<string|undefined>;

    authenticated$: Observable<boolean|undefined>;
    accessTokenExpiration$: Observable<Date|undefined>;

    currentUser$: Observable<Record<string, unknown>|undefined>;
    userTenant$: Observable<string|undefined>;
    userName$: Observable<string|undefined>;
    accessToken$: Observable<string|undefined>;

    allowedTenants$: Observable<Array<{ Id: string, Name: string }>|undefined>;

    initialize(issuer: string, client: string, scopes: string, tenantClaim: string, usernameClaim: string, profileUrl: string): void;

    refreshToken(): void;
    manageProfile(): void;
    logout(): void;
    expired(): void;
    switchTenant(tenant: string): void;
}

export const IDENTITY_SERVICE = new InjectionToken<IdentityService>('Identity service');