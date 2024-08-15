import { Router } from '@angular/router';
import { CrudService } from './crud.service';
import { EditService } from './edit.service';
import { LookupService } from './lookup.service';
import { MetaService } from './meta.service';
import { PageService } from './page.service';
import { ResponsiveService } from './responsive.service';
import { StatisticService } from './statistic.service';

export abstract class MetaServiceFactory {    
    abstract createCrudService(metaService: MetaService): CrudService;
    abstract createEditService(metaService: MetaService): EditService;    
    abstract createMetaService(lookupService: LookupService): MetaService;
    abstract createResponsiveService(): ResponsiveService;
    abstract createPageService(router: Router, lookupService: LookupService): PageService;
    abstract createStatisticService(lookupService: LookupService): StatisticService;
}