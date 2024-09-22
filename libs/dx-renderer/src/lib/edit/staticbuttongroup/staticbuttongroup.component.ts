import { Component, OnInit } from '@angular/core';
import { Item } from 'devextreme/ui/button_group';
import { takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DxButtonGroupModule } from 'devextreme-angular';
import { Destroy, EditItemLivecycle, NullableStringValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required, Lookup } from '../../directives';

interface KeyedButtonGroupItem extends Item {
  key: string;
}

@Component({
  selector: 'ballware-edit-staticbuttongroup',
  templateUrl: './staticbuttongroup.component.html',
  styleUrls: [],
  imports: [CommonModule, DxButtonGroupModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableStringValue, Readonly, Validation, Required, Visible, Lookup],
  standalone: true
})
export class EditLayoutStaticButtonGroupComponent implements OnInit {
  
  public items: KeyedButtonGroupItem[]|undefined;

  private _selectedItemKeys: string[] = [];

  public get selectedItemKeys() {
    return this._selectedItemKeys;
  }

  public set selectedItemKeys(value: string[]) {

    this._selectedItemKeys = value;

    if (value?.length) {
      this.value.value = value[0];
    }
  }

  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NullableStringValue,
    public validation: Validation,
    public lookup: Lookup
  ) {}

  ngOnInit(): void {
    this.lookup.dataSource$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((dataSource) => {
        dataSource?.on('changed', () => {
          this.items = dataSource?.items().map(item => ({
            key: this.lookup.getLookupItemKeyValue(item),
            text: this.lookup.getLookupItemDisplayValue(item),
            hint: this.lookup.hasLookupItemHint ? this.lookup.getLookupItemHintValue(item) : undefined                                
          } as KeyedButtonGroupItem)) ?? [];
    
          if (!this.selectedItemKeys.length && this.items.length) {
            this.selectedItemKeys = [this.items[0].key];
          }
        });
    
        dataSource?.load();
      });
    

  }
}
