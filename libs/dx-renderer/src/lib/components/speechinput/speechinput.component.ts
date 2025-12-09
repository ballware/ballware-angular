import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ValueType } from "@ballware/meta-model";
import {
  SpeechRecognitionService,
  SPEECHRECOGNITION_SERVICE,
} from '@ballware/renderer-commons';
import { DxButtonModule, DxTextAreaModule } from "devextreme-angular";
import { Observable } from "rxjs";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-speechinput',
    templateUrl: './speechinput.component.html',
    styleUrls: ['./speechinput.component.scss'],
    imports: [CommonModule, DxButtonModule, DxTextAreaModule]
})
export class SpeechInputComponent implements OnDestroy, OnChanges {

    @Input() enabled!: boolean;
    @Input() width: string|undefined;
    @Input() height: string|undefined;

    @Output() valueChange = new EventEmitter<ValueType|undefined>();
    @Output() availableChange = new EventEmitter<boolean>();

    public recognizedValue$: Observable<string>;

    constructor(
      @Inject(SPEECHRECOGNITION_SERVICE) private readonly speechRecognitionService: SpeechRecognitionService,
      private readonly destroy: DestroyRef) {
        this.recognizedValue$ = this.speechRecognitionService.text$.pipe(
          takeUntilDestroyed(this.destroy)
        );

        this.recognizedValue$.pipe(
          takeUntilDestroyed(this.destroy)
        ).subscribe((recognizedText) => {
            if (recognizedText) {
                this.valueChange.emit(recognizedText);
                this.enabled = false;
            }
        });

        this.availableChange.emit(this.speechRecognitionService.available);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['enabled']) {
            this.enabled = changes['enabled'].currentValue;

            if (this.enabled) {
                this.speechRecognitionService.start();
            }
        }
    }

    ngOnDestroy(): void {
        this.speechRecognitionService.stop();
    }

    get icon() {
        return this.enabled ? 'bi bi-mic' : 'bi bi-mic-mute';
    }

    onClick() {

        this.enabled = !this.enabled;
        if (this.enabled) {
            this.speechRecognitionService.start();
        } else {
            this.speechRecognitionService.stop();
        }
    }
}
