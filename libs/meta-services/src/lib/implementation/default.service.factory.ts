import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { CrudService } from '../crud.service';
import { CrudServiceProxy } from '../crud/crud.proxy';
import { CrudStore } from '../crud/crud.store';
import { EditService } from '../edit.service';
import { EditServiceProxy } from '../edit/edit.proxy';
import { EditStore } from '../edit/edit.store';
import { IdentityService } from '../identity.service';
import { LookupService } from '../lookup.service';
import { MetaService } from '../meta.service';
import { ServiceFactory } from '../meta.service.factory';
import { NotificationService } from '../notification.service';
import { ResponsiveService } from '../responsive.service';
import { StatisticService } from '../statistic.service';
import { StatisticServiceProxy } from '../statistic/statistic.proxy';
import { StatisticStore } from '../statistic/statistic.store';
import { TenantService } from '../tenant.service';
import { ToolbarService } from '../toolbar.service';

export class DefaultMetaServiceFactory extends ServiceFactory {
    constructor(private store: Store, private httpClient: HttpClient, private router: Router, private apiServiceFactory: ApiServiceFactory, private translationPipe: I18NextPipe, private notificationService: NotificationService, private identityService: IdentityService, private tenantService: TenantService, private toolbarService: ToolbarService) {
        super();
    }

    override createCrudService(metaService: MetaService): CrudService {
        return new CrudServiceProxy(new CrudStore(this.store, metaService, this.notificationService, this.translationPipe, this.router));
    }

    override createEditService(metaService: MetaService): EditService {
        return new EditServiceProxy(new EditStore(this.store, metaService));
    }
    
    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }
    
    override createStatisticService(lookupService: LookupService): StatisticService {
        return new StatisticServiceProxy(new StatisticStore(this.store, this.httpClient, this.apiServiceFactory.createMetaApi(), this.identityService, lookupService));
    }
}