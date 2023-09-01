import { HttpClient } from "@angular/common/http";
import { ApiServiceFactory } from "../api.service.factory";
import { IdentityApiService } from "../identity.api.service";
import { MetaApiService } from "../meta.api.service";
import { DefaultIdentityApiService } from "./default.identity.api.service";
import { DefaultMetaApiService } from "./default.meta.api.service";

export class DefaultApiServiceFactory extends ApiServiceFactory {
    constructor(private httpClient: HttpClient, private identityBaseUrl: string, private metaBaseUrl: string, private documentBaseUrl: string) {
        super();
    }

    createIdentityApi(): IdentityApiService {
        return new DefaultIdentityApiService(this.httpClient, this.identityBaseUrl);
    }
    
    createMetaApi(): MetaApiService {
        return new DefaultMetaApiService(this.httpClient, this.metaBaseUrl, this.documentBaseUrl);
    }
}