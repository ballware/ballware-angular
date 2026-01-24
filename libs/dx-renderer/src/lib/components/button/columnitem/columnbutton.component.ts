import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import {
  EditItemRef,
} from '@ballware/meta-services';
import {
    DxButtonComponent, DxButtonModule, DxValidatorModule
} from 'devextreme-angular';
import { ClickEvent as ButtonClickEvent } from "devextreme/ui/button";
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';

@Component({
  selector: 'ballware-column-button',
  templateUrl: './columnbutton.component.html',
  styleUrls: ['./columnbutton.component.scss'],
  imports: [CommonModule, DxButtonModule, DxValidatorModule],
})
export class ColumnButtonComponent {
  @ViewChild('element', { static: false }) element?: DxButtonComponent;

  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  text: string | undefined;

  onClicked: ((e: ButtonClickEvent) => void) | undefined;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(COLUMN_EDITOR_DELEGATE) readonly editing: ColumnEditorDelegateService) {

    this.editing.preparedColumn$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((preparedColumn) => (this.preparedColumn = preparedColumn));

    this.editing.prepared$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((prepared) => (this.prepared = prepared));

    this.editing.raiseEvent$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((raiseEvent) => {
        if (raiseEvent) {
          this.onClicked = () => {
            const editorRef = {
              getOption: (option: string) =>
                this.element?.instance.option(option),
              setOption: (option: string, value: unknown) =>
                this.element?.instance.option(option, value),
            } as EditItemRef;

            raiseEvent(editorRef, 'click');
          };
        } else {
          this.onClicked = undefined;
        }
      });
  }
}
