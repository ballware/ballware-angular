import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EditItemLivecycle, Readonly, StringValue, Visible } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';
import { CommonModule } from '@angular/common';
import { DxPopupModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { TextOptions, ValueType } from '@ballware/meta-model';
import { I18NextModule } from 'angular-i18next';
import { BarcodeScannerComponent } from '../components/barcodescanner/barcodescanner.component';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-text',
    templateUrl: './text.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextModule, DxPopupModule, DxTextBoxModule, DxValidatorModule, BarcodeScannerComponent],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible]
})
export class EditLayoutTextComponent implements OnInit {

  public allowScanner = false;
  public showScanner = false;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
     @Inject(RESPONSIVE_SERVICE) private readonly responsiveService: ResponsiveService,
    private destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: StringValue,
    public validation: Validation) {

    this.fullscreenDialogs$ = this.responsiveService.onResize$.pipe(
      takeUntilDestroyed(this.destroy),
      map((screenSize) => screenSize <= SCREEN_SIZE.SM)
    );
  }

  ngOnInit(): void {

    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        if (layoutItem.type === 'mail') {
          this.validation.validateEmail(true);
        }

        this.allowScanner = (layoutItem.options?.itemoptions as TextOptions)?.allowScanner ?? false;
      }
    });
  }

  readonly onScannerClicked = () => {
    this.showScanner = true;
  }

  readonly onScannerValueChanged = (value: ValueType) => {

    this.value.value = value as string;
    this.showScanner = false;
  }

  readonly onScannerHidden = () => {
    this.showScanner = false;
  }

  readonly onScannerCancel = () => {
    this.showScanner = false;
  }
}
