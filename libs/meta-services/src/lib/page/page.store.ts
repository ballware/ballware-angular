import { Injectable } from "@angular/core";
import { PageServiceApi } from "../page.service";
import { PageState } from "./page.state";
import { ComponentStore } from "@ngrx/component-store";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { LookupRequest, LookupService } from "../lookup.service";
import { MetaApiService } from "@ballware/meta-api";
import { Observable, map, of, switchMap, withLatestFrom, tap, combineLatest, distinctUntilChanged } from "rxjs";
import * as qs from "qs";
import { TenantService } from "../tenant.service";
import { EditUtil, QueryParams, ScriptActions, ValueType } from "@ballware/meta-model";
import { ToolbarItemRef } from "../toolbaritemref";
import { createUtil } from "../implementation/createscriptutil";
import { isEqual } from "lodash";

@Injectable()
export class PageStore extends ComponentStore<PageState> implements PageServiceApi {
    
    private scriptActions: ScriptActions;

    private toolbarItems: Record<string, ToolbarItemRef|undefined> = {};
    private editUtil: EditUtil;

    constructor(private httpClient: HttpClient,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private tenantService: TenantService,
        private lookupService: LookupService,
        private metaApiService: MetaApiService) {

        super({ initialized: false });

        this.state$
          .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
          .subscribe((state) => {
              console.debug('PageStore state update');
              console.debug(state);
          });

        this.editUtil = {
            getEditorOption: (dataMember, option) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.getOption(option) : undefined,
            setEditorOption: (dataMember, option, value) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.setOption(option, value) : undefined
        } as EditUtil;
      
        this.scriptActions = {
            loadData: (params) => this.loadData(params)
        };

        this.effect(_ => 
            combineLatest([this.page$, this.lookupService.lookups$])                
                .pipe(tap(([page, lookups]) => {
                    if (page && lookups) {
                        if (page.compiledCustomScripts?.prepareCustomParam) {
                            page.compiledCustomScripts.prepareCustomParam(lookups, createUtil(this.httpClient), (p) => this.updater((state) => ({
                                ...state,
                                customParam: p
                            }))());
                        } else {
                            this.updater((state) => ({
                                ...state,
                                customParam: {}
                            }))();
                        }
                    }
                }))
        );
    }

    readonly initialized$ = this.select((state) => state.initialized);
    readonly page$ = this.select((state) => state.page);
    readonly title$ = this.select((state) => state.title);
    readonly layout$ = this.select((state) => state.layout);
    readonly customParam$ = this.select((state) => state.customParam);
    readonly headParams$ = this.activatedRoute.queryParams
        .pipe(map((queryParams) => qs.parse(queryParams['page'] ?? "")));

    readonly setPageId = this.effect((pageId$: Observable<string>) => 
       pageId$
            .pipe(tap((_) => {
                this.updater((state, _) => ({
                    initialized: false
                }))();
            }))
            .pipe(withLatestFrom(this.metaApiService.metaPageApiFactory$))
            .pipe(switchMap(([pageId, metaPageApi]) => (pageId && metaPageApi)
                ? metaPageApi().pageDataForIdentifier(this.httpClient, pageId)
                : of(undefined)
            ))
            .pipe(tap((page) => this.updater((state) => ({
                ...state,
                page,
                layout: page?.layout,
                title: page?.layout?.title
            }))()))            
            .pipe(tap((page) => {
                this.toolbarItems = {};
        
                page?.layout?.toolbaritems?.forEach(item => {
                  if (item.name) {
                    this.toolbarItems[item.name] = undefined;
                  }
                });
        
                if (!page?.layout?.toolbaritems?.length) {
                  this.updater((state) => ({
                    ...state,
                    initialized: true
                  }))();
                }
            }))
            .pipe(tap((page) => {
                if (page) {
                    const lookups = [] as Array<LookupRequest>;
          
                    if (page.lookups) {
                      lookups.push(...page.lookups.map(l => {
                        if (l.type === 1) {
                          if (l.hasParam) {
                            return {
                              type: 'autocompletewithparam',
                              identifier: l.identifier,
                              lookupId: l.id,
                            } as LookupRequest;
                          } else {
                            return {
                              type: 'autocomplete',
                              identifier: l.identifier,
                              lookupId: l.id,
                            } as LookupRequest;
                          }
                        } else {
                          if (l.hasParam) {
                            return {
                              type: 'lookupwithparam',
                              identifier: l.identifier,
                              lookupId: l.id,
                              valueMember: l.valueMember,
                              displayMember: l.displayMember,
                            } as LookupRequest;
                          } else {
                            return {
                              type: 'lookup',
                              identifier: l.identifier,
                              lookupId: l.id,
                              valueMember: l.valueMember,
                              displayMember: l.displayMember,
                            } as LookupRequest;
                          }
                        }
                      }));
                    }
          
                    if (page.picklists) {
                      lookups.push(
                        ...page.picklists.map(p => {
                          return {
                            type: 'pickvalue',
                            identifier: p.identifier,
                            entity: p.entity,
                            field: p.field,
                          } as LookupRequest;
                        })
                      );
                    }
                              
                    this.lookupService.requestLookups(lookups);
                  }
            }))
    );

    readonly setPageUrl = this.effect((pageUrl$: Observable<string>) => 
        pageUrl$
            .pipe(withLatestFrom(this.tenantService.pages$))
            .pipe(tap(([pageUrl, pages]) => {
                if (pages && pageUrl) {
                    const page = pages.find(p => p.options.url === pageUrl);
          
                    if (page?.options?.page) {
                      this.setPageId(page.options.page)
                    }
                }
            }))
    );

    readonly loadData = this.effect((params$: Observable<QueryParams>) => 
        params$
            .pipe(tap((params) => {
                this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { page: qs.stringify(params) }, queryParamsHandling: 'merge' });

                this.updater((state) => ({
                    ...state,
                    initialized: true
                }))();
            }))
    );

    readonly paramEditorInitialized = this.effect((params$: Observable<{ name: string, item: ToolbarItemRef }>) => 
        combineLatest([this.page$, this.lookupService.lookups$, this.headParams$, params$])
            .pipe(tap(([page, lookups, pageParam, { name, item }]) => {
                if (page && lookups && pageParam) {
                    this.toolbarItems[name] = item;

                    if (page.compiledCustomScripts?.paramEditorInitialized) {
                        page.compiledCustomScripts.paramEditorInitialized(name, this.editUtil, lookups, createUtil(this.httpClient), this.scriptActions, pageParam);
                    }

                    if (!Object.keys(this.toolbarItems).some(item => !this.toolbarItems[item])) {
                        if (page && page.compiledCustomScripts?.paramsInitialized) {
                            page.compiledCustomScripts?.paramsInitialized(false, lookups, createUtil(this.httpClient), this.scriptActions, pageParam);
                        }
                    }
                }
            }))
    );

    readonly paramEditorDestroyed = this.effect((name$: Observable<string>) => 
        name$
            .pipe(tap((name) => {
                delete this.toolbarItems[name];
            }))
    );

    paramEditorValueChanged = this.effect((params$: Observable<{ name: string, value: ValueType }>) => 
        combineLatest([this.page$, this.lookupService.lookups$, this.headParams$, params$])
            .pipe(tap(([page, lookups, pageParam, { name, value }]) => {
                if (page && lookups && pageParam) {
                    if (page.compiledCustomScripts?.paramEditorValueChanged) {
                        page.compiledCustomScripts.paramEditorValueChanged(name, value, this.editUtil, lookups, createUtil(this.httpClient), this.scriptActions, pageParam);
                    }
                }
            }))
    );

    paramEditorEvent = this.effect((params$: Observable<{ name: string, event: string, param?: ValueType }>) => 
        combineLatest([this.page$, this.lookupService.lookups$, this.headParams$, params$])
            .pipe(tap(([page, lookups, pageParam, { name, event, param }]) => {
                if (page && lookups && pageParam) {
                    if (page.compiledCustomScripts?.paramEditorEvent) {
                    page.compiledCustomScripts.paramEditorEvent(name, event, this.editUtil, lookups, createUtil(this.httpClient), this.scriptActions, pageParam, param);
                    }
                }
            }))
    );
}