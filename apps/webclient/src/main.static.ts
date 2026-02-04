import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.static';
import { AppComponent } from './app/app.component';

(async () => {
  await bootstrapApplication(AppComponent, config);
})();
