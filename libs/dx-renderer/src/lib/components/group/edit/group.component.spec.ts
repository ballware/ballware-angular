import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLayoutGroupComponent } from './group.component';
import { EditLayoutItem } from '@ballware/meta-model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideDefaultItemRegistries } from '../../../registries';

describe('EditLayoutGroupComponent', () => {
  let component: EditLayoutGroupComponent;
  let fixture: ComponentFixture<EditLayoutGroupComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideDefaultItemRegistries()
      ],
      imports: [EditLayoutGroupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLayoutGroupComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display caption from initialLayoutItem options', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group Caption'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const headerElement = debugElement.query(By.css('.dx-fieldset-header'));
    expect(headerElement).toBeTruthy();
    expect(headerElement.nativeElement.textContent.trim()).toBe('Test Group Caption');
  });

  it('should render without caption when not specified', () => {
    const layoutItem = {
      type: 'group',
      options: {}
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const headerElement = debugElement.query(By.css('.dx-fieldset-header'));
    expect(headerElement).toBeTruthy();
    expect(headerElement.nativeElement.textContent.trim()).toBe('');
  });

  it('should render without caption when options not specified', () => {
    const layoutItem = {
      type: 'group'
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const headerElement = debugElement.query(By.css('.dx-fieldset-header'));
    expect(headerElement).toBeTruthy();
    expect(headerElement.nativeElement.textContent.trim()).toBe('');
  });

  it('should pass colCount to edit container', () => {
    const layoutItem = {
      type: 'group',
      colCount: 3,
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const containerElement = debugElement.query(By.css('ballware-edit-container'));
    expect(containerElement).toBeTruthy();
    expect(containerElement.componentInstance.colCount).toBe(3);
  });

  it('should use default colCount of 1 when not specified', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const containerElement = debugElement.query(By.css('ballware-edit-container'));
    expect(containerElement).toBeTruthy();
    expect(containerElement.componentInstance.colCount).toBe(1);
  });

  it('should pass items to edit container', () => {
    const childItems = [
      { type: 'text', options: { dataMember: 'field1' } },
      { type: 'text', options: { dataMember: 'field2' } }
    ] as EditLayoutItem[];

    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      },
      items: childItems
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const containerElement = debugElement.query(By.css('ballware-edit-container'));
    expect(containerElement).toBeTruthy();
    expect(containerElement.componentInstance.items).toEqual(childItems);
  });

  it('should pass empty array to edit container when items not specified', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const containerElement = debugElement.query(By.css('ballware-edit-container'));
    expect(containerElement).toBeTruthy();
    expect(containerElement.componentInstance.items).toEqual([]);
  });

  it('should have correct CSS classes', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const fieldsetElement = debugElement.query(By.css('.dx-fieldset'));
    expect(fieldsetElement).toBeTruthy();

    const headerElement = debugElement.query(By.css('.dx-fieldset-header'));
    expect(headerElement).toBeTruthy();
  });

  it('should render edit container inside fieldset', () => {
    const layoutItem = {
      type: 'group',
      options: {
        caption: 'Test Group'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const fieldsetElement = debugElement.query(By.css('.dx-fieldset'));
    const containerElement = fieldsetElement.query(By.css('ballware-edit-container'));

    expect(containerElement).toBeTruthy();
  });

  it('should match snapshot', () => {
    const layoutItem = {
      type: 'group',
      colCount: 2,
      options: {
        caption: 'Test Group Snapshot'
      },
      items: [
        { type: 'text', options: { dataMember: 'field1', caption: 'Field 1' } },
        { type: 'text', options: { dataMember: 'field2', caption: 'Field 2' } }
      ]
    } as EditLayoutItem;

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});

