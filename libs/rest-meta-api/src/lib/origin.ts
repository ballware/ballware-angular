import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiOriginApi } from '@ballware/meta-api';

const selectList = (http: HttpClient, llmServiceBaseUrl: string) => (): Observable<Array<Record<string, unknown>>> => {
  const url = `${llmServiceBaseUrl}/origin/selectlist`;

  return http
    .get<Array<Record<string, unknown>>>(url);
}

const selectById = (http: HttpClient, llmServiceBaseUrl: string) => (id: string): Observable<Record<string, unknown>> => {
  const url = `${llmServiceBaseUrl}/origin/selectbyid/${id}`;

  return http
    .get<Record<string, unknown>>(url);
}

const addFromAttachment = (http: HttpClient, llmServiceBaseUrl: string) => (entity: string, owner: string, id: string, name: string): Observable<void> => {

  const url = `${llmServiceBaseUrl}/origin/addfromattachment`;

  const body = {
    OwnerEntity: entity,
    OwnerId: owner,
    AttachmentId: id,
    Name: name
  }

  return http
    .post<void>(url, body);
}

const createEmbedding = (http: HttpClient, llmServiceBaseUrl: string) =>
  (ids: Array<string>, model: string, activate: boolean): Observable<void> => {

  const url = `${llmServiceBaseUrl}/origin/createembedding`;

  const body = {
    Ids: ids,
    Model: model,
    Activate: activate
  }

  return http
    .post<void>(url, body);
}


export function createAiOriginApi(
  httpClient: HttpClient,
  llmServiceBaseUrl: string
): AiOriginApi {
  return {
    selectList: selectList(httpClient, llmServiceBaseUrl),
    selectById: selectById(httpClient, llmServiceBaseUrl),

    addFromAttachment: addFromAttachment(httpClient, llmServiceBaseUrl),
    createEmbedding: createEmbedding(httpClient, llmServiceBaseUrl),
  } as AiOriginApi;
}
