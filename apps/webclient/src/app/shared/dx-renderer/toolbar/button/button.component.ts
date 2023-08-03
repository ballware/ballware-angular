import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { PageService, ToolbarItemRef } from '@ballware/meta-services';
import { PageToolbarItem } from '@ballware/meta-model';
import { DxButtonComponent } from 'devextreme-angular';

@Component({
  selector: 'ballware-toolbar-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ToolbarButtonComponent implements OnDestroy, AfterViewInit {

  @Input() public item?: PageToolbarItem;

  @ViewChild('button', { static: false }) button?: DxButtonComponent;

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

      this.pageService.paramEditorInitialized({ name: this.item.name, item: toolbarItemRef });
    }
  }

  onClicked(e: unknown) {
    if (this.item?.name) {
      this.pageService.paramEditorEvent({ name: this.item.name, event: 'click' });
    }
  }
}
