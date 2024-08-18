import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

@Component({
  selector: 'ballware-edit-fieldset',
  templateUrl: './fieldset.component.html',
  styleUrls: ['./fieldset.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class EditLayoutFieldsetComponent {

  @Input() layoutItem!: EditLayoutItem;
}
