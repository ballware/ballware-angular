import { Store } from "@ngrx/store";
import { IdentityService } from "../identity.service";
import { identityInitialize, identityManageProfile, identityRefreshToken, identitySwitchTenant, identityUserExpired, identityUserLogout } from "./identity.actions";
import { selectAccessToken, selectAccessTokenExpiration, selectAllowedTenants, selectAuthenticated, selectCurrentUser, selectProfileUrl, selectUserName, selectUserTenant } from "./identity.state";

export class IdentityServiceProxy implements IdentityService {

    constructor(private store: Store) {}
    
    public readonly profileUrl$ = this.store.select(selectProfileUrl);
    public readonly authenticated$ = this.store.select(selectAuthenticated);

    public get accessTokenExpiration$() {
        return this.store.select(selectAccessTokenExpiration);
    }

    public get currentUser$() {
        return this.store.select(selectCurrentUser);
    }

    public get userTenant$() {
        return this.store.select(selectUserTenant);
    }

    public get userName$() {
        return this.store.select(selectUserName);
    }

    public get accessToken$() {
        return this.store.select(selectAccessToken);
    }

    public get allowedTenants$() {
        return this.store.select(selectAllowedTenants);
    }

    public initialize(issuer: string, client: string, scopes: string, tenantClaim: string, usernameClaim: string, profileUrl: string) {
        this.store.dispatch(identityInitialize({
            issuer, client, scopes, tenantClaim, usernameClaim, profileUrl
        }));
    }

    public refreshToken() {
        this.store.dispatch(identityRefreshToken());
    }

    public manageProfile() {
        this.store.dispatch(identityManageProfile());
    }

    public logout() {
        this.store.dispatch(identityUserLogout());
    }

    public expired() {
        this.store.dispatch(identityUserExpired());
    }

    public switchTenant(tenant: string): void {
        this.store.dispatch(identitySwitchTenant({ tenant }));
    }
}