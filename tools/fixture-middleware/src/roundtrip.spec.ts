import path from 'path';
import { compileEntityMetadata, EntityMetadata } from '@ballware/rest-meta-api';
import { createContext } from './context';

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');

describe('fixture round trip', () => {
  it('compiles person.json export with compileEntityMetadata without errors', () => {
    const context = createContext({
      roots: [FIXTURES],
      tenant: 'test',
      user: 'test-user',
      persistOverlay: false,
      allowOverlayWrite: true
    });

    const wire = context.getEntityExport('person') as unknown as EntityMetadata;

    const compiled = compileEntityMetadata(wire);

    expect(compiled.application).toEqual('ballware');
    expect(compiled.entity).toEqual('person');
    expect(compiled.baseUrl).toEqual('{generic}ballware/person');
    expect(compiled.gridLayouts).toHaveLength(1);
    expect(compiled.gridLayouts?.[0].columns).toHaveLength(2);
    expect(compiled.editLayouts).toHaveLength(1);
    expect(compiled.lookups).toHaveLength(1);
    expect(typeof compiled.compiledCustomScripts?.rightsCheck).toEqual('function');
    expect(typeof compiled.itemMappingScript).toEqual('function');
  });
});
