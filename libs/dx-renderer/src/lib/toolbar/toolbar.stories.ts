import { APP_INITIALIZER, Component, Input, LOCALE_ID, OnChanges, Provider } from '@angular/core';
import { PageLayout, PageToolbarItem, ValueType } from '@ballware/meta-model';

import { AutocompleteCreator, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, PageService, ToolbarItemRef } from '@ballware/meta-services';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { I18NextModule, I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { DxButtonModule, DxDateBoxModule, DxDropDownButtonModule, DxSelectBoxModule, DxTagBoxModule, DxToolbarModule } from 'devextreme-angular';
import { BehaviorSubject, of } from 'rxjs';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ToolbarButtonComponent } from './button/button.component';
import { ToolbarDatetimeComponent } from './datetime/datetime.component';
import { ToolbarLookupComponent } from './lookup/lookup.component';
import { ToolbarMultilookupComponent } from './multilookup/multilookup.component';
import { ToolbarStaticlookupComponent } from './staticlookup/staticlookup.component';
import { ToolbarDropdownbuttonComponent } from './dropdownbutton/dropdownbutton.component';
import { ResourceLanguage } from 'i18next';

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

const lookupValues = [
  { id: '1', text: 'first' },
  { id: '2', text: 'second' },
  { id: '3', text: 'third' }
]

class MockedPageService {
  public toolbarItems = {} as Record<string, ToolbarItemRef>;
  public layout$ = new BehaviorSubject<PageLayout|undefined>({
    documentationEntity: 'testentity',
    toolbaritems: [
      { type: 'lookup', name: 'lookup', caption: 'Lookup', lookup: 'mylookup' } as PageToolbarItem,
      { type: 'multilookup', name: 'multilookup', caption: 'Multi-Lookup', lookup: 'mylookup' } as PageToolbarItem,
      { type: 'staticlookup', name: 'staticlookup', caption: 'Static-Lookup', defaultValue: '1', options: {
        items: [
          { value: '1', text: 'first' },
          { value: '2', text: 'second' },
          { value: '3', text: 'third' },
        ]
      } } as PageToolbarItem,
      { type: 'datetime', name: 'datetime', width: '200px', caption: 'Von' } as PageToolbarItem,
      { type: 'button', name: 'button', caption: 'Button' } as PageToolbarItem,
      { type: 'dropdownbutton', name: 'dropdownbutton', caption: 'Dropdown Button', defaultValue: '0', options: {
        items: [
          { id: '1', text: 'first' },
          { id: '2', text: 'second' },
          { id: '3', text: 'third' },
        ]
      } } as PageToolbarItem,
    ],
    items: []
  } as PageLayout);

  public paramEditorInitialized(name: string, item: ToolbarItemRef) {
    this.toolbarItems[name] = item;
    console.log(`paramEditorInitialized ${name}`);
  }

  public paramEditorDestroyed(name: string) {
    console.log(`paramEditorDestroyed ${name}`);
  }

  public paramEditorValueChanged(name: string, value: ValueType) {
    console.log(`paramEditorValueChanged ${name} to ${value}`);
  }

  public paramEditorEvent(name: string, event: string, param: ValueType) {
    console.log(`paramEditorEvent ${name} emitted ${event} with param ${param ?? 'none'}`);
  }
}

@Component({
  selector: 'ballware-toolbar-story',
  template: '<ballware-toolbar></ballware-toolbar>',
  providers: [
    {
      provide: PageService, useValue: new MockedPageService()
    }]
})
class ToolbarHostComponent implements OnChanges {

  @Input() datetimeValue: Date|null = null;

  constructor(private pageService: PageService) {

  }

  ngOnChanges() {
    console.log('ngOnChanges');
    ((this.pageService as unknown as MockedPageService).toolbarItems['datetime'] as ToolbarItemRef).setOption('value', this.datetimeValue);
  }
}


export default {
  title: 'Toolbar',
  component: ToolbarHostComponent,
  argTypes: {
    datetimeValue: {
      control: { type: 'date' }
    }
  },
  parameters: {
    angularRouter: { active: '/page/testpage', route: '' }
  },
  decorators: [
    moduleMetadata({
      declarations: [
        ToolbarComponent,
        ToolbarButtonComponent,
        ToolbarDatetimeComponent,
        ToolbarLookupComponent,
        ToolbarMultilookupComponent,
        ToolbarStaticlookupComponent,
        ToolbarDropdownbuttonComponent
      ],
      imports: [
        I18NextModule.forRoot(),
        DxButtonModule,
        DxDateBoxModule,
        DxSelectBoxModule,
        DxTagBoxModule,
        DxDropDownButtonModule,
        DxToolbarModule
      ],
      providers: [
        I18N_PROVIDERS,
        {
          provide: LookupService, useValue: {
            lookups$: new BehaviorSubject<Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>|undefined>({
              mylookup: {
                type: 'lookup',
                store: {
                  listFunc: () => of(lookupValues),
                  byIdFunc: (id) => of(lookupValues.find(v => v.id === id))
                } as LookupStoreDescriptor,
                displayMember: 'text',
                valueMember: 'id'
              } as LookupDescriptor
            } as Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>)
          }
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

Primary.args = {
  datetimeValue: new Date()
}
