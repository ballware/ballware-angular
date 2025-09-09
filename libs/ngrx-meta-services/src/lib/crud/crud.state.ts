import { CrudItem, EntityCustomFunction } from "@ballware/meta-model";
import { CrudAction, CrudEditMenuItem, DetailColumnEditOperation, ImportOperation, ItemEditOperation, ItemRemoveOperation } from "@ballware/meta-services";

export interface CrudState {

    queryIdentifier?: string;
    identifier?: string;

    addMenuItems?: CrudEditMenuItem[];
    headCustomFunctions?: EntityCustomFunction[];

    exportMenuItems?: CrudEditMenuItem[];
    importMenuItems?: CrudEditMenuItem[];

    editOperation?: ItemEditOperation;
    removeOperation?: ItemRemoveOperation;
    importOperation?: ImportOperation;

    detailColumnEditOperation?: DetailColumnEditOperation;

    selectAddSheet?: {
        actions: CrudAction[]
    };

    selectActionSheet?: {
        item: CrudItem,
        actions: CrudAction[]
    };

    selectPrintSheet?: {
        items: CrudItem[],
        actions: CrudAction[]
    };

    selectExportSheet?: {
        items: CrudItem[],
        actions: CrudAction[]
    };

    selectImportSheet?: {
        actions: CrudAction[]
    };

    fetchedItems?: CrudItem[];
}
