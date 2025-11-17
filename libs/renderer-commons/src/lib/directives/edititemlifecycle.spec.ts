import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DestroyRef, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { EditItemLivecycle } from './edititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'lib-edit-lifecycle-test',
    template: '',
    styleUrls: [],
    imports: [],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }]
})
class EditLifecycleTestComponent implements OnInit {

  constructor(
    private destroy: DestroyRef,
    private livecycle: EditItemLivecycle) {
  }

  ngOnInit(): void {
    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        this.livecycle.onEntered();
        this.livecycle.onEvent('mockedevent');
      }
    });
  }
}

describe('WithEditItemLifecycle', () => {
  let component: EditLifecycleTestComponent;
  let fixture: ComponentFixture<EditLifecycleTestComponent>;

  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLifecycleTestComponent ],
      providers: [
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider
      ]
    })
    .compileComponents();
  });

  it('should create with lifecycle', () => {
    fixture = TestBed.createComponent(EditLifecycleTestComponent);

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

    expect(mockedEditService.editorPreparing).toBeCalledTimes(1);
    expect(mockedEditService.editorPreparing).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorInitialized).toBeCalledTimes(1);
    expect(mockedEditService.editorInitialized).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorEntered).toBeCalledTimes(1);
    expect(mockedEditService.editorEntered).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorEvent).toBeCalledTimes(1);
    expect(mockedEditService.editorEvent).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember', event: 'mockedevent' }));

  });
});
