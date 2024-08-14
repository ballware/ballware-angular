import { Component, EventEmitter, HostBinding, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationTreeItem, ResponsiveService, SCREEN_SIZE, TENANT_SERVICE, TenantService } from '@ballware/meta-services';
import { OpenedStateMode } from 'devextreme/ui/drawer';
import { ItemClickEvent } from 'devextreme/ui/tree_view';
import { cloneDeep } from 'lodash';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-navigation-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  providers: []
})
export class ApplicationNavigationDrawerComponent extends WithDestroy() {
  @HostBinding('class') classes = 'flex-fill overflow-hidden pt-2';

  @Input() opened!: boolean;

  @Output() openedChange = new EventEmitter<boolean>();

  openStateMode$: Observable<OpenedStateMode>;

  public navigationItems: NavigationTreeItem[] = [];

  private closeOnNavigate = false;

  constructor(private responsiveService: ResponsiveService, @Inject(TENANT_SERVICE) private tenantService: TenantService, private router: Router) {
    super();
    
    this.tenantService.navigationTree$
      .pipe(takeUntil(this.destroy$))
      .subscribe((navigation) => {
        this.navigationItems = cloneDeep(navigation ?? []);
      });

    this.openStateMode$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize > SCREEN_SIZE.SM ? 'shrink' : 'overlap'));

    this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => this.closeOnNavigate = screenSize <= SCREEN_SIZE.SM);
  }

  onNavigationItemClick(event: ItemClickEvent) {
    const url = (event.itemData as any).url;

    if (url) {
      event.event?.preventDefault();
      
      if (this.closeOnNavigate) {
        this.openedChange.emit(false);
      }

      this.router.navigate([url]);
    }    
  }
}

