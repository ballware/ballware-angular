import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLayoutFieldsetComponent } from './editfieldset.component';
import { EditLayoutItem } from '@ballware/meta-model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('EditLayoutFieldsetComponent', () => {
  let component: EditLayoutFieldsetComponent;
  let fixture: ComponentFixture<EditLayoutFieldsetComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLayoutFieldsetComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLayoutFieldsetComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Fieldset'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display caption from layoutItem options', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Caption'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    const labelElement = debugElement.query(By.css('.dx-field-label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Test Caption');
  });

  it('should apply height style from layoutItem options', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Fieldset',
        height: '200px'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    const fieldElement = debugElement.query(By.css('.dx-field'));
    expect(fieldElement.nativeElement.style.height).toBe('200px');

    const fieldValueElement = debugElement.query(By.css('.dx-field-value'));
    expect(fieldValueElement.nativeElement.style.height).toBe('200px');
  });

  it('should render without height when not specified', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Fieldset'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    const fieldElement = debugElement.query(By.css('.dx-field'));
    expect(fieldElement.nativeElement.style.height).toBe('');
  });

  it('should render without caption when not specified', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {}
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    const labelElement = debugElement.query(By.css('.dx-field-label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('');
  });

  it('should have correct CSS classes', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Fieldset'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    const fieldElement = debugElement.query(By.css('.dx-field'));
    expect(fieldElement).toBeTruthy();

    const labelElement = debugElement.query(By.css('.dx-field-label'));
    expect(labelElement).toBeTruthy();

    const fieldValueElement = debugElement.query(By.css('.dx-field-value'));
    expect(fieldValueElement).toBeTruthy();
    expect(fieldValueElement.nativeElement.classList.contains('flex-fill')).toBe(true);
  });

  it('should project content via ng-content', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Test Fieldset'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);

    // Create a test element to project
    const testContent = document.createElement('div');
    testContent.id = 'test-content';
    testContent.textContent = 'Projected Content';

    const fieldValueElement = debugElement.query(By.css('.dx-field-value'));
    fieldValueElement.nativeElement.appendChild(testContent);

    fixture.detectChanges();

    const projectedElement = debugElement.query(By.css('#test-content'));
    expect(projectedElement).toBeTruthy();
    expect(projectedElement.nativeElement.textContent).toBe('Projected Content');
  });

  it('should update caption when layoutItem changes', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Initial Caption'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    let labelElement = debugElement.query(By.css('.dx-field-label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Initial Caption');

    // Update layoutItem
    const updatedLayoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Updated Caption'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', updatedLayoutItem);
    fixture.detectChanges();

    labelElement = debugElement.query(By.css('.dx-field-label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Updated Caption');
  });

  it('should match snapshot', () => {
    const layoutItem = {
      type: 'fieldset',
      options: {
        caption: 'Snapshot Test Fieldset',
        height: '150px'
      }
    } as EditLayoutItem;

    fixture.componentRef.setInput('layoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});

