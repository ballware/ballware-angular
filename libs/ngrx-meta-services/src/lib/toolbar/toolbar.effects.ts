import { inject } from "@angular/core";
import { META_DOCUMENTATION_API } from "@ballware/meta-api";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, of, switchMap, withLatestFrom } from "rxjs";
import { showNotification } from "../notification";
import { TOOLBAR_SERVICE, TRANSLATOR } from "@ballware/meta-services";
import { toolbarDocumentationFetched, toolbarShowDocumentation } from "./toolbar.actions";

export const fetchDocumentation = createEffect((actions$ = inject(Actions), metaDocumentationApi = inject(META_DOCUMENTATION_API), translator = inject(TRANSLATOR), toolbarService = inject(TOOLBAR_SERVICE)) => 
    actions$.pipe(ofType(toolbarShowDocumentation))              
        .pipe(withLatestFrom(toolbarService.documentationIdentifier$))
        .pipe(switchMap(([, documentationIdentifier]) => documentationIdentifier ? metaDocumentationApi.loadDocumentationForEntity(documentationIdentifier) : of(undefined) ))
        .pipe(map((documentation) => documentation ? toolbarDocumentationFetched({ documentation }) : showNotification({ notification: { severity: 'info', message: translator('documentation.notifications.nodocumentation') } })))
, { functional: true, dispatch: true });