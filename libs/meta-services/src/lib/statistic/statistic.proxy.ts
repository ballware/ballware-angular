import { Injectable, OnDestroy } from "@angular/core";
import { StatisticService } from "../statistic.service";
import { StatisticStore } from "./statistic.store";

@Injectable()
export class StatisticServiceProxy extends StatisticService implements OnDestroy {
    
    constructor(private statisticStore: StatisticStore) {
        super();
    }

    ngOnDestroy(): void {
        this.statisticStore.ngOnDestroy();
    }

    public override setIdentifier = this.statisticStore.setIdentifier;

    public override statistic$ = this.statisticStore.statistic$;
    public override customParam$ = this.statisticStore.customParam$;
    public override headParams$ = this.statisticStore.headParams$;
    public override metadata$ = this.statisticStore.metadata$;
    public override name$ = this.statisticStore.name$;
    public override layout$ = this.statisticStore.layout$;
    public override data$ = this.statisticStore.data$;
    public override argumentAxisCustomizeText$ = this.statisticStore.argumentAxisCustomizeText$;
    public override setStatistic = this.statisticStore.setStatistic;
    public override setHeadParams = this.statisticStore.setHeadParams;
    public override setCustomParam = this.statisticStore.setCustomParam;
}