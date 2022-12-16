import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '@ballware/meta-services';
import { ItemClickEvent } from 'devextreme/ui/tree_view';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-navigation-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: []
})
export class ApplicationNavigationMenuComponent extends WithDestroy() {
  @Input() opened!: boolean;

  @Output() openedChange = new EventEmitter<boolean>();

  public items: Record <string, unknown>[] = [];

  constructor(private tenantService: TenantService, private router: Router) {
    super();

    this.tenantService.navigationTree$
      .pipe(takeUntil(this.destroy$))
      .subscribe((navigation) => {
        this.items = navigation ?? [];
      })
  }

  onItemClick(event: ItemClickEvent) {
    const path = (event.itemData as any).path;

    if (path) {
      this.router.navigate([path]);
    } else {
      event.event?.preventDefault();
    }
  }
}

