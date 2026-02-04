import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from '@angular/core';
import { EditItemRef } from "@ballware/meta-services";
import {
    DxCheckBoxComponent, DxCheckBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { COLUMN_EDITOR_DELEGATE } from "../../../directives";
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-bool',
  templateUrl: './columnbool.component.html',
  styleUrls: ['./columnbool.component.scss'],
  imports: [CommonModule, DxCheckBoxModule, DxValidatorModule],
})
export class ColumnBoolComponent implements EditItemRef {
  @ViewChild('element', { static: false }) element?: DxCheckBoxComponent;

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  readonly value$: Observable<boolean> = this.editing.value$.pipe(
    map((value) => value as boolean),
  );

  readonly valueChanged = (e: BoolValueChangedEvent) => this.editing.valueChanged(this, e.value)
  readonly getOption = (option: string) => this.element?.instance.option(option)
  readonly setOption = (option: string, value: unknown) => this.element?.instance.option(option, value)
}
