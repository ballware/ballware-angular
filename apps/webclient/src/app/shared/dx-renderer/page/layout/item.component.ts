import { AfterViewInit, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-page-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class PageLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private itemHost?: ViewContainerRef;

  @Input() layoutItem?: PageLayoutItem;
  @Input() colSpan?: number;
  @Input() colCount?: number;

  async ngAfterViewInit(): Promise<void> {

    if (this.layoutItem && this.itemHost) {
      switch (this.layoutItem.type) {
        case 'tabs': {
            const { PageLayoutTabsComponent } = await import('../tabs/tabs.component');
            const componentRef = this.itemHost.createComponent(PageLayoutTabsComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
        case 'crudcontainer': {
            const { PageLayoutCrudcontainerComponent } = await import('../crudcontainer/crudcontainer.component');
            const componentRef = this.itemHost.createComponent(PageLayoutCrudcontainerComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
        case 'grid': {
            const { PageLayoutGridComponent } = await import('../grid/grid.component');
            const componentRef = this.itemHost.createComponent(PageLayoutGridComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
        case 'map': {
            const { PageLayoutMapComponent } = await import('../map/map.component');
            const componentRef = this.itemHost.createComponent(PageLayoutMapComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
          /*
        case 'statistic': {
            const { PageLayoutStatisticComponent } = await import('../statistic/statistic.component');
            const componentRef = this.itemHost.createComponent(PageLayoutStatisticComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
          */
        case 'entitygrid': {
            const { PageLayoutEntitygridComponent } = await import('../entitygrid/entitygrid.component');
            const componentRef = this.itemHost.createComponent(PageLayoutEntitygridComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
      }
    }
  }

  get styles(): object {
    return { 'height': this.layoutItem?.options?.height ?? '100%' };
  }

  get classes(): string {
    const cols = ((this.colSpan ?? 1) / (this.colCount ?? 1)) * 12;

    return `col-xs-12 col-sm-${cols}`;
  }
}
