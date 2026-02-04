import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { Translator, TRANSLATOR } from '@ballware/meta-services';
import { DateType } from 'devextreme/ui/date_box';
import { DxDateBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { EditItemLivecycle, NullableDateValue, Readonly, Visible } from '@ballware/renderer-commons';
import { Validation, Required } from '../../../directives';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-datetime',
    templateUrl: './editdatetime.component.html',
    styleUrls: [],
    imports: [CommonModule, DxDateBoxModule, DxValidatorModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableDateValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutDatetimeComponent implements OnInit {

  public type!: DateType;
  public displayFormat!: string;

  constructor(
    @Inject(TRANSLATOR) private readonly translator: Translator,
    private readonly destroy: DestroyRef,
    public readonly livecycle: EditItemLivecycle,
    public readonly visible: Visible,
    public readonly readonly: Readonly,
    public readonly value: NullableDateValue,
    public readonly validation: Validation
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
