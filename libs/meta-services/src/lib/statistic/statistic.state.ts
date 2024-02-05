import { CompiledStatistic, QueryParams, StatisticLayout } from "@ballware/meta-model";

export interface StatisticState {
  
    identifier?: string;
    statistic?: string;

    headParams?: QueryParams;
    customParam?: Record<string, unknown>;

    statisticMetadata?: CompiledStatistic;

    name?: string;
    layout?: StatisticLayout;
    data?: Array<Record<string, unknown>>;
}