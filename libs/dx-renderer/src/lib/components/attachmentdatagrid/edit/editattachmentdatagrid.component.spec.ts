import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutAttachmentDataGridComponent } from './editattachmentdatagrid.component';
import { Provider } from '@angular/core';
import { ATTACHMENT_SERVICE_FACTORY, AttachmentService, EDIT_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { CrudItem, EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../../test/editservice.spec';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';
import { provideI18Next } from 'angular-i18next';

describe('EditLayoutAttachmentDataGridComponent', () => {
  let component: EditLayoutAttachmentDataGridComponent;
  let fixture: ComponentFixture<EditLayoutAttachmentDataGridComponent>;

  const mockedAttachmentService = new Mock<AttachmentService>();

  mockedAttachmentService.setup(instance => instance.setIdentifier).callback(() => (identifier) => {});

  const mockedTranslator = jest.fn();
  const mockedEditService = mockedEditServiceContext();
  const mockedAttachmentServiceFactory = () => mockedAttachmentService.object();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutAttachmentDataGridComponent ],
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
          provide: ATTACHMENT_SERVICE_FACTORY,
          useValue: mockedAttachmentServiceFactory
        } as Provider
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    mockedEditService.mock.setup(instance => instance.item$).returns(new BehaviorSubject({
      Id: 'mockedId'
    } as CrudItem));

    mockedAttachmentService.setup(instance => instance.items$).returns(new BehaviorSubject([]));
    mockedAttachmentService.setup(instance => instance.removeDialog$).returns(new BehaviorSubject(undefined));

    fixture = TestBed.createComponent(EditLayoutAttachmentDataGridComponent);

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

    expect(fixture).toMatchSnapshot();
  });
});
