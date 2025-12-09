import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CodeMirrorComponent, CodeMirrorEditorOptions } from "../../codemirror";
import { EditItemLivecycle, StringValue, Readonly, Visible } from "@ballware/renderer-commons";
import { Validation, Required } from "../../../directives";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-code',
    templateUrl: './editcode.component.html',
    styleUrls: [],
    imports: [CommonModule, CodeMirrorComponent],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutCodeComponent implements OnInit {

    @Input() public mode: 'json' | 'javascript' | 'sql' | undefined;

    public options: CodeMirrorEditorOptions|undefined;
    public height: string|undefined;

    constructor(
      private readonly destroy: DestroyRef,
      public readonly livecycle: EditItemLivecycle,
      public readonly visible: Visible,
      public readonly readonly: Readonly,
      public readonly value: StringValue,
      public readonly validation: Validation
    ) {}

    ngOnInit(): void {
      this.livecycle.preparedLayoutItem$.pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe((layoutItem) => {
        this.mode = this.mode ? this.mode : layoutItem?.type as 'json' | 'javascript' | 'sql';
        this.height = layoutItem?.options?.height;
        this.options = layoutItem?.options?.itemoptions as CodeMirrorEditorOptions;
      });
    }
}
