import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { ValueType } from "@ballware/meta-model";
import { Destroy, SpeechRecognitionService, SPEECHRECOGNITION_SERVICE } from "@ballware/renderer-commons";
import { I18NextModule } from "angular-i18next";
import { DxButtonModule, DxTextAreaModule } from "devextreme-angular";
import { ClickEvent } from "devextreme/ui/button";
import { Observable, takeUntil } from "rxjs";

@Component({
    selector: 'ballware-speechinput',
    templateUrl: './speechinput.component.html',
    styleUrls: ['./speechinput.component.scss'],
    imports: [CommonModule, I18NextModule, DxButtonModule, DxTextAreaModule],
    hostDirectives: [Destroy],
    standalone: true
})
export class SpeechInputComponent implements OnDestroy, OnChanges {
        
    @Input() enabled!: boolean;
    @Input() width: string|undefined;
    @Input() height: string|undefined;
    
    @Output() valueChange = new EventEmitter<ValueType|undefined>();
    @Output() availableChange = new EventEmitter<boolean>();
    
    public recognizedValue$: Observable<string>;

    constructor(@Inject(SPEECHRECOGNITION_SERVICE) private readonly speechRecognitionService: SpeechRecognitionService, destroy: Destroy) {      
        this.recognizedValue$ = this.speechRecognitionService.text$
            .pipe(takeUntil(destroy.destroy$));
            
        this.recognizedValue$
            .pipe(takeUntil(destroy.destroy$))
            .subscribe((recognizedText) => {
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

    onClick(event: ClickEvent) {
        
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.speechRecognitionService.start();
        } else {
            this.speechRecognitionService.stop();
        }
    }
}