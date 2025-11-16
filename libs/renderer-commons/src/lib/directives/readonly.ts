import { BehaviorSubject } from "rxjs";
import { EDIT_SERVICE, EditService } from "@ballware/meta-services";
import { DestroyRef, Directive, Inject, OnInit } from '@angular/core';
import { EditItemLivecycle } from "./edititemlivecycle";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true
})
export class Readonly implements OnInit {
  public globalReadonly = false;
  public readonly$ = new BehaviorSubject<boolean>(false);

  public setReadonly(value: boolean): void {
    this.readonly$.next(this.globalReadonly || value);
  }

  constructor(private destroy: DestroyRef, private livecycle: EditItemLivecycle, @Inject(EDIT_SERVICE) private editService: EditService) {}

  ngOnInit(): void {

    this.livecycle.registerOption('readonly', () => this.readonly$.getValue(), (value) => this.setReadonly(value as boolean));

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        this.editService.readonly$.pipe(
          takeUntilDestroyed(this.destroy)
        ).subscribe((readonly) => {
          this.globalReadonly = readonly ?? false;
          this.readonly$.next((layoutItem.options?.readonly || readonly) ?? false);
        });
      }
    });
  }
}
