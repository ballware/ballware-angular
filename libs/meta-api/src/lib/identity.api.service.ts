import { IdentityUserApi, IdentityRoleApi } from "./meta-api.module";

export abstract class IdentityApiService {
    abstract identityUserApi: IdentityUserApi;
    abstract identityRoleApi: IdentityRoleApi;
}