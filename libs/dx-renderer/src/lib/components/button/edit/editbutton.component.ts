import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';
import { EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';

@Component({
    selector: 'ballware-edit-button',
    templateUrl: './editbutton.component.html',
    styleUrls: [],
    imports: [CommonModule, DxButtonModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly, Visible]
})
export class EditLayoutButtonComponent {

  constructor(
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly
  ) {}
}
