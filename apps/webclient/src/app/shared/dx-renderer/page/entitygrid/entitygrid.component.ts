import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';
import { PageLayoutCrudcontainerModule } from '../crudcontainer/crudcontainer.component';
import { PageLayoutGridModule } from '../grid/grid.component';

@Component({
  selector: 'ballware-page-entitygrid',
  templateUrl: './entitygrid.component.html',
  styleUrls: ['./entitygrid.component.scss']
})
export class PageLayoutEntitygridComponent {

  @Input() layoutItem?: PageLayoutItem;
}

@NgModule({
  declarations: [PageLayoutEntitygridComponent],
  imports: [
    CommonModule,
    PageLayoutCrudcontainerModule,
    PageLayoutGridModule
  ]
})
export class PageLayoutEntitygridModule {}
