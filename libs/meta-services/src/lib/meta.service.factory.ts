import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService } from './attachment.service';
import { AuthService } from './auth.service';
import { CrudService } from './crud.service';
import { EditService } from './edit.service';
import { LookupService } from './lookup.service';
import { MetaService } from './meta.service';
import { PageService } from './page.service';
import { ResponsiveService } from './responsive.service';
import { TenantService } from './tenant.service';

export abstract class MetaServiceFactory {
    abstract createAuthService(): AuthService;
    abstract createAttachmentService(): AttachmentService;
    abstract createCrudService(metaService: MetaService): CrudService;
    abstract createEditService(metaService: MetaService): EditService;
    abstract createLookupService(): LookupService;
    abstract createMetaService(authService: AuthService, tenantService: TenantService, lookupService: LookupService): MetaService;
    abstract createResponsiveService(): ResponsiveService;
    abstract createTenantService(authService: AuthService): TenantService;
    abstract createPageService(route: ActivatedRoute, router: Router, tenantService: TenantService, lookupService: LookupService): PageService;
}