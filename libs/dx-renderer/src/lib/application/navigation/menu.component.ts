import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationTreeItem, ResponsiveService, SCREEN_SIZE, TenantService } from '@ballware/meta-services';
import { ItemClickEvent } from 'devextreme/ui/tree_view';
import { cloneDeep } from 'lodash';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-navigation-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: []
})
export class ApplicationNavigationMenuComponent extends WithDestroy() {
  @HostBinding('class') classes = 'h-100';

  @Input() opened!: boolean;

  @Output() hideNavigation = new EventEmitter<void>();

  public items: NavigationTreeItem[] = [];

  private closeOnNavigate = false;

  constructor(private responsiveService: ResponsiveService, private tenantService: TenantService, private router: Router) {
    super();

    this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(screenSize => this.closeOnNavigate = screenSize <= SCREEN_SIZE.SM);

    this.tenantService.navigationTree$
      .pipe(takeUntil(this.destroy$))
      .subscribe((navigation) => {
        this.items = cloneDeep(navigation ?? []);
      })
  }

  onItemClick(event: ItemClickEvent) {
    const url = (event.itemData as any).url;

    if (url) {
      event.event?.preventDefault();

      if (this.closeOnNavigate) {
        this.hideNavigation.emit();
      }
      
      this.router.navigate([url]);
    }    
  }
}

