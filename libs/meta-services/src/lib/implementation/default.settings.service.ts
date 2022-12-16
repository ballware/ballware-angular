import { of, Observable } from 'rxjs';
import { SettingsService } from '../settings.service';

export class DefaultSettingsService extends SettingsService {

  constructor(version: string, googlekey: string, identityIssuer: string, identityClientId: string, identityScopes: string, identityTenantClaim: string, identityUsernameClaim: string, identityProfileUrl: string) {
    super();

    this.version$ = of(version);
    this.googlekey$ = of(googlekey);

    this.identityIssuer$ = of(identityIssuer);
    this.identityClientId$ = of(identityClientId);
    this.identityScopes$ = of(identityScopes);

    this.identityTenantClaim$ = of (identityTenantClaim);
    this.identityUsernameClaim$ = of(identityUsernameClaim);

    this.identityProfileUrl$ = of(identityProfileUrl);
  }

  public version$: Observable<string>;
  public googlekey$: Observable<string>;

  public identityIssuer$: Observable<string>;
  public identityClientId$: Observable<string>;
  public identityScopes$: Observable<string>;

  public identityTenantClaim$: Observable<string>;
  public identityUsernameClaim$: Observable<string>;

  public identityProfileUrl$: Observable<string>;
}
