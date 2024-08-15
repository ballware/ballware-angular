import { InjectionToken } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export enum SCREEN_SIZE {
  XS,
  SM,
  MD,
  LG,
  XL
}

export interface ResponsiveService {
  get onResize$(): Observable<SCREEN_SIZE>;
  onResize(size: SCREEN_SIZE): void;
}

export class ResponsiveServiceImplementation implements ResponsiveService {

  get onResize$(): Observable<SCREEN_SIZE> {
    return this.resizeSubject.asObservable().pipe(distinctUntilChanged());
  }

  private resizeSubject = new BehaviorSubject(SCREEN_SIZE.LG);

  onResize(size: SCREEN_SIZE) {
    setTimeout(() => this.resizeSubject.next(size));
  }
}

export const RESPONSIVE_SERVICE = new InjectionToken<ResponsiveService>('Responsive service');