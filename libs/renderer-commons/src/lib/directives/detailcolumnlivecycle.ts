import { GridLayoutColumn } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from "@ballware/meta-services";
import { BehaviorSubject, Observable, Subject, combineLatest, map } from 'rxjs';
import { DestroyRef, Directive, Inject, Input, OnInit } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cloneDeep } from 'lodash';
import { ColumnEditCellTemplateData as DataGridColumnEditCellTemplateData } from 'devextreme/ui/data_grid';
import { ColumnEditCellTemplateData as TreeListColumnEditCellTemplateData } from 'devextreme/ui/tree_list';

@Directive({
  hostDirectives: [Breadcrumb],
  standalone: true
})
export class DetailColumnLivecycle implements OnInit, EditItemRef {
  @Input() initialColumn!: GridLayoutColumn;
  @Input() cell!: DataGridColumnEditCellTemplateData | TreeListColumnEditCellTemplateData;
  @Input() item!: Record<string, unknown>;
  @Input() dataMember!: string;

  identifier!: string;
  column!: GridLayoutColumn;
  detailItem!: Record<string, unknown>;
  detailItemIndex!: number;

  private readonly _optionRegistry = new Array<{ option: string, getter: () => unknown, setter: (value: unknown) => void }>();
  private readonly _preparedColumn$ = new BehaviorSubject<GridLayoutColumn|undefined>(undefined);

  private readonly _editorEntered$ = new Subject<void>();
  private readonly _editorEvent$ = new Subject<{ event: string }>();

  get preparedColumn$(): Observable<GridLayoutColumn|undefined> {
    return this._preparedColumn$;
  }

  readonly registerOption = (option: string, getter: () => unknown, setter: (value: unknown) => void) => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      registeredOption.getter = getter;
      registeredOption.setter = setter;
    } else {
      this._optionRegistry.push({ option, getter, setter });
    }
  }

  readonly onEntered = () => this._editorEntered$.next();
  readonly onEvent = (event: string) => this._editorEvent$.next({ event });

  readonly getOption = (option: string): unknown => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      return registeredOption.getter();
    }

    throw new Error(`Unsupported option <${option}>`);
  }

  readonly setOption = (option: string, value: unknown) => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      registeredOption.setter(value);

      return;
    }

    throw new Error(`Unsupported option <${option}>`);
  }

  constructor(private readonly destroy: DestroyRef,
              @Inject(EDIT_SERVICE) private readonly editService: EditService,
              private readonly breadcrumb: Breadcrumb ) {}

  ngOnInit(): void {
    this.identifier = this.cell.column.editorOptions.dataMember;
    this.detailItem = this.cell.data;
    this.detailItemIndex = this.cell.rowIndex;
    this.column = this.cell.column.editorOptions;

    combineLatest([this.editService.detailGridCellPreparing$]).pipe(
      takeUntilDestroyed(this.destroy),
      map(([cellPreparing]) => {
          if (cellPreparing) {
            let preparedColumn: GridLayoutColumn;

            if (this.initialColumn.dataMember) {
              preparedColumn = cellPreparing({
                dataMember: this.initialColumn.dataMember,
                detailItem: this.detailItem,
                identifier: this.identifier,
                options: cloneDeep(this.initialColumn)
              });
            } else {
              preparedColumn = cloneDeep(this.initialColumn);
            }

            return preparedColumn;
          }

          return undefined;
        }
      ))
      .subscribe((preparedLayoutItem) => this._preparedColumn$.next(preparedLayoutItem));

    combineLatest([this.preparedColumn$, this.editService.detailEditorInitialized$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([preparedColumn, detailEditorInitialized]) => {
        if (preparedColumn && detailEditorInitialized && preparedColumn.dataMember) {
          detailEditorInitialized({
            dataMember: this.dataMember,
            detailItem: this.detailItem,
            detailItemIndex: this.detailItemIndex,
            identifier: this.identifier,
            component: this
          });

          this.breadcrumb.setIdentifier(`${this.detailItemIndex}.${this.identifier}`);
          this.column = preparedColumn;
        }
      });

    combineLatest([this.editService.detailEditorEntered$, this._editorEntered$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([editorEntered,]) => {
        if (editorEntered && this.column.dataMember) {
          editorEntered({
            dataMember: this.dataMember,
            detailItem: this.detailItem,
            detailItemIndex: this.detailItemIndex,
            identifier: this.identifier,
          });
        }
      });

    combineLatest([this.editService.detailEditorEvent$, this._editorEvent$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([editorEvent, { event }]) => {
        if (editorEvent && this.column.dataMember) {
          editorEvent({
            dataMember: this.dataMember,
            detailItem: this.detailItem,
            detailItemIndex: this.detailItemIndex,
            identifier: this.identifier,
            event
          });
        }
      });
  }
}
