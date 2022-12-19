import { IdentityApiService } from "./identity.api.service";
import { MetaApiService } from "./meta.api.service";

export abstract class ApiServiceFactory {
    abstract createIdentityApi(): IdentityApiService;
    abstract createMetaApi(): MetaApiService;
}