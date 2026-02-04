import { createReducer, on } from "@ngrx/store";
import {
  identityAllowedTenantsFetched,
  identityInitializeOidc,
  identityInitializeStaticUser,
  identityTokenRefreshed,
  identityUserBusy,
  identityUserIdle,
  identityUserLogin,
  identityUserLogout
} from './identity.actions';
import { IdentityState } from "./identity.state";
import moment from "moment";

const initialState = {

} as IdentityState;

export const identityReducer = createReducer(
    initialState,
    on(identityInitializeStaticUser, (state, { user, tenant, userName }) => ({
        ...state,
        authenticated: true,
        currentUser: user,
        tenant: tenant,
        userName: userName,
    })),
    on(identityInitializeOidc, (state, { issuer, client, scopes, tenantClaim, usernameClaim, profileUrl, accessTokenAutoRefresh }) => ({
        ...state,
        issuer,
        client,
        scopes,
        tenantClaim,
        usernameClaim,
        profileUrl,
        accessTokenAutoRefresh
    })),
    on(identityUserLogin, (state, { idToken, refreshToken, accessToken, accessTokenExpiration, currentUser, tenant, userName }) => ({
        ...state,
        authenticated: true,
        idToken,
        refreshToken,
        accessToken,
        accessTokenExpiration,
        currentUser,
        tenant,
        userName
    })),
    on(identityUserLogout, (state) => ({
        ...state,
        authenticated: false,
        idToken: undefined,
        refreshToken: undefined,
        accessToken: undefined,
        accessTokenExpiration: undefined,
        currentUser: undefined,
        tenant: undefined,
        userName: undefined,
        allowedTenants: undefined
    })),
    on(identityTokenRefreshed, (state, { idToken, refreshToken, accessToken, accessTokenExpiration }) => ({
        ...state,
        idToken,
        refreshToken,
        accessToken,
        accessTokenExpiration,
    })),
    on(identityUserIdle, (state) => ({
        ...state,
        sessionExpiration: moment(new Date()).add(2, 'm').toDate()
    })),
    on(identityUserBusy, (state) => ({
        ...state,
        sessionExpiration: undefined
    })),
    on(identityAllowedTenantsFetched, (state, { allowedTenants }) => ({
        ...state,
        allowedTenants
    }))
);
