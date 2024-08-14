import { Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { IDENTITY_SERVICE, IdentityService, ResponsiveService, SCREEN_SIZE, TenantService, ToolbarService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { Observable, interval, map, takeUntil, takeWhile, tap, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { ApplicationAccountMenuComponent } from '../account/menu.component';

@Component({
  selector: 'ballware-application-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: []
})
export class ApplicationHeaderComponent extends WithDestroy() {
  @ViewChild('accountMenu', { static: false }) accountMenu?: ApplicationAccountMenuComponent;

  @Output() menuToggle = new EventEmitter<boolean>();

  @Input() menuToggleEnabled = false;

  public tenantTitle$: Observable<string|undefined>;
  public pageTitle$: Observable<string|undefined>;

  public documentationIdentifier$: Observable<string|undefined>;
  public documentation$: Observable<unknown|undefined>;
  public documentationPopupTitle$: Observable<string|undefined>;

  public accountMenuVisible = false;
  public accountMenuTarget: Element|undefined = undefined;

  public sessionExpiration$: Observable<string|undefined>;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(private responsiveService: ResponsiveService, private translationService: I18NextPipe, @Inject(IDENTITY_SERVICE) private identityService: IdentityService, private tenantService: TenantService, private toolbarService: ToolbarService) {
    super();

    this.fullscreenDialogs$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));

    this.tenantTitle$ = this.tenantService.title$;
    this.pageTitle$ = this.toolbarService.title$;
    this.documentationIdentifier$ = this.toolbarService.documentationIdentifier$;
    this.documentation$ = this.toolbarService.documentation$;

    this.documentationPopupTitle$ = this.pageTitle$.pipe(map((pageTitle) => pageTitle && this.translationService.transform('documentation.popuptitle', { entity: pageTitle })));

    this.sessionExpiration$ = interval(1000).pipe(withLatestFrom(this.identityService.accessTokenExpiration$))
      .pipe(tap(([, accessTokenExpiration]) => {
        if (accessTokenExpiration && (accessTokenExpiration < new Date())) {
            this.identityService.expired();
        }
      }))       
      .pipe(takeWhile(([, accessTokenExpiration ]) => accessTokenExpiration ? (new Date() < accessTokenExpiration) : true))      
      .pipe(map(([, accessTokenExpiration]) => accessTokenExpiration ? accessTokenExpiration.valueOf() - new Date().valueOf() : 0), map((milliseconds) => Math.ceil(milliseconds / 1000)))
      .pipe(map((expiration) => expiration ? `${Math.ceil(expiration / 60 - 1).toString().padStart(2, '0')}:${Math.ceil(expiration % 60).toString().padStart(2, '0')}` : ''));
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

  hideDocumentation(): void {
    this.toolbarService.hideDocumentation();
  }
}

