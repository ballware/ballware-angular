import { APP_INITIALIZER, Component, LOCALE_ID, OnChanges, Provider } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { CrudContainerOptions, CrudItem, EntityGridOptions, GridLayout, PageLayout, PageLayoutItem, PageLayoutItemOptions, TabItemOptions } from "@ballware/meta-model";
import { CrudService, EditService, FunctionIdentifier, IdentityService, LookupService, MetaService, MetaServiceFactory, PageService, SettingsService, TenantService } from "@ballware/meta-services";
import { Meta, Story, moduleMetadata } from "@storybook/angular";
import { I18NEXT_SERVICE, I18NextModule, ITranslationService } from 'angular-i18next';
import { of } from "rxjs";

import { CommonModule } from "@angular/common";
import { ResourceLanguage } from "i18next";

import { PageModule } from '.';

import * as TypeMoq from 'typemoq';
import { EditModule } from "../edit";

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

const layout = {
  toolbaritems: [],
  items: [
    {
      type: 'tabs',
      options: {
        height: undefined
      },
      items: [
        { 
          type: 'tab', 
          options: { 
            itemoptions: { 
              caption: 'Tab with DataGrid' 
            } as TabItemOptions 
          } as PageLayoutItemOptions, 
          items: [
          {
            type: 'crudcontainer', 
            options: {
              itemoptions: {
                entity: 'Textentity',
                query: 'testquery'
              } as CrudContainerOptions
            } as PageLayoutItemOptions,
            items: [
              {
                type: 'grid',
                options: {
                  itemoptions: {
                    layout: 'primary'                  
                  } as EntityGridOptions
                }                
              }
            ]
          }] 
        },
        { 
          type: 'tab', 
          options: { 
            itemoptions: { 
              caption: 'Tab 2' 
            } as TabItemOptions 
          } as PageLayoutItemOptions 
        }
      ]
    } as PageLayoutItem
  ]
} as PageLayout;

@Component({
  template: '<ballware-page></ballware-page>',  
})
class PageHostComponent implements OnChanges {

  ngOnChanges() {
    console.log('ngOnChanges');
  }
}

const getGridLayout = (identifier: string) => {

  console.log(`Asking for grid layout ${identifier}`);

  switch (identifier) {
    case 'primary': {
      return {} as GridLayout;
    }
  }

  return undefined;
}

const functionAllowed = (identifier: string, data: CrudItem) => {

  return false;
};

const functionExecute = (button: FunctionIdentifier, editLayoutIdentifier: string, data: CrudItem, target: Element) => {

};

const lookupServiceMock = TypeMoq.Mock.ofType<LookupService>(undefined, TypeMoq.MockBehavior.Strict);
const metaServiceMock = TypeMoq.Mock.ofType<MetaService>(undefined, TypeMoq.MockBehavior.Strict);
const crudServiceMock = TypeMoq.Mock.ofType<CrudService>(undefined, TypeMoq.MockBehavior.Strict);
const pageServiceMock = TypeMoq.Mock.ofType<PageService>(undefined);
const editServiceMock = TypeMoq.Mock.ofType<EditService>(undefined);
const metaServiceFactoryMock = TypeMoq.Mock.ofType<MetaServiceFactory>(undefined);

metaServiceFactoryMock.setup(x => x.createLookupService()).returns(() => lookupServiceMock.object);
metaServiceFactoryMock.setup(x => x.createMetaService(TypeMoq.It.isAny())).returns(() => metaServiceMock.object);
metaServiceFactoryMock.setup(x => x.createCrudService(TypeMoq.It.isAny())).returns(() => crudServiceMock.object);
metaServiceFactoryMock.setup(x => x.createPageService(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => pageServiceMock.object);
metaServiceFactoryMock.setup(x => x.createEditService(TypeMoq.It.isAny())).returns(() => editServiceMock.object);

lookupServiceMock.setup(x => x.setIdentifier(TypeMoq.It.isAny()));
lookupServiceMock.setup(x => x.ngOnDestroy());
lookupServiceMock.setup(x => x.lookups$).returns(() => of({}));

metaServiceMock.setup(x => x.headParams$).returns(() => of({}));
metaServiceMock.setup(x => x.displayName$).returns(() => of('Entity display name'));
metaServiceMock.setup(x => x.setIdentifier(TypeMoq.It.isAny()));
metaServiceMock.setup(x => x.setEntity(TypeMoq.It.isAny()));
metaServiceMock.setup(x => x.setInitialCustomParam(TypeMoq.It.isAny()));
metaServiceMock.setup(x => x.setHeadParams(TypeMoq.It.isValue({})));
metaServiceMock.setup(x => x.entityDocuments$).returns(() => of([]));
metaServiceMock.setup(x => x.getGridLayout$).returns(() => of(getGridLayout));
metaServiceMock.setup(x => x.editorEntered$).returns(() => of(undefined));
metaServiceMock.setup(x => x.editorValueChanged$).returns(() => of(undefined));
metaServiceMock.setup(x => x.editFunction$).returns(() => of(undefined));
metaServiceMock.setup(x => x.customFunctionAllowed$).returns(() => of(undefined));
metaServiceMock.setup(x => x.ngOnDestroy());

crudServiceMock.setup(x => x.currentInteractionTarget$).returns(() => of(undefined));
crudServiceMock.setup(x => x.itemDialog$).returns(() => of(undefined));
crudServiceMock.setup(x => x.removeDialog$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectActionSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectAddSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.selectPrintSheet$).returns(() => of(undefined));
crudServiceMock.setup(x => x.addMenuItems$).returns(() => of([]));
crudServiceMock.setup(x => x.exportMenuItems$).returns(() => of([]));
crudServiceMock.setup(x => x.importMenuItems$).returns(() => of([]));
crudServiceMock.setup(x => x.headCustomFunctions$).returns(() => of([]));
crudServiceMock.setup(x => x.fetchedItems$).returns(() => of([]));
crudServiceMock.setup(x => x.functionAllowed$).returns(() => of(functionAllowed));
crudServiceMock.setup(x => x.functionExecute$).returns(() => of(functionExecute));
crudServiceMock.setup(x => x.setIdentifier(TypeMoq.It.isAny()));
crudServiceMock.setup(x => x.setQuery(TypeMoq.It.isAny()));
crudServiceMock.setup(x => x.reload());
crudServiceMock.setup(x => x.ngOnDestroy());

pageServiceMock.setup(x => x.initialized$).returns(() => of(true));
pageServiceMock.setup(x => x.title$).returns(() => of('Page title'));
pageServiceMock.setup(x => x.headParams$).returns(() => of({}));
pageServiceMock.setup(x => x.customParam$).returns(() => of({}));
pageServiceMock.setup(x => x.layout$).returns(() => of(layout));

editServiceMock.setup(x => x.ngOnDestroy());

export default {
  title: 'Page',
  component: PageHostComponent,
  argTypes: {
  },
  parameters: {
    angularRouter: { active: '/page/testpage', route: '' }
  },
  decorators: [
    moduleMetadata({
      declarations: [
        PageHostComponent
      ],
      imports: [
        RouterTestingModule,
        CommonModule,
        PageModule,
        EditModule,
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
          provide: IdentityService, useValue: {}
        } as Provider,
        {
          provide: TenantService, useValue: {}
        },
        {
          provide: PageService,
          useValue: pageServiceMock.object
        }
      ]
    })
  ]
} as Meta;



export const Primary: Story = (args) => ({
  props: {
    datetimeValue: new Date(args['datetimeValue'])
  }
});
