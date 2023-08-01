import { createReducer, on } from "@ngrx/store";
import { TenantState } from "./tenant.state";
import { tenantFetched } from "./tenant.actions";
import { NavigationLayout, NavigationLayoutItem } from "@ballware/meta-model";

const initialState = {
    
} as TenantState;

const buildNavigationTree = (hasRight: (right: string) => boolean, navigation: NavigationLayout): Record<string, unknown>[] => {

    const collectAllowedItems = (items: NavigationLayoutItem[]): Record<string, unknown>[] => {
      const mappedItems = [] as Record<string, unknown>[];
  
      items?.forEach(item => {
        if (item.type === 'page' && item.options?.page) {
          const pageVisible = hasRight(`generic.page.${item.options.page ?? 'unknown'}`);
  
          if (pageVisible) {
            mappedItems.push({
              type: 'page',
              text: item.options?.caption,
              icon: item.options?.icon ?? 'file',
              path: `/page/${item.options.url}`
            });
          }
        } else if (item.type === 'section') {
          const subItems = collectAllowedItems(item.items ?? []);
  
          if (subItems.length > 0) {
            if (mappedItems.length > 0) {
              mappedItems.push({
                type: 'section',
                html: '<hr/>',
                disabled: true
              });
            }
  
            mappedItems.push(...subItems);
          }
        } else if (item.type === 'group') {
          const subItems = collectAllowedItems(item.items ?? []);
  
          if (subItems.length > 0) {
            mappedItems.push({
              type: 'group',
              text: item.options?.caption,
              icon: 'folder',
              items: subItems
            });
          }
        }
      });
  
      return mappedItems;
    }
  
    return collectAllowedItems(navigation?.items ?? []);
  }
  
  const buildPageList = (hasRight: (right: string) => boolean, navigation: NavigationLayout): NavigationLayoutItem[] => {
  
    const collectPages = (items: NavigationLayoutItem[]): NavigationLayoutItem[] => {
      const pages = [] as NavigationLayoutItem[];
  
      items?.forEach(item => {
        if (item.type === 'page' && item.options?.page) {
          const pageVisible = hasRight(`generic.page.${item.options.page ?? 'unknown'}`);
  
          if (pageVisible) {
            pages.push(item);
          }
        } else if (item.type === 'section' || item.type === 'group') {
          pages.push(...collectPages(item.items ?? []));
        }
      });
  
      return pages;
    }
  
    return collectPages(navigation?.items ?? []);
  }
  

export const tenantReducer = createReducer(
    initialState,     
    on(tenantFetched, (state, { user, tenant }) => ({
        ...state,
        tenant,
        title: tenant?.name,
        hasRight: (right) => tenant?.hasRight(user, right),
        navigationLayout: tenant?.navigation,
        navigationTree: tenant?.navigation ? buildNavigationTree((right) => tenant?.hasRight(user, right), tenant?.navigation) : undefined,
        pages: tenant?.navigation ? buildPageList((right) => tenant?.hasRight(user, right), tenant.navigation) : undefined        
    }))    
);