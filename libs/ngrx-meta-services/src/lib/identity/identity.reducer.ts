import { createReducer, on } from "@ngrx/store";
import { identityAllowedTenantsFetched, identityInitialize, identityTokenRefreshed, identityUserBusy, identityUserIdle, identityUserLogin, identityUserLogout } from "./identity.actions";
import { IdentityState } from "./identity.state";
import * as moment from "moment";

const initialState = {

} as IdentityState;

export const identityReducer = createReducer(
    initialState, 
    on(identityInitialize, (state, { issuer, client, scopes, tenantClaim, usernameClaim, profileUrl, accessTokenAutoRefresh }) => ({ 
        ...state,
        issuer, 
        client, 
        scopes, 
        tenantClaim, 
        usernameClaim, 
        profileUrl,
        accessTokenAutoRefresh
    })),
    on(identityUserLogin, (state, { refreshToken, accessToken, accessTokenExpiration, currentUser, tenant, userName }) => ({
        ...state,
        authenticated: true,
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
        refreshToken: undefined,
        accessToken: undefined, 
        accessTokenExpiration: undefined,
        currentUser: undefined,
        tenant: undefined,
        userName: undefined,
        allowedTenants: undefined
    })),
    on(identityTokenRefreshed, (state, { refreshToken, accessToken, accessTokenExpiration }) => ({
        ...state,
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