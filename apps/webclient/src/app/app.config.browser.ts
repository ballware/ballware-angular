import { ENV, RuntimeEnv } from './env';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { sharedConfig } from './app.config';

declare let window :any;

export const browserConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENV,
      useValue: window.ENV as RuntimeEnv
    }
  ]
};

export const config = mergeApplicationConfig(sharedConfig, browserConfig);
