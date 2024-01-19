import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MetaApiService } from '@ballware/meta-api';
import { IdentityService } from '@ballware/meta-services';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'ballware-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent {

    public url$: Observable<SafeUrl|null>;

    constructor(private domSanitizer: DomSanitizer, private metaApiService: MetaApiService, private identityService: IdentityService, private activatedRoute: ActivatedRoute) {
        this.url$ = combineLatest([this.identityService.accessToken$, this.activatedRoute.queryParamMap])
            .pipe(switchMap(([accessToken, queryParamMap]) => (accessToken && queryParamMap && queryParamMap.has('docId')) 
                ? this.metaApiService.metaDocumentApi.viewerUrl(accessToken, queryParamMap.get('docId') as string, queryParamMap.getAll('id'))
                    .pipe(map((url) => {                        
                        return domSanitizer.bypassSecurityTrustResourceUrl(url);
                    }))
                : of(null)));
    }
}
