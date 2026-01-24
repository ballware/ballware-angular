import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import { EditItemRef } from "@ballware/meta-services";
import {
    DxCheckBoxComponent, DxCheckBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { COLUMN_EDITOR_DELEGATE, ColumnEditorDelegateService } from "../../../directives";

@Component({
  selector: 'ballware-column-bool',
  templateUrl: './columnbool.component.html',
  styleUrls: ['./columnbool.component.scss'],
  imports: [CommonModule, DxCheckBoxModule, DxValidatorModule],
})
export class ColumnBoolComponent {
  @ViewChild('element', { static: false }) element?: DxCheckBoxComponent;

  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  value: boolean | undefined = undefined;

  onValueChanged: ((e: BoolValueChangedEvent) => void) | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(COLUMN_EDITOR_DELEGATE) readonly editing: ColumnEditorDelegateService
  ) {

    this.editing.value$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((value) => (this.value = value as boolean));

    this.editing.valueChanged$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((valueChanged) => {
        if (valueChanged) {
          this.onValueChanged = (e: BoolValueChangedEvent) => {
            const editorRef = {
              getOption: (option: string) =>
                this.element?.instance.option(option),
              setOption: (option: string, value: unknown) =>
                this.element?.instance.option(option, value),
            } as EditItemRef;

            valueChanged(editorRef, e.value);
          };
        } else {
          this.onValueChanged = undefined;
        }
      });

    this.editing.preparedColumn$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((preparedColumn) => (this.preparedColumn = preparedColumn));

    this.editing.prepared$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((prepared) => (this.prepared = prepared));
  }
}
