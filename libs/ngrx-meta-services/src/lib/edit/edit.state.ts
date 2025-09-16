import { EditLayout } from "@ballware/meta-model";
import { EditModes } from "@ballware/meta-services";

export interface EditState {

    identifier?: string;

    entity?: string;
    item?: Record<string, unknown>;
    mode?: EditModes;
    editLayout?: EditLayout;
    readonly?: boolean;
}
