import { CompiledTenant, NavigationLayout, NavigationLayoutItem } from "@ballware/meta-model";
import { Observable } from "rxjs";
import { WithDestroy } from "./withdestroy";

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

export abstract class TenantService extends WithDestroy() {

    public abstract tenant$: Observable<CompiledTenant|undefined>;
    public abstract title$: Observable<string|undefined>;
    public abstract navigationLayout$: Observable<NavigationLayout|undefined>;
    public abstract navigationTree$: Observable<NavigationTreeItem[]|undefined>;
    public abstract pages$: Observable<NavigationLayoutItem[]|undefined>;
    public abstract hasRight$: Observable<((rights: string) => boolean) | undefined>;
}