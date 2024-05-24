import { Component, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { EditLayoutItem, GridLayout } from '@ballware/meta-model';
import { AttachmentService, CrudService, EditItemRef, EditService, LookupService, MasterdetailService, MetaService, MetaServiceFactory } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { BehaviorSubject, Observable, combineLatest, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithVisible } from '../../utils/withvisible';

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
      provide: MasterdetailService, useClass: MasterdetailService 
    }
  ]
})
export class EditLayoutEntitygridComponent extends WithVisible(WithReadonly(WithEditItemLifecycle(WithDestroy()))) implements OnInit, OnDestroy, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public gridLayout$: Observable<GridLayout|undefined>;

  public storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public height$ = new BehaviorSubject<string|undefined>('100%');

  constructor(private lookupService: LookupService, private metaService: MetaService, private crudService: CrudService, private editService: EditService) {
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

    const identifier = nanoid(11);

    if (identifier) {
      this.lookupService.setIdentifier(identifier);
      this.metaService.setIdentifier(identifier);
      this.crudService.setIdentifier(identifier);
    }

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
            this.metaService.setReadOnly(gridOptions?.readOnly ?? false);
            this.metaService.setHeadParams(gridOptions?.headParams ?? {});

            this.crudService.setQuery(gridOptions?.query ?? 'primary');

            this.layoutIdentifier$.next(gridOptions?.layout ?? 'primary');
            this.height$.next(layoutItem.options?.height);

            this.layoutItem = layoutItem;

            this.initReadonly(layoutItem, this.editService);
            this.initVisible(layoutItem);
          }
        });
    }
  }

  override ngOnDestroy(): void {
      super.ngOnDestroy();

      this.editService.ngOnDestroy();
      this.crudService.ngOnDestroy();
      this.metaService.ngOnDestroy();
      this.lookupService.ngOnDestroy();
  }

  public getOption(option: string): any {
    switch (option) {
      case 'readonly':
        return this.readonly$.getValue();
      case 'visible':
        return this.visible$.getValue();                
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'readonly':
        this.setReadonly(value as boolean)
        break;
      case 'visible':
        this.setVisible(value as boolean);
        break;        
    }
  }

}
