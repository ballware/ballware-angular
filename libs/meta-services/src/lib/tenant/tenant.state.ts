import { CompiledTenant, NavigationLayout, NavigationLayoutItem } from "@ballware/meta-model";
import { createFeatureSelector, createSelector } from "@ngrx/store";

export const tenantFeatureKey = "tenant";

export interface TenantState {
    tenant?: CompiledTenant,
    title?: string,
    navigationLayout?: NavigationLayout,
    navigationTree?: Record<string, unknown>[],
    pages?: NavigationLayoutItem[],
    hasRight?: (rights: string) => boolean
}

const selectTenantFeature = createFeatureSelector<TenantState>(tenantFeatureKey);

export const selectTenant = createSelector(selectTenantFeature, (state: TenantState) => state.tenant);
export const selectTitle = createSelector(selectTenantFeature, (state: TenantState) => state.title);
export const selectNavigationLayout = createSelector(selectTenantFeature, (state: TenantState) => state.navigationLayout);
export const selectNavigationTree = createSelector(selectTenantFeature, (state: TenantState) => state.navigationTree);
export const selectPages = createSelector(selectTenantFeature, (state: TenantState) => state.pages);
export const selectHasRight = createSelector(selectTenantFeature, (state: TenantState) => state.hasRight);
