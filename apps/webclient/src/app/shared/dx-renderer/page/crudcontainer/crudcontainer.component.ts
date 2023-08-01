import { Component, Input, OnInit, Provider } from '@angular/core';
import { LookupService, CrudService, MetaService, AttachmentService, PageService, EditService, MetaServiceFactory } from '@ballware/meta-services';
import { CrudContainerOptions, PageLayoutItem } from '@ballware/meta-model';
import { combineLatest, takeUntil } from 'rxjs';
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
      provide: EditService, 
      useFactory: (serviceFactory: MetaServiceFactory, metaService: MetaService) => serviceFactory.createEditService(metaService),
      deps: [MetaServiceFactory, MetaService]
    } as Provider,
  ]
})
export class PageLayoutCrudcontainerComponent extends WithDestroy() implements OnInit {

  @Input() layoutItem?: PageLayoutItem;

  constructor(private pageService: PageService, private metaService: MetaService, private crudService: CrudService) {

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

    combineLatest([this.metaService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([
        fetchParams
      ]) => {
        if (fetchParams) {
          this.crudService.reload();
        }
      });
  }

  ngOnInit(): void {
    this.metaService.setEntity((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.entity);
    this.crudService.setQuery((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.query ?? 'primary');

    const storageIdentifier = (this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.identifier;

    if (storageIdentifier) {
      this.crudService.setStorageIdentifier(storageIdentifier);
    }

  }
}
