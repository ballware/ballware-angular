import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { I18NextPipe } from 'angular-i18next';
import { OAuthService } from 'angular-oauth2-oidc';
import { AttachmentService } from '../attachment.service';
import { CrudService } from '../crud.service';
import { EditService } from '../edit.service';
import { LookupService } from '../lookup.service';
import { MetaService } from '../meta.service';
import { MetaServiceFactory } from '../meta.service.factory';
import { PageService } from '../page.service';
import { ResponsiveService } from '../responsive.service';
import { DefaultCrudService } from './default.crud.service';
import { DefaultPageService } from './default.page.service';
import { Store } from '@ngrx/store';
import { IdentityService } from '../identity.service';
import { TenantService } from '../tenant.service';
import { LookupStore } from '../lookup/lookup.store';
import { LookupServiceStore } from '../lookup/lookup.service.store';
import { MetaServiceStore } from '../meta/meta.service.store';
import { MetaStore } from '../meta/meta.store';

export class DefaultMetaServiceFactory extends MetaServiceFactory {
    constructor(private store: Store, private httpClient: HttpClient, private apiServiceFactory: ApiServiceFactory, private oauthService: OAuthService, private translationPipe: I18NextPipe, private identityService: IdentityService, private tenantService: TenantService) {
        super();
    }

    override createLookupStore(): LookupStore {
        return new LookupStore();
    }

    override createAttachmentService(): AttachmentService {
        return new AttachmentService();
    }

    override createCrudService(metaService: MetaService): CrudService {
        return new DefaultCrudService(metaService, this.translationPipe);
    }

    override createEditService(metaService: MetaService): EditService {
        return new EditService(metaService);
    }
    
    override createLookupService(): LookupService {
        return new LookupServiceStore(new LookupStore(), this.httpClient, this.apiServiceFactory.createIdentityApi(), this.apiServiceFactory.createMetaApi());
    }

    override createMetaService(lookupService: LookupService): MetaService {
        return new MetaServiceStore(new MetaStore(this.httpClient, this.apiServiceFactory.createMetaApi(), this.identityService, this.tenantService, lookupService));
        //return new DefaultMetaService(this.identityService, this.tenantService, this.httpClient, this.apiServiceFactory.createMetaApi(), lookupService);
    }

    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }

    override createPageService(route: ActivatedRoute, router: Router, lookupService: LookupService): PageService {
        return new DefaultPageService(this.store, this.httpClient, route, router, lookupService, this.apiServiceFactory.createMetaApi());
    }
}