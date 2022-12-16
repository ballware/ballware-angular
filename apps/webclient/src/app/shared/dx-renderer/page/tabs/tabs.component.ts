import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import * as qs from 'qs';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { PageLayoutItem, TabsOptions } from '@ballware/meta-model';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';
import { DxLoadIndicatorModule, DxTabPanelModule } from 'devextreme-angular';
import { PageModule } from '../page.module';
import { PageLayoutTabsCounterComponent } from './counter.component';

interface TabsParam {
  current?: string;
}

@Component({
  selector: 'ballware-page-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class PageLayoutTabsComponent extends WithDestroy() implements OnInit {

  @Input() layoutItem?: PageLayoutItem;

  public selectedTab$ = new BehaviorSubject<number>(0);

  public panels: any[] = [];

  public tabsParam$ = new BehaviorSubject<TabsParam|undefined>(undefined);

  constructor(private router: Router, private route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    this.panels = this.layoutItem?.items?.filter(item => item.type === 'tab') ?? [];

    const identifier = (this.layoutItem?.options?.itemoptions as TabsOptions)?.identifier;

    if (identifier) {
      this.selectedTab$
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          const nextTabsParam = { current: value.toString() } as TabsParam;

          if (!isEqual(this.tabsParam$.getValue(), nextTabsParam)) {
            this.tabsParam$.next(nextTabsParam);
          }
        });

      this.tabsParam$
        .pipe(takeUntil(this.destroy$))
        .subscribe((tabsParam) => {
          if (Number.parseInt(tabsParam?.current ?? '0') !== this.selectedTab$.getValue()) {
            this.selectedTab$.next(Number.parseInt(tabsParam?.current ?? '0'));
          }

          const nextQueryParams = {} as Record<string, unknown>;

          nextQueryParams[identifier] = qs.stringify(tabsParam);

          this.router.navigate([], { relativeTo: this.route, queryParams: nextQueryParams, queryParamsHandling: 'merge' });
        });

      this.route.queryParamMap
        .pipe(takeUntil(this.destroy$))
        .subscribe((queryParams) => {
          const nextTabsParam = qs.parse(queryParams.get(identifier) ?? '') as TabsParam;

          if (!isEqual(this.tabsParam$.getValue(), nextTabsParam)) {
            this.tabsParam$.next(nextTabsParam);
          }
        });
    }
  }

  get styles(): object {
    return { 'height': this.layoutItem?.options?.height ?? '100%' };
  }

  public onTabChanged(e: number) {
    if (e !== this.selectedTab$.getValue()) {
      this.selectedTab$.next(e);
    }
  }
}

@NgModule({
  declarations: [PageLayoutTabsComponent, PageLayoutTabsCounterComponent],
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxLoadIndicatorModule,
    PageModule
  ]
})
class PageLayoutTabsModule {}
