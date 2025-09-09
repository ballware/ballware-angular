import { TestBed, fakeAsync } from '@angular/core/testing';
import { mock, instance, when } from "ts-mockito";

import { filter, firstValueFrom, of } from 'rxjs';

import { inject, Provider } from '@angular/core';
import {
  IDENTITY_ROLE_API,
  IDENTITY_USER_API,
  IdentityRoleApi,
  IdentityUserApi, META_DOCUMENT_API, META_DOCUMENTATION_API, META_ENTITY_API, META_LOOKUP_API,
  META_MLMODEL_API, META_NOTIFICATION_API, META_PAGE_API, META_PICKVALUE_API,
  META_PROCESSINGSTATE_API, META_STATISTIC_API,
  META_SUBSCRIPTION_API, META_TENANT_API, MetaDocumentApi, MetaDocumentationApi, MetaEntityApi,
  MetaLookupApi, MetaMlModelApi,
  MetaNotificationApi, MetaPageApi, MetaPickvalueApi, MetaProcessingstateApi, MetaStatisticApi, MetaSubscriptionApi,
  MetaTenantApi
} from '@ballware/meta-api';
import {
  LOOKUP_SERVICE,
  LookupCreator,
  LookupDescriptor,
  LookupRequest, LookupStoreDescriptor
} from '@ballware/meta-services';
import { LookupStore } from './lookup.store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';

describe('Lookup store', () => {

  const metaUserApiMock = mock<IdentityUserApi>();
  const metaRoleApiMock = mock<IdentityRoleApi>();
  const metaDocumentApiMock = mock<MetaDocumentApi>();
  const metaDocumentationApiMock = mock<MetaDocumentationApi>();
  const metaEntityApiMock = mock<MetaEntityApi>();
  const metaMlModelApiMock = mock<MetaMlModelApi>();
  const metaNotificationApiMock = mock<MetaNotificationApi>();
  const metaPageApiMock = mock<MetaPageApi>();
  const metaStatisticApiMock = mock<MetaStatisticApi>();
  const metaSubscriptionApiMock = mock<MetaSubscriptionApi>();
  const metaTenantApiMock = mock<MetaTenantApi>();
  const metaLookupApiMock = mock<MetaLookupApi>();
  const metaPickvalueApiMock = mock<MetaPickvalueApi>();
  const metaProcessingstateApiMock = mock<MetaProcessingstateApi>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({}),
        {
          provide: IDENTITY_USER_API,
          useFactory: () => instance(metaUserApiMock)
        } as Provider,
        {
          provide: IDENTITY_ROLE_API,
          useFactory: () => instance(metaRoleApiMock)
        } as Provider,
        {
          provide: META_DOCUMENT_API,
          useFactory: () => instance(metaDocumentApiMock)
        } as Provider,
        {
          provide: META_DOCUMENTATION_API,
          useFactory: () => instance(metaDocumentationApiMock)
        } as Provider,
        {
          provide: META_ENTITY_API,
          useFactory: () => instance(metaEntityApiMock)
        } as Provider,
        {
          provide: META_MLMODEL_API,
          useFactory: () => instance(metaMlModelApiMock)
        } as Provider,
        {
          provide: META_NOTIFICATION_API,
          useFactory: () => instance(metaNotificationApiMock)
        } as Provider,
        {
          provide: META_PAGE_API,
          useFactory: () => instance(metaPageApiMock)
        } as Provider,
        {
          provide: META_STATISTIC_API,
          useFactory: () => instance(metaStatisticApiMock)
        } as Provider,
        {
          provide: META_SUBSCRIPTION_API,
          useFactory: () => instance(metaSubscriptionApiMock)
        } as Provider,
        {
          provide: META_TENANT_API,
          useFactory: () => instance(metaTenantApiMock)
        } as Provider,
        {
          provide: META_LOOKUP_API,
          useFactory: () => instance(metaLookupApiMock)
        } as Provider,
        {
          provide: META_PICKVALUE_API,
          useFactory: () => instance(metaPickvalueApiMock)
        } as Provider,
        {
          provide: META_PROCESSINGSTATE_API,
          useFactory: () => instance(metaProcessingstateApiMock)
        } as Provider,
        {
          provide: LOOKUP_SERVICE,
          useFactory: (store: Store,
                       identityUserApi: IdentityUserApi,
                       identityRoleApi: IdentityRoleApi,
                       metaDocumentApi: MetaDocumentApi,
                       metaDocumentationApi: MetaDocumentationApi,
                       metaEntityApi: MetaEntityApi,
                       metaMlModelApi: MetaMlModelApi,
                       metaNotificationApi: MetaNotificationApi,
                       metaPageApi: MetaPageApi,
                       metaStatisticApi: MetaStatisticApi,
                       metaSubscriptionApi: MetaSubscriptionApi,
                       metaTenantApi: MetaTenantApi,
                       metaLookupApi: MetaLookupApi,
                       metaPickvalueApi: MetaPickvalueApi,
                       metaProcessingstateApi: MetaProcessingstateApi) => new LookupStore(
            store,
            identityUserApi,
            identityRoleApi,
            metaDocumentApi,
            metaDocumentationApi,
            metaEntityApi,
            metaMlModelApi,
            metaNotificationApi,
            metaPageApi,
            metaStatisticApi,
            metaSubscriptionApi,
            metaTenantApi,
            metaLookupApi,
            metaPickvalueApi,
            metaProcessingstateApi),
          deps: [
            MockStore,
            IDENTITY_USER_API,
            IDENTITY_ROLE_API,
            META_DOCUMENT_API,
            META_DOCUMENTATION_API,
            META_ENTITY_API,
            META_MLMODEL_API,
            META_NOTIFICATION_API,
            META_PAGE_API,
            META_STATISTIC_API,
            META_SUBSCRIPTION_API,
            META_TENANT_API,
            META_LOOKUP_API,
            META_PICKVALUE_API,
            META_PROCESSINGSTATE_API
          ]
        } as Provider
      ]
    })
  });

  it('should instantiate meta lookups', fakeAsync(async () => {

    await TestBed.runInInjectionContext(async () => {
      const expectedEntityStateLookupValues = [
        { id: '1', name: 'State One' },
        { id: '2', name: 'State Two' },
        { id: '3', name: 'State Three' }
      ];

      when(metaProcessingstateApiMock.selectListForEntity('fake_entity')).thenReturn(of(expectedEntityStateLookupValues));
      when(metaProcessingstateApiMock.selectByStateForEntity('fake_entity', '1')).thenReturn(of(expectedEntityStateLookupValues[0]));

      const lookupStore = inject(LOOKUP_SERVICE);

      lookupStore.init({ lookups: []});

      const state = await firstValueFrom(
        lookupStore.ready$.pipe(filter(x => x))
      );

      const lookups = await firstValueFrom(lookupStore.lookups$);

      expect(state).toBe(true);
      expect(lookups).toHaveProperty('userLookup');
      expect(lookups).toHaveProperty('roleLookup');
      expect(lookups).toHaveProperty('documentLookup');
      expect(lookups).toHaveProperty('documentationLookup');
      expect(lookups).toHaveProperty('entityLookup');
      expect(lookups).toHaveProperty('mlmodelLookup');
      expect(lookups).toHaveProperty('notificationLookup');
      expect(lookups).toHaveProperty('pageLookup');
      expect(lookups).toHaveProperty('statisticLookup');
      expect(lookups).toHaveProperty('subscriptionLookup');
      expect(lookups).toHaveProperty('tenantLookup');
      expect(lookups).toHaveProperty('lookupLookup');
      expect(lookups).toHaveProperty('entityIdentifierLookup');
      expect(lookups).toHaveProperty('entityRightLookup');
      expect(lookups).toHaveProperty('entityStateLookup');
      expect(lookups).toHaveProperty('entityPickvalueLookup');

      const entityStateLookup = lookups ? lookups['entityStateLookup'] : undefined;

      const actualEntityStateLookupValues = await firstValueFrom((entityStateLookup as LookupCreator)('fake_entity').store.listFunc());
      const actualEntityStateLookupValue = await firstValueFrom(((entityStateLookup as LookupCreator)('fake_entity').store as LookupStoreDescriptor).byIdFunc('1'));

      expect(actualEntityStateLookupValues).toEqual(expectedEntityStateLookupValues);
      expect(actualEntityStateLookupValue).toEqual(expectedEntityStateLookupValues[0]);
    });
  }));

  it('should instantiate custom lookup', fakeAsync(async () => {

    await TestBed.runInInjectionContext(async () => {
      const expectedCustomLookupValues = [
        { id: '1', name: 'One' },
        { id: '2', name: 'Two' },
        { id: '3', name: 'Three' }
      ];

      when(metaLookupApiMock.selectListForLookup('fake_lookup_id')).thenReturn(of(expectedCustomLookupValues));
      when(metaLookupApiMock.selectByIdForLookup('fake_lookup_id', '1')).thenReturn(of(expectedCustomLookupValues[0]));
      when(metaLookupApiMock.selectListForLookupWithParam('fake_lookupwithparam_id', 'paramValue')).thenReturn(of(expectedCustomLookupValues));
      when(metaLookupApiMock.selectByIdForLookupWithParam('fake_lookupwithparam_id', 'paramValue', '1')).thenReturn(of(expectedCustomLookupValues[0]));

      const lookupStore = inject(LOOKUP_SERVICE);

      lookupStore.setIdentifier("testInstance");

      lookupStore.init({ lookups: [
          {
            type: 'lookup',
            identifier: 'customLookup',
            lookupId: 'fake_lookup_id',
            valueMember: 'id',
            displayMember: 'name',
          } as LookupRequest,
          {
            type: 'lookupwithparam',
            identifier: 'customLookupWithParam',
            lookupId: 'fake_lookupwithparam_id',
            valueMember: 'id',
            displayMember: 'name',
          } as LookupRequest
        ]});

      const state = await firstValueFrom(
        lookupStore.ready$.pipe(filter(x => x))
      );

      const lookups = await firstValueFrom(lookupStore.lookups$);

      expect(state).toBe(true);

      expect(lookups).toBeTruthy();
      expect(lookups).toHaveProperty('customLookup');

      const customLookup = lookups ? lookups['customLookup'] : undefined;
      const customLookupValues = await firstValueFrom((customLookup as LookupDescriptor).store.listFunc());
      const customLookupValue = await firstValueFrom(((customLookup as LookupDescriptor).store as LookupStoreDescriptor).byIdFunc('1'));

      const customLookupWithParam = lookups ? lookups['customLookupWithParam'] : undefined;
      const customLookupValuesWithParam = await firstValueFrom((customLookupWithParam as LookupCreator)('paramValue').store.listFunc());
      const customLookupValueWithParam = await firstValueFrom(((customLookupWithParam as LookupCreator)('paramValue').store as LookupStoreDescriptor).byIdFunc('1'));

      expect(customLookupValues).toEqual(expectedCustomLookupValues);
      expect(customLookupValue).toEqual(expectedCustomLookupValues[0]);
      expect(customLookupValuesWithParam).toEqual(expectedCustomLookupValues);
      expect(customLookupValueWithParam).toEqual(expectedCustomLookupValues[0]);
    });
  }));

  it('should instantiate custom pickvalues', fakeAsync(async () => {

    await TestBed.runInInjectionContext(async () => {
      const expectedCustomPickvalueEntries = [
        { value: 1, text: 'Alpha' },
        { value: 2, text: 'Beta' },
        { value: 3, text: 'Gamma' }
      ];

      when(metaPickvalueApiMock.selectListForEntityAndField('fake_entity', 'fake_property')).thenReturn(of(expectedCustomPickvalueEntries));
      when(metaPickvalueApiMock.selectByValueForEntityAndField('fake_entity', 'fake_property', '1')).thenReturn(of(expectedCustomPickvalueEntries[0]));

      const lookupStore = inject(LOOKUP_SERVICE);

      lookupStore.setIdentifier("testInstance");
      lookupStore.init({ lookups: [
          {
            type: 'pickvalue',
            identifier: 'customPickvalues',
            entity: 'fake_entity',
            field: 'fake_property'
          } as LookupRequest,
        ]});

      const state = await firstValueFrom(
        lookupStore.ready$.pipe(filter(x => x))
      );

      const lookups = await firstValueFrom(lookupStore.lookups$);

      expect(state).toBe(true);

      expect(lookups).toBeTruthy();
      expect(lookups).toHaveProperty('customPickvalues');

      const customPickvalues = lookups ? lookups['customPickvalues'] : undefined;

      const actualPickvalueEntries = await firstValueFrom((customPickvalues as LookupDescriptor).store.listFunc());
      const actualPickvalueEntry = await firstValueFrom(((customPickvalues as LookupDescriptor).store as LookupStoreDescriptor).byIdFunc('1'));

      expect(actualPickvalueEntries).toEqual(expectedCustomPickvalueEntries);
      expect(actualPickvalueEntry).toEqual(expectedCustomPickvalueEntries[0]);
    });
  }));

  it('should instantiate custom autocomplete', fakeAsync(async () => {

    await TestBed.runInInjectionContext(async () => {
      const expectedCustomAutocompleteValues = [
        { value: 'value 1' },
        { value: 'value 2' },
        { value: 'value 3' }
      ];

      when(metaLookupApiMock.autoCompleteForLookup('fake_autocomplete_id')).thenReturn(of(expectedCustomAutocompleteValues));
      when(metaLookupApiMock.autoCompleteForLookupWithParam('fake_autocompletewithparam_id', 'paramValue')).thenReturn(of(expectedCustomAutocompleteValues));

      const lookupStore = inject(LOOKUP_SERVICE);

      lookupStore.setIdentifier("testInstance");
      lookupStore.init({ lookups: [
          {
            type: 'autocomplete',
            identifier: 'customAutocomplete',
            lookupId: 'fake_autocomplete_id'
          } as LookupRequest,
          {
            type: 'autocompletewithparam',
            identifier: 'customAutocompleteWithParam',
            lookupId: 'fake_autocompletewithparam_id'
          } as LookupRequest
        ]});

      const state = await firstValueFrom(
        lookupStore.ready$.pipe(filter(x => x))
      );

      const lookups = await firstValueFrom(lookupStore.lookups$);

      expect(state).toBe(true);

      expect(lookups).toBeTruthy();
      expect(lookups).toHaveProperty('customAutocomplete');
      expect(lookups).toHaveProperty('customAutocompleteWithParam');

      const customAutocomplete = lookups ? lookups['customAutocomplete'] : undefined;
      const customAutocompleteValues = await firstValueFrom((customAutocomplete as LookupDescriptor).store.listFunc());

      const customAutocompleteWithParam = lookups ? lookups['customAutocompleteWithParam'] : undefined;
      const customAutocompleteWithParamsValues = await firstValueFrom((customAutocompleteWithParam as LookupCreator)('paramValue').store.listFunc());

      expect(customAutocompleteValues).toEqual(expectedCustomAutocompleteValues);
      expect(customAutocompleteWithParamsValues).toEqual(expectedCustomAutocompleteValues);
    });
  }));
});
