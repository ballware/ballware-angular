import {
  DestroyRef,
  Inject,
  InjectionToken
} from '@angular/core';
import {
  COLUMN_EDITOR_CELL,
  COLUMN_LOOKUP_PARAMS,
  ColumnEditCellTemplateData,
  ColumnEditorDelegateService,
} from './columneditordelegate.service';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  EDIT_SERVICE,
  EditItemRef,
  EditService,
  LOOKUP_SERVICE,
  LookupService,
  Translator,
  TRANSLATOR,
} from '@ballware/meta-services';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import {
  LOOKUP_DELEGATE_BUILDER_FACTORY,
  LookupDelegate,
  LookupDelegateBuilderFactory,
} from '../utils';
import { DetailCollectionEditing } from '../directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RequiredRule, ValidationRule } from 'devextreme/common';
import { cloneDeep, get } from 'lodash';

export const DETAIL_COLUMN_DATAMEMBER = new InjectionToken<string>('Detail column data member');

export class DetailColumnEditorDelegateService implements ColumnEditorDelegateService {
  private _prepared$ = new BehaviorSubject<boolean>(false);
  private _preparedColumn$ = new BehaviorSubject<GridLayoutColumn | undefined>(undefined);

  private _value$ = new BehaviorSubject<unknown>(undefined);
  private _valueChanged$ = new BehaviorSubject<
    | ((
    editor: EditItemRef,
    value: unknown
  ) => void)
    | undefined
  >(undefined);

  private _readonly$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _lookup$ = new BehaviorSubject<LookupDelegate | undefined>(undefined);

  get prepared$() {
    return this._prepared$;
  }

  get preparedColumn$() {
    return this._preparedColumn$;
  }

  get value$() {
    return this._value$;
  }

  get valueChanged$() {
    return this._valueChanged$;
  }

  get readonly$() {
    return this._readonly$;
  }

  get lookup$() {
    return this._lookup$;
  }

  identifier!: string;
  column!: GridLayoutColumn;
  row!: Record<string, unknown>;
  rowIndex!: number;

  public requiredValidation$ = new BehaviorSubject<boolean>(false);

  public validationRules$: Observable<Array<ValidationRule>>|undefined;

  constructor(
    @Inject(TRANSLATOR) private readonly translator: Translator,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(EDIT_SERVICE) private readonly editService: EditService,
    @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY) private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory,
    @Inject(DETAIL_COLUMN_DATAMEMBER) public readonly dataMember: string,
    @Inject(COLUMN_LOOKUP_PARAMS) private readonly lookupParams: Record<string, unknown>,
    @Inject(COLUMN_EDITOR_CELL) private readonly cell: ColumnEditCellTemplateData,
    private readonly editing: DetailCollectionEditing,
    private readonly destroy: DestroyRef) {
    this.validationRules$ = combineLatest([this.requiredValidation$, this.preparedColumn$]).pipe(
      takeUntilDestroyed(this.destroy),
      map(([required, preparedColumn]) => {
        const validationRules = [] as ValidationRule[];

        if (required && preparedColumn) {
          validationRules.push({
            type: 'required',
            message: this.translator('validation.messages.required', { label: preparedColumn.caption })
          } as RequiredRule);
        }

        return validationRules;
      })
    );

    this.validationRules$.pipe(
      takeUntilDestroyed(this.destroy),
    ).subscribe((rules) => {
      this.cell.column.validationRules = rules;
    });

    if (this.cell) {
      this.identifier = this.cell.column.editorOptions.dataMember;
      this.row = this.cell.data;
      this.rowIndex = this.cell.rowIndex;
      this.column = this.cell.column.editorOptions;
    }

    if (this.row && this.identifier) {
      this._value$.next(get(this.row, this.identifier) as unknown[] || []);
    }

    combineLatest([
      this.lookupService.lookups$,
      this.lookupService.getGenericLookupByIdentifier$,
      this.editService.detailGridCellPreparing$])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(([lookups, getGenericLookupByIdentifier, detailGridCellPreparing]) => {
        if (lookups && getGenericLookupByIdentifier && detailGridCellPreparing) {
          const preparedColumn = detailGridCellPreparing({
            dataMember: this.dataMember,
            detailItem: this.row,
            identifier: this.identifier,
            options: cloneDeep(this.column)
          });

          this._preparedColumn$.next(preparedColumn);

          this._valueChanged$.next((e, value) => {
            this.cell.setValue(value);

            if (this.editing.detailEditorValueChanged) {
              this.editing.detailEditorValueChanged(this.dataMember, this.rowIndex, this.row, this.identifier, value, true);
            }
          });

          this.requiredValidation$.next(preparedColumn.required ?? false);
          this._readonly$.next(!this.cell.column.allowEditing || !(preparedColumn.editable));

          const lookupBuilder = this.createLookupDelegateBuilder(lookups);

          if (preparedColumn.items) {
            lookupBuilder.forStaticItems(preparedColumn.items);
          } else if (preparedColumn.itemsMember) {
            lookupBuilder.forItemsFromMember(preparedColumn.itemsMember, (member) => get(this.row, member) as Array<Record<string, unknown>>);
          } else if (preparedColumn.lookupMember) {
            lookupBuilder.forItemsFromMember(preparedColumn.lookupMember, (member) => get(this.lookupParams, member) as Array<Record<string, unknown>>);
          } else if (preparedColumn.lookup) {
            lookupBuilder.forIdentifier(preparedColumn.lookup);

            if (preparedColumn.lookupParam) {
              lookupBuilder.withParamFromMember(preparedColumn.lookupParam, (member) => get(this.lookupParams, member) as string);
            } else if (preparedColumn.pickvalueEntity && preparedColumn.pickvalueField) {
              lookupBuilder.withPickvaluesForEntityAndField(preparedColumn.pickvalueEntity, preparedColumn.pickvalueField);
            }
          }

          lookupBuilder.withUnknownLookupFallback(getGenericLookupByIdentifier);
          lookupBuilder.withValueExpr(preparedColumn.valueExpr);
          lookupBuilder.withDisplayExpr(preparedColumn.displayExpr);
          lookupBuilder.withAcceptCustomValue(preparedColumn.acceptCustomValue);

          this._lookup$.next(lookupBuilder.build());
          this._prepared$.next(true);
        }
      });
  }
}
