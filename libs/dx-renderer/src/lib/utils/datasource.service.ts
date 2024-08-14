import { Inject, Injectable } from '@angular/core';
import { ApiError } from '@ballware/meta-api';
import { CrudService, MetaService, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import DataSource from 'devextreme/data/data_source';
import { BehaviorSubject, catchError, combineLatest, lastValueFrom, map, of, takeUntil, withLatestFrom } from "rxjs";
import { createEditableGridDatasource } from './datasource';
import { WithDestroy } from './withdestroy';

@Injectable()
export class DataSourceService extends WithDestroy() {

    public dataSource$ = new BehaviorSubject<DataSource|undefined>(undefined);

    constructor(@Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService, private metaService: MetaService, private crudService: CrudService) {
        super();

        combineLatest([this.crudService.queryIdentifier$, this.metaService.query$, this.metaService.editFunction$, this.metaService.headParams$])
            .pipe(takeUntil(this.destroy$))
            .pipe(map(([queryIdentifier, query, editFunction, headParams]) => (queryIdentifier && query && headParams)
                ? createEditableGridDatasource(() => lastValueFrom(query(queryIdentifier, headParams)
                    .pipe(catchError((error: ApiError) => {
                        this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                        
                        return of([]);              
                    }))
                ), (item) => {
                    if (editFunction) {
                      this.crudService.save({ customFunction: editFunction, item });
                    }        

                    return Promise.resolve(item);
                  })
                : undefined))
            .subscribe((dataSource) => this.dataSource$.next(dataSource));

        this.crudService.reload$
            .pipe(takeUntil(this.destroy$))
            .pipe(withLatestFrom(this.dataSource$))
            .subscribe(([, dataSource]) => {
                dataSource?.reload();                
            });
    }
}