import { InjectionToken, Type } from '@angular/core';

export interface EditItemRegistry {
  registerItemType<C>(identifier: string, type: Type<C>): void;
  resolveItemType(identifier: string): Type<unknown> | undefined;
}

export class DefaultEditItemRegistry implements EditItemRegistry {

  private readonly _itemTypes = new Map<string, Type<unknown>>();

  registerItemType<C>(identifier: string, type: Type<C>): void {
    this._itemTypes.set(identifier, type);
  }

  resolveItemType(identifier: string): Type<unknown> | undefined {
    return this._itemTypes.get(identifier);
  }
}

export const EDITITEM_REGISTRY = new InjectionToken<EditItemRegistry>('Edit item registry');
