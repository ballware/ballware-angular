import { Component, forwardRef, Input } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';

import { EditLayoutContainerComponent } from '../../layout'
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ballware-edit-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    imports: [CommonModule, EditLayoutContainerComponent, forwardRef(() => EditLayoutContainerComponent)]
})
export class EditLayoutGroupComponent {

  @Input() initialLayoutItem!: EditLayoutItem;
}
