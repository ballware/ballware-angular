import { EditLayout } from "@ballware/meta-model";
import { EditModes } from "../editmodes";

export interface EditState {

    identifier?: string;

    item?: Record<string, unknown>;  
    mode?: EditModes;
    editLayout?: EditLayout;
    readonly?: boolean;

    validator: (() => boolean)|undefined;
}