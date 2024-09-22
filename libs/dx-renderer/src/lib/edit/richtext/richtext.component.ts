import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DxHtmlEditorModule, DxValidatorModule } from "devextreme-angular";
import { Destroy, EditItemLivecycle, Readonly, StringValue, Visible } from "@ballware/renderer-commons";
import { Validation, Required } from "../../directives";

@Component({
    selector: 'ballware-edit-richtext',
    templateUrl: './richtext.component.html',
    styleUrls: ['./richtext.component.scss'],
    imports: [CommonModule, DxHtmlEditorModule, DxValidatorModule],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
    standalone: true
  })
  export class EditLayoutRichtextComponent {
  
    constructor(
      public destroy: Destroy,
      public livecycle: EditItemLivecycle,
      public visible: Visible,
      public readonly: Readonly,
      public value: StringValue,
      public validation: Validation) {}
  }