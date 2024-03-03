import { EditLayoutItem } from "@ballware/meta-model";
import { EditService } from "@ballware/meta-services";
import { BehaviorSubject, Observable, combineLatest, map, takeUntil } from "rxjs";

import { CustomRule, EmailRule, RequiredRule } from "devextreme-angular/common";

import { HasDestroy } from "./hasdestroy";
import { HasValidation, ValidationRule } from "./hasvalidation";

type Constructor<T> = new(...args: any[]) => T;

export function WithValidation<T extends Constructor<HasDestroy>>(Base: T = (class {} as any)) {
    return class extends Base implements HasValidation {
      public requiredValidation$ = new BehaviorSubject<boolean>(false);
      public emailValidation$ = new BehaviorSubject<boolean>(false);

      public validationRules$: Observable<Array<ValidationRule>>|undefined;

      public validateRequired(active: boolean) {
        this.requiredValidation$.next(active);
      }

      public validateEmail(active: boolean) {
        this.emailValidation$.next(active);
      }

      initValidation(layoutItem: EditLayoutItem, editService: EditService): void {
        this.validationRules$ = combineLatest([this.requiredValidation$, this.emailValidation$, editService.editorValidating$])
            .pipe(takeUntil(this.destroy$))
            .pipe(map(([required, email, editorValidating]) => {
                const validationRules = [] as ValidationRule[];

                if (required) {
                    validationRules.push({ type: 'required' } as RequiredRule);
                }

                if (email) {
                    validationRules.push({ type: 'email' } as EmailRule);
                }

                if (layoutItem.options?.dataMember && layoutItem.options?.validations && editorValidating) {
                    layoutItem.options?.validations.forEach(rule => validationRules.push({
                        type: 'custom',
                        message: rule.message,
                        validationCallback: (options) => editorValidating({ dataMember: layoutItem.options?.dataMember as string, ruleIdentifier: rule.identifier, value: options.value })
                    } as CustomRule));
                }

                return validationRules;
            }));
      }
    }
}