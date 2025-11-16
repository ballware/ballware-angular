import {
  Component,
  DestroyRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  Provider,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, PAGE_SERVICE, PAGE_SERVICE_FACTORY, PageService, PageServiceFactory, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { Observable, map } from 'rxjs';
import { ToolbarComponent } from '../../toolbar';
import { PageLayoutComponent } from '../layout/layout.component';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [
    {
      provide: LOOKUP_SERVICE,
      useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
      deps: [LOOKUP_SERVICE_FACTORY]
    } as Provider,
    {
      provide: PAGE_SERVICE,
      useFactory: (serviceFactory: PageServiceFactory, router: Router, lookupService: LookupService) => serviceFactory(router, lookupService),
      deps: [PAGE_SERVICE_FACTORY, Router, LOOKUP_SERVICE]
    } as Provider
  ],
  imports: [CommonModule, ToolbarComponent, PageLayoutComponent],
  hostDirectives: [Breadcrumb],
  standalone: true
})
export class PageComponent implements OnChanges {
  @HostBinding('class') classes = 'h-100 p-2';

  public readonly initialized$ = this.pageService.initialized$;

  public fullscreenDialogs$: Observable<boolean>;

  @Input() id!: string;
  @Input() page!: string;

  constructor(
    private destroy: DestroyRef,
    @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService,
    @Inject(PAGE_SERVICE) private pageService: PageService,
    private breadcrumb: Breadcrumb) {

    this.fullscreenDialogs$ = this.responsiveService.onResize$.pipe(
      takeUntilDestroyed(this.destroy),
      map((screenSize) => screenSize <= SCREEN_SIZE.SM)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.breadcrumb.setIdentifier(changes['id'].currentValue);
      this.pageService.setPageUrl(changes['id'].currentValue);
    }

    if (changes['page']) {
      this.pageService.setPageQuery(changes['page'].currentValue);
    }
  }

}
