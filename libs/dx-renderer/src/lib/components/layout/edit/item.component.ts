import { AfterViewInit, Component, Inject, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { CommonModule } from '@angular/common';
import { Breadcrumb, getEditItemTestIdSegment } from '@ballware/renderer-commons';
import { EDITITEM_REGISTRY, EditItemRegistry } from '../../../registries';

@Component({
    selector: 'ballware-edit-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    imports: [CommonModule],
    hostDirectives: [Breadcrumb]
})
export class EditLayoutItemComponent implements OnInit, AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private readonly itemHost?: ViewContainerRef;

  @Input() layoutItem!: EditLayoutItem;
  @Input() itemIndex?: number;

  constructor(
    @Inject(EDITITEM_REGISTRY) private readonly editItemRegistry: EditItemRegistry,
    private readonly breadcrumb: Breadcrumb) {
  }

  ngOnInit() {
    this.breadcrumb.setIdentifier(getEditItemTestIdSegment(this.layoutItem, this.itemIndex ?? 0));
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
