import { Component, DestroyRef, OnInit } from '@angular/core';
import { CodeMirrorEditorOptions } from "../components/codeeditor/options";
import { CommonModule } from "@angular/common";
import { CodeMirrorComponent } from "../components/codeeditor/codemirror.component";
import {
  EditItemLivecycle,
  StringValue,
  Readonly,
  Visible,
} from '@ballware/renderer-commons';
import { Validation, Required } from "../../directives";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-javascript',
    templateUrl: './javascript.component.html',
    styleUrls: [],
    imports: [CommonModule, CodeMirrorComponent],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
    standalone: true
})
export class EditLayoutJavascriptComponent implements OnInit {

    public options: CodeMirrorEditorOptions|undefined;
    public height: string|undefined;

    constructor(
      private destroy: DestroyRef,
      public livecycle: EditItemLivecycle,
      public visible: Visible,
      public readonly: Readonly,
      public value: StringValue,
      public validation: Validation
    ) {}

    ngOnInit(): void {
      this.livecycle.preparedLayoutItem$.pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe((layoutItem) => {
        this.height = layoutItem?.options?.height;
        this.options = layoutItem?.options?.itemoptions as CodeMirrorEditorOptions;
      });
    }
  }
