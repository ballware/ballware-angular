import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { DxDropDownButtonComponent } from 'devextreme-angular';
import { PageService, ToolbarItemRef } from '@ballware/meta-services';
import { PageToolbarItem, ValueType } from '@ballware/meta-model';
import { ItemClickEvent } from 'devextreme/ui/drop_down_button';

@Component({
  selector: 'ballware-toolbar-dropdownbutton',
  templateUrl: './dropdownbutton.component.html',
  styleUrls: ['./dropdownbutton.component.scss']
})
export class ToolbarDropdownbuttonComponent implements OnDestroy, AfterViewInit {

  @Input() public item?: PageToolbarItem;

  @ViewChild('button', { static: false }) button?: DxDropDownButtonComponent;

  constructor(private pageService: PageService) { }

  ngOnDestroy(): void {
    if (this.item?.name) {
      this.pageService.paramEditorDestroyed(this.item.name);
    }
  }

  ngAfterViewInit(): void {

    if (this.item?.name) {
      const toolbarItemRef = {
        getOption: (option) => this.button?.instance.option(option),
        setOption: (option, value) => this.button?.instance.option(option, value)
      } as ToolbarItemRef;

      this.pageService.paramEditorInitialized(this.item.name, toolbarItemRef);
    }
  }

  onButtonClicked() {
    if (this.item?.name) {
      this.pageService.paramEditorEvent(this.item.name, 'click', undefined);
    }
  }

  get items(): any[] {
    return this.item?.options['items'] as any[];
  }

  onItemClicked(e: ItemClickEvent) {
    if (this.item?.name) {
      this.pageService.paramEditorEvent(this.item.name, 'click', e.itemData['id']);
    }
  }

}
