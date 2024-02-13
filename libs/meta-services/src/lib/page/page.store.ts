import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiError, MetaApiService } from "@ballware/meta-api";
import { EditUtil, QueryParams, ScriptActions, ValueType } from "@ballware/meta-model";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { I18NextPipe } from "angular-i18next";
import { cloneDeep, isEqual } from "lodash";
import * as qs from "qs";
import { Observable, catchError, combineLatest, distinctUntilChanged, of, switchMap, takeUntil, tap, withLatestFrom } from "rxjs";
import { pageDestroyed, pageUpdated } from "../component";
import { IdentityService } from "../identity.service";
import { createUtil } from "../implementation/createscriptutil";
import { LookupRequest, LookupService } from "../lookup.service";
import { NotificationService } from "../notification.service";
import { PageDocumentationDialog, PageServiceApi } from "../page.service";
import { TenantService } from "../tenant.service";
import { ToolbarItemRef } from "../toolbaritemref";
import { PageState } from "./page.state";

@Injectable()
export class PageStore extends ComponentStore<PageState> implements OnDestroy, PageServiceApi {
    
    private scriptActions: ScriptActions;

    private toolbarItems: Record<string, ToolbarItemRef|undefined> = {};
    private editUtil: EditUtil;

    constructor(
        private store: Store,
        private httpClient: HttpClient,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private identityService: IdentityService,
        private notificationService: NotificationService,
        private translationService: I18NextPipe,
        private tenantService: TenantService,
        private lookupService: LookupService,      
        private metaApiService: MetaApiService) {

        super({ initialized: false, headParams: {} });

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {                
                if (state.pageIdentifier) {
                    this.store.dispatch(pageUpdated({ identifier: state.pageIdentifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Meta state update');
                    console.debug(state);    
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.pageIdentifier) {
                    this.store.dispatch(pageDestroyed({ identifier: state.pageIdentifier }));
                }
            });  

        this.editUtil = {
            getEditorOption: (dataMember, option) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.getOption(option) : undefined,
            setEditorOption: (dataMember, option, value) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.setOption(option, value) : undefined
        } as EditUtil;
      
        this.scriptActions = {
            loadData: (params) => this.loadData(params)
        };

        this.effect(_ => this.select((state) => state.pageIdentifier)            
            .pipe(tap((_) => {
                this.updater((state, _) => ({
                  ...state,
                  initialized: false
                }))();
            }))
            .pipe(switchMap((pageId) => (pageId)
                ? this.metaApiService.metaPageApi.pageDataForIdentifier(pageId)
                : of(undefined)
            ))
            .pipe(tap((page) => this.updater((state) => ({
                ...state,
                page,
                layout: page?.layout,
                title: page?.layout?.title,
                documentationIdentifier: page?.layout?.documentationEntity
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

        this.effect(_ => 
            combineLatest([this.page$, this.lookupService.lookups$, this.identityService.accessToken$])                
                .pipe(tap(([page, lookups, accessToken]) => {
                    if (page && lookups && accessToken) {
                        if (page.compiledCustomScripts?.prepareCustomParam) {
                            page.compiledCustomScripts.prepareCustomParam(lookups, createUtil(this.httpClient, accessToken), (p) => this.updater((state) => ({
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

        this.effect(_ => combineLatest([this.tenantService.navigationLayout$, this.tenantService.pages$, this.activatedRoute.paramMap])
          .pipe(tap(([navigationLayout, pages, paramMap]) => {
            const pageUrl = paramMap.get('id') as string;

            if (navigationLayout && pages && pageUrl) {
              if (pageUrl === 'default') {
                if (navigationLayout.defaultUrl) {
                  this.router.navigate([`/page/${navigationLayout.defaultUrl}`]);
                }   
              } else {
                const page = pages.find(p => p.options.url === pageUrl);
          
                if (page?.options?.page) {
                  this.setPageId(page.options.page)
                }
              }
            }
          }))
        );

      this.effect(_ => combineLatest([this.activatedRoute.queryParams])
        .pipe(tap(([queryParams]) => {          
          const headParams = qs.parse(queryParams['page'] ?? "");

          this.updater((state, headParams: QueryParams) => ({
              ...state,
              headParams
          }))(headParams);
        }))
      );
    }

    readonly initialized$ = this.select((state) => state.initialized);
    readonly page$ = this.select((state) => state.page);
    readonly title$ = this.select((state) => state.title);
    readonly layout$ = this.select((state) => state.layout);
    readonly customParam$ = this.select((state) => state.customParam);
    readonly headParams$ = this.select((state) => state.headParams);

    readonly documentationIdentifier$ = this.select((state) => state.documentationIdentifier);
    readonly documentationDialog$ = this.select((state) => state.documentationDialog);
    
    readonly setPageId = this.updater((state, pageIdentifier: string) => ({
      ...state,
      pageIdentifier
    }));

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

    readonly showDocumentation = this.effect<void>((trigger$) => 
        trigger$
            .pipe(withLatestFrom(this.documentationIdentifier$))
            .pipe(switchMap(([, documentationIdentifier]) => documentationIdentifier
              ? this.metaApiService.metaDocumentationApi.loadDocumentationForEntity(documentationIdentifier)
              : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                
                return of(undefined);              
            }))      
            .pipe(tap((documentation) => {
              if (!documentation) {
                this.notificationService.triggerNotification({ message: this.translationService.transform('documentation.notifications.nodocumentation'), severity: 'info'});
              }
            }))        
            .pipe(withLatestFrom(this.layout$))
            .pipe(tap(([documentation, layout]) => this.updater((state, documentation: unknown) => ({
                ...state,
                documentationDialog: documentation ? {
                  title: this.translationService.transform('documentation.popuptitle', { entity: layout?.title ?? '' }),
                  content: documentation,
                  close: this.updater((state) => ({ ...state }))
                } as PageDocumentationDialog : undefined
              }))(documentation)))
    );

    readonly paramEditorInitialized = this.effect((params$: Observable<{ name: string, item: ToolbarItemRef }>) => 
        combineLatest([this.page$, this.lookupService.lookups$, this.identityService.accessToken$, params$])
            .pipe(withLatestFrom(this.headParams$))
            .pipe(tap(([[page, lookups, accessToken, { name, item }], pageParam]) => {
                if (page && lookups && pageParam && accessToken) {
                    this.toolbarItems[name] = item;

                    if (page.compiledCustomScripts?.paramEditorInitialized) {
                        page.compiledCustomScripts.paramEditorInitialized(name, this.editUtil, lookups, createUtil(this.httpClient, accessToken), this.scriptActions, pageParam);
                    }

                    if (!Object.keys(this.toolbarItems).some(item => !this.toolbarItems[item])) {
                        if (page && page.compiledCustomScripts?.paramsInitialized) {
                            page.compiledCustomScripts?.paramsInitialized(false, lookups, createUtil(this.httpClient, accessToken), this.scriptActions, pageParam);
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
        combineLatest([this.page$, this.lookupService.lookups$, this.identityService.accessToken$, this.headParams$, params$])
            .pipe(tap(([page, lookups, accessToken, pageParam, { name, value }]) => {
                if (page && lookups && accessToken && pageParam) {
                    if (page.compiledCustomScripts?.paramEditorValueChanged) {
                        page.compiledCustomScripts.paramEditorValueChanged(name, value, this.editUtil, lookups, createUtil(this.httpClient, accessToken), this.scriptActions, pageParam);
                    }
                }
            }))
    );

    paramEditorEvent = this.effect((params$: Observable<{ name: string, event: string, param?: ValueType }>) => 
        combineLatest([this.page$, this.lookupService.lookups$, this.identityService.accessToken$, params$])
            .pipe(withLatestFrom(this.headParams$))
            .pipe(tap(([[page, lookups, accessToken, { name, event, param }], pageParam]) => {
                if (page && lookups && accessToken && pageParam && name && event) {
                    if (page.compiledCustomScripts?.paramEditorEvent) {
                      page.compiledCustomScripts.paramEditorEvent(name, event, this.editUtil, lookups, createUtil(this.httpClient, accessToken), this.scriptActions, pageParam, param);
                    }
                }
            }))
    );
}