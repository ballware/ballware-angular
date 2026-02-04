import { Store } from "@ngrx/store";
import { IdentityService } from "@ballware/meta-services";
import { identityInitializeOidc, identityManageProfile, identityRefreshToken, identitySwitchTenant, identityUserExpired, identityUserLogout } from "./identity.actions";
import { selectAccessToken, selectAccessTokenExpiration, selectSessionExpiration, selectAllowedTenants, selectAuthenticated, selectCurrentUser, selectProfileUrl, selectUserName, selectUserTenant, selectAccessTokenAutoRefresh, selectIdToken } from "./identity.state";
import { OidcIdentityConfig } from './identity.oidc.config';

export class IdentityOidcServiceProxy implements IdentityService {

    constructor(private readonly store: Store, config: OidcIdentityConfig) {
      this.store.dispatch(identityInitializeOidc({
        issuer: config.issuer,
        client: config.client,
        scopes: config.scopes,
        tenantClaim: config.tenantClaim,
        usernameClaim: config.usernameClaim,
        profileUrl: config.profileUrl,
        accessTokenAutoRefresh: config.accessTokenAutoRefresh
      }));
    }

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
