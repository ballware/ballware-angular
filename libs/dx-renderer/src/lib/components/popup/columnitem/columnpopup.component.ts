import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  COLUMN_EDITOR_DELEGATE,
  ColumnEditorDelegateService,
} from '../../../directives';
import { DxButtonModule } from 'devextreme-angular';
import { I18NextPipe } from 'angular-i18next';

@Component({
  selector: 'ballware-column-popup',
  templateUrl: './columnpopup.component.html',
  styleUrls: ['./columnpopup.component.scss'],
  imports: [
    CommonModule,
    DxButtonModule,
    I18NextPipe,
  ],
})
export class ColumnPopupComponent {
  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;
  readonly = false;

  openColumnPopup: () => void = () => { throw new Error('Method call before initialize column'); };

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(COLUMN_EDITOR_DELEGATE)
    readonly editing: ColumnEditorDelegateService
  ) {
    this.editing.preparedColumn$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((preparedColumn) => (this.preparedColumn = preparedColumn));

    this.editing.prepared$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((prepared) => (this.prepared = prepared));

    this.editing.readonly$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((readOnly) => (this.readonly = readOnly ?? false));

    this.editing.openColumnPopup$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((openColumnPopup) => {
        if (openColumnPopup) {
          this.openColumnPopup = openColumnPopup;
        }
      });
  }
}
