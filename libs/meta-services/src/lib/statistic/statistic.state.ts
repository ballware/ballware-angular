import { CompiledStatistic, QueryParams, StatisticLayout } from "@ballware/meta-model";

export interface StatisticState {
  
    identifier?: string;
    statistic?: string;

    headParams?: QueryParams;
    customParam?: Record<string, unknown>;

    statisticMetadata?: CompiledStatistic;

    layout?: StatisticLayout;
    data?: Array<Record<string, unknown>>;
}