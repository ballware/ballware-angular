import { Store } from "@ngrx/store";
import { TenantService } from "../tenant.service";
import { selectHasRight, selectNavigationLayout, selectNavigationTree, selectPages, selectTemplates, selectTenant, selectTitle } from "./tenant.state";

export class TenantServiceProxy implements TenantService {
    constructor(private store: Store) {}

    public get tenant$() {
        return this.store.select(selectTenant);
    }

    public get title$() {
        return this.store.select(selectTitle);
    }

    public get navigationLayout$() {
        return this.store.select(selectNavigationLayout);
    }

    public get navigationTree$() {
        return this.store.select(selectNavigationTree);
    }

    public get pages$() {
        return this.store.select(selectPages);
    }

    public get tenantTemplates$() {
        return this.store.select(selectTemplates);
    }

    public get hasRight$() {
        return this.store.select(selectHasRight);
    }
}