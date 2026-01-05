import { Component, Inject, OnInit } from '@angular/core';
import { ApplicationComponent } from '@ballware/dx-renderer';
import { SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';

import { CommonModule } from '@angular/common';
import { ENV, RuntimeEnv } from './env';

@Component({
    selector: 'ballware-root',
    templateUrl: './app.component.html',
    styleUrls: [],
    imports: [CommonModule, ApplicationComponent],
    providers: []
})
export class AppComponent implements OnInit {
  title = 'ballware';

  constructor(
    @Inject(ENV) private readonly env: RuntimeEnv,
    @Inject(SETTINGS_SERVICE) private readonly settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    console.log(`Version ${this.env.BALLWARE_VERSION}`);

    this.settingsService.initialize(
      this.env.BALLWARE_VERSION,
      this.env.BALLWARE_GOOGLEKEY
    );
  }
}
