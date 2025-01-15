import { Component, Inject, OnInit } from '@angular/core';
import { map, Observable, takeUntil } from 'rxjs';
import { Destroy, EditItemLivecycle, Readonly, StringValue, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';
import { CommonModule } from '@angular/common';
import { DxPopupModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { TextOptions, ValueType } from '@ballware/meta-model';
import { I18NextModule } from 'angular-i18next';
import { BarcodeScannerComponent } from '../components/barcodescanner/barcodescanner.component';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';

@Component({
  selector: 'ballware-edit-text',
  templateUrl: './text.component.html',
  styleUrls: [],
  imports: [CommonModule, I18NextModule, DxPopupModule, DxTextBoxModule, DxValidatorModule, BarcodeScannerComponent],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutTextComponent implements OnInit {
  
  public allowScanner = false;
  public showScanner = false;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
     @Inject(RESPONSIVE_SERVICE) private readonly responsiveService: ResponsiveService,
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: StringValue,
    public validation: Validation) {

    this.fullscreenDialogs$ = this.responsiveService.onResize$
          .pipe(takeUntil(this.destroy.destroy$))
          .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));

    this.onScannerClicked = this.onScannerClicked.bind(this);
    this.onScannerCancel = this.onScannerCancel.bind(this);
  }

  ngOnInit(): void {
        
    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          if (layoutItem.type === 'mail') {
            this.validation.validateEmail(true);
          }

          this.allowScanner =  (layoutItem.options?.itemoptions as TextOptions)?.allowScanner ?? false;
        }
      });    
  }

  public onScannerClicked() {
    this.showScanner = true;
  }

  public onScannerValueChanged(value: ValueType) {

    this.value.value = value as string;
    this.showScanner = false;
  }

  public onScannerHidden() {
    this.showScanner = false;
  }

  public onScannerCancel() {
    this.showScanner = false;
  }
}
