import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

@Component({
    selector: 'ballware-edit-fieldset',
    templateUrl: './editfieldset.component.html',
    styleUrls: ['./editfieldset.component.scss'],
    imports: [CommonModule]
})
export class EditLayoutFieldsetComponent {

  @Input() layoutItem!: EditLayoutItem;
}
