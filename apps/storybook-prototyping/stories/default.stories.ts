import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { from, of } from 'rxjs';

import { provideStore } from '@ngrx/store';

import { fetchEntity, fetchGeneric, fetchPage } from '@storybook-helpers/prototyping';

import { provideCommonMetaServices } from '@ballware/common-meta-services';
import { provideDxRenderFactoryComponents, PageComponent } from '@ballware/dx-renderer';
import { provideRendererCommonsServices } from '@ballware/renderer-commons';
import { provideNgrxMetaServices, provideNgrxStaticUserIdentityService } from '@ballware/ngrx-meta-services';
import {
  GENERIC_ENTITY_API_FACTORY, GenericEntityApi,
  IDENTITY_ROLE_API,
  IDENTITY_USER_API,
  META_DOCUMENT_API, META_DOCUMENTATION_API, META_ENTITY_API, META_LOOKUP_API,
  META_MLMODEL_API, META_NOTIFICATION_API,
  META_PAGE_API, META_PICKVALUE_API, META_PROCESSINGSTATE_API, META_STATISTIC_API,
  META_SUBSCRIPTION_API, META_TENANT_API, MetaDocumentApi, MetaEntityApi, MetaPageApi, MetaTenantApi
} from '@ballware/meta-api';

import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  CompiledTenant,
  NavigationLayout,
  NavigationLayoutItem,
} from '@ballware/meta-model';

const meta: Meta<PageComponent> = {
  title: 'Fake component',
  component: PageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: META_DOCUMENT_API,
          useValue: {
            selectList: () => {
              return of([]);
            },
            selectById: (id) => {
              return of({});
            },
            selectListDocumentsForEntity: (identifier) => {
              return of([]);
            },
            designerUrl: (token, documentId) => {
              return of('fake_url');
            },
            viewerUrl: (token, documentId, ids) => {
              return of('fake_url');
            },
            updateDatasources: (ids) => {
              return of();
            }
          } as MetaDocumentApi
        },
        {
          provide: META_DOCUMENTATION_API,
          useValue: {}
        },
        {
          provide: META_ENTITY_API,
          useValue: {
            selectList: () => {
              return of([]);
            },
            selectById: (id: string) => {
              return of({});
            },
            selectByIdentifier: (id: string) => {
              return of({});
            },
            rightSelectList: () => {
              return of([]);
            },
            rightSelectById: (id: string) => {
              return of({});
            },
            metadataForEntity: (identifier: string) => {
              return from(fetchEntity(identifier));
            }
          } as MetaEntityApi
        },
        {
          provide: META_NOTIFICATION_API,
          useValue: {}
        },
        {
          provide: META_SUBSCRIPTION_API,
          useValue: {}
        },
        {
          provide: META_MLMODEL_API,
          useValue: {}
        },
        {
          provide: META_PAGE_API,
          useValue: {
            selectList: () => {
              return of([]);
            },
            selectById: (id: string) => {
              return of({});
            },
            pageDataForIdentifier: (identifier: string) => {
              return from(fetchPage(identifier));
            }
          } as MetaPageApi
        },
        {
          provide: META_LOOKUP_API,
          useValue: {}
        },
        {
          provide: META_PICKVALUE_API,
          useValue: {}
        },
        {
          provide: META_PROCESSINGSTATE_API,
          useValue: {}
        },
        {
          provide: META_STATISTIC_API,
          useValue: {}
        },
        {
          provide: META_TENANT_API,
          useValue: {
            allowed: () => {
              return of([]);
            },
            selectList: () => {
              return of([]);
            },
            selectById: (tenantId: string) => {
              return of({});
            },
            metadataForTenant: (tenantId: string) => {
              return of({
                id: tenantId,
                name: 'Mocked Tenant',
                navigation: {
                  title: 'Mocked Tenant',
                  items: [
                    {
                      type: 'page',
                      options: {
                        page: 'locationPage',
                        url: 'locationpage'
                      }
                    } as NavigationLayoutItem
                  ]
                } as NavigationLayout,
                templates: [],
                hasRight: () => true
              } as CompiledTenant);
            }
          } as MetaTenantApi
        },
        {
          provide: IDENTITY_USER_API,
          useValue: {}
        },
        {
          provide: IDENTITY_ROLE_API,
          useValue: {}
        },
        {
          provide: GENERIC_ENTITY_API_FACTORY,
          useValue: (baseUrl: string) => ({
            query: (query, params) => from(fetchGeneric(baseUrl, 'query', query)),
            count: (query, params) => from(fetchGeneric(baseUrl, 'count', query)),
            byId: (functionIdentifier, id) => from(fetchGeneric(baseUrl, 'byid', `${functionIdentifier}/${id}`)),
            new: (functionIdentifier, params) => from(fetchGeneric(baseUrl, 'new', functionIdentifier)),
            save: (functionIdentifier, item) => of(),
            saveBatch: (functionIdentifier, items) => of(),
            drop: (id) => of(),
            importItems: (functionIdentifier, file) => of(),
            exportItems: (functionIdentifier, ids) => of('fake_url')
          } as GenericEntityApi)
        },
        provideStore(),
        provideStoreDevtools({
          maxAge: 25,
          logOnly: true,
          autoPause: true,
          trace: false,
          traceLimit: 75,
          connectInZone: true
        }),
        provideCommonMetaServices(),
        provideNgrxStaticUserIdentityService({}, 'static_tenant', 'static_user'),
        provideNgrxMetaServices(),
        provideRendererCommonsServices(),
        provideDxRenderFactoryComponents({
          licenseKey: (process.env['DEVEXTREME_LICENSE_KEY']) ?? ''
        })
      ],
    }),
    moduleMetadata({
      imports: [PageComponent],
    }),
  ],
};

export default meta;

type Story = StoryObj<PageComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `<ballware-page [id]="'locationpage'"></ballware-page>`
  })
};
