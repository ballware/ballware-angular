import { HttpClient } from "@angular/common/http";
import { OnDestroy } from "@angular/core";
import { MetaApiService } from "@ballware/meta-api";
import { CompiledStatistic, QueryParams, StatisticLayout } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import { combineLatest, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from "rxjs";
import { statisticDestroyed, statisticUpdated } from "../component";
import { IdentityService, LookupService, StatisticService } from "@ballware/meta-services";
import { createUtil } from "../implementation/createscriptutil";
import { StatisticState } from "./statistic.state";

export class StatisticStore extends ComponentStore<StatisticState> implements StatisticService, OnDestroy {
    
    constructor(private store: Store, private httpClient: HttpClient, private metaApiService: MetaApiService, private identityService: IdentityService, private lookupService: LookupService) {
        super({});

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {                
                if (state.identifier) {
                    this.store.dispatch(statisticUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Statistic state update');
                    console.debug(state);    
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(statisticDestroyed({ identifier: state.identifier }));
                }
            });

        this.effect(_ => this.statistic$            
            .pipe(switchMap((statistic) => (statistic) 
                ? this.metaApiService.metaStatisticApi.metadataForStatistic(statistic)
                : of(undefined)))
            .pipe(tap((statisticMetadata) => {                
                this.updater((state, statisticMetadata: CompiledStatistic|undefined) => ({
                    ...state,
                    statisticMetadata,                        
                }))(statisticMetadata);                
            }))
        );

        this.effect(_ => combineLatest([this.metadata$, this.customParam$, this.headParams$, this.identityService.accessToken$, this.lookupService.lookups$])
            .pipe(switchMap(([metadata, customParam, headParams, accessToken, lookups]) => 
                combineLatest([of(metadata), of(customParam), of(accessToken), of(headParams), of(lookups), (metadata && customParam && headParams && accessToken && lookups) 
                    ? this.metaApiService.metaStatisticApi.dataForStatistic(metadata.identifier, headParams)
                    : of(undefined)])                                                
            ))
            .pipe(tap(([metadata, customParam, accessToken, headParams, lookups, data]) => {
                if (metadata && metadata.layout && customParam && accessToken && headParams && lookups && data) {

                    const updater = this.updater((state, updates: { name: string, layout: StatisticLayout|undefined, data: Record<string, unknown>[] }) => ({
                        ...state,
                        name: updates.name,
                        layout: updates.layout,
                        data: updates.data
                    }));

                    metadata.mappingScript(data, cloneDeep(metadata.layout), customParam, headParams, lookups, createUtil(this.httpClient, accessToken), (layout, data) => updater({ name: layout?.title ?? metadata.name, layout, data }));
                }
            }))
        );
    }

    readonly metadata$ = this.select(state => state.statisticMetadata);
    readonly statistic$ = this.select(state => state.statistic);
    readonly customParam$ = this.select(state => state.customParam);
    readonly headParams$ = this.select(state => state.headParams);
    readonly name$ = this.select(state => state.name);
    readonly layout$ = this.select(state => state.layout);
    readonly data$ = this.select(state => state.data);
    
    readonly argumentAxisCustomizeText$ = combineLatest([this.metadata$, this.layout$, this.customParam$, this.headParams$, this.identityService.accessToken$])
        .pipe(map(([metadata, layout, customParam, headParams, accessToken]) => (metadata && layout && customParam && headParams && accessToken) 
            ? (value: unknown) => metadata.customScripts.argumentAxisCustomizeText(layout, value, headParams, customParam, createUtil(this.httpClient, accessToken))    
            : undefined));

    readonly setStatistic = this.updater((state, statistic: string) => ({
        ...state,
        statistic
    }));

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));

    readonly setHeadParams = 
        this.updater((state, headParams: QueryParams) => ({
            ...state,
            headParams
        }));

    readonly setCustomParam = 
        this.updater((state, customParam: Record<string, unknown>|undefined) => ({
            ...state,
            customParam
        })); 
}