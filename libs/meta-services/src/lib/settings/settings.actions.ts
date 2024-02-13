import { createAction, props } from "@ngrx/store";

export const settingsInitialize = createAction('[Settings] Initialize', props<{
    version?: string,
    googlekey?: string,
    identityIssuer?: string,
    identityClient?: string,
    identityScopes?: string,
    identityTenantClaim?: string,
    identityUsernameClaim?: string,
    identityProfileUrl?: string
}>());