import JSON5 from 'json5';
import { applyOverlayToExport, deepMerge } from './overlay';

describe('overlay', () => {
  describe('deepMerge', () => {
    it('merges plain objects recursively', () => {
      expect(deepMerge({ a: 1, b: { c: 2, d: 3 } }, { b: { c: 9 } })).toEqual({ a: 1, b: { c: 9, d: 3 } });
    });

    it('merges arrays by index and keeps untouched entries', () => {
      expect(deepMerge([1, 2, 3], [7])).toEqual([7, 2, 3]);
      expect(deepMerge([1], [7, 8])).toEqual([7, 8]);
    });

    it('merges object with numeric keys into arrays', () => {
      expect(deepMerge([{ a: 1 }, { b: 2 }], { 1: { b: 9 } })).toEqual([{ a: 1 }, { b: 9 }]);
    });

    it('replaces scalars', () => {
      expect(deepMerge('old', 'new')).toEqual('new');
      expect(deepMerge(undefined, { x: 1 })).toEqual({ x: 1 });
    });
  });

  describe('applyOverlayToExport', () => {
    const base = {
      DisplayName: 'Person',
      GridLayout: "[{identifier:'primary',columns:[{dataMember:'FirstName',caption:'First name'},{dataMember:'SirName',caption:'Sir name'}]}]"
    };

    it('keeps base export without overlay fields', () => {
      const merged = applyOverlayToExport(base, {});

      expect(merged['DisplayName']).toEqual('Person');
      expect(merged['GridLayout']).toEqual(base['GridLayout']);
    });

    it('applies partial caption change inside json5 string fields', () => {
      const merged = applyOverlayToExport(base, {
        GridLayout: {
          0: {
            columns: {
              1: { caption: 'Family name' }
            }
          }
        }
      });

      const gridLayout = JSON5.parse(merged['GridLayout'] as string) as Array<{ columns: Array<{ caption: string }> }>;

      expect(gridLayout[0].columns[0].caption).toEqual('First name');
      expect(gridLayout[0].columns[1].caption).toEqual('Family name');
    });

    it('replaces json5 string fields given as raw strings', () => {
      const merged = applyOverlayToExport(base, {
        DisplayName: 'Person overridden',
        GridLayout: "[{identifier:'other',columns:[]}]"
      });

      expect(merged['DisplayName']).toEqual('Person overridden');
      expect(JSON5.parse(merged['GridLayout'] as string)[0].identifier).toEqual('other');
    });
  });
});
