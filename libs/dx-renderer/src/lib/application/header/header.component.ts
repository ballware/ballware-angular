import { Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { IDENTITY_SERVICE, IdentityService, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, TENANT_SERVICE, TenantService, TOOLBAR_SERVICE, ToolbarService, TRANSLATOR, Translator } from '@ballware/meta-services';
import { Observable, interval, map, takeUntil, takeWhile, tap, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { ApplicationAccountMenuComponent } from '../account/menu.component';
import { ApplicationDocumentationComponent } from "../documentation/documentation.component";
import { DxButtonModule, DxToolbarModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-application-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, ApplicationAccountMenuComponent, ApplicationDocumentationComponent, DxToolbarModule, DxButtonModule],
  standalone: true
})
export class ApplicationHeaderComponent extends WithDestroy() {
  @ViewChild('accountMenu', { static: false }) accountMenu?: ApplicationAccountMenuComponent;

  @Output() menuToggle = new EventEmitter<boolean>();

  @Input() menuToggleEnabled = false;

  public tenantTitle$: Observable<string|undefined>;
  public pageTitle$: Observable<string|undefined>;

  public documentationIdentifier$: Observable<string|undefined>;

  public accountMenuVisible = false;
  public accountMenuTarget: Element|undefined = undefined;

  public sessionExpiration$: Observable<string|undefined>;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
    @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService, 
    @Inject(IDENTITY_SERVICE) private identityService: IdentityService, 
    @Inject(TENANT_SERVICE) private tenantService: TenantService, 
    @Inject(TOOLBAR_SERVICE) private toolbarService: ToolbarService) {
    super();

    this.fullscreenDialogs$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));

    this.tenantTitle$ = this.tenantService.title$;
    this.pageTitle$ = this.toolbarService.title$;

    this.documentationIdentifier$ = this.toolbarService.documentationIdentifier$;

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
}

