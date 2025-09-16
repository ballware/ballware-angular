import { EDIT_SERVICE, EditService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { BehaviorSubject, Observable, combineLatest, map, takeUntil, firstValueFrom } from 'rxjs';

import { AsyncRule, CompareRule, CustomRule, EmailRule, NumericRule, PatternRule, RangeRule, RequiredRule, StringLengthRule } from "devextreme-angular/common";

import { Directive, Inject, OnInit } from "@angular/core";
import { Destroy, EditItemLivecycle } from "@ballware/renderer-commons";

export type ValidationRule = RequiredRule | NumericRule | RangeRule | StringLengthRule | CustomRule | CompareRule | PatternRule | EmailRule | AsyncRule;

@Directive({
  standalone: true
})
export class Validation implements OnInit {

  public requiredValidation$ = new BehaviorSubject<boolean>(false);
  public emailValidation$ = new BehaviorSubject<boolean>(false);

  public validationRules$: Observable<Array<ValidationRule>>|undefined;

  public validateRequired(active: boolean) {
    this.requiredValidation$.next(active);
  }

  public validateEmail(active: boolean) {
    this.emailValidation$.next(active);
  }

  constructor(
    private destroy: Destroy,
    private livecycle: EditItemLivecycle,
    @Inject(EDIT_SERVICE) private editService: EditService,
    @Inject(TRANSLATOR) private translator: Translator
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.validationRules$ = combineLatest([this.requiredValidation$, this.emailValidation$, this.editService.editorValidating$])
            .pipe(takeUntil(this.destroy.destroy$))
            .pipe(map(([required, email, editorValidating]) => {
                const validationRules = [] as ValidationRule[];

                if (required) {
                    validationRules.push({
                      type: 'required',
                      message: this.translator('validation.messages.required', { label: layoutItem.options?.caption })
                    } as RequiredRule);
                }

                if (email) {
                    validationRules.push({ type: 'email' } as EmailRule);
                }

                if (layoutItem.options?.dataMember && layoutItem.options?.validations && editorValidating) {
                    layoutItem.options?.validations.forEach(rule => validationRules.push({
                        type: 'async',
                        message: rule.message,
                        validationCallback: async (options) => await firstValueFrom(editorValidating({ dataMember: layoutItem.options?.dataMember as string, ruleIdentifier: rule.identifier, value: options.value }))
                    } as AsyncRule));
                }

                return validationRules;
            }));
        }
      });
  }
}
