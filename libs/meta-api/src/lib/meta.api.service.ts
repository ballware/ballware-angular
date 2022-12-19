import { Observable } from "rxjs";
import { MetaEntityApi, MetaTenantApi, MetaAttachmentApi, MetaStatisticApi, MetaLookupApi, MetaProcessingstateApi, MetaPickvalueApi, MetaDocumentApi, MetaDocumentationApi, MetaPageApi, MetaGenericEntityApi } from "./meta-api.module";

export abstract class MetaApiService {
    abstract metaEntityApiFactory$: Observable<(() => MetaEntityApi)>;
    abstract metaTenantApiFactory$: Observable<(() => MetaTenantApi)>;
    abstract metaAttachmentApiFactory$: Observable<(() => MetaAttachmentApi)>;
    abstract metaStatisticApiFactory$: Observable<(() => MetaStatisticApi)>;
    abstract metaLookupApiFactory$: Observable<(() => MetaLookupApi)>;
    abstract metaProcessingstateApiFactory$: Observable<(() => MetaProcessingstateApi)>;
    abstract metaPickvalueApiFactory$: Observable<(() => MetaPickvalueApi)>;
    abstract metaDocumentApiFactory$: Observable<(() => MetaDocumentApi)>;
    abstract metaDocumentationApiFactory$: Observable<(() => MetaDocumentationApi)>;
    abstract metaPageApiFactory$: Observable<(() => MetaPageApi)>;
    abstract metaGenericEntityApiFactory$: Observable<((baseUrl: string) => MetaGenericEntityApi)>;
}