import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, ReplaySubject, share, switchMap, takeUntil } from 'rxjs';
import { combineLatest } from 'rxjs';
import { CompiledTenant, NavigationLayout, NavigationLayoutItem } from '@ballware/meta-model';
import { AuthService } from '../auth.service';
import { MetaApiService } from '@ballware/meta-api';
import { TenantService } from '../tenant.service';

const buildNavigationTree = (hasRight: (right: string) => boolean, navigation: NavigationLayout): Record<string, unknown>[] => {

  const collectAllowedItems = (items: NavigationLayoutItem[]): Record<string, unknown>[] => {
    const mappedItems = [] as Record<string, unknown>[];

    items?.forEach(item => {
      if (item.type === 'page' && item.options?.page) {
        const pageVisible = hasRight(`generic.page.${item.options.page ?? 'unknown'}`);

        if (pageVisible) {
          mappedItems.push({
            type: 'page',
            text: item.options?.caption,
            icon: item.options?.icon ?? 'file',
            path: `/page/${item.options.url}`
          });
        }
      } else if (item.type === 'section') {
        const subItems = collectAllowedItems(item.items ?? []);

        if (subItems.length > 0) {
          if (mappedItems.length > 0) {
            mappedItems.push({
              type: 'section',
              html: '<hr/>',
              disabled: true
            });
          }

          mappedItems.push(...subItems);
        }
      } else if (item.type === 'group') {
        const subItems = collectAllowedItems(item.items ?? []);

        if (subItems.length > 0) {
          mappedItems.push({
            type: 'group',
            text: item.options?.caption,
            icon: 'folder',
            items: subItems
          });
        }
      }
    });

    return mappedItems;
  }

  return collectAllowedItems(navigation?.items ?? []);
}

const buildPageList = (hasRight: (right: string) => boolean, navigation: NavigationLayout): NavigationLayoutItem[] => {

  const collectPages = (items: NavigationLayoutItem[]): NavigationLayoutItem[] => {
    const pages = [] as NavigationLayoutItem[];

    items?.forEach(item => {
      if (item.type === 'page' && item.options?.page) {
        const pageVisible = hasRight(`generic.page.${item.options.page ?? 'unknown'}`);

        if (pageVisible) {
          pages.push(item);
        }
      } else if (item.type === 'section' || item.type === 'group') {
        pages.push(...collectPages(item.items ?? []));
      }
    });

    return pages;
  }

  return collectPages(navigation?.items ?? []);
}

@Injectable()
export class DefaultTenantService extends TenantService {

  public tenant$: Observable<CompiledTenant|undefined>;
  public title$: Observable<string|undefined>;
  public navigationLayout$: Observable<NavigationLayout|undefined>;
  public navigationTree$: Observable<Record<string, unknown>[]|undefined>;
  public pages$: Observable<NavigationLayoutItem[]|undefined>;
  public hasRight$: Observable<((rights: string) => boolean)|undefined>;

  constructor(private httpClient: HttpClient, private authService: AuthService, private metaApiService: MetaApiService) {
    super();

    this.tenant$ = combineLatest([this.authService.currentUser$, this.authService.tenant$, this.metaApiService.metaTenantApiFactory$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([ currentUser, tenantId, tenantApi ]) => (currentUser && tenantId && tenantApi)
        ? tenantApi().metadataForTenant(this.httpClient, tenantId)
        : of(undefined)))
      .pipe(share({ connector: () => new ReplaySubject(), resetOnRefCountZero: false, resetOnComplete: false, resetOnError: true }));

    this.title$ = this.tenant$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((tenant) => tenant?.name));

    this.navigationLayout$ = this.tenant$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((tenant) => tenant?.navigation));

    this.hasRight$ = combineLatest([this.authService.currentUser$, this.tenant$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([currentUser, tenant]) => (currentUser && tenant)
        ? (right) => tenant.hasRight(currentUser, right)
        : undefined));

    this.navigationTree$ = combineLatest([this.hasRight$, this.navigationLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([hasRight, navigation]) => (hasRight && navigation)
        ? buildNavigationTree(hasRight, navigation)
        : undefined));

    this.pages$ = combineLatest([this.hasRight$, this.navigationLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([hasRight, navigation]) => (hasRight && navigation)
        ? buildPageList(hasRight, navigation)
        : undefined));
  }
}
