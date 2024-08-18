import { Component, forwardRef, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

import { EditLayoutContainerComponent } from '../layout/container.component'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-edit-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  imports: [CommonModule, forwardRef(() => EditLayoutContainerComponent)],
  standalone: true
})
export class EditLayoutGroupComponent {

  @Input() layoutItem!: EditLayoutItem;
}
