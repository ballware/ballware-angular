import { CompiledTenant, NavigationLayout, NavigationLayoutItem, Template } from "@ballware/meta-model";
import { Observable } from "rxjs";
import { InjectionToken } from "@angular/core";

export interface NavigationTreeItem {
    type: 'page'|'section'|'group';
    expanded?: false;
    disabled?: boolean;
    text?: string;
    icon?: string;
    url?: string;
    html?: string;
    items?: NavigationTreeItem[];    
}

export interface TenantService {

    tenant$: Observable<CompiledTenant|undefined>;
    title$: Observable<string|undefined>;
    navigationLayout$: Observable<NavigationLayout|undefined>;
    navigationTree$: Observable<NavigationTreeItem[]|undefined>;
    pages$: Observable<NavigationLayoutItem[]|undefined>;
    tenantTemplates$: Observable<Template[]|undefined>;
    hasRight$: Observable<((rights: string) => boolean) | undefined>;
}

export const TENANT_SERVICE = new InjectionToken<TenantService>('Tenant service');