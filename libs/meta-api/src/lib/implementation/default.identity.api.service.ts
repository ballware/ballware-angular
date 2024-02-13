import { IdentityApiService } from "../identity.api.service";
import { createIdentityBackendRoleApi, IdentityRoleApi } from "../role";
import { createIdentityBackendUserApi, IdentityUserApi } from "../user";
import { HttpClient } from "@angular/common/http";

export class DefaultIdentityApiService implements IdentityApiService {
    constructor(protected httpClient: HttpClient, protected baseUrl: string) {
        this.identityUserApi = createIdentityBackendUserApi(httpClient, baseUrl);
        this.identityRoleApi = createIdentityBackendRoleApi(httpClient, baseUrl);
    }

    identityUserApi: IdentityUserApi;
    identityRoleApi: IdentityRoleApi;
}
