import { Observable } from 'rxjs';

export abstract class SettingsService {

  public abstract version$: Observable<string>;
  public abstract googlekey$: Observable<string>;

  public abstract identityIssuer$: Observable<string>;
  public abstract identityClientId$: Observable<string>;
  public abstract identityScopes$: Observable<string>;

  public abstract identityTenantClaim$: Observable<string>;
  public abstract identityUsernameClaim$: Observable<string>;

  public abstract identityProfileUrl$: Observable<string>;
}
