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
  LOOKUP_SERVICE,
  LookupService,
  Translator,
  TRANSLATOR,
} from '@ballware/meta-services';
import {
    DxTagBoxComponent, DxTagBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ValueChangedEvent as LookupValueChangedEvent } from "devextreme/ui/tag_box";
import {
  LOOKUP_DELEGATE_BUILDER_FACTORY,
  LookupDelegate,
  LookupDelegateBuilderFactory,
} from '../../../utils';
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';

@Component({
    selector: 'ballware-column-multilookup',
    templateUrl: './columnmultilookup.component.html',
    styleUrls: ['./columnmultilookup.component.scss'],
    imports: [CommonModule, DxTagBoxModule, DxValidatorModule]
})
export class ColumnMultiLookupComponent {
    @ViewChild('tagbox', { static: false }) tagbox?: DxTagBoxComponent;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown[] = [];
    lookup: LookupDelegate|undefined;

    onValueChanged: ((e: LookupValueChangedEvent) => void)|undefined;

    constructor(
        @Inject(TRANSLATOR) private readonly translator: Translator,
        @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
        @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY) private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory,
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
              getOption: (option: string) => this.tagbox?.instance.option(option),
              setOption: (option: string, value: unknown) => this.tagbox?.instance.option(option, value),
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
