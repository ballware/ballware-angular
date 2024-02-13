import { NavigationLayout, NavigationLayoutItem } from "@ballware/meta-model";
import { createReducer, on } from "@ngrx/store";
import { NavigationTreeItem } from "../tenant.service";
import { tenantFetched } from "./tenant.actions";
import { TenantState } from "./tenant.state";

export const initialState = {
    
} as TenantState;


export const buildNavigationTree = (hasRight: (right: string) => boolean, navigation: NavigationLayout): NavigationTreeItem[] => {

    const collectAllowedItems = (items: NavigationLayoutItem[]): NavigationTreeItem[] => {
      const mappedItems = [] as NavigationTreeItem[];
  
      items?.forEach(item => {
        if (item.type === 'page' && item.options?.page) {
          const pageVisible = hasRight(`generic.page.${item.options.page}`);
  
          if (pageVisible) {
            mappedItems.push({
              type: 'page',
              text: item.options?.caption,
              icon: item.options?.icon,
              url: `/page/${item.options.url}`
            });
          }
        } else if (item.type === 'section' && item.items) {
          const subItems = collectAllowedItems(item.items);
            
          if (subItems.length > 0) {
            /*
            if (mappedItems.length > 0) {
              mappedItems.push({
                type: 'section',
                html: '<hr/>',
                disabled: true
              });
            }
            */
  
            mappedItems.push(...subItems);
          }          
        } else if (item.type === 'group' && item.items) {
          const subItems = collectAllowedItems(item.items);
  
          if (subItems.length > 0) {
            mappedItems.push({
              expanded: false,
              type: 'group',
              text: item.options?.caption,
              icon: item.options?.icon,
              items: subItems
            });
          }
        }
      });
  
      return mappedItems;
    }
  
    return collectAllowedItems(navigation?.items ?? []);
  }
  
  export const buildPageList = (hasRight: (right: string) => boolean, navigation: NavigationLayout): NavigationLayoutItem[] => {
  
    const collectPages = (items: NavigationLayoutItem[]): NavigationLayoutItem[] => {
      const pages = [] as NavigationLayoutItem[];
  
      items?.forEach(item => {
        if (item.type === 'page' && item.options?.page) {
          const pageVisible = hasRight(`generic.page.${item.options.page}`);
  
          if (pageVisible) {
            pages.push(item);
          }
        } else if ((item.type === 'section' || item.type === 'group') && item.items) {
          pages.push(...collectPages(item.items));
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
        hasRight: tenant?.hasRight ? (right) => tenant.hasRight(user, right) : undefined,
        navigationLayout: tenant?.navigation,
        navigationTree: tenant?.navigation ? buildNavigationTree((right) => tenant?.hasRight(user, right), tenant?.navigation) : undefined,
        pages: tenant?.navigation ? buildPageList((right) => tenant?.hasRight(user, right), tenant.navigation) : undefined,
        templates: tenant?.templates ?? []
    }))    
);