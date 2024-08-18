import { Component, Input } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';
import { PageLayoutCrudcontainerComponent } from '../crudcontainer/crudcontainer.component';
import { PageLayoutGridComponent } from '../grid/grid.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-page-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: ['./entitygrid.component.scss'],
  imports: [CommonModule, PageLayoutCrudcontainerComponent, PageLayoutGridComponent],
  standalone: true
})
export class PageLayoutEntitygridComponent {

  @Input() layoutItem?: PageLayoutItem;
}

