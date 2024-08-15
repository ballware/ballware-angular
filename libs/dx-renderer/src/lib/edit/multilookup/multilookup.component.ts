import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditItemRef, EditService, LOOKUP_SERVICE, LookupService, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { createArrayDatasource } from '../../utils/datasource';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithLookup } from '../../utils/withlookup';
import { WithReadonly } from '../../utils/withreadonly';
import { WithRequired } from '../../utils/withrequired';
import { WithValidation } from '../../utils/withvalidation';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';

@Component({
  selector: 'ballware-edit-multilookup',
  templateUrl: './multilookup.component.html',
  styleUrls: ['./multilookup.component.scss']
})
export class EditLayoutMultilookupComponent extends WithLookup(WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => [] as any[])))))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  constructor(@Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService, @Inject(LOOKUP_SERVICE) private lookupService: LookupService, private editService: EditService) {
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
            this.initLookup(layoutItem, this.editService, this.lookupService, this.notificationService);            

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
        this.setValueWithoutNotification(value as string[]);
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
      case 'items':
        this.dataSource = createArrayDatasource(value as []);
        break;
    }
  }
}
