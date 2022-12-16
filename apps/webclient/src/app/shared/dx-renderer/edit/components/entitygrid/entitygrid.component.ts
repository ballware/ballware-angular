import { Component, Input, OnInit } from '@angular/core';
import { CrudService, MetaService, LookupService, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { EntityCustomFunction, GridLayout } from '@ballware/meta-model';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';
import { dxDataGridColumn } from 'devextreme/ui/data_grid';
import { createColumnConfiguration } from '../../../utils/columns';
import { I18NextPipe, PipeOptions } from 'angular-i18next';
import DataSource from 'devextreme/data/data_source';
import { createEditableGridDatasource } from '../../../utils/datasource';
import { BehaviorSubject } from 'rxjs';
import { WithDestroy } from '../../../utils/withdestroy';
import { Observable } from 'rxjs';

@Component({
  selector: 'ballware-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: ['./entitygrid.component.scss']
})
export class EntitygridComponent extends WithDestroy() implements OnInit {

  @Input() gridLayout?: GridLayout;
  @Input() storageIdentifier?: string;
  @Input() height?: string;

  public height$ = new BehaviorSubject<string|undefined>('100%');
  public storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  public layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);

  public summary$ = new BehaviorSubject<object|undefined>(undefined);

  private _gridLayout$ = new BehaviorSubject<GridLayout|undefined>(undefined);

  public columns$: Observable<dxDataGridColumn[]|undefined>;
  public dataSource$: Observable<DataSource|undefined>;
  public mode$: Observable<'large'|'medium'|'small'>;
  public headCustomFunctions$: Observable<EntityCustomFunction[]|undefined>;

  public editLayoutIdentifier$: Observable<string|undefined>;

  public showAdd$: Observable<boolean>;
  public showPrint$: Observable<boolean>;
  public showImport$: Observable<boolean>;
  public showExport$: Observable<boolean>;

  private selectAddRequest$ = new Subject<{ target: Element }>();

  public get gridLayout$(): Observable<GridLayout|undefined> {
    return this._gridLayout$;
  }

  constructor(
    private lookupService: LookupService,
    private metaService: MetaService,
    private crudService: CrudService,
    private translationService: I18NextPipe,
    private responsiveService: ResponsiveService) {

    super();

    this.mode$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => (screenSize >= SCREEN_SIZE.LG ? 'large' : (screenSize >= SCREEN_SIZE.MD ? 'medium' : 'small'))));

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
      .pipe(map(([screenSize, editLayoutIdentifier, headParams, gridLayout, lookups, buttonAllowed, buttonClicked]) => (editLayoutIdentifier && headParams && buttonAllowed && buttonClicked) ? createColumnConfiguration<dxDataGridColumn>(
        (key: string, options?: PipeOptions) => this.translationService.transform(key, options),
        gridLayout?.columns ?? [],
        lookups,
        headParams,
        (screenSize >= SCREEN_SIZE.LG ? 'large' : (screenSize >= SCREEN_SIZE.MD ? 'medium' : 'small')),
        (button, data, target) => buttonClicked(button, editLayoutIdentifier, data, target),
        buttonAllowed) : undefined));

    this.dataSource$ = combineLatest([this.crudService.fetchedItems$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([fetchedItems]) => fetchedItems ? createEditableGridDatasource(fetchedItems, (item) => {}) : undefined));

    combineLatest([this.selectAddRequest$, this.editLayoutIdentifier$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([selectAddRequest, editLayoutIdentifier]) => {
        if (selectAddRequest && editLayoutIdentifier) {
          this.crudService.selectAdd(selectAddRequest.target, editLayoutIdentifier);
        }
      });
  }

  public onReloadClicked(e: {}) {
    this.crudService.reload();
  }

  public onCustomFunctionClicked() {

  }

  public onAddClicked(e: { target: Element }) {

    this.selectAddRequest$.next({ target: e.target });
  }

  public onPrintClicked() {}

  public onExportClicked() {}

  public onImportClicked() {}

  public onRowDblClicked() {}

  public isMasterDetailExpandable(): boolean {
    return false;
  }

  public get exportFileName(): string {
    return "";
  }

  ngOnInit(): void {
    if (this.gridLayout) {
      this._gridLayout$.next(this.gridLayout);
    }

    this.storageIdentifier$.next(this.storageIdentifier);
    this.height$.next(this.height ?? '100%');
  }
}
