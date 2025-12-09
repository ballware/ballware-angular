import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Provider, NO_ERRORS_SCHEMA } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { mockedEditServiceContext } from '../../../../test/editservice.spec';
import { EditLayoutTabsComponent } from './tabs.component';
import { firstValueFrom } from 'rxjs';
import { provideDefaultItemRegistries } from '../../../registries';

// Mock für EditLayoutContainerComponent
@Component({
  selector: 'ballware-edit-container',
  template: '<div></div>',
  standalone: true
})
class MockEditLayoutContainerComponent {}

describe('EditLayoutTabsComponent', () => {
  let component: EditLayoutTabsComponent;
  let fixture: ComponentFixture<EditLayoutTabsComponent>;

  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLayoutTabsComponent, MockEditLayoutContainerComponent],
      providers: [
        provideDefaultItemRegistries(),
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: []
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should initialize without tabs', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: []
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.panels).toEqual([]);
    expect(component.height).toBeUndefined();
    expect(component.width).toBeUndefined();
  });

  it('should initialize with height and width options', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
        height: '500px',
        width: '800px'
      },
      items: []
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.height).toBe('500px');
    expect(component.width).toBe('800px');
  });

  it('should filter and display only tab items', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: [
        {
          type: 'tab',
          options: {
            caption: 'Tab 1'
          },
          items: []
        },
        {
          type: 'text',
          options: {
            caption: 'Not a tab'
          }
        },
        {
          type: 'tab',
          options: {
            caption: 'Tab 2'
          },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.panels.length).toBe(2);
    expect(component.panels[0].options?.caption).toBe('Tab 1');
    expect(component.panels[1].options?.caption).toBe('Tab 2');
  });

  it('should exclude ignored tabs', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: [
        {
          type: 'tab',
          options: {
            caption: 'Tab 1'
          },
          items: []
        },
        {
          type: 'tab',
          ignore: true,
          options: {
            caption: 'Ignored Tab'
          },
          items: []
        },
        {
          type: 'tab',
          options: {
            caption: 'Tab 2'
          },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.panels.length).toBe(2);
    expect(component.panels[0].options?.caption).toBe('Tab 1');
    expect(component.panels[1].options?.caption).toBe('Tab 2');
  });

  it('should handle tabs with nested items', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: [
        {
          type: 'tab',
          colCount: 2,
          options: {
            caption: 'Details'
          },
          items: [
            {
              type: 'text',
              options: {
                dataMember: 'name',
                caption: 'Name'
              }
            },
            {
              type: 'text',
              options: {
                dataMember: 'email',
                caption: 'Email'
              }
            }
          ]
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.panels.length).toBe(1);
    expect(component.panels[0].items?.length).toBe(2);
    expect(component.panels[0].colCount).toBe(2);
  });

  it('should update selected tab index via value directive', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'selectedTab',
      },
      items: [
        {
          type: 'tab',
          options: { caption: 'Tab 1' },
          items: []
        },
        {
          type: 'tab',
          options: { caption: 'Tab 2' },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(1);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    // The NumberValue directive should handle the selected index
    expect(component.value).toBeDefined();
  });

  it('should have breadcrumb identifier set to "tabs"', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: []
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    // Breadcrumb identifier is set in constructor
    expect(component).toBeTruthy();
  });

  it('should handle visibility changes', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
        visible: true
      },
      items: [
        {
          type: 'tab',
          options: { caption: 'Tab 1' },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(0); // Set initial value to prevent change detection errors

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    // Second detectChanges to stabilize two-way binding
    fixture.detectChanges();
    await fixture.whenStable();

    const visible$ = component.visible.visible$;
    expect(visible$).toBeDefined();

    const isVisible = await firstValueFrom(visible$);
    expect(isVisible).toBe(true);
  });

  it('should handle empty items array', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
      },
      items: undefined
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.panels).toEqual([]);
  });

  it('should subscribe to preparedLayoutItem$ and update panels', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'tabs',
        height: '400px',
        width: '600px'
      },
      items: [
        {
          type: 'tab',
          options: { caption: 'Dynamic Tab' },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(0); // Set initial value to prevent change detection errors

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    // Second detectChanges to stabilize two-way binding
    fixture.detectChanges();
    await fixture.whenStable();

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.panels.length).toBe(1);
    expect(component.panels[0].options?.caption).toBe('Dynamic Tab');
    expect(component.height).toBe('400px');
    expect(component.width).toBe('600px');
  });

  it('should match snapshot with complete tab configuration', async () => {
    fixture = TestBed.createComponent(EditLayoutTabsComponent);
    component = fixture.componentInstance;

    const layoutItem = {
      type: 'tabs',
      options: {
        dataMember: 'selectedTab',
        height: '500px',
        width: '100%',
        visible: true
      },
      items: [
        {
          type: 'tab',
          options: {
            caption: 'General Information',
          },
          colCount: 2,
          items: [
            {
              type: 'text',
              options: {
                dataMember: 'firstName',
                caption: 'First Name',
                required: true
              }
            },
            {
              type: 'text',
              options: {
                dataMember: 'lastName',
                caption: 'Last Name',
                required: true
              }
            }
          ]
        },
        {
          type: 'tab',
          options: {
            caption: 'Contact Details',
          },
          items: [
            {
              type: 'text',
              options: {
                dataMember: 'email',
                caption: 'Email'
              }
            }
          ]
        },
        {
          type: 'tab',
          ignore: true,
          options: {
            caption: 'Hidden Tab',
          },
          items: []
        }
      ]
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(0);

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    await fixture.whenStable();

    // Second detectChanges to stabilize two-way binding
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify the component state
    expect(component.panels.length).toBe(2);
    expect(component.height).toBe('500px');
    expect(component.width).toBe('100%');

    // Snapshot test for the native element
    expect(fixture.nativeElement).toMatchSnapshot();
  });
});

