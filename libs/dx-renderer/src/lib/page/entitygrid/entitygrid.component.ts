import { Component, Input } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-page-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: ['./entitygrid.component.scss']
})
export class PageLayoutEntitygridComponent {

  @Input() layoutItem?: PageLayoutItem;
}

