import { Component, DestroyRef, forwardRef, HostBinding, Inject } from '@angular/core';
import { PageLayout } from '@ballware/meta-model';
import { PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { PageLayoutItemComponent } from './item.component';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-page-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    imports: [CommonModule, forwardRef(() => PageLayoutItemComponent)]
})
export class PageLayoutComponent {
  @HostBinding('class') classes = 'flex-fill overflow-hidden row-cols-xs-1 row-cols-lg-12';

  public layout?: PageLayout;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(PAGE_SERVICE) private readonly pageService: PageService
  ) {
    this.pageService.layout$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layout) => {
      this.layout = layout;
    });
  }
}
