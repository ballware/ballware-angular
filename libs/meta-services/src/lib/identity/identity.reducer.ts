import { createReducer, on } from "@ngrx/store";
import { IdentityState } from "./identity.state";
import { identityInitialize, identityUserLogin, identityUserLogout } from "./identity.actions";

const initialState = {

} as IdentityState;

export const identityReducer = createReducer(
    initialState, 
    on(identityInitialize, (state, { issuer, client, scopes, tenantClaim, usernameClaim, profileUrl }) => ({ 
        ...state,
        issuer, 
        client, 
        scopes, 
        tenantClaim, 
        usernameClaim, 
        profileUrl
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
        userName: undefined
    }))
);