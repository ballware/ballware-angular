import { CrudState } from "../crud/crud.state";
import { EditState } from "../edit/edit.state";
import { LookupState } from "../lookup/lookup.state";
import { MetaState } from "../meta/meta.state";
import { PageState } from "../page/page.state";

export const componentFeatureKey = "component";

export interface ComponentState {
    lookup: Record<string, LookupState>,
    page: Record<string, PageState>,
    meta: Record<string, MetaState>,
    crud: Record<string, CrudState>,
    edit: Record<string, EditState>
}