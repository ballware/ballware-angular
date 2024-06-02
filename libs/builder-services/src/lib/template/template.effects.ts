import { inject } from "@angular/core";
import { NotificationService } from '@ballware/common-services';
import { Template } from "@ballware/meta-model";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, map, switchMap, tap } from "rxjs";
import { templateOpen, templateOpened } from "./template.actions";

const parseTemplateFile = (file: File) => {

    return from(file.text().then((payload) => (JSON.parse(payload) as Template)));
}

export const openTemplate = createEffect((actions$ = inject(Actions)) => 
    actions$.pipe(ofType(templateOpen))                
        .pipe(switchMap(({ file }) => parseTemplateFile(file)) )
        .pipe(map((template) => templateOpened({ template })))
, { functional: true, dispatch: true });

export const openedTemplate = createEffect((actions$ = inject(Actions), notificationService = inject(NotificationService)) => 
    actions$.pipe(ofType(templateOpened))                        
        .pipe(tap(() => notificationService.triggerNotification({ message: 'Template erfolgreich geladen', severity: 'info' })))
, { functional: true, dispatch: false });
