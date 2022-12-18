import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { HasDestroy } from "./hasdestroy";

type Constructor<T> = new(...args: any[]) => T;

export function WithDestroy<T extends Constructor<object>>(Base: T = (class {} as any)) {
    return class extends Base implements OnDestroy, HasDestroy {
        public destroy$  = new Subject<void>()

        ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
        }
    }
}
