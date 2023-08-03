import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, BehaviorSubject, takeUntil, Observable, switchMap, of, map, Subject, share, ReplaySubject, distinctUntilChanged, withLatestFrom } from 'rxjs';
import * as qs from 'qs';
import { isEqual } from 'lodash';

import { CompiledPageData, EditUtil, PageLayout, QueryParams, ScriptActions, ValueType } from '@ballware/meta-model';
import { LookupRequest, LookupService } from '../lookup.service';
import { createUtil } from './createscriptutil';
import { ToolbarItemRef } from '../toolbaritemref';
import { ActivatedRoute, Router } from '@angular/router';
import { MetaApiService } from '@ballware/meta-api';
import { PageService } from '../page.service';
import { Store } from '@ngrx/store';
import { selectPages } from '../tenant';

@Injectable()
export class DefaultPageService extends PageService {

  private _initialized$ = new BehaviorSubject<boolean>(false);

  private _pageId$ = new Subject<string|undefined>();
  private _pageUrl$ = new Subject<string|undefined>();
  private _customParam$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);  
  private _paramEditorInitialized$ = new Subject<{name: string, item: ToolbarItemRef}>();
  private _paramEditorValueChanged$ = new Subject<{name: string, value: ValueType}>();
  private _paramEditorEvent$ = new Subject<{name: string, event: string, param?: ValueType}>();

  private scriptActions: ScriptActions;

  private toolbarItems: Record<string, ToolbarItemRef|undefined> = {};
  private editUtil: EditUtil;

  public readonly initialized$: Observable<boolean> = this._initialized$;
  public page$: Observable<CompiledPageData|undefined>;
  public title$: Observable<string|undefined>;
  public layout$: Observable<PageLayout|undefined>;

  public get customParam$() {
    return this._customParam$;
  }

  public get headParams$() {
    return this.activatedRoute.queryParams
      .pipe(map((queryParams) => qs.parse(queryParams['page'] ?? "")));
  }

  constructor(
    private store: Store,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private lookupService: LookupService,
    private metaApiService: MetaApiService) {
    super();

    console.log('page service initialized');

    this.editUtil = {
      getEditorOption: (dataMember, option) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.getOption(option) : undefined,
      setEditorOption: (dataMember, option, value) => this.toolbarItems[dataMember] ? this.toolbarItems[dataMember]?.setOption(option, value) : undefined
    } as EditUtil;

    this.scriptActions = {
      loadData: (params) => this.loadData(params)
    };

    /*
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this._headParams$))
      .subscribe(([queryParams, headParams]) => {
        const nextPageParam = qs.parse(queryParams['page'] ?? "");

        if (!isEqual(headParams, nextPageParam)) {
          this._headParams$.next(nextPageParam);
        }
      });
    */
    /*
    this._headParams$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.activatedRoute.queryParams))
      .subscribe(([headParams, queryParams]) => {    
        const currentQueryParams = qs.parse(queryParams['page'] ?? "");
        
        if (!isEqual(headParams, currentQueryParams)) {          
          this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { page: qs.stringify(headParams) }, queryParamsHandling: 'merge' });
        }        
      });
    */

    this.page$ = combineLatest([this._pageId$.pipe(distinctUntilChanged()), this.metaApiService.metaPageApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([pageId, metaPageApi]) => (pageId && metaPageApi)
        ? metaPageApi().pageDataForIdentifier(this.httpClient, pageId)
        : of(undefined)
      ))
      .pipe(share({ connector: () => new ReplaySubject(), resetOnRefCountZero: false, resetOnComplete: false, resetOnError: true }));

    this.title$ = this.page$.pipe(takeUntil(this.destroy$))
      .pipe(map((page) => page?.name));

    this.layout$ = this.page$.pipe(takeUntil(this.destroy$))
      .pipe(map((page) => page?.layout));

    this.page$.pipe(takeUntil(this.destroy$))
      .subscribe((page) => {
        this.toolbarItems = {};

        page?.layout?.toolbaritems?.forEach(item => {
          if (item.name) {
            this.toolbarItems[item.name] = undefined;
          }
        });

        if (!page?.layout?.toolbaritems?.length) {
          this._initialized$.next(true);
        }
      });

    this.page$.pipe(takeUntil(this.destroy$))
      .subscribe((page) => {
        if (page) {
          const lookupRequest = page.lookups.map(l => {
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
          });

          this.lookupService.requestLookups(lookupRequest);
        }
      });

    combineLatest([this.page$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([page, lookups]) => {
        if (page && lookups) {
          if (page.compiledCustomScripts?.prepareCustomParam) {
            page.compiledCustomScripts.prepareCustomParam(lookups, createUtil(httpClient), (p) => this.customParam$.next(p));
          } else {
            this.customParam$.next({});
          }
        }
      });

    combineLatest([this.page$, this.lookupService.lookups$, this.headParams$.pipe(distinctUntilChanged((prev, curr) => isEqual(prev, curr))), this._paramEditorInitialized$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([page, lookups, pageParam, { name, item }]) => {
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
      });

    combineLatest([this.page$, this.lookupService.lookups$, this.headParams$.pipe(distinctUntilChanged((prev, curr) => isEqual(prev, curr))), this._paramEditorValueChanged$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([page, lookups, pageParam, { name, value }]) => {
        if (page && lookups && pageParam) {
          if (page.compiledCustomScripts?.paramEditorValueChanged) {
            page.compiledCustomScripts.paramEditorValueChanged(name, value, this.editUtil, lookups, createUtil(this.httpClient), this.scriptActions, pageParam);
          }
        }
      });

    combineLatest([this.page$, this.lookupService.lookups$, this.headParams$.pipe(distinctUntilChanged((prev, curr) => isEqual(prev, curr))), this._paramEditorEvent$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([page, lookups, pageParam, { name, event, param }]) => {
        if (page && lookups && pageParam) {
          if (page.compiledCustomScripts?.paramEditorEvent) {
            page.compiledCustomScripts.paramEditorEvent(name, event, this.editUtil, lookups, createUtil(this.httpClient), this.scriptActions, pageParam, param);
          }
        }
      });

    combineLatest([this.store.select(selectPages), this._pageUrl$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([pages, pageUrl]) => {
        if (pages && pageUrl) {
          const page = pages.find(p => p.options.url === pageUrl);

          if (page) {
            this._pageId$.next(page.options.page);
          }
        }
      });
  }

  public setPageId(pageId: string): void {
    this._pageId$.next(pageId);
  }

  public setPageUrl(pageUrl: string): void {
    this._pageUrl$.next(pageUrl);
  }

  public loadData(params: QueryParams) {
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { page: qs.stringify(params) }, queryParamsHandling: 'merge' });
    this._initialized$.next(true);
  }

  public paramEditorInitialized(name: string, item: ToolbarItemRef) {
    this._paramEditorInitialized$.next({ name, item });
  }

  public paramEditorDestroyed(name: string) {
    delete this.toolbarItems[name];
  }

  public paramEditorValueChanged(name: string, value: ValueType) {
    this._paramEditorValueChanged$.next({ name, value });
  }

  public paramEditorEvent(name: string, event: string, param?: ValueType) {
    this._paramEditorEvent$.next({name, event, param});
  }
}
