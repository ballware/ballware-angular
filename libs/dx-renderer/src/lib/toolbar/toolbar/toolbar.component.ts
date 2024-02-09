import { Component } from '@angular/core';
import { PageToolbarItem } from '@ballware/meta-model';
import { PageService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { Observable, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

interface ToolbarItem {
  widget: string,
  options?: Record<string, unknown>,
  template?: string,
  item: PageToolbarItem
}

@Component({
  selector: 'ballware-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends WithDestroy() {

  public title$: Observable<string|undefined>;

  public showDocumentationButton = false;
  public toolbarItems: ToolbarItem[] = [];

  constructor(private pageService: PageService, private translationService: I18NextPipe) {
    super();

    this.onDocumentationClicked = this.onDocumentationClicked.bind(this);

    this.title$ = pageService.title$;

    this.pageService.layout$
      .pipe(takeUntil(this.destroy$))
      .subscribe((layout) => {
        this.showDocumentationButton = !!layout?.documentationEntity;

        this.toolbarItems = layout?.toolbaritems?.map(toolbarItem => {
          return {
            widget: 'dxButton',
            options: {},
            template: toolbarItem.type,
            item: toolbarItem
          } as ToolbarItem;
        }) ?? [];
      });
  }

  onDocumentationClicked(): void {
    this.pageService.showDocumentation();
  }
}
