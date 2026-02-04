import { Component, DestroyRef, Inject, Injector, runInInjectionContext } from '@angular/core';
import { LOOKUP_SERVICE, LookupService, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { Item } from 'devextreme/ui/toolbar';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DxToolbarModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TOOLBARITEMCONFIGURATION_REGISTRY, ToolbarItemConfigurationRegistry } from '../../registries';

@Component({
    selector: 'ballware-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [CommonModule, DxToolbarModule]
})
export class ToolbarComponent {

  public toolbarItems: Array<Item> = [];

  constructor(
    private readonly injector: Injector,
    private readonly destroy: DestroyRef,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(PAGE_SERVICE) private readonly pageService: PageService,
    @Inject(TOOLBARITEMCONFIGURATION_REGISTRY) private readonly toolbarItemConfigurationRegistry: ToolbarItemConfigurationRegistry) {

    combineLatest([this.pageService.layout$, this.lookupService.lookups$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([layout, lookups]) => {
      if (layout && lookups) {
        this.toolbarItems = layout.toolbaritems?.map((item) => {
          return runInInjectionContext(this.injector, () => {
            return this.toolbarItemConfigurationRegistry.resolveToolbarItemConfiguration(item.type, item, 'before', 'auto', lookups, {});
          });
        }) ?? [];
      }
    });
  }
}
