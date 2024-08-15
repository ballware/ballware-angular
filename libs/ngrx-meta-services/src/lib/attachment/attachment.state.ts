import { AttachmentRemoveDialog } from "@ballware/meta-services";

export interface AttachmentState { 
    identifier?: string;
    owner?: string;
    items?: Record<string, unknown>[]|undefined;

    removeDialog?: AttachmentRemoveDialog;
}