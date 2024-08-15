import { inject } from "@angular/core";
import { MetaApiService } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, of, switchMap, withLatestFrom } from "rxjs";
import { showNotification } from "../notification";
import { TOOLBAR_SERVICE } from "../toolbar.service";
import { toolbarDocumentationFetched, toolbarShowDocumentation } from "./toolbar.actions";
import { TRANSLATOR } from "../translation.service";

export const fetchDocumentation = createEffect((actions$ = inject(Actions), metaApiService = inject(MetaApiService), translator = inject(TRANSLATOR), toolbarService = inject(TOOLBAR_SERVICE)) => 
    actions$.pipe(ofType(toolbarShowDocumentation))              
        .pipe(withLatestFrom(toolbarService.documentationIdentifier$))
        .pipe(switchMap(([, documentationIdentifier]) => documentationIdentifier ? metaApiService.metaDocumentationApi.loadDocumentationForEntity(documentationIdentifier) : of(undefined) ))
        .pipe(map((documentation) => documentation ? toolbarDocumentationFetched({ documentation }) : showNotification({ notification: { severity: 'info', message: translator('documentation.notifications.nodocumentation') } })))
, { functional: true, dispatch: true });