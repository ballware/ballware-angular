import { OnDestroy } from "@angular/core";
import { EditLayout, EditLayoutItem, EditUtil, GridLayoutColumn, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import { combineLatest, distinctUntilChanged, map, takeUntil, withLatestFrom } from "rxjs";
import { editDestroyed, editUpdated } from "../component";
import { getByPath, setByPath } from "../databinding";
import { EditService } from "../edit.service";
import { EditItemRef } from "../edititemref";
import { EditModes } from "../editmodes";
import { MetaService } from "../meta.service";
import { EditState } from "./edit.state";

export class EditStore extends ComponentStore<EditState> implements OnDestroy, EditService {

    private editItems: Record<string, EditItemRef|undefined> = {}; 

    constructor(private store: Store, private metaService: MetaService) {
        super({
            validator: undefined
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

    readonly item$ = this.select(state => state.item);
    readonly mode$ = this.select(state => state.mode);
    readonly editLayout$ = this.select(state => state.editLayout);
    readonly readonly$ = this.select(state => state.readonly);

    readonly setMode = this.updater((state, mode: EditModes) => ({
        ...state,
        mode,
        readonly: mode === EditModes.VIEW
    }));

    readonly setItem = this.updater((state, item: Record<string, unknown>) => ({
        ...state,
        item
    }));

    readonly setEditLayout = this.updater((state, editLayout: EditLayout) => ({
        ...state,
        editLayout
    }));

    readonly setValidator = this.updater((state, validator: (() => boolean)|undefined) => ({
        ...state,
        validator
    }));
   
    readonly getValue$ = combineLatest([this.item$])
        .pipe(map(([item]) => item ? (request: { dataMember: string }) => getByPath(item, request.dataMember) : undefined));

    readonly setValue$ = combineLatest([this.item$])
        .pipe(map(([item]) => item ? (request: { dataMember: string, value: unknown } ) => setByPath(item, request.dataMember, request.value) : undefined));

    readonly editorPreparing$ = combineLatest([this.mode$, this.item$, this.metaService.editorPreparing$])            
        .pipe(map(([mode, item, editorPreparing]) => (mode && item && editorPreparing)
                ? (request: { dataMember: string, layoutItem: EditLayoutItem }) => editorPreparing(mode, item, request.layoutItem, request.dataMember)
                : undefined));

    readonly editorInitialized$ = combineLatest([this.mode$, this.item$, this.metaService.editorInitialized$])            
            .pipe(map(([mode, item, editorInitialized]) => 
                (mode && item && editorInitialized) ? (request: { dataMember: string, ref: EditItemRef }) => {

                    this.editItems[request.dataMember] = request.ref;

                    editorInitialized(mode, item, {
                        getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
                        setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value })
                    } as EditUtil, request.dataMember);
                } : undefined)
            );

    readonly editorValidating$ = combineLatest([this.mode$, this.item$, this.metaService.editorValidating$])
            .pipe(map(([mode, item, editorValidating]) => (mode && item && editorValidating)
                ? (request: { dataMember: string; ruleIdentifier: string; value: ValueType; }) => editorValidating(mode, item, {
                    getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
                    setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value })
                } as EditUtil, request.dataMember, request.value, request.ruleIdentifier)
                : () => true)
            );    
                    
    readonly editorValueChanged$ = combineLatest([this.mode$, this.item$, this.setValue$, this.metaService.editorValueChanged$])            
            .pipe(map(([mode, item, setValue, editorValueChanged]) => 
                (mode && item && editorValueChanged && setValue) ? ({ dataMember, value, notify }: { dataMember: string; value: ValueType; notify: boolean; }) => {
                    setValue({ dataMember, value });

                    if (notify) {
                        editorValueChanged(mode, item, {
                            getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
                            setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value })
                        } as EditUtil, dataMember, value);
                    }
                } : undefined            
            )
        );

    readonly editorEntered$ = combineLatest([this.mode$, this.item$, this.metaService.editorEntered$])
        .pipe(map(([mode, item, editorEntered]) => (mode && item && editorEntered)
            ? ({ dataMember }: { dataMember: string; }) => editorEntered(mode, item, {
                getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
                setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value })
            } as EditUtil, dataMember)
            : undefined)
        );

    readonly editorEvent$ = combineLatest([this.mode$, this.item$, this.metaService.editorEvent$])        
        .pipe(map(([mode, item, editorEvent]) => (mode && item && editorEvent)
            ? ({ dataMember, event }: { dataMember: string; event: string; }) => editorEvent(mode, item, {
                getEditorOption: (dataMember, option) => this.getEditorOption({ dataMember, option }),
                setEditorOption: (dataMember, option, value) => this.setEditorOption({ dataMember, option, value })
            } as EditUtil, dataMember, event)
            : undefined)
        );

    readonly detailGridCellPreparing$ = combineLatest([this.mode$, this.item$, this.metaService.detailGridCellPreparing$])
        .pipe(map(([mode, item, detailGridCellPreparing]) => (mode && item && detailGridCellPreparing)
            ? ({ detailItem, identifier, options }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, options: GridLayoutColumn }) => detailGridCellPreparing(mode, item, detailItem, identifier, options)
            : undefined)
        );
    
    readonly detailGridRowValidating$ = combineLatest([this.mode$, this.item$, this.metaService.detailGridRowValidating$])
        .pipe(map(([mode, item, detailGridRowValidating]) => (mode && item && detailGridRowValidating)
            ? ({ dataMember, detailItem }: { dataMember: string, detailItem: Record<string, unknown> }) => detailGridRowValidating(mode, item, detailItem, dataMember)
            : undefined)
        );

    readonly initNewDetailItem$ = combineLatest([this.mode$, this.item$, this.metaService.initNewDetailItem$])
        .pipe(map(([mode, item, initNewDetailItem]) => (mode && item && initNewDetailItem)
            ? ({ dataMember, detailItem }: { dataMember: string, detailItem: Record<string, unknown> }) => initNewDetailItem(dataMember, item, detailItem)
            : undefined)
        );

    readonly detailEditorInitialized$ = combineLatest([this.mode$, this.metaService.editorInitialized$])
        .pipe(map(([mode, editorInitialized]) => (mode && editorInitialized)
            ? ({ dataMember, detailItem, identifier, component }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, component: EditItemRef }) => 
            {
                this.editItems[`${dataMember}.${identifier}`] = component;

                editorInitialized(mode, detailItem, {
                    getEditorOption: (detailMember, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailMember}`, option }),
                    setEditorOption: (detailMember, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailMember}`, option, value })
                } as EditUtil, `${dataMember}.${identifier}`);
            }
            : undefined )
        );

    readonly detailEditorValidating$ = combineLatest([this.mode$, this.item$, this.metaService.editorValidating$])
        .pipe(map(([mode, item, editorValidating]) => (mode && item && editorValidating)
            ? ({ dataMember, detailItem, identifier, ruleIdentifier, value }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, ruleIdentifier: string, value: ValueType }) => editorValidating(mode, detailItem, {
                getEditorOption: (detailMember, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailMember}`, option }),
                setEditorOption: (detailMember, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailMember}`, option, value })
            } as EditUtil, `${dataMember}.${identifier}`, value, ruleIdentifier)
            : () => true)
        );    
    
    readonly detailEditorEntered$ = combineLatest([this.mode$, this.item$, this.metaService.editorEntered$])
        .pipe(map(([mode, item, editorEntered]) => (mode && item && editorEntered)
            ? ({ dataMember, detailItem, identifier }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string }) => editorEntered(mode, detailItem, {
                getEditorOption: (detailMember, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailMember}`, option }),
                setEditorOption: (detailMember, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailMember}`, option, value })
            } as EditUtil, `${dataMember}.${identifier}`)
            : undefined)
        );

    readonly detailEditorEvent$ = combineLatest([this.mode$, this.item$, this.metaService.editorEvent$])        
        .pipe(map(([mode, item, editorEvent]) => (mode && item && editorEvent)
            ? ({ dataMember, detailItem, identifier, event }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, event: string }) => editorEvent(mode, detailItem, {
                getEditorOption: (detailMember, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailMember}`, option }),
                setEditorOption: (detailMember, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailMember}`, option, value })
            } as EditUtil, `${dataMember}.${identifier}`, event)
            : undefined)
        );
      
    readonly detailEditorValueChanged$ = combineLatest([this.mode$, this.item$, this.setValue$, this.metaService.editorValueChanged$])            
        .pipe(map(([mode, item, setValue, editorValueChanged]) => 
            (mode && item && editorValueChanged && setValue) 
            ? ({ dataMember, detailItem, identifier, value, notify }: { dataMember: string, detailItem: Record<string, unknown>, identifier: string, value: unknown, notify: boolean }) => {
                setByPath(detailItem, identifier, value);

                if (notify) {
                    editorValueChanged(mode, item, {
                        getEditorOption: (detailMember, option) => this.getEditorOption({ dataMember: `${dataMember}.${detailMember}`, option }),
                        setEditorOption: (detailMember, option, value) => this.setEditorOption({ dataMember: `${dataMember}.${detailMember}`, option, value })
                    } as EditUtil, `${dataMember}.${identifier}`, value as ValueType);
                }
            } : undefined)
        );
        
    readonly validator$ = this.select(state => state.validator);

    private readonly getEditor = (request: { dataMember: string }) => this.editItems[request.dataMember];

    private readonly getEditorOption = (request: { dataMember: string; option: string; }) =>
        this.getEditor({ dataMember: request.dataMember })?.getOption(request.option);

    private readonly setEditorOption = (request: { dataMember: string; option: string; value: unknown; }) =>
        this.getEditor({ dataMember: request.dataMember })?.setOption(request.option, request.value);
}