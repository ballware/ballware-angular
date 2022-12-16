import { AfterViewInit, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-edit-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class EditLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private itemHost?: ViewContainerRef;

  @Input() layoutItem?: EditLayoutItem;
  @Input() colSpan?: number;
  @Input() colCount?: number;

  get styles(): object {
    return { 'height': this.layoutItem?.options?.height ?? 'auto' };
  }

  get classes(): string {
    const cols = ((this.colSpan ?? 1) / (this.colCount ?? 1)) * 12;

    return `col-xs-12 col-sm-${cols}`;
  }

  async ngAfterViewInit(): Promise<void> {

    if (this.layoutItem && this.itemHost) {
      switch (this.layoutItem.type) {
        case 'text': {
            const { EditLayoutTextComponent } = await import('../text/text.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTextComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'textarea': {
            const { EditLayoutTextareaComponent } = await import('../textarea/textarea.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTextareaComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'number': {
            const { EditLayoutNumberComponent } = await import('../number/number.component');
            const componentRef = this.itemHost.createComponent(EditLayoutNumberComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'bool': {
            const { EditLayoutBoolComponent } = await import('../bool/bool.component');
            const componentRef = this.itemHost.createComponent(EditLayoutBoolComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'date':
        case 'datetime': {
            const { EditLayoutDatetimeComponent } = await import('../datetime/datetime.component');
            const componentRef = this.itemHost.createComponent(EditLayoutDatetimeComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'lookup': {
            const { EditLayoutLookupComponent } = await import('../lookup/lookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutLookupComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'multilookup': {
            const { EditLayoutMultilookupComponent } = await import('../multilookup/multilookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutMultilookupComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'staticlookup': {
            const { EditLayoutStaticlookupComponent } = await import('../staticlookup/staticlookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutStaticlookupComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'staticmultilookup': {
            const { EditLayoutStaticmultilookupComponent } = await import('../staticmultilookup/staticmultilookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutStaticmultilookupComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'tabs': {
            const { EditLayoutTabsComponent } = await import('../tabs/tabs.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTabsComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
        case 'group': {
            const { EditLayoutGroupComponent } = await import('../group/group.component');
            const componentRef = this.itemHost.createComponent(EditLayoutGroupComponent);

            componentRef.instance.layoutItem = this.layoutItem;
          }
          break;
        case 'map': {
            const { EditLayoutMapComponent } = await import('../map/map.component');
            const componentRef = this.itemHost.createComponent(EditLayoutMapComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
        case 'entitygrid': {
            const { EditLayoutEntitygridComponent } = await import('../entitygrid/entitygrid.component');
            const componentRef = this.itemHost.createComponent(EditLayoutEntitygridComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;
          }
          break;
      }
    }
  }

}
