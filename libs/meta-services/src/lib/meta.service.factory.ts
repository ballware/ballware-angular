import { CrudService } from './crud.service';
import { EditService } from './edit.service';
import { LookupService } from './lookup.service';
import { MetaService } from './meta.service';
import { ResponsiveService } from './responsive.service';
import { StatisticService } from './statistic.service';

export abstract class ServiceFactory {    
    abstract createCrudService(metaService: MetaService): CrudService;
    abstract createEditService(metaService: MetaService): EditService;    
    abstract createResponsiveService(): ResponsiveService;
    abstract createStatisticService(lookupService: LookupService): StatisticService;
}