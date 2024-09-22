import { Component, forwardRef, Inject, OnDestroy, OnInit, Provider } from '@angular/core';
import { GridLayout } from '@ballware/meta-model';
import { ATTACHMENT_SERVICE, ATTACHMENT_SERVICE_FACTORY, AttachmentServiceFactory, CrudService, EditService, LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, MasterdetailService, MetaService, NOTIFICATION_SERVICE, NotificationService, META_SERVICE, META_SERVICE_FACTORY, MetaServiceFactory, CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudServiceFactory, EDIT_SERVICE } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { BehaviorSubject, Observable, combineLatest, map, takeUntil } from 'rxjs';
import { DataSourceService } from '../../utils/datasource.service';
import { Router } from '@angular/router';
import { EntitygridComponent } from '../../datacontainer';
import { CrudActionsComponent } from '../actions/actions.component';
import { CommonModule } from '@angular/common';
import { EditDetailComponent } from '../detail/detail.component';
import { Destroy, EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';

interface EntityGridItemOptions {
  uniqueKey?: string;
  query?: string;
  layout?: string;
  fetchParams?: Record<string, unknown>;
  headParams?: Record<string, unknown>;
  readOnly?: boolean;
  customParam?: Record<string, unknown>;
}

@Component({
  selector: 'ballware-edit-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: [],
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
    },
    { 
      provide: MasterdetailService, useClass: MasterdetailService 
    }
  ],
  imports: [CommonModule, EntitygridComponent, forwardRef(() => CrudActionsComponent), EditDetailComponent],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly, Visible],
  standalone: true
})
export class EditLayoutEntitygridComponent implements OnInit, OnDestroy {

  public gridLayout$: Observable<GridLayout|undefined>;

  public storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public height$ = new BehaviorSubject<string|undefined>('100%');

  constructor(
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService, 
    @Inject(META_SERVICE) private metaService: MetaService, 
    @Inject(CRUD_SERVICE) private crudService: CrudService, 
    private datasourceService: DataSourceService, 
    @Inject(EDIT_SERVICE) private editService: EditService,
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public readonly: Readonly,
    public visible: Visible
  ) {
    combineLatest([this.metaService.headParams$])
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe(([
        fetchParams
      ]) => {
        if (fetchParams) {
          this.crudService.reload();
        }
      });

    this.gridLayout$ = combineLatest([this.layoutIdentifier$, this.metaService.getGridLayout$])
      .pipe(takeUntil(this.destroy.destroy$))
      .pipe(map(([layoutIdentifier, getGridLayout]) => (layoutIdentifier && getGridLayout) ? getGridLayout(layoutIdentifier) : undefined));
  }

  ngOnInit(): void {

    const identifier = nanoid(11);

    if (identifier) {
      this.lookupService.setIdentifier(identifier);
      this.metaService.setIdentifier(identifier);
      this.crudService.setIdentifier(identifier);
    }

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        
        const gridOptions = layoutItem?.options?.itemoptions as EntityGridItemOptions;

        if (layoutItem?.options?.dataMember) {
          this.metaService.setEntity(layoutItem.options?.dataMember);
        }

        this.metaService.setInitialCustomParam(gridOptions?.customParam ?? {});
        this.metaService.setReadOnly(gridOptions?.readOnly ?? false);
        this.metaService.setHeadParams(gridOptions?.headParams ?? {});

        this.crudService.setQuery(gridOptions?.query ?? 'primary');

        this.layoutIdentifier$.next(gridOptions?.layout ?? 'primary');
        this.height$.next(layoutItem?.options?.height);        
      });
  }

  ngOnDestroy(): void {  
    this.editService.ngOnDestroy();
    this.datasourceService.ngOnDestroy();
    this.crudService.ngOnDestroy();
    this.metaService.ngOnDestroy();
    this.lookupService.ngOnDestroy();
  }
}
