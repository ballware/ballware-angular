import { EDIT_SERVICE, EditService, Translator, TRANSLATOR } from "@ballware/meta-services";
import { BehaviorSubject, Observable, combineLatest, map, firstValueFrom } from 'rxjs';

import { AsyncRule, CompareRule, CustomRule, EmailRule, NumericRule, PatternRule, RangeRule, RequiredRule, StringLengthRule } from "devextreme-angular/common";

import { DestroyRef, Directive, Inject, OnInit } from '@angular/core';
import { EditItemLivecycle } from "@ballware/renderer-commons";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    private destroy: DestroyRef,
    private livecycle: EditItemLivecycle,
    @Inject(EDIT_SERVICE) private editService: EditService,
    @Inject(TRANSLATOR) private translator: Translator
  ) {}

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.validationRules$ = combineLatest([this.requiredValidation$, this.emailValidation$, this.editService.editorValidating$])
            .pipe(takeUntilDestroyed(this.destroy))
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
