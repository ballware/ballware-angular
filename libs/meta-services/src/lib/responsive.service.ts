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

export const RESPONSIVE_SERVICE = new InjectionToken<ResponsiveService>('Responsive service');