import { EditLayoutItem } from "@ballware/meta-model";
import { BehaviorSubject } from "rxjs";
import { HasVisible } from "./hasvisible";

type Constructor<T> = new(...args: any[]) => T;

export function WithVisible<T extends Constructor<object>>(Base: T = (class {} as any)) {
    return class extends Base implements HasVisible {
      public visible$ = new BehaviorSubject<boolean>(true);

      public setVisible(value: boolean) {        
        this.visible$.next(value);
      }

      initVisible(layoutItem: EditLayoutItem): void {
        this.visible$.next(layoutItem.options?.visible ?? true);
      }
    }
}
