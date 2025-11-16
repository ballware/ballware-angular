import {
  AfterViewInit,
  Component,
  DestroyRef,
  Inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, TOOLBAR_SERVICE, ToolbarService, TRANSLATOR, Translator } from '@ballware/meta-services';
import { Observable, map, withLatestFrom } from 'rxjs';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-application-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: [],
  imports: [CommonModule, DxPopupModule],
  standalone: true
})
export class ApplicationDocumentationComponent implements AfterViewInit {

  @ViewChild('content', { read: ViewContainerRef }) private contentHost?: ViewContainerRef;

  public documentationIdentifier$: Observable<string|undefined>;
  public documentation$: Observable<unknown|undefined>;
  public documentationPopupTitle$: Observable<string|undefined>;

  public fullscreenDialogs$: Observable<boolean>;

  public visible$: Observable<boolean>;

  constructor(
    private destroy: DestroyRef,
    @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService,
    @Inject(TRANSLATOR) private translator: Translator,
    @Inject(TOOLBAR_SERVICE) private toolbarService: ToolbarService) {

    this.fullscreenDialogs$ = this.responsiveService.onResize$.pipe(
      takeUntilDestroyed(this.destroy),
      map((screenSize) => screenSize <= SCREEN_SIZE.SM)
    );

    this.documentationIdentifier$ = this.toolbarService.documentationIdentifier$;
    this.documentation$ = this.toolbarService.documentation$;
    this.visible$ = this.toolbarService.documentation$.pipe(map((documentation) => !!documentation));

    this.documentationPopupTitle$ = this.toolbarService.title$.pipe(map((pageTitle) => pageTitle && this.translator('documentation.popuptitle', { entity: pageTitle })));
  }

  ngAfterViewInit() {
    this.visible$
        .pipe(withLatestFrom(this.documentation$))
        .subscribe(([visible, documentation]) => {
            if (visible && documentation) {
                import('devextreme-angular/ui/html-editor').then(({ DxHtmlEditorComponent }) => {
                    if (this.contentHost) {
                        const componentRef = this.contentHost.createComponent(DxHtmlEditorComponent);

                        componentRef.setInput('readOnly', true);
                        componentRef.setInput('value', documentation);
                        componentRef.changeDetectorRef.detectChanges();
                      }
                });
            } else if (!visible) {
                this.contentHost?.clear();
            }
        });
  }

  hideDocumentation(): void {
    this.toolbarService.hideDocumentation();
  }
}

