import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxPopupModule, DxTextAreaModule, DxValidatorModule } from 'devextreme-angular';
import { EditItemLivecycle, Readonly, StringValue, Visible, SpeechRecognitionService, SPEECHRECOGNITION_SERVICE } from '@ballware/renderer-commons';
import { Required, Validation } from '../../directives';
import { map, Observable } from 'rxjs';
import { TextOptions, ValueType } from '@ballware/meta-model';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { I18NextModule } from 'angular-i18next';
import { SpeechInputComponent } from "../components/speechinput/speechinput.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-edit-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  imports: [CommonModule, I18NextModule, DxTextAreaModule, DxButtonModule, DxPopupModule, DxValidatorModule, SpeechInputComponent],
  hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue, Readonly, Validation, Required, Visible],
  standalone: true
})
export class EditLayoutTextareaComponent implements OnInit {

  public allowSpeech = false;
  public showSpeech = false;
  public speechAvailable = false;

  private temporarySpeechValue = '';

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
    @Inject(RESPONSIVE_SERVICE) private readonly responsiveService: ResponsiveService,
    @Inject(SPEECHRECOGNITION_SERVICE) private readonly speechRecognitionService: SpeechRecognitionService,
    private destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible,
    public readonly: Readonly,
    public value: StringValue,
    public validation: Validation) {
    this.speechAvailable = this.speechRecognitionService.available;

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

        this.allowSpeech =  (layoutItem.options?.itemoptions as TextOptions)?.allowSpeech ?? false;
      }
    });
  }

  readonly onSpeechClicked = () => {
    this.showSpeech = true;
  }

  readonly onSpeechHidden = () => {
    this.showSpeech = false;
  }

  readonly onSpeechCancel = () => {
    this.showSpeech = false;
  }

  readonly onSpeechApply = () => {
    this.showSpeech = false;

    this.value.value = this.temporarySpeechValue;
    this.temporarySpeechValue = '';
  }

  readonly onSpeechValueChanged = (value: ValueType) => {

    this.temporarySpeechValue = value as string;
  }
}
