import { Component, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-edit-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class EditLayoutGroupComponent {

  @Input() layoutItem?: EditLayoutItem;
}
