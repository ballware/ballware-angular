import { Component, Input, OnInit } from "@angular/core";
import { EditLayout, GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, MetaService, ResponsiveService, SCREEN_SIZE } from "@ballware/meta-services";
import { cloneDeep } from "lodash";
import { Observable, Subject, combineLatest, map, takeUntil } from "rxjs";
import { getByPath, setByPath } from "../../utils/databinding";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-edit-detaileditpopup',
    templateUrl: './detaileditpopup.component.html',
    styleUrls: ['./detaileditpopup.component.scss']
})
export class DetailEditPopupComponent extends WithDestroy() implements OnInit {

    @Input() column!: GridLayoutColumn;
    @Input() readOnly: boolean|null = null;
    @Input() item!: Record<string, unknown>;

    dialogItem: Record<string, unknown>|undefined;
    editLayout$: Observable<EditLayout|undefined>;
    dialogVisible = false;

    public usePopover$: Observable<boolean>;

    private editLayoutIdentifier$ = new Subject<string>();

    constructor(private responsiveService: ResponsiveService, private metaService: MetaService) {
        super();

        this.dialogApply = this.dialogApply.bind(this);
        this.dialogCancel = this.dialogCancel.bind(this);
        
        this.editLayout$ = combineLatest([this.editLayoutIdentifier$, this.metaService.getEditLayout$])
            .pipe(takeUntil(this.destroy$))
            .pipe(map(([editLayoutIdentifier, getEditLayout]) => 
                (editLayoutIdentifier && getEditLayout) 
                    ? getEditLayout(editLayoutIdentifier, this.readOnly ? EditModes.VIEW : EditModes.EDIT)                    
                    : undefined
            ));

        this.usePopover$ = combineLatest([this.responsiveService.onResize$, this.editLayout$])
            .pipe(takeUntil(this.destroy$))
            .pipe(map(([screenSize, editLayout]) => screenSize >= SCREEN_SIZE.SM && !editLayout?.fullscreen));
    }
    
    ngOnInit(): void {
        if (this.column) {               
            this.editLayoutIdentifier$.next(this.column.popuplayout ?? 'primary');
        }
    }

    public get title() {
        return this.column?.caption;
    }

    public get mode() {
        return this.readOnly ? EditModes.VIEW : EditModes.EDIT;
    }

    dialogShow(): void {
        this.dialogItem = cloneDeep(this.item);
        this.dialogVisible = true;
    }

    dialogCancel(): void {
        this.dialogVisible = false;
    }

    dialogApply(): void {

        if (this.column.dataMember && this.dialogItem) {
            setByPath(this.item, this.column.dataMember, getByPath(this.dialogItem, this.column.dataMember));
        }        

        this.dialogVisible = false;
    }
}