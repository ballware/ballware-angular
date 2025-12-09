import { Component, DestroyRef, OnInit } from '@angular/core';
import { Item } from 'devextreme/ui/button_group';
import { CommonModule } from '@angular/common';
import { DxButtonGroupModule } from 'devextreme-angular';
import { EditItemLivecycle, NullableStringValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required, Lookup } from '../../../directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { withLatestFrom } from 'rxjs';

interface KeyedButtonGroupItem extends Item {
  key: string;
}

@Component({
    selector: 'ballware-edit-buttongroup',
    templateUrl: './editbuttongroup.component.html',
    styleUrls: [],
    imports: [CommonModule, DxButtonGroupModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableStringValue, Readonly, Validation, Required, Visible, Lookup]
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
    private readonly destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NullableStringValue,
    public validation: Validation,
    public lookup: Lookup
  ) {}

  ngOnInit(): void {
    this.lookup.dataSource$.pipe(
      takeUntilDestroyed(this.destroy),
      withLatestFrom(this.lookup.hasLookupItemHint$)
    ).subscribe(([dataSource, hasLookupItemHint]) => {
      dataSource?.on('changed', () => {
        this.items = dataSource?.items().map(item => ({
          key: this.lookup.getLookupItemKeyValue(item),
          text: this.lookup.getLookupItemDisplayValue(item),
          hint: hasLookupItemHint ? this.lookup.getLookupItemHintValue(item) : undefined
        } as KeyedButtonGroupItem)) ?? [];

        if (!this.selectedItemKeys.length && this.items.length) {
          this.selectedItemKeys = [this.items[0].key];
        }
      });

      dataSource?.load();
    });
  }
}
