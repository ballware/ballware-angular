import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IDENTITY_SERVICE, IdentityService, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, TENANT_SERVICE, TenantService, TOOLBAR_SERVICE, ToolbarService } from '@ballware/meta-services';
import { Observable, interval, map, takeWhile, tap, withLatestFrom, of } from 'rxjs';
import { ApplicationAccountMenuComponent } from '../account/menu.component';
import { ApplicationDocumentationComponent } from "../documentation/documentation.component";
import { DxButtonModule, DxPopupModule, DxToolbarModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { I18NextPipe } from 'angular-i18next';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
    selector: 'ballware-application-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [CommonModule, I18NextPipe, ApplicationAccountMenuComponent, ApplicationDocumentationComponent, DxToolbarModule, DxButtonModule, DxPopupModule]
})
export class ApplicationHeaderComponent {
  @ViewChild('accountMenu', { static: false }) accountMenu?: ApplicationAccountMenuComponent;

  @Output() menuToggle = new EventEmitter<boolean>();

  @Input() menuToggleEnabled = false;

  public tenantTitle$: Observable<string|undefined>;
  public pageTitle$: Observable<string|undefined>;

  public documentationIdentifier$: Observable<string|undefined>;

  public accountMenuVisible = false;
  public accountMenuTarget: Element|undefined = undefined;

  public tokenExpiration$: Observable<string|undefined> = of(undefined);

  public sessionExpirationVisible$: Observable<boolean>;
  public sessionExpiration$: Observable<string|undefined>;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
    private readonly destroy: DestroyRef,
    private readonly router: Router,
    @Inject(RESPONSIVE_SERVICE) private readonly responsiveService: ResponsiveService,
    @Inject(IDENTITY_SERVICE) private readonly identityService: IdentityService,
    @Inject(TENANT_SERVICE) private readonly tenantService: TenantService,
    @Inject(TOOLBAR_SERVICE) private readonly toolbarService: ToolbarService) {

    this.fullscreenDialogs$ = this.responsiveService.onResize$.pipe(
      takeUntilDestroyed(this.destroy),
      map((screenSize) => screenSize <= SCREEN_SIZE.SM)
    );

    this.tenantTitle$ = this.tenantService.title$;
    this.pageTitle$ = this.toolbarService.title$;

    this.documentationIdentifier$ = this.toolbarService.documentationIdentifier$;

    this.sessionExpirationVisible$ = this.identityService.sessionExpiration$.pipe(
      takeUntilDestroyed(this.destroy),
      map((sessionExpiration) => !!sessionExpiration)
    );

    this.identityService.accessTokenAutoRefresh$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((autoRefresh) => {
      if (!autoRefresh) {
        this.tokenExpiration$ = interval(1000).pipe(
          withLatestFrom(this.identityService.accessTokenExpiration$),
          tap(([, sessionExpiration]) => {
            if (sessionExpiration && (sessionExpiration < new Date())) {
              this.identityService.expired();
            }
          }),
          takeWhile(([, sessionExpiration ]) => (sessionExpiration) ? (new Date() < sessionExpiration) : true),
          map(([, sessionExpiration]) => (sessionExpiration) ? sessionExpiration.valueOf() - Date.now() : 0), map((milliseconds) => Math.ceil(milliseconds / 1000)),
          map((expiration) => expiration ? `${Math.ceil(expiration / 60 - 1).toString().padStart(2, '0')}:${Math.ceil(expiration % 60).toString().padStart(2, '0')}` : ''));
      } else {
        this.tokenExpiration$ = of(undefined);
      }
    });

    this.sessionExpiration$ = interval(1000).pipe(
      withLatestFrom(this.identityService.sessionExpiration$),
      tap(([, sessionExpiration]) => {
        if (sessionExpiration && (sessionExpiration < new Date())) {
            this.identityService.expired();
        }
      }),
      takeWhile(([, sessionExpiration ]) => sessionExpiration ? (new Date() < sessionExpiration) : true),
      map(([, sessionExpiration]) => sessionExpiration ? sessionExpiration.valueOf() - Date.now() : 0), map((milliseconds) => Math.ceil(milliseconds / 1000)),
      map((expiration) => expiration ? `${Math.ceil(expiration / 60 - 1).toString().padStart(2, '0')}:${Math.ceil(expiration % 60).toString().padStart(2, '0')}` : '')
    );
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  toggleAccountMenu = (e: { element: Element }) => {
    this.accountMenu?.toggleShow(e.element);
  }

  showDocumentation(): void {
    this.toolbarService.showDocumentation();
  }

  readonly showChat = () => {
    this.router.navigate(['/chat']);
  }
}

