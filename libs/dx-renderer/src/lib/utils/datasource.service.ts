import { Injectable } from '@angular/core';
import { CrudService, MetaService } from '@ballware/meta-services';
import DataSource from 'devextreme/data/data_source';
import { BehaviorSubject, combineLatest, lastValueFrom, map, takeUntil, withLatestFrom } from "rxjs";
import { createEditableGridDatasource } from './datasource';
import { WithDestroy } from './withdestroy';

@Injectable()
export class DataSourceService extends WithDestroy() {

    public dataSource$ = new BehaviorSubject<DataSource|undefined>(undefined);

    constructor(private metaService: MetaService, private crudService: CrudService) {
        super();

        combineLatest([this.crudService.queryIdentifier$, this.metaService.query$, this.metaService.editFunction$, this.metaService.headParams$])
            .pipe(takeUntil(this.destroy$))
            .pipe(map(([queryIdentifier, query, editFunction, headParams]) => (queryIdentifier && query && headParams)
                ? createEditableGridDatasource(() => lastValueFrom(query(queryIdentifier, headParams)), (item) => {
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