import { EditLayoutItem, ValueType } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { BehaviorSubject, Subject, combineLatest, takeUntil, withLatestFrom } from "rxjs";
import { HasDestroy } from "./hasdestroy";
import { HasValue } from "./hasvalue";

type Constructor<T> = new(...args: any[]) => T;

export function WithValue<T extends Constructor<HasDestroy>, TValue>(Base: T = (class {} as any), defaultValue: () => TValue) {
    return class extends Base implements HasValue<TValue> {
      public currentValue$ = new BehaviorSubject<TValue|undefined>(undefined);
      public notifyValueChange$ = new Subject<void>();

      public refreshValueTrigger$ = new Subject<void>();
     

      initValue(layoutItem: EditLayoutItem, editService: EditService): void {

        this.refreshValueTrigger$
          .pipe(takeUntil(this.destroy$))
          .pipe(withLatestFrom(editService.getValue$))
          .subscribe(([, getValue]) => {
            if (getValue && layoutItem?.options?.dataMember) {
              this.currentValue$.next(getValue({ dataMember: layoutItem?.options?.dataMember }) as TValue);
            }
          });

        editService.getValue$.pipe(takeUntil(this.destroy$))
          .subscribe((getValue) => {
            if (getValue && layoutItem?.options?.dataMember) {
              this.currentValue$.next(getValue({ dataMember: layoutItem?.options?.dataMember }) as TValue);

              combineLatest([editService.editorValueChanged$, this.notifyValueChange$]).pipe(takeUntil(this.destroy$))
                .subscribe(([editorValueChanged]) => {
                  if (editorValueChanged && layoutItem?.options?.dataMember) {
                    editorValueChanged({ dataMember: layoutItem.options.dataMember, value: this.currentValue$.getValue() as ValueType, notify: true });
                  }
                });
            }
          });
      }

      public refreshValue() {
        this.refreshValueTrigger$.next();
      }

      public get value() {
        return this.currentValue$?.getValue() ?? defaultValue();
      }

      public set value(value: TValue) {

        this.currentValue$?.next(value);
        this.notifyValueChange$.next();
      }

      public setValueWithoutNotification(value: TValue) {
        this.currentValue$?.next(value);
      }
    }
}
