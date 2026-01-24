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
  Translator,
  TRANSLATOR,
} from '@ballware/meta-services';
import {
  LOOKUP_DELEGATE_BUILDER_FACTORY,
  LookupDelegate,
  LookupDelegateBuilderFactory,
} from '../utils';
import { cloneDeep, get, set } from 'lodash';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditUtil, GridLayoutColumn, ValueType } from '@ballware/meta-model';
import { RequiredRule, ValidationRule } from 'devextreme/common';

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
  private _valueChanged$ = new BehaviorSubject<
    ((editor: EditItemRef, value: unknown) => void) | undefined
  >(undefined);
  private _raiseEvent$ = new BehaviorSubject<
    ((editor: EditItemRef, identifier: string) => void) | undefined
  >(undefined);
  private _openColumnPopup$ = new BehaviorSubject<(() => void) | undefined>(
    undefined
  );

  private _readonly$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _lookup$ = new BehaviorSubject<LookupDelegate | undefined>(undefined);

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

  get valueChanged$() {
    return this._valueChanged$;
  }

  get raiseEvent$() {
    return this._raiseEvent$;
  }

  get openColumnPopup$() {
    return this._openColumnPopup$;
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
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(META_SERVICE) private readonly metaService: MetaService,
    @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY)
    private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory,
    @Inject(COLUMN_LOOKUP_PARAMS)
    private readonly lookupParams: Record<string, unknown>,
    @Inject(COLUMN_EDITOR_CELL)
    private readonly cell: ColumnEditCellTemplateData
  ) {
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

            this._valueChanged$.next((e, value) => {
              const editUtil = {
                getEditorOption: (dataMember, option) =>
                  dataMember === this.identifier
                    ? e.getOption(option)
                    : undefined,
                setEditorOption: (dataMember, option, value) =>
                  dataMember === this.identifier && e.setOption(option, value),
                apply: () =>
                  console.warn(
                    'Apply in DynamicColumnComponent not implemented'
                  ),
                cancel: () =>
                  console.warn(
                    'Cancel in DynamicColumnComponent not implemented'
                  ),
              } as EditUtil;

              set(this.row, this.identifier, value);
              this._value$.next(get(this.row, this.identifier));

              editorValueChanged(
                this.cell.column.allowEditing ? EditModes.EDIT : EditModes.VIEW,
                this.row,
                editUtil,
                this.identifier,
                value as ValueType
              );
            });

            this._raiseEvent$.next((e, identifier) => {
              const editUtil = {
                getEditorOption: (dataMember, option) =>
                  dataMember === this.identifier
                    ? e.getOption(option)
                    : undefined,
                setEditorOption: (dataMember, option, value) =>
                  dataMember === this.identifier && e.setOption(option, value),
                apply: () =>
                  console.warn(
                    'Apply in DynamicColumnComponent not implemented'
                  ),
                cancel: () =>
                  console.warn(
                    'Cancel in DynamicColumnComponent not implemented'
                  ),
              } as EditUtil;

              editorEvent(
                this.cell.column.allowEditing ? EditModes.EDIT : EditModes.VIEW,
                this.row,
                editUtil,
                this.identifier,
                identifier
              );
            });

            this._preparedColumn$.next(preparedColumn);
            this._readonly$.next(!this.cell.column.allowEditing);

            const lookupBuilder = this.createLookupDelegateBuilder(lookups);

            if (preparedColumn.items) {
              lookupBuilder.forStaticItems(preparedColumn.items);
            } else if (preparedColumn.itemsMember) {
              lookupBuilder.forItemsFromMember(
                preparedColumn.itemsMember,
                (member) =>
                  get(this.row, member) as Array<Record<string, unknown>>
              );
            } else if (preparedColumn.lookupMember) {
              lookupBuilder.forItemsFromMember(
                preparedColumn.lookupMember,
                (member) =>
                  get(this.lookupParams, member) as Array<
                    Record<string, unknown>
                  >
              );
            } else if (preparedColumn.lookup) {
              lookupBuilder.forIdentifier(preparedColumn.lookup);

              if (preparedColumn.lookupParam) {
                lookupBuilder.withParamFromMember(
                  preparedColumn.lookupParam,
                  (member) => get(this.lookupParams, member) as string
                );
              } else if (
                preparedColumn.pickvalueEntity &&
                preparedColumn.pickvalueField
              ) {
                lookupBuilder.withPickvaluesForEntityAndField(
                  preparedColumn.pickvalueEntity,
                  preparedColumn.pickvalueField
                );
              }
            }

            lookupBuilder.withUnknownLookupFallback(
              getGenericLookupByIdentifier
            );
            lookupBuilder.withValueExpr(preparedColumn.valueExpr);
            lookupBuilder.withDisplayExpr(preparedColumn.displayExpr);

            this._lookup$.next(lookupBuilder.build());
            this._prepared$.next(true);
          }
        }
      );
  }
}
