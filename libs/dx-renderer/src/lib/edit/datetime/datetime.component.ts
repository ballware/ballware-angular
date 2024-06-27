import { Component, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditItemRef, EditService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { DateType } from 'devextreme/ui/date_box';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithRequired } from '../../utils/withrequired';
import { WithValidation } from '../../utils/withvalidation';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';

@Component({
  selector: 'ballware-edit-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss']
})
export class EditLayoutDatetimeComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => (null as unknown) as string|number|Date))))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public type!: DateType;
  public displayFormat!: string;

  constructor(private translationService: I18NextPipe, private editService: EditService) {
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
            this.type = layoutItem.type as DateType;

            switch (layoutItem.type) {              
              case 'datetime':
                this.displayFormat = this.translationService.transform('format.datetime');
                break;
              case 'date':
              default:
                this.displayFormat = this.translationService.transform('format.date');
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
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'value':
        this.setValueWithoutNotification(value as Date);
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
