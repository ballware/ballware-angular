import { Component, DestroyRef, OnInit } from '@angular/core';
import { DxNumberBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { EditItemLivecycle, NumberValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required } from '../../../directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface NumberItemOptions {
  min?: number;
  max?: number;
}

@Component({
    selector: 'ballware-edit-number',
    templateUrl: './editnumber.component.html',
    styleUrls: [],
    imports: [CommonModule, DxNumberBoxModule, DxValidatorModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NumberValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutNumberComponent implements OnInit {

  public options: NumberItemOptions = {};

  constructor(
    private readonly destroy: DestroyRef,
    public readonly livecycle: EditItemLivecycle,
    public readonly visible: Visible,
    public readonly readonly: Readonly,
    public readonly value: NumberValue,
    public readonly validation: Validation
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      this.options = layoutItem?.options?.itemoptions as NumberItemOptions ?? {};

      this.livecycle.registerOption('min', () => this.options?.min, (value) => this.options.min = value as number);
      this.livecycle.registerOption('max', () => this.options?.max, (value) => this.options.max = value as number);
    });
  }
}
