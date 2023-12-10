import { APP_INITIALIZER, Component, LOCALE_ID, OnChanges, Provider } from "@angular/core";
import { CrudContainerOptions, PageLayout, PageLayoutItem, PageLayoutItemOptions, QueryParams, TabItemOptions } from "@ballware/meta-model";
import { AuthService, MetaServiceFactory, PageService, SettingsService, TenantService, MetaService, LookupService, CrudService } from "@ballware/meta-services";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { I18NextModule, I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { BehaviorSubject, of } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { ResourceLanguage } from "i18next";
import { CommonModule } from "@angular/common";

import { PageModule } from './page.module';

import * as TypeMoq from 'typemoq';

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
})
class PageLayoutHostComponent implements OnChanges {

  ngOnChanges() {
    console.log('ngOnChanges');
  }
}

const lookupServiceMock = TypeMoq.Mock.ofType<LookupService>(undefined, TypeMoq.MockBehavior.Strict);
const metaServiceMock = TypeMoq.Mock.ofType<MetaService>(undefined, TypeMoq.MockBehavior.Strict);
const crudServiceMock = TypeMoq.Mock.ofType<CrudService>(undefined, TypeMoq.MockBehavior.Strict);
const metaServiceFactoryMock = TypeMoq.Mock.ofType<MetaServiceFactory>(undefined, TypeMoq.MockBehavior.Strict);

metaServiceFactoryMock.setup(x => x.createLookupService()).returns(() => lookupServiceMock.object);
metaServiceFactoryMock.setup(x => x.createMetaService(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => metaServiceMock.object);
metaServiceFactoryMock.setup(x => x.createCrudService(TypeMoq.It.isAny())).returns(() => crudServiceMock.object);

metaServiceMock.setup(x => x.headParams$).returns(() => of({}));
metaServiceMock.setup(x => x.displayName$).returns(() => of('Entity display name'));
metaServiceMock.setup(x => x.setEntity(TypeMoq.It.isAny()));
metaServiceMock.setup(x => x.setInitialCustomParam(TypeMoq.It.isAny()));
metaServiceMock.setup(x => x.setHeadParams(TypeMoq.It.isValue({})));

crudServiceMock.setup(x => x.itemDialog$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectActionSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectAddSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectPrintSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.setQuery(TypeMoq.It.isAny()));
crudServiceMock.setup(x => x.reload());

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
        PageLayoutHostComponent
      ],
      imports: [
        CommonModule,
        PageModule,
        I18NextModule.forRoot(),
      ],
      providers: [
        I18N_PROVIDERS,
        {
          provide: SettingsService, useValue: {}
        } as Provider,
        {
          provide: MetaServiceFactory,
          useValue: metaServiceFactoryMock.object
        } as Provider,
        {
          provide: AuthService, useValue: {}
        } as Provider,
        {
          provide: TenantService, useValue: {}
        },
        {
          provide: PageService, useValue: new MockedPageService()
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
