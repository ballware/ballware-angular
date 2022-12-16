import { Observable } from 'rxjs';

import { CompiledPageData, PageLayout, QueryParams, ValueType } from '@ballware/meta-model';
import { ToolbarItemRef } from './toolbaritemref';
import { WithDestroy } from './withdestroy';

export abstract class PageService extends WithDestroy() {

  public abstract page$: Observable<CompiledPageData|undefined>;
  public abstract title$: Observable<string|undefined>;
  public abstract layout$: Observable<PageLayout|undefined>;
  public abstract customParam$: Observable<Record<string, unknown>|undefined>;
  public abstract headParams$: Observable<QueryParams|undefined>;

  public abstract setPageId(pageId: string): void;
  public abstract setPageUrl(pageUrl: string): void;
  public abstract loadData(params: QueryParams): void;
  public abstract paramEditorInitialized(name: string, item: ToolbarItemRef): void;
  public abstract paramEditorDestroyed(name: string): void;
  public abstract paramEditorValueChanged(name: string, value: ValueType): void;
  public abstract paramEditorEvent(name: string, event: string, param?: ValueType): void;
}
