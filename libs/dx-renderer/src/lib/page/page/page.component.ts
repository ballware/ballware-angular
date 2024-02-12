import { Component, HostBinding, OnDestroy, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService, MetaServiceFactory, PageDocumentationDialog, PageService, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [    
    { 
      provide: LookupService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createLookupService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: PageService, 
      useFactory: (serviceFactory: MetaServiceFactory, activatedRoute: ActivatedRoute, router: Router, lookupService: LookupService) => serviceFactory.createPageService(activatedRoute, router, lookupService),
      deps: [MetaServiceFactory, ActivatedRoute, Router, LookupService]  
    } as Provider
  ]
})
export class PageComponent extends WithDestroy() implements OnDestroy {  
  @HostBinding('class') classes = 'h-100 p-2';

  public readonly initialized$ = this.pageService.initialized$;

  public documentationDialog: PageDocumentationDialog|undefined;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(private responsiveService: ResponsiveService, private pageService: PageService, private lookupService: LookupService) {
    super();

    this.fullscreenDialogs$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));

    this.pageService.documentationDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((documentationDialog) => this.documentationDialog = documentationDialog);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.pageService.ngOnDestroy();
    this.lookupService.ngOnDestroy();
  }
}
