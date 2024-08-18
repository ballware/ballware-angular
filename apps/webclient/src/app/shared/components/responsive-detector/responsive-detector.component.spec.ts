import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mock, Times } from 'moq.ts';

import { ResponsiveDetectorComponent } from './responsive-detector.component';
import { Provider } from '@angular/core';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';

describe('ResponsiveDetectorComponent', () => {
  let component: ResponsiveDetectorComponent;
  let fixture: ComponentFixture<ResponsiveDetectorComponent>;
  const svcMock = new Mock<ResponsiveService>()
    .setup(instance => instance.onResize(SCREEN_SIZE.XS)).returns(true as any);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ResponsiveDetectorComponent ],
      providers: [
        {
          provide: RESPONSIVE_SERVICE,
          useValue: svcMock.object()
        } as Provider
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsiveDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    svcMock.verify(instance => {
      instance.onResize(SCREEN_SIZE.XS)
    }, Times.Once());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
