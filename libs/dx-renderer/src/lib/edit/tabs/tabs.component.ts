import { Component, forwardRef, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DxTabPanelModule } from 'devextreme-angular';
import { EditLayoutContainerComponent } from '../layout/container.component';
import { Destroy, EditItemLivecycle, NumberValue, Visible } from '@ballware/renderer-commons';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: [],
  imports: [CommonModule, DxTabPanelModule, forwardRef(() => EditLayoutContainerComponent)],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NumberValue, Visible],
  standalone: true
})
export class EditLayoutTabsComponent implements OnInit {

  private _height: string|undefined;
  private _width: string|undefined;
  private _panels: EditLayoutItem[] = [];
    
  get panels() { return this._panels; }
  get height() { return this._height; }
  get width() { return this._width; }

  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public value: NumberValue
  ) {}

  ngOnInit(): void {
    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        this._height = layoutItem?.options?.height;
        this._width = layoutItem?.options?.width;
        this._panels = layoutItem?.items?.filter(item => item.type === 'tab' && !item.ignore) ?? [];
      });
  }
}
