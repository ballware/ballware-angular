import { Observable, of } from "rxjs";
import { createMetaBackendAttachmentApi, MetaAttachmentApi } from "../attachment";
import { createMetaBackendDocumentApi, MetaDocumentApi } from "../document";
import { createMetaBackendDocumentationApi, MetaDocumentationApi } from "../documentation";
import { createMetaBackendEntityApi, MetaEntityApi } from "../entity";
import { createMetaBackendGenericEntityApi, MetaGenericEntityApi } from "../genericentity";
import { createMetaBackendLookupApi, MetaLookupApi } from "../lookup";
import { MetaApiService } from "../meta.api.service";
import { createMetaBackendPageApi, MetaPageApi } from "../page";
import { createMetaBackendPickvalueApi, MetaPickvalueApi } from "../pickvalue";
import { createMetaBackendProcessingstateApi, MetaProcessingstateApi } from "../processingstate";
import { createMetaBackendStatisticApi, MetaStatisticApi } from "../statistic";
import { createMetaBackendTenantApi, MetaTenantApi } from "../tenant";

export class DefaultMetaApiService implements MetaApiService {
    constructor(protected metaBaseUrl: string, protected documentServiceBaseUrl: string) {
        this.metaEntityApiFactory$ = of(() => createMetaBackendEntityApi(metaBaseUrl));
        this.metaTenantApiFactory$ = of(() => createMetaBackendTenantApi(metaBaseUrl));
        this.metaAttachmentApiFactory$ = of(() => createMetaBackendAttachmentApi(metaBaseUrl));
        this.metaStatisticApiFactory$ = of(() => createMetaBackendStatisticApi(metaBaseUrl));
        this.metaLookupApiFactory$ = of(() => createMetaBackendLookupApi(metaBaseUrl));
        this.metaProcessingstateApiFactory$ = of(() => createMetaBackendProcessingstateApi(metaBaseUrl));
        this.metaPickvalueApiFactory$ = of(() => createMetaBackendPickvalueApi(metaBaseUrl));
        this.metaDocumentApiFactory$ = of(() => createMetaBackendDocumentApi(metaBaseUrl, documentServiceBaseUrl));
        this.metaDocumentationApiFactory$ = of(() => createMetaBackendDocumentationApi(metaBaseUrl));
        this.metaPageApiFactory$ = of(() => createMetaBackendPageApi(metaBaseUrl));
        this.metaGenericEntityApiFactory$ = of((baseUrl) => createMetaBackendGenericEntityApi(baseUrl));

    }

    metaEntityApiFactory$: Observable<() => MetaEntityApi>;
    metaTenantApiFactory$: Observable<() => MetaTenantApi>;
    metaAttachmentApiFactory$: Observable<() => MetaAttachmentApi>;
    metaStatisticApiFactory$: Observable<() => MetaStatisticApi>;
    metaLookupApiFactory$: Observable<() => MetaLookupApi>;
    metaProcessingstateApiFactory$: Observable<() => MetaProcessingstateApi>;
    metaPickvalueApiFactory$: Observable<() => MetaPickvalueApi>;
    metaDocumentApiFactory$: Observable<() => MetaDocumentApi>;
    metaDocumentationApiFactory$: Observable<() => MetaDocumentationApi>;
    metaPageApiFactory$: Observable<() => MetaPageApi>;
    metaGenericEntityApiFactory$: Observable<(baseUrl: string) => MetaGenericEntityApi>;
}
