import { Observable } from "rxjs";

export interface HasRequired {
  get required$(): Observable<boolean>;

  setRequired(value: boolean): void;
}
