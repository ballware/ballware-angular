import { CrudItem, EntityCustomFunction } from "@ballware/meta-model";
import { CrudAction, CrudEditMenuItem, DetailColumnEditDialog, ImportDialog, ItemEditDialog, ItemRemoveDialog } from "../crud.service";

export interface CrudState {
  
    queryIdentifier?: string;
    identifier?: string;

    addMenuItems?: CrudEditMenuItem[];
    headCustomFunctions?: EntityCustomFunction[];
  
    exportMenuItems?: CrudEditMenuItem[];
    importMenuItems?: CrudEditMenuItem[];
  
    itemDialog?: ItemEditDialog;
    removeDialog?: ItemRemoveDialog;
    importDialog?: ImportDialog;
  
    detailColumnEditDialog?: DetailColumnEditDialog;

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