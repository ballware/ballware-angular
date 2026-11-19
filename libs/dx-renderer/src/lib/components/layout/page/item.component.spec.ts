import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Provider, Type } from '@angular/core';
import { PageLayoutItem } from '@ballware/meta-model';
import { PAGEITEM_REGISTRY, PageItemRegistry } from '../../../registries';
import { PageLayoutItemComponent } from './item.component';

class MockPageItemRegistry implements PageItemRegistry {
  registerItemType(_identifier: string, _type: Type<unknown>): void {
    // noop
  }

  resolveItemType(_identifier: string) {
    return undefined;
  }
}

describe('PageLayoutItemComponent test identifiers', () => {
  let fixture: ComponentFixture<PageLayoutItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutItemComponent],
      providers: [
        {
          provide: PAGEITEM_REGISTRY,
          useFactory: () => new MockPageItemRegistry()
        } as Provider
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  const hostTestId = () =>
    (fixture.nativeElement as HTMLElement).getAttribute('data-testid');

  it('uses itemoptions identifier with index', () => {
    fixture = TestBed.createComponent(PageLayoutItemComponent);
    fixture.componentRef.setInput('layoutItem', {
      type: 'entitygrid',
      options: { itemoptions: { identifier: 'main', entity: 'demoorder' } as never }
    } as PageLayoutItem);
    fixture.componentRef.setInput('itemIndex', 1);
    fixture.detectChanges();

    expect(hostTestId()).toEqual('main-1');
  });

  it('falls back to type with index when no options given', () => {
    fixture = TestBed.createComponent(PageLayoutItemComponent);
    fixture.componentRef.setInput('layoutItem', { type: 'tabs' } as PageLayoutItem);
    fixture.detectChanges();

    expect(hostTestId()).toEqual('tabs-0');
  });

  it('sets data-test-path and data-test-identifier', () => {
    fixture = TestBed.createComponent(PageLayoutItemComponent);
    fixture.componentRef.setInput('layoutItem', {
      type: 'crudcontainer',
      options: { itemoptions: { caption: 'Order Items' } as never }
    } as PageLayoutItem);
    fixture.componentRef.setInput('itemIndex', 2);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('data-test-identifier')).toEqual('Order_Items-2');
    expect(host.getAttribute('data-test-path')).toEqual('Order_Items-2');
  });
});
