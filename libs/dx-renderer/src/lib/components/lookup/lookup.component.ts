import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { LookupDelegate } from '../../utils';
import { ValidationRule } from 'devextreme/common';
import { FocusInEvent } from 'devextreme/ui/select_box';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule, DxTemplateModule, DxValidatorModule } from 'devextreme-angular';

@Component({
  selector: 'ballware-lookup',
  templateUrl: './lookup.component.html',
  imports: [
    CommonModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxValidatorModule
  ]
})
export class BallwareLookupComponent {
  @HostBinding('class') incomingClasses = '';

  @Input() label!: string;
  @Input() name!: string;
  @Input() visible!: boolean;
  @Input() readOnly!: boolean;

  @Input() value: unknown;
  @Output() valueChange = new EventEmitter<unknown>;

  @Output() focusIn = new EventEmitter<FocusInEvent>;

  @Input() lookup!: LookupDelegate|undefined|null;
  @Input() validationRules!: ValidationRule[];
}
