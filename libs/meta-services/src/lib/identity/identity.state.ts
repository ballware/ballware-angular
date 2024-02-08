import { createFeatureSelector, createSelector } from "@ngrx/store";

export const identityFeatureKey = "identity";

export interface IdentityState {
    issuer?: string,
    client?: string,
    scopes?: string,
    tenantClaim?: string,
    usernameClaim?: string,
    profileUrl?: string,

    authenticated?: boolean,
    refreshToken?: string,
    accessToken?: string,
    accessTokenExpiration?: Date,

    currentUser?: Record<string, unknown>,
    tenant?: string,
    userName?: string

    allowedTenants?: Array<{ Id: string, Name: string }>;
}

const selectIdentityFeature = createFeatureSelector<IdentityState>(identityFeatureKey);

export const selectIssuer = createSelector(selectIdentityFeature, (state: IdentityState) => state.issuer);
export const selectClient = createSelector(selectIdentityFeature, (state: IdentityState) => state.client);
export const selectScopes = createSelector(selectIdentityFeature, (state: IdentityState) => state.scopes);
export const selectTenantClaim = createSelector(selectIdentityFeature, (state: IdentityState) => state.tenantClaim);
export const selectUsernameClaim = createSelector(selectIdentityFeature, (state: IdentityState) => state.usernameClaim);
export const selectProfileUrl = createSelector(selectIdentityFeature, (state: IdentityState) => state.profileUrl);

export const selectAllowedTenants = createSelector(selectIdentityFeature, (state: IdentityState) => state.allowedTenants);

export const selectAuthenticated = createSelector(selectIdentityFeature, (state: IdentityState) => state.authenticated);
export const selectUserTenant = createSelector(selectIdentityFeature, (state: IdentityState) => state.tenant);
export const selectUserName = createSelector(selectIdentityFeature, (state: IdentityState) => state.userName);
export const selectAccessToken = createSelector(selectIdentityFeature, (state: IdentityState) => state.accessToken);
export const selectCurrentUser = createSelector(selectIdentityFeature, (state: IdentityState) => state.currentUser);
export const selectAccessTokenExpiration = createSelector(selectIdentityFeature, (state: IdentityState) => state.accessTokenExpiration);