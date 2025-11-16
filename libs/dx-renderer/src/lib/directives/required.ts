import { BehaviorSubject } from "rxjs";
import { EditItemLivecycle } from "@ballware/renderer-commons";
import { DestroyRef, Directive, OnInit } from '@angular/core';
import { Validation } from "./validation";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true
})
export class Required implements OnInit {

  public required$ = new BehaviorSubject<boolean>(false);

  public setRequired(value: boolean): void {
    this.required$.next(value);
  }

  constructor(private destroy: DestroyRef, private livecycle: EditItemLivecycle, private validation: Validation) {}

  ngOnInit(): void {

    this.livecycle.registerOption('required', () => this.required$.getValue(), (value) => this.setRequired(value as boolean));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.required$.next(layoutItem.options?.required ?? false);

          this.required$
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe((required) => this.validation.validateRequired(required));
        }
      });
  }
}
