import { ValueType } from "@ballware/meta-model";
import { EDIT_SERVICE } from "@ballware/meta-services";
import { BehaviorSubject, Subject, combineLatest, withLatestFrom } from "rxjs";
import { DestroyRef, Directive, inject, OnInit } from '@angular/core';
import { EditItemLivecycle } from "./edititemlivecycle";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true
})
class Value<TValue> implements OnInit {

  public dataMember$ = new BehaviorSubject<string|undefined>(undefined);

  public currentValue$ = new BehaviorSubject<TValue|undefined>(undefined);
  public notifyValueChange$ = new Subject<void>();

  public refreshValueTrigger$ = new Subject<void>();

  private livecycle = inject(EditItemLivecycle);
  private editService = inject(EDIT_SERVICE);

  private destroy = inject(DestroyRef);

  constructor(private defaultValue: () => TValue) {}

  ngOnInit(): void {

    this.livecycle.registerOption('value', () => this.value, (value) => this.setValueWithoutNotification(value as TValue));

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        this.dataMember$.next(layoutItem.options?.dataMember);

        this.refreshValueTrigger$.pipe(
          takeUntilDestroyed(this.destroy),
          withLatestFrom(this.editService.getValue$)
        ).subscribe(([, getValue]) => {
          if (getValue && layoutItem?.options?.dataMember) {
            this.currentValue$.next(getValue({ dataMember: layoutItem?.options?.dataMember }) as TValue);
          }
        });

        this.editService.getValue$.pipe(
          takeUntilDestroyed(this.destroy)
        ).subscribe((getValue) => {
          if (getValue && layoutItem?.options?.dataMember) {
            this.currentValue$.next(getValue({ dataMember: layoutItem?.options?.dataMember }) as TValue);

            combineLatest([this.editService.editorValueChanged$, this.notifyValueChange$]).pipe(
              takeUntilDestroyed(this.destroy)
            ).subscribe(([editorValueChanged]) => {
              if (editorValueChanged && layoutItem?.options?.dataMember) {
                editorValueChanged({ dataMember: layoutItem.options.dataMember, value: this.currentValue$.getValue() as ValueType, notify: true });
              }
            });
          }
        });
      }
    });
  }

  public refreshValue() {
    this.refreshValueTrigger$.next();
  }

  public get value() {
    return this.currentValue$?.getValue() ?? this.defaultValue();
  }

  public set value(value: TValue) {

    this.currentValue$?.next(value);
    this.notifyValueChange$.next();
  }

  public setValueWithoutNotification(value: TValue) {
    this.currentValue$?.next(value);
  }
}

@Directive({
  standalone: true
})
export class StringValue extends Value<string> {
  constructor() {
    super(() => "");
  }
}

@Directive({
  standalone: true
})
export class NullableStringValue extends Value<string|null> {
  constructor() {
    super(() => null as string|null);
  }
}

@Directive({
  standalone: true
})
export class UnknownArrayValue extends Value<unknown[]> {
  private defaultArrayValue = [] as unknown[];

  constructor() {
    super(() => this.defaultArrayValue);
  }
}

@Directive({
  standalone: true
})
export class BoolValue extends Value<boolean> {
  constructor() {
    super(() => false);
  }
}

@Directive({
  standalone: true
})
export class NullableBoolValue extends Value<boolean|null|undefined> {
  constructor() {
    super(() => false as boolean|null|undefined);
  }
}

@Directive({
  standalone: true
})
export class NumberValue extends Value<number> {
  constructor() {
    super(() => 0.0);
  }
}

@Directive({
  standalone: true
})
export class NullableDateValue extends Value<string|number|Date> {
  constructor() {
    super(() => (null as unknown) as string|number|Date);
  }
}

export interface LatLng {
  lat: number;
  lng: number;
}

@Directive({
  standalone: true
})
export class NullableLatLngValue extends Value<LatLng|null> {
  constructor() {
    super(() => null as LatLng|null);
  }
}
