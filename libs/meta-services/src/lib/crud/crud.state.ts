import { CrudItem, EditLayout, EntityCustomFunction } from "@ballware/meta-model";
import { EditModes } from "../editmodes";
import { CrudAction } from "../crud.service";

export interface CrudState {
  
    queryIdentifier?: string;
    storageIdentifier?: string;

    addMenuItems?: {id: string, text: string, customFunction?: EntityCustomFunction}[];
    headCustomFunctions?: EntityCustomFunction[];
  
    exportMenuItems?: {id: string, text: string, customFunction: EntityCustomFunction}[];
    importMenuItems?: {id: string, text: string, customFunction: EntityCustomFunction}[];
  
    itemDialog?: { mode: EditModes, item: Record<string, unknown>, title: string, editLayout?: EditLayout, apply: (item: Record<string, unknown>) => void, cancel: () => void};
    removeDialog?: { item: CrudItem, title: string };
  
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