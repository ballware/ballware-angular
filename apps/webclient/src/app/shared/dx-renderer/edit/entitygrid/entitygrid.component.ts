import { Component, Input, OnInit, Provider } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, takeUntil } from 'rxjs';
import { EditLayoutItem, GridLayout } from '@ballware/meta-model';
import { CrudService, EditService, EditItemRef, LookupService, MetaService, AttachmentService, MetaServiceFactory, AuthService, TenantService } from '@ballware/meta-services';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';

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
  styleUrls: ['./entitygrid.component.scss'],
  providers: [
    { 
      provide: LookupService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createLookupService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: MetaService, 
      useFactory: (serviceFactory: MetaServiceFactory, authService: AuthService, tenantService: TenantService, lookupService: LookupService) => serviceFactory.createMetaService(authService, tenantService, lookupService),
      deps: [MetaServiceFactory, AuthService, TenantService, LookupService]  
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
    } as Provider
  ]
})
export class EditLayoutEntitygridComponent extends WithReadonly(WithEditItemLifecycle(WithDestroy())) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public gridLayout$: Observable<GridLayout|undefined>;

  public storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public height$ = new BehaviorSubject<string|undefined>('100%');

  constructor(private metaService: MetaService, private crudService: CrudService, private editService: EditService) {
    super();

    combineLatest([this.metaService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([
        fetchParams
      ]) => {
        if (fetchParams) {
          this.crudService.reload();
        }
      });

    this.gridLayout$ = combineLatest([this.layoutIdentifier$, this.metaService.getGridLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([layoutIdentifier, getGridLayout]) => (layoutIdentifier && getGridLayout) ? getGridLayout(layoutIdentifier) : undefined));
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            const gridOptions = layoutItem.options?.itemoptions as EntityGridItemOptions;

            if (layoutItem.options?.dataMember) {
              this.metaService.setEntity(layoutItem.options?.dataMember);
            }

            this.metaService.setInitialCustomParam(gridOptions?.customParam ?? {});
            this.metaService.setReadonly(gridOptions?.readOnly ?? false);
            this.metaService.setHeadParams(gridOptions?.headParams ?? {});

            this.crudService.setQuery(gridOptions?.query ?? 'primary');

            this.layoutIdentifier$.next(gridOptions?.layout ?? 'primary');
            this.height$.next(layoutItem.options?.height);

            this.layoutItem = layoutItem;

            this.initReadonly(layoutItem, this.editService);
          }
        });
    }
  }

  public getOption(option: string): any {
    switch (option) {
      case 'readonly':
        return this.readonly$.getValue();
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'readonly':
        this.setReadonly(value as boolean)
        break;
    }
  }

}
