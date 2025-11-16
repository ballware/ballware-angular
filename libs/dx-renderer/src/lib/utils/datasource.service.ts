import { DestroyRef, inject, Inject, Injectable } from '@angular/core';
import { ApiError } from '@ballware/meta-api';
import { CRUD_SERVICE, CrudService, META_SERVICE, MetaService, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import DataSource from 'devextreme/data/data_source';
import { BehaviorSubject, catchError, combineLatest, lastValueFrom, map, of, withLatestFrom } from "rxjs";
import { createEditableGridDatasource } from './datasource';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class DataSourceService {

    public dataSource$ = new BehaviorSubject<DataSource|undefined>(undefined);

    private destroy = inject(DestroyRef);

    constructor(
        @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService,
        @Inject(META_SERVICE) private metaService: MetaService,
        @Inject(CRUD_SERVICE) private crudService: CrudService) {

        combineLatest([
          this.crudService.queryIdentifier$,
          this.metaService.query$,
          this.metaService.editFunction$,
          this.metaService.headParams$]).pipe(
            takeUntilDestroyed(this.destroy),
            map(([queryIdentifier, query, editFunction, headParams]) => (queryIdentifier && query && headParams)
              ? createEditableGridDatasource(() => lastValueFrom(query(queryIdentifier, headParams)
                  .pipe(catchError((error: ApiError) => {
                      this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                      return of([]);
                  }))
              ), (item) => {
                  if (editFunction) {
                    this.crudService.save({ customFunction: editFunction, item, continueAfterSave: false });
                  }

                  return Promise.resolve(item);
                })
              : undefined)
        ).subscribe((dataSource) => this.dataSource$.next(dataSource));

        this.crudService.reload$.pipe(
          takeUntilDestroyed(this.destroy),
          withLatestFrom(this.dataSource$)
        ).subscribe(([, dataSource]) => {
            dataSource?.reload();
        });
    }
}
