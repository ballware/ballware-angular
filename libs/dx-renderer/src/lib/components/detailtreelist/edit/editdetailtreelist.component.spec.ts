import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Provider } from '@angular/core';
import { EditLayoutDetailTreeListComponent } from './editdetailtreelist.component';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../../test/editservice.spec';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';
import { provideI18Next } from 'angular-i18next';

describe('EditLayoutDetailTreeListComponent', () => {
  let component: EditLayoutDetailTreeListComponent;
  let fixture: ComponentFixture<EditLayoutDetailTreeListComponent>;

  const mockedTranslator = jest.fn((key: string) => key);
  const mockedEditService = mockedEditServiceContext();
  const mockedLookupService = new Mock<any>()
    .setup(instance => instance.lookups$)
    .returns(new BehaviorSubject({}))
    .setup(instance => instance.getGenericLookupByIdentifier$)
    .returns(new BehaviorSubject(undefined))
    .setup(instance => instance.setIdentifier)
    .returns(jest.fn())
    .setup(instance => instance.requestLookups)
    .returns(jest.fn());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLayoutDetailTreeListComponent],
      providers: [
        provideI18Next(),
        {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider,
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => mockedLookupService.object()
        } as Provider
      ]
    }).compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should initialize with columns', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            },
            {
              dataMember: 'field2',
              caption: 'Field 2',
              type: 'number'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.editing).toBeDefined();
    expect(component.editing.options).toBeDefined();
    expect(component.editing.options?.columns).toHaveLength(2);
  });

  it('should handle hierarchical data source', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const treeData = [
      {
        field1: 'parent1',
        field2: 100,
        items: [
          { field1: 'child1', field2: 10 },
          { field1: 'child2', field2: 20 }
        ]
      },
      {
        field1: 'parent2',
        field2: 200,
        items: [
          { field1: 'child3', field2: 30 }
        ]
      }
    ];

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(treeData);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.value).toBeDefined();
  });

  it('should have readonly property', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        readonly: true,
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.readonly).toBeDefined();
  });

  it('should have visibility property', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        visible: false,
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.visible).toBeDefined();
  });

  it('should validate tree list when not editing', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const validationOptions = { value: null } as any;
    const result = component.onGridValidateNotEditing(validationOptions);

    expect(result).toBe(true);
  });

  it('should handle tree list with editing data', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    // Mock grid instance with hasEditData
    const mockValidate = jest.fn().mockReturnValue(true);
    const mockSaveEditData = jest.fn();
    const mockHasEditData = jest.fn().mockReturnValue(true);

    component.grid = {
      instance: {
        hasEditData: mockHasEditData,
        saveEditData: mockSaveEditData,
        getController: jest.fn().mockReturnValue({
          validate: mockValidate
        })
      }
    } as any;

    const validationOptions = { value: null } as any;
    const result = component.onGridValidateNotEditing(validationOptions);

    expect(mockHasEditData).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalled();
    expect(mockSaveEditData).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should configure edit operations', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          add: true,
          update: true,
          delete: true,
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);
    mockedEditService.readonly$.next(false);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.editing).toBeDefined();
    expect(component.editing.options?.add).toBe(true);
    expect(component.editing.options?.update).toBe(true);
    expect(component.editing.options?.delete).toBe(true);
  });

  it('should handle edit mode configuration', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          editMode: 'row',
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.editing.options?.editMode).toBe('row');
  });

  it('should handle instant edit mode', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          editMode: 'instant',
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue([]);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.editing.options?.editMode).toBe('instant');
  });

  it('should support tree structure configuration', () => {
    fixture = TestBed.createComponent(EditLayoutDetailTreeListComponent);

    const treeData = [
      {
        id: 1,
        field1: 'root',
        items: [
          { id: 2, field1: 'branch1', items: [] },
          { id: 3, field1: 'branch2', items: [] }
        ]
      }
    ];

    const layoutItem = {
      options: {
        dataMember: 'treeItems',
        itemoptions: {
          columns: [
            {
              dataMember: 'field1',
              caption: 'Field 1',
              type: 'string'
            }
          ]
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);
    mockedEditService.getValue.mockReturnValue(treeData);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.value).toBeDefined();
    expect(component.columns).toBeDefined();
  });
});

