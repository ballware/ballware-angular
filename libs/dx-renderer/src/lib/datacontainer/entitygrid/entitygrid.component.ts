import { Component, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { CrudItem, EntityCustomFunction, GridLayout } from '@ballware/meta-model';
import { CRUD_SERVICE, CrudService, FunctionIdentifier, LOOKUP_SERVICE, LookupService, META_SERVICE, MetaService, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, Translator, TRANSLATOR } from '@ballware/meta-services';
import DataSource from 'devextreme/data/data_source';
import { Column } from 'devextreme/ui/data_grid';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { createColumnConfiguration } from '../../utils/columns';
import { DataSourceService } from '../../utils/datasource.service';
import { WithDestroy } from '../../utils/withdestroy';
import { DatagridComponent, DatagridSummary } from '../datagrid/datagrid.component';
import { CommonModule } from '@angular/common';

const createSummaryConfiguration = (gridLayout: GridLayout) => {
  return {
    totalItems: gridLayout.summaries
      ?.filter(s => s.totalSummary)
      .map(s => {
        return {
          column: s.dataMember,
          summaryType: s.summaryType,
          valueFormat: 'fixedPoint',
        };
      }),
    groupItems: gridLayout.summaries
      ?.filter(s => s.groupSummary)
      .map(s => {
        return {
          column: s.dataMember,
          summaryType: s.summaryType,
          valueFormat: 'fixedPoint',
        };
      }),
  } as DatagridSummary;
};

@Component({
  selector: 'ballware-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: ['./entitygrid.component.scss'],
  imports: [CommonModule, DatagridComponent],
  standalone: true
})
export class EntitygridComponent extends WithDestroy() implements OnInit {

  @Input() visible!: boolean|null;
  @Input() gridLayout?: GridLayout;
  @Input() storageIdentifier?: string;
  @Input() height?: string;
  @Input() masterDetailTemplate!: TemplateRef<any>;

  public height$ = new BehaviorSubject<string|undefined>('100%');
  public storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);

  public summary$: Observable<DatagridSummary|undefined>;

  private _gridLayout$ = new BehaviorSubject<GridLayout|undefined>(undefined);

  public columns$: Observable<Column[]|undefined>;
  public dataSource$: Observable<DataSource|undefined>;
  public mode$: Observable<'large'|'medium'|'small'>;
  public headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

  public editLayoutIdentifier$: Observable<string|undefined>;

  public exportFileName$: Observable<string|undefined>;

  public showAdd$: Observable<boolean>;
  public showPrint$: Observable<boolean>;
  public showImport$: Observable<boolean>;
  public showExport$: Observable<boolean>;

  private selectAddRequest$ = new Subject<{ target: Element }>();

  private functionAllowed: ((identifier: FunctionIdentifier, data: CrudItem) => boolean)|undefined;

  public get gridLayout$(): Observable<GridLayout|undefined> {
    return this._gridLayout$;
  }

  constructor(
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(META_SERVICE) private metaService: MetaService,
    @Inject(CRUD_SERVICE) private crudService: CrudService,
    private dataSourceService: DataSourceService,
    @Inject(TRANSLATOR) private translator: Translator,
    @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService) {

    super();

    this.isMasterDetailExpandable = this.isMasterDetailExpandable.bind(this);

    this.mode$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => (screenSize >= SCREEN_SIZE.LG ? 'large' : (screenSize >= SCREEN_SIZE.MD ? 'medium' : 'small'))));

    this.exportFileName$ = this.metaService.displayName$
      .pipe(map((displayName) => `${displayName}_${moment().format('YYYYMMDD')}`));

    this.headCustomFunctions$ = this.crudService.headCustomFunctions$;

    this.showAdd$ = this.crudService.addMenuItems$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((addMenuItems) => (addMenuItems ?? []).length > 0));

    this.showPrint$ = combineLatest([this.metaService.entityDocuments$, this._gridLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([entityDocuments, gridLayout]) => (entityDocuments && gridLayout && gridLayout.allowMultiselect && entityDocuments.length > 0) ?? false));

    this.showExport$ = this.crudService.exportMenuItems$
      .pipe(map((exportMenuItems) => (exportMenuItems ?? []).length > 0));

    this.showImport$ = this.crudService.importMenuItems$
      .pipe(map((importMenuItems) => (importMenuItems ?? []).length > 0));

    this.editLayoutIdentifier$ = this._gridLayout$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((gridLayout) => gridLayout?.editLayout ?? gridLayout?.identifier ?? 'primary'));

    this.columns$ = combineLatest([
      this.responsiveService.onResize$,
      this.editLayoutIdentifier$,
      this.metaService.headParams$,
      this._gridLayout$,
      this.lookupService.lookups$,
      this.crudService.functionAllowed$,
      this.crudService.functionExecute$
    ])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([screenSize, editLayoutIdentifier, headParams, gridLayout, lookups, buttonAllowed, buttonClicked]) => (editLayoutIdentifier && headParams && buttonAllowed && buttonClicked) ? createColumnConfiguration<Column>(
        (key, options) => this.translator(key, options),
        gridLayout?.columns ?? [],
        lookups,
        headParams,
        (screenSize >= SCREEN_SIZE.LG ? 'large' : (screenSize >= SCREEN_SIZE.MD ? 'medium' : 'small')),
        (button, data, target) => buttonClicked(button, editLayoutIdentifier, data, target),
        buttonAllowed) : undefined));

    this.summary$ = this._gridLayout$.pipe(map((gridLayout) => (gridLayout && gridLayout.summaries) ? createSummaryConfiguration(gridLayout) : undefined));

    this.dataSource$ = this.dataSourceService.dataSource$;

    combineLatest([this.selectAddRequest$, this.editLayoutIdentifier$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([selectAddRequest, editLayoutIdentifier]) => {
        if (selectAddRequest && editLayoutIdentifier) {
          this.crudService.selectAdd({ target: selectAddRequest.target, defaultEditLayout: editLayoutIdentifier });
        }
      });

    this.crudService.functionAllowed$
      .pipe(takeUntil(this.destroy$))
      .subscribe((functionAllowed) => {
        this.functionAllowed = functionAllowed;
      });
  }

  public onReloadClicked() {
    this.crudService.reload();
  }

  public onCustomFunctionClicked(e: { items: Array<CrudItem>, target: Element, customFunction: EntityCustomFunction }) {    
    this.crudService.customEdit({
      customFunction: e.customFunction,
      items: e.items
    });
  }

  public onAddClicked(e: { target: Element }) {

    this.selectAddRequest$.next({ target: e.target });
  }

  public onPrintClicked(e: { items: Array<CrudItem>, target: Element }) {
    this.crudService.selectPrint({ items: e.items, target: e.target });    
  }

  public onExportClicked(e: { items: Array<CrudItem>, target: Element }) {
    this.crudService.selectExport({ items: e.items, target: e.target });
  }

  public onImportClicked(e: { target: Element }) {
    this.crudService.selectImport({ target: e.target });
  }

  public onRowDblClicked(e: { item: CrudItem, target: Element }) {
    this.crudService.selectOptions({ item: e.item, target: e.target, defaultEditLayout: 'primary' });
  }

  public isMasterDetailExpandable(e: { data: CrudItem }): boolean {
    return (this.functionAllowed && this.functionAllowed('view', e.data)) ?? false;
  }

  ngOnInit(): void {
    if (this.gridLayout) {
      this._gridLayout$.next(this.gridLayout);
    }

    this.storageIdentifier$.next(this.storageIdentifier);
    this.height$.next(this.height ?? '100%');
  }
}
