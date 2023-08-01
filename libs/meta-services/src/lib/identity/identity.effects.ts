import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
import { filter, switchMap, tap } from "rxjs";
import { identityInitialize, identityUserLogin, identityUserLoggedOut, identityUserLogout, identityManageProfile, identityRefreshToken } from "./identity.actions";
import { Store } from "@ngrx/store";
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

export const logoutOAuth = createEffect((actions$ = inject(Actions), oauthService = inject(OAuthService)) => 
    actions$.pipe(ofType(identityUserLogout))
        .pipe(tap(() => {
            oauthService.logOut();
        }))
, { functional: true, dispatch: false });

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
        .pipe(tap(() => {
            oauthService.refreshToken();
        }))
, { functional: true, dispatch: false });
