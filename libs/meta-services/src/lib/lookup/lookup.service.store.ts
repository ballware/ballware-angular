import { Injectable } from "@angular/core";
import { AutocompleteCreator, AutocompleteStoreDescriptor, LookupCreator, LookupDescriptor, LookupRequest, LookupService, LookupStoreDescriptor } from "../lookup.service";
import { Observable, combineLatest, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IdentityApiService, IdentityRoleApi, IdentityUserApi, MetaApiService, MetaLookupApi, MetaPickvalueApi, MetaProcessingstateApi } from "@ballware/meta-api";
import { LookupStore } from "./lookup.store";

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
export class LookupServiceStore extends LookupService {
    
    constructor(private lookupStore: LookupStore, private httpClient: HttpClient, private identityApiService: IdentityApiService, private metaApiService: MetaApiService) {
        super();
    }

    public get lookups$() {
        return this.lookupStore.lookups$;
    }

    public get getGenericLookupByIdentifier$() {
        return this.metaApiService.metaLookupApiFactory$
            .pipe(map((metaLookupApiFactory) => (metaLookupApiFactory)
                ? (identifier, valueExpr, displayExpr) => createGenericLookupByIdentifier(this.httpClient, metaLookupApiFactory(), identifier, valueExpr, displayExpr)
                : undefined
            )) as Observable<(((
                identifier: string,
                valueExpr: string,
                displayExpr: string
              ) => LookupDescriptor) | undefined)|undefined>;
    }
    
    public requestLookups(request :LookupRequest[]) {
        combineLatest([
            of(request),
            this.identityApiService.identityUserApiFactory$,
            this.identityApiService.identityRoleApiFactory$,
            this.metaApiService.metaLookupApiFactory$,
            this.metaApiService.metaPickvalueApiFactory$,
            this.metaApiService.metaProcessingstateApiFactory$
          ]).pipe(map(([requests, userApiFactory, roleApiFactory, lookupApiFactory, pickvalueApiFactory, processingstateApiFactory]) => {
              if (requests) {
                const newLookups = {} as Record<
                  string,
                  | LookupDescriptor
                  | LookupCreator
                  | AutocompleteCreator
                  | Array<unknown>
                >;
      
                newLookups['userLookup'] = createUserLookup(this.httpClient, userApiFactory(), 'id', 'name');
                newLookups['roleLookup'] = createRoleLookup(this.httpClient, roleApiFactory(), 'id', 'name');
      
                requests?.forEach(l => {
                  switch (l.type) {
                    case 'lookup':
                      if (l.identifier && l.lookupId && l.valueMember && l.displayMember) {
                        newLookups[l.identifier] = createGenericLookup(
                          this.httpClient,
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
                          this.httpClient,
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
                        this.httpClient,
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
                          this.httpClient,
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
                          this.httpClient,
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
                        this.httpClient,
                        processingstateApiFactory(),
                        l.entity as string,
                        l.valueMember,
                        l.displayMember
                      );
                      break;
                    case 'stateallowed':
                      newLookups[l.identifier] = createGenericAllowedStateLookup(
                        this.httpClient,
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
            }))
            .subscribe((lookups) => {
                this.lookupStore.updateLookups(lookups);
            });
    }
}