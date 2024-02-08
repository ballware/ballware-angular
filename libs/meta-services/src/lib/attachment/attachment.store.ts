import { OnDestroy } from "@angular/core";
import { ApiError, MetaApiService } from "@ballware/meta-api";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { I18NextPipe } from "angular-i18next";
import { cloneDeep, isEqual } from "lodash";
import { Observable, catchError, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from "rxjs";
import { AttachmentServiceApi } from "../attachment.service";
import { attachmentDestroyed, attachmentUpdated } from "../component";
import { NotificationService } from "../notification.service";
import { AttachmentState } from "./attachment.state";

export class AttachmentStore extends ComponentStore<AttachmentState> implements AttachmentServiceApi, OnDestroy {
    
    constructor(private store: Store, private notificationService: NotificationService, private metaApiService: MetaApiService, private translationService: I18NextPipe) {
        super({});

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {                
                if (state.identifier) {
                    this.store.dispatch(attachmentUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Meta state update');
                    console.debug(state);    
                }
            });

        this.destroy$
            .pipe(withLatestFrom(this.state$))
            .subscribe(([, state]) => {
                if (state.identifier) {
                    this.store.dispatch(attachmentDestroyed({ identifier: state.identifier }));
                }
            });
    }
    
    readonly removeDialog$ = this.select(state => state.removeDialog);
    
    readonly owner$ = this.select(state => state.owner);
    readonly items$ = this.select(state => state.items);

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));

    readonly setOwner = this.updater((state, owner: string) => ({
        ...state,
        owner
    }));

    readonly fetch = this.effect<void>((trigger$) => 
        trigger$.pipe(withLatestFrom(this.owner$))        
            .pipe(switchMap(([, owner]) => owner
                ? this.metaApiService.metaAttachmentApiFactory(owner).query()
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                    this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                    
                    return of(undefined);              
                }))  
            .pipe(tap((fetchedItems) =>
                    this.updater((state, items: Record<string, unknown>[]|undefined) => ({
                        ...state,
                        items
                    }))(fetchedItems)
                ))
    );

    readonly upload = this.effect((file$: Observable<File>) => 
        file$.pipe(withLatestFrom(this.owner$))
            .pipe(switchMap(([file, owner]) => (owner && file)
                ? this.metaApiService.metaAttachmentApiFactory(owner).upload(file)
                    .pipe(tap(() => {
                        this.notificationService.triggerNotification({ message: this.translationService.transform('attachment.messages.added'), severity: 'info' });                        
                    }))
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                
                return of(undefined);              
            }))   
            .pipe(map(() => this.fetch()))  
    );

    readonly open = this.effect((fileName$: Observable<string>) => 
        fileName$.pipe(withLatestFrom(this.owner$))
            .pipe(switchMap(([fileName, owner]) => (owner && fileName)
                ? this.metaApiService.metaAttachmentApiFactory(owner).open(fileName)
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                
                return of(undefined);              
            }))   
            .pipe(map((url) => url && window.open(url)))  
    );
    
    readonly remove = this.updater((state, fileName: string) => ({
        ...state,
        removeDialog: {
            fileName,
            title: this.translationService.transform('', { fileName }),
            apply: (fileName) => this.drop(fileName),
            cancel: this.updater((state) => ({ ...state, removeDialog: undefined }))
        }
    }));
    
    readonly drop = this.effect((fileName$: Observable<string>) => 
        fileName$.pipe(withLatestFrom(this.owner$))
            .pipe(switchMap(([fileName, owner]) => (owner && fileName)
                ? this.metaApiService.metaAttachmentApiFactory(owner).remove(fileName)
                    .pipe(tap(() => { 
                        this.notificationService.triggerNotification({ message: this.translationService.transform('attachment.messages.removed'), severity: 'info' });
                        
                        this.updater((state) => ({
                            ...state,
                            removeDialog: undefined
                        }))(); 
                    }))
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });
                
                return of(undefined);              
            }))               
            .pipe(map(() => this.fetch()))
    );
}