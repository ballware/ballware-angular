import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import { EditItemRef, Translator, TRANSLATOR } from "@ballware/meta-services";
import {
    DxDateBoxComponent, DxDateBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { DateType, ValueChangedEvent as DateValueChangedEvent } from 'devextreme/ui/date_box';
import { COLUMN_EDITOR_DELEGATE, ColumnEditorDelegateService } from "../../../directives";

@Component({
  selector: 'ballware-column-datetime',
  templateUrl: './columndatetime.component.html',
  styleUrls: ['./columndatetime.component.scss'],
  imports: [CommonModule, DxDateBoxModule, DxValidatorModule],
})
export class ColumnDatetimeComponent {
  @ViewChild('element', { static: false }) element?: DxDateBoxComponent;

  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  value: Date | undefined = undefined;

  public type!: DateType;
  public displayFormat!: string;

  onValueChanged: ((e: DateValueChangedEvent) => void) | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(TRANSLATOR) private readonly translator: Translator,
    @Inject(COLUMN_EDITOR_DELEGATE)
    readonly editing: ColumnEditorDelegateService
  ) {
    this.editing.value$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((value) => (this.value = value as Date));

    this.editing.valueChanged$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((valueChanged) => {
        if (valueChanged) {
          this.onValueChanged = (e: DateValueChangedEvent) => {
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
      .subscribe((preparedColumn) => {
        this.preparedColumn = preparedColumn;

        this.type = this.preparedColumn?.type as DateType;

        switch (this.preparedColumn?.type) {
          case 'datetime':
            this.displayFormat = this.translator('format.datetime');
            break;
          case 'date':
          default:
            this.displayFormat = this.translator('format.date');
        }
      });

    this.editing.prepared$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((prepared) => (this.prepared = prepared));
  }
}
