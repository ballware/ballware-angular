import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledEntityMetadata, DocumentSelectEntry, EditLayout, GridLayout, Template } from '@ballware/meta-model';
import { compileDetailGridCellPreparing, compileDetailGridRowValidating, compileEditorEntered, compileEditorEvent, compileEditorInitialized, compileEditorPreparing, compileEditorValidating, compileEditorValueChanged, compileEvaluateCustomFunction, compileInitNewDetailItem, compileItemMapping, compilePrepareCustomFunction, compilePrepareCustomParam, compilePrepareEditLayout, compilePrepareGridLayout, compilePrepareMaterializedEditItem, compileRightsCheckFunc, compileRightsParamForHead, compileRightsParamForItem } from '@ballware/meta-scripting';
import { MetaEntityApi } from '@ballware/meta-api';

interface EntityMetadata {
  Application: string;
  Entity: string;
  DisplayName: string;
  BaseUrl: string;
  ItemMappingScript: string;
  ItemReverseMappingScript: string;
  Lookups: string;
  Picklists: string;
  Templates: string;
  CustomScripts?: string;
  CustomFunctions?: string;
  GridLayout: string;
  EditLayout: string;
  StateColumn: string;
}

interface EntityCustomScripts {
  commonUtils?: string;
  extendedRightsCheck?: string;
  rightsParamForHead?: string;
  rightsParamForItem?: string;
  prepareCustomParam?: string;
  prepareGridLayout?: string;
  prepareEditLayout?: string;
  prepareMaterializedEditItem?: string;  
  editorPreparing?: string;
  editorInitialized?: string;
  editorValueChanged?: string;
  editorEntered?: string;
  editorEvent?: string;
  editorValidating?: string;
  detailGridCellPreparing?: string;
  detailGridRowValidating?: string;
  initNewDetailItem?: string;
  prepareCustomFunction?: string;
  evaluateCustomFunction?: string;
}

const compileEntityMetadata = (
  metaData: EntityMetadata
): CompiledEntityMetadata => {
  const compiledMetaData = {
    application: metaData.Application,
    entity: metaData.Entity,
    displayName: metaData.DisplayName,
    baseUrl: metaData.BaseUrl,
    stateColumn: metaData.StateColumn,
  } as CompiledEntityMetadata;
  
  const customScripts = metaData.CustomScripts ? parse(
    metaData.CustomScripts
  ) as EntityCustomScripts : {} as EntityCustomScripts;

  compiledMetaData.itemMappingScript = compileItemMapping(metaData.ItemMappingScript, customScripts.commonUtils);
  compiledMetaData.itemReverseMappingScript = compileItemMapping(metaData.ItemReverseMappingScript, customScripts.commonUtils);

  if (metaData.GridLayout) {
    compiledMetaData.gridLayouts = parse(metaData.GridLayout) as Array<
      GridLayout
    >;
  }

  if (metaData.EditLayout) {
    compiledMetaData.editLayouts = parse(metaData.EditLayout) as Array<
      EditLayout
    >;
  }

  if (metaData.Lookups) {
    compiledMetaData.lookups = parse(metaData.Lookups);
  }

  if (metaData.Picklists) {
    compiledMetaData.picklists = parse(metaData.Picklists);
  }

  if (metaData.Templates) {
    compiledMetaData.templates = (parse(metaData.Templates) as Array<{ identifier: string, definition: string }>).map(t => ({
      identifier: t.identifier,
      definition: parse(t.definition)
    } as Template));
  }  

  if (metaData.CustomFunctions) {
    compiledMetaData.customFunctions = parse(metaData.CustomFunctions);
  }

  compiledMetaData.compiledCustomScripts = {
    rightsCheck: compileRightsCheckFunc(customScripts.extendedRightsCheck, customScripts.commonUtils),
    rightsParamForHead: compileRightsParamForHead(customScripts.rightsParamForHead, customScripts.commonUtils),
    rightsParamForItem: compileRightsParamForItem(customScripts.rightsParamForItem, customScripts.commonUtils),
    prepareCustomParam: compilePrepareCustomParam(customScripts.prepareCustomParam),
    prepareGridLayout: compilePrepareGridLayout(customScripts.prepareGridLayout, customScripts.commonUtils),
    prepareEditLayout: compilePrepareEditLayout(customScripts.prepareEditLayout, customScripts.commonUtils),
    prepareMaterializedEditItem: compilePrepareMaterializedEditItem(customScripts.prepareMaterializedEditItem, customScripts.commonUtils),
    editorPreparing: compileEditorPreparing(customScripts.editorPreparing, customScripts.commonUtils),
    editorInitialized: compileEditorInitialized(customScripts.editorInitialized, customScripts.commonUtils),
    editorValueChanged: compileEditorValueChanged(customScripts.editorValueChanged, customScripts.commonUtils),
    editorEntered: compileEditorEntered(customScripts.editorEntered, customScripts.commonUtils),
    editorEvent: compileEditorEvent(customScripts.editorEvent, customScripts.commonUtils),
    editorValidating: compileEditorValidating(customScripts.editorValidating, customScripts.commonUtils),
    detailGridCellPreparing: compileDetailGridCellPreparing(customScripts.detailGridCellPreparing, customScripts.commonUtils),
    detailGridRowValidating: compileDetailGridRowValidating(customScripts.detailGridRowValidating, customScripts.commonUtils),
    initNewDetailItem: compileInitNewDetailItem(customScripts.initNewDetailItem, customScripts.commonUtils),
    prepareCustomFunction: compilePrepareCustomFunction(customScripts.prepareCustomFunction, customScripts.commonUtils),
    evaluateCustomFunction: compileEvaluateCustomFunction(customScripts.evaluateCustomFunction, customScripts.commonUtils)
  };

  return compiledMetaData;
};

const metadataFunc = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string
): Observable<CompiledEntityMetadata> => {
  const url = `${serviceBaseUrl}/api/entity/metadataforentity/${entity}`;

  return http
    .get<EntityMetadata>(url)
    .pipe(map((value) => compileEntityMetadata(value)));
};

const documentsForEntityFunc = (http: HttpClient, serviceBaseUrl: string) => (
  entity: string
): Observable<Array<DocumentSelectEntry>> => {
  const url = `${serviceBaseUrl}/api/document/selectlistdocumentsforentity/${entity}`;

  return http
    .get<Array<DocumentSelectEntry>>(url);
};

/**
 * Create adapter for entity metadata operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendEntityApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaEntityApi {
  return {
    metadataForEntity: metadataFunc(httpClient, serviceBaseUrl),
    documentsForEntity: documentsForEntityFunc(httpClient, serviceBaseUrl),
  } as MetaEntityApi;
}
