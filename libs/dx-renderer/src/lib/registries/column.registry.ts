import { InjectionToken } from '@angular/core';
import { Column as DataGridColumn } from "devextreme/ui/data_grid";
import { Column as TreeListColumn } from "devextreme/ui/tree_list";
import { GridLayoutColumn } from '@ballware/meta-model';
import { AutocompleteCreator, LookupCreator, LookupDescriptor, PickvalueCreator } from '@ballware/meta-services';

export type ColumnConfigurationFactory = <ColumnType extends TreeListColumn | DataGridColumn>(
  column: GridLayoutColumn,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
  lookupParams: Record<string, unknown>
) => ColumnType;

export interface ColumnConfigurationRegistry {
  registerColumnConfigurationFactory(
    identifier: string,
    factory: ColumnConfigurationFactory
  ): void;

  resolveColumnConfiguration<ColumnType extends TreeListColumn | DataGridColumn>(
    identifier: string,
    column: GridLayoutColumn,
    lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
    lookupParams: Record<string, unknown>
  ): ColumnType;
}

export class DefaultColumnConfigurationRegistry implements ColumnConfigurationRegistry {

  private readonly _configurationFactories = new Map<string, ColumnConfigurationFactory>();

  registerColumnConfigurationFactory(identifier: string, factory: ColumnConfigurationFactory): void {
    this._configurationFactories.set(identifier, factory);
  }

  resolveColumnConfiguration<ColumnType extends TreeListColumn | DataGridColumn>(
    identifier: string,
    column: GridLayoutColumn,
    lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
    lookupParams: Record<string, unknown>
  ): ColumnType {
    const factory = this._configurationFactories.get(identifier);

    if (!factory) {
      throw new Error(`No column configuration factory registered for identifier: ${identifier}`);
    }

    return factory(column, lookups, lookupParams);
  }
}

export const COLUMNCONFIGURATION_REGISTRY = new InjectionToken<ColumnConfigurationRegistry>('Column configuration registry');
