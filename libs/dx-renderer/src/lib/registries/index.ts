import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DefaultPageItemRegistry, PAGEITEM_REGISTRY } from './pageitem.registry';
import { DefaultEditItemRegistry, EDITITEM_REGISTRY } from './edititem.registry';
import { COLUMNCONFIGURATION_REGISTRY, DefaultColumnConfigurationRegistry } from './column.registry';

export { PageItemRegistry, PAGEITEM_REGISTRY } from './pageitem.registry';
export { EditItemRegistry, EDITITEM_REGISTRY } from './edititem.registry';

export const provideDefaultItemRegistries = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: PAGEITEM_REGISTRY, useFactory: () => new DefaultPageItemRegistry()
    },
    {
      provide: EDITITEM_REGISTRY, useFactory: () => new DefaultEditItemRegistry()
    },
    {
      provide: COLUMNCONFIGURATION_REGISTRY, useFactory: () => new DefaultColumnConfigurationRegistry()
    }
  ]);
}
