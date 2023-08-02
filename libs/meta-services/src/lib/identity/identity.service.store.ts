import { Store } from "@ngrx/store";
import { IdentityService } from "../identity.service";
import { selectAccessTokenExpiration, selectAuthenticated, selectCurrentUser, selectProfileUrl, selectUserName, selectUserTenant } from "./identity.state";
import { identityInitialize, identityManageProfile, identityRefreshToken, identityUserLogout } from "./identity.actions";

export class IdentityServiceStore extends IdentityService {

    constructor(private store: Store) {
        super();
    }
    
    public get profileUrl$() {
        return this.store.select(selectProfileUrl);
    }

    public get authenticated$() {
        return this.store.select(selectAuthenticated);
    }

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
}