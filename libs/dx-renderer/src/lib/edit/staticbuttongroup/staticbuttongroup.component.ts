import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { Item } from 'devextreme/ui/button_group';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithLookup } from '../../utils/withlookup';
import { WithReadonly } from '../../utils/withreadonly';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';

interface KeyedButtonGroupItem extends Item {
  key: string;
}

@Component({
  selector: 'ballware-edit-staticbuttongroup',
  templateUrl: './staticbuttongroup.component.html',
  styleUrls: ['./staticbuttongroup.component.scss']
})
export class EditLayoutStaticButtonGroupComponent extends WithLookup(WithVisible(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => null as string|null)))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public items: KeyedButtonGroupItem[]|undefined;

  private _selectedItemKeys: string[] = [];

  public get selectedItemKeys() {
    return this._selectedItemKeys;
  }

  public set selectedItemKeys(value: string[]) {

    this._selectedItemKeys = value;

    if (value?.length) {
      this.value = value[0];
    }
  }

  constructor(private translationService: I18NextPipe, @Inject(EDIT_SERVICE) private editService: EditService) {
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
            this.initVisible(layoutItem);
            this.initStaticLookup(layoutItem, this.editService);

            this.dataSource?.on('changed', () => {
              this.items = this.dataSource?.items().map(item => ({
                key: this.getLookupItemKeyValue(item),
                text: this.getLookupItemDisplayValue(item),
                hint: this.hasLookupItemHintValue ? this.getLookupItemHintValue(item) : undefined                                
              } as KeyedButtonGroupItem)) ?? [];

              if (!this.selectedItemKeys.length && this.items.length) {
                this.selectedItemKeys = [this.items[0].key];
              }
            });

            this.layoutItem = layoutItem;

            this.dataSource?.load();
          }
        });
    }
  }

  public getOption(option: string): any {
    switch (option) {
      case 'visible':
        return this.visible$.getValue();        
    }
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'visible':
        this.setVisible(value as boolean);
        break;
    }
  }
}
