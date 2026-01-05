import { Store } from "@ngrx/store";
import { IdentityService } from "@ballware/meta-services";
import {
  identityUserLogin,
} from './identity.actions';
import { selectAccessToken, selectAccessTokenExpiration, selectSessionExpiration, selectAllowedTenants, selectAuthenticated, selectCurrentUser, selectProfileUrl, selectUserName, selectUserTenant, selectAccessTokenAutoRefresh, selectIdToken } from "./identity.state";
import { IdentitySessionApi } from '@ballware/meta-api';

export class IdentitySessionServiceProxy implements IdentityService {

    constructor(private readonly store: Store, private readonly sessionApi: IdentitySessionApi) {

      sessionApi.current().subscribe((session) => {
        this.store.dispatch(identityUserLogin({
          idToken: 'static-user-id-token',
          refreshToken: 'static-user-refresh-token',
          accessToken: 'static-user-access-token',
          accessTokenExpiration: new Date(Date.now() + session.expiration),
          currentUser: session.user,
          tenant: session.tenant,
          userName: session.userName
        }));
      });
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
        // noop
    }

    public manageProfile() {
        // noop
    }

    public logout() {
        // noop
    }

    public expired() {
        // noop
    }

    public switchTenant(tenant: string): void {
        // noop
    }
}
