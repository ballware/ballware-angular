import { inject } from "@angular/core";
import { MetaApiService } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { I18NextPipe } from "angular-i18next";
import { map, of, switchMap, withLatestFrom } from "rxjs";
import { showNotification } from "../notification";
import { ToolbarService } from "../toolbar.service";
import { toolbarDocumentationFetched, toolbarShowDocumentation } from "./toolbar.actions";

export const fetchDocumentation = createEffect((actions$ = inject(Actions), metaApiService = inject(MetaApiService), translationPipe = inject(I18NextPipe), toolbarService = inject(ToolbarService)) => 
    actions$.pipe(ofType(toolbarShowDocumentation))              
        .pipe(withLatestFrom(toolbarService.documentationIdentifier$))
        .pipe(switchMap(([, documentationIdentifier]) => documentationIdentifier ? metaApiService.metaDocumentationApi.loadDocumentationForEntity(documentationIdentifier) : of(undefined) ))
        .pipe(map((documentation) => documentation ? toolbarDocumentationFetched({ documentation }) : showNotification({ notification: { severity: 'info', message: translationPipe.transform('documentation.notifications.nodocumentation') } })))
, { functional: true, dispatch: true });