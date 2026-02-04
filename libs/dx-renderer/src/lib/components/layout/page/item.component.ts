import { AfterViewInit, Component, HostBinding, Inject, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';
import { CommonModule } from '@angular/common';
import { PAGEITEM_REGISTRY, PageItemRegistry } from '../../../registries';

@Component({
    selector: 'ballware-page-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    imports: [CommonModule]
})
export class PageLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private readonly itemHost?: ViewContainerRef;

  @Input() layoutItem?: PageLayoutItem;
  @Input() colSpan?: number;
  @Input() colCount?: number;

  constructor(@Inject(PAGEITEM_REGISTRY) private readonly pageItemRegistry: PageItemRegistry) {
  }

  ngAfterViewInit() {

    if (this.layoutItem && this.itemHost) {
      const itemType = this.pageItemRegistry.resolveItemType(this.layoutItem.type);

      if (itemType) {
        const componentRef = this.itemHost.createComponent(itemType);

        componentRef.setInput('layoutItem', this.layoutItem);
        componentRef.changeDetectorRef.detectChanges();

        return;
      }

      console.warn(`Unknown page layout item type ${this.layoutItem.type}`);
    }
  }

  @HostBinding('style')
  get styles(): object {
    return { 'height': this.layoutItem?.options?.height ?? '100%' };
  }

  @HostBinding('class')
  get classes(): string {
    const cols = ((this.colSpan ?? 1) / (this.colCount ?? 1)) * 12;

    return `h-100 col-xs-1 col-lg-${cols}`;
  }
}
