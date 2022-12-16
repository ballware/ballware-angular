import { Observable } from "rxjs";
import { IdentityUserApi, IdentityRoleApi } from "./meta-api.module";

export abstract class IdentityApiService {
    abstract identityUserApiFactory$: Observable<(() => IdentityUserApi)>;
    abstract identityRoleApiFactory$: Observable<(() => IdentityRoleApi)>;
}