import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditUtil, GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, META_SERVICE, MetaService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { DateType, ValueChangedEvent as DateValueChangedEvent } from 'devextreme/ui/date_box';
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { CommonModule } from "@angular/common";
import {
  DxDateBoxComponent, DxDateBoxModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-datetime',
    templateUrl: './entitycolumndatetime.component.html',
    styleUrls: [],
    imports: [CommonModule, DxDateBoxModule]
})
export class EntityColumnDatetimeComponent implements OnInit {
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    public type!: DateType;
    public displayFormat!: string;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: Date|undefined = undefined;

    onValueChanged: ((e: DateValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(META_SERVICE) private readonly metaService: MetaService
        ) {
    }

    dateValue() {
        return this.value;
    }

    getEditorOption(option: string): unknown {
      return this.datebox?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.datebox?.instance.option(option, value);
    }

    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember) as Date;
        }

        combineLatest([
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([editorValueChanged]) => {
          if (editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: DateValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember) as Date;

                  editorValueChanged(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;

              this.type = this.preparedColumn?.type as DateType;

              switch (this.preparedColumn?.type) {
                case 'datetime':
                  this.displayFormat = this.translator('format.datetime');
                  break;
                case 'date':
                default:
                  this.displayFormat = this.translator('format.date');
              }

              this.prepared = true;
          }
      });
    }
}
