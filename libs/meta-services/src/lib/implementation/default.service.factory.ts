import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { I18NextPipe } from 'angular-i18next';
import { OAuthService } from 'angular-oauth2-oidc';
import { AttachmentService } from '../attachment.service';
import { AuthService } from '../auth.service';
import { CrudService } from '../crud.service';
import { EditService } from '../edit.service';
import { LookupService } from '../lookup.service';
import { MetaService } from '../meta.service';
import { MetaServiceFactory } from '../meta.service.factory';
import { PageService } from '../page.service';
import { ResponsiveService } from '../responsive.service';
import { SettingsService } from '../settings.service';
import { TenantService } from '../tenant.service';
import { DefaultCrudService } from './default.crud.service';
import { DefaultLookupService } from './default.lookup.service';
import { DefaultMetaService } from './default.meta.service';
import { DefaultPageService } from './default.page.service';
import { DefaultTenantService } from './default.tenant.service';

export class DefaultMetaServiceFactory extends MetaServiceFactory {
    constructor(private httpClient: HttpClient, private apiServiceFactory: ApiServiceFactory, private settingsService: SettingsService, private oauthService: OAuthService, private translationPipe: I18NextPipe) {
        super();
    }

    override createAuthService(): AuthService {
        return new AuthService(this.settingsService, this.oauthService);
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

    override createMetaService(authService: AuthService, tenantService: TenantService, lookupService: LookupService): MetaService {
        return new DefaultMetaService(this.httpClient, this.apiServiceFactory.createMetaApi(), authService, tenantService, lookupService);
    }

    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }

    override createTenantService(authService: AuthService): TenantService {
        return new DefaultTenantService(this.httpClient, authService, this.apiServiceFactory.createMetaApi());
    }

    override createPageService(route: ActivatedRoute, router: Router, tenantService: TenantService, lookupService: LookupService): PageService {
        return new DefaultPageService(this.httpClient, route, router, tenantService, lookupService, this.apiServiceFactory.createMetaApi());
    }
}