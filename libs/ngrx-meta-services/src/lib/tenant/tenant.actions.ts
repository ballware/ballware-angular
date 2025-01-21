import { CompiledTenant } from "@ballware/meta-model";
import { createAction, props } from "@ngrx/store";

export const tenantChanged = createAction('[Tenant] changed', props<{
    tenant: string
}>());

export const tenantFetched = createAction('[Tenant] fetched', props<{
    user: Record<string, unknown>,
    tenant: CompiledTenant
}>());