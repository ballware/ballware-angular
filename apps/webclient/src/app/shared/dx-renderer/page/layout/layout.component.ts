import { Component } from '@angular/core';
import { PageService } from '@ballware/meta-services';
import { PageLayout } from '@ballware/meta-model';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class PageLayoutComponent extends WithDestroy() {

  public layout?: PageLayout;

  constructor(private pageService: PageService) {
    super();

    this.pageService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe((layout) => {
        this.layout = layout;
      });
  }
}
