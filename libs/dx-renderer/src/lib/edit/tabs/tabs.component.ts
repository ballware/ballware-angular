import { Component, forwardRef, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';
import { CommonModule } from '@angular/common';
import { DxTabPanelModule } from 'devextreme-angular';
import { EditLayoutContainerComponent } from '../layout/container.component';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [CommonModule, DxTabPanelModule, forwardRef(() => EditLayoutContainerComponent)],
  standalone: true
})
export class EditLayoutTabsComponent extends WithVisible(WithValue(WithEditItemLifecycle(WithDestroy()), () => 0)) implements OnInit {

  private _height: string|undefined;
  private _width: string|undefined;
  private _panels: EditLayoutItem[] = [];
  
  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;
  
  get panels() { return this._panels; }
  get height() { return this._height; }
  get width() { return this._width; }

  constructor(@Inject(EDIT_SERVICE) private editService: EditService) {
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
            this.initVisible(layoutItem);

            this._height = layoutItem.options?.height;
            this._width = layoutItem.options?.width;
            this._panels = layoutItem.items?.filter(item => item.type === 'tab' && !item.ignore) ?? [];

            this.layoutItem = layoutItem;
          }
        });
    }
  }
}
