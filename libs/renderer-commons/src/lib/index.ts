import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { SPEECHRECOGNITION_SERVICE, DefaultSpeechRecognitionService } from './speech-recognition';
import { Translator, TRANSLATOR } from '@ballware/meta-services';

export * from './directives';
export * from './speech-recognition';

export function provideRendererCommonsServices(): EnvironmentProviders {
  return makeEnvironmentProviders(    
    [ 
      {
        provide: SPEECHRECOGNITION_SERVICE,
        useFactory: (translator: Translator) => new DefaultSpeechRecognitionService(translator),
        deps: [
          TRANSLATOR
        ]
      },
    ]);
}