import { BehaviorSubject, takeUntil } from "rxjs";
import { EditLayoutItem } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { HasDestroy } from "./hasdestroy";
import { HasReadonly } from "./hasreadonly";
import { HasEditItemLifecycle } from "./hasedititemlifecycle";

type Constructor<T> = new(...args: any[]) => T;

export function WithReadonly<T extends Constructor<HasDestroy & HasEditItemLifecycle>>(Base: T = (class {} as any)) {
    return class extends Base implements HasReadonly {
      public globalReadonly = false;
      public readonly$ = new BehaviorSubject<boolean>(false);

      public setReadonly(value: boolean): void {
        this.readonly$.next(this.globalReadonly || value);
      }

      initReadonly(layoutItem: EditLayoutItem, editService: EditService): void {

        this.registerOption('readonly', () => this.readonly$.getValue(), (value) => this.setReadonly(value as boolean));

        editService.readonly$.pipe(takeUntil(this.destroy$))
          .subscribe((readonly) => {
            this.globalReadonly = readonly ?? false;
            this.readonly$.next((layoutItem.options?.readonly || readonly) ?? false);
          });
      }
    }
}
