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
import { CommonModule } from "@angular/common";
import { DxHtmlEditorModule, DxValidatorModule } from "devextreme-angular";

@Component({
    selector: 'ballware-edit-richtext',
    templateUrl: './richtext.component.html',
    styleUrls: ['./richtext.component.scss'],
    imports: [CommonModule, DxHtmlEditorModule, DxValidatorModule],
    standalone: true
  })
  export class EditLayoutRichtextComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => ""))))) implements OnInit, EditItemRef {
  
    @Input() initialLayoutItem!: EditLayoutItem;
  
    public layoutItem: EditLayoutItem|undefined;
  
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
        default:
          throw new Error(`Unsupported option <${option}>`);           
      }
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
        default:
          throw new Error(`Unsupported option <${option}>`);                   
      }
    }
  }