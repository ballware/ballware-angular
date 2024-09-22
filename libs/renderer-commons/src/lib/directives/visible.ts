import { BehaviorSubject, takeUntil } from "rxjs";
import { Directive, OnInit } from "@angular/core";
import { Destroy } from "./destroy";
import { EditItemLivecycle } from "./edititemlivecycle";

@Directive({
  standalone: true
})
export class Visible implements OnInit {
  
  public visible$ = new BehaviorSubject<boolean>(true);

  public setVisible(value: boolean) {        
    this.visible$.next(value);
  }

  constructor(private destroy: Destroy, private livecycle: EditItemLivecycle) {}

  ngOnInit(): void {

    this.livecycle.registerOption('visible', () => this.visible$.getValue(), (value) => this.setVisible(value as boolean));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.visible$.next(layoutItem.options?.visible ?? true);
        }
      });
  }
}