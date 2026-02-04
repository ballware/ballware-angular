import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EditItemRef,
} from '@ballware/meta-services';
import {
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  CustomItemCreatingEvent,
  ValueChangedEvent as LookupValueChangedEvent,
} from 'devextreme/ui/select_box';
import {
  LookupDelegate,
} from '../../../utils';
import {
  COLUMN_EDITOR_DELEGATE,
} from '../../../directives';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-lookup',
  templateUrl: './columnlookup.component.html',
  styleUrls: ['./columnlookup.component.scss'],
  imports: [CommonModule, DxSelectBoxModule, DxValidatorModule],
})
export class ColumnLookupComponent implements EditItemRef, OnInit {
  @ViewChild('element', { static: false }) element?: DxSelectBoxComponent;

  readonly destroyRef = inject(DestroyRef);
  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  readonly value$: Observable<unknown> = this.editing.value$;

  readonly valueChanged = (e: LookupValueChangedEvent) =>
    this.editing.valueChanged(this, e.value);
  readonly getOption = (option: string) =>
    this.element?.instance.option(option);
  readonly setOption = (option: string, value: unknown) =>
    this.element?.instance.option(option, value);

  readonly datasource$ = this.editing.lookup$.pipe(
    map((lookup) => lookup?.dataSource)
  );

  readonly displayExpr$ = this.editing.lookup$.pipe(
    map((lookup) => lookup?.displayExpr)
  );

  readonly valueExpr$ = this.editing.lookup$.pipe(
    map((lookup) => lookup?.valueExpr)
  );

  readonly acceptCustomValue$ = this.editing.lookup$.pipe(
    map((lookup) => lookup?.acceptCustomValue)
  );

  private _lookup: LookupDelegate | undefined;

  customItemCreating(event: CustomItemCreatingEvent): void {
    if (!this._lookup) {
      throw new Error('LookupDelegate not initialized');
    }

    this._lookup.onCustomItemCreating(event);
  }

  ngOnInit(): void {
    this.editing.lookup$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lookup) => {
        this._lookup = lookup;
      });
  }
}
