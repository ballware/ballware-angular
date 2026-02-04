import { InjectionToken } from '@angular/core';
import { Column as DataGridColumn } from "devextreme/ui/data_grid";
import { Column as TreeListColumn } from "devextreme/ui/tree_list";
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  LookupByIdentifierFunc,
  LookupElementType
} from '@ballware/meta-services';

export type EntityColumnConfigurationFactory = <ColumnType extends TreeListColumn | DataGridColumn>(
  column: GridLayoutColumn,
  lookups: Record<string, LookupElementType>,
  getlookupByIdentifier: LookupByIdentifierFunc,
  lookupParams: Record<string, unknown>
) => ColumnType;


export type DetailColumnConfigurationFactory = <
  ColumnType extends TreeListColumn | DataGridColumn
>(
  column: GridLayoutColumn,
  dataMember: string,
  lookups: Record<string, LookupElementType>,
  getlookupByIdentifier: LookupByIdentifierFunc,
  parentItem: Record<string, unknown>
) => ColumnType;

export interface ColumnConfigurationRegistry {
  registerEntityColumnConfigurationFactory(
    identifier: string,
    factory: EntityColumnConfigurationFactory
  ): void;

  registerDetailColumnConfigurationFactory(
    identifier: string,
    factory: DetailColumnConfigurationFactory
  ): void;

  resolveEntityColumnConfiguration<
    ColumnType extends TreeListColumn | DataGridColumn
  >(
    identifier: string,
    column: GridLayoutColumn,
    lookups: Record<string, LookupElementType>,
    getlookupByIdentifier: LookupByIdentifierFunc,
    lookupParams: Record<string, unknown>
  ): ColumnType;

  resolveDetailColumnConfiguration<
    ColumnType extends TreeListColumn | DataGridColumn
  >(
    identifier: string,
    column: GridLayoutColumn,
    dataMember: string,
    lookups: Record<string, LookupElementType>,
    getlookupByIdentifier: LookupByIdentifierFunc,
    parentItem: Record<string, unknown>
  ): ColumnType;
}

export class DefaultColumnConfigurationRegistry
  implements ColumnConfigurationRegistry
{
  private readonly _entityConfigurationFactories = new Map<
    string,
    EntityColumnConfigurationFactory
  >();
  private readonly _detailConfigurationFactories = new Map<
    string,
    DetailColumnConfigurationFactory
  >();

  registerEntityColumnConfigurationFactory(
    identifier: string,
    factory: EntityColumnConfigurationFactory
  ): void {
    this._entityConfigurationFactories.set(identifier, factory);
  }

  registerDetailColumnConfigurationFactory(
    identifier: string,
    factory: DetailColumnConfigurationFactory
  ): void {
    this._detailConfigurationFactories.set(identifier, factory);
  }

  resolveEntityColumnConfiguration<
    ColumnType extends TreeListColumn | DataGridColumn
  >(
    identifier: string,
    column: GridLayoutColumn,
    lookups: Record<string, LookupElementType>,
    getlookupByIdentifier: LookupByIdentifierFunc,
    lookupParams: Record<string, unknown>
  ): ColumnType {
    const factory = this._entityConfigurationFactories.get(identifier);

    if (!factory) {
      throw new Error(
        `No entity column configuration factory registered for identifier: ${identifier}`
      );
    }

    return factory(column, lookups, getlookupByIdentifier, lookupParams);
  }

  resolveDetailColumnConfiguration<
    ColumnType extends TreeListColumn | DataGridColumn
  >(
    identifier: string,
    column: GridLayoutColumn,
    dataMember: string,
    lookups: Record<string, LookupElementType>,
    getlookupByIdentifier: LookupByIdentifierFunc,
    parentItem: Record<string, unknown>
  ): ColumnType {
    const factory = this._detailConfigurationFactories.get(identifier);

    if (!factory) {
      throw new Error(
        `No detail column configuration factory registered for identifier: ${identifier}`
      );
    }

    return factory(column, dataMember, lookups, getlookupByIdentifier, parentItem);
  }
}

export const COLUMNCONFIGURATION_REGISTRY = new InjectionToken<ColumnConfigurationRegistry>('Column configuration registry');
