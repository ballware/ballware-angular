import { createAction, props } from "@ngrx/store";

export const identityInitialize = createAction('[Identity] initialize', props<{
    issuer?: string,
    client?: string,
    scopes?: string,
    tenantClaim?: string,
    usernameClaim?: string,
    profileUrl?: string
}>());

export const identityUserLogin = createAction('[Identity] user login', props<{
    refreshToken: string,
    accessToken: string,
    accessTokenExpiration: Date,

    currentUser: Record<string, unknown>,
    tenant: string,
    userName: string
}>());

export const identityUserLogout = createAction('[Identity] user logout');

export const identityUserLoggedOut = createAction('[Identity] user logged out');

export const identityUserExpired = createAction('[Identity] user expired');

export const identityManageProfile = createAction('[Identity] manage profile');

export const identityRefreshToken = createAction('[Identity] refresh token');
