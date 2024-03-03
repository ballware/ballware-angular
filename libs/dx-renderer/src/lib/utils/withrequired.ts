import { EditLayoutItem } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { BehaviorSubject, takeUntil } from "rxjs";
import { HasDestroy } from "./hasdestroy";
import { HasRequired } from "./hasrequired";
import { HasValidation } from "./hasvalidation";

type Constructor<T> = new(...args: any[]) => T;

export function WithRequired<T extends Constructor<HasValidation & HasDestroy>>(Base: T = (class {} as any)) {
    return class extends Base implements HasRequired {
      public required$ = new BehaviorSubject<boolean>(false);

      public setRequired(value: boolean) {        
        this.required$.next(value);
      }

      initRequired(layoutItem: EditLayoutItem, editService: EditService): void {
        this.required$.next(layoutItem.options?.required ?? false);

        this.required$
          .pipe(takeUntil(this.destroy$))
          .subscribe((required) => this.validateRequired(required));
      }
    }
}
