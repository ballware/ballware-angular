import { Observable, of } from "rxjs";
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
        this.metaGenericEntityApiFactory$ = of((baseUrl) => createMetaBackendGenericEntityApi(baseUrl.replace('{meta}', metaBaseUrl + "/")));

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
