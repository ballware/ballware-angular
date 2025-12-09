import { InjectionToken, Type } from '@angular/core';

export interface PageItemRegistry {
  registerItemType<C>(identifier: string, type: Type<C>): void;
  resolveItemType(identifier: string): Type<unknown> | undefined;
}

export class DefaultPageItemRegistry implements PageItemRegistry {

  private readonly _itemTypes = new Map<string, Type<unknown>>();

  registerItemType<C>(identifier: string, type: Type<C>): void {
    this._itemTypes.set(identifier, type);
  }

  resolveItemType(identifier: string): Type<unknown> | undefined {
    return this._itemTypes.get(identifier);
  }
}

export const PAGEITEM_REGISTRY = new InjectionToken<PageItemRegistry>('Page item registry');
