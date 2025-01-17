import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ValueType } from "@ballware/meta-model";
import { BarcodeFormat, Result } from "@zxing/library";
import { ZXingScannerComponent, ZXingScannerModule } from "@zxing/ngx-scanner";
import { I18NextModule } from "angular-i18next";
import { DxButtonModule, DxSelectBoxModule, DxToolbarModule } from "devextreme-angular";
import { SelectionChangedEvent } from "devextreme/ui/select_box";

@Component({
    selector: 'ballware-barcodescanner',
    templateUrl: './barcodescanner.component.html',
    styleUrls: ['./barcodescanner.component.scss'],
    imports: [CommonModule, I18NextModule, DxToolbarModule, DxSelectBoxModule, DxButtonModule, ZXingScannerModule],
    standalone: true
})
export class BarcodeScannerComponent implements OnDestroy, OnChanges {
    
    @ViewChild('scanner', { static: false }) scanner?: ZXingScannerComponent;

    @Input() enabled!: boolean;
    @Input() width: string|undefined;
    @Input() height: string|undefined;
    
    @Output() valueChange = new EventEmitter<ValueType>();
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['enabled']) {
            this.enabled = changes['enabled'].currentValue;
        }
    }

    ngOnDestroy(): void {
        if (this.scanner) {
            this.scanner.torch = false;
            this.scanner.enable = false;
        }
    }

    public devices: Array<MediaDeviceInfo> = [];
    public activeDevice: MediaDeviceInfo|undefined = undefined;
    public torchCompatible = false;
    public torchEnabled = false;

    public autofocusEnabled = false;

    public allowedFormats = [
        BarcodeFormat.AZTEC, 
        BarcodeFormat.CODABAR,        
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODE_128,        
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_8,
        BarcodeFormat.EAN_13,        
        BarcodeFormat.ITF,
        BarcodeFormat.MAXICODE,
        BarcodeFormat.PDF_417,
        BarcodeFormat.QR_CODE, 
        BarcodeFormat.RSS_14, 
        BarcodeFormat.RSS_EXPANDED,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.UPC_EAN_EXTENSION,
    ];

    public onTorchCompatible(value: boolean) {
        console.log(`onTorchCompatible: ${value}`);
        this.torchCompatible = value;
        this.torchEnabled = false;        
    }

    public onTorchClicked() {        
        this.torchEnabled = !this.torchEnabled;
    }

    public onAutofocusClicked() {        
        this.autofocusEnabled = !this.autofocusEnabled;
    }

    public onCamerasFound(devices: Array<MediaDeviceInfo>) {
        console.log('onCamerasFound', devices);
        this.devices = devices;
    }

    public onCamerasNotFound() {
        console.log('onCamerasNotFound');
    }

    public onDeviceChange(device: MediaDeviceInfo) {
        if (this.activeDevice !== device) {
            this.activeDevice = device;
        }
    }
    
    public onScanError(error: Error) {
        console.log(`onScanError: ${error}`);
    }

    public onScanComplete(result: Result) {
        if (result) {
            console.log(`onScanComplete: ${result}`);
            this.valueChange.emit(result.getText());
        }
    }
}