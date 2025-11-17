import {
  compileEntityMetadata,
  compilePage, EntityMetadata, PageData
} from '@ballware/rest-meta-api';

export const fetchEntity = async (entity: string) => {
  const entityDataResponse =  await fetch(`/api/fixtures/entity/${entity}.json`, { cache: 'no-store' })

  return compileEntityMetadata(((await entityDataResponse.json()) as EntityMetadata[])[0]);
};

export const fetchPage = async (page: string) => {
  const pageDataResponse = await fetch(`/api/fixtures/page/${page}.json`, { cache: 'no-store' })

  return compilePage(((await pageDataResponse.json()) as PageData[])[0]);
}

export const fetchGeneric = async (basePath: string, operation: string, query: string) => {
  const genericResponse = await fetch(`/api/fixtures/${basePath.replace('{generic}', 'generic/')}/${operation}/${query}.json`, { cache: 'no-store' });

  return genericResponse.json();
}
