import { ResponsiveService, SCREEN_SIZE } from "@ballware/meta-services";
import { distinctUntilChanged, map, Observable, shareReplay, tap } from "rxjs";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export class DefaultResponsiveService implements ResponsiveService {

  constructor(private bp: BreakpointObserver) {}

  get onResize$(): Observable<SCREEN_SIZE> {
    return this.bp.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge]).pipe(
      map(s => s.breakpoints[Breakpoints.XSmall] ? SCREEN_SIZE.XS :
              s.breakpoints[Breakpoints.Small]  ? SCREEN_SIZE.SM :
              s.breakpoints[Breakpoints.Medium] ? SCREEN_SIZE.MD :
              s.breakpoints[Breakpoints.Large] ? SCREEN_SIZE.LG : 
              SCREEN_SIZE.LG),
      tap(s => console.log('Screen size:', SCREEN_SIZE[s])),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }
}
