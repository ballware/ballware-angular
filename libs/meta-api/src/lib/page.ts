import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledPageData } from '@ballware/meta-model';
import { compilePrepareCustomParam, compileParamsInitialized, compileParamEditorInitialized, compileParamEditorValueChanged, compileParamEditorEvent } from '@ballware/meta-scripting';

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

  const customScripts = parse(
    pageData.CustomScripts ?? '{}'
  ) as PageCustomScripts;

  compiledPageData.compiledCustomScripts = {
    prepareCustomParam: compilePrepareCustomParam(customScripts.prepareCustomParam),
    paramsInitialized: compileParamsInitialized(customScripts.paramsInitialized),
    paramEditorInitialized: compileParamEditorInitialized(customScripts.paramEditorInitialized),
    paramEditorValueChanged: compileParamEditorValueChanged(customScripts.paramEditorValueChanged),
    paramEditorEvent: compileParamEditorEvent(customScripts.paramEditorEvent)
  };

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
