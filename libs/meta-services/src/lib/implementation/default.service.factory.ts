import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiServiceFactory } from '@ballware/meta-api';
import { Store } from '@ngrx/store';
import { I18NextPipe } from 'angular-i18next';
import { EditService } from '../edit.service';
import { EditServiceProxy } from '../edit/edit.proxy';
import { EditStore } from '../edit/edit.store';
import { IdentityService } from '../identity.service';
import { MetaService } from '../meta.service';
import { ServiceFactory } from '../meta.service.factory';
import { NotificationService } from '../notification.service';
import { ResponsiveService } from '../responsive.service';
import { TenantService } from '../tenant.service';
import { ToolbarService } from '../toolbar.service';

export class DefaultMetaServiceFactory extends ServiceFactory {
    constructor(private store: Store, private httpClient: HttpClient, private router: Router, private apiServiceFactory: ApiServiceFactory, private translationPipe: I18NextPipe, private notificationService: NotificationService, private identityService: IdentityService, private tenantService: TenantService, private toolbarService: ToolbarService) {
        super();
    }

    override createEditService(metaService: MetaService): EditService {
        return new EditServiceProxy(new EditStore(this.store, metaService));
    }
    
    override createResponsiveService(): ResponsiveService {
        return new ResponsiveService();
    }    
}