
import { Injectable, OnDestroy } from '@angular/core';
import { CompiledStatistic, QueryParams, StatisticLayout } from '@ballware/meta-model';
import { Observable } from 'rxjs';

export interface StatisticServiceApi {

  setIdentifier(identifier: string): void;
  setStatistic(identifier: string): void;
  setHeadParams(headParams: QueryParams): void;
  setCustomParam(customParam: Record<string, unknown>|undefined): void;

  statistic$: Observable<string|undefined>;
  customParam$: Observable<Record<string, unknown>|undefined>;
  headParams$: Observable<QueryParams|undefined>;
  metadata$: Observable<CompiledStatistic|undefined>;
  name$: Observable<string|undefined>;
  layout$: Observable<StatisticLayout|undefined>;
  data$: Observable<Array<Record<string, unknown>>|undefined>;

  argumentAxisCustomizeText$: Observable<((value: unknown) => string|undefined)|undefined>;
}

@Injectable()
export abstract class StatisticService implements OnDestroy, StatisticServiceApi {
  public abstract statistic$: Observable<string|undefined>;
  public abstract customParam$: Observable<Record<string, unknown>|undefined>;
  public abstract headParams$: Observable<QueryParams|undefined>;
  public abstract metadata$: Observable<CompiledStatistic|undefined>;
  public abstract name$: Observable<string|undefined>;
  public abstract layout$: Observable<StatisticLayout | undefined>;
  public abstract data$: Observable<Record<string, unknown>[] | undefined>;
  public abstract argumentAxisCustomizeText$: Observable<((value: unknown) => string|undefined) | undefined>;
  
  public abstract ngOnDestroy(): void;
  public abstract setIdentifier(identifier: string): void;
  public abstract setStatistic(identifier: string): void;
  public abstract setHeadParams(headParams: QueryParams): void;
  public abstract setCustomParam(customParam: Record<string, unknown>|undefined): void;
}
