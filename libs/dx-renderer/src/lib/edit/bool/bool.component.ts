import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxCheckBoxModule, DxValidatorModule } from 'devextreme-angular';
import { BoolValue, Destroy, EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';

@Component({
  selector: 'ballware-edit-bool',
  templateUrl: './bool.component.html',
  styleUrls: [],
  imports: [CommonModule, DxValidatorModule, DxCheckBoxModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, BoolValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutBoolComponent {
  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: BoolValue,
    public validation: Validation) {   
  }
}
