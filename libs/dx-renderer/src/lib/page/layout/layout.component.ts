import { Component, HostBinding, Inject } from '@angular/core';
import { PageLayout } from '@ballware/meta-model';
import { PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class PageLayoutComponent extends WithDestroy() {
  @HostBinding('class') classes = 'flex-fill overflow-hidden row row-cols-xs-1 row-cols-lg-12';

  public layout?: PageLayout;

  constructor(@Inject(PAGE_SERVICE) private pageService: PageService) {
    super();

    this.pageService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe((layout) => {
        this.layout = layout;
      });
  }
}
