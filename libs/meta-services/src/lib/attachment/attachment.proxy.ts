import { Injectable, OnDestroy } from "@angular/core";
import { AttachmentService } from "../attachment.service";
import { AttachmentStore } from "./attachment.store";

@Injectable()
export class AttachmentServiceProxy extends AttachmentService implements OnDestroy {
    
    constructor(private attachmentStore: AttachmentStore) {
        super();
    }

    ngOnDestroy(): void {
        this.attachmentStore.ngOnDestroy();    
    }

    readonly owner$ = this.attachmentStore.owner$;
    readonly items$ = this.attachmentStore.items$;
    readonly removeDialog$ = this.attachmentStore.removeDialog$;
    readonly setIdentifier = this.attachmentStore.setIdentifier;
    readonly setOwner = this.attachmentStore.setOwner;
    readonly fetch = this.attachmentStore.fetch;
    readonly upload = this.attachmentStore.upload;
    readonly open = this.attachmentStore.open;
    readonly remove = this.attachmentStore.remove;
    readonly drop = this.attachmentStore.drop;
}