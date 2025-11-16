import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule, DxValidatorModule } from 'devextreme-angular';
import { EditItemLivecycle, NullableStringValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required, Lookup } from '../../directives';

@Component({
  selector: 'ballware-edit-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: [],
  imports: [CommonModule, DxSelectBoxModule, DxValidatorModule],
  hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableStringValue, Readonly, Validation, Required, Visible, Lookup],
  standalone: true
})
export class EditLayoutLookupComponent {

  constructor(
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NullableStringValue,
    public validation: Validation,
    public lookup: Lookup
  ) {}
}
