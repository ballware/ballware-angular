import {
  Component,
  DestroyRef,
  forwardRef,
  Inject,
  Input,
  OnInit,
  Provider,
} from '@angular/core';
import { CrudContainerOptions, PageLayoutItem } from '@ballware/meta-model';
import { ATTACHMENT_SERVICE, ATTACHMENT_SERVICE_FACTORY, AttachmentServiceFactory, CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudService, CrudServiceFactory, LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory, NOTIFICATION_SERVICE, NotificationService, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { DataSourceService } from '../../utils';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageLayoutItemComponent } from '../layout/item.component';
import { CrudActionsComponent } from '../../edit';
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    ],
    imports: [CommonModule, forwardRef(() => PageLayoutItemComponent), forwardRef(() => CrudActionsComponent)],
    hostDirectives: [Breadcrumb]
})
export class PageLayoutCrudcontainerComponent implements OnInit {

  @Input() layoutItem?: PageLayoutItem;

  constructor(
    private destroy: DestroyRef,
    @Inject(PAGE_SERVICE) private pageService: PageService,
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(META_SERVICE) private metaService: MetaService,
    @Inject(CRUD_SERVICE) private crudService: CrudService,
    private breadcrumb: Breadcrumb) {

    this.pageService.customParam$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((customParam) => {
      this.metaService.setInitialCustomParam(customParam);
    });
  }

  ngOnInit(): void {

    const entity = (this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.entity;

    this.metaService.setEntity((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.entity);
    this.crudService.setQuery((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.query ?? 'primary');

    if (entity) {
      this.breadcrumb.setIdentifier(entity);
      this.lookupService.setIdentifier(this.breadcrumb.pathString);
      this.metaService.setIdentifier(this.breadcrumb.pathString);
      this.crudService.setIdentifier(this.breadcrumb.pathString);
    }

    this.pageService.headParams$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((headParams) => {
        if (headParams) {
          this.metaService.setHeadParams({
            ...(this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.params ?? {},
            ...headParams
          });
        }
    });

  }
}
