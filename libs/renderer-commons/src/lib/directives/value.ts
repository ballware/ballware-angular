import { ValueType } from "@ballware/meta-model";
import { EDIT_SERVICE, EditService } from "@ballware/meta-services";
import { BehaviorSubject, Subject, combineLatest, takeUntil, withLatestFrom } from "rxjs";
import { Directive, inject, OnInit } from "@angular/core";
import { Destroy } from "./destroy";
import { EditItemLivecycle } from "./edititemlivecycle";

@Directive({
  standalone: true
})
class Value<TValue> implements OnInit {

  public dataMember$ = new BehaviorSubject<string|undefined>(undefined);

  public currentValue$ = new BehaviorSubject<TValue|undefined>(undefined);
  public notifyValueChange$ = new Subject<void>();

  public refreshValueTrigger$ = new Subject<void>();

  private destroy: Destroy;
  private livecicle: EditItemLivecycle;
  private editService: EditService;

  constructor(private defaultValue: () => TValue) {
    this.destroy = inject(Destroy);
    this.livecicle = inject(EditItemLivecycle);
    this.editService = inject(EDIT_SERVICE);
  }

  ngOnInit(): void {

    this.livecicle.registerOption('value', () => this.value, (value) => this.setValueWithoutNotification(value as TValue));

    this.livecicle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.dataMember$.next(layoutItem.options?.dataMember);

          this.refreshValueTrigger$
            .pipe(takeUntil(this.destroy.destroy$))
            .subscribe(() => {
              if (layoutItem?.options?.dataMember) {
                this.editService.getValue({ dataMember: layoutItem?.options?.dataMember })
                  .subscribe((value) => {
                    this.currentValue$.next(value as TValue);
                  });
              }
            });

          if (layoutItem?.options?.dataMember) {
            this.editService.getValue({ dataMember: layoutItem?.options?.dataMember })
              .subscribe((value) => {
                this.currentValue$.next(value as TValue);

                if (layoutItem?.options?.dataMember) {
                  this.editService.editorValueChanged({
                    dataMember: layoutItem.options.dataMember,
                    value: this.currentValue$.getValue() as ValueType,
                    notify: true
                  });
                }
              });
          }
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
  constructor() {
    super(() => [] as unknown[]);
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
