import { Component, Input, OnChanges } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class EditLayoutTabsComponent extends WithDestroy() implements OnChanges {

  private _height: string|undefined;
  private _panels: EditLayoutItem[] = [];

  @Input() layoutItem!: EditLayoutItem;

  get panels() { return this._panels; }
  get height() { return this._height; }

  ngOnChanges(): void {
    this._height = this.layoutItem.options?.height;
    this._panels = this.layoutItem.items?.filter(item => item.type === 'tab') ?? [];
  }
}
