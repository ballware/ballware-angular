import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTextAreaModule, DxValidatorModule } from 'devextreme-angular';
import { Destroy, EditItemLivecycle, Readonly, StringValue, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';

@Component({
  selector: 'ballware-edit-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  imports: [CommonModule, DxTextAreaModule, DxValidatorModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutTextareaComponent {
  
  constructor(public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: StringValue,
    public validation: Validation) {}
}
