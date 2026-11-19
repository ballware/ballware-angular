import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Provider, Type } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDITITEM_REGISTRY, EditItemRegistry } from '../../../registries';
import { EditLayoutItemComponent } from './item.component';

class MockEditItemRegistry implements EditItemRegistry {
  registerItemType(_identifier: string, _type: Type<unknown>): void {
    // noop
  }

  resolveItemType(_identifier: string) {
    return undefined;
  }
}

describe('EditLayoutItemComponent test identifiers', () => {
  let fixture: ComponentFixture<EditLayoutItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLayoutItemComponent],
      providers: [
        {
          provide: EDITITEM_REGISTRY,
          useFactory: () => new MockEditItemRegistry()
        } as Provider
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  const hostTestId = () =>
    (fixture.nativeElement as HTMLElement).getAttribute('data-testid');

  it('uses dataMember with index', () => {
    fixture = TestBed.createComponent(EditLayoutItemComponent);
    fixture.componentRef.setInput('layoutItem', {
      type: 'text',
      options: { dataMember: 'ORDERNR', caption: 'Order no' }
    } as EditLayoutItem);
    fixture.componentRef.setInput('itemIndex', 3);
    fixture.detectChanges();

    expect(hostTestId()).toEqual('ORDERNR-3');
  });

  it('falls back to type with index', () => {
    fixture = TestBed.createComponent(EditLayoutItemComponent);
    fixture.componentRef.setInput('layoutItem', { type: 'empty' } as EditLayoutItem);
    fixture.detectChanges();

    expect(hostTestId()).toEqual('empty-0');
  });
});
