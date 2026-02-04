import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import {
  EditItemRef,
} from '@ballware/meta-services';
import {
    DxTextBoxComponent, DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_box";
import {
  COLUMN_EDITOR_DELEGATE,
} from '../../../directives';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-text',
  templateUrl: './columntext.component.html',
  styleUrls: ['./columntext.component.scss'],
  imports: [CommonModule, DxTextBoxModule, DxValidatorModule],
})
export class ColumnTextComponent implements EditItemRef {
  @ViewChild('element', { static: false }) element?: DxTextBoxComponent;

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  readonly value$: Observable<string> = this.editing.value$.pipe(
    map((value) => value as string)
  );

  readonly valueChanged = (e: TextValueChangedEvent) =>
    this.editing.valueChanged(this, e.value);
  readonly getOption = (option: string) =>
    this.element?.instance.option(option);
  readonly setOption = (option: string, value: unknown) =>
    this.element?.instance.option(option, value);
}
