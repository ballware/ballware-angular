import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { EditItemRef, TRANSLATOR } from "@ballware/meta-services";
import {
    DxDateBoxComponent, DxDateBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { DateType, ValueChangedEvent as DateValueChangedEvent } from 'devextreme/ui/date_box';
import { COLUMN_EDITOR_DELEGATE } from "../../../directives";
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-datetime',
  templateUrl: './columndatetime.component.html',
  styleUrls: ['./columndatetime.component.scss'],
  imports: [CommonModule, DxDateBoxModule, DxValidatorModule],
})
export class ColumnDatetimeComponent implements EditItemRef {
  @ViewChild('element', { static: false }) element?: DxDateBoxComponent;

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);
  readonly translator = inject(TRANSLATOR);

  readonly value$: Observable<Date> = this.editing.value$.pipe(
    map((value) => value as Date)
  );

  readonly valueChanged = (e: DateValueChangedEvent) =>
    this.editing.valueChanged(this, e.value);
  readonly getOption = (option: string) =>
    this.element?.instance.option(option);
  readonly setOption = (option: string, value: unknown) =>
    this.element?.instance.option(option, value);

  public type$: Observable<DateType> = this.editing.preparedColumn$.pipe(
    map(
      (preparedColumn) =>
        preparedColumn?.type as DateType
    )
  );

  public displayFormat$: Observable<string> = this.editing.preparedColumn$.pipe(
    map((preparedColumn) => {
      switch (preparedColumn?.type) {
        case 'datetime':
          return this.translator('format.datetime');
        case 'date':
        default:
          return this.translator('format.date');
      }
    })
  );
}
