import { APP_INITIALIZER, Component, LOCALE_ID, OnChanges, Provider } from "@angular/core";
import { CrudContainerOptions, PageLayout, PageLayoutItem, PageLayoutItemOptions, QueryParams, TabItemOptions } from "@ballware/meta-model";
import { AuthService, AutocompleteCreator, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, PageService, SettingsService, TenantService } from "@ballware/meta-services";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { I18NextModule, I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { BehaviorSubject } from "rxjs";

import { PageLayoutComponent } from './layout/layout.component';
import { PageLayoutItemComponent } from './layout/item.component';
import { HttpClient } from "@angular/common/http";
import { IdentityApiService, MetaApiService, DefaultIdentityApiService, DefaultMetaApiService } from "@ballware/meta-api";
import { ResourceLanguage } from "i18next";

function appInit(i18next: ITranslationService) {
  return () => i18next.init({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'de',
      debug: true,
      returnEmptyString: false,
      resources: {
        en: {} as ResourceLanguage,
        de: {
          "translations": {
            "format": {
                "date": "dd.MM.yyyy",
                "datetime": "dd.MM.yyyy HH:mm:ss"
            },
          }
        } as ResourceLanguage
      },
      defaultNS: 'translations',
      ns: [
        'translations'
      ],
    });
}

function localeIdFactory(i18next: ITranslationService)  {
  return i18next.language;
}

const I18N_PROVIDERS = [
{
  provide: APP_INITIALIZER,
  useFactory: appInit,
  deps: [I18NEXT_SERVICE],
  multi: true
},
{
  provide: LOCALE_ID,
  deps: [I18NEXT_SERVICE],
  useFactory: localeIdFactory
}];

class MockedPageService {
  public customParam$ = new BehaviorSubject<Record<string, unknown>>({});
  public headParams$ = new BehaviorSubject<QueryParams>({});
  public layout$ = new BehaviorSubject<PageLayout|undefined>({
    items: [
      {
        type: 'tabs',
        items: [
          { type: 'tab', options: { itemoptions: { caption: 'Tab 1' } as TabItemOptions } as PageLayoutItemOptions, items: [
            {
              type: 'crudcontainer', options: {
                itemoptions: {
                  entity: 'Textentity',
                  query: 'testquery'
                } as CrudContainerOptions
              } as PageLayoutItemOptions
            }
          ] },
          { type: 'tab', options: { itemoptions: { caption: 'Tab 2' } as TabItemOptions } as PageLayoutItemOptions }
        ]
      } as PageLayoutItem
    ]
  });
}

@Component({
  template: '<ballware-page-layout></ballware-page-layout>',
  providers: [
    {
      provide: LookupService, useValue: {
        lookups$: new BehaviorSubject<Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>|undefined>({
          /*
          mylookup: {
            type: 'lookup',
            store: {
              listFunc: () => of(lookupValues),
              byIdFunc: (id) => of(lookupValues.find(v => v.id === id))
            } as LookupStoreDescriptor,
            displayMember: 'text',
            valueMember: 'id'
          } as LookupDescriptor
          */
        } as Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>)
      }
    } as Provider,
    {
      provide: PageService, useValue: new MockedPageService()
    } as Provider
  ]
})
class PageLayoutHostComponent implements OnChanges {

  ngOnChanges() {
    console.log('ngOnChanges');
  }
}

export default {
  title: 'Page',
  component: PageLayoutHostComponent,
  argTypes: {
  },
  parameters: {
    angularRouter: { active: '/page/testpage', route: '' }
  },
  decorators: [
    moduleMetadata({
      declarations: [
        PageLayoutComponent,
        PageLayoutItemComponent
      ],
      imports: [
        I18NextModule.forRoot(),
      ],
      providers: [
        I18N_PROVIDERS,
        {
          provide: SettingsService, useValue: {}
        } as Provider,
        {
          provide: AuthService, useValue: {}
        } as Provider,
        {
          provide: TenantService, useValue: {}
        },
        {
          provide: HttpClient, useValue: {}
        } as Provider,
        {
          provide: MetaApiService, useValue: new DefaultMetaApiService('/', '/')
        } as Provider,
        {
          provide: IdentityApiService, useValue: new DefaultIdentityApiService('/')
        } as Provider
      ]
    })
  ]
} as Meta;

export const Primary: Story = (args) => ({
  props: {
    datetimeValue: new Date(args['datetimeValue'])
  }
});
