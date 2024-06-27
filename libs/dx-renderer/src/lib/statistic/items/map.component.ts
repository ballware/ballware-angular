import { Component, Input } from "@angular/core";
import { StatisticMapOptions } from "@ballware/meta-model";
import { SettingsService, StatisticService } from "@ballware/meta-services";
import { Observable, combineLatest, map } from "rxjs";
import { getByPath } from "../../utils/databinding";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-statistic-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: []
  })
  export class StatisticMapComponent extends WithDestroy() {

    @Input() visible!: boolean|null;

    name$: Observable<string|undefined>;
    height$: Observable<string|undefined>;
    options$: Observable<StatisticMapOptions|undefined>;
    markers$: Observable<Array<object>|undefined>;
    
    public googlekey$: Observable<string|undefined>;

    constructor(private settingsService: SettingsService, private statisticService: StatisticService) {
      super();

      this.googlekey$ = this.settingsService.googlekey$;

      this.name$ = this.statisticService.name$;
      this.height$ = this.statisticService.layout$.pipe(map((layout) => layout?.height ?? '100%'));
      this.options$ = this.statisticService.layout$.pipe(map((layout) => layout?.options as StatisticMapOptions));
      this.markers$ = combineLatest([this.options$, this.statisticService.data$])
        .pipe(map(([options, data]) => (options && data) 
          ? data.map(item => ({
            location: getByPath(item, options.locationField),
            tooltip: getByPath(item, options.tooltipField)
            }))
          : undefined
        ));
    }
  }  