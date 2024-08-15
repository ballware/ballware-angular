import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class EditLayoutTabsComponent extends WithVisible(WithValue(WithEditItemLifecycle(WithDestroy()), () => 0)) implements OnInit, EditItemRef {

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

  getOption(option: string) {
    switch (option) {
      case 'visible':
        return this.visible$.getValue();              
      case 'value':
        return this.value;
    }

    return undefined;
  }  

  setOption(option: string, value: unknown): void {
    switch (option) {
      case 'value':
        this.setValueWithoutNotification(value as number);
        break;
      case 'visible':
        this.setVisible(value as boolean);
        break;        
    }
  }
}
