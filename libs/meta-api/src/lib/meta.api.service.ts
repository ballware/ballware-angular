import { MetaEntityApi, MetaTenantApi, MetaAttachmentApi, MetaStatisticApi, MetaLookupApi, MetaProcessingstateApi, MetaPickvalueApi, MetaDocumentApi, MetaDocumentationApi, MetaPageApi, MetaGenericEntityApi } from "./meta-api.module";

export abstract class MetaApiService {
    abstract metaEntityApi: MetaEntityApi;
    abstract metaTenantApi: MetaTenantApi;
    abstract metaAttachmentApi: MetaAttachmentApi;
    abstract metaStatisticApi: MetaStatisticApi;
    abstract metaLookupApi: MetaLookupApi;
    abstract metaProcessingstateApi: MetaProcessingstateApi;
    abstract metaPickvalueApi: MetaPickvalueApi;
    abstract metaDocumentApi: MetaDocumentApi;
    abstract metaDocumentationApi: MetaDocumentationApi;
    abstract metaPageApi: MetaPageApi;
    abstract metaGenericEntityApiFactory: (baseUrl: string) => MetaGenericEntityApi;
}