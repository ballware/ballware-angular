import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import JSON5 from 'json5';

import { CompiledStatistic, QueryParams, StatisticLayout } from '@ballware/meta-model';
import { additionalParamsToUrl } from './util';
import { compileArgumentAxisCustomizeText, compileStatisticMapping } from '@ballware/meta-scripting';
import { MetaStatisticApi } from '@ballware/meta-api';

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
  const scripts = JSON5.parse(
    statistic.CustomScripts ?? '{}'
  ) as StatisticCustomScripts;

  const compiledStatistic = {
    id: statistic.Id,
    entity: statistic.Entity,
    identifier: statistic.Identifier,
    name: statistic.Name,
    layout: statistic.Layout
      ? (JSON5.parse(statistic.Layout) as StatisticLayout)
      : ({} as StatisticLayout),
    mappingScript: compileStatisticMapping(statistic.MappingScript),
    customScripts: {
      argumentAxisCustomizeText: compileArgumentAxisCustomizeText(scripts.argumentAxisCustomizeText)
    }
  } as CompiledStatistic;

  return compiledStatistic;
};

const metadataFunc = (http: HttpClient, metaServiceBaseUrl: string) => (
  identifier: string
): Observable<CompiledStatistic> => {
  const url = `${metaServiceBaseUrl}/statistic/metadataforidentifier/${encodeURIComponent(identifier)}`;

  return http
    .get<Statistic>(url)
    .pipe(map(data => compileStatistic(data)));
};

const dataFunc = (http: HttpClient, tenantServiceBaseUrl: string) => (
  identifier: string,
  params: QueryParams
): Observable<Array<Record<string, unknown>>> => {
  const url = `${tenantServiceBaseUrl}/statistic/dataforidentifier/${encodeURIComponent(identifier)}${additionalParamsToUrl(
    params, '?'
  )}`;

  return http
    .get<Array<Record<string, unknown>>>(url);
};

const selectList = (http: HttpClient, metaServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${metaServiceBaseUrl}/statistic/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, metaServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${metaServiceBaseUrl}/statistic/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

/**
 * Create adapter for statistic fetch operations with ballware.meta.service
 * @param metaServiceBaseUrl Base URL to connect to ballware.meta.service
 * @param tenantServiceBaseUrl Base URL to connect to ballware.tenant.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendStatisticApi(
  httpClient: HttpClient,
  metaServiceBaseUrl: string,
  tenantServiceBaseUrl: string
): MetaStatisticApi {
  return {
    selectList: selectList(httpClient, metaServiceBaseUrl),
    selectById: selectById(httpClient, metaServiceBaseUrl),
    metadataForStatistic: metadataFunc(httpClient, metaServiceBaseUrl),
    dataForStatistic: dataFunc(httpClient, tenantServiceBaseUrl),
  } as MetaStatisticApi;
}
