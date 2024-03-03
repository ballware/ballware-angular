import { AsyncRule, CompareRule, CustomRule, EmailRule, NumericRule, PatternRule, RangeRule, RequiredRule, StringLengthRule } from "devextreme-angular/common";
import { Observable } from "rxjs";

export type ValidationRule = RequiredRule | NumericRule | RangeRule | StringLengthRule | CustomRule | CompareRule | PatternRule | EmailRule | AsyncRule;

export interface HasValidation {
  get validationRules$(): Observable<Array<ValidationRule>>|undefined;

  validateRequired(active: boolean): void;
  validateEmail(active: boolean): void;
}
