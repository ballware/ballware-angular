import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { PageService, ToolbarItemRef } from '@ballware/meta-services';
import { PageToolbarItem, ValueType } from '@ballware/meta-model';
import { ValueChangedEvent } from 'devextreme/ui/select_box';

@Component({
  selector: 'ballware-toolbar-staticlookup',
  templateUrl: './staticlookup.component.html',
  styleUrls: ['./staticlookup.component.scss']
})
export class ToolbarStaticlookupComponent implements OnDestroy, AfterViewInit {

  @Input() public item?: PageToolbarItem;

  @ViewChild('selectBox', { static: false }) selectBox?: DxSelectBoxComponent;

  constructor(private pageService: PageService) {
  }

  ngOnDestroy(): void {
      if (this.item?.name) {
        this.pageService.paramEditorDestroyed(this.item.name);
      }
  }

  ngAfterViewInit(): void {

    if (this.item?.name) {
      const toolbarItemRef = {
        getOption: (option) => this.selectBox?.instance.option(option),
        setOption: (option, value) => this.selectBox?.instance.option(option, value)
      } as ToolbarItemRef;

      this.pageService.paramEditorInitialized(this.item.name, toolbarItemRef);
    }
  }

  get valueExpr(): string {
    return (this.item?.options['valueExpr'] ?? 'value') as string;
  }

  get displayExpr(): string {
    return (this.item?.options['displayExpr'] ?? 'text') as string;
  }

  get items(): any[] {
    return this.item?.options['items'] as any[];
  }

  onValueChanged(e: ValueChangedEvent) {
    if (this.item?.name) {
      this.pageService.paramEditorValueChanged(this.item.name, e.value);
    }
  }
}
