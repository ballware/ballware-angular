import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  EditItemRef,
} from '@ballware/meta-services';
import {
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { ValueChangedEvent as LookupValueChangedEvent } from "devextreme/ui/select_box";
import {
  LookupDelegate,
} from '../../../utils';
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';

@Component({
    selector: 'ballware-column-lookup',
    templateUrl: './columnlookup.component.html',
    styleUrls: ['./columnlookup.component.scss'],
    imports: [CommonModule, DxSelectBoxModule, DxValidatorModule]
})
export class ColumnLookupComponent {
    @ViewChild('element', { static: false }) element?: DxSelectBoxComponent;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown;
    lookup: LookupDelegate|undefined;

    onValueChanged: ((e: LookupValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(COLUMN_EDITOR_DELEGATE) readonly editing: ColumnEditorDelegateService) {
      this.editing.lookup$.pipe(
        takeUntilDestroyed(this.destroy),
      ).subscribe(lookup => this.lookup = lookup);

      this.editing.value$.pipe(
        takeUntilDestroyed(this.destroy),
      ).subscribe(value => this.value = value as unknown[]);

      this.editing.valueChanged$.pipe(
        takeUntilDestroyed(this.destroy),
      ).subscribe(valueChanged => {
        if (valueChanged) {
          this.onValueChanged = (e: LookupValueChangedEvent) => {
            const editorRef = {
              getOption: (option: string) =>
                this.element?.instance.option(option),
              setOption: (option: string, value: unknown) =>
                this.element?.instance.option(option, value),
            } as EditItemRef;

            valueChanged(editorRef, e.value);
          }
        } else {
          this.onValueChanged = undefined;
        }

      });

      this.editing.preparedColumn$.pipe(
        takeUntilDestroyed(this.destroy),
      ).subscribe(preparedColumn => this.preparedColumn = preparedColumn);

      this.editing.prepared$.pipe(
        takeUntilDestroyed(this.destroy),
      ).subscribe(prepared => this.prepared = prepared);
    }
}
