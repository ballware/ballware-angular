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
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { CommonModule } from "@angular/common";
import {
  DxCheckBoxComponent, DxCheckBoxModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-bool',
    templateUrl: './entitycolumnbool.component.html',
    styleUrls: [],
    imports: [CommonModule, DxCheckBoxModule]
})
export class EntityColumnBoolComponent implements OnInit {
    @ViewChild('checkbox', { static: false }) checkbox?: DxCheckBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: boolean|undefined = undefined;

    onValueChanged: ((e: BoolValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(META_SERVICE) private readonly metaService: MetaService
        ) {
    }

    boolValue() {
        return this.value;
    }

    getEditorOption(option: string): unknown {
      return this.checkbox?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.checkbox?.instance.option(option, value);
    }

    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember) as boolean;
        }

        combineLatest([
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([editorValueChanged]) => {
          if (editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: BoolValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember) as boolean;

                  editorValueChanged(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;
          }
      });
    }
}
