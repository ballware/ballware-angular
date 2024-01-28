import { Component, Input, OnInit } from "@angular/core";
import { GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, MetaService } from "@ballware/meta-services";
import { cloneDeep } from "lodash";
import { takeUntil } from "rxjs";
import { WithDestroy } from "../../../utils/withdestroy";

@Component({
    selector: 'ballware-edit-dynamic-column',
    templateUrl: './dynamiccolumn.component.html',
    styleUrls: ['./dynamiccolumn.component.scss']
})
export class DynamicColumnComponent extends WithDestroy() implements OnInit { 
    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() lookupParams!: Record<string, unknown>;
    @Input() item!: Record<string, unknown>;
    @Input() editing!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;

    constructor(private metaService: MetaService) {
        super();
    }

    ngOnInit(): void {
        this.metaService.detailGridCellPreparing$
            .pipe(takeUntil(this.destroy$))
            .subscribe((detailGridCellPreparing) => {
                if (detailGridCellPreparing) {
                    const preparedColumn = cloneDeep(this.column);
                    
                    detailGridCellPreparing(this.editing ? EditModes.EDIT : EditModes.VIEW, this.lookupParams, this.item, this.dataMember, preparedColumn);

                    this.preparedColumn = preparedColumn;
                    this.prepared = true;
                }                
            });
    }

}