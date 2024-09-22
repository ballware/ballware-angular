import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DxNumberBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { Destroy, EditItemLivecycle, NumberValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required } from '../../directives';

export interface NumberItemOptions {  
  min?: number;
  max?: number;
}

@Component({
  selector: 'ballware-edit-number',
  templateUrl: './number.component.html',
  styleUrls: [],
  imports: [CommonModule, DxNumberBoxModule, DxValidatorModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NumberValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutNumberComponent implements OnInit {

  public options: NumberItemOptions = {};

  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NumberValue,
    public validation: Validation
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {        
        this.options = layoutItem?.options?.itemoptions as NumberItemOptions ?? {};

        this.livecycle.registerOption('min', () => this.options?.min, (value) => this.options.min = value as number);
        this.livecycle.registerOption('max', () => this.options?.max, (value) => this.options.max = value as number);
      });  
  }  
}
