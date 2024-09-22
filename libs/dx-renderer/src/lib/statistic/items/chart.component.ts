import { Component, Inject, Input } from "@angular/core";
import { StatisticChartOptions } from "@ballware/meta-model";
import { STATISTIC_SERVICE, StatisticService } from "@ballware/meta-services";
import { LegendClickEvent } from "devextreme/viz/chart";
import moment from "moment";
import { Observable, map } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { DxChartModule } from "devextreme-angular";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ballware-statistic-chart',
    templateUrl: './chart.component.html',
    styleUrls: [],
    providers: [],
    imports: [CommonModule, DxChartModule],
    standalone: true
  })
  export class StatisticChartComponent extends WithDestroy() {

    @Input() visible!: boolean|null;

    name$: Observable<string|undefined>;
    height$: Observable<string|undefined>;
    exportFilename$: Observable<string|undefined>;
    options$: Observable<StatisticChartOptions|undefined>;
    data$: Observable<Record<string, unknown>[]|undefined>;
    series$: Observable<Array<object>|undefined>;
    visualRange$: Observable<number[]|undefined>;
    argumentAxisCustomizeText$: Observable<((arg: { value: number }) => string|number)|undefined>;
    argumentAxisConstantLines$: Observable<any[]|undefined>;
    valueAxisConstantLines$: Observable<any[]|undefined>;

    constructor(@Inject(STATISTIC_SERVICE) private statisticService: StatisticService) {
      super();

      this.name$ = this.statisticService.name$;
      this.height$ = this.statisticService.layout$.pipe(map((layout) => layout?.height ?? '100%'));
      this.exportFilename$ = this.name$.pipe(map((name) => `${name}_${moment().format('YYYYMMDD')}`));
      this.options$ = this.statisticService.layout$.pipe(map((layout) => layout?.options as StatisticChartOptions));
      this.data$ = this.statisticService.data$;

      this.visualRange$ = this.options$.pipe(map((options) => options?.argumentAxis?.visualRangeTo ? [
        options.argumentAxis.visualRangeFrom ?? 0,
        options.argumentAxis.visualRangeTo
      ] : undefined));

      this.series$ = this.options$.pipe(map((options) => options?.series.map(s => ({
        type: s.type,
        visible: s.visible ?? true,
        name: s.name,
        valueField: s.valueField,
        label: { visible: s.labelVisible, format: { type: s.format, precision: s.precision } }
      }))));

      this.argumentAxisCustomizeText$ = this.statisticService.argumentAxisCustomizeText$.pipe(map((customizeText) => customizeText 
        ? (arg: { value: number }) => customizeText(arg.value) ?? arg.value 
        : (arg: { value: number }) => arg.value.toString())
      );

      this.argumentAxisConstantLines$ = this.options$.pipe(map((options) => options?.argumentAxis?.lines?.map(line => ({
        value: line.value,
        color: line.color,
        dashStyle: line.dashStyle,
        label: line.labelText ? { text: line.labelText } : {}
      }))));

      this.valueAxisConstantLines$ = this.options$.pipe(map((options) => options?.valueAxis?.lines?.map(line => ({
        value: line.value,
        color: line.color,
        dashStyle: line.dashStyle,
        label: line.labelText ? { text: line.labelText } : {}
      }))));
    }

    onLegendClick(e: LegendClickEvent) {
      if (e.target) {
        if (e.target.isVisible()) {
          e.target.hide();
        } else {
          e.target.show();
        }
      }
    }
    
  }  