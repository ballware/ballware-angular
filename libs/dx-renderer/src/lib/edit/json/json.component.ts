import { Component, Inject, Input, OnInit } from "@angular/core";
import { EditLayoutItem } from "@ballware/meta-model";
import { EDIT_SERVICE, EditItemRef, EditService } from "@ballware/meta-services";
import { takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { WithEditItemLifecycle } from "../../utils/withedititemlivecycle";
import { WithReadonly } from "../../utils/withreadonly";
import { WithRequired } from "../../utils/withrequired";
import { WithValidation } from "../../utils/withvalidation";
import { WithValue } from "../../utils/withvalue";
import { WithVisible } from "../../utils/withvisible";
import { CodeMirrorEditorOptions } from "../components/codeeditor/options";
import { CommonModule } from "@angular/common";
import { CodeMirrorComponent } from "../components/codeeditor/codemirror.component";

@Component({
    selector: 'ballware-edit-json',
    templateUrl: './json.component.html',
    styleUrls: ['./json.component.scss'],
    imports: [CommonModule, CodeMirrorComponent],
    standalone: true
})
export class EditLayoutJsonComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => "" as unknown))))) implements OnInit, EditItemRef {

    @Input() initialLayoutItem?: EditLayoutItem;
  
    public layoutItem: EditLayoutItem|undefined;
    public options: CodeMirrorEditorOptions|undefined;
    public height: string|undefined;
      
    constructor(@Inject(EDIT_SERVICE) private editService: EditService) {
      super();
    }
  
    ngOnInit(): void {
      if (this.initialLayoutItem) {
        this.initLifecycle(this.initialLayoutItem, this.editService, this);
  
        this.preparedLayoutItem$
          .pipe(takeUntil(this.destroy$))
          .subscribe((layoutItem) => {
            if (layoutItem) {
                this.height = layoutItem.options?.height;
                this.options = layoutItem.options?.itemoptions as CodeMirrorEditorOptions;
                
                this.initValue(layoutItem, this.editService);
                this.initReadonly(layoutItem, this.editService);
                this.initValidation(layoutItem, this.editService);
                this.initRequired(layoutItem, this.editService);
                this.initVisible(layoutItem);
    
                this.layoutItem = layoutItem;
            }
          });
      }
    }
  
    public getOption(option: string): any {
      switch (option) {
        case 'value':
          return this.value;
        case 'required':
          return this.required$.getValue();
        case 'readonly':
          return this.readonly$.getValue();
        case 'visible':
          return this.visible$.getValue();                  
      }
  
      return undefined;
    }
  
    public setOption(option: string, value: unknown) {
      switch (option) {
        case 'value':
          this.setValueWithoutNotification(value as string);
          break;
        case 'required':
          this.setRequired(value as boolean);
          break;
        case 'readonly':
          this.setReadonly(value as boolean)
          break;
        case 'visible':
          this.setVisible(value as boolean);
          break;          
      }
    }
  }