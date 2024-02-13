import { AttachmentRemoveDialog } from "../attachment.service";

export interface AttachmentState { 
    identifier?: string;
    owner?: string;
    items?: Record<string, unknown>[]|undefined;

    removeDialog?: AttachmentRemoveDialog;
}