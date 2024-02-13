import { CompiledTenant } from "@ballware/meta-model";
import { createAction, props } from "@ngrx/store";

export const tenantFetched = createAction('[Tenant] fetched', props<{
    user: Record<string, unknown>,
    tenant: CompiledTenant
}>());