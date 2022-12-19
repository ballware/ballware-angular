import { ApiServiceFactory } from "../api.service.factory";
import { IdentityApiService } from "../identity.api.service";
import { MetaApiService } from "../meta.api.service";
import { DefaultIdentityApiService } from "./default.identity.api.service";
import { DefaultMetaApiService } from "./default.meta.api.service";

export class DefaultApiServiceFactory extends ApiServiceFactory {
    constructor(private identityBaseUrl: string, private metaBaseUrl: string, private documentBaseUrl: string) {
        super();
    }

    createIdentityApi(): IdentityApiService {
        return new DefaultIdentityApiService(this.identityBaseUrl);
    }
    
    createMetaApi(): MetaApiService {
        return new DefaultMetaApiService(this.metaBaseUrl, this.documentBaseUrl);
    }
}