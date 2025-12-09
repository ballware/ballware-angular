import { AfterViewInit, Component, Inject, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { CommonModule } from '@angular/common';
import { EDITITEM_REGISTRY, EditItemRegistry } from '../../../registries';

@Component({
    selector: 'ballware-edit-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    imports: [CommonModule]
})
export class EditLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private readonly itemHost?: ViewContainerRef;

  @Input() layoutItem!: EditLayoutItem;

  constructor(@Inject(EDITITEM_REGISTRY) private readonly editItemRegistry: EditItemRegistry) {
  }

  ngAfterViewInit() {

    if (this.layoutItem && this.itemHost) {
      const itemType = this.editItemRegistry.resolveItemType(this.layoutItem.type);

      if (itemType) {
        const componentRef = this.itemHost.createComponent(itemType);

        componentRef.setInput('initialLayoutItem', this.layoutItem);
        componentRef.changeDetectorRef.detectChanges();
        return;
      }

      if (this.layoutItem.type !== 'empty') {
        console.warn(`Unknown edit layout item type ${this.layoutItem.type}`);
      }
    }
  }
}
