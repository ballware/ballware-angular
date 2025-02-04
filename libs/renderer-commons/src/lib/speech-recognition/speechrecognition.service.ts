import { Inject, InjectionToken } from "@angular/core";
import { Translator, TRANSLATOR } from "@ballware/meta-services";
import { filter, fromEvent, map, Observable, scan, Subject, Subscription, tap } from "rxjs";
import { JQueryStyleEventEmitter } from "rxjs/internal/observable/fromEvent";

declare let window :any;

interface SpeechRecognitionInfo {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

type Transcript = Omit<SpeechRecognitionInfo, 'isFinal' | 'confidence'> & { confidencePercentage: string };

interface SpeechRecognitionApi extends JQueryStyleEventEmitter<any, unknown> {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;

  start(): void;
  stop(): void;
  abort(): void;
}

const recognitionAvailable = () => {
  return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
}

const createRecognition = (locale: string) => {
  const recognition = ('webkitSpeechRecognition' in window ? new window.webkitSpeechRecognition() as SpeechRecognitionApi : null)
    || ('SpeechRecognition' in window ? new window.SpeechRecognition() as SpeechRecognitionApi : null);

  if (recognition) {
      recognition.interimResults = true;
      recognition.lang = locale;
  }

  return recognition;
};

const createWordListObservable = (recognition: SpeechRecognitionApi) => {
  if (recognition) {
      const percent = 100;
      return fromEvent(recognition, 'result').pipe(
          map((e: any): SpeechRecognitionInfo => {
          const transcript = Array.from(e.results)
              .map((result: any) => result[0].transcript)
              .join('');

          const firstResult = e.results[0];
  
          return {
              transcript: transcript,
              confidence: firstResult[0].confidence,
              isFinal: firstResult.isFinal,
          };
          }),
          filter(({ isFinal }) => isFinal),
          scan(
          (acc: Transcript[], { transcript, confidence }) =>
              acc.concat({
              transcript,
              confidencePercentage: (confidence * percent).toFixed(2),
              }),
          [],
          ),
      );
  }

  return new Subject<Transcript[]>();
  
};


export interface SpeechRecognitionService {

    text$: Observable<string>;

    available: boolean;

    start(): void;
    stop(): void;
}

export class DefaultSpeechRecognitionService implements SpeechRecognitionService {

  get available(): boolean {
    return this._available;
  }

  get text$(): Observable<string> {
    return this._text$.asObservable();
  }

  readonly start = () => {
    if (this._recognition) {
      this.stop();
    }

    this._recognition = createRecognition(this._locale);

    if (this._recognition) {
      this._textSubscription = createWordListObservable(this._recognition)       
        .pipe(map((result) => result.map(ts => ts.transcript).join(" ")))
        .pipe(tap((result) => {
          console.log("Recognized text", result);
        }))
        .subscribe((result) => this._text$.next(result));

      this._recognition.start();
    }
  }

  readonly stop = () => {
    this._textSubscription?.unsubscribe();
    this._recognition?.abort();

    this._textSubscription = null;
    this._recognition = null;

    this._text$.next('');
  }

  private _recognition: SpeechRecognitionApi|null = null;
  private _textSubscription: Subscription|null = null;
  private readonly _locale: string;
  private readonly _available: boolean;
  private readonly _text$: Subject<string>;
  
  constructor(@Inject(TRANSLATOR) translator: Translator) {
    this._locale = translator('locale');
    this._available = recognitionAvailable();
    this._text$ = new Subject<string>();
  }
}

export const SPEECHRECOGNITION_SERVICE = new InjectionToken<SpeechRecognitionService>('Speech recognition service');