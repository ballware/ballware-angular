import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService } from './attachment.service';
import { CrudService } from './crud.service';
import { EditService } from './edit.service';
import { LookupService } from './lookup.service';
import { MetaService } from './meta.service';
import { PageService } from './page.service';
import { ResponsiveService } from './responsive.service';
import { LookupStore } from './lookup/lookup.store';

export abstract class MetaServiceFactory {
    abstract createLookupStore(): LookupStore;

    abstract createAttachmentService(): AttachmentService;
    abstract createCrudService(metaService: MetaService): CrudService;
    abstract createEditService(metaService: MetaService): EditService;
    abstract createLookupService(): LookupService;
    abstract createMetaService(lookupService: LookupService): MetaService;
    abstract createResponsiveService(): ResponsiveService;
    abstract createPageService(route: ActivatedRoute, router: Router, lookupService: LookupService): PageService;
}