import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { WithVisible } from './withvisible';

@Component({
  selector: 'ballware-edit-visible-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditVisibleTestComponent extends WithVisible(WithEditItemLifecycle(WithDestroy())) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  constructor(
    @Inject(EDIT_SERVICE) private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initVisible(layoutItem);

            this.layoutItem = layoutItem;
          }
        });
    }
  }
}

describe('WithVisible', () => {
  let component: EditVisibleTestComponent;
  let fixture: ComponentFixture<EditVisibleTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditVisibleTestComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create with value', () => {
    fixture = TestBed.createComponent(EditVisibleTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            visible: true
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;

    fixture.detectChanges();

    expect(component.getOption('visible')).toBe(true);

    component.setVisible(false);

    expect(component.getOption('visible')).toBe(false);
  });
});
