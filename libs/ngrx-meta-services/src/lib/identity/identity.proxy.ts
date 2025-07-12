import { Store } from "@ngrx/store";
import { IdentityService } from "@ballware/meta-services";
import { identityInitialize, identityManageProfile, identityRefreshToken, identitySwitchTenant, identityUserExpired, identityUserLogout } from "./identity.actions";
import { selectAccessToken, selectAccessTokenExpiration, selectSessionExpiration, selectAllowedTenants, selectAuthenticated, selectCurrentUser, selectProfileUrl, selectUserName, selectUserTenant, selectAccessTokenAutoRefresh, selectIdToken } from "./identity.state";

export class IdentityServiceProxy implements IdentityService {

    constructor(private store: Store) {}
    
    public readonly profileUrl$ = this.store.select(selectProfileUrl);
    public readonly authenticated$ = this.store.select(selectAuthenticated);

    public get accessTokenExpiration$() {
        return this.store.select(selectAccessTokenExpiration);
    }

    public get accessTokenAutoRefresh$() {
        return this.store.select(selectAccessTokenAutoRefresh);
    }

    public get sessionExpiration$() {
        return this.store.select(selectSessionExpiration);
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

    public get idToken$() {
        return this.store.select(selectIdToken);
    }

    public get accessToken$() {
        return this.store.select(selectAccessToken);
    }

    public get allowedTenants$() {
        return this.store.select(selectAllowedTenants);
    }

    public initialize(issuer: string, client: string, scopes: string, tenantClaim: string, usernameClaim: string, profileUrl: string, accessTokenAutoRefresh: boolean) {
        this.store.dispatch(identityInitialize({
            issuer, client, scopes, tenantClaim, usernameClaim, profileUrl, accessTokenAutoRefresh
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