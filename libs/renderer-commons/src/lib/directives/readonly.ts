import { BehaviorSubject, takeUntil } from "rxjs";
import { EDIT_SERVICE, EditService } from "@ballware/meta-services";
import { Directive, Inject, OnInit } from "@angular/core";
import { Destroy } from "./destroy";
import { EditItemLivecycle } from "./edititemlivecycle";

@Directive({
  standalone: true
})
export class Readonly implements OnInit {
  public globalReadonly = false;
  public readonly$ = new BehaviorSubject<boolean>(false);

  public setReadonly(value: boolean): void {
    this.readonly$.next(this.globalReadonly || value);
  }

  constructor(private destroy: Destroy, private livecycle: EditItemLivecycle, @Inject(EDIT_SERVICE) private editService: EditService) {}

  ngOnInit(): void {

    this.livecycle.registerOption('readonly', () => this.readonly$.getValue(), (value) => this.setReadonly(value as boolean));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.editService.readonly$
            .pipe(takeUntil(this.destroy.destroy$))
            .subscribe((readonly) => {
              this.globalReadonly = readonly ?? false;
              this.readonly$.next((layoutItem.options?.readonly || readonly) ?? false);
            });
        }
      });
  }
}