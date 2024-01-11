import { AfterViewInit, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditLayoutBoolComponent } from '../bool/bool.component';
import { EditLayoutDatetimeComponent } from '../datetime/datetime.component';
import { EditLayoutEntitygridComponent } from '../entitygrid/entitygrid.component';
import { EditLayoutGroupComponent } from '../group/group.component';
import { EditLayoutLookupComponent } from '../lookup/lookup.component';
import { EditLayoutMapComponent } from '../map/map.component';
import { EditLayoutMultilookupComponent } from '../multilookup/multilookup.component';
import { EditLayoutNumberComponent } from '../number/number.component';
import { EditLayoutStaticlookupComponent } from '../staticlookup/staticlookup.component';
import { EditLayoutStaticmultilookupComponent } from '../staticmultilookup/staticmultilookup.component';
import { EditLayoutTabsComponent } from '../tabs/tabs.component';
import { EditLayoutTextComponent } from '../text/text.component';
import { EditLayoutTextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'ballware-edit-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class EditLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private itemHost?: ViewContainerRef;

  @Input() layoutItem!: EditLayoutItem;

  ngAfterViewInit() {

    if (this.layoutItem && this.itemHost) {
      switch (this.layoutItem.type) {
        case 'text': {
            //const { EditLayoutTextComponent } = await import('../text/text.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTextComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'textarea': {
            //const { EditLayoutTextareaComponent } = await import('../textarea/textarea.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTextareaComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'number': {
            //const { EditLayoutNumberComponent } = await import('../number/number.component');
            const componentRef = this.itemHost.createComponent(EditLayoutNumberComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'bool': {
            //const { EditLayoutBoolComponent } = await import('../bool/bool.component');
            const componentRef = this.itemHost.createComponent(EditLayoutBoolComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'date':
        case 'datetime': {
            //const { EditLayoutDatetimeComponent } = await import('../datetime/datetime.component');
            const componentRef = this.itemHost.createComponent(EditLayoutDatetimeComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'lookup': {
            //const { EditLayoutLookupComponent } = await import('../lookup/lookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutLookupComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'multilookup': {
            //const { EditLayoutMultilookupComponent } = await import('../multilookup/multilookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutMultilookupComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'staticlookup': {
            //const { EditLayoutStaticlookupComponent } = await import('../staticlookup/staticlookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutStaticlookupComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'staticmultilookup': {
            //const { EditLayoutStaticmultilookupComponent } = await import('../staticmultilookup/staticmultilookup.component');
            const componentRef = this.itemHost.createComponent(EditLayoutStaticmultilookupComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'tabs': {
            //const { EditLayoutTabsComponent } = await import('../tabs/tabs.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTabsComponent);

            componentRef.setInput('layoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'group': {
            //const { EditLayoutGroupComponent } = await import('../group/group.component');
            const componentRef = this.itemHost.createComponent(EditLayoutGroupComponent);

            componentRef.setInput('layoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'map': {
            //const { EditLayoutMapComponent } = await import('../map/map.component');
            const componentRef = this.itemHost.createComponent(EditLayoutMapComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;  
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'entitygrid': {
            //const { EditLayoutEntitygridComponent } = await import('../entitygrid/entitygrid.component');
            const componentRef = this.itemHost.createComponent(EditLayoutEntitygridComponent);

            componentRef.instance.initialLayoutItem = this.layoutItem;  
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        default: {
            console.warn(`Unknown edit layout item type ${this.layoutItem.type}`);
          }

      }
    }
  }

}
