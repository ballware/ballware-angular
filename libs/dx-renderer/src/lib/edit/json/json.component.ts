import { Component, OnInit } from "@angular/core";
import { takeUntil } from "rxjs";
import { CodeMirrorEditorOptions } from "../components/codeeditor/options";
import { CommonModule } from "@angular/common";
import { CodeMirrorComponent } from "../components/codeeditor/codemirror.component";
import { Destroy, EditItemLivecycle, StringValue, Readonly, Visible } from "@ballware/renderer-commons";
import { Validation, Required } from "../../directives";

@Component({
    selector: 'ballware-edit-json',
    templateUrl: './json.component.html',
    styleUrls: [],
    imports: [CommonModule, CodeMirrorComponent],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
    standalone: true
})
export class EditLayoutJsonComponent implements OnInit {

    public options: CodeMirrorEditorOptions|undefined;
    public height: string|undefined;
      
    constructor(
      public destroy: Destroy,
      public livecycle: EditItemLivecycle,
      public visible: Visible,
      public readonly: Readonly,
      public value: StringValue,
      public validation: Validation
    ) {}
  
    ngOnInit(): void {
      this.livecycle.preparedLayoutItem$
        .pipe(takeUntil(this.destroy.destroy$))
        .subscribe((layoutItem) => {
          this.height = layoutItem?.options?.height;
          this.options = layoutItem?.options?.itemoptions as CodeMirrorEditorOptions;
        });      
    }  
  }