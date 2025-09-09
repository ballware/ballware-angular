import {
  CrudOperator,
  CrudService, DetailColumnEditOperation, ImportOperation, ItemEditOperation, ItemRemoveOperation
} from '@ballware/meta-services';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

export interface CrudOverlayOperator {
  editOperationOverlay$: Observable<ItemEditOperation|undefined>;
  removeOperationOverlay$: Observable<ItemRemoveOperation|undefined>;
  importOperationOverlay$: Observable<ImportOperation|undefined>;

  detailColumnEditOperationOverlay$: Observable<DetailColumnEditOperation|undefined>;
}

export class CrudOverlayOperatorService implements CrudOperator, CrudOverlayOperator, OnDestroy {

  private readonly destroy$  = new Subject<void>();

  readonly kind = 'overlay';

  readonly editOperationOverlay$: Observable<ItemEditOperation|undefined>;
  readonly removeOperationOverlay$: Observable<ItemRemoveOperation|undefined>;
  readonly importOperationOverlay$: Observable<ImportOperation|undefined>;

  readonly detailColumnEditOperationOverlay$: Observable<DetailColumnEditOperation|undefined>;

  constructor(private readonly router: Router, private readonly crudService: CrudService) {
    console.log('CrudOverlayOperatorService', 'constructor');

    this.editOperationOverlay$ = this.crudService.editOperation$;
    this.removeOperationOverlay$ = this.crudService.removeOperation$;
    this.importOperationOverlay$ = this.crudService.importOperation$;

    this.detailColumnEditOperationOverlay$ = this.crudService.detailColumnEditOperation$;
  }

  readonly ngOnDestroy = ()=> {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
