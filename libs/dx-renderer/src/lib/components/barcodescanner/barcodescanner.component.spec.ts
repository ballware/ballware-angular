import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeScannerComponent } from './barcodescanner.component';
import { INTERACTION_SERVICE, InteractionService } from '@ballware/meta-services';
import { Subject } from 'rxjs';
import { Result, BarcodeFormat } from '@zxing/library';
import { SimpleChange } from '@angular/core';
import { provideI18Next } from 'angular-i18next';

describe('BarcodeScannerComponent', () => {
  let component: BarcodeScannerComponent;
  let fixture: ComponentFixture<BarcodeScannerComponent>;
  let keyboardLine$: Subject<string>;
  let mockInteractionService: InteractionService;

  beforeEach(async () => {
    keyboardLine$ = new Subject<string>();

    mockInteractionService = {
      keyboardLine$: keyboardLine$.asObservable(),
      triggerKeyPress: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BarcodeScannerComponent],
      providers: [
        provideI18Next(),
        {
          provide: INTERACTION_SERVICE,
          useValue: mockInteractionService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeScannerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    keyboardLine$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.devices).toEqual([]);
      expect(component.activeDevice).toBeUndefined();
      expect(component.torchCompatible).toBe(false);
      expect(component.torchEnabled).toBe(false);
      expect(component.autofocusEnabled).toBe(false);
    });

    it('should have all supported barcode formats', () => {
      expect(component.allowedFormats).toContain(BarcodeFormat.AZTEC);
      expect(component.allowedFormats).toContain(BarcodeFormat.CODABAR);
      expect(component.allowedFormats).toContain(BarcodeFormat.CODE_39);
      expect(component.allowedFormats).toContain(BarcodeFormat.CODE_93);
      expect(component.allowedFormats).toContain(BarcodeFormat.CODE_128);
      expect(component.allowedFormats).toContain(BarcodeFormat.DATA_MATRIX);
      expect(component.allowedFormats).toContain(BarcodeFormat.EAN_8);
      expect(component.allowedFormats).toContain(BarcodeFormat.EAN_13);
      expect(component.allowedFormats).toContain(BarcodeFormat.ITF);
      expect(component.allowedFormats).toContain(BarcodeFormat.MAXICODE);
      expect(component.allowedFormats).toContain(BarcodeFormat.PDF_417);
      expect(component.allowedFormats).toContain(BarcodeFormat.QR_CODE);
      expect(component.allowedFormats).toContain(BarcodeFormat.RSS_14);
      expect(component.allowedFormats).toContain(BarcodeFormat.RSS_EXPANDED);
      expect(component.allowedFormats).toContain(BarcodeFormat.UPC_A);
      expect(component.allowedFormats).toContain(BarcodeFormat.UPC_E);
      expect(component.allowedFormats).toContain(BarcodeFormat.UPC_EAN_EXTENSION);
      expect(component.allowedFormats.length).toBe(17);
    });
  });

  describe('Input handling', () => {
    it('should update enabled state on changes', () => {
      component.ngOnChanges({
        enabled: new SimpleChange(undefined, true, true)
      });

      expect(component.enabled).toBe(true);

      component.ngOnChanges({
        enabled: new SimpleChange(true, false, false)
      });

      expect(component.enabled).toBe(false);
    });

    it('should not update if enabled is not in changes', () => {
      component.enabled = true;

      component.ngOnChanges({
        width: new SimpleChange(undefined, '100px', true)
      });

      expect(component.enabled).toBe(true);
    });
  });

  describe('Camera handling', () => {
    it('should store devices when cameras are found', () => {
      const mockDevices: MediaDeviceInfo[] = [
        { deviceId: '1', label: 'Camera 1', kind: 'videoinput', groupId: '1', toJSON: () => ({}) },
        { deviceId: '2', label: 'Camera 2', kind: 'videoinput', groupId: '2', toJSON: () => ({}) }
      ];

      component.onCamerasFound(mockDevices);

      expect(component.devices).toEqual(mockDevices);
      expect(component.devices.length).toBe(2);
    });

    it('should handle no cameras found', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      component.onCamerasNotFound();

      expect(consoleSpy).toHaveBeenCalledWith('onCamerasNotFound');
      consoleSpy.mockRestore();
    });

    it('should change active device', () => {
      const device1: MediaDeviceInfo = {
        deviceId: '1',
        label: 'Camera 1',
        kind: 'videoinput',
        groupId: '1',
        toJSON: () => ({})
      };
      const device2: MediaDeviceInfo = {
        deviceId: '2',
        label: 'Camera 2',
        kind: 'videoinput',
        groupId: '2',
        toJSON: () => ({})
      };

      component.activeDevice = device1;
      component.onDeviceChange(device2);

      expect(component.activeDevice).toBe(device2);
    });

    it('should not change active device if already selected', () => {
      const device: MediaDeviceInfo = {
        deviceId: '1',
        label: 'Camera 1',
        kind: 'videoinput',
        groupId: '1',
        toJSON: () => ({})
      };

      component.activeDevice = device;
      component.onDeviceChange(device);

      expect(component.activeDevice).toBe(device);
    });
  });

  describe('Torch handling', () => {
    it('should set torch compatibility', () => {
      component.onTorchCompatible(true);

      expect(component.torchCompatible).toBe(true);
      expect(component.torchEnabled).toBe(false);
    });

    it('should disable torch when compatibility changes', () => {
      component.torchEnabled = true;
      component.onTorchCompatible(false);

      expect(component.torchCompatible).toBe(false);
      expect(component.torchEnabled).toBe(false);
    });

    it('should toggle torch state', () => {
      component.torchEnabled = false;
      component.onTorchClicked();

      expect(component.torchEnabled).toBe(true);

      component.onTorchClicked();

      expect(component.torchEnabled).toBe(false);
    });
  });

  describe('Autofocus handling', () => {
    it('should toggle autofocus state', () => {
      component.autofocusEnabled = false;
      component.onAutofocusClicked();

      expect(component.autofocusEnabled).toBe(true);

      component.onAutofocusClicked();

      expect(component.autofocusEnabled).toBe(false);
    });
  });

  describe('Scan handling', () => {
    it('should emit value on successful scan', (done) => {
      const mockResult = {
        getText: () => '123456789'
      } as Result;

      component.valueChange.subscribe(value => {
        expect(value).toBe('123456789');
        done();
      });

      component.onScanComplete(mockResult);
    });

    it('should not emit value on null result', () => {
      const emitSpy = jest.spyOn(component.valueChange, 'emit');

      component.onScanComplete(null as any);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should log scan errors', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      const error = new Error('Scan failed');

      component.onScanError(error);

      expect(consoleSpy).toHaveBeenCalledWith(`onScanError: ${error}`);
      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard input handling', () => {
    it('should emit value on keyboard line input', (done) => {
      component.valueChange.subscribe(value => {
        expect(value).toBe('987654321');
        done();
      });

      fixture.detectChanges();
      keyboardLine$.next('987654321');
    });

    it('should not emit value on null keyboard input', () => {
      const emitSpy = jest.spyOn(component.valueChange, 'emit');

      fixture.detectChanges();
      keyboardLine$.next(null as any);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit value on empty keyboard input', () => {
      const emitSpy = jest.spyOn(component.valueChange, 'emit');

      fixture.detectChanges();
      keyboardLine$.next('');

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple keyboard inputs', () => {
      const values: string[] = [];

      component.valueChange.subscribe(value => {
        values.push(value as string);
      });

      fixture.detectChanges();
      keyboardLine$.next('first');
      keyboardLine$.next('second');
      keyboardLine$.next('third');

      expect(values).toEqual(['first', 'second', 'third']);
    });
  });

  describe('Component lifecycle', () => {
    it('should clean up scanner on destroy', () => {
      const mockScanner = {
        torch: true,
        enable: true
      } as any;

      component.scanner = mockScanner;
      component.ngOnDestroy();

      expect(mockScanner.torch).toBe(false);
      expect(mockScanner.enable).toBe(false);
    });

    it('should not throw error if scanner is undefined on destroy', () => {
      component.scanner = undefined;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should unsubscribe from keyboard line on destroy', () => {
      const emitSpy = jest.spyOn(component.valueChange, 'emit');

      fixture.detectChanges();
      fixture.destroy();
      keyboardLine$.next('after-destroy');

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete scanning workflow', (done) => {
      const mockDevices: MediaDeviceInfo[] = [
        { deviceId: '1', label: 'Camera 1', kind: 'videoinput', groupId: '1', toJSON: () => ({}) }
      ];

      const values: string[] = [];

      component.valueChange.subscribe(value => {
        values.push(value as string);

        if (values.length === 2) {
          expect(values).toEqual(['keyboard-input', 'scanned-barcode']);
          done();
        }
      });

      fixture.detectChanges();

      // Simulate camera found
      component.onCamerasFound(mockDevices);
      expect(component.devices.length).toBe(1);

      // Simulate device selection
      component.onDeviceChange(mockDevices[0]);
      expect(component.activeDevice).toBe(mockDevices[0]);

      // Simulate torch compatibility check
      component.onTorchCompatible(true);
      expect(component.torchCompatible).toBe(true);

      // Enable torch
      component.onTorchClicked();
      expect(component.torchEnabled).toBe(true);

      // Enable autofocus
      component.onAutofocusClicked();
      expect(component.autofocusEnabled).toBe(true);

      // Receive keyboard input
      keyboardLine$.next('keyboard-input');

      // Receive scan result
      const mockResult = {
        getText: () => 'scanned-barcode'
      } as Result;
      component.onScanComplete(mockResult);
    });

    it('should handle enabled state changes', () => {
      component.enabled = false;
      fixture.detectChanges();

      component.ngOnChanges({
        enabled: new SimpleChange(false, true, false)
      });

      expect(component.enabled).toBe(true);
    });

    it('should handle dimensions input', () => {
      component.width = '640px';
      component.height = '480px';
      fixture.detectChanges();

      expect(component.width).toBe('640px');
      expect(component.height).toBe('480px');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty device list', () => {
      component.onCamerasFound([]);

      expect(component.devices).toEqual([]);
      expect(component.devices.length).toBe(0);
    });

    it('should handle scan result with empty text', () => {
      const emitSpy = jest.spyOn(component.valueChange, 'emit');
      const mockResult = {
        getText: () => ''
      } as Result;

      component.onScanComplete(mockResult);

      expect(emitSpy).toHaveBeenCalledWith('');
    });

    it('should handle multiple torch toggles', () => {
      expect(component.torchEnabled).toBe(false);

      component.onTorchClicked();
      expect(component.torchEnabled).toBe(true);

      component.onTorchClicked();
      expect(component.torchEnabled).toBe(false);

      component.onTorchClicked();
      expect(component.torchEnabled).toBe(true);
    });

    it('should handle multiple autofocus toggles', () => {
      expect(component.autofocusEnabled).toBe(false);

      component.onAutofocusClicked();
      expect(component.autofocusEnabled).toBe(true);

      component.onAutofocusClicked();
      expect(component.autofocusEnabled).toBe(false);

      component.onAutofocusClicked();
      expect(component.autofocusEnabled).toBe(true);
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot with default state', () => {
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot with enabled scanner', () => {
      component.enabled = true;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot with active camera and torch', () => {
      component.enabled = true;
      component.torchCompatible = true;
      component.torchEnabled = true;
      component.autofocusEnabled = true;
      component.devices = [
        { deviceId: '1', label: 'Camera 1', kind: 'videoinput', groupId: '1', toJSON: () => ({}) }
      ];
      component.activeDevice = component.devices[0];

      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });
});

