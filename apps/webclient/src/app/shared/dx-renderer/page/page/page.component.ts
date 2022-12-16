import { Component, HostBinding, OnInit, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, takeUntil } from 'rxjs';
import { PageService, LookupService, DefaultPageService, TenantService, DefaultLookupService } from '@ballware/meta-services';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [
    { provide: LookupService, useClass: DefaultLookupService} as Provider,
    { provide: PageService, useClass: DefaultPageService } as Provider
  ]
})
export class PageComponent extends WithDestroy() implements OnInit {
  @HostBinding('class') classes = 'd-block h-100 w-100';

  constructor(private router: Router, private route: ActivatedRoute, private tenantService: TenantService, private pageService: PageService, private lookupService: LookupService) {
    super();

    console.log('page.component constructed');
  }

  ngOnInit(): void {
    console.log('page initialized');
    combineLatest([this.tenantService.navigationLayout$, this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([navigationLayout, params]) => {
        if (navigationLayout) {
          const pageUrl = params.get('id') as string;

          if (pageUrl === 'default') {
            if (navigationLayout.defaultUrl) {
              this.router.navigate([`/page/${navigationLayout.defaultUrl}`]);
            }
          } else {
            this.pageService.setPageUrl(pageUrl);
          }
        }
      });
  }
}
