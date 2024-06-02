import { inject } from "@angular/core";
import { NotificationService } from "@ballware/common-services";
import { MetaApiService } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { I18NextPipe } from "angular-i18next";
import { map, of, switchMap, withLatestFrom } from "rxjs";
import { ToolbarService } from "../toolbar.service";
import { toolbarDocumentationFetched, toolbarShowDocumentation } from "./toolbar.actions";

export const fetchDocumentation = createEffect((actions$ = inject(Actions), store = inject(Store), metaApiService = inject(MetaApiService), translationPipe = inject(I18NextPipe), toolbarService = inject(ToolbarService), notificationService = inject(NotificationService)) => 
    actions$.pipe(ofType(toolbarShowDocumentation))              
        .pipe(withLatestFrom(toolbarService.documentationIdentifier$))
        .pipe(switchMap(([, documentationIdentifier]) => documentationIdentifier ? metaApiService.metaDocumentationApi.loadDocumentationForEntity(documentationIdentifier) : of(undefined) ))
        .pipe(map((documentation) => documentation ? store.dispatch(toolbarDocumentationFetched({ documentation })) : notificationService.triggerNotification({ severity: 'info', message: translationPipe.transform('documentation.notifications.nodocumentation') })))
, { functional: true, dispatch: false });