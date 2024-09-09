import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService } from '@ballware/meta-services';
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
export class EditLayoutNumberComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => 0.0))))) implements OnInit {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;
  public itemOptions: NumberItemOptions = {};

  constructor(@Inject(EDIT_SERVICE) private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.registerOption('min', () => this.itemOptions?.min, (value) => this.itemOptions.min = value as number);
      this.registerOption('max', () => this.itemOptions?.max, (value) => this.itemOptions.max = value as number);

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
}
