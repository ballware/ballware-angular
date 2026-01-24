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
    DxNumberBoxComponent, DxNumberBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';

@Component({
  selector: 'ballware-column-number',
  templateUrl: './columnnumber.component.html',
  styleUrls: ['./columnnumber.component.scss'],
  imports: [CommonModule, DxNumberBoxModule, DxValidatorModule],
})
export class ColumnNumberComponent {
  @ViewChild('element', { static: false }) element?: DxNumberBoxComponent;

  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  value: number | undefined = undefined;

  onValueChanged: ((e: NumberValueChangedEvent) => void) | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(COLUMN_EDITOR_DELEGATE)
    readonly editing: ColumnEditorDelegateService
  ) {
    this.editing.value$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((value) => (this.value = value as number));

    this.editing.valueChanged$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((valueChanged) => {
        if (valueChanged) {
          this.onValueChanged = (e: NumberValueChangedEvent) => {
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
