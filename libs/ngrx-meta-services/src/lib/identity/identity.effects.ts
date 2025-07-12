import { inject } from "@angular/core";
import { IDENTITY_USER_API, META_TENANT_API } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
import { filter, switchMap, tap } from "rxjs";
import { showNotification } from "../notification/notification.actions";
import { identityAllowedTenantsFetched, identityInitialize, identityManageProfile, identityRefreshToken, identitySwitchTenant, identityTokenRefreshed, identityUserBusy, identityUserExpired, identityUserIdle, identityUserLoggedOut, identityUserLogin, identityUserLogout } from "./identity.actions";
import { selectCurrentUser, selectProfileUrl } from "./identity.state";
import { IDLE_SERVICE, TRANSLATOR } from "@ballware/meta-services";

export const initializeOAuth = createEffect((actions$ = inject(Actions), store = inject(Store), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityInitialize))
        .pipe(tap(({ issuer, client, scopes, tenantClaim, usernameClaim, accessTokenAutoRefresh }) => {
            if (issuer && client && scopes && tenantClaim && usernameClaim) { 
                oauthService.events
                    .pipe(filter((e) => e.type === 'logout'))
                    .subscribe((_) => {
                        store.dispatch(identityUserLoggedOut());
                    });

                oauthService.events
                    .pipe(filter((e) => e.type === 'user_profile_loaded'))
                    .subscribe((_) => {
                        oauthService.loadUserProfile().then(_ => {
                            const identityClaims = oauthService.getIdentityClaims() as Record<string, unknown>;

                            store.dispatch(identityUserLogin({
                                idToken: oauthService.getIdToken(),
                                refreshToken: oauthService.getRefreshToken(),
                                accessToken: oauthService.getAccessToken(),
                                accessTokenExpiration: new Date(oauthService.getAccessTokenExpiration()),                        
                                currentUser: identityClaims,
                                tenant: identityClaims[tenantClaim] as string,
                                userName: identityClaims[usernameClaim] as string
                            }));
                        });
                    });

                oauthService.events
                    .pipe(filter((e) => e.type === 'token_received'))
                    .subscribe((_) => {
                        store.dispatch(identityTokenRefreshed({
                            idToken: oauthService.getIdToken(),
                            refreshToken: oauthService.getRefreshToken(),
                            accessToken: oauthService.getAccessToken(),
                            accessTokenExpiration: new Date(oauthService.getAccessTokenExpiration())
                        }));
                    });

                const oauthConfig: AuthConfig = {
                    issuer: issuer,
                    redirectUri: window.location.origin + '/signin-oidc',
                    postLogoutRedirectUri: window.location.origin,
                    clientId: client,
                    responseType: 'code',
                    scope: scopes,
                    showDebugInformation: true,
                    oidc: true
                };

                oauthService.configure(oauthConfig);

                if (accessTokenAutoRefresh) {
                    oauthService.setupAutomaticSilentRefresh();
                }
                
                oauthService.loadDiscoveryDocumentAndLogin().then(result => {
                    if (result) {
                        const identityClaims = oauthService.getIdentityClaims() as Record<string, unknown>;

                        store.dispatch(identityUserLogin({
                            idToken: oauthService.getIdToken(),
                            refreshToken: oauthService.getRefreshToken(),
                            accessToken: oauthService.getAccessToken(),
                            accessTokenExpiration: new Date(oauthService.getAccessTokenExpiration()),                        
                            currentUser: identityClaims,
                            tenant: identityClaims[tenantClaim] as string,
                            userName: identityClaims[usernameClaim] as string
                        }));
                    }
                });
            }
        }))
, { functional: true, dispatch: false });

export const notifyUserLogin = createEffect((actions$ = inject(Actions), store = inject(Store), translator = inject(TRANSLATOR)) => 
    actions$.pipe((ofType(identityUserLogin)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translator('rights.notifications.loginsuccess') }}))))
, { functional: true, dispatch: false});

export const logoutOAuth = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityUserLogout))
        .pipe(tap(() => {
            oauthService.logOut();
        }))
, { functional: true, dispatch: false });

export const userExpired = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService), store = inject(Store), translator = inject(TRANSLATOR)) => 
    actions$.pipe((ofType(identityUserExpired)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translator('rights.notifications.sessionexpired') }}))))
        .pipe(tap(() => {
            oauthService.logOut();
        }))
, { functional: true, dispatch: false});

export const userIdle = createEffect((store = inject(Store), idleService = inject(IDLE_SERVICE)) => 
    idleService.idle$
        .pipe(filter((idle => idle)))
        .pipe(tap(() => store.dispatch(identityUserIdle())))
, { functional: true, dispatch: false});        

export const userBusy = createEffect((store = inject(Store), idleService = inject(IDLE_SERVICE)) => 
    idleService.idle$
        .pipe(filter((idle => !idle)))
        .pipe(tap(() => store.dispatch(identityUserBusy())))
, { functional: true, dispatch: false});  

export const manageProfile = createEffect((actions$ = inject(Actions), store = inject(Store)) => 
    actions$.pipe(ofType(identityManageProfile))
        .pipe(switchMap(() => store.select(selectProfileUrl)))        
        .pipe(tap((identityProfileUrl) => {
            if (identityProfileUrl) {
                window.location.href = identityProfileUrl;
            }
        }))
, { functional: true, dispatch: false });

export const refreshToken = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityRefreshToken))
        .pipe(tap(() => oauthService.refreshToken()))
, { functional: true, dispatch: false });

export const fetchAllowedTenants = createEffect((actions$ = inject(Actions), store = inject(Store), metaTenantApi = inject(META_TENANT_API)) =>
    actions$.pipe((ofType(identityUserLogin)))
        .pipe(switchMap(() => metaTenantApi.allowed()))
        .pipe(tap((allowedTenants) => store.dispatch(identityAllowedTenantsFetched({ allowedTenants }))))
, { functional: true, dispatch: false });

export const switchTenant = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService), store = inject(Store), identityUserApi = inject(IDENTITY_USER_API), translator = inject(TRANSLATOR)) =>
    actions$.pipe((ofType(identitySwitchTenant)))
        .pipe(switchMap(({ tenant }) => identityUserApi.switchTenant(tenant)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translator('rights.notifications.logoutfortenantswitch') }}))))
        .pipe(tap(() => {
            oauthService.initLoginFlow();
        }))
, { functional: true, dispatch: false });