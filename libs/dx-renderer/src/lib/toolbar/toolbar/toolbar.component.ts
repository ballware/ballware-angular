import { Component, DestroyRef, Inject, Injector, runInInjectionContext } from '@angular/core';
import { LOOKUP_SERVICE, LookupService, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { Item } from 'devextreme/ui/toolbar';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DxToolbarModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Breadcrumb, getToolbarItemTestId } from '@ballware/renderer-commons';
import { TOOLBARITEMCONFIGURATION_REGISTRY, ToolbarItemConfigurationRegistry } from '../../registries';

@Component({
    selector: 'ballware-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [CommonModule, DxToolbarModule],
    hostDirectives: [Breadcrumb]
})
export class ToolbarComponent {

  public toolbarItems: Array<Item> = [];

  constructor(
    private readonly injector: Injector,
    private readonly destroy: DestroyRef,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(PAGE_SERVICE) private readonly pageService: PageService,
    @Inject(TOOLBARITEMCONFIGURATION_REGISTRY) private readonly toolbarItemConfigurationRegistry: ToolbarItemConfigurationRegistry,
    private readonly breadcrumb: Breadcrumb) {

    this.breadcrumb.setIdentifier('toolbar');

    combineLatest([this.pageService.layout$, this.lookupService.lookups$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([layout, lookups]) => {
      if (layout && lookups) {
        this.toolbarItems = layout.toolbaritems?.map((item) => {
          return runInInjectionContext(this.injector, () => {
            const toolbarItem = this.toolbarItemConfigurationRegistry.resolveToolbarItemConfiguration(item.type, item, 'before', 'auto', lookups, {});

            return {
              ...toolbarItem,
              options: {
                ...toolbarItem.options,
                elementAttr: {
                  ...(toolbarItem.options as Record<string, unknown>|undefined)?.['elementAttr'] as Record<string, unknown>|undefined,
                  'data-testid': getToolbarItemTestId(this.breadcrumb.pathString, item.name ?? item.caption),
                  'data-test-toolbar-name': item.name
                }
              }
            } as Item;
          });
        }) ?? [];
      }
    });
  }
}
