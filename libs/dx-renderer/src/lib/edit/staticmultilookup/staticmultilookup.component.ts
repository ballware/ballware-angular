import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTagBoxModule, DxValidatorModule } from 'devextreme-angular';
import { Destroy, EditItemLivecycle, UnknownArrayValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required, Lookup } from '../../directives';

@Component({
  selector: 'ballware-edit-staticmultilookup',
  templateUrl: './staticmultilookup.component.html',
  styleUrls: [],
  imports: [CommonModule, DxTagBoxModule, DxValidatorModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, UnknownArrayValue, Readonly, Validation, Required, Visible, Lookup],
  standalone: true
})
export class EditLayoutStaticmultilookupComponent {

  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: UnknownArrayValue,
    public validation: Validation,
    public lookup: Lookup
  ) {}
}
