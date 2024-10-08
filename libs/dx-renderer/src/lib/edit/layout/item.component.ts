import { AfterViewInit, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditLayoutAttachmentsComponent } from '../attachments/attachments.component';
import { EditLayoutDatetimeComponent } from '../datetime/datetime.component';
import { EditLayoutDetailGridComponent } from '../detailgrid/detailgrid.component';
import { EditLayoutDetailTreeComponent } from '../detailtree/detailtree.component';
import { EditLayoutEntitygridComponent } from '../entitygrid/entitygrid.component';
import { EditLayoutGroupComponent } from '../group/group.component';
import { EditLayoutJavascriptComponent } from '../javascript/javascript.component';
import { EditLayoutJsonComponent } from '../json/json.component';
import { EditLayoutLookupComponent } from '../lookup/lookup.component';
import { EditLayoutMultilookupComponent } from '../multilookup/multilookup.component';
import { EditLayoutMultivalueComponent } from '../multivalue/multivalue.component';
import { EditLayoutNumberComponent } from '../number/number.component';
import { EditLayoutSqlComponent } from '../sql/sql.component';
import { EditLayoutStaticButtonGroupComponent } from '../staticbuttongroup/staticbuttongroup.component';
import { EditLayoutStaticlookupComponent } from '../staticlookup/staticlookup.component';
import { EditLayoutStaticmultilookupComponent } from '../staticmultilookup/staticmultilookup.component';
import { EditLayoutStatisticComponent } from '../statistic/statistic.component';
import { EditLayoutTabsComponent } from '../tabs/tabs.component';
import { EditLayoutTextComponent } from '../text/text.component';
import { EditLayoutTextareaComponent } from '../textarea/textarea.component';
import { EditLayoutButtonComponent } from '../button/button.component';
import { EditLayoutRichtextComponent } from '../richtext/richtext.component';
import { EditLayoutBoolComponent } from '../bool/bool.component';
import { EditLayoutMapComponent } from '../map/map.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-edit-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class EditLayoutItemComponent implements AfterViewInit {

  @ViewChild('item', { read: ViewContainerRef }) private itemHost?: ViewContainerRef;

  @Input() layoutItem!: EditLayoutItem;

  ngAfterViewInit() {

    if (this.layoutItem && this.itemHost) {
      switch (this.layoutItem.type) {
        case 'button': {
            const componentRef = this.itemHost.createComponent(EditLayoutButtonComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();            
          }
          break;
        case 'staticbuttongroup': {
            const componentRef = this.itemHost.createComponent(EditLayoutStaticButtonGroupComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;          
        case 'text':
        case 'mail': {
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
        case 'richtext':  {
            const componentRef = this.itemHost.createComponent(EditLayoutRichtextComponent);

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
        case 'lookup':
        case 'pickvalue': {
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
        case 'multivalue': {
            const componentRef = this.itemHost.createComponent(EditLayoutMultivalueComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'tabs': {
            //const { EditLayoutTabsComponent } = await import('../tabs/tabs.component');
            const componentRef = this.itemHost.createComponent(EditLayoutTabsComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
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
        case 'map':  {
            const componentRef = this.itemHost.createComponent(EditLayoutMapComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem);            
            componentRef.changeDetectorRef.detectChanges();
          }                        
          break;
        case 'entitygrid': {
            //const { EditLayoutEntitygridComponent } = await import('../entitygrid/entitygrid.component');
            const componentRef = this.itemHost.createComponent(EditLayoutEntitygridComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'detailgrid': {
            const componentRef = this.itemHost.createComponent(EditLayoutDetailGridComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'detailtree': {
            const componentRef = this.itemHost.createComponent(EditLayoutDetailTreeComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;          
        case 'json': {
            const componentRef = this.itemHost.createComponent(EditLayoutJsonComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;
        case 'javascript': {
            const componentRef = this.itemHost.createComponent(EditLayoutJavascriptComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;          
        case 'sql': {
            const componentRef = this.itemHost.createComponent(EditLayoutSqlComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          }
          break;          
        case 'attachements':
        case 'attachments': {
            const componentRef = this.itemHost.createComponent(EditLayoutAttachmentsComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          } 
          break;  
        case 'statistic': {
            const componentRef = this.itemHost.createComponent(EditLayoutStatisticComponent);

            componentRef.setInput('initialLayoutItem', this.layoutItem); 
            componentRef.changeDetectorRef.detectChanges();
          } 
          break;            
        case 'empty':
          break;
        default: {
            console.warn(`Unknown edit layout item type ${this.layoutItem.type}`);
          }

      }
    }
  }

}
