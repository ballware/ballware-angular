import {
  getEditItemTestIdSegment,
  getPageItemTestIdSegment,
  getToolbarItemTestId,
  safeTestIdSegment
} from './testidentifiers';

describe('testidentifiers', () => {
  describe('safeTestIdSegment', () => {
    it('normalizes non alphanumeric characters to underscore', () => {
      expect(safeTestIdSegment('Order List', 'item')).toEqual('Order_List');
    });

    it('trims surrounding underscores', () => {
      expect(safeTestIdSegment('__order--list__', 'item')).toEqual('order_list');
    });

    it('keeps alphanumeric identifiers untouched', () => {
      expect(safeTestIdSegment('demoorder42', 'item')).toEqual('demoorder42');
    });

    it('falls back on empty values', () => {
      expect(safeTestIdSegment('', 'Order_List')).toEqual('Order_List');
      expect(safeTestIdSegment(undefined, 'Order_List')).toEqual('Order_List');
      expect(safeTestIdSegment(null, '')).toEqual('item');
    });

    it('stringifies numbers and booleans', () => {
      expect(safeTestIdSegment(42, 'item')).toEqual('42');
      expect(safeTestIdSegment(true, 'item')).toEqual('true');
    });
  });

  describe('getPageItemTestIdSegment', () => {
    it('prefers itemoptions identifier', () => {
      expect(getPageItemTestIdSegment({
        type: 'entitygrid',
        options: { itemoptions: { identifier: 'main', entity: 'demoorder' } as never }
      }, 1)).toEqual('main-1');
    });

    it('falls back to entity', () => {
      expect(getPageItemTestIdSegment({
        type: 'entitygrid',
        options: { itemoptions: { entity: 'demoorder' } as never }
      }, 0)).toEqual('demoorder-0');
    });

    it('falls back to statistic', () => {
      expect(getPageItemTestIdSegment({
        type: 'statistic',
        options: { itemoptions: { statistic: 'amounts' } as never }
      }, 2)).toEqual('amounts-2');
    });

    it('falls back to caption', () => {
      expect(getPageItemTestIdSegment({
        type: 'grid',
        options: { itemoptions: { caption: 'Open Orders' } as never }
      }, 0)).toEqual('Open_Orders-0');
    });

    it('falls back to type', () => {
      expect(getPageItemTestIdSegment({ type: 'tabs' }, 3)).toEqual('tabs-3');
      expect(getPageItemTestIdSegment(undefined, 4)).toEqual('item-4');
    });
  });

  describe('getEditItemTestIdSegment', () => {
    it('prefers dataMember', () => {
      expect(getEditItemTestIdSegment({
        type: 'text',
        options: {
          dataMember: 'ORDERNR',
          caption: 'Order no',
          itemoptions: { identifier: 'ident' } as never
        }
      }, 1)).toEqual('ORDERNR-1');
    });

    it('falls back to itemoptions identifier', () => {
      expect(getEditItemTestIdSegment({
        type: 'statistic',
        options: { itemoptions: { identifier: 'statistic1' } as never }
      }, 0)).toEqual('statistic1-0');
    });

    it('falls back to caption', () => {
      expect(getEditItemTestIdSegment({
        type: 'text',
        options: { caption: 'Customer Name' }
      }, 2)).toEqual('Customer_Name-2');
    });

    it('falls back to type', () => {
      expect(getEditItemTestIdSegment({ type: 'empty' }, 0)).toEqual('empty-0');
      expect(getEditItemTestIdSegment(undefined, 1)).toEqual('item-1');
    });
  });

  describe('getToolbarItemTestId', () => {
    it('appends safe name segment to parent path', () => {
      expect(getToolbarItemTestId('e2e-orderslist.toolbar.0', 'createorder')).toEqual('e2e-orderslist.toolbar.0.createorder');
    });

    it('normalizes captions without name', () => {
      expect(getToolbarItemTestId('page.toolbar.0', 'Create order')).toEqual('page.toolbar.0.Create_order');
    });

    it('falls back to item for missing names', () => {
      expect(getToolbarItemTestId('page.toolbar.0', undefined)).toEqual('page.toolbar.0.item');
    });
  });
});
