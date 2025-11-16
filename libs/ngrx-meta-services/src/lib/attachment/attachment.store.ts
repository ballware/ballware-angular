import { DestroyRef, inject } from '@angular/core';
import { ApiError, MetaAttachmentApiFactory } from "@ballware/meta-api";
import { ComponentStore } from "@ngrx/component-store";
import { Store } from "@ngrx/store";
import { cloneDeep, isEqual } from "lodash";
import { Observable, catchError, distinctUntilChanged, map, of, switchMap, takeUntil, tap, withLatestFrom } from "rxjs";
import { AttachmentService, IdentityService, NotificationService, Translator } from "@ballware/meta-services";
import { attachmentDestroyed, attachmentUpdated } from "../component";
import { AttachmentState } from "./attachment.state";

export class AttachmentStore extends ComponentStore<AttachmentState> implements AttachmentService {

    private destroyRef = inject(DestroyRef);

    constructor(private store: Store, private notificationService: NotificationService, private identityService: IdentityService, private attachmentApiFactory: MetaAttachmentApiFactory, private translator: Translator) {
        super({});

        this.state$
            .pipe(takeUntil(this.destroy$))
            .pipe(distinctUntilChanged((prev, next) => isEqual(prev, next)))
            .subscribe((state) => {
                if (state.identifier) {
                    this.store.dispatch(attachmentUpdated({ identifier: state.identifier, currentState: cloneDeep(state) }));
                } else {
                    console.debug('Attachment state update');
                    console.debug(state);
                }
            });

        this.destroyRef.onDestroy(() => {
          super.ngOnDestroy();
        })

        this.destroy$
          .pipe(withLatestFrom(this.state$))
          .subscribe(([, state]) => {
              if (state.identifier) {
                  this.store.dispatch(attachmentDestroyed({ identifier: state.identifier }));
              }
          });
    }

    readonly removeDialog$ = this.select(state => state.removeDialog);

    readonly entity$ = this.select(state => state.entity);
    readonly owner$ = this.select(state => state.owner);
    readonly items$ = this.select(state => state.items);

    readonly setIdentifier = this.updater((state, identifier: string) => ({
        ...state,
        identifier
    }));

    readonly setEntity = this.updater((state, entity: string) => ({
        ...state,
        entity
    }));

    readonly setOwner = this.updater((state, owner: string) => ({
        ...state,
        owner
    }));

    readonly fetch = this.effect<void>((trigger$) =>
        trigger$.pipe(withLatestFrom(this.identityService.userTenant$, this.entity$, this.owner$))
            .pipe(switchMap(([, tenant, entity, owner]) => tenant && entity && owner
                ? this.attachmentApiFactory(tenant, entity, owner).query()
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
        file$.pipe(withLatestFrom(this.identityService.userTenant$, this.entity$, this.owner$))
            .pipe(switchMap(([file, tenant, entity, owner]) => (tenant && entity && owner && file)
                ? this.attachmentApiFactory(tenant, entity, owner).upload(file)
                    .pipe(tap(() => {
                        this.notificationService.triggerNotification({ message: this.translator('attachment.messages.added'), severity: 'info' });
                    }))
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
            }))
            .pipe(map(() => this.fetch()))
    );

    readonly open = this.effect((id$: Observable<string>) =>
        id$.pipe(withLatestFrom(this.identityService.userTenant$, this.entity$, this.owner$))
            .pipe(switchMap(([id, tenant, entity, owner]) => (tenant && entity && owner && id)
                ? this.attachmentApiFactory(tenant, entity, owner).open(id)
                : of(undefined)))
            .pipe(catchError((error: ApiError) => {
                this.notificationService.triggerNotification({ message: error.payload?.Message ?? error.message ?? error.statusText, severity: 'error' });

                return of(undefined);
            }))
            .pipe(map((url) => url && window.open(url)))
    );

    readonly remove = this.updater((state, { id, filename }: { id: string, filename: string}) => ({
        ...state,
        removeDialog: {
            fileName: filename,
            title: this.translator('', { filename }),
            apply: (_) => this.drop(id),
            cancel: this.updater((state) => ({ ...state, removeDialog: undefined }))
        }
    }));

    readonly drop = this.effect((fileName$: Observable<string>) =>
        fileName$.pipe(withLatestFrom(this.identityService.userTenant$, this.entity$, this.owner$))
            .pipe(switchMap(([fileName, tenant, entity, owner]) => (tenant && entity && owner && fileName)
                ? this.attachmentApiFactory(tenant, entity, owner).remove(fileName)
                    .pipe(tap(() => {
                        this.notificationService.triggerNotification({ message: this.translator('attachment.messages.removed'), severity: 'info' });

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
