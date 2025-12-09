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
import { ValueChangedEvent as TextValueChangedEvent } from "devextreme/ui/text_area";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { CommonModule } from "@angular/common";
import {
  DxTextAreaComponent, DxTextAreaModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-textarea',
    templateUrl: './entitycolumncode.component.html',
    styleUrls: [],
    imports: [CommonModule, DxTextAreaModule]
})
export class EntityColumnCodeComponent implements OnInit {
    @ViewChild('textbox', { static: false }) textbox?: DxTextAreaComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: string|undefined = undefined;

    onValueChanged: ((e: TextValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(META_SERVICE) private readonly metaService: MetaService
        ) {
    }

    textValue() {
        return this.value;
    }

    getEditorOption(option: string): unknown {
      return this.textbox?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.textbox?.instance.option(option, value);
    }

    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember) as string;
        }

        combineLatest([
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([editorValueChanged]) => {
          if (editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: TextValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember) as string;

                  editorValueChanged(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;
          }
      });
    }
}
