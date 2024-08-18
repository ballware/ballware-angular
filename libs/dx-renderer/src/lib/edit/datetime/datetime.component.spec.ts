import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mock } from 'moq.ts';

import { EditLayoutDatetimeComponent } from './datetime.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, EditService, TRANSLATOR } from '@ballware/meta-services';
import { BehaviorSubject } from 'rxjs';
import { EditLayoutItem } from '@ballware/meta-model';

describe('EditLayoutBoolComponent', () => {
  let component: EditLayoutDatetimeComponent;
  let fixture: ComponentFixture<EditLayoutDatetimeComponent>;
  
  const mockedEditService = new Mock<EditService>();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutDatetimeComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.object()
        } as Provider,
        {
          provide: TRANSLATOR,
          useValue: (identifier: string) => identifier
        } as Provider 
      ]
    })
    .compileComponents();
  });

  it('should create with lifecycle', () => {
    fixture = TestBed.createComponent(EditLayoutDatetimeComponent);

    const editorPreparing = jest.fn();
    const editorInitialized = jest.fn();

    mockedEditService
        .setup(instance => instance.editorPreparing$).returns(new BehaviorSubject(editorPreparing))
        .setup(instance => instance.editorInitialized$).returns(new BehaviorSubject(editorInitialized));

    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();
       
    expect(editorPreparing).toBeCalledTimes(1);
    expect(editorPreparing).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(editorInitialized).toBeCalledTimes(1);
    expect(editorInitialized).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));
    
  });
});
