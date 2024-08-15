import { Observable } from 'rxjs';

import { InjectionToken, OnDestroy } from '@angular/core';
import { CompiledPageData, PageLayout, QueryParams, ValueType } from '@ballware/meta-model';
import { ToolbarItemRef } from './toolbaritemref';
import { Router } from '@angular/router';
import { LookupService } from './lookup.service';

export interface PageService extends OnDestroy {
  initialized$: Observable<boolean>;
  page$: Observable<CompiledPageData|undefined>;
  title$: Observable<string|undefined>;
  layout$: Observable<PageLayout|undefined>;
  customParam$: Observable<Record<string, unknown>|undefined>;
  headParams$: Observable<QueryParams|undefined>;

  setPageUrl(pageUrl: string): void;
  setPageQuery(pageQuery: string): void;
  loadData(params: QueryParams): void;
  paramEditorInitialized(editor: { name: string, item: ToolbarItemRef }): void;
  paramEditorDestroyed(name: string): void;
  paramEditorValueChanged(editor: { name: string, value: ValueType }): void;
  paramEditorEvent(editor: { name: string, event: string, param?: ValueType }): void;
}

export type PageServiceFactory = (router: Router, lookupService: LookupService) => PageService;

export const PAGE_SERVICE = new InjectionToken<PageService>('Meta service');
export const PAGE_SERVICE_FACTORY = new InjectionToken<PageServiceFactory>('Page service factory');