import { Component, DestroyRef, forwardRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditLayoutItem } from '@ballware/meta-model';
import { CommonModule } from '@angular/common';
import { DxTabPanelModule } from 'devextreme-angular';
import { EditLayoutContainerComponent } from '../layout/container.component';
import {
  Breadcrumb,
  EditItemLivecycle,
  NumberValue,
  Visible,
} from '@ballware/renderer-commons';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: [],
  imports: [CommonModule, DxTabPanelModule, Breadcrumb, forwardRef(() => EditLayoutContainerComponent)],
  hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NumberValue, Visible],
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
    public destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public value: NumberValue,
    private breadcrumb: Breadcrumb
  ) {
    this.breadcrumb.setIdentifier("tabs");
  }

  ngOnInit(): void {
    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      this._height = layoutItem?.options?.height;
      this._width = layoutItem?.options?.width;
      this._panels = layoutItem?.items?.filter(item => item.type === 'tab' && !item.ignore) ?? [];
    });
  }
}
