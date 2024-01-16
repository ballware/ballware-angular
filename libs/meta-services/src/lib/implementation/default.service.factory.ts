import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { OAuthService } from 'angular-oauth2-oidc';
import { AttachmentService } from '../attachment.service';
import { CrudService } from '../crud.service';
import { CrudServiceProxy } from '../crud/crud.proxy';
import { CrudStore } from '../crud/crud.store';
import { EditService } from '../edit.service';
import { EditServiceProxy } from '../edit/edit.proxy';
import { EditStore } from '../edit/edit.store';
import { IdentityService } from '../identity.service';
import { LookupService } from '../lookup.service';
import { LookupServiceProxy } from '../lookup/lookup.proxy';
import { LookupStore } from '../lookup/lookup.store';
import { MetaService } from '../meta.service';
import { MetaServiceFactory } from '../meta.service.factory';
import { MetaServiceProxy } from '../meta/meta.proxy';
import { MetaStore } from '../meta/meta.store';
import { NotificationService } from '../notification.service';
import { PageService } from '../page.service';
import { PageServiceProxy } from '../page/page.proxy';
import { PageStore } from '../page/page.store';
import { ResponsiveService } from '../responsive.service';
import { TenantService } from '../tenant.service';

export class DefaultMetaServiceFactory extends MetaServiceFactory {
    constructor(private store: Store, private httpClient: HttpClient, private router: Router, private apiServiceFactory: ApiServiceFactory, private oauthService: OAuthService, private translationPipe: I18NextPipe, private notificationService: NotificationService, private identityService: IdentityService, private tenantService: TenantService) {
        super();
    }

    override createAttachmentService(): AttachmentService {
        return new AttachmentService();
    }

    override createCrudService(metaService: MetaService): CrudService {
        return new CrudServiceProxy(new CrudStore(metaService, this.notificationService, this.translationPipe, this.router));
    }

    override createEditService(metaService: MetaService): EditService {
        return new EditServiceProxy(new EditStore(metaService));
    }
    
    override createLookupService(): LookupService {
        return new LookupServiceProxy(new LookupStore(this.apiServiceFactory.createIdentityApi(), this.apiServiceFactory.createMetaApi()));
    }

    override createMetaService(lookupService: LookupService): MetaService {
        return new MetaServiceProxy(new MetaStore(this.httpClient, this.apiServiceFactory.createMetaApi(), this.identityService, this.tenantService, lookupService));
    }

    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }

    override createPageService(activatedRoute: ActivatedRoute, router: Router, lookupService: LookupService): PageService {
        return new PageServiceProxy(new PageStore(this.httpClient, activatedRoute, router, this.tenantService, lookupService, this.apiServiceFactory.createMetaApi()));
    }
}