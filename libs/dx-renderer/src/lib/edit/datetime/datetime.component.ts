import { Component, Inject, OnInit } from '@angular/core';
import { Translator, TRANSLATOR } from '@ballware/meta-services';
import { DateType } from 'devextreme/ui/date_box';
import { takeUntil } from 'rxjs';
import { DxDateBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { Destroy, EditItemLivecycle, NullableDateValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required } from '../../directives';

@Component({
  selector: 'ballware-edit-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: [],
  imports: [CommonModule, DxDateBoxModule, DxValidatorModule],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableDateValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutDatetimeComponent implements OnInit {

  public type!: DateType;
  public displayFormat!: string;

  constructor(
    @Inject(TRANSLATOR) private translator: Translator, 
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NullableDateValue,
    public validation: Validation
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {        
        this.type = layoutItem?.type as DateType;

        switch (layoutItem?.type) {              
          case 'datetime':
            this.displayFormat = this.translator('format.datetime');
            break;
          case 'date':
          default:
            this.displayFormat = this.translator('format.date');
        }
      });  
  }
}
