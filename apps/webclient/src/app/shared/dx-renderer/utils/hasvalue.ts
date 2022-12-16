export interface HasValue<TValue> {
  get value(): TValue;
  set value(nextValue: TValue);

  setValueWithoutNotification(value: TValue): void;
}
