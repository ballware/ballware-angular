import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { Translator, TRANSLATOR } from '@ballware/meta-services';
import { DateType } from 'devextreme/ui/date_box';
import { DxDateBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { EditItemLivecycle, NullableDateValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required } from '../../directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-datetime',
    templateUrl: './datetime.component.html',
    styleUrls: [],
    imports: [CommonModule, DxDateBoxModule, DxValidatorModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableDateValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutDatetimeComponent implements OnInit {

  public type!: DateType;
  public displayFormat!: string;

  constructor(
    @Inject(TRANSLATOR) private translator: Translator,
    private destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: NullableDateValue,
    public validation: Validation
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
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
