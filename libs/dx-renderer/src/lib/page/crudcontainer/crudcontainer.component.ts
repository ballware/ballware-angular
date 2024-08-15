import { Component, Inject, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { CrudContainerOptions, PageLayoutItem } from '@ballware/meta-model';
import { ATTACHMENT_SERVICE, ATTACHMENT_SERVICE_FACTORY, AttachmentServiceFactory, CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudService, CrudServiceFactory, LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory, NOTIFICATION_SERVICE, NotificationService, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { takeUntil } from 'rxjs';
import { DataSourceService } from '../../utils/datasource.service';
import { WithDestroy } from '../../utils/withdestroy';
import { Router } from '@angular/router';

@Component({
  selector: 'ballware-page-crudcontainer',
  templateUrl: './crudcontainer.component.html',
  styleUrls: ['./crudcontainer.component.scss'],
  providers: [    
    { 
      provide: LOOKUP_SERVICE, 
      useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
      deps: [LOOKUP_SERVICE_FACTORY]  
    } as Provider,
    { 
      provide: META_SERVICE, 
      useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory(lookupService),
      deps: [META_SERVICE_FACTORY, LOOKUP_SERVICE]  
    } as Provider,
    { 
      provide: ATTACHMENT_SERVICE, 
      useFactory: (serviceFactory: AttachmentServiceFactory) => serviceFactory(),
      deps: [ATTACHMENT_SERVICE_FACTORY]  
    } as Provider,
    { 
      provide: CRUD_SERVICE, 
      useFactory: (serviceFactory: CrudServiceFactory, router: Router, metaService: MetaService) => serviceFactory(router, metaService),
      deps: [CRUD_SERVICE_FACTORY, Router, META_SERVICE]  
    } as Provider,
    {
      provide: DataSourceService,
      useFactory: (notificationService: NotificationService, metaService: MetaService, crudService: CrudService) => new DataSourceService(notificationService, metaService, crudService),
      deps: [NOTIFICATION_SERVICE, META_SERVICE, CRUD_SERVICE]
    }
  ]
})
export class PageLayoutCrudcontainerComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() layoutItem?: PageLayoutItem;

  constructor(
    @Inject(PAGE_SERVICE) private pageService: PageService, 
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService, 
    @Inject(META_SERVICE) private metaService: MetaService, 
    @Inject(CRUD_SERVICE) private crudService: CrudService, 
    private datasourceService : DataSourceService) {

    super();

    this.pageService.customParam$
      .pipe(takeUntil(this.destroy$))
      .subscribe((customParam) => {
        this.metaService.setInitialCustomParam(customParam);
      });    
    
    this.pageService.headParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((headParams) => {
          if (headParams) {
            this.metaService.setHeadParams(headParams);
          }
      });
  }

  ngOnInit(): void {
    this.metaService.setEntity((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.entity);
    this.crudService.setQuery((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.query ?? 'primary');

    let identifier = (this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.identifier;

    if (!identifier) {
      identifier = nanoid(11);
    }

    if (identifier) {
      this.lookupService.setIdentifier(identifier);
      this.metaService.setIdentifier(identifier);
      this.crudService.setIdentifier(identifier);
    }

  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.datasourceService.ngOnDestroy();
    this.crudService.ngOnDestroy();
    this.metaService.ngOnDestroy();
    this.lookupService.ngOnDestroy();
  }
}
