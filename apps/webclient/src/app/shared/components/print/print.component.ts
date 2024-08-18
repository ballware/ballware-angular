import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MetaApiService } from '@ballware/meta-api';
import { IDENTITY_SERVICE, IdentityService, TOOLBAR_SERVICE, ToolbarService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'ballware-print',
  templateUrl: './print.component.html',
  styleUrls: [],
  imports: [CommonModule],
  standalone: true
})
export class PrintComponent {

    public url$: Observable<SafeUrl|null>;

    constructor(
        private domSanitizer: DomSanitizer, 
        @Inject(TRANSLATOR) private translator: Translator, 
        private metaApiService: MetaApiService, 
        @Inject(IDENTITY_SERVICE) private identityService: IdentityService, 
        @Inject(TOOLBAR_SERVICE) private toolbarService: ToolbarService, 
        private activatedRoute: ActivatedRoute) {

        this.toolbarService.setPage(this.translator('datacontainer.actions.print'));

        this.url$ = combineLatest([this.identityService.accessToken$, this.activatedRoute.queryParamMap])
            .pipe(switchMap(([accessToken, queryParamMap]) => (accessToken && queryParamMap && queryParamMap.has('docId')) 
                ? this.metaApiService.metaDocumentApi.viewerUrl(accessToken, queryParamMap.get('docId') as string, queryParamMap.getAll('id'))
                    .pipe(map((url) => {                        
                        return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
                    }))
                : of(null)));
    }
}
