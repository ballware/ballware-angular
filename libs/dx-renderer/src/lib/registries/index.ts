import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DefaultPageItemRegistry, PAGEITEM_REGISTRY } from './pageitem.registry';
import { DefaultEditItemRegistry, EDITITEM_REGISTRY } from './edititem.registry';
import { COLUMNCONFIGURATION_REGISTRY, DefaultColumnConfigurationRegistry } from './column.registry';
import { DefaultToolbarItemConfigurationRegistry, TOOLBARITEMCONFIGURATION_REGISTRY } from './toolbaritem.registry';

export { PageItemRegistry, PAGEITEM_REGISTRY } from './pageitem.registry';
export { EditItemRegistry, EDITITEM_REGISTRY } from './edititem.registry';
export { ColumnConfigurationRegistry, COLUMNCONFIGURATION_REGISTRY } from './column.registry';
export { ToolbarItemConfigurationRegistry, TOOLBARITEMCONFIGURATION_REGISTRY } from './toolbaritem.registry';

export const provideDefaultItemRegistries = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: PAGEITEM_REGISTRY, useFactory: () => new DefaultPageItemRegistry()
    },
    {
      provide: EDITITEM_REGISTRY, useFactory: () => new DefaultEditItemRegistry()
    },
    {
      provide: TOOLBARITEMCONFIGURATION_REGISTRY, useFactory: () => new DefaultToolbarItemConfigurationRegistry()
    },
    {
      provide: COLUMNCONFIGURATION_REGISTRY, useFactory: () => new DefaultColumnConfigurationRegistry()
    }
  ]);
}
