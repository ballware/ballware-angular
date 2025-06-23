import { parse, stringify } from 'json5/lib';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';

import { ScriptUtil } from '@ballware/meta-model';

import { HttpClient } from '@angular/common/http';
import { LookupCreator, LookupDescriptor, LookupStoreDescriptor, PickvalueCreator } from '@ballware/meta-services';
import { geocodeAddress, geocodeLocation } from './geocoder';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { speak } from './speech';
import { MetaDocumentApi, MetaSubscriptionApi } from '@ballware/meta-api';


function beginOfYear(): Date {
  const m = moment()
    .startOf('year')
    .utc();

  return moment(m)
    .add(m.utcOffset(), 'm')
    .toDate();
}

function endOfYear(): Date {
  const m = moment()
    .endOf('year')
    .utc();

  return moment(m)
    .add(m.utcOffset(), 'm')
    .toDate();
}

function beginOfLastYear(): Date {
  const m = moment()
    .startOf('year')
    .utc();

  return moment(m)
    .add(m.utcOffset(), 'm')
    .subtract(1, 'year')
    .toDate();
}

function endOfLastYear(): Date {
  const m = moment()
    .endOf('year')
    .utc();

  return moment(m)
    .add(m.utcOffset(), 'm')
    .subtract(1, 'year')
    .toDate();
}

function dateToLocalDate(date: Date): Date | null {
  if (date) return moment(date).toDate();

  return null;
}

function localDateToDate(date: Date): Date | null {
  if (date)
    return moment(date)
      .add(moment(date).utcOffset(), 'm')
      .toDate();

  return null;
}

/**
 * Creates util object containing functionality for custom scripts
 * @param token Token used for authenticated webservice requests
 * @returns Generated util object
 */
export const createUtil = (http: HttpClient, documentApi: MetaDocumentApi, subscriptionApi: MetaSubscriptionApi, idToken$: Observable<string|undefined>, accessToken$: Observable<string|undefined>, currentUser$: Observable<Record<string, unknown>|undefined>): ScriptUtil => {
  return {
    http: () => http,
    token: () => firstValueFrom(accessToken$),
    user: () => firstValueFrom(currentUser$),
    uuid: () => uuid(),
    parse: json => parse(json),
    stringify: json => stringify(json),
    dateToLocalDate: date => dateToLocalDate(date),
    localDateToDate: date => localDateToDate(date),
    beginOfYear: () => beginOfYear(),
    endOfYear: () => endOfYear(),
    beginOfLastYear: () => beginOfLastYear(),
    endOfLastYear: () => endOfLastYear(),
    withLookupList: (
      lookup: unknown,
      callback: (items: Array<Record<string, unknown>>) => void
    ) => {
      ((lookup as LookupDescriptor).store as LookupStoreDescriptor)
        .listFunc()
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withLookupListParam: (lookup: unknown, param: string | string[], callback: (items: Array<Record<string, unknown>>) => void) => {
      ((lookup as LookupCreator)(param).store as LookupStoreDescriptor)
        .listFunc()
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withLookupById: (
      lookup: unknown,
      id: string,
      callback: (item?: Record<string, unknown>) => void
    ) => {
      ((lookup as LookupDescriptor).store as LookupStoreDescriptor)
        .byIdFunc(id)
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withLookupByIdParam: (
      lookup: unknown,
      param: string | string[],
      id: string,
      callback: (item?: Record<string, unknown>) => void
    ) => {
      ((lookup as LookupCreator)(param).store as LookupStoreDescriptor)
        .byIdFunc(id)
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withPickvalueList: (
      lookup: unknown,
      entity: string,
      field: string,
      callback: (items: Array<Record<string, unknown>>) => void
    ) => {
      ((lookup as PickvalueCreator)(entity, field).store as LookupStoreDescriptor)
        .listFunc()
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withPickvalueByValue: (
      lookup: unknown,
      entity: string,
      field: string,
      value: number,
      callback: (item?: Record<string, unknown>) => void
    ) => {
      ((lookup as PickvalueCreator)(entity, field).store as LookupStoreDescriptor)
        .byIdFunc(value.toString())
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    withAutocompleteList: (
      autocomplete: unknown,
      callback: (items: Array<unknown>) => void
    ) => {
      (autocomplete as LookupDescriptor).store
        .listFunc()
        .subscribe({next: (result) => callback(result), error: (reason) => console.error(reason) });
    },
    getJson: (url, success, failure) => {
      http
        .get<unknown>(url)
        .subscribe({next: (result) => success(result), error: (reason) => failure(reason) });
    },
    getText: (url, success, failure) => {
      http
        .get<string>(url)
        .subscribe({next: (result) => success(result), error: (reason) => failure(reason) });
    },
    geocodeAddress: (address, callback) => {
      geocodeAddress(address, callback);
    },
    geocodeLocation: (location, callback) => {
      geocodeLocation(location, callback);
    },
    speak: (text: string) => speak(text),
    openDocumentDesigner: (documentId, callback) => {
      firstValueFrom(idToken$).then(token => {
        if (token) {
          documentApi.designerUrl(token, documentId)
            .subscribe({
              next: (url) => callback(url),
              error: (reason) => console.error(reason)
            });
        } else {
          console.error('No token available for opening document designer');
        }
      }).catch(err => {
        console.error('Error getting token for opening document designer', err);
      });
    },
    triggerSubscriptions: (ids, callback, error) => {
      subscriptionApi.triggerSubscriptions(ids)
        .subscribe({
          next: () => {
            if (callback) callback();
          },
          error: (reason) => {
            console.error(reason?.message ?? reason);
            if (error) error(reason?.message ?? reason);
          }
        });        
    },
    updateDatasources: (ids, callback, error) => {
      documentApi.updateDatasources(ids)
        .subscribe({
          next: () => {
            if (callback) callback();
          },
          error: (reason) => {
            console.error(reason?.message ?? reason);
            if (error) error(reason?.message ?? reason);
          }
        });        
    }
  } as ScriptUtil;
};
