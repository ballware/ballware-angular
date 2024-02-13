import { Observable } from "rxjs";

export interface HasReadonly {
  get readonly$(): Observable<boolean>;

  setReadonly(value: boolean): void;
}
