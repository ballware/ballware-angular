import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledStatistic, QueryParams, StatisticLayout } from '@ballware/meta-model';
import { additionalParamsToUrl } from './util';
import { compileArgumentAxisCustomizeText, compileStatisticMapping } from '@ballware/meta-scripting';

/**
 * Interface for statistic data operations
 */
 export interface MetaStatisticApi {
  /**
   * Fetch metadata for statistic
   * @param identifier Unique identifier of statistic item
   * @returns Observable containing statistic metadata
   */
  metadataForStatistic: (
    identifier: string
  ) => Observable<CompiledStatistic>;

  /**
   * Fetch content data for statistic
   * @param identifier Unique identifier of statistic item
   * @param param Optional parameters for query
   * @returns Observable containing statistic content
   */
  dataForStatistic: (
    identifier: string,
    params?: QueryParams
  ) => Observable<Array<Record<string, unknown>>>;
}

interface Statistic {
  Id: string;
  Entity: string;
  Identifier: string;
  Name: string;
  Layout: string;
  MappingScript?: string;
  CustomScripts?: string;
}

interface StatisticCustomScripts {
  argumentAxisCustomizeText?: string;
}

export const compileStatistic = (statistic: Statistic): CompiledStatistic => {
  const scripts = parse(
    statistic.CustomScripts ?? '{}'
  ) as StatisticCustomScripts;

  const compiledStatistic = {
    id: statistic.Id,
    entity: statistic.Entity,
    identifier: statistic.Identifier,
    name: statistic.Name,
    layout: statistic.Layout
      ? (parse(statistic.Layout) as StatisticLayout)
      : ({} as StatisticLayout),
    mappingScript: compileStatisticMapping(statistic.MappingScript),
    customScripts: {
      argumentAxisCustomizeText: compileArgumentAxisCustomizeText(scripts.argumentAxisCustomizeText)
    }
  } as CompiledStatistic;

  return compiledStatistic;
};

const metadataFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string
): Observable<CompiledStatistic> => {
  const url = `${serviceBaseUrl}/api/statistic/metadataforidentifier?identifier=${encodeURIComponent(identifier)}`;

  return http
    .get<Statistic>(url)
    .pipe(map(data => compileStatistic(data)));
};

const dataFunc = (http: HttpClient, serviceBaseUrl: string) => (
  identifier: string,
  params: QueryParams
): Observable<Array<Record<string, unknown>>> => {
  const url = `${serviceBaseUrl}/api/statistic/dataforidentifier?identifier=${encodeURIComponent(identifier)}${additionalParamsToUrl(
    params
  )}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

/**
 * Create adapter for statistic fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendStatisticApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaStatisticApi {
  return {
    metadataForStatistic: metadataFunc(httpClient, serviceBaseUrl),
    dataForStatistic: dataFunc(httpClient, serviceBaseUrl),
  } as MetaStatisticApi;
}
