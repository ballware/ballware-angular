import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationTreeItem, TenantService } from '@ballware/meta-services';
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

  @Output() openedChange = new EventEmitter<boolean>();

  public items: NavigationTreeItem[] = [];

  constructor(private tenantService: TenantService, private router: Router) {
    super();

    this.tenantService.navigationTree$
      .pipe(takeUntil(this.destroy$))
      .subscribe((navigation) => {
        this.items = cloneDeep(navigation ?? []);
      })
  }

  onItemClick(event: ItemClickEvent) {
    const url = (event.itemData as any).url;

    event.event?.preventDefault();

    if (url) {
      this.router.navigate([url]);
    }    
  }
}

