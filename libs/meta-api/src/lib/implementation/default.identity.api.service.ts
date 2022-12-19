import { Observable, of } from "rxjs";
import { IdentityApiService } from "../identity.api.service";
import { createIdentityBackendRoleApi, IdentityRoleApi } from "../role";
import { createIdentityBackendUserApi, IdentityUserApi } from "../user";

export class DefaultIdentityApiService implements IdentityApiService {
    constructor(protected baseUrl: string) {
        this.identityUserApiFactory$ = of(() => createIdentityBackendUserApi(baseUrl));
        this.identityRoleApiFactory$ = of(() => createIdentityBackendRoleApi(baseUrl));
    }

    identityUserApiFactory$: Observable<(() => IdentityUserApi)>;
    identityRoleApiFactory$: Observable<(() => IdentityRoleApi)>;
}
