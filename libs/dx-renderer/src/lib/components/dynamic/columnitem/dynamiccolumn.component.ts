import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  Inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridLayoutColumn } from "@ballware/meta-model";
import { COLUMN_EDITOR_DELEGATE, ColumnEditorDelegateService } from "../../../directives";
import { ColumnPopupComponent } from "../../popup";
import { ColumnLookupComponent } from '../../lookup';
import { ColumnMultiLookupComponent } from '../../multilookup';
import { ColumnBoolComponent } from '../../bool';
import { ColumnButtonComponent } from '../../button';
import { ColumnDatetimeComponent } from '../../datetime';
import { ColumnNumberComponent } from '../../number';
import { ColumnTextComponent } from '../../text';

@Component({
  selector: 'ballware-dynamic-column',
  templateUrl: './dynamiccolumn.component.html',
  styleUrls: ['./dynamiccolumn.component.scss'],
  imports: [
    CommonModule,
    ColumnLookupComponent,
    ColumnMultiLookupComponent,
    ColumnBoolComponent,
    ColumnButtonComponent,
    ColumnDatetimeComponent,
    ColumnNumberComponent,
    ColumnTextComponent,
    ColumnPopupComponent,
  ],
})
export class DynamicColumnComponent {
  prepared = false;
  preparedColumn: GridLayoutColumn | undefined;

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
  }
}
