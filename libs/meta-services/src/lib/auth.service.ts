import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Observable, filter, combineLatest, BehaviorSubject, takeUntil, takeWhile, map, withLatestFrom, interval, Subject } from 'rxjs';
import { SettingsService } from './settings.service';
import { WithDestroy } from './withdestroy';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends WithDestroy() {

  public authenticated$ = new BehaviorSubject<boolean>(false);
  public refreshToken$ = new BehaviorSubject<string|undefined>(undefined);
  public accessToken$ = new BehaviorSubject<string|undefined>(undefined);
  public accessTokenExpiration$ = new BehaviorSubject<Date|undefined>(undefined);
  public accessTokenExpiresIn$: Observable<number|undefined>;
  public currentUser$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);
  public userName$ = new BehaviorSubject<string|undefined>(undefined);
  public tenant$ = new BehaviorSubject<string|undefined>(undefined);

  private _manageProfileRequest = new Subject<void>();

  constructor(private settingsService: SettingsService, private oauthService: OAuthService) {
    super();

    this.accessTokenExpiresIn$ = interval(1000)
      .pipe(withLatestFrom(this.accessTokenExpiration$))
      .pipe(takeUntil(this.destroy$))
      .pipe(takeWhile(([, expiresIn]) => expiresIn ? (new Date() < expiresIn) : true))
      .pipe(map(([, expiresIn]) => expiresIn ? expiresIn.valueOf() - new Date().valueOf() : 0), map((milliseconds) => Math.ceil(milliseconds / 1000)));

    this.oauthService.events
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((e) => e.type === 'logout'))
      .subscribe((_) => {
        this.authenticated$.next(false);
        this.refreshToken$.next(undefined);
        this.accessToken$.next(undefined);
        this.accessTokenExpiration$.next(undefined);
        this.currentUser$.next(undefined);
        this.userName$.next(undefined);
        this.tenant$.next(undefined);
      });

    combineLatest([this.settingsService.identityIssuer$, this.settingsService.identityClientId$, this.settingsService.identityScopes$, this.settingsService.identityTenantClaim$, this.settingsService.identityUsernameClaim$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ issuer, clientId, scopes, tenantClaim, usernameClaim ]) => {
        if (issuer && clientId && scopes && tenantClaim && usernameClaim) {
          this.oauthService.events
            .pipe(filter((e) => e.type === 'token_received'))
            .subscribe((_) => {
              this.authenticated$.next(this.oauthService.hasValidAccessToken());
              this.refreshToken$.next(this.oauthService.getRefreshToken());
              this.accessToken$.next(this.oauthService.getAccessToken());
              this.accessTokenExpiration$.next(new Date(this.oauthService.getAccessTokenExpiration()));

              this.oauthService.loadUserProfile().then(user => {
                const identityClaims = this.oauthService.getIdentityClaims() as Record<string, unknown>;

                this.currentUser$.next(identityClaims);

                this.tenant$.next(identityClaims[tenantClaim] as string);
                this.userName$.next(identityClaims[usernameClaim] as string);
              });
            });

          const oauthConfig: AuthConfig = {
            issuer: issuer,
            redirectUri: window.location.origin + '/signin-oidc',
            clientId: clientId,
            responseType: 'code',
            scope: scopes,
            showDebugInformation: true,
            oidc: true
          };

          this.oauthService.configure(oauthConfig);
          this.oauthService.loadDiscoveryDocumentAndLogin().then(result => {
            if (result) {
              this.authenticated$.next(this.oauthService.hasValidAccessToken());
              this.refreshToken$.next(this.oauthService.getRefreshToken());
              this.accessToken$.next(this.oauthService.getAccessToken());
              this.accessTokenExpiration$.next(new Date(this.oauthService.getAccessTokenExpiration()));

              const identityClaims = this.oauthService.getIdentityClaims() as Record<string, unknown>;

              this.currentUser$.next(identityClaims);

              this.tenant$.next(identityClaims[tenantClaim] as string);
              this.userName$.next(identityClaims[usernameClaim] as string);
            }
          });
        }
      });

      combineLatest([this.settingsService.identityProfileUrl$, this._manageProfileRequest])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([identityProfileUrl,]) => {
          window.location.href = identityProfileUrl;
        });
  }

  logout(): void {
    this.oauthService.logOut();
  }

  refreshToken(): void {
    this.oauthService.refreshToken();
  }

  manageProfile(): void {
    this._manageProfileRequest.next();
  }
}
