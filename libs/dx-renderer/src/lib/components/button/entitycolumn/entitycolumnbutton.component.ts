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
import { ClickEvent as ButtonClickEvent } from "devextreme/ui/button";
import { cloneDeep } from "lodash";
import { combineLatest } from "rxjs";
import { CommonModule } from "@angular/common";
import {
  DxButtonComponent, DxButtonModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-button',
    templateUrl: './entitycolumnbutton.component.html',
    styleUrls: [],
    imports: [CommonModule, DxButtonModule]
})
export class EntityColumnButtonComponent implements OnInit {
    @ViewChild('button', { static: false }) button?: DxButtonComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    text: string|undefined;

    onClicked: ((e: ButtonClickEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(META_SERVICE) private readonly metaService: MetaService
        ) {
    }

    getEditorOption(option: string): unknown {
      return this.button?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.button?.instance.option(option, value);
    }

    ngOnInit(): void {
        combineLatest([
            this.metaService.editorEvent$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([editorEvent]) => {
          if (editorEvent) {
              const preparedColumn = cloneDeep(this.column);

              this.text = preparedColumn.caption;
              this.onClicked = () => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  editorEvent(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, 'click');
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;
          }
      });
    }
}
