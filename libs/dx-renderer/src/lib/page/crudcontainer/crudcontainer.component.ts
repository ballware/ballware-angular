import { Component, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { CrudContainerOptions, PageLayoutItem } from '@ballware/meta-model';
import { AttachmentService, CrudService, LookupService, MetaService, MetaServiceFactory, NOTIFICATION_SERVICE, NotificationService, PageService } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { takeUntil } from 'rxjs';
import { DataSourceService } from '../../utils/datasource.service';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-crudcontainer',
  templateUrl: './crudcontainer.component.html',
  styleUrls: ['./crudcontainer.component.scss'],
  providers: [    
    { 
      provide: LookupService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createLookupService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: MetaService, 
      useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory.createMetaService(lookupService),
      deps: [MetaServiceFactory, LookupService]  
    } as Provider,
    { 
      provide: AttachmentService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createAttachmentService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: CrudService, 
      useFactory: (serviceFactory: MetaServiceFactory, metaService: MetaService) => serviceFactory.createCrudService(metaService),
      deps: [MetaServiceFactory, MetaService]  
    } as Provider,
    {
      provide: DataSourceService,
      useFactory: (notificationService: NotificationService, metaService: MetaService, crudService: CrudService) => new DataSourceService(notificationService, metaService, crudService),
      deps: [NOTIFICATION_SERVICE, MetaService, CrudService]
    }
  ]
})
export class PageLayoutCrudcontainerComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() layoutItem?: PageLayoutItem;

  constructor(private pageService: PageService, private lookupService: LookupService, private metaService: MetaService, private crudService: CrudService, private datasourceService : DataSourceService) {

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
