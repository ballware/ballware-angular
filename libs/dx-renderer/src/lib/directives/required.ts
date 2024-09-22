import { BehaviorSubject, takeUntil } from "rxjs";
import { Destroy, EditItemLivecycle } from "@ballware/renderer-commons";
import { Directive, OnInit } from "@angular/core";
import { Validation } from "./validation";

@Directive({
  standalone: true
})
export class Required implements OnInit {
  
  public required$ = new BehaviorSubject<boolean>(false);

  public setRequired(value: boolean): void {
    this.required$.next(value);
  }

  constructor(private destroy: Destroy, private livecycle: EditItemLivecycle, private validation: Validation) {}

  ngOnInit(): void {
    
    this.livecycle.registerOption('required', () => this.required$.getValue(), (value) => this.setRequired(value as boolean));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.required$.next(layoutItem.options?.required ?? false);

          this.required$
            .pipe(takeUntil(this.destroy.destroy$))
            .subscribe((required) => this.validation.validateRequired(required));
        }
      });
  }
}