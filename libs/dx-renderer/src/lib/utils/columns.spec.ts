import { createColumnConfiguration } from './columns';
import { GridLayoutColumn, CrudItem } from '@ballware/meta-model';
import {
  LookupDescriptor,
  LookupCreator,
  PickvalueCreator,
  AutocompleteCreator,
  LookupStoreDescriptor,
} from '@ballware/meta-services';
import { Column as DataGridColumn } from 'devextreme/ui/data_grid';
import { Column as TreeListColumn } from 'devextreme/ui/tree_list';
import { ValidationCallbackData } from 'devextreme/common';
import { of } from 'rxjs';

describe('columns', () => {
  let mockTranslate: jest.Mock;
  let mockLookups: Record<
    string,
    | LookupDescriptor
    | LookupCreator
    | PickvalueCreator
    | AutocompleteCreator
    | Array<unknown>
  >;
  let mockLookupParams: Record<string, unknown>;

  beforeEach(() => {
    mockTranslate = jest.fn((id: string, param?: Record<string, unknown>) => {
      if (id === 'validation.messages.required') {
        return `${param?.['label']} ist erforderlich`;
      }
      if (id === 'format.date') {
        return 'dd.MM.yyyy';
      }
      if (id === 'format.datetime') {
        return 'dd.MM.yyyy HH:mm';
      }
      if (id === 'datacontainer.actions.options') {
        return 'Optionen';
      }
      if (id === 'datacontainer.actions.show') {
        return 'Anzeigen';
      }
      if (id === 'datacontainer.actions.edit') {
        return 'Bearbeiten';
      }
      if (id === 'datacontainer.actions.remove') {
        return 'Löschen';
      }
      if (id === 'datacontainer.actions.print') {
        return 'Drucken';
      }
      return id;
    });

    const mockLookupItems = [
      { Id: '1', Name: 'Item 1' },
      { Id: '2', Name: 'Item 2' },
    ];

    mockLookups = {
      testLookup: {
        type: 'lookup',
        store: {
          listFunc: () => of(mockLookupItems),
          byIdFunc: (id: string) => of(mockLookupItems.find(i => i.Id === id)!)
        } as LookupStoreDescriptor,
        valueMember: 'Id',
        displayMember: 'Name'
      } as LookupDescriptor,
    };

    mockLookupParams = {};
  });

  describe('createColumnConfiguration', () => {
    describe('text column', () => {
      it('sollte eine Text-Spalte mit Standard-Eigenschaften erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            visible: true,
            editable: false,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result).toHaveLength(1); // Nur 1 Datenspalte ohne Button-Callbacks
        expect(result[0].dataField).toBe('name');
        expect(result[0].caption).toBe('Name');
        expect(result[0].allowEditing).toBe(false);
        expect(result[0].visible).toBe(true);
      });

      it('sollte Validierungsregeln für erforderliche Felder hinzufügen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            required: true,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].validationRules).toHaveLength(1);
        expect(result[0].validationRules?.[0].type).toBe('required');
      });

      it('sollte fixierte Position unterstützen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            fixedPosition: 'left',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].fixed).toBe(true);
        expect(result[0].fixedPosition).toBe('left');
      });
    });

    describe('bool column', () => {
      it('sollte eine Boolean-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'isActive',
            caption: 'Aktiv',
            type: 'bool',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].dataType).toBe('boolean');
      });
    });

    describe('number column', () => {
      it('sollte eine Zahlen-Spalte ohne Präzision erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'amount',
            caption: 'Betrag',
            type: 'number',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].dataType).toBe('number');
        expect(result[0].format).toBeNull();
        expect(result[0].editorOptions).toEqual({ showSpinButtons: true });
      });

      it('sollte eine Zahlen-Spalte mit Präzision erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'price',
            caption: 'Preis',
            type: 'number',
            precision: 2,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].format).toEqual({ type: 'fixedPoint', precision: 2 });
      });
    });

    describe('date column', () => {
      it('sollte eine Datums-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'birthDate',
            caption: 'Geburtsdatum',
            type: 'date',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].dataType).toBe('date');
        expect(result[0].format).toBe('dd.MM.yyyy');
      });
    });

    describe('datetime column', () => {
      it('sollte eine DateTime-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'createdAt',
            caption: 'Erstellt am',
            type: 'datetime',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].dataType).toBe('datetime');
        expect(result[0].format).toBe('dd.MM.yyyy HH:mm');
      });
    });

    describe('lookup column', () => {
      it('sollte eine Lookup-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'categoryId',
            caption: 'Kategorie',
            type: 'lookup',
            lookup: 'testLookup',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
        expect(result[0].editorOptions).toEqual({ showClearButton: true });
      });

      it('sollte Lookup mit Parameter unterstützen', () => {
        mockLookupParams = { parentId: '123' };

        const mockLookupItems = [
          { Id: '1', Name: 'Item 1' },
          { Id: '2', Name: 'Item 2' },
        ];

        mockLookups['testLookup'] = ((param: string) => ({
          type: 'lookup',
          store: {
            listFunc: () => of(mockLookupItems),
            byIdFunc: (id: string) => of(mockLookupItems.find(i => i.Id === id)!)
          } as LookupStoreDescriptor,
          valueMember: 'Id',
          displayMember: 'Name'
        })) as LookupCreator;

        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'categoryId',
            caption: 'Kategorie',
            type: 'lookup',
            lookup: 'testLookup',
            lookupParam: 'parentId',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
      });
    });

    describe('pickvalue column', () => {
      it('sollte eine Pickvalue-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'status',
            caption: 'Status',
            type: 'pickvalue',
            lookup: 'testLookup',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
      });
    });

    describe('multilookup column', () => {
      it('sollte eine Multi-Lookup-Spalte im row-Modus erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'tags',
            caption: 'Tags',
            type: 'multilookup',
            lookup: 'testLookup',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
        expect(result[0].cellTemplate).toBeDefined();
        expect(result[0].editCellTemplate).toBe('dynamic');
      });

      it('sollte eine Multi-Lookup-Spalte im instant-Modus mit editable erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'tags',
            caption: 'Tags',
            type: 'multilookup',
            lookup: 'testLookup',
            editable: true,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'instant'
        );

        // Im instant-Modus mit editable wird der Typ zu 'dynamic' geändert
        // und hat editCellTemplate: 'dynamic' und showEditorAlways: true
        expect(result[0].editCellTemplate).toBe('dynamic');
        expect(result[0].showEditorAlways).toBe(true);
      });
    });

    describe('staticlookup column', () => {
      it('sollte eine Static-Lookup-Spalte mit Items erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'status',
            caption: 'Status',
            type: 'staticlookup',
            items: [
              { Value: '1', Text: 'Aktiv' },
              { Value: '2', Text: 'Inaktiv' },
            ],
            valueExpr: 'Value',
            displayExpr: 'Text',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
      });

      it('sollte eine Static-Lookup-Spalte mit lookupMember erstellen', () => {
        mockLookupParams = {
          statusList: [
            { Value: 1, Text: 'Aktiv' },
            { Value: 2, Text: 'Inaktiv' },
          ],
        };

        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'status',
            caption: 'Status',
            type: 'staticlookup',
            lookupMember: 'statusList',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].lookup).toBeDefined();
      });
    });

    describe('staticmultilookup column', () => {
      it('sollte eine Static-Multi-Lookup-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'tags',
            caption: 'Tags',
            type: 'staticmultilookup',
            editable: true,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].editCellTemplate).toBe('dynamic');
        expect(result[0].showEditorAlways).toBe(true);
      });
    });

    describe('dynamic column', () => {
      it('sollte eine dynamische Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'custom',
            caption: 'Benutzerdefiniert',
            type: 'dynamic',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].editCellTemplate).toBe('dynamic');
        expect(result[0].showEditorAlways).toBe(true);
      });
    });

    describe('editpopup column', () => {
      it('sollte eine Popup-Spalte erstellen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'details',
            caption: 'Details',
            type: 'popup',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].allowEditing).toBe(false);
        expect(result[0].cellTemplate).toBe('dynamic');
      });
    });

    describe('instant edit mode', () => {
      it('sollte editierbare Spalten im instant-Modus als dynamic markieren', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            editable: true,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'instant'
        );

        expect(result[0].editCellTemplate).toBe('dynamic');
        expect(result[0].showEditorAlways).toBe(true);
      });

      it('sollte editpopup-Spalten nicht als dynamic markieren', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'details',
            caption: 'Details',
            type: 'popup',
            editable: true,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'instant'
        );

        expect(result[0].allowEditing).toBe(false);
        expect(result[0].cellTemplate).toBe('dynamic');
      });
    });

    describe('column sorting', () => {
      it('sollte Spalten nach Position sortieren', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'third',
            caption: 'Dritte',
            type: 'text',
            position: 2,
          } as GridLayoutColumn,
          {
            dataMember: 'first',
            caption: 'Erste',
            type: 'text',
            position: 0,
          } as GridLayoutColumn,
          {
            dataMember: 'second',
            caption: 'Zweite',
            type: 'text',
            position: 1,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].dataField).toBe('first');
        expect(result[1].dataField).toBe('second');
        expect(result[2].dataField).toBe('third');
      });

      it('sollte Sortierreihenfolge aus Spalte übernehmen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            sorting: 'asc',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].sortOrder).toBe('asc');
      });
    });

    describe('mode configurations', () => {
      describe('small mode', () => {
        it('sollte Options-Button hinzufügen', () => {
          const onButtonClick = jest.fn();
          const onButtonAllowed = jest.fn().mockReturnValue(true);

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'small',
            'row',
            onButtonClick,
            onButtonAllowed
          );

          expect(result).toHaveLength(1);
          expect(result[0].type).toBe('buttons');
          expect(result[0].width).toBe('40px');
          expect(result[0].buttons).toHaveLength(1);
        });
      });

      describe('medium mode', () => {
        it('sollte Options-Button hinzufügen', () => {
          const onButtonClick = jest.fn();
          const onButtonAllowed = jest.fn().mockReturnValue(true);

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'medium',
            'row',
            onButtonClick,
            onButtonAllowed
          );

          expect(result).toHaveLength(1);
          expect(result[0].type).toBe('buttons');
        });
      });

      describe('large mode', () => {
        it('sollte alle Action-Buttons hinzufügen', () => {
          const onButtonClick = jest.fn();
          const onButtonAllowed = jest.fn().mockReturnValue(true);

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'large',
            'row',
            onButtonClick,
            onButtonAllowed
          );

          expect(result).toHaveLength(1);
          expect(result[0].type).toBe('buttons');
          expect(result[0].buttons).toHaveLength(5);
        });

        it('sollte keine Buttons hinzufügen wenn Callbacks fehlen', () => {
          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'large',
            'row'
          );

          expect(result).toHaveLength(0);
        });
      });

      describe('detail mode', () => {
        it('sollte Validierungsspalte hinzufügen wenn onRowValidating vorhanden', () => {
          const onRowValidating = jest.fn().mockReturnValue(of(undefined));

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'detail',
            'row',
            undefined,
            undefined,
            onRowValidating
          );

          expect(result).toHaveLength(1);
          expect(result[0].visible).toBe(false);
          expect(result[0].validationRules).toHaveLength(1);
          expect(result[0].validationRules?.[0].type).toBe('async');
        });

        it('sollte keine Validierungsspalte hinzufügen wenn onRowValidating fehlt', () => {
          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'detail',
            'row'
          );

          expect(result).toHaveLength(0);
        });

        it('sollte async validation mit Fehlermeldung ausführen', async () => {
          const errorMessage = 'Validierungsfehler';
          const onRowValidating = jest.fn().mockReturnValue(of(errorMessage));

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'detail',
            'row',
            undefined,
            undefined,
            onRowValidating
          );

          const validationRule = result[0].validationRules?.[0] as any;
          const mockValidationData = {
            data: {},
            rule: { message: '' },
          } as ValidationCallbackData;

          const validationResult = await validationRule.validationCallback(
            mockValidationData
          );

          expect(validationResult).toBe(false);
          expect(mockValidationData.rule.message).toBe(errorMessage);
        });

        it('sollte async validation ohne Fehler bestehen', async () => {
          const onRowValidating = jest.fn().mockReturnValue(of(undefined));

          const result = createColumnConfiguration<DataGridColumn>(
            mockTranslate,
            [],
            mockLookups,
            mockLookupParams,
            'detail',
            'row',
            undefined,
            undefined,
            onRowValidating
          );

          const validationRule = result[0].validationRules?.[0] as any;
          const mockValidationData = {
            data: {},
            rule: { message: '' },
          } as ValidationCallbackData;

          const validationResult = await validationRule.validationCallback(
            mockValidationData
          );

          expect(validationResult).toBe(true);
        });
      });
    });

    describe('button interactions', () => {
      it('sollte onClick für view-Button aufrufen', () => {
        const onButtonClick = jest.fn();
        const onButtonAllowed = jest.fn().mockReturnValue(true);
        const testData = { Id: '123' } as CrudItem;

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          [],
          mockLookups,
          mockLookupParams,
          'large',
          'row',
          onButtonClick,
          onButtonAllowed
        );

        const viewButton = (result[0].buttons as any)[0];
        viewButton.onClick({
          row: { data: testData },
          event: { currentTarget: document.createElement('div') },
        });

        expect(onButtonClick).toHaveBeenCalledWith(
          'view',
          testData,
          expect.any(Element)
        );
      });

      it('sollte Button-Sichtbarkeit über onButtonAllowed prüfen', () => {
        const onButtonClick = jest.fn();
        const onButtonAllowed = jest.fn().mockReturnValue(false);
        const testData = { Id: '123' } as CrudItem;

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          [],
          mockLookups,
          mockLookupParams,
          'large',
          'row',
          onButtonClick,
          onButtonAllowed
        );

        const editButton = (result[0].buttons as any)[1];
        const isVisible = editButton.visible({ row: { data: testData } });

        expect(isVisible).toBe(false);
        expect(onButtonAllowed).toHaveBeenCalledWith('edit', testData);
      });

      it('sollte mit TreeList node.data umgehen können', () => {
        const onButtonClick = jest.fn();
        const onButtonAllowed = jest.fn().mockReturnValue(true);
        const testData = { Id: '123' } as CrudItem;

        const result = createColumnConfiguration<TreeListColumn>(
          mockTranslate,
          [],
          mockLookups,
          mockLookupParams,
          'large',
          'row',
          onButtonClick,
          onButtonAllowed
        );

        const deleteButton = (result[0].buttons as any)[2];
        deleteButton.onClick({
          row: { node: { data: testData } },
          event: { currentTarget: document.createElement('div') },
        });

        expect(onButtonClick).toHaveBeenCalledWith(
          'delete',
          testData,
          expect.any(Element)
        );
      });
    });

    describe('width and visibility', () => {
      it('sollte Spaltenbreite übernehmen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'name',
            caption: 'Name',
            type: 'text',
            width: '200px',
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].width).toBe('200px');
      });

      it('sollte Sichtbarkeit auf false setzen', () => {
        const columns: Array<GridLayoutColumn> = [
          {
            dataMember: 'hidden',
            caption: 'Versteckt',
            type: 'text',
            visible: false,
            position: 0,
          } as GridLayoutColumn,
        ];

        const result = createColumnConfiguration<DataGridColumn>(
          mockTranslate,
          columns,
          mockLookups,
          mockLookupParams,
          'large',
          'row'
        );

        expect(result[0].visible).toBe(false);
      });
    });
  });
});

