import { parse, stringify } from 'json5/lib';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';

import { ScriptUtil } from '@ballware/meta-model';

import { HttpClient } from '@angular/common/http';
import { LookupCreator, LookupDescriptor, LookupStoreDescriptor } from '@ballware/meta-services';
import { geocodeAddress, geocodeLocation } from './geocoder';

/*
export const nameof = <T>(name: keyof T): keyof T => name;
export const nameofFactory = <T>() => (name: keyof T): keyof T => name;
export function arrayToMap<T>(array: Array<T>, key: (obj: T) => string): { [key: string]: T } {
    const result: { [key: string]: T } = {};
    array?.forEach((v) => (result[key(v)] = v));
    return result;
}
export function mapToArray<T>(map: { [key: string]: T }): Array<T> {
    const result: Array<T> = [];
    Object.keys(map ?? {}).forEach((k) => result.push(map[k]));
    return result;
}
*/

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
export const createUtil = (http: HttpClient, token: string): ScriptUtil => {
  return {
    http: () => http,
    token: () => token,
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
  } as ScriptUtil;
};
