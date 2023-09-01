import { HttpClient } from "@angular/common/http";
import { MetaAttachmentApi, createMetaBackendAttachmentApi } from "../attachment";
import { MetaDocumentApi, createMetaBackendDocumentApi } from "../document";
import { MetaDocumentationApi, createMetaBackendDocumentationApi } from "../documentation";
import { MetaEntityApi, createMetaBackendEntityApi } from "../entity";
import { MetaGenericEntityApi, createMetaBackendGenericEntityApi } from "../genericentity";
import { MetaLookupApi, createMetaBackendLookupApi } from "../lookup";
import { MetaApiService } from "../meta.api.service";
import { MetaPageApi, createMetaBackendPageApi } from "../page";
import { MetaPickvalueApi, createMetaBackendPickvalueApi } from "../pickvalue";
import { MetaProcessingstateApi, createMetaBackendProcessingstateApi } from "../processingstate";
import { MetaStatisticApi, createMetaBackendStatisticApi } from "../statistic";
import { MetaTenantApi, createMetaBackendTenantApi } from "../tenant";

export class DefaultMetaApiService implements MetaApiService {
    constructor(protected httpClient: HttpClient, protected metaBaseUrl: string, protected documentServiceBaseUrl: string) {
        this.metaEntityApi = createMetaBackendEntityApi(httpClient, metaBaseUrl);
        this.metaTenantApi = createMetaBackendTenantApi(httpClient, metaBaseUrl);
        this.metaAttachmentApi = createMetaBackendAttachmentApi(httpClient, metaBaseUrl);
        this.metaStatisticApi = createMetaBackendStatisticApi(httpClient, metaBaseUrl);
        this.metaLookupApi = createMetaBackendLookupApi(httpClient, metaBaseUrl);
        this.metaProcessingstateApi = createMetaBackendProcessingstateApi(httpClient, metaBaseUrl);
        this.metaPickvalueApi = createMetaBackendPickvalueApi(httpClient, metaBaseUrl);
        this.metaDocumentApi = createMetaBackendDocumentApi(httpClient, metaBaseUrl, documentServiceBaseUrl);
        this.metaDocumentationApi = createMetaBackendDocumentationApi(httpClient, metaBaseUrl);
        this.metaPageApi = createMetaBackendPageApi(httpClient, metaBaseUrl);
        this.metaGenericEntityApiFactory = (baseUrl) => createMetaBackendGenericEntityApi(httpClient, baseUrl.replace('{meta}', metaBaseUrl + "/"));
    }

    metaEntityApi: MetaEntityApi;
    metaTenantApi: MetaTenantApi;
    metaAttachmentApi: MetaAttachmentApi;
    metaStatisticApi: MetaStatisticApi;
    metaLookupApi: MetaLookupApi;
    metaProcessingstateApi: MetaProcessingstateApi;
    metaPickvalueApi: MetaPickvalueApi;
    metaDocumentApi: MetaDocumentApi;
    metaDocumentationApi: MetaDocumentationApi;
    metaPageApi: MetaPageApi;
    metaGenericEntityApiFactory: (baseUrl: string) => MetaGenericEntityApi;
}
