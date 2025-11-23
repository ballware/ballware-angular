import { createLookupDelegateBuilder, LookupDelegateBuilder } from './lookupbuilder';
import { LookupDelegate } from './lookupdelegate';
import {
  LookupDescriptor,
  LookupCreator,
  PickvalueCreator,
  LookupStoreDescriptor
} from '@ballware/meta-services';
import { ApiError } from '@ballware/meta-api';
import { of, throwError, firstValueFrom } from 'rxjs';
import { CustomItemCreatingEvent as SelectBoxCustomItemCreatingEvent } from 'devextreme/ui/select_box';
import { CustomItemCreatingEvent as TagBoxCustomItemCreatingEvent } from 'devextreme/ui/tag_box';

describe('LookupDelegateBuilder', () => {
  let mockLookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | unknown[]>;
  let builder: LookupDelegateBuilder;

  beforeEach(() => {
    mockLookups = {};
    builder = createLookupDelegateBuilder(mockLookups);
  });

  describe('createLookupDelegateBuilder', () => {
    it('sollte einen Builder erstellen', () => {
      expect(builder).toBeDefined();
      expect(builder.forIdentifier).toBeDefined();
      expect(builder.forStaticItems).toBeDefined();
      expect(builder.build).toBeDefined();
    });
  });

  describe('forStaticItems', () => {
    it('sollte einen Delegate mit statischen Items erstellen', async () => {
      const staticItems = [
        { Id: '1', Name: 'Item 1' },
        { Id: '2', Name: 'Item 2' }
      ];

      const delegate = builder
        .forStaticItems(staticItems)
        .build();

      expect(delegate).toBeDefined();
      expect(delegate.dataSource).toBeDefined();
      expect(delegate.valueExpr).toBe('Id');
      expect(delegate.displayExpr).toBe('Name');

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const items = delegate.dataSource.items();
        expect(items).toHaveLength(2);
        expect(items[0].Id).toBe('1');
        expect(items[1].Name).toBe('Item 2');
      }
    });

    it('sollte custom valueExpr und displayExpr verwenden', () => {
      const staticItems = [
        { key: 'a', label: 'Label A' },
        { key: 'b', label: 'Label B' }
      ];

      const delegate = builder
        .forStaticItems(staticItems)
        .withValueExpr('key')
        .withDisplayExpr('label')
        .build();

      expect(delegate.valueExpr).toBe('key');
      expect(delegate.displayExpr).toBe('label');
    });
  });

  describe('forIdentifier mit regulärem Lookup', () => {
    it('sollte einen Delegate für einen regulären Lookup erstellen', async () => {
      const mockItems = [
        { Id: '1', Name: 'Test 1' },
        { Id: '2', Name: 'Test 2' }
      ];

      mockLookups['testLookup'] = {
        type: 'lookup',
        store: {
          listFunc: () => of(mockItems),
          byIdFunc: (id: string) => of(mockItems.find(i => i.Id === id)!)
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      };

      const delegate = builder
        .forIdentifier('testLookup')
        .build();

      expect(delegate).toBeDefined();
      expect(delegate.dataSource).toBeDefined();
      expect(delegate.valueExpr).toBe('Id');
      expect(delegate.displayExpr).toBe('Name');

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const items = delegate.dataSource.items();
        expect(items).toHaveLength(2);
      }
    });

    it('sollte groupBy unterstützen', async () => {
      mockLookups['testLookup'] = {
        type: 'lookup',
        store: {
          listFunc: () => of([]),
          byIdFunc: (_id: string) => of({})
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      };

      const delegate = builder
        .forIdentifier('testLookup')
        .withGroupBy('category')
        .build();

      expect(delegate).toBeDefined();
      const grouped = await firstValueFrom(delegate.grouped$);
      expect(grouped).toBe(true);
    });

    it('sollte API-Fehler behandeln', async () => {
      const mockError: ApiError = {
        message: 'Test error',
        status: 500,
        statusText: 'Internal Server Error'
      };

      mockLookups['testLookup'] = {
        type: 'lookup',
        store: {
          listFunc: () => throwError(() => mockError),
          byIdFunc: (_id: string) => throwError(() => mockError)
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      };

      const errorHandler = jest.fn();

      const delegate = builder
        .forIdentifier('testLookup')
        .withApiErrorHandler(errorHandler)
        .build();

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        expect(errorHandler).toHaveBeenCalledWith(mockError);
      }
    });
  });

  describe('forIdentifier mit Autocomplete', () => {
    it('sollte einen Delegate für Autocomplete erstellen', async () => {
      const mockItems = ['item1', 'item2', 'item3'];

      mockLookups['autocompleteLookup'] = {
        type: 'autocomplete',
        store: {
          listFunc: () => of(mockItems as unknown as Record<string, unknown>[]),
          byIdFunc: (_id: string) => of({})
        } as LookupStoreDescriptor
      };

      const delegate = builder
        .forIdentifier('autocompleteLookup')
        .build();

      expect(delegate).toBeDefined();
      expect(delegate.dataSource).toBeDefined();

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const items = delegate.dataSource.items();
        expect(items).toHaveLength(3);
      }
    });
  });

  describe('forIdentifier mit LookupCreator', () => {
    it('sollte einen Delegate mit Parameter erstellen', () => {
      const mockCreator: LookupCreator = (param: string | string[]) => ({
        type: 'lookup',
        store: {
          listFunc: () => of([{ Id: param, Name: `Item ${param}` }]),
          byIdFunc: (id: string) => of({ Id: id, Name: `Item ${id}` })
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      });

      mockLookups['creatorLookup'] = mockCreator;

      const getDelegate = jest.fn().mockReturnValue('testParam');

      const delegate = builder
        .forIdentifier('creatorLookup')
        .withParamFromMember('paramField', getDelegate)
        .build();

      expect(delegate).toBeDefined();
      expect(getDelegate).toHaveBeenCalledWith('paramField');
    });
  });

  describe('forIdentifier mit PickvalueCreator', () => {
    it('sollte einen Delegate für Pickvalues erstellen', () => {
      const mockPickvalueCreator: PickvalueCreator = (entity: string, field: string) => ({
        type: 'lookup',
        store: {
          listFunc: () => of([{ Id: '1', Name: `${entity}.${field}` }]),
          byIdFunc: (id: string) => of({ Id: id, Name: `${entity}.${field}` })
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      });

      mockLookups['pickvalueLookup'] = mockPickvalueCreator;

      const delegate = builder
        .forIdentifier('pickvalueLookup')
        .withPickvaluesForEntityAndField('TestEntity', 'TestField')
        .build();

      expect(delegate).toBeDefined();
    });
  });

  describe('withUnknownLookupFallback', () => {
    it('sollte Fallback für unbekannte Lookups verwenden', () => {
      const fallbackLookup: LookupDescriptor = {
        type: 'lookup',
        store: {
          listFunc: () => of([{ Id: 'fallback', Name: 'Fallback Item' }]),
          byIdFunc: (id: string) => of({ Id: id, Name: 'Fallback Item' })
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      };

      const fallbackHandler = jest.fn().mockReturnValue(fallbackLookup);

      const delegate = builder
        .forIdentifier('unknownLookup')
        .withUnknownLookupFallback(fallbackHandler)
        .build();

      expect(delegate).toBeDefined();
      expect(fallbackHandler).toHaveBeenCalledWith('unknownLookup');
    });
  });

  describe('forItemsFromMember', () => {
    it('sollte Items aus einem Datenmember laden', async () => {
      const items = [
        { Id: 'm1', Name: 'Member Item 1' },
        { Id: 'm2', Name: 'Member Item 2' }
      ];

      const getDelegate = jest.fn().mockReturnValue(items);

      const delegate = builder
        .forItemsFromMember('itemsField', getDelegate)
        .build();

      expect(delegate).toBeDefined();
      expect(getDelegate).toHaveBeenCalledWith('itemsField');

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const loadedItems = delegate.dataSource.items();
        expect(loadedItems).toHaveLength(2);
      }
    });
  });

  describe('LookupDelegate', () => {
    let delegate: LookupDelegate;

    beforeEach(() => {
      const staticItems = [
        { Id: '1', Name: 'Item 1', hint: 'Hint 1' },
        { Id: '2', Name: 'Item 2', hint: 'Hint 2' }
      ];

      delegate = builder
        .forStaticItems(staticItems)
        .withHintExpr('hint')
        .build();
    });

    it('sollte Observables bereitstellen', async () => {
      expect(delegate.dataSource$).toBeDefined();
      expect(delegate.displayExpr$).toBeDefined();
      expect(delegate.valueExpr$).toBeDefined();
      expect(delegate.lookupItems$).toBeDefined();
      expect(delegate.acceptCustomValue$).toBeDefined();
      expect(delegate.grouped$).toBeDefined();
      expect(delegate.hasLookupItemHint$).toBeDefined();

      const hasHint = await firstValueFrom(delegate.hasLookupItemHint$);
      expect(hasHint).toBe(true);
    });

    it('sollte Key-Werte von Items abrufen', () => {
      const item = { Id: 'test-id', Name: 'Test Name' };
      const keyValue = delegate.getLookupItemKeyValue(item);
      expect(keyValue).toBe('test-id');
    });

    it('sollte Display-Werte von Items abrufen', () => {
      const item = { Id: 'test-id', Name: 'Test Name' };
      const displayValue = delegate.getLookupItemDisplayValue(item);
      expect(displayValue).toBe('Test Name');
    });

    it('sollte Hint-Werte von Items abrufen', () => {
      const item = { Id: 'test-id', Name: 'Test Name', hint: 'Test Hint' };
      const hintValue = delegate.getLookupItemHintValue(item);
      expect(hintValue).toBe('Test Hint');
    });

    it('sollte Custom Items erstellen', () => {
      const event = {
        text: 'New Custom Item',
        customItem: undefined
      } as SelectBoxCustomItemCreatingEvent;

      delegate.onCustomItemCreating(event);

      expect(event.customItem).toBeDefined();
      expect(delegate.getLookupItemKeyValue(event.customItem as Record<string, unknown>)).toBe('New Custom Item');
      expect(delegate.getLookupItemDisplayValue(event.customItem as Record<string, unknown>)).toBe('New Custom Item');
    });

    it('sollte Lookup-Items setzen', async () => {
      const newItems = [
        { Id: 'new1', Name: 'New Item 1' },
        { Id: 'new2', Name: 'New Item 2' }
      ];

      delegate.setLookupItems(newItems);

      const items = await firstValueFrom(delegate.lookupItems$);
      expect(items).toEqual(newItems);

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const loadedItems = delegate.dataSource.items();
        expect(loadedItems).toHaveLength(2);
      }
    });

    it('sollte acceptCustomValue setzen', async () => {
      expect(delegate.acceptCustomValue).toBe(false);

      delegate.setAcceptCustomValue(true);

      const acceptValue = await firstValueFrom(delegate.acceptCustomValue$);
      expect(acceptValue).toBe(true);
      expect(delegate.acceptCustomValue).toBe(true);
    });
  });

  describe('withAcceptCustomValue', () => {
    it('sollte acceptCustomValue auf true setzen', async () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .withAcceptCustomValue(true)
        .build();

      expect(delegate.acceptCustomValue).toBe(true);
      const acceptValue = await firstValueFrom(delegate.acceptCustomValue$);
      expect(acceptValue).toBe(true);
    });

    it('sollte acceptCustomValue auf false setzen', async () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .withAcceptCustomValue(false)
        .build();

      expect(delegate.acceptCustomValue).toBe(false);
    });

    it('sollte Standard-acceptCustomValue verwenden', async () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      expect(delegate.acceptCustomValue).toBe(false);
    });
  });

  describe('Komplexe Szenarien', () => {
    it('sollte alle Optionen kombinieren', async () => {
      const mockItems = [
        { Id: '1', Name: 'Item 1', category: 'A', hint: 'Hint 1' },
        { Id: '2', Name: 'Item 2', category: 'B', hint: 'Hint 2' }
      ];

      mockLookups['complexLookup'] = {
        type: 'lookup',
        store: {
          listFunc: () => of(mockItems),
          byIdFunc: (id: string) => of(mockItems.find(i => i.Id === id)!)
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      };

      const errorHandler = jest.fn();

      const delegate = builder
        .forIdentifier('complexLookup')
        .withValueExpr('Id')
        .withDisplayExpr('Name')
        .withHintExpr('hint')
        .withGroupBy('category')
        .withAcceptCustomValue(true)
        .withApiErrorHandler(errorHandler)
        .build();

      expect(delegate).toBeDefined();
      expect(delegate.valueExpr).toBe('Id');
      expect(delegate.displayExpr).toBe('Name');
      expect(delegate.acceptCustomValue).toBe(true);

      const hasHint = await firstValueFrom(delegate.hasLookupItemHint$);
      expect(hasHint).toBe(true);

      const isGrouped = await firstValueFrom(delegate.grouped$);
      expect(isGrouped).toBe(true);
    });

    it('sollte mit TagBox CustomItemCreating Event funktionieren', () => {
      const staticItems = [{ Id: '1', Name: 'Item 1' }];

      const delegate = builder
        .forStaticItems(staticItems)
        .build();

      const event = {
        text: 'Tag Item',
        customItem: undefined
      } as TagBoxCustomItemCreatingEvent;

      delegate.onCustomItemCreating(event);

      expect(event.customItem).toBeDefined();
      expect(delegate.getLookupItemKeyValue(event.customItem as Record<string, unknown>)).toBe('Tag Item');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leeren statischen Items umgehen', async () => {
      const delegate = builder
        .forStaticItems([])
        .build();

      expect(delegate.dataSource).toBeDefined();

      if (delegate.dataSource) {
        await delegate.dataSource.load();
        const items = delegate.dataSource.items();
        expect(items).toHaveLength(0);
      }
    });

    it('sollte Standard-valueExpr verwenden', () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      expect(delegate.valueExpr).toBe('Id');
    });

    it('sollte Standard-displayExpr verwenden', () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      expect(delegate.displayExpr).toBe('Name');
    });

    it('sollte ohne hintExpr keinen Hint zurückgeben', () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      const item = { Id: '1', Name: 'Test' };
      const hint = delegate.getLookupItemHintValue(item);
      expect(hint).toBeUndefined();
    });

    it('sollte ohne groupBy nicht gruppieren', async () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      const isGrouped = await firstValueFrom(delegate.grouped$);
      expect(isGrouped).toBe(false);
    });

    it('sollte ohne lookup identifier funktionieren', () => {
      const delegate = builder
        .forStaticItems([{ Id: '1', Name: 'Test' }])
        .build();

      expect(delegate).toBeDefined();
    });
  });
});

