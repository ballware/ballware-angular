import { MetaAttachmentApi, MetaDocumentApi, MetaDocumentationApi, MetaEntityApi, MetaGenericEntityApi, MetaLookupApi, MetaPageApi, MetaPickvalueApi, MetaProcessingstateApi, MetaStatisticApi, MetaTenantApi } from "./meta-api.module";

export abstract class MetaApiService {
    abstract metaEntityApi: MetaEntityApi;
    abstract metaTenantApi: MetaTenantApi;
    abstract metaStatisticApi: MetaStatisticApi;
    abstract metaLookupApi: MetaLookupApi;
    abstract metaProcessingstateApi: MetaProcessingstateApi;
    abstract metaPickvalueApi: MetaPickvalueApi;
    abstract metaDocumentApi: MetaDocumentApi;
    abstract metaDocumentationApi: MetaDocumentationApi;
    abstract metaPageApi: MetaPageApi;
    abstract metaGenericEntityApiFactory: (baseUrl: string) => MetaGenericEntityApi;
    abstract metaAttachmentApiFactory: (owner: string) => MetaAttachmentApi;
}