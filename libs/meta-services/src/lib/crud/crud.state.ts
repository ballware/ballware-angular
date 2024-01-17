import { CrudItem, EntityCustomFunction } from "@ballware/meta-model";
import { CrudAction, CrudEditMenuItem, ItemEditDialog, ItemRemoveDialog } from "../crud.service";

export interface CrudState {
  
    queryIdentifier?: string;
    identifier?: string;

    addMenuItems?: CrudEditMenuItem[];
    headCustomFunctions?: EntityCustomFunction[];
  
    exportMenuItems?: CrudEditMenuItem[];
    importMenuItems?: CrudEditMenuItem[];
  
    itemDialog?: ItemEditDialog;
    removeDialog?: ItemRemoveDialog;
  
    selectAddSheet?: {
        target: Element,
        actions: CrudAction[]
    };
  
    selectActionSheet?: { 
        item: CrudItem, 
        target: Element, 
        actions: CrudAction[]
    };
  
    selectPrintSheet?: { 
        item: CrudItem, 
        target: Element, 
        actions: CrudAction[]
    };
  
    fetchedItems?: CrudItem[];
}