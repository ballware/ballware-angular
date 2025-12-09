import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditUtil, GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, META_SERVICE, MetaService } from "@ballware/meta-services";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { CommonModule } from "@angular/common";
import {
  DxNumberBoxComponent, DxNumberBoxModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-number',
    templateUrl: './entitycolumnnumber.component.html',
    styleUrls: [],
    imports: [CommonModule, DxNumberBoxModule]
})
export class EntityColumnNumberComponent implements OnInit {
    @ViewChild('numberbox', { static: false }) numberbox?: DxNumberBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: number|undefined = undefined;

    onValueChanged: ((e: NumberValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(META_SERVICE) private readonly metaService: MetaService
        ) {
    }

    numberValue() {
        return this.value;
    }

    getEditorOption(option: string): unknown {
      return this.numberbox?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.numberbox?.instance.option(option, value);
    }

    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember) as number;
        }

        combineLatest([
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([editorValueChanged]) => {
          if (editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: NumberValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember) as number;

                  editorValueChanged(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;
          }
      });
    }
}
