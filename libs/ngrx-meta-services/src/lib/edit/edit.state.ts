import { EditLayout } from "@ballware/meta-model";
import { EditModes } from "@ballware/meta-services";
import { Observable } from 'rxjs';

export interface EditState {

    identifier?: string;

    entity?: string;
    item?: Record<string, unknown>;
    mode?: EditModes;
    editLayout?: EditLayout;
    readonly?: boolean;

    validator: (() => Observable<boolean>)|undefined;
}
