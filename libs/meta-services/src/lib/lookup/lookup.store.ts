import { IdentityApiService, IdentityRoleApi, IdentityUserApi, MetaApiService, MetaLookupApi, MetaPickvalueApi, MetaProcessingstateApi } from "@ballware/meta-api";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import { distinctUntilChanged, of, takeUntil, withLatestFrom } from "rxjs";
import { lookupDestroyed, lookupUpdated } from "../component";
import { AutocompleteCreator, AutocompleteStoreDescriptor, LookupCreator, LookupDescriptor, LookupRequest, LookupService, LookupStoreDescriptor } from "../lookup.service";
import { LookupState } from "./lookup.state";

const createUserLookup = (
    api: IdentityUserApi,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListFunc(),
        byIdFunc: id => api.selectByIdFunc(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };
  
const createRoleLookup = (
    api: IdentityRoleApi,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListFunc(),
        byIdFunc: id => api.selectByIdFunc(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };
  
const createGenericLookup = (
    api: MetaLookupApi,
    lookupId: string,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListForLookup(lookupId),
        byIdFunc: id => api.selectByIdForLookup(lookupId)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };
  
const createGenericLookupWithParam = (
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
            api.selectListForLookupWithParam(lookupId, param),
          byIdFunc: id =>
            api.selectByIdForLookupWithParam(lookupId, param)(id),
        } as LookupStoreDescriptor,
        valueMember: valueMember,
        displayMember: displayMember,
      };
    };
  };
  
const createGenericPickvalueLookup = (
    api: MetaPickvalueApi,
    entity: string,
    field: string,
    valueMember = 'Value',
    displayMember = 'Name'
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListForEntityAndField(entity, field),
        byIdFunc: id =>
          api.selectByValueForEntityAndField(entity, field)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };
  
const createGenericAutocomplete = (
    api: MetaLookupApi,
    lookupId: string
  ): LookupDescriptor => {
    return {
      type: 'autocomplete',
      store: {
        listFunc: () => api.autoCompleteForLookup(lookupId),
      } as AutocompleteStoreDescriptor,
    } as LookupDescriptor;
  };
  
const createGenericAutocompleteWithParam = (
    api: MetaLookupApi,
    lookupId: string
  ): LookupCreator => {
    return (param): LookupDescriptor => {
      return {
        type: 'autocomplete',
        store: {
          listFunc: () =>
            api.autoCompleteForLookupWithParam(lookupId, param),
        } as AutocompleteStoreDescriptor,
      };
    };
  };
  
const createGenericStateLookup = (
    api: MetaProcessingstateApi,
    entity: string,
    valueMember = 'State',
    displayMember = 'Name'
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListForEntity(entity),
        byIdFunc: id => api.selectByStateForEntity(entity)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };
  
const createGenericAllowedStateLookup = (
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
              entity,
              Array.isArray(param) ? param : [param]
            ),
          byIdFunc: id => api.selectByStateForEntity(entity)(id),
        } as LookupStoreDescriptor,
        valueMember: valueMember,
        displayMember: displayMember,
      };
    };
  };
  
const createGenericLookupByIdentifier = (
    api: MetaLookupApi,
    lookupIdentifier: string,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () =>
          api.selectListForLookupIdentifier(lookupIdentifier),
        byIdFunc: id =>
          api.selectByIdForLookupIdentifier(lookupIdentifier)(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };


export class LookupStore extends ComponentStore<LookupState> implements LookupService {
    constructor(private store: Store, private identityApiService: IdentityApiService, private metaApiService: MetaApiService) {
        super({});

        this.state$
          .pipe(takeUntil(this.destroy$))
          .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
          .subscribe((state) => {                
              if (state.identifier) {
                  this.store.dispatch(lookupUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
              } else {
                  console.debug('Lookup state update');
                  console.debug(state);    
              }
          });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(lookupDestroyed({ identifier: state.identifier }));
                }
            });    
    }

    readonly setIdentifier = this.updater((state, identifier: string) => ({
      ...state,
      identifier
    }));

    readonly lookups$ = this.select(state => state.lookups);

    readonly updateLookups =
        this.updater((state, lookups: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>|undefined) => ({
            ...state,
            lookups
        }));    

    readonly getGenericLookupByIdentifier$ = of((identifier: string, valueExpr: string, displayExpr: string) => createGenericLookupByIdentifier(this.metaApiService.metaLookupApi, identifier, valueExpr, displayExpr));

    readonly requestLookups = (requests :LookupRequest[]) => {
      if (requests) {
        const newLookups = {} as Record<
            string,
            | LookupDescriptor
            | LookupCreator
            | AutocompleteCreator
            | Array<unknown>
        >;

        newLookups['userLookup'] = createUserLookup(this.identityApiService.identityUserApi, 'id', 'name');
        newLookups['roleLookup'] = createRoleLookup(this.identityApiService.identityRoleApi, 'id', 'name');

        requests?.forEach(l => {
            switch (l.type) {
            case 'lookup':
                if (l.identifier && l.lookupId && l.valueMember && l.displayMember) {
                newLookups[l.identifier] = createGenericLookup(
                    this.metaApiService.metaLookupApi,
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
                      this.metaApiService.metaLookupApi,
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
                  this.metaApiService.metaPickvalueApi,
                  l.entity as string,
                  l.field as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
            case 'autocomplete':
                if (l.lookupId) {
                  newLookups[l.identifier] = createGenericAutocomplete(
                      this.metaApiService.metaLookupApi,
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
                    this.metaApiService.metaLookupApi,
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
                  this.metaApiService.metaProcessingstateApi,
                  l.entity as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
            case 'stateallowed':
                newLookups[l.identifier] = createGenericAllowedStateLookup(
                  this.metaApiService.metaProcessingstateApi,
                  l.entity as string,
                  l.valueMember,
                  l.displayMember
                );
                break;
            }
        });

          this.updateLookups(newLookups);
        } else {
          this.updateLookups(undefined);
        }
    }
        
}