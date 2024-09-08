import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithRequired } from '../../utils/withrequired';
import { WithValidation } from '../../utils/withvalidation';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';
import { DxNumberBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';

export interface NumberItemOptions {  
  min?: number;
  max?: number;
}

@Component({
  selector: 'ballware-edit-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
  imports: [CommonModule, DxNumberBoxModule, DxValidatorModule],
  standalone: true
})
export class EditLayoutNumberComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => 0.0))))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;
  public itemOptions: NumberItemOptions|undefined;

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
            this.itemOptions = layoutItem.options?.itemoptions as NumberItemOptions;

            if (!this.itemOptions) {
              this.itemOptions = {};
            }
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
      case 'min':
        return this.itemOptions?.min;
      case 'max':
        return this.itemOptions?.max;
      default:
        throw new Error(`Unsupported option <${option}>`);                 
    }
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'value':
        this.setValueWithoutNotification(value as number);
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
      case 'min':
        if (this.itemOptions) {
          this.itemOptions.min = value as number;
        }        
        break;
      case 'max':
        if (this.itemOptions) {
          this.itemOptions.max = value as number;
        }        
        break;
      default:
        throw new Error(`Unsupported option <${option}>`);                 
    }
  }
}
