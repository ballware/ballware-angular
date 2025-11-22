import { ApiError } from "@ballware/meta-api";
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupService, NOTIFICATION_SERVICE, NotificationService } from "@ballware/meta-services";
import { combineLatest } from "rxjs";
import {
  createLookupDelegateBuilder, LookupDelegate
} from '../utils';
import { EditItemLivecycle } from "@ballware/renderer-commons";
import { DestroyRef, Directive, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UnsupportedOperationException } from '@zxing/library';

@Directive({
  standalone: true
})
export class Lookup implements OnInit, LookupDelegate {

  private delegate!: LookupDelegate;

  public getLookupItemKeyValue(item: Record<string, unknown>) {
    return this.delegate.getLookupItemKeyValue(item);
  }

  public getLookupItemDisplayValue(item: Record<string, unknown>) {
    return this.delegate.getLookupItemDisplayValue(item);
  }

  public getLookupItemHintValue(item: Record<string, unknown>) {
    return this.delegate.getLookupItemHintValue(item);
  }


  public onCustomItemCreating(event: any) {
    this.delegate.onCustomItemCreating(event);
  }

  public get hasLookupItemHint$() {
    return this.delegate.hasLookupItemHint$;
  }

  public get dataSource$() {
    return this.delegate.dataSource$;
  }

  public get displayExpr$() {
    return this.delegate.displayExpr$;
  }

  public get valueExpr$() {
    return this.delegate.valueExpr$;
  }

  public get acceptCustomValue$() {
    return this.delegate.acceptCustomValue$;
  }

  public get grouped$() {
    return this.delegate.grouped$;
  }

  public get dataSource() {
    return this.delegate.dataSource;
  }

  public get displayExpr() {
    return this.delegate.displayExpr;
  }

  public get valueExpr() {
    return this.delegate.valueExpr;
  }

  public setLookupItems(items: Array<any>) {
    this.delegate.setLookupItems(items);
  }

  public get acceptCustomValue() {
    return this.delegate.acceptCustomValue;
  }

  public setAcceptCustomValue(accept: boolean) {
    this.delegate.setAcceptCustomValue(accept);
  }

  constructor(
    private readonly destroy: DestroyRef,
    private readonly livecycle: EditItemLivecycle,
    @Inject(EDIT_SERVICE) private readonly editService: EditService,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(NOTIFICATION_SERVICE) private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {

    this.livecycle.registerOption('acceptCustomValue', () => this.acceptCustomValue, (value) => this.setAcceptCustomValue(value as boolean));
    this.livecycle.registerOption('items', () => { throw new UnsupportedOperationException("Get items of lookup not supported") }, (value) => this.setLookupItems(value  as []));

    this.livecycle.preparedLayoutItem$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          combineLatest([this.editService.getValue$, this.lookupService.lookups$])
              .pipe(takeUntilDestroyed(this.destroy))
              .subscribe(([getValue, lookups]) => {
                if (getValue && lookups) {
                  let lookupBuilder = createLookupDelegateBuilder(lookups)

                  if (layoutItem?.options?.items) {
                    lookupBuilder.forStaticItems(layoutItem.options.items);
                  } else if (layoutItem?.options?.itemsMember) {
                    lookupBuilder.forItemsFromMember(layoutItem.options.itemsMember, (member) => getValue({ dataMember: member }) as Array<Record<string, unknown>>);
                  } else if (layoutItem?.options?.lookup) {
                    lookupBuilder.forIdentifier(layoutItem.options.lookup);
                  }

                  lookupBuilder.withApiErrorHandler((error: ApiError) => {
                    this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                  });

                  if (layoutItem?.options?.displayExpr) {
                    lookupBuilder.withDisplayExpr(layoutItem.options.displayExpr);
                  }

                  if (layoutItem?.options?.valueExpr) {
                    lookupBuilder.withValueExpr(layoutItem.options.valueExpr);
                  }

                  if (layoutItem?.options?.hintExpr) {
                    lookupBuilder.withHintExpr(layoutItem.options.hintExpr);
                  }

                  if (layoutItem?.options?.acceptCustomValue) {
                    lookupBuilder.withAcceptCustomValue(layoutItem.options.acceptCustomValue);
                  }

                  if (layoutItem?.options?.lookupParam) {
                    lookupBuilder.withParamFromMember(layoutItem.options.lookupParam, (member) => getValue({ dataMember: member }) as string|string[]);
                  }

                  if (layoutItem?.options?.lookupGroupBy) {
                    lookupBuilder.withGroupBy(layoutItem.options.lookupGroupBy);
                  }

                  this.delegate = lookupBuilder.build();
                }
              });
        }
      });
  }
}
