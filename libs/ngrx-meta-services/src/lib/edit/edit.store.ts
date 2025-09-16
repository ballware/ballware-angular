import { OnDestroy } from "@angular/core";
import { EditLayout, EditLayoutItem, EditUtil, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual, get, set } from "lodash";
import {
  combineLatest,
  distinctUntilChanged,
  Observable,
  of,
  switchMap,
  takeUntil,
  throwError,
  withLatestFrom
} from 'rxjs';
import { editDestroyed, editUpdated } from "../component";
import { EditService, EditItemRef, EditModes, MetaService, InteractionService } from "@ballware/meta-services";
import { EditState } from "./edit.state";

interface DetailEditUtil extends EditUtil {
    getDetailEditorOption: (identifier: string, option: string) => unknown;
    setDetailEditorOption: (identifier: string, option: string, value: unknown) => void;
    getDetailItem: () => Record<string, unknown>;
    getDetailItemIndex: () => number;
}

export class EditStore extends ComponentStore<EditState> implements OnDestroy, EditService {

    private editItems: Record<string, EditItemRef|undefined> = {};
    private applyMethod?: (editUtil: EditUtil, item: Record<string, unknown>, continueAfterSave: boolean) => void;
    private cancelMethod?: () => void;
    private validatorMethod?: () => boolean;

    constructor(private store: Store, private interactionService: InteractionService, private metaService: MetaService) {
        super({});

        this.interactionService.keyboardLine$
            .pipe(takeUntil(this.destroy$))
            .pipe(withLatestFrom(this.mode$, this.item$, this.metaService.ready$))
            .subscribe(([keyboardLine, mode, item, metaReady]) => {
                if (keyboardLine && mode && item && metaReady) {
                    this.metaService.interactionKeyboardLine({ mode, item, editUtil: this.editUtil(), value: keyboardLine });
                }
            });

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                if (state.identifier) {
                    this.store.dispatch(editUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Edit state update');
                    console.debug(state);
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(editDestroyed({ identifier: state.identifier }));
                }
            });
    }

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));

    readonly entity$ = this.select(state => state.entity);
    readonly item$ = this.select(state => state.item);
    readonly mode$ = this.select(state => state.mode);
    readonly editLayout$ = this.select(state => state.editLayout);
    readonly readonly$ = this.select(state => state.readonly);

    readonly setMode = this.updater((state, mode: EditModes) => ({
        ...state,
        mode,
        readonly: mode === EditModes.VIEW
    }));

    readonly setEntity = this.updater((state, entity: string) => ({
        ...state,
        entity
    }));

    readonly setItem = this.updater((state, item: Record<string, unknown>) => ({
        ...state,
        item
    }));

    readonly setEditLayout = this.updater((state, editLayout: EditLayout) => ({
        ...state,
        editLayout
    }));

    readonly validate = () => of(this.validatorMethod ? this.validatorMethod() : true);

    readonly setValidator = (validatorMethod: () => boolean) => {
      this.validatorMethod = validatorMethod;
    }

    readonly setApply = (applyMethod: (editUtil: EditUtil, item: Record<string, unknown>, continueAfterSave: boolean) => void) => {
        this.applyMethod = applyMethod;
    }

    readonly setCancel= (cancelMethod: () => void) => {
        this.cancelMethod = cancelMethod;
    }

    readonly editUtil = () => ({
            getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
            setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value }),
            apply: (editUtil, item, continueAfterSave) => this.applyMethod && this.applyMethod(editUtil, item, continueAfterSave),
            cancel: () => this.cancelMethod && this.cancelMethod()
        } as EditUtil);


    readonly detailEditUtil = (dataMember: string, detailItem: Record<string, unknown>, detailItemIndex: number) => ({
            getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
            setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value }),
            getDetailEditorOption: (identifier, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailItemIndex}.${identifier}`, option }),
            setDetailEditorOption: (identifier, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailItemIndex}.${identifier}`, option, value }),
            getDetailItem: () => detailItem,
            getDetailItemIndex: () => detailItemIndex,
            apply: (editUtil, item, continueAfterSave) => this.applyMethod && this.applyMethod(editUtil, item, continueAfterSave),
            cancel: () => this.cancelMethod && this.cancelMethod()
        } as DetailEditUtil);

    readonly getValue = ({ dataMember }: { dataMember: string }) =>
      combineLatest([this.item$]).pipe(
        switchMap(([item]) => {
          if (!item) {
            return throwError(() => new Error('Item is not set'));
          }

          return of(get(item, dataMember));
        })
      );

    readonly setValue = this.effect((request$: Observable<{ dataMember: string, value: unknown }>) =>
      combineLatest([request$, this.item$]).pipe(
        switchMap(([{ dataMember, value }, item]) => {
          if (!item) {
            return throwError(() => new Error('Item is not set'));
          }

          set(item, dataMember, value);

          return of(undefined);
        })
      ));

    readonly editorPreparing = ({ dataMember, layoutItem }: { dataMember: string, layoutItem: EditLayoutItem }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          return this.metaService.editorPreparing({ mode, item, layoutItem, identifier: dataMember });
        })
      );

    readonly editorInitialized = this.effect((request$: Observable<{ dataMember: string, ref: EditItemRef }>) =>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{  dataMember, ref }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          this.editItems[dataMember] = ref;

          this.metaService.editorInitialized({ mode, item, editUtil: this.editUtil(), identifier: dataMember });

          return of(undefined);
        })
      )
    );

    readonly editorValidating = ({ dataMember, ruleIdentifier, value }: { dataMember: string; ruleIdentifier: string; value: ValueType; }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          return this.metaService.editorValidating({ mode, item, editUtil: this.editUtil(), identifier: dataMember, value: value, validation: ruleIdentifier });
        })
      );

    readonly editorValueChanged = this.effect((request$: Observable<{ dataMember: string; value: ValueType; notify: boolean; }>) =>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, value, notify }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          this.setValue({ dataMember, value });

          if (notify) {
            this.metaService.editorValueChanged({ mode, item, editUtil: this.editUtil(), identifier: dataMember, value });
          }

          return of(undefined);
        })
      )
    );

    readonly editorEntered = this.effect((request$: Observable<{ dataMember: string; }>) =>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          this.metaService.editorEntered({ mode, item, editUtil: this.editUtil(), identifier: dataMember });

          return of(undefined);
        })
      )
    );

    readonly editorEvent = this.effect((request$: Observable<{ dataMember: string; event: string; }>)=>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, event }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or editor event not ready'));
          }

          this.metaService.editorEvent({ mode, item, editUtil: this.editUtil(), identifier: dataMember, event });

          return of(undefined);
        })
      )
    );

    readonly detailGridCellPreparing = ({ detailItem, identifier, options }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, options: GridLayoutColumn }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady)  {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          return this.metaService.detailGridCellPreparing({ mode, item, detailItem, identifier, options });
        })
      );

    readonly detailGridRowValidating = ({ dataMember, detailItem }: { dataMember: string, detailItem: Record<string, unknown> }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady)  {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          return this.metaService.detailGridRowValidating({ mode, item, detailItem, identifier: dataMember })
        })
      );

    readonly initNewDetailItem = ({ dataMember, detailItem }: { dataMember: string, detailItem: Record<string, unknown> }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady)  {
            return throwError(() => new Error('Mode, item or meta service not ready'));
          }

          return this.metaService.initNewDetailItem({ dataMember, item, detailItem });
        })
      );

    readonly detailEditorInitialized = this.effect((request$: Observable<{ dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, component: EditItemRef }>)=>
      combineLatest([request$, this.mode$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, detailItemIndex, detailItem, identifier, component }, mode, metaReady]) => {
          if (!mode || !metaReady)  {
            return throwError(() => new Error('Mode or Meta service not ready'));
          }

          this.editItems[`${dataMember}.${detailItemIndex}.${identifier}`] = component;
          this.metaService.editorInitialized({ mode, item: detailItem, editUtil: this.detailEditUtil(dataMember, detailItem, detailItemIndex), identifier: `${dataMember}.${identifier}` });

          return of(undefined);
        })
      )
    );

    readonly detailEditorValidating = ({ dataMember, detailItemIndex, detailItem, identifier, ruleIdentifier, value }: { dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, ruleIdentifier: string, value: ValueType }) =>
      combineLatest([this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([mode, item, metaReady]) => {
          if (!mode || !item || !metaReady)  {
            return throwError(() => new Error('Mode, item or Meta service not ready'));
          }

          return this.metaService.editorValidating({ mode, item: detailItem, editUtil: this.detailEditUtil(dataMember, detailItem, detailItemIndex), identifier: `${dataMember}.${identifier}`, value, validation: ruleIdentifier });
        })
      );

    readonly detailEditorEntered = this.effect((request$: Observable<{ dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string }>) =>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, detailItemIndex, detailItem, identifier }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or Meta service not ready'));
          }

          this.metaService.editorEntered({ mode, item: detailItem, editUtil: this.detailEditUtil(dataMember, detailItem, detailItemIndex), identifier: `${dataMember}.${identifier}` });

          return of(undefined);
        })
      )
    );

    readonly detailEditorEvent = this.effect((request$: Observable<{ dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, event: string }>)=>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, detailItemIndex, detailItem, identifier, event }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or Meta service not ready'));
          }

          this.metaService.editorEvent({ mode, item: detailItem, editUtil: this.detailEditUtil(dataMember, detailItem, detailItemIndex), identifier: `${dataMember}.${identifier}`, event })

          return of(undefined);
        })
      )
    );

    readonly detailEditorValueChanged = this.effect((request$: Observable<{ dataMember: string, detailItemIndex: number, detailItem: Record<string, unknown>, identifier: string, value: unknown, notify: boolean }>)=>
      combineLatest([request$, this.mode$, this.item$, this.metaService.ready$]).pipe(
        switchMap(([{ dataMember, detailItemIndex, detailItem, identifier, value, notify }, mode, item, metaReady]) => {
          if (!mode || !item || !metaReady) {
            return throwError(() => new Error('Mode, item or Meta service not ready'));
          }

          set(detailItem, identifier, value);

          if (notify) {
            this.metaService.editorValueChanged({ mode, item, editUtil: this.detailEditUtil(dataMember, detailItem, detailItemIndex), identifier: `${dataMember}.${identifier}`, value: value as ValueType });
          }

          return of(undefined);
        })
      )
    );

    private readonly getEditor = (request: { dataMember: string }) => this.editItems[request.dataMember];

    private readonly getEditorOption = (request: { dataMember: string; option: string; }) =>
        this.getEditor({ dataMember: request.dataMember })?.getOption(request.option);

    private readonly setEditorOption = (request: { dataMember: string; option: string; value: unknown; }) =>
        this.getEditor({ dataMember: request.dataMember })?.setOption(request.option, request.value);
}
