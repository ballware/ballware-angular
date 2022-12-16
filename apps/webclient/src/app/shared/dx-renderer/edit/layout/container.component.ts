import { Component, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-edit-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class EditLayoutContainerComponent {

  @Input() height: string|undefined = undefined;
  @Input() colCount!: number;
  @Input() items!: EditLayoutItem[];
}
