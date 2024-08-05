import { CrudItem, ValueType } from "./cruditem";
import { PrepareCustomParamFunc } from "./customparam";
import { QueryParams } from "./queryparams";
import { EntityRightsCheckFunc } from "./rights";
import { ScriptUtil } from "./scriptutil";
import { Template } from "./template";

/**
 * Adapter for accessing editor objects in custom scripts
 */
 export interface EditUtil {
  /**
   * Get editor option by data member
   *
   * @param dataMember Data member in business object the editor is attached to
   * @param option Editor specific option identifier
   * @returns Value of option, undefined if option is not available
   */
  getEditorOption: (dataMember: string, option: string) => unknown;

  /**
   * Set editor option value by data member
   *
   * @param dataMember Data member in business object the editor is attached to
   * @param option Editor specific option identifier
   * @param value New value of option
   */
  setEditorOption: (dataMember: string, option: string, value: unknown) => void;
}

/**
 * Map items after received from or before sent to API
 *
 * @param item Unmapped item
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param util Utility for performing misc operations
 * @returns Mapped item for usage in client application
 */
export type ItemMappingFunc = (
  item: CrudItem,
  customParam: unknown,
  util: ScriptUtil
) => CrudItem;

/**
 * Prepare custom param for extendedRightsCheck if operation is not connected to specific business object
 * (default add operation, custom function with type 'add')
 *
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param headParams Current value of parent object or page params
 * @returns Object containing values needed for extendedRightsCheck implementation
 */
export type RightsParamForHeadFunc = (customParam: unknown, headParams: QueryParams) => Record<string, unknown>;

/**
 * Prepare custom param for extendedRightsCheck if operation is connected to specific business object  (view, edit, delete)
 *
 * @param item Business object instance
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param headParams Current value of parent object or page params
 * @returns Object containing values needed for extendedRightsCheck implementation
 */
export type RightsParamForItemFunc = (
  item: Record<string, unknown>,
  customParam: unknown,
  headParams: QueryParams
) => Record<string, unknown>;

/**
 * Manipulate configured grid layout before rendering
 *
 * @param lookups Lookup definitions prepared for business object
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param util Utility for performing misc operations
 * @param gridLayout Grid layout instance
 */
export type PrepareGridLayoutFunc = (
  lookups: Record<string, unknown>,
  customParam: unknown,
  util: ScriptUtil,
  gridLayout: GridLayout
) => void;

/**
 * Manipulate configured edit layout before rendering
 *
 * @param mode Edit mode (add, edit, view)
 * @param lookups Lookup definitions prepared for business object
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param util Utility for performing misc operations
 * @param editLayout Edit layout instance
 */
export type PrepareEditLayoutFunc = (
  mode: string,
  lookups: Record<string, unknown>,
  customParam: unknown,
  util: ScriptUtil,
  editLayout: EditLayout
) => void;

/**
 * Manipulate materialized edit layout item template instance before rendering
 *
 * @param mode Edit mode (add, edit, view)
 * @param lookups Lookup definitions prepared for business object
 * @param customParam Current value of prepared custom param (previous result of prepareCustomParam function)
 * @param util Utility for performing misc operations
 * @param editLayout Edit layout instance
 * @param scope Source scope of template definition
 * @param identifier Identifier of template definition
 * @param materializedItem Generated edit layout item instance of template
 */
export type PrepareMaterializedEditItemFunc = (
  mode: string, 
  lookups: Record<string, unknown>, 
  customParam: unknown, 
  util: ScriptUtil, 
  editLayout: EditLayout, 
  scope: 'tenant' | 'meta', 
  identifier: string, 
  materializedItem: EditLayoutItem
) => void;  

/**
 * Manipulate editor options before rendering
 *
 * @param mode Edit mode (add, edit, view)
 * @param item Instance of business object for editing
 * @param layoutItem Configured options of editor
 * @param identifier Configured data member of editor
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 */
export type EditorPreparingFunc = (
  mode: string,
  item: Record<string, unknown>,
  layoutItem: EditLayoutItemOptions,
  identifier: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Configure editor instance after rendering
 *
 * @param mode Edit mode (add, edit, view)
 * @param item Instance of business object for editing
 * @param editUtil Adapter for accessing editor components by data member
 * @param identifier Configured data member of editor
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 */
export type EditorInitializedFunc = (
  mode: string,
  item: Record<string, unknown>,
  editUtil: EditUtil,
  identifier: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Custom functionality on editor value changed
 *
 * @param item Instance of business object for editing
 * @param editUtil Adapter for accessing editor components by data member
 * @param identifier Configured data member of editor
 * @param value Current value of editor
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 */
export type EditorValueChangedFunc = (
  item: Record<string, unknown>,
  editUtil: EditUtil,
  identifier: string,
  value: ValueType,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Custom functionality on editor specific event
 *
 * @param item Instance of business object for editing
 * @param editUtil Adapter for accessing editor components by data member
 * @param identifier Configured data member of editor
 * @param event Event identifier (editor specific)
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 */
export type EditorEventFunc = (
  item: Record<string, unknown>,
  editUtil: EditUtil,
  identifier: string,
  event: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Custom functionality on editor got focus
 *
 * @param mode Edit mode (add, edit, view)
 * @param item Instance of business object for editing
 * @param editUtil Adapter for accessing editor components by data member
 * @param identifier Configured data member of editor
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 */
export type EditorEnteredFunc = (
  mode: string,
  item: Record<string, unknown>,
  editUtil: EditUtil,
  identifier: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Custom functionality on editor validation (if custom validation rules are set)
 *
 * @param item Instance of business object for editing
 * @param editUtil Adapter for accessing editor components by data member
 * @param identifier Configured data member of editor
 * @param value Current value of editor
 * @param validation Identifier of custom validation rule
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 * @returns true if current value is valid, false if not
 */
export type EditorValidatingFunc = (
  item: Record<string, unknown>,
  editUtil: EditUtil,
  identifier: string,
  value: ValueType,
  validation: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil
) => boolean;

/**
 * Manipulate cell options on detail member grid before rendering
 *
 * @param mode Edit mode (add, edit, view)
 * @param item Instance of edited root business object
 * @param detailItem Instance of edited detail item
 * @param identifier Configured data member of editor
 * @param options Configured cell options
 * @param util Utility for performing misc operations
 */
export type DetailGridCellPreparingFunc = (
  mode: string,
  item: CrudItem,
  detailItem: Record<string, unknown>,
  identifier: string,
  options: GridLayoutColumn,
  util: ScriptUtil
) => void;

/**
 * Validate detail row values
 *
 * @param mode Edit mode (add, edit, view)
 * @param item Instance of edited root business object
 * @param detailItem Instance of edited detail item
 * @param identifier Configured data member of detail grid
 * @param util Utility for performing misc operations
 * @returns Custom validation message if validation failed, otherwise undefined
 */
export type DetailGridRowValidatingFunc = (
  mode: string,
  item: CrudItem,
  detailItem: Record<string, unknown>,
  identifier: string,
  util: ScriptUtil
) => string|undefined;

/**
 * Initialize new instance of detail item
 *
 * @param dataMember Configured data member of detail grid
 * @param item Instance of edited root business object
 * @param detailItem Instance of edited detail item
 * @param util Utility for performing misc operations
 */
export type InitNewDetailItemFunc = (
  dataMember: string,
  item: CrudItem,
  detailItem: Record<string, unknown>,
  util: ScriptUtil
) => void;

/**
 * Prepare custom function before execution
 *
 * @param identifier Identifier of custom function
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 * @param executeCallback Execute custom function with prepared params
 * @param messageCallback Show notification message to user
 * @param params Optional additional query params provided by parent
 * @param selection Current selected business objects (only for function type 'edit')
 */
export type PrepareCustomFunctionFunc = (
  identifier: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil,
  executeCallback: (param: Record<string, unknown>) => void,
  messageCallback: (message: string) => void,
  params?: QueryParams,
  selection?: Array<CrudItem>
) => void;

/**
 * Evaluation custom function result after execution
 *
 * @param identifier Identifier of custom function
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 * @param saveCallback Execute save or batch save operation with prepared objects
 * @param messageCallback Show notification message to user
 */
export type EvaluateCustomFunctionFunc = (
  identifier: string,
  lookups: Record<string, unknown>,
  util: ScriptUtil,
  param: Record<string, unknown>,
  saveCallback: (param: Record<string, unknown>) => void,
  messageCallback: (message: string) => void
) => void;

/**
 * Additional options for custom import function
 */
export interface ImportFunctionOptions {
  /**
   * Data format for import
   */
  format: 'xml' | 'json' | 'csv',
}

/**
 * Additional options for custom export function
 */
export interface ExportFunctionOptions {
  /**
   * Data format for export
   */
  format: 'xml' | 'json' | 'csv',
}

/**
 * Interface of custom crud function definition
 */
export interface EntityCustomFunction {
  /**
   * Identifier of owning business object
   */
  entity?: string;

  /**
   * Unique id of custom function
   */
  id: string;

  /**
   * Function operation type
   * add: Function is creating new business objects
   * edit: Function is editing existing selected business objects
   * import: Function to import external data
   * export: Function to export data
   * default_add: Replacement for default add function
   * default_view: Replacement for default view function
   * default_edit: Replacement for default edit function
   */
  type: 'add' | 'edit' | 'import' | 'export' | 'default_add' | 'default_view' | 'default_edit';

  /**
   * Display text of function
   */
  text: string;

  /**
   * CSS class for icon
   */
  icon?: string;

  /**
   * Set if function supports batch operations of multiple business object instances
   */
  multi?: boolean;

  /**
   * Set if function uses a propritary editor.
   * If set, prepareCustomFunction has to supply editor url as callback parameter
   */
  externalEditor?: boolean;

  /**
   * Identifier of edit layout definition used by function.
   * If not set the primary edit layout will be used
   */
  editLayout: string;

  /**
   * Function type specific additional options
   */
  options?: ImportFunctionOptions | ExportFunctionOptions;
}

/**
 * Detail layout definition for expandable detail view in grid/list
 */
export interface DetailLayout {
  /**
   * Number of columns for display layout
   */
  colCount?: number;

  /**
   * Specific column count definition for small/big screens
   */
  colCountByScreen?: { sm?: number; lg?: number };

  /**
   * Optional fixed height of detail layout
   */
  height?: string;

  /**
   * List of detail layout items
   */
  items: Array<EditLayoutItem>;
}

/**
 * Available Options for edit/detail layout items
 */
export interface EditLayoutItemOptions {
  /**
   * Display text for label
   */
  caption?: string;

  /**
   * Property of business object the editor is attached to
   */
  dataMember?: string;

  /**
   * If set or undefined, the element will be visible for user
   */
  visible?: boolean;

  /**
   * If set, property of business object is required to have a value
   */
  required?: boolean;

  /**
   * If set, the property is not changeable by user
   */
  readonly?: boolean;

  /**
   * Lookup identifier (only for editors with select list functionality)
   */
  lookup?: string;

  /**
   * Optional data member for lookup query (only for editors with select list functionality).
   * The current business object property value of data member will be supplied as parameter to lookup query
   */
  lookupParam?: string;

  /**
   * Value data member in lookup query result (only for editors with select list functionality)
   */
  valueExpr?: string;

  /**
   * Display data member in lookup query result (only for editors with select list functionality)
   */
  displayExpr?: string;

  /**
   * Additional hint data member in lookup query result (only for editors with select list functionality)
   */
  hintExpr?: string;

  /**
   * Optional fixed height for editor component
   */
  height?: string;

  /**
   * Optional fixed width for editor component
   */
  width?: string;

  /**
   * Accept alternative custom user input as value (only for editors with select list functionality)
   */
  acceptCustomValue?: boolean;

  /**
   * Data member of business object containing select list (only for editors with select list functionality)
   */
  itemsMember?: string;

  /**
   * Data member of lookup params containing select list (only for editors with select list functionality)
   */
  lookupMember?: string;

  /**
   * Hint displayed as tooltip on editor
   */
  hint?: string;

  /**
   * Static item list used as select list (only for editors with select list functionality)
   */
  items?: Array<{ Value: string; Text: string }>;

  /**
   * Editor component specific additional options
   */
  itemoptions?: unknown;

  /**
   * List of custom validation rules (Have to be checked in editorValidating custom script)
   */
  validations?: Array<{ identifier: string; message: string }>;
}

/**
 * Interface of edit layout item definition
 */
export interface EditLayoutItem {
  /**
   * Editor component type (specific for used rendering engine)
   */
  type: string;

  /**
   * Ignore item on rendering
   */
  ignore?: boolean;

  /**
   * Options for editor component configuration
   */
  options?: EditLayoutItemOptions;

  /**
   * Number of cols for layouting child editor items (only for container types)
   */
  colCount?: number;

  /**
   * Number of cols occupied by editor in layout
   */
  colSpan?: number;

  /**
   * Child editor components (only for container types)
   */
  items?: Array<EditLayoutItem>;
}

/**
 * Definition of column in table display
 */
export interface GridLayoutColumn extends EditLayoutItemOptions {
  /**
   * Type of table column (specific for used rendering engine)
   */
  type: string;

  /**
   * Precision for displaying floating numbers
   */
  precision?: number;

  /**
   * Fixing position of column in table
   */
  fixedPosition?: 'left' | 'right';

  /**
   * Default sorting setting of column
   */
  sorting?: 'asc' | 'desc';

  /**
   * Position of column in table (ascending sorted left to right)
   */
  position?: number;

  /**
   * Hiding priority of column for hiding columns on small screens
   */
  hidingPriority?: number;

  /**
   * Default value for column visibility
   */
  visible?: boolean;

  /**
   * Enable inline editing of column value in table
   */
  editable?: boolean;

  /**
   * Custom edit function executed on inline editing
   */
  editFunction?: string;

  /**
   * Identifier of edit layout used in popup edit box
   */
  popuplayout?: string;
}

/**
 * Definition of table layout for listing business objects
 */
export interface GridLayout {
  /**
   * Unique identifier of table layout
   */
  identifier: string;

  /**
   * Headline of table
   */
  title: string;

  /**
   * Identifier of default edit layout used for add/edit operations
   */
  editLayout?: string;

  /**
   * Enable multi select functionality in table
   */
  allowMultiselect?: boolean;

  /**
   * Enable inline editing functionality in table
   */
  allowEditing?: boolean;

  /**
   * List of column definitions
   */
  columns: Array<GridLayoutColumn>;

  /**
   * List of definitions for group/total summary
   */
  summaries?: Array<{
    /**
     * Data member in business object this summary is attached to
     */
    dataMember: string;

    /**
     * Display summary in group footer
     */
    groupSummary: boolean;

    /**
     * Display summary in total summary footer
     */
    totalSummary: boolean;

    /**
     * Aggregate function type for summary (specific for used rendering engine)
     */
    summaryType: string;
  }>;

  /**
   * Defnition of detail layout in master/detail display
   */
  details?: DetailLayout;
}

/**
 * Definition of edit layout for editing/adding business objects
 */
export interface EditLayout {
  /**
   * Unique identifier of edit layout
   */
  identifier: string;

  /**
   * Number of cols for layouting child editor items
   */
  colCount?: number;

  /**
   * Specific column count definition for small/big screens
   */
  colCountByScreen?: { sm?: number; lg?: number };

  /**
   * Display editor in full screen popup
   */
  fullscreen?: boolean;

  /**
   * List of layout items
   */
  items: Array<EditLayoutItem>;
}

/**
 * Definition of business object specific custom scripts
 */
export interface CompiledEntityCustomScripts {
  /**
   * Custom rights check operations
   */
  rightsCheck: EntityRightsCheckFunc;

  /**
   * Prepare custom param for extendedRightsCheck if operation is not connected to specific business object   
   */
  rightsParamForHead: RightsParamForHeadFunc;

  /**
   * Prepare custom param for extendedRightsCheck if operation is connected to specific business object  (view, edit, delete)
   */
  rightsParamForItem: RightsParamForItemFunc;

  /**
   * Prepare custom param object containing values needed for other custom scripts
   */
  prepareCustomParam: PrepareCustomParamFunc;

  /**
   * Manipulate configured grid layout before rendering
   */
  prepareGridLayout: PrepareGridLayoutFunc;

  /**
   * Manipulate configured edit layout before rendering
   */
  prepareEditLayout: PrepareEditLayoutFunc;

  /**
   * Manipulate materialized edit layout item template instance before rendering
   */
  prepareMaterializedEditItem: PrepareMaterializedEditItemFunc;  

  /**
   * Manipulate editor options before rendering
   */
  editorPreparing: EditorPreparingFunc;

  /**
   * Configure editor instance after rendering
   */
  editorInitialized: EditorInitializedFunc;

  /**
   * Custom functionality on editor value changed
   */
  editorValueChanged: EditorValueChangedFunc;

  /**
   * Custom functionality on editor specific event
   */
  editorEvent: EditorEventFunc;

  /**
   * Custom functionality on editor got focus
   */
  editorEntered: EditorEnteredFunc;

  /**
   * Custom functionality on editor validation (if custom validation rules are set)
   */
  editorValidating: EditorValidatingFunc;

  /**
   * Manipulate cell options on detail member grid before rendering
   */
  detailGridCellPreparing: DetailGridCellPreparingFunc;

  /**
   * Validate detail row values
   */
  detailGridRowValidating: DetailGridRowValidatingFunc;

  /**
   * Initialize new instance of detail item
   */
  initNewDetailItem: InitNewDetailItemFunc;

  /**
   * Prepare custom function before execution   
   */
  prepareCustomFunction: PrepareCustomFunctionFunc;

  /**
   * Evaluation custom function result after execution
   */
  evaluateCustomFunction: EvaluateCustomFunctionFunc;
}

/**
 * Defintion of metadata for business object
 */
export interface CompiledEntityMetadata {
  /**
   * Application scope the business object is nested in
   */
  application: string;

  /**
   * Unique identifier of business object
   */
  entity: string;

  /**
   * Display name of business object
   */
  displayName: string;

  /**
   * Base url of crud operations REST API
   */
  baseUrl: string;

  /**
   * Map items received from API
   */
  itemMappingScript: ItemMappingFunc;

  /**
   * Reverse map items for sending to API
   */
  itemReverseMappingScript: ItemMappingFunc;

  /**
   * Container for custom script operations
   */
  compiledCustomScripts: CompiledEntityCustomScripts;

  /**
   * Collection of defined custom functions
   */
  customFunctions?: Array<EntityCustomFunction>;

  /**
   * Collection of defined grid layouts
   */
  gridLayouts: Array<GridLayout>;

  /**
   * Collection of defined edit layouts
   */
  editLayouts: Array<EditLayout>;

  /**
   * Collection of defined lookups
   */
  lookups: Array<{
    identifier: string;
    id: string;
    valueMember: string;
    displayMember: string;
    type: number;
    hasParam: boolean;
  }>;

  /**
   * Collection of defined picklists
   */
  picklists: Array<{ identifier: string; entity: string; field: string }>;

  /**
   * List of entity templates
   */
  templates?: Array<Template>;

  /**
   * Member of business object containing current state code
   */
  stateColumn: string;
}
