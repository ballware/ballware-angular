import { Component, Input, OnInit } from "@angular/core";
import { EditLayoutItem, GridLayoutColumn } from "@ballware/meta-model";
import { EditItemRef, EditService, LookupService, ResponsiveService } from "@ballware/meta-services";
import { I18NextPipe, PipeOptions } from "angular-i18next";
import { dxDataGridColumn } from "devextreme/ui/data_grid";
import { combineLatest, takeUntil } from "rxjs";
import { createColumnConfiguration } from "../../utils/columns";
import { WithDestroy } from "../../utils/withdestroy";
import { WithEditItemLifecycle } from "../../utils/withedititemlivecycle";
import { WithReadonly } from "../../utils/withreadonly";
import { WithValue } from "../../utils/withvalue";

export interface DetailGridItemOptions {  
    add?: boolean;
    update?: boolean;
    delete?: boolean;
    columns: Array<GridLayoutColumn>;
    showSource?: boolean;
  }

@Component({
    selector: 'ballware-edit-javascript',
    templateUrl: './detailgrid.component.html',
    styleUrls: ['./detailgrid.component.scss']
})
export class EditLayoutDetailGridComponent extends WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => [])) implements OnInit, EditItemRef {

    @Input() initialLayoutItem?: EditLayoutItem;
  
    public layoutItem: EditLayoutItem|undefined;
    public options: DetailGridItemOptions|undefined;
    public height: string|undefined;

    public columns: dxDataGridColumn[]|undefined;

    public allowAdd = false;
    public allowUpdate = false;
    public allowDelete = false;
      
    constructor(
        private translationService: I18NextPipe,
        private responsiveService: ResponsiveService,
        private lookupService: LookupService,
        private editService: EditService) {
      super();
    }
  
    ngOnInit(): void {
      if (this.initialLayoutItem) {
        this.initLifecycle(this.initialLayoutItem, this.editService, this);
  
        combineLatest([this.preparedLayoutItem$, this.editService.item$, this.lookupService.lookups$, this.readonly$])
          .pipe(takeUntil(this.destroy$))
          .subscribe(([layoutItem, item, lookups, readonly]) => {
            if (layoutItem && item && lookups) {
                this.height = layoutItem.options?.height;
                this.options = layoutItem.options?.itemoptions as DetailGridItemOptions;

                this.allowAdd = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).add) ?? false;
                this.allowUpdate = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).update) ?? false;
                this.allowDelete = (!readonly && (layoutItem.options?.itemoptions as DetailGridItemOptions).delete) ?? false;

                this.columns = createColumnConfiguration<dxDataGridColumn>(
                    (key: string, options?: PipeOptions) => this.translationService.transform(key, options),
                    this.options.columns,                    
                    lookups,
                    item,
                    'detail',
                    undefined,
                    undefined
                );
                
                this.initValue(layoutItem, this.editService);
                this.initReadonly(layoutItem, this.editService);
    
                this.layoutItem = layoutItem;
            }
          });
      }
    }
  
    public getOption(option: string): any {
      switch (option) {
        case 'value':
          return this.value;
        case 'readonly':
          return this.readonly$.getValue();
      }
  
      return undefined;
    }
  
    public setOption(option: string, value: unknown) {
      switch (option) {
        case 'value':
          this.setValueWithoutNotification(value as []);
          break;
        case 'readonly':
          this.setReadonly(value as boolean)
          break;
      }
    }

}