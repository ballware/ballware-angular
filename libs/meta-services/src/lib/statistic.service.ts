
import { InjectionToken, OnDestroy } from '@angular/core';
import { CompiledStatistic, QueryParams, StatisticLayout } from '@ballware/meta-model';
import { Observable } from 'rxjs';
import { LookupService } from './lookup.service';

export interface StatisticService extends OnDestroy {

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

export type StatisticServiceFactory = (lookupService: LookupService) => StatisticService;

export const STATISTIC_SERVICE = new InjectionToken<StatisticService>('Meta service');
export const STATISTIC_SERVICE_FACTORY = new InjectionToken<StatisticServiceFactory>('Statistic service factory');