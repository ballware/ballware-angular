import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSwitchModule, DxValidatorModule } from 'devextreme-angular';
import { BoolValue, EditItemLivecycle, Readonly, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../../directives';

@Component({
    selector: 'ballware-edit-toggle',
    templateUrl: './edittoggle.component.html',
    styleUrls: [],
    imports: [CommonModule, DxValidatorModule, DxSwitchModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, BoolValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutToggleComponent {
  constructor(
    public readonly livecycle: EditItemLivecycle,
    public readonly visible: Visible,
    public readonly readonly: Readonly,
    public readonly value: BoolValue,
    public readonly validation: Validation) {
  }
}
