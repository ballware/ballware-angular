import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { PageToolbarItem } from '@ballware/meta-model';
import { PageService, ToolbarItemRef } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { DxDateBoxComponent } from 'devextreme-angular';
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

      this.pageService.paramEditorInitialized({ name: this.item.name, item: toolbarItemRef });
    }
  }

  onValueChanged(e: ValueChangedEvent) {
    if (this.item?.name) {
      this.pageService.paramEditorValueChanged({ name: this.item.name, value: e.value });
    }
  }

  getDisplayFormat() {
    return this.translationService.transform('format.datetime');
  }

}
