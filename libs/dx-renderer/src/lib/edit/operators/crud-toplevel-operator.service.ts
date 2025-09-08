import {
  CrudOperator,
  CrudService, DetailColumnEditOperation,
  ImportOperation,
  ItemEditOperation,
  ItemRemoveOperation
} from '@ballware/meta-services';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { CrudOverlayOperator } from './crud-overlay-operator.service';

export class CrudTopLevelOperatorService implements CrudOperator, CrudOverlayOperator, OnDestroy {

  private readonly destroy$  = new Subject<void>();

  readonly kind = 'overlay';

  readonly editOperationOverlay$ = new BehaviorSubject<ItemEditOperation|undefined>(undefined);
  readonly removeOperationOverlay$: Observable<ItemRemoveOperation|undefined>;
  readonly importOperationOverlay$: Observable<ImportOperation|undefined>;

  readonly detailColumnEditOperationOverlay$: Observable<DetailColumnEditOperation|undefined>;

  constructor(private readonly router: Router, private crudService: CrudService) {
    console.log('CrudTopLevelOperatorService', 'constructor');

    this.removeOperationOverlay$ = this.crudService.removeOperation$;
    this.importOperationOverlay$ = this.crudService.importOperation$;
    this.detailColumnEditOperationOverlay$ = this.crudService.detailColumnEditOperation$;

    this.crudService.editOperation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(op => {
        if (op && !op.customFunction && op.editLayout && op.editLayout.fullscreen) {
          console.log('CrudTopLevelOperatorService', 'navigate', op);
        } else {
          this.editOperationOverlay$.next(op);
        }
      });
  }

  readonly ngOnDestroy = ()=> {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
