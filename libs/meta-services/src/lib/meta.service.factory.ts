import { EditService } from './edit.service';
import { MetaService } from './meta.service';

export abstract class ServiceFactory {    
    abstract createEditService(metaService: MetaService): EditService;    
}