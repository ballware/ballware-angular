import {
  IdentityRoleApi,
  IdentityUserApi,
  MetaDocumentApi,
  MetaDocumentationApi,
  MetaEntityApi,
  MetaLookupApi,
  MetaMlModelApi,
  MetaNotificationApi,
  MetaPageApi,
  MetaPickvalueApi,
  MetaProcessingstateApi,
  MetaStatisticApi,
  MetaSubscriptionApi,
  MetaTenantApi,
  SelectableMetaApi
} from '@ballware/meta-api';
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import { distinctUntilChanged, of, takeUntil, withLatestFrom } from "rxjs";
import { lookupDestroyed, lookupUpdated } from "../component";
import { AutocompleteCreator, AutocompleteStoreDescriptor, LookupCreator, LookupDescriptor, LookupRequest, LookupService, LookupStoreDescriptor, PickvalueCreator } from "@ballware/meta-services";
import { LookupState } from "./lookup.state";

const createMetaLookup = (
    api: SelectableMetaApi,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectList(),
        byIdFunc: id => api.selectById(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };

const createMetaEntityIdentifierLookup = (
    api: MetaEntityApi,
    valueMember: string,
    displayMember: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectList(),
        byIdFunc: id => api.selectByIdentifier(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };

const createMetaEntityRightLookup = (
    api: MetaEntityApi,
    valueMember = 'Id',
    displayMember = 'DisplayName'
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.rightSelectList(),
        byIdFunc: id => api.rightSelectById(id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };

const createMetaEntityStateLookup = (
    api: MetaProcessingstateApi,
    valueMember = 'State',
    displayMember = 'Name'
  ): LookupCreator => (param) => {
    return {
      type: 'lookup',
      store: {
        listFunc: () => api.selectListForEntity(Array.isArray(param) ? param[0] : param),
        byIdFunc: id => api.selectByStateForEntity(Array.isArray(param) ? param[0] : param, id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };

const createMetaEntityPickvalueLookup = (
  api: MetaPickvalueApi,
  valueMember = '',
  displayMember = ''
): PickvalueCreator => (entity, field) => {

  return {
    type: 'lookup',
    store: {
      listFunc: () => api.selectListForEntityAndField(entity, field),
      byIdFunc: id => api.selectByValueForEntityAndField(entity, field, id),
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
        byIdFunc: id => api.selectByIdForLookup(lookupId, id),
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
            api.selectByIdForLookupWithParam(lookupId, param, id),
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
          api.selectByValueForEntityAndField(entity, field, id),
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
        byIdFunc: id => api.selectByStateForEntity(entity, id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };

const createMetaAllowedStateLookup = (
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
            api.selectListMetaAllowedForEntityAndIds(
              entity,
              Array.isArray(param) ? param : [param]
            ),
          byIdFunc: id => api.selectByStateForEntity(entity, id),
        } as LookupStoreDescriptor,
        valueMember: valueMember,
        displayMember: displayMember,
      };
    };
  };

const createTenantAllowedStateLookup = (
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
            api.selectListTenantAllowedForEntityAndIds(
              entity,
              Array.isArray(param) ? param : [param]
            ),
          byIdFunc: id => api.selectByStateForEntity(entity, id),
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
          api.selectByIdForLookupIdentifier(lookupIdentifier, id),
      } as LookupStoreDescriptor,
      valueMember: valueMember,
      displayMember: displayMember,
    } as LookupDescriptor;
  };


export class LookupStore extends ComponentStore<LookupState> implements LookupService {
    constructor(private store: Store,
      private readonly userApi: IdentityUserApi,
      private readonly roleApi: IdentityRoleApi,
      private readonly documentApi: MetaDocumentApi,
      private readonly documentationApi: MetaDocumentationApi,
      private readonly entityApi: MetaEntityApi,
      private readonly mlmodelApi: MetaMlModelApi,
      private readonly notificationApi: MetaNotificationApi,
      private readonly pageApi: MetaPageApi,
      private readonly statisticApi: MetaStatisticApi,
      private readonly subscriptionApi: MetaSubscriptionApi,
      private readonly tenantApi: MetaTenantApi,
      private readonly lookupApi: MetaLookupApi,
      private readonly pickvalueApi: MetaPickvalueApi,
      private readonly processingstateApi: MetaProcessingstateApi) {
        super({
            state: 'init',
        });

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
    readonly ready$ = this.select(state => state.state === 'loaded');
    readonly lookups$ = this.select(state => state.lookups);

    readonly getGenericLookupByIdentifier$ = of((identifier: string, valueExpr: string, displayExpr: string) => createGenericLookupByIdentifier(this.lookupApi, identifier, valueExpr, displayExpr));

    readonly setIdentifier = this.updater((state: LookupState, identifier: string) => ({
      ...state,
      identifier,
    }))

  readonly init = ({ lookups }: { lookups: LookupRequest[] }) => {

      this.patchState({
        state: 'loading'
      })

      const newLookups = {} as Record<
          string,
          | LookupDescriptor
          | LookupCreator
          | PickvalueCreator
          | AutocompleteCreator
          | Array<unknown>
      >;

      newLookups['userLookup'] = createMetaLookup(this.userApi, 'id', 'name');
      newLookups['roleLookup'] = createMetaLookup(this.roleApi, 'id', 'name');
      newLookups['documentLookup'] = createMetaLookup(this.documentApi, 'Id', 'Name');
      newLookups['documentationLookup'] = createMetaLookup(this.documentationApi, 'Id', 'Name');
      newLookups['entityLookup'] = createMetaLookup(this.entityApi, 'Id', 'Name');
      newLookups['lookupLookup'] = createMetaLookup(this.lookupApi, 'Id', 'Name');
      newLookups['mlmodelLookup'] = createMetaLookup(this.mlmodelApi, 'Id', 'Name');
      newLookups['notificationLookup'] = createMetaLookup(this.notificationApi, 'Id', 'Name');
      newLookups['pageLookup'] = createMetaLookup(this.pageApi, 'Id', 'Name');
      newLookups['processingstateLookup'] = createMetaLookup(this.processingstateApi, 'Id', 'Name');
      newLookups['statisticLookup'] = createMetaLookup(this.statisticApi, 'Id', 'Name');
      newLookups['subscriptionLookup'] = createMetaLookup(this.subscriptionApi, 'Id', 'Name');
      newLookups['tenantLookup'] = createMetaLookup(this.tenantApi, 'Id', 'Name');

      newLookups['entityIdentifierLookup'] = createMetaEntityIdentifierLookup(this.entityApi, 'Entity', 'Name');
      newLookups['entityRightLookup'] = createMetaEntityRightLookup(this.entityApi);
      newLookups['entityStateLookup'] = createMetaEntityStateLookup(this.processingstateApi);
      newLookups['entityPickvalueLookup'] = createMetaEntityPickvalueLookup(this.pickvalueApi);

      lookups?.forEach(l => {
          switch (l.type) {
          case 'lookup':
              if (l.identifier && l.lookupId && l.valueMember && l.displayMember) {
              newLookups[l.identifier] = createGenericLookup(
                  this.lookupApi,
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
                    this.lookupApi,
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
                this.pickvalueApi,
                l.entity as string,
                l.field as string,
                l.valueMember,
                l.displayMember
              );
              break;
          case 'autocomplete':
              if (l.lookupId) {
                newLookups[l.identifier] = createGenericAutocomplete(
                    this.lookupApi,
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
                  this.lookupApi,
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
                this.processingstateApi,
                l.entity as string,
                l.valueMember,
                l.displayMember
              );
              break;
          case 'metastateallowed':
              newLookups[l.identifier] = createMetaAllowedStateLookup(
                this.processingstateApi,
                l.entity as string,
                l.valueMember,
                l.displayMember
              );
              break;
          case 'tenantstateallowed':
              newLookups[l.identifier] = createTenantAllowedStateLookup(
                this.processingstateApi,
                l.entity as string,
                l.valueMember,
                l.displayMember
              );
              break;
          }
      });

      this.patchState({
        state: 'loaded',
        lookups: newLookups
      });
    }
}
