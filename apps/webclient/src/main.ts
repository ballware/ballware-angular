import { isDevMode, NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.browser';
import { AppComponent } from './app/app.component';

declare let window :any;

(async () => {
  if (isDevMode() && window.ENV.NG_TRACING === 1) {
    const { runWithTracing } = await import('./dev-tools');
    await runWithTracing(async () => {
      const appRef = await bootstrapApplication(AppComponent, config);
      if (isDevMode()) {
        const { installAngularProbes } = await import('./dev-tools');
        const ngZone = appRef.injector.get(NgZone);
        installAngularProbes(appRef, ngZone);
      }
    });
    return;
  }

  await bootstrapApplication(AppComponent, config);
})();
