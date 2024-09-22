import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';
import { Destroy, EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';

@Component({
  selector: 'ballware-edit-button',
  templateUrl: './button.component.html',
  styleUrls: [],
  imports: [CommonModule, DxButtonModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly, Visible],
  standalone: true
})
export class EditLayoutButtonComponent {
  
  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly
  ) {}
}
