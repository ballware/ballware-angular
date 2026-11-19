export const PAGE = 'e2e-orderslist';
export const TOOLBAR = 'e2e-orderslist.toolbar.0';
export const STATUS_FILTER = 'e2e-orderslist.toolbar.0.statusfilter';
export const CRUD_CONTAINER = 'e2e-orderslist.orderslist-0.0';
export const ENTITY_SCOPE = 'e2e-orderslist.orderslist-0.0.demoorder.0';
export const ORDERS_GRID = 'e2e-orderslist.orderslist-0.0.demoorder.0.ordersgrid-0.0';
export const EDIT_DIALOG = 'e2e-orderslist.orderslist-0.0.demoorder.0.dialog.0';
export const EDIT_LAYOUT = 'e2e-orderslist.orderslist-0.0.demoorder.0.dialog.0.edit.0';

export const editItem = (name: string, index: number): string => `${EDIT_LAYOUT}.${name}-${index}.0`;
