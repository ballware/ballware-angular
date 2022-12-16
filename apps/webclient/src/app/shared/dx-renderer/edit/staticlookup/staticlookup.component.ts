import { Component, Input, OnInit } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';
import { combineLatest, takeUntil } from 'rxjs';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditService, EditItemRef } from '@ballware/meta-services';
import { createArrayDatasource } from '../../utils/datasource';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithRequired } from '../../utils/withrequired';
import { WithValue } from '../../utils/withvalue';

@Component({
  selector: 'ballware-edit-staticlookup',
  templateUrl: './staticlookup.component.html',
  styleUrls: ['./staticlookup.component.scss']
})
export class EditLayoutStaticlookupComponent extends WithRequired(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => undefined as string|undefined))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public dataSource: any;

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
            this.initRequired(layoutItem, this.editService);

            this.layoutItem = layoutItem;

            combineLatest([this.editService.getValue$])
              .pipe(takeUntil(this.destroy$))
              .subscribe(([getValue]) => {
                if (getValue) {
                  this.dataSource = createArrayDatasource(this.layoutItem?.options?.items ?? (this.layoutItem?.options?.itemsMember ? getValue(this.layoutItem?.options?.itemsMember) as any[] : []));
                }
              });
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
      case 'items':
        this.dataSource = createArrayDatasource(value as []);
        break;
    }
  }
}
