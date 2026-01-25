import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import {
    DxNumberBoxComponent, DxNumberBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import {
  COLUMN_EDITOR_DELEGATE,
} from '../../../directives';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-number',
  templateUrl: './columnnumber.component.html',
  styleUrls: ['./columnnumber.component.scss'],
  imports: [CommonModule, DxNumberBoxModule, DxValidatorModule],
})
export class ColumnNumberComponent {
  @ViewChild('element', { static: false }) element?: DxNumberBoxComponent;

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  readonly value$: Observable<number> = this.editing.value$.pipe(
    map((value) => value as number)
  );

  readonly valueChanged = (e: NumberValueChangedEvent) =>
    this.editing.valueChanged(this, e.value);
  readonly getOption = (option: string) =>
    this.element?.instance.option(option);
  readonly setOption = (option: string, value: unknown) =>
    this.element?.instance.option(option, value);
}
