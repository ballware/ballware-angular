import { Component, Inject, OnInit } from '@angular/core';
import { ApplicationComponent } from '@ballware/dx-renderer';
import { IDENTITY_SERVICE, IdentityService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { ResponsiveDetectorComponent } from './shared/components/responsive-detector/responsive-detector.component';
import { CommonModule } from '@angular/common';

declare let window :any;

@Component({
  selector: 'ballware-root',
  templateUrl: './app.component.html',
  styleUrls: [],
  imports: [CommonModule, ApplicationComponent, ResponsiveDetectorComponent],
  providers: [],
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'ballware';

  constructor(@Inject(SETTINGS_SERVICE) private settingsService: SettingsService, @Inject(IDENTITY_SERVICE) private identityService: IdentityService) {}

  ngOnInit(): void {
    console.log(`Version ${window.ENV.BALLWARE_VERSION}`);

    this.settingsService.initialize(
      window.ENV.BALLWARE_VERSION,
      window.ENV.BALLWARE_GOOGLEKEY
    );

    this.identityService.initialize(
      window.ENV.BALLWARE_IDENTITYURL,
      window.ENV.BALLWARE_CLIENTID,
      window.ENV.BALLWARE_IDENTITYSCOPES,
      window.ENV.BALLWARE_TENANTCLAIM,
      window.ENV.BALLWARE_USERNAMECLAIM,
      window.ENV.BALLWARE_ACCOUNTURL
    );
  }
}
