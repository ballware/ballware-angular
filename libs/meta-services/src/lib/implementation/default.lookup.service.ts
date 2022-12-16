import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { IdentityApiService, IdentityRoleApi, IdentityUserApi, MetaApiService } from '@ballware/meta-api';
import { MetaLookupApi, MetaPickvalueApi, MetaProcessingstateApi } from '@ballware/meta-api';
import { AutocompleteCreator, AutocompleteStoreDescriptor, LookupCreator, LookupDescriptor, LookupRequest, LookupService, LookupStoreDescriptor } from '../lookup.service';

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

@Injectable()
export class DefaultLookupService extends LookupService {

  private _lookupRequest$ = new BehaviorSubject<Array<LookupRequest>|undefined>(undefined);

  public lookups$: Observable<Record<
      string,
      LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
    >|undefined>;

  public getGenericLookupByIdentifier$: Observable<((
      identifier: string,
      valueExpr: string,
      displayExpr: string
    ) => LookupDescriptor | undefined)|undefined>;

  constructor(private httpClient: HttpClient, private identityApiService: IdentityApiService, private metaApiService: MetaApiService) {
    super();

    this.getGenericLookupByIdentifier$ = combineLatest([metaApiService.metaLookupApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([metaLookupApiFactory]) => (metaLookupApiFactory)
        ? (identifier, valueExpr, displayExpr) => createGenericLookupByIdentifier(this.httpClient, metaLookupApiFactory(), identifier, valueExpr, displayExpr)
        : undefined
      ));

    this.lookups$ = combineLatest([
      this._lookupRequest$,
      this.identityApiService.identityUserApiFactory$,
      this.identityApiService.identityRoleApiFactory$,
      this.metaApiService.metaLookupApiFactory$,
      this.metaApiService.metaPickvalueApiFactory$,
      this.metaApiService.metaProcessingstateApiFactory$
    ])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([requests, userApiFactory, roleApiFactory, lookupApiFactory, pickvalueApiFactory, processingstateApiFactory]) => {
        if (requests) {
          const newLookups = {} as Record<
            string,
            | LookupDescriptor
            | LookupCreator
            | AutocompleteCreator
            | Array<unknown>
          >;

          newLookups['userLookup'] = createUserLookup(httpClient, userApiFactory(), 'id', 'name');
          newLookups['roleLookup'] = createRoleLookup(httpClient, roleApiFactory(), 'id', 'name');

          requests?.forEach(l => {
            switch (l.type) {
              case 'lookup':
                if (l.identifier && l.lookupId && l.valueMember && l.displayMember) {
                  newLookups[l.identifier] = createGenericLookup(
                    httpClient,
                    lookupApiFactory(),
                    l.lookupId,
                    l.valueMember,
                    l.displayMember
                  );
                } else {
                  console.error(
                    `Missing params for lookup type 'lookup': lookupId: ${l.lookupId}, valueMember: ${l.valueMember}, displayMember: ${l.displayMember}`
                  );
                }
                break;
              case 'lookupwithparam':
                if (l.identifier && l.lookupId && l.valueMember && l.displayMember) {
                  newLookups[l.identifier] = createGenericLookupWithParam(
                    httpClient,
                    lookupApiFactory(),
                    l.lookupId,
                    l.valueMember,
                    l.displayMember
                  );
                } else {
                  console.error(
                    `Missing params for lookup type 'lookupwithparam': lookupId: ${l.lookupId}, valueMember: ${l.valueMember}, displayMember: ${l.displayMember}`
                  );
                }
                break;
              case 'pickvalue':
                newLookups[l.identifier] = createGenericPickvalueLookup(
                  httpClient,
                  pickvalueApiFactory(),
                  l.entity as string,
                  l.field as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
              case 'autocomplete':
                if (l.lookupId) {
                  newLookups[l.identifier] = createGenericAutocomplete(
                    httpClient,
                    lookupApiFactory(),
                    l.lookupId
                  );
                } else {
                  console.error(
                    `Missing params for lookup type 'autocomplete': lookupId: ${l.lookupId}`
                  );
                }
                break;
              case 'autocompletewithparam':
                if (l.lookupId) {
                  newLookups[l.identifier] = createGenericAutocompleteWithParam(
                    httpClient,
                    lookupApiFactory(),
                    l.lookupId
                  );
                } else {
                  console.error(
                    `Missing params for lookup type 'autocompletewithparam': lookupId: ${l.lookupId}`
                  );
                }
                break;
              case 'state':
                newLookups[l.identifier] = createGenericStateLookup(
                  httpClient,
                  processingstateApiFactory(),
                  l.entity as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
              case 'stateallowed':
                newLookups[l.identifier] = createGenericAllowedStateLookup(
                  httpClient,
                  processingstateApiFactory(),
                  l.entity as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
            }
          });

          return newLookups;
        } else {
          return undefined;
        }
      }));
  }

  public requestLookups(request: LookupRequest[]): void {
    this._lookupRequest$.next(request);
  }
}
