import { Component, Inject, Input } from "@angular/core";
import { StatisticPivotOptions } from "@ballware/meta-model";
import { STATISTIC_SERVICE, StatisticService } from "@ballware/meta-services";
import { exportPivotGrid } from 'devextreme/excel_exporter';
import { ExportingEvent } from "devextreme/ui/pivot_grid";
import PivotGridDataSource from "devextreme/ui/pivot_grid/data_source";
import { Workbook } from "exceljs";
import saveAs from 'file-saver';
import moment from "moment";
import { Observable, combineLatest, map, takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-statistic-pivotgrid',
    templateUrl: './pivotgrid.component.html',
    styleUrls: ['./pivotgrid.component.scss'],
    providers: []
  })
  export class StatisticPivotgridComponent extends WithDestroy() {

    @Input() visible!: boolean|null;

    name$: Observable<string|undefined>;
    height$: Observable<string|undefined>;
    options$: Observable<StatisticPivotOptions|undefined>;
    exportFilename$: Observable<string|undefined>;
    data$: Observable<Record<string, unknown>[]|undefined>;
    dataSource$: Observable<PivotGridDataSource|undefined>;

    name: string|undefined;

    constructor(@Inject(STATISTIC_SERVICE) private statisticService: StatisticService) {
      super();

      this.name$ = this.statisticService.name$;
      this.height$ = this.statisticService.layout$.pipe(map((layout) => layout?.height ?? '100%'));
      this.exportFilename$ = this.name$.pipe(map((name) => `${name}_${moment().format('YYYYMMDD')}`));
      this.options$ = this.statisticService.layout$.pipe(map((layout) => layout?.options as StatisticPivotOptions));
      this.data$ = this.statisticService.data$;      
      this.dataSource$ = combineLatest([this.options$, this.data$])
        .pipe(map(([options, data]) => (options && data)
          ? new PivotGridDataSource({
              retrieveFields: false,
              fields: options.fields.map(f => ({
                caption: f.caption,
                dataField: f.dataField,
                dataType: f.dataType,
                groupInterval: f.groupInterval,
                area: f.area,
                expanded: f.expanded,
                showTotals: f.showTotals,
                showGrandTotals: f.showGrandTotals,
                summaryType: f.summaryType,
                format: f.format
                  ? { type: f.format, precision: f.precision }
                  : undefined,
                width: f.width,
              })),
              store: data
            })
          : undefined ));

      this.statisticService.name$
        .pipe(takeUntil(this.destroy$))
        .subscribe((name) => {
          this.name = name; 
        });
    }

    onExporting(e: ExportingEvent) {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet(this.name)

      exportPivotGrid({
        component: e.component,
        worksheet
      }).then(() => {
        workbook.xlsx.writeBuffer().then(buffer => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${this.name}_${moment().format('YYYYMMDD')}.xlsx`);
        })
      });

      e.cancel = true;  
    }
  }  

