import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledPageData } from '@ballware/meta-model';

/**
 * Interface for page metadata operations
 */
 export interface MetaPageApi {
  /**
   * Fetch page metadata by identifier
   *
   * @param page Identifier for page
   * @returns Observable containing page metadata
   */
  pageDataForIdentifier: (
    page: string
  ) => Observable<CompiledPageData>;
}

interface PageData {
  Identifier: string;
  Name: string;
  Layout?: string;
  Lookups?: string;
  Picklists?: string;
  CustomScripts?: string;
}

interface PageCustomScripts {
  pageVisible?: string;
  pageEnabled?: string;
  prepareCustomParam?: string;
  paramsInitialized?: string;
  paramEditorInitialized?: string;
  paramEditorValueChanged?: string;
  paramEditorEvent?: string;
}

const compilePage = (pageData: PageData): CompiledPageData => {
  const compiledPageData = {
    identifier: pageData.Identifier,
    name: pageData.Name,
    lookups: pageData.Lookups ? parse(pageData.Lookups) : [],
    layout: pageData.Layout ? parse(pageData.Layout) : {},
  } as CompiledPageData;

  if (pageData.CustomScripts) {
    compiledPageData.compiledCustomScripts = {};

    const customScripts = parse(
      pageData.CustomScripts
    ) as PageCustomScripts;

    if (customScripts.pageVisible) {
      const compiledArgs = ['rights', 'page'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.pageVisible)
      );

      compiledPageData.compiledCustomScripts.pageVisible = compiledFn
        ? (rights, page) => compiledFn.apply(compiledFn, [rights, page])
        : undefined;
    }

    if (customScripts.pageEnabled) {
      const compiledArgs = ['rights', 'page'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.pageEnabled)
      );

      compiledPageData.compiledCustomScripts.pageEnabled = compiledFn
        ? (rights, page) => compiledFn.apply(compiledFn, [rights, page])
        : undefined;
    }

    if (customScripts.prepareCustomParam) {
      const compiledArgs = ['lookups', 'util', 'callback'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.prepareCustomParam)
      );

      compiledPageData.compiledCustomScripts.prepareCustomParam = compiledFn
        ? (lookups, util, callback) =>
            compiledFn.apply(compiledFn, [lookups, util, callback])
        : undefined;
    }

    if (customScripts.paramsInitialized) {
      const compiledArgs = ['hidden', 'lookups', 'util', 'actions', 'pageParam'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.paramsInitialized)
      );

      compiledPageData.compiledCustomScripts.paramsInitialized = compiledFn
        ? (hidden, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [hidden, lookups, util, actions, pageParam])
        : undefined;
    }

    if (customScripts.paramEditorInitialized) {
      const compiledArgs = ['name', 'editUtil', 'lookups', 'util', 'actions', 'pageParam'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.paramEditorInitialized)
      );

      compiledPageData.compiledCustomScripts.paramEditorInitialized = compiledFn
        ? (name, editUtil, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [
              name,
              editUtil,
              lookups,
              util,
              actions,
              pageParam,
            ])
        : undefined;
    }

    if (customScripts.paramEditorValueChanged) {
      const compiledArgs = [
        'name',
        'value',
        'editUtil',
        'lookups',
        'util',
        'actions',
        'pageParam',
      ];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.paramEditorValueChanged)
      );

      compiledPageData.compiledCustomScripts.paramEditorValueChanged = compiledFn
        ? (name, value, editUtil, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [
              name,
              value,
              editUtil,
              lookups,
              util,
              actions,
              pageParam,
            ])
        : undefined;
    }

    if (customScripts.paramEditorEvent) {
      const compiledArgs = [
        'name',
        'event',
        'editUtil',
        'lookups',
        'util',
        'actions',
        'pageParam',
        'param',
      ];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScripts.paramEditorEvent)
      );

      compiledPageData.compiledCustomScripts.paramEditorEvent = compiledFn
        ? (name, event, editUtil, lookups, util, actions, pageParam, param) =>
            compiledFn.apply(compiledFn, [
              name,
              event,
              editUtil,
              lookups,
              util,
              actions,
              pageParam,
              param,
            ])
        : undefined;
    }
  }

  return compiledPageData;
};

const pageDataForIdentifier = (http: HttpClient, metaServiceBaseUrl: string) => (
  page: string
): Observable<CompiledPageData> => {
  const url = `${metaServiceBaseUrl}/api/page/pagedataforidentifier/${page}`;

  return http
    .get<PageData>(url)
    .pipe(map(data => compilePage(data)));
};

/**
 * Create adapter for page fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendPageApi(
  httpClient: HttpClient, 
  metaServiceBaseUrl: string
): MetaPageApi {
  return {
    pageDataForIdentifier: pageDataForIdentifier(httpClient, metaServiceBaseUrl),
  } as MetaPageApi;
}
