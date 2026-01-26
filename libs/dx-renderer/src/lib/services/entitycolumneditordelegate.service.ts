import { DestroyRef, Directive, Inject } from '@angular/core';
import {
  COLUMN_EDITOR_CELL,
  COLUMN_LOOKUP_PARAMS,
  ColumnEditCellTemplateData,
  ColumnEditorDelegateService,
} from './columneditordelegate.service';
import {
  EditItemRef,
  EditModes,
  LOOKUP_SERVICE,
  LookupService,
  META_SERVICE,
  MetaService,
  NOTIFICATION_SERVICE,
  NotificationService,
  Translator,
  TRANSLATOR,
} from '@ballware/meta-services';
import {
  LookupDelegate
} from '../utils';
import { cloneDeep, get, set } from 'lodash';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditUtil, GridLayoutColumn, ValueType } from '@ballware/meta-model';
import { RequiredRule, ValidationRule } from 'devextreme/common';
import { createColumnLookupDelegate } from '../components/utils';

@Directive({
  standalone: true,
})
export class EntityColumnEditorDelegateService
  implements ColumnEditorDelegateService
{
  private _prepared$ = new BehaviorSubject<boolean>(false);
  private _preparedColumn$ = new BehaviorSubject<GridLayoutColumn | undefined>(
    undefined
  );

  private _value$ = new BehaviorSubject<unknown>(undefined);

  private _readonly$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _lookup$ = new BehaviorSubject<LookupDelegate | undefined>(undefined);

  private _editorValueChanged:
    | ((
        mode: EditModes,
        item: Record<string, unknown>,
        editUtil: EditUtil,
        identifier: string,
        value: ValueType
      ) => void)
    | undefined;

  private _editorEvent:
    | ((
        mode: EditModes,
        item: Record<string, unknown>,
        editUtil: EditUtil,
        identifier: string,
        event: string
      ) => void)
    | undefined;

  identifier!: string;
  column!: GridLayoutColumn;
  row!: Record<string, unknown>;
  rowIndex!: number;

  get prepared$() {
    return this._prepared$;
  }

  get preparedColumn$() {
    return this._preparedColumn$;
  }

  get value$() {
    return this._value$;
  }

  get readonly$() {
    return this._readonly$;
  }

  get lookup$() {
    return this._lookup$;
  }

  public requiredValidation$ = new BehaviorSubject<boolean>(false);

  public validationRules$: Observable<Array<ValidationRule>> | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(TRANSLATOR) private readonly translator: Translator,
    @Inject(NOTIFICATION_SERVICE) private readonly notificationService: NotificationService,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(META_SERVICE) private readonly metaService: MetaService,
    @Inject(COLUMN_LOOKUP_PARAMS)
    private readonly lookupParams: Record<string, unknown>,
    @Inject(COLUMN_EDITOR_CELL)
    private readonly cell: ColumnEditCellTemplateData
  ) {
    this.metaService.editorValueChanged$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(
        (editorValueChanged) => (this._editorValueChanged = editorValueChanged)
      );

    this.metaService.editorEvent$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(editorEvent => this._editorEvent = editorEvent);

    this.validationRules$ = combineLatest([
      this.requiredValidation$,
      this.preparedColumn$,
    ]).pipe(
      takeUntilDestroyed(this.destroy),
      map(([required, preparedColumn]) => {
        const validationRules = [] as ValidationRule[];

        if (required && preparedColumn) {
          validationRules.push({
            type: 'required',
            message: this.translator('validation.messages.required', {
              label: preparedColumn.caption,
            }),
          } as RequiredRule);
        }

        return validationRules;
      })
    );

    if (this.cell) {
      this.identifier = this.cell.column.editorOptions.dataMember;
      this.row = this.cell.data;
      this.rowIndex = this.cell.rowIndex;
      this.column = this.cell.column.editorOptions;
    }

    if (this.row && this.identifier) {
      this._value$.next(get(this.row, this.identifier));
    }

    combineLatest([
      this.lookupService.lookups$,
      this.lookupService.getGenericLookupByIdentifier$,
      this.metaService.editorValueChanged$,
      this.metaService.editorEvent$,
    ])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(
        ([
          lookups,
          getGenericLookupByIdentifier,
          editorValueChanged,
          editorEvent,
        ]) => {
          if (
            lookups &&
            getGenericLookupByIdentifier &&
            editorValueChanged &&
            editorEvent
          ) {
            const preparedColumn = cloneDeep(
              this.cell.column.editorOptions
            ) as GridLayoutColumn;

            this._preparedColumn$.next(preparedColumn);
            this._readonly$.next(!this.cell.column.allowEditing);

            const lookupDelegate = createColumnLookupDelegate(preparedColumn, lookups, getGenericLookupByIdentifier, this.lookupParams, this.row, this.notificationService);

            this._lookup$.next(lookupDelegate);
            this._prepared$.next(true);
          }
        }
      );
  }

  readonly valueChanged = (editor: EditItemRef, value: unknown) => {
    if (!this._editorValueChanged) {
      throw new Error('Editor not initialized');
    }

    this.cell.setValue(value);

    const editUtil = {
      getEditorOption: (dataMember, option) =>
        dataMember === this.identifier ? editor.getOption(option) : undefined,
      setEditorOption: (dataMember, option, value) =>
        dataMember === this.identifier && editor.setOption(option, value),
      apply: () =>
        console.warn('Apply in DynamicColumnComponent not implemented'),
      cancel: () =>
        console.warn('Cancel in DynamicColumnComponent not implemented'),
    } as EditUtil;

    set(this.row, this.identifier, value);
    this._value$.next(get(this.row, this.identifier));

    this._editorValueChanged(
      this.cell.column.allowEditing ? EditModes.EDIT : EditModes.VIEW,
      this.row,
      editUtil,
      this.identifier,
      value as ValueType
    );
  };

  readonly raiseEvent = (editor: EditItemRef, event: string) => {

    if (!this._editorEvent) {
      throw new Error('Editor not initialized');
    }

    const editUtil = {
      getEditorOption: (dataMember, option) =>
        dataMember === this.identifier ? editor.getOption(option) : undefined,
      setEditorOption: (dataMember, option, value) =>
        dataMember === this.identifier && editor.setOption(option, value),
      apply: () =>
        console.warn('Apply in DynamicColumnComponent not implemented'),
      cancel: () =>
        console.warn('Cancel in DynamicColumnComponent not implemented'),
    } as EditUtil;

    this._editorEvent(
      this.cell.column.allowEditing ? EditModes.EDIT : EditModes.VIEW,
      this.row,
      editUtil,
      this.identifier,
      event
    );
  };

  readonly openColumnPopup = (): void => {
    throw new Error('openColumnPopup not implemented for entity columns');
  };
}
