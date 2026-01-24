import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import {
  EditItemRef,
} from '@ballware/meta-services';
import {
    DxTextBoxComponent, DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_box";
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';

@Component({
  selector: 'ballware-column-text',
  templateUrl: './columntext.component.html',
  styleUrls: ['./columntext.component.scss'],
  imports: [CommonModule, DxTextBoxModule, DxValidatorModule],
})
export class ColumnTextComponent {
  @ViewChild('element', { static: false }) element?: DxTextBoxComponent;

  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  value: string | undefined = undefined;

  onValueChanged: ((e: TextValueChangedEvent) => void) | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(COLUMN_EDITOR_DELEGATE)
    readonly editing: ColumnEditorDelegateService
  ) {
    this.editing.value$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((value) => (this.value = value as string));

    this.editing.valueChanged$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((valueChanged) => {
        if (valueChanged) {
          this.onValueChanged = (e: TextValueChangedEvent) => {
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
