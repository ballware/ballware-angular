import { EditService } from './edit.service';
import { MetaService } from './meta.service';
import { ResponsiveService } from './responsive.service';

export abstract class ServiceFactory {    
    abstract createEditService(metaService: MetaService): EditService;    
    abstract createResponsiveService(): ResponsiveService;
}