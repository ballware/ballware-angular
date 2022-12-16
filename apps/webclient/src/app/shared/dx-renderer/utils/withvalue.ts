import { BehaviorSubject, combineLatest, Subject, takeUntil } from "rxjs";
import { EditLayoutItem, ValueType } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { HasDestroy } from "./hasdestroy";
import { HasValue } from "./hasvalue";

type Constructor<T> = new(...args: any[]) => T;

export function WithValue<T extends Constructor<HasDestroy>, TValue>(Base: T = (class {} as any), defaultValue: () => TValue) {
    return class extends Base implements HasValue<TValue> {
      public currentValue$ = new BehaviorSubject<TValue|undefined>(undefined);
      public notifyValueChange$ = new Subject<void>();

      initValue(layoutItem: EditLayoutItem, editService: EditService): void {
        editService.getValue$.pipe(takeUntil(this.destroy$))
          .subscribe((getValue) => {
            if (getValue && layoutItem?.options?.dataMember) {
              this.currentValue$.next(getValue(layoutItem?.options?.dataMember) as TValue);

              combineLatest([editService.editorValueChanged$, this.notifyValueChange$]).pipe(takeUntil(this.destroy$))
                .subscribe(([editorValueChanged]) => {
                  if (editorValueChanged && layoutItem?.options?.dataMember) {
                    editorValueChanged(layoutItem.options.dataMember, this.currentValue$.getValue() as ValueType, true);
                  }
                });
            }
          });
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
