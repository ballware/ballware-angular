import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, takeUntil } from 'rxjs';
import { IdentityApiService, IdentityRoleApi, IdentityUserApi, MetaApiService } from '@ballware/meta-api';
import { MetaLookupApi, MetaPickvalueApi, MetaProcessingstateApi } from '@ballware/meta-api';
import { WithDestroy } from './withdestroy';

/**
 * Data access adapter for fetching lookup data
 */
 export interface LookupStoreDescriptor {
  /**
   * Fetch list of lookup records
   * @returns Observable resolving list of available lookup records
   */
  listFunc: () => Observable<Record<string, unknown>[]>;

  /**
   * Fetch lookup record by id
   * @param id Id of lookup record
   * @returns Observable resolving single lookup record for id
   */
  byIdFunc: (id: string) => Observable<Record<string, unknown>>;
}

/**
 * Data access adapter for fetching autocomplete lookup data
 */
export interface AutocompleteStoreDescriptor {
  /**
   * Fetch list of autocomplete entries
   */
  listFunc: () => Observable<Array<unknown>>;
}

/**
 * Descriptor for lookup and autocomplete datasource
 */
export interface LookupDescriptor {
  /**
   * Type of lookup descriptor
   */
  type: 'lookup' | 'autocomplete';

  /**
   * Data access adapter for fetching data for lookup/autocomplete source
   */
  store: LookupStoreDescriptor | AutocompleteStoreDescriptor;

  /**
   * Value property in fetched data items
   */
  valueMember?: string;

  /**
   * Display property in fetched data items
   */
  displayMember?: string;
}

/**
 * Creator for getting lookup descriptor with additional query param
 * @param param Param attached to lookup query
 */
export type LookupCreator = (param: string | Array<string>) => LookupDescriptor;

/**
 * Creator for getting autocomplete descriptor with additional query param
 * @param param Param attached to autocomplete query
 */
export type AutocompleteCreator = (
  param: string
) => AutocompleteStoreDescriptor;

/**
 * Request object for requesting lookup descriptor
 */
export interface LookupRequest {
  /**
   * Type of requested lookup
   */
  type:
    | 'lookup'
    | 'lookupwithparam'
    | 'pickvalue'
    | 'autocomplete'
    | 'autocompletewithparam'
    | 'state'
    | 'stateallowed';

  /**
   * Unique identifier for lookup in consumer
   */
  identifier: string;

  /**
   * Unique id for lookup  in metadata
   */
  lookupId?: string;

  /**
   * Value property in fetched lookup items specific for consumer (only for lookup, lookupwithparam)
   */
  valueMember?: string;

  /**
   * Display property in fetched lookup items specific for consumer (only for lookup, lookupwithparam)
   */
  displayMember?: string;

  /**
   * Entity identifier (only for pickvalue)
   */
  entity?: string;

  /**
   * Field identifier (only for pickvalue)
   */
  field?: string;
}

const createUserLookup = (
  http: HttpClient,
  api: IdentityUserApi,
  valueMember: string,
  displayMember: string
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListFunc(http),
      byIdFunc: id => api.selectByIdFunc(http, id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

const createRoleLookup = (
  http: HttpClient,
  api: IdentityRoleApi,
  valueMember: string,
  displayMember: string
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListFunc(http),
      byIdFunc: id => api.selectByIdFunc(http, id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

const createGenericLookup = (
  http: HttpClient,
  api: MetaLookupApi,
  lookupId: string,
  valueMember: string,
  displayMember: string
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListForLookup(http, lookupId),
      byIdFunc: id => api.selectByIdForLookup(http, lookupId)(id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

const createGenericLookupWithParam = (
  http: HttpClient,
  api: MetaLookupApi,
  lookupId: string,
  valueMember: string,
  displayMember: string
): LookupCreator => {
  return (param): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () =>
          api.selectListForLookupWithParam(http, lookupId, param),
        byIdFunc: id =>
          api.selectByIdForLookupWithParam(http, lookupId, param)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    };
  };
};

const createGenericPickvalueLookup = (
  http: HttpClient,
  api: MetaPickvalueApi,
  entity: string,
  field: string,
  valueMember = 'Value',
  displayMember = 'Name'
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListForEntityAndField(http, entity, field),
      byIdFunc: id =>
        api.selectByValueForEntityAndField(http, entity, field)(id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

const createGenericAutocomplete = (
  http: HttpClient,
  api: MetaLookupApi,
  lookupId: string
): LookupDescriptor => {
  return {
    type: 'autocomplete',
    store: {
      listFunc: () => api.autoCompleteForLookup(http, lookupId),
    } as AutocompleteStoreDescriptor,
  } as LookupDescriptor;
};

const createGenericAutocompleteWithParam = (
  http: HttpClient,
  api: MetaLookupApi,
  lookupId: string
): LookupCreator => {
  return (param): LookupDescriptor => {
    return {
      type: 'autocomplete',
      store: {
        listFunc: () =>
          api.autoCompleteForLookupWithParam(http, lookupId, param),
      } as AutocompleteStoreDescriptor,
    };
  };
};

const createGenericStateLookup = (
  http: HttpClient,
  api: MetaProcessingstateApi,
  entity: string,
  valueMember = 'State',
  displayMember = 'Name'
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListForEntity(http, entity),
      byIdFunc: id => api.selectByStateForEntity(http, entity)(id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

const createGenericAllowedStateLookup = (
  http: HttpClient,
  api: MetaProcessingstateApi,
  entity: string,
  valueMember = 'State',
  displayMember = 'Name'
): LookupCreator => {
  return param => {
    return {
      type: 'lookup',
      store: {
        listFunc: () =>
          api.selectListAllowedForEntityAndIds(
            http,
            entity,
            Array.isArray(param) ? param : [param]
          ),
        byIdFunc: id => api.selectByStateForEntity(http, entity)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    };
  };
};

const createGenericLookupByIdentifier = (
  http: HttpClient,
  api: MetaLookupApi,
  lookupIdentifier: string,
  valueMember: string,
  displayMember: string
): LookupDescriptor => {
  return {
    type: 'lookup',
    store: {
      listFunc: () =>
        api.selectListForLookupIdentifier(http, lookupIdentifier),
      byIdFunc: id =>
        api.selectByIdForLookupIdentifier(http, lookupIdentifier)(id),
    } as LookupStoreDescriptor,
    valueMember: valueMember,
    displayMember: displayMember,
  } as LookupDescriptor;
};

export abstract class LookupService extends WithDestroy() {

  public abstract lookups$: Observable<Record<
      string,
      LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
    >|undefined>;

  public abstract getGenericLookupByIdentifier$: Observable<((
      identifier: string,
      valueExpr: string,
      displayExpr: string
    ) => LookupDescriptor | undefined)|undefined>;

  public abstract requestLookups(request :LookupRequest[]): void;
}
