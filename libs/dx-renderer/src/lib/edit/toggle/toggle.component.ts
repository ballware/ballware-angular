import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSwitchModule, DxValidatorModule } from 'devextreme-angular';
import { BoolValue, EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';

@Component({
  selector: 'ballware-edit-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: [],
  imports: [CommonModule, DxValidatorModule, DxSwitchModule],
  hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, BoolValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutToggleComponent {
  constructor(
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: BoolValue,
    public validation: Validation) {
  }
}
