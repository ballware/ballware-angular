import { Component, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditItemRef, EditService, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { combineLatest, takeUntil } from 'rxjs';
import { createArrayDatasource, createLookupDataSource } from '../../utils/datasource';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithRequired } from '../../utils/withrequired';
import { WithValue } from '../../utils/withvalue';

@Component({
  selector: 'ballware-edit-multilookup',
  templateUrl: './multilookup.component.html',
  styleUrls: ['./multilookup.component.scss']
})
export class EditLayoutMultilookupComponent extends WithRequired(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => [] as any[]))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public lookup: LookupDescriptor|undefined;
  public dataSource: any;

  constructor(private translationService: I18NextPipe, private lookupService: LookupService, private editService: EditService) {
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

            combineLatest([this.editService.getValue$, this.lookupService.lookups$])
              .pipe(takeUntil(this.destroy$))
              .subscribe(([getValue, lookups]) => {
                if (getValue && lookups) {
                  const lookup = this.layoutItem?.options?.lookup;
                  const lookupParam = this.layoutItem?.options?.lookupParam;

                  const myLookup = lookup && lookups ? (lookups[lookup] as LookupDescriptor|LookupCreator) : undefined;

                  if (myLookup) {
                    if (lookupParam && myLookup as LookupCreator) {
                      this.lookup = (myLookup as LookupCreator)(getValue({ dataMember: lookupParam }) as string|string[]);
                    } else if (myLookup as LookupDescriptor) {
                      this.lookup = myLookup as LookupDescriptor;
                    }

                    if (this.lookup) {
                      const currentLookup = this.lookup;

                      this.dataSource = createLookupDataSource(
                        () => (currentLookup.store as LookupStoreDescriptor).listFunc(),
                        (id) => (currentLookup.store as LookupStoreDescriptor).byIdFunc(id)
                      );
                    }
                  }
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
        this.setValueWithoutNotification(value as string[]);
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
