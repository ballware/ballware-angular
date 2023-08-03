import { Observable } from 'rxjs';

import { CompiledPageData, PageLayout, QueryParams, ValueType } from '@ballware/meta-model';
import { ToolbarItemRef } from './toolbaritemref';
import { WithDestroy } from './withdestroy';

export interface PageServiceApi {
  initialized$: Observable<boolean>;
  page$: Observable<CompiledPageData|undefined>;
  title$: Observable<string|undefined>;
  layout$: Observable<PageLayout|undefined>;
  customParam$: Observable<Record<string, unknown>|undefined>;
  headParams$: Observable<QueryParams|undefined>;

  setPageId(pageId: string): void;
  setPageUrl(pageUrl: string): void;
  loadData(params: QueryParams): void;
  paramEditorInitialized(editor: { name: string, item: ToolbarItemRef }): void;
  paramEditorDestroyed(name: string): void;
  paramEditorValueChanged(editor: { name: string, value: ValueType }): void;
  paramEditorEvent(editor: { name: string, event: string, param?: ValueType }): void;
}

export abstract class PageService extends WithDestroy() implements PageServiceApi {

  public abstract initialized$: Observable<boolean>;
  public abstract page$: Observable<CompiledPageData|undefined>;
  public abstract title$: Observable<string|undefined>;
  public abstract layout$: Observable<PageLayout|undefined>;
  public abstract customParam$: Observable<Record<string, unknown>|undefined>;
  public abstract headParams$: Observable<QueryParams|undefined>;

  public abstract setPageId(pageId: string): void;
  public abstract setPageUrl(pageUrl: string): void;
  public abstract loadData(params: QueryParams): void;
  public abstract paramEditorInitialized(editor: { name: string, item: ToolbarItemRef }): void;
  public abstract paramEditorDestroyed(name: string): void;
  public abstract paramEditorValueChanged(editor: { name: string, value: ValueType }): void;
  public abstract paramEditorEvent(editor: { name: string, event: string, param?: ValueType }): void;
}
