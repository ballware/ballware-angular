import { InjectionToken } from '@angular/core';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import { PageToolbarItem } from '@ballware/meta-model';
import { AutocompleteCreator, LookupCreator, LookupDescriptor, PickvalueCreator } from '@ballware/meta-services';

export type ToolbarItemConfigurationFactory = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => ToolbarItem;

export interface ToolbarItemConfigurationRegistry {
  registerToolbarItemConfigurationFactory(
    identifier: string,
    factory: ToolbarItemConfigurationFactory
  ): void;

  resolveToolbarItemConfiguration(
    identifier: string,
    item: PageToolbarItem,
    location: ToolbarItemLocation,
    locateInMenu: LocateInMenuMode,
    lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
    lookupParams: Record<string, unknown>
  ): ToolbarItem;
}

export class DefaultToolbarItemConfigurationRegistry implements ToolbarItemConfigurationRegistry {

  private readonly _configurationFactories = new Map<string, ToolbarItemConfigurationFactory>();

  registerToolbarItemConfigurationFactory(identifier: string, factory: ToolbarItemConfigurationFactory): void {
    this._configurationFactories.set(identifier, factory);
  }

  resolveToolbarItemConfiguration(
    identifier: string,
    item: PageToolbarItem,
    location: ToolbarItemLocation,
    locateInMenu: LocateInMenuMode,
    lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
    lookupParams: Record<string, unknown>
  ): ToolbarItem {
    const factory = this._configurationFactories.get(identifier);

    if (!factory) {
      throw new Error(`No toolbar item configuration factory registered for identifier: ${identifier}`);
    }

    return factory(item, location, locateInMenu, lookups, lookupParams);
  }
}

export const TOOLBARITEMCONFIGURATION_REGISTRY = new InjectionToken<ToolbarItemConfigurationRegistry>('Toolbar item configuration registry');
