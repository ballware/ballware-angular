import { BehaviorSubject } from "rxjs";
import { DestroyRef, Directive, OnInit } from '@angular/core';
import { EditItemLivecycle } from "./edititemlivecycle";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true
})
export class Visible implements OnInit {

  public visible$ = new BehaviorSubject<boolean>(true);

  public setVisible(value: boolean) {
    this.visible$.next(value);
  }

  constructor(private destroy: DestroyRef, private livecycle: EditItemLivecycle) {}

  ngOnInit(): void {

    this.livecycle.registerOption('visible', () => this.visible$.getValue(), (value) => this.setVisible(value as boolean));

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        this.visible$.next(layoutItem.options?.visible ?? true);
      }
    });
  }
}
