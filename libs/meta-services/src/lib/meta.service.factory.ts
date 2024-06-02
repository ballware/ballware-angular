import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService } from './attachment.service';
import { CrudService } from './crud.service';
import { EditService } from './edit.service';
import { LookupService } from './lookup.service';
import { MetaService } from './meta.service';
import { PageService } from './page.service';
import { StatisticService } from './statistic.service';

export abstract class MetaServiceFactory {
    abstract createAttachmentService(): AttachmentService;
    abstract createCrudService(metaService: MetaService): CrudService;
    abstract createEditService(metaService: MetaService): EditService;
    abstract createLookupService(): LookupService;
    abstract createMetaService(lookupService: LookupService): MetaService;
    abstract createPageService(activatedRoute: ActivatedRoute, router: Router, lookupService: LookupService): PageService;
    abstract createStatisticService(lookupService: LookupService): StatisticService;
}