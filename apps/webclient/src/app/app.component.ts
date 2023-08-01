import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { identityInitialize, settingsInitialize } from '@ballware/meta-services';

import { environment } from '../environments/environment';

@Component({
  selector: 'ballware-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ballware';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(settingsInitialize({ 
      version: environment.version,
      googlekey: environment.envVar.BALLWARE_GOOGLEKEY,
    }));

    this.store.dispatch(identityInitialize({      
      issuer: environment.envVar.BALLWARE_IDENTITYURL,
      client: environment.envVar.BALLWARE_CLIENTID,
      scopes: environment.envVar.BALLWARE_IDENTITYSCOPES,
      tenantClaim: environment.envVar.BALLWARE_TENANTCLAIM,
      usernameClaim: environment.envVar.BALLWARE_USERNAMECLAIM,
      profileUrl: environment.envVar.BALLWARE_ACCOUNTURL
    }));
  }
}
