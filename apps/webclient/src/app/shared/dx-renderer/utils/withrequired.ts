import { BehaviorSubject } from "rxjs";
import { EditLayoutItem } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { HasDestroy } from "./hasdestroy";
import { HasRequired } from "./hasrequired";

type Constructor<T> = new(...args: any[]) => T;

export function WithRequired<T extends Constructor<HasDestroy>>(Base: T = (class {} as any)) {
    return class extends Base implements HasRequired {
      public required$ = new BehaviorSubject<boolean>(false);

      public setRequired(value: boolean) {
        this.required$.next(value);
      }

      initRequired(layoutItem: EditLayoutItem, editService: EditService): void {
        this.required$.next(layoutItem.options?.required ?? false);
      }
    }
}
