import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageToolbarItem, ValueType } from '@ballware/meta-model';
import { Subscription } from 'rxjs';
import { createLookupDataSource } from '../../utils/datasource';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { PageService, ToolbarItemRef, LookupDescriptor, LookupService, LookupStoreDescriptor } from '@ballware/meta-services';
import { ValueChangedEvent } from 'devextreme/ui/select_box';

@Component({
  selector: 'ballware-toolbar-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class ToolbarLookupComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() public item?: PageToolbarItem;

  private lookupsSubscription?: Subscription;

  public dataSource?: any;
  public lookup?: LookupDescriptor;

  @ViewChild('selectBox', { static: false }) selectBox?: DxSelectBoxComponent;

  constructor(private lookupService: LookupService, private pageService: PageService) {
  }

  ngOnInit(): void {
    this.lookupsSubscription = this.lookupService.lookups$.subscribe((lookups) => {
      if (this.item) {
        const { name, caption, defaultValue, lookup, width } = this.item;

        const myLookup = lookup && lookups ? (lookups[lookup] as LookupDescriptor) : undefined;

        if (myLookup) {
          this.lookup = myLookup;
          this.dataSource = createLookupDataSource(
            () => (myLookup.store as LookupStoreDescriptor).listFunc(),
            (id) => (myLookup.store as LookupStoreDescriptor).byIdFunc(id)
          );
        }
      }
    });
  }

  ngOnDestroy(): void {
      this.lookupsSubscription?.unsubscribe();

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

      this.pageService.paramEditorInitialized({ name: this.item.name, item: toolbarItemRef });
    }
  }

  onValueChanged(e: ValueChangedEvent) {
    if (this.item?.name) {
      this.pageService.paramEditorValueChanged({ name: this.item.name, value: e.value });
    }
  }

}
