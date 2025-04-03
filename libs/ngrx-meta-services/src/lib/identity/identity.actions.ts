import { createAction, props } from "@ngrx/store";

export const identityInitialize = createAction('[Identity] initialize', props<{
    issuer?: string,
    client?: string,
    scopes?: string,
    tenantClaim?: string,
    usernameClaim?: string,
    profileUrl?: string,
    accessTokenAutoRefresh?: boolean
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

export const identityUserIdle = createAction('[Identity] user idle');
export const identityUserBusy = createAction('[Identity] user busy');

export const identityManageProfile = createAction('[Identity] manage profile');

export const identityRefreshToken = createAction('[Identity] refresh token');

export const identityTokenRefreshed = createAction('[Identity] token refreshed', props<{
    refreshToken: string,
    accessToken: string,
    accessTokenExpiration: Date,
}>());

export const identityAllowedTenantsFetched = createAction('[Identity] allowed tenants fetched', props<{
    allowedTenants: Array<Record<string, unknown>>
}>());

export const identitySwitchTenant = createAction('[Identity] switch tenant', props<{
    tenant: string
}>());