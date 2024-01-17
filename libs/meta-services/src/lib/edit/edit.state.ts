import { EditLayout } from "@ballware/meta-model";
import { EditItemRef } from "../edititemref";
import { EditModes } from "../editmodes";

export interface EditState {

    identifier?: string;

    item?: Record<string, unknown>;  
    mode?: EditModes;
    editLayout?: EditLayout;
    readonly?: boolean;

    editItems: Record<string, EditItemRef|undefined>;

    validator: (() => boolean)|undefined;
}