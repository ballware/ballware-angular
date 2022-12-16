import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, combineLatest, map, Observable, takeUntil } from 'rxjs';
import { EditLayout, EditLayoutItem, EditUtil, ValueType } from '@ballware/meta-model';
import { getByPath, setByPath } from './databinding';
import { EditItemRef } from './edititemref';
import { EditModes } from './editmodes';
import { MetaService } from './meta.service';
import { WithDestroy } from './withdestroy';

@Injectable()
export class EditService extends WithDestroy() implements EditUtil {

  private validator: (() => boolean)|undefined = undefined;

  private item$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);

  private editItems: Record<string, EditItemRef|undefined> = {};

  public mode$ = new BehaviorSubject<EditModes|undefined>(undefined);
  public editLayout$ = new BehaviorSubject<EditLayout|undefined>(undefined);

  public getValue$: Observable<((dataMember: string) => unknown)|undefined>;
  public setValue$: Observable<((dataMember: string, value: unknown) => void)|undefined>;

  public editorPreparing$: Observable<((dataMember: string, item: EditLayoutItem) => void)|undefined>;
  public editorInitialized$: Observable<((dataMember: string, ref: EditItemRef) => void)|undefined>;
  public editorValidating$: Observable<((dataMember: string, ruleIdentifier: string, value: ValueType) => boolean)|undefined>;
  public editorValueChanged$: Observable<((dataMember: string, value: ValueType, notify: boolean) => void)|undefined>;
  public editorEntered$: Observable<((dataMember: string) => void)|undefined>;
  public editorEvent$: Observable<((dataMember: string, event: string) => void)|undefined>;

  public readonly$ = new BehaviorSubject<boolean|undefined>(undefined);

  constructor(private metaService: MetaService) {
    super();

    this.getValue$ = this.item$.pipe(takeUntil(this.destroy$))
      .pipe(map((item) => item ? (dataMember: string) => getByPath(item, dataMember) : undefined ));

    this.setValue$ = this.item$.pipe(takeUntil(this.destroy$))
      .pipe(map((item) => item ? (dataMember: string, value: unknown) => {
        setByPath(item, dataMember, value);
      } : undefined ));

    this.editorPreparing$ = combineLatest([this.mode$, this.item$, this.metaService.editorPreparing$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, editorPreparing]) => (mode && item && editorPreparing)
        ? (dataMember, layoutItem) => editorPreparing(mode, item, layoutItem, dataMember)
        : undefined));

    this.editorInitialized$ = combineLatest([this.mode$, this.item$, this.metaService.editorInitialized$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, editorInitialized]) => (mode && item && editorInitialized)
        ? (dataMember, ref) => {
          this.editItems[dataMember] = ref;
          editorInitialized(mode, item, this, dataMember);
        }
        : undefined));

    this.editorValidating$ = combineLatest([this.mode$, this.item$, this.metaService.editorValidating$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, editorValidating]) => (mode && item && editorValidating)
        ? (dataMember, ruleIdentifier, value) => editorValidating(mode, item, this, dataMember, value, ruleIdentifier)
        : undefined));

    this.editorValueChanged$ = combineLatest([this.mode$, this.item$, this.setValue$, this.metaService.editorValueChanged$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, setValue, editorValueChanged]) => (mode && item && setValue && editorValueChanged)
        ? (dataMember, value, notify) => {
          setValue(dataMember, value);

          if (notify) {
            editorValueChanged(mode, item, this, dataMember, value);
          }
        }
        : undefined));

    this.editorEntered$ = combineLatest([this.mode$, this.item$, this.metaService.editorEntered$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, editorEntered]) => (mode && item && editorEntered)
        ? (dataMember) => editorEntered(mode, item, this, dataMember)
        : undefined));

    this.editorEvent$ = combineLatest([this.mode$, this.item$, this.metaService.editorEvent$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([mode, item, editorEvent]) => (mode && item && editorEvent)
        ? (dataMember, event) => editorEvent(mode, item, this, dataMember, event)
        : undefined));
  }

  public getEditorOption(dataMember: string, option: string) {
    return this.editItems[dataMember]?.getOption(option);
  }

  public setEditorOption(dataMember: string, option: string, value: unknown) {
    this.editItems[dataMember]?.setOption(option, value);
  }

  public setMode(mode: EditModes) {
    this.mode$.next(mode);
    this.readonly$.next(mode === EditModes.VIEW);
  }

  public setItem(item: Record<string, unknown>) {
    this.item$.next(cloneDeep(item));
  }

  public setEditLayout(editLayout: EditLayout) {
    this.editLayout$.next(editLayout);
  }

  public setValidator(validator: (() => boolean)|undefined) {
    this.validator = validator;
  }

  public validate(): boolean {
    return this.validator ? this.validator() : true;
  }
}
