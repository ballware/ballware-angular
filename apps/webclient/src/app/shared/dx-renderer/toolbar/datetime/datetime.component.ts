import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { DxDateBoxComponent } from 'devextreme-angular';
import { PageService, ToolbarItemRef } from '@ballware/meta-services';
import { PageToolbarItem, ValueType } from '@ballware/meta-model';
import { I18NextPipe } from 'angular-i18next';
import { ValueChangedEvent } from 'devextreme/ui/date_box';

@Component({
  selector: 'ballware-toolbar-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss']
})
export class ToolbarDatetimeComponent implements OnDestroy, AfterViewInit {

  @Input() public item?: PageToolbarItem;

  @ViewChild('dateBox', { static: false }) dateBox?: DxDateBoxComponent;

  constructor(private pageService: PageService, private translationService: I18NextPipe) { }

  ngOnDestroy(): void {
      if (this.item?.name) {
        this.pageService.paramEditorDestroyed(this.item.name);
      }
  }

  ngAfterViewInit(): void {

    if (this.item?.name) {
      const toolbarItemRef = {
        getOption: (option) => this.dateBox?.instance.option(option),
        setOption: (option, value) => this.dateBox?.instance.option(option, value)
      } as ToolbarItemRef;

      this.pageService.paramEditorInitialized(this.item.name, toolbarItemRef);
    }
  }

  onValueChanged(e: ValueChangedEvent) {
    if (this.item?.name) {
      this.pageService.paramEditorValueChanged(this.item.name, e.value);
    }
  }

  getDisplayFormat() {
    const format = this.translationService.transform('format.datetime');

    if (this.item?.caption) {
      return `${this.item.caption}: ${format}`;
    }

    return format;
  }

}
