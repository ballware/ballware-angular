import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { Destroy, EditItemLivecycle, Readonly, StringValue, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';
import { CommonModule } from '@angular/common';
import { DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';

@Component({
  selector: 'ballware-edit-text',
  templateUrl: './text.component.html',
  styleUrls: [],
  imports: [CommonModule, DxTextBoxModule, DxValidatorModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutTextComponent implements OnInit {
  
  constructor(
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: StringValue,
    public validation: Validation) {}

  ngOnInit(): void {
        
    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          if (layoutItem.type === 'mail') {
            this.validation.validateEmail(true);
          }
        }
      });    
  }
}
