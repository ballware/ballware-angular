import { EditLayout, EditLayoutItem, EditUtil, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { isEqual } from "lodash";
import { combineLatest, distinctUntilChanged, map, tap } from "rxjs";
import { getByPath, setByPath } from "../databinding";
import { EditServiceApi } from "../edit.service";
import { EditItemRef } from "../edititemref";
import { EditModes } from "../editmodes";
import { MetaService } from "../meta.service";
import { EditState } from "./edit.state";

export class EditStore extends ComponentStore<EditState> implements EditServiceApi {

    constructor(private metaService: MetaService) {
        super({
            editItems: {},
            validator: undefined
        });

        this.state$
          .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
          .subscribe((state) => {
              console.debug('EditStore state update');
              console.debug(state);
          });
    }    
            
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
   
    readonly getEditor = (request: { dataMember: string }) => this.select(state => state.editItems[request.dataMember]);

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
                    this.updater((state, request: { dataMember: string; ref: EditItemRef; }) => ({
                        ...state,
                        editItems: Object.assign({ ...state.editItems }, ({} as Record<string, unknown>)[request.dataMember] = request.ref)
                    }))(request);

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

    readonly getEditorOption = (request: { dataMember: string; option: string; }) =>
        this.getEditor({ dataMember: request.dataMember })
            .pipe(map(editor => editor?.getOption(request.option)));    

    readonly setEditorOption = (request: { dataMember: string; option: string; value: unknown; }) =>
        this.getEditor({ dataMember: request.dataMember })
            .pipe(tap(editor => editor?.setOption(request.option, request.value)));    


    readonly validate = () => this.select(state => state.validator ? state.validator() : true);
}