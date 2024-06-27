import { Observable } from "rxjs";

export interface HasVisible {
  get visible$(): Observable<boolean>;

  setVisible(value: boolean): void;
}
