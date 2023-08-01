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
import { DefaultLookupService } from './default.lookup.service';
import { DefaultMetaService } from './default.meta.service';
import { DefaultPageService } from './default.page.service';
import { Store } from '@ngrx/store';

export class DefaultMetaServiceFactory extends MetaServiceFactory {
    constructor(private store: Store, private httpClient: HttpClient, private apiServiceFactory: ApiServiceFactory, private oauthService: OAuthService, private translationPipe: I18NextPipe) {
        super();
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
        return new DefaultLookupService(this.httpClient, this.apiServiceFactory.createIdentityApi(), this.apiServiceFactory.createMetaApi());
    }

    override createMetaService(lookupService: LookupService): MetaService {
        return new DefaultMetaService(this.store, this.httpClient, this.apiServiceFactory.createMetaApi(), lookupService);
    }

    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }

    override createPageService(route: ActivatedRoute, router: Router, lookupService: LookupService): PageService {
        return new DefaultPageService(this.store, this.httpClient, route, router, lookupService, this.apiServiceFactory.createMetaApi());
    }
}