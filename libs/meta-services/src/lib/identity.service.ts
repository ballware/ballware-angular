import { Observable } from "rxjs";
import { WithDestroy } from "./withdestroy";

export abstract class IdentityService extends WithDestroy() {
    
    public abstract profileUrl$: Observable<string|undefined>;

    public abstract authenticated$: Observable<boolean|undefined>;
    public abstract accessTokenExpiration$: Observable<Date|undefined>;

    public abstract currentUser$: Observable<Record<string, unknown>|undefined>;
    public abstract userTenant$: Observable<string|undefined>;
    public abstract userName$: Observable<string|undefined>;

    public abstract initialize(issuer: string, client: string, scopes: string, tenantClaim: string, usernameClaim: string, profileUrl: string): void;

    public abstract refreshToken(): void;
    public abstract manageProfile(): void;
    public abstract logout(): void;
}