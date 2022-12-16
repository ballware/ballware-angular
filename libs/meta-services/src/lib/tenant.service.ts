import { Observable } from 'rxjs';
import { CompiledTenant, NavigationLayout, NavigationLayoutItem } from '@ballware/meta-model';
import { WithDestroy } from './withdestroy';

export abstract class TenantService extends WithDestroy() {

  public abstract tenant$: Observable<CompiledTenant|undefined>;
  public abstract title$: Observable<string|undefined>;
  public abstract navigationLayout$: Observable<NavigationLayout|undefined>;
  public abstract navigationTree$: Observable<Record<string, unknown>[]|undefined>;
  public abstract pages$: Observable<NavigationLayoutItem[]|undefined>;
  public abstract hasRight$: Observable<((rights: string) => boolean)|undefined>;
}
