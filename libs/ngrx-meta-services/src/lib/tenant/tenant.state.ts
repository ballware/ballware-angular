import { CompiledTenant, NavigationLayout, NavigationLayoutItem, Template } from "@ballware/meta-model";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { NavigationTreeItem } from "@ballware/meta-services";

export const tenantFeatureKey = "tenant";

export interface TenantState {
    tenant?: CompiledTenant,
    title?: string,
    navigationLayout?: NavigationLayout,
    navigationTree?: NavigationTreeItem[],
    pages?: NavigationLayoutItem[],
    templates?: Template[],
    hasRight?: (rights: string) => boolean
}

const selectTenantFeature = createFeatureSelector<TenantState>(tenantFeatureKey);

export const selectTenant = createSelector(selectTenantFeature, (state: TenantState) => state.tenant);
export const selectTitle = createSelector(selectTenantFeature, (state: TenantState) => state.title);
export const selectNavigationLayout = createSelector(selectTenantFeature, (state: TenantState) => state.navigationLayout);
export const selectNavigationTree = createSelector(selectTenantFeature, (state: TenantState) => state.navigationTree);
export const selectPages = createSelector(selectTenantFeature, (state: TenantState) => state.pages);
export const selectTemplates = createSelector(selectTenantFeature, (state: TenantState) => state.templates);
export const selectHasRight = createSelector(selectTenantFeature, (state: TenantState) => state.hasRight);
