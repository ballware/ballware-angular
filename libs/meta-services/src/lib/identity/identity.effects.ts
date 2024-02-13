import { inject } from "@angular/core";
import { IdentityApiService, MetaApiService } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { I18NextPipe } from "angular-i18next";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
import { filter, switchMap, tap } from "rxjs";
import { showNotification } from "../notification/notification.actions";
import { identityAllowedTenantsFetched, identityInitialize, identityManageProfile, identityRefreshToken, identitySwitchTenant, identityUserExpired, identityUserLoggedOut, identityUserLogin, identityUserLogout } from "./identity.actions";
import { selectProfileUrl } from "./identity.state";

export const initializeOAuth = createEffect((actions$ = inject(Actions), store = inject(Store), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityInitialize))
        .pipe(tap(({ issuer, client, scopes, tenantClaim, usernameClaim }) => {
            if (issuer && client && scopes && tenantClaim && usernameClaim) { 
                oauthService.events
                    .pipe(filter((e) => e.type === 'logout'))
                    .subscribe((_) => {
                        store.dispatch(identityUserLoggedOut());
                    });

                oauthService.events
                    .pipe(filter((e) => e.type === 'token_received'))
                    .subscribe((_) => {
                        oauthService.loadUserProfile().then(_ => {
                            const identityClaims = oauthService.getIdentityClaims() as Record<string, unknown>;

                            store.dispatch(identityUserLogin({
                                refreshToken: oauthService.getRefreshToken(),
                                accessToken: oauthService.getAccessToken(),
                                accessTokenExpiration: new Date(oauthService.getAccessTokenExpiration()),                        
                                currentUser: identityClaims,
                                tenant: identityClaims[tenantClaim] as string,
                                userName: identityClaims[usernameClaim] as string
                            }));
                        });
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
                oauthService.loadDiscoveryDocumentAndLogin().then(result => {
                    if (result) {
                        const identityClaims = oauthService.getIdentityClaims() as Record<string, unknown>;

                        store.dispatch(identityUserLogin({
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

export const notifyUserLogin = createEffect((actions$ = inject(Actions), store = inject(Store), translationPipe = inject(I18NextPipe)) => 
    actions$.pipe((ofType(identityUserLogin)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translationPipe.transform('rights.notifications.loginsuccess') }}))))
, { functional: true, dispatch: false});

export const logoutOAuth = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityUserLogout))
        .pipe(tap(() => {
            oauthService.logOut();
        }))
, { functional: true, dispatch: false });

export const userExpired = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService), store = inject(Store), translationPipe = inject(I18NextPipe)) => 
    actions$.pipe((ofType(identityUserExpired)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translationPipe.transform('rights.notifications.sessionexpired') }}))))
        .pipe(tap(() => {
            oauthService.initLoginFlow();
        }))
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

export const fetchAllowedTenants = createEffect((actions$ = inject(Actions), store = inject(Store), metaApiService = inject(MetaApiService)) =>
    actions$.pipe((ofType(identityUserLogin)))
        .pipe(switchMap(() => metaApiService.metaTenantApi.allowed()))
        .pipe(tap((allowedTenants) => store.dispatch(identityAllowedTenantsFetched({ allowedTenants }))))
, { functional: true, dispatch: false });

export const switchTenant = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService), store = inject(Store), identityApiService = inject(IdentityApiService), translationPipe = inject(I18NextPipe)) =>
    actions$.pipe((ofType(identitySwitchTenant)))
        .pipe(switchMap(({ tenant }) => identityApiService.identityUserApi.switchTenantFunc(tenant)))
        .pipe(tap(() => store.dispatch(showNotification({ notification: { severity: 'info', message: translationPipe.transform('rights.notifications.logoutfortenantswitch') }}))))
        .pipe(tap(() => {
            oauthService.initLoginFlow();
        }))
, { functional: true, dispatch: false });