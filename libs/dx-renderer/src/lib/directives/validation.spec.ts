import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { firstValueFrom } from 'rxjs';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { EditItemLivecycle } from '@ballware/renderer-commons';
import { Validation } from './validation';
import { Required } from './required';

@Component({
    selector: 'ballware-edit-validation-test',
    template: '',
    styleUrls: [],
    imports: [],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Validation, Required]
})
class EditValidationTestComponent {

  constructor(
    public livecycle: EditItemLivecycle,
    public validation: Validation) {
  }
}

describe('Validation', () => {
  let component: EditValidationTestComponent;
  let fixture: ComponentFixture<EditValidationTestComponent>;

  const mockedTranslator = jest.fn();
  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditValidationTestComponent ],
      providers: [
        {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider
      ]
    })
    .compileComponents();
  });

  it('should create without validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const validationRules$ = component.validation.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([]);
    }
  });

  it('should create with required validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            required: true
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const validationRules$ = component.validation.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([{
          type: "required"
        }]);
    }
  });

  it('should create with email validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    component.validation.validateEmail(true);
    fixture.detectChanges();

    const validationRules$ = component.validation.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([{
          type: "email"
        }]);
    }
  });
});
